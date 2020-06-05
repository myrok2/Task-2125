<?php
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

class MeprStripeCtrl extends MeprBaseCtrl
{
  public function load_hooks() {
    add_action('wp_ajax_mepr_stripe_confirm_payment', array($this, 'confirm_payment'));
    add_action('wp_ajax_nopriv_mepr_stripe_confirm_payment', array($this, 'confirm_payment'));
    add_action('wp_ajax_mepr_stripe_update_payment_method', array($this, 'update_payment_method'));
    add_action('wp_ajax_nopriv_mepr_stripe_update_payment_method', array($this, 'update_payment_method'));
    add_action('wp_ajax_mepr_stripe_debug_checkout_error', array($this, 'debug_checkout_error'));
    add_action('wp_ajax_nopriv_mepr_stripe_debug_checkout_error', array($this, 'debug_checkout_error'));
  }

  public function confirm_payment() {
    try {
      $this->do_confirm_payment();
    } catch (Throwable $t) { // Errors and exceptions in PHP 7
      $content = $t->__toString();
    } catch (Exception $e) { // Exceptions in PHP 5
      $content = $e->__toString();
    }

    $this->send_checkout_error_debug_email(
      $content,
      isset($_POST['mepr_transaction_id']) && is_numeric($_POST['mepr_transaction_id']) ? (int) $_POST['mepr_transaction_id'] : null,
      isset($_POST['user_email']) && is_string($_POST['user_email']) ? sanitize_text_field(wp_unslash($_POST['user_email'])) : null
    );

    wp_send_json(array('error' => __('An error occurred, please DO NOT submit the form again as you may be double charged. Please contact us for further assistance instead.', 'memberpress')));
  }

  public function do_confirm_payment() {
    $stripe_payment_method_id = isset($_POST['payment_method_id']) && is_string($_POST['payment_method_id']) ? sanitize_text_field(wp_unslash($_POST['payment_method_id'])) : '';
    $stripe_payment_intent_id = isset($_POST['payment_intent_id']) && is_string($_POST['payment_intent_id']) ? sanitize_text_field(wp_unslash($_POST['payment_intent_id'])) : '';
    $stripe_setup_intent_id = isset($_POST['setup_intent_id']) && is_string($_POST['setup_intent_id']) ? sanitize_text_field(wp_unslash($_POST['setup_intent_id'])) : '';
    $transaction_id = isset($_POST['mepr_transaction_id']) && is_numeric($_POST['mepr_transaction_id']) ? (int) $_POST['mepr_transaction_id'] : 0;

    if (empty($stripe_payment_method_id) && empty($stripe_payment_intent_id) && empty($stripe_setup_intent_id)) {
      wp_send_json(array('error' => __('Bad request', 'memberpress')));
    }

    if ($transaction_id > 0) {
      // Non-SPC
      $txn = new MeprTransaction($transaction_id);

      if (!$txn->id) {
        wp_send_json(array('error' => __('Transaction not found', 'memberpress')));
      }

      $pm = $txn->payment_method();

      if (!($pm instanceof MeprStripeGateway)) {
        wp_send_json(array('error' => __('Invalid payment gateway', 'memberpress')));
      }

      $product = $txn->product();

      if (!$product->ID) {
        wp_send_json(array('error' => __('Product not found', 'memberpress')));
      }
    } else {
      // We don't have a transaction ID (i.e. this is the Single Page Checkout), so let's create the user and transaction
      // This code is essentially the same as MeprCheckoutCtrl::process_signup_form
      $mepr_options = MeprOptions::fetch();
      $disable_checkout_password_fields = $mepr_options->disable_checkout_password_fields;

      // Validate the form post
      $mepr_current_url = isset($_POST['mepr_current_url']) && is_string($_POST['mepr_current_url']) ? sanitize_text_field(wp_unslash($_POST['mepr_current_url'])) : '';
      $errors = MeprHooks::apply_filters('mepr-validate-signup', MeprUser::validate_signup($_POST, array(), $mepr_current_url));
      if(!empty($errors)) {
        wp_send_json(array('errors' => $errors));
      }

      // Check if the user is logged in already
      $is_existing_user = MeprUtils::is_user_logged_in();

      if($is_existing_user) {
        $usr = MeprUtils::get_currentuserinfo();
      }
      else { // If new user we've got to create them and sign them in
        $usr = new MeprUser();
        $usr->user_login = ($mepr_options->username_is_email)?sanitize_email($_POST['user_email']):sanitize_user($_POST['user_login']);
        $usr->user_email = sanitize_email($_POST['user_email']);

        $password = ($disable_checkout_password_fields === true) ? wp_generate_password() : $_POST['mepr_user_password'];
        //Have to use rec here because we unset user_pass on __construct
        $usr->set_password($password);

        try {
          $usr->store();

          // We need to refresh the user object. In the case where emails are used as
          // usernames, the email & username could differ after the user is saved.
          $usr = new MeprUser($usr->ID);

          if($disable_checkout_password_fields === true) {
            $usr->send_password_notification('new');
          }
          // Log the new user in
          if(MeprHooks::apply_filters('mepr-auto-login', true, $_POST['mepr_product_id'], $usr)) {
            wp_signon(
              array(
                'user_login'    => $usr->user_login,
                'user_password' => $password
              ),
              MeprUtils::is_ssl() //May help with the users getting logged out when going between http and https
            );
          }

          MeprEvent::record('login', $usr); //Record the first login here
        }
        catch(MeprCreateException $e) {
          wp_send_json(array('error' => __( 'The user was unable to be saved.', 'memberpress')));
        }
      }

      // Create a new transaction and set our new membership details
      $txn = new MeprTransaction();
      $txn->user_id = $usr->ID;

      // Get the membership in place
      $txn->product_id = sanitize_text_field($_POST['mepr_product_id']);
      $product = $txn->product();

      // If we're showing the fields on logged in purchases, let's save them here
      if(!$is_existing_user || ($is_existing_user && $mepr_options->show_fields_logged_in_purchases)) {
        MeprUsersCtrl::save_extra_profile_fields($usr->ID, true, $product, true);
        $usr = new MeprUser($usr->ID); //Re-load the user object with the metadata now (helps with first name last name missing from hooks below)
      }

      // Needed for autoresponders (SPC + Stripe + Free Trial issue)
      MeprHooks::do_action('mepr-signup-user-loaded', $usr);

      // Set default price, adjust it later if coupon applies
      $price = $product->adjusted_price();

      // Default coupon object
      $cpn = (object)array('ID' => 0, 'post_title' => null);

      // Adjust membership price from the coupon code
      if(isset($_POST['mepr_coupon_code']) && !empty($_POST['mepr_coupon_code'])) {
        // Coupon object has to be loaded here or else txn create will record a 0 for coupon_id
        $cpn = MeprCoupon::get_one_from_code(sanitize_text_field($_POST['mepr_coupon_code']));

        if(($cpn !== false) || ($cpn instanceof MeprCoupon)) {
          $price = $product->adjusted_price($cpn->post_title);
        }
      }

      $txn->set_subtotal($price);

      // Set the coupon id of the transaction
      $txn->coupon_id = $cpn->ID;

      // Figure out the Payment Method
      if(isset($_POST['mepr_payment_method']) && !empty($_POST['mepr_payment_method'])) {
        $txn->gateway = sanitize_text_field($_POST['mepr_payment_method']);
      }

      $pm = $txn->payment_method();

      if (!($pm instanceof MeprStripeGateway)) {
        wp_send_json(array('error' => __('Invalid payment gateway', 'memberpress')));
      }

      // Create a new subscription
      if($product->is_one_time_payment()) {
        $signup_type = 'non-recurring';
      }
      else {
        $signup_type = 'recurring';

        $sub = new MeprSubscription();
        $sub->user_id = $usr->ID;
        $sub->gateway = $pm->id;
        $sub->load_product_vars($product, $cpn->post_title, true);
        $sub->maybe_prorate(); // sub to sub
        $sub->store();

        $txn->subscription_id = $sub->id;
      }

      $txn->store();

      if(empty($txn->id)) {
        // Don't want any loose ends here if the $txn didn't save for some reason
        if($signup_type==='recurring' && ($sub instanceof MeprSubscription)) {
          $sub->destroy();
        }

        wp_send_json(array('error' => __('Sorry, we were unable to create a transaction.', 'memberpress')));
      }
    }

    try {
      if ($product->is_one_time_payment()) {
        // For paid trials use a PaymentIntent for the payment
        $intent = !empty($stripe_payment_intent_id) ? $pm->confirm_payment_intent($stripe_payment_intent_id) : $pm->create_payment_intent($txn, $stripe_payment_method_id);
        $action = 'handleCardAction';
      } else {
        $sub = $txn->subscription();

        if (!($sub instanceof MeprSubscription)) {
          wp_send_json(array(
            'error' => __('Subscription not found', 'memberpress'),
            'transaction_id' => $txn->id
          ));
        }

        if ($sub->trial && (float) $sub->trial_amount <= 0.00) {
          // For free trials use a SetupIntent
          $intent = !empty($stripe_setup_intent_id) ? $pm->get_setup_intent($stripe_setup_intent_id) : $pm->create_setup_intent($txn, $stripe_payment_method_id);
          $action = 'handleCardSetup';
        } else {
          if ($sub->trial) {
            // For paid trials use a PaymentIntent for the initial payment
            $txn->set_subtotal($sub->trial_amount);
            $intent = !empty($stripe_payment_intent_id) ? $pm->confirm_payment_intent($stripe_payment_intent_id) : $pm->create_payment_intent($txn, $stripe_payment_method_id);
            $action = 'handleCardAction';
          } else {
            // For subscriptions we need to create the customer and subscription to get the PaymentIntent
            $intent = !empty($stripe_payment_intent_id) ? $pm->get_payment_intent($stripe_payment_intent_id) : $pm->create_subscription_intent($txn, $stripe_payment_method_id);
            $action = 'handleCardPayment';
          }
        }
      }

      if ($intent->status == 'requires_action' && $intent->next_action['type'] == 'use_stripe_sdk') {
        // Tell the client to handle the action
        wp_send_json(array(
          'requires_action' => true,
          'action' => $action,
          'client_secret' => $intent->client_secret,
          'transaction_id' => $txn->id
        ));
      }
      else if ($intent->status == 'succeeded') {
        // The payment didn't need any additional actions and completed!
        if ($product->is_one_time_payment()) {
          $pm->handle_one_time_payment($txn, $intent);
        } else {
          $sub = $txn->subscription();

          if (!($sub instanceof MeprSubscription)) {
            wp_send_json(array('error' => __('Subscription not found', 'memberpress')));
          }

          if ($sub->trial && (float) $sub->trial_amount <= 0.00) {
            $pm->handle_free_trial($txn, $intent);
          } else {
            if ($sub->trial) {
              $pm->handle_paid_trial_payment($txn, $intent);
            } else {
              $pm->handle_create_subscription($txn, $sub);
            }
          }
        }

        wp_send_json(array(
          'success' => true,
          'transaction_id' => $txn->id
        ));
      }
      else {
        wp_send_json(array(
          'error' => __('Invalid PaymentIntent status', 'memberpress'),
          'transaction_id' => $txn->id
        ));
      }
    } catch (Exception $e) {
      wp_send_json(array(
        'error' => $e->getMessage(),
        'transaction_id' => $txn->id
      ));
    }
  }

  /**
   * Handle the Ajax request to update the payment method for a subscription
   */
  public function update_payment_method() {
    $subscription_id = isset($_POST['subscription_id']) && is_numeric($_POST['subscription_id']) ? (int) $_POST['subscription_id'] : 0;
    $stripe_payment_method_id = isset($_POST['payment_method_id']) && is_string($_POST['payment_method_id']) ? sanitize_text_field($_POST['payment_method_id']) : '';
    $stripe_setup_intent_id = isset($_POST['setup_intent_id']) && is_string($_POST['setup_intent_id']) ? sanitize_text_field($_POST['setup_intent_id']) : '';
    $gateway_id = isset($_POST['gateway_id']) && is_string($_POST['gateway_id']) ? sanitize_text_field($_POST['gateway_id']) : '';

    if (empty($subscription_id)) {
      wp_send_json(array('error' => __('Bad request', 'memberpress')));
    }

    if (!is_user_logged_in()) {
      wp_send_json(array('error' => __('Sorry, you must be logged in to do this.', 'memberpress')));
    }

    if (!check_ajax_referer('mepr_process_update_account_form', '_mepr_nonce', false)) {
      wp_send_json(array('error' => __('Security check failed.', 'memberpress')));
    }

    $sub = new MeprSubscription($subscription_id);

    if (!($sub instanceof MeprSubscription)) {
      wp_send_json(array('error' => __('Subscription not found', 'memberpress')));
    }

    $usr = $sub->user();

    if ($usr->ID != get_current_user_id()) {
      wp_send_json(array('error' => __('This subscription is for another user.', 'memberpress')));
    }

    $mepr_options = MeprOptions::fetch();
    $pm = $mepr_options->payment_method($gateway_id);

    if (!($pm instanceof MeprStripeGateway)) {
      wp_send_json(array('error' => __('Invalid payment gateway', 'memberpress')));
    }

    try {
      $intent = !empty($stripe_setup_intent_id) ? $pm->get_setup_intent($stripe_setup_intent_id) : $pm->create_account_setup_intent($sub, $stripe_payment_method_id);

      if ($intent->status == 'requires_action' && $intent->next_action['type'] == 'use_stripe_sdk') {
        // Tell the client to handle the action
        wp_send_json(array(
          'requires_action' => true,
          'client_secret' => $intent->client_secret
        ));
      }
      else if ($intent->status == 'succeeded') {
        $pm->handle_account_setup_intent($sub, $intent);

        // Check if there is an outstanding invoice to be paid
        $stripe_subscription = $pm->get_customer_subscription($sub->subscr_id);

        if ($stripe_subscription->latest_invoice && $stripe_subscription->latest_invoice['status'] == 'open') {
            $pm->retry_invoice_payment($stripe_subscription->latest_invoice['id']);
        }

        wp_send_json(array(
          'success' => true
        ));
      }
      else {
        wp_send_json(array('error' => __('Invalid SetupIntent status', 'memberpress')));
      }
    } catch (Exception $e) {
      wp_send_json(array('error' => $e->getMessage()));
    }
  }

  /**
   * Handle the Ajax request to debug a checkout error
   */
  public function debug_checkout_error() {
    if (!MeprUtils::is_post_request() || !isset($_POST['data']) || !is_string($_POST['data'])) {
      wp_send_json_error();
    }

    $data = json_decode(wp_unslash($_POST['data']), true);

    if (!is_array($data)) {
      wp_send_json_error();
    }

    $allowed_keys = array(
      'text_status' => 'textStatus',
      'error_thrown' => 'errorThrown',
      'status' => 'jqXHR.status (200 expected)',
      'status_text' => 'jqXHR.statusText (OK expected)',
      'response_text' => 'jqXHR.responseText (JSON object expected)'
    );

    $content = 'INVALID SERVER RESPONSE' . "\n\n";

    foreach ($allowed_keys as $key => $label) {
      if (!array_key_exists($key, $data)) {
        continue;
      }

      ob_start();
      var_dump($data[$key]);
      $value = ob_get_clean();

      $content .= sprintf(
        "%s:\n\n%s\n",
        $label,
        $value
      );
    }

    $this->send_checkout_error_debug_email(
      $content,
      isset($data['transaction_id']) && is_numeric($data['transaction_id']) ? (int) $data['transaction_id'] : null,
      isset($data['customer_email']) && is_string($data['customer_email']) ? sanitize_text_field($data['customer_email']) : null
    );

    wp_send_json_success();
  }

  /**
   * Sends an email to the admin email addresses alerting them of the given checkout error
   *
   * @param string      $content
   * @param int|null    $transaction_id
   * @param string|null $customer_email
   */
  private function send_checkout_error_debug_email($content, $transaction_id = null, $customer_email = null) {
    if (MeprHooks::apply_filters('mepr_disable_checkout_error_debug_email', false)) {
      return;
    }

    $message = 'An error occurred during the MemberPress checkout which resulted in an error message being displayed to the customer. The transaction may not have fully completed.' . "\n\n";
    $message .= 'The error may have happened due to a plugin conflict or custom code, please carefully check the details below to identify the cause, or you can send this email to support@memberpress.com for help.' . "\n\n";

    if ($transaction_id) {
      $message .= sprintf("MemberPress transaction ID: %s\n\n", $transaction_id);

      if (!$customer_email) {
        $transaction = new MeprTransaction($transaction_id);
        $user = $transaction->user();

        if ($user->ID > 0 && $user->user_email) {
          $customer_email = $user->user_email;
        }
      }
    }

    if ($customer_email) {
      $message .= sprintf("Customer email: %s\n\n", $customer_email);
    }

    MeprUtils::wp_mail_to_admin('[MemberPress] IMPORTANT: Checkout error', $message . $content);
  }
}
