<?php
/**
* Template Name: s2Member Dynamic Checkout Form
*/

namespace {

  use AgileAlliance\Membership\Signup\s2member\Helpers\S2Helper as S2Helper;
  use Paradigm\Concepts\Functional as F;
  $decrypt_unserialize = F\compose('unserialize','s2member_decrypt');
  $associate_entry_values = F\curry('associate_entry_values',1);
  $shortcode_attrs = F\curry('shortcode_attrs', 1);
  $cookie_entry_data = new F\Identity($_COOKIE[GF_ENTRY_MS_COOKIE_NAME]);

  $merchant_form = $cookie_entry_data
      ->bind($decrypt_unserialize)
      ->bind($associate_entry_values)
      ->bind($shortcode_attrs)
      ->bind(function($form_shortcode) {
        echo do_shortcode($form_shortcode);
      });


  /**
   * Associate "Membership Options" from entry values
   *
   * Preliminary setup for merchant form attributes, to be used to generate the
   * merchant/registration form.
   *
   * @param array $entry The array values of a form entry
   *
   * @return array Returns an associative array that is easily digested by
   * shortcode_attrs function
   */

  function associate_entry_values ($entry) {
    $s2_member_level_label = $entry['membership_level'];
    $membership_type = ( $entry['membership_types'] ) ? : NULL ;
    $auto_renew = ( strcasecmp( $entry['auto_renew_membership'], 'yes' ) === 0 ) ? 1 : 0 ;
    $member_tier = ( $entry['membership_tier'] ) ? : NULL ;
    $total = $entry['total'];
    $level = S2Helper::get_level_by_label($s2_member_level_label);
    $membership_renewal =  (int) $entry['membership_renewal'];
    $vars = get_defined_vars();
    // remove $entry array from $vars
    unset($vars['entry']);
    return $vars;
  }

  /**
   * Shortcode Attributes (Explained)
   * For more detail shortcut attribute descriptions,
   * visit dashboard -> s2Member (Pro) -> Auth.Net Pro-forms
   * then the "Shortcode Attributes (Explained)"
   *
   * ra = Regular, Buy Now, and/or Recurring Amount
   * rp = Regular period, how many iterations based on "rt"
   * rt = Regular Term, for example if "rp" is set to one and "rt" is set
   *      to "Y" then authorize.net will charge the user 1 time in a year period
   * rr = Recurring directive
   * ta = Trial Amount
   * tp = Trial Period
   * tt = Trial Term. Only valid w/ Membership Level Access.
   *      Possible values: D = Days, W = Weeks, M = Months, Y = Years.
   *
   * @param array Array structure that contains the neccessary form entry values to output correct shrotcode_attrs
   *
   * @return array Array structure that contains the neccessary attributes to build an s2Member Form
   */

  function shortcode_attrs ($entry_vals) {

    $merchant_shortcode_tag = 's2Member-Pro-AuthNet-Form';
    $desc = build_desc( $entry_vals['total'], $entry_vals['auto_renew'], $entry_vals['level'], 0, $entry_vals['membership_renewal']);
    $custom = generate_s2member_custom(is_user_logged_in(), $entry_vals['membership_type'], $entry_vals['member_tier']);

    $shortcode_attributes = [
      'level'          => (string) $entry_vals['level'],
      'ccaps'          => '',
      'desc'           => $desc,
      'custom'         => $custom,
    ];

    // Prepend modify attribute and value if logged in
    if ( is_user_logged_in() ) {
      $shortcode_attributes = ['modify' => '1'] + $shortcode_attributes;

//      if (S2MEMBER_CURRENT_USER_ACCESS_LEVEL > 0) {
//        set_member_remaining_subscription();
//      }

    }

    if ($entry_vals['level'] > 0) {

      $shortcode_attributes = $shortcode_attributes + get_trial_attributes();
      $shortcode_attributes = $shortcode_attributes + ['ra' => $entry_vals['total']];
      $shortcode_attributes = $shortcode_attributes + get_recurring_attributes($entry_vals['auto_renew']);

      $shortcode_attributes_append = [
          'accept' => 'visa,mastercard,amex,discover',
          'coupon' => '',
          'accept_coupons' => does_accept_coupons($entry_vals['auto_renew']),
          'default_country_code' => 'US',
      ];
      $shortcode_attributes = $shortcode_attributes + $shortcode_attributes_append;

    } else {

      $shortcode_attributes = ['register' => '1'] + $shortcode_attributes + [ 'tp' => '0', 'tt' => 'D' ];

    }

    $redirect_id = filter_input(INPUT_GET, 'redirect_id', FILTER_SANITIZE_NUMBER_INT);

    // Append
    $shortcode_attributes = $shortcode_attributes + ['captcha' => '0', 'success' => get_success_url($entry_vals['level'], $redirect_id)];

    $shortcode_attributes_string = implode(' ', array_map(function($v, $k) {
      return $k . '="' . $v . '"';
    }, $shortcode_attributes, array_keys($shortcode_attributes)));

    $shortcode = sprintf('[%s %s /]', $merchant_shortcode_tag, $shortcode_attributes_string);

    return $shortcode;

  }

  /**
   *
   * Generate s2member `custom` shortcode attribute
   *
   * The custom attribute need to contain the domain first
   * then you may pipe custome values to be used later.
   *
   * @param $is_modification
   * @param $membership_type
   * @param $member_tier
   *
   * @return mixed
   */

  function generate_s2member_custom($is_modification, $membership_type, $member_tier) {

    $domain = $_SERVER['HTTP_HOST'];
    $custom = $domain;

    if ($is_modification) {
      $extract_first = F\compose('current', 'explode');
      $membership_type = $extract_first('|', $membership_type);
      $member_tier = $extract_first(' ', $member_tier);
      $custom = [$domain, $membership_type, $member_tier];
      $custom = implode('|', $custom);
    }

    return $custom;
  }

  /**
   *
   * Custom Return Url
   *
   * @param $level
   * @param $redirect_page
   *
   * @return string
   */
  function get_success_url($level, $redirect_page) {

    if ( isset($_COOKIE[LOGIN_REFERER_COOKIE_NAME])
         && $_COOKIE[LOGIN_REFERER_COOKIE_NAME] === 'submissions'
    ) {
      return get_option('submissions_host');
    }
    if ($redirect_page) {
      $page = get_permalink($redirect_page);
      return $success = $page;
    } else {
      return $success = 'https://'.$_SERVER['HTTP_HOST'].'/membership/checkout/success/?level='.$level;
    }

  }

  /**
   *
   * @return array
   */
  function get_trial_attributes() {

    $attributes = [
      'ta' => '0',
      'tp' => '0',
      'tt' => 'D'
    ];

    return $attributes;
  }

  /**
   * @param $is_recurring
   *
   * @return array
   */
  function get_recurring_attributes($is_recurring ) {
    $attributes = [
        'rp'  => '1',
        'rt'  => 'Y',
        'rr'  => (string) $is_recurring,
        'rrt' => ''
    ];
    return $attributes;
  }

  function does_accept_coupons($is_auto_renew) {
    return ( $is_auto_renew === 1) ? '0' : '1';
  }

  /**
   * @return mixed
   */
  function set_member_remaining_subscription() {

    $remaining_subscription_days = get_user_option('aa_remaining_subscription_days');

    if ($remaining_subscription_days === false) {

      $eot_maybe_empty = new F\MaybeEmpty( s2member_eot()['time'] );

      $generate_trial_period = $eot_maybe_empty
          ->bind( function ( $value ) {
            return [ 'user_eot' => ( new DateTime() )->setTimestamp( $value ) ];
          } )
          ->bind( function ( $value ) {
            $value['system_now'] = new DateTime( 'now' );

            return $value;
          } )
          ->bind( function ( $value ) {
            $value = (int) $value['system_now']->diff( $value['user_eot'] )->format( '%r%a' );
            if ( $value <= 0 ) {
              return 0;
            }
            return $value;
          } )
          ->bind( function ( $value ) {
            if ( $value > 0 ) {
              update_user_option( get_current_user_id(), 'aa_remaining_subscription_days', $value );
            }
            return $value;
          } );

    } elseif ((int) $remaining_subscription_days > 0) {

      $remaining_subscription_days = (int) $remaining_subscription_days;
      $eot = (new DateTime())->setTimestamp(s2member_eot()['time']);
      $now = new DateTime('now');
      $timeDiff = (int) $now->diff($eot)->format('%r%a');

      if ( $timeDiff > 0
           && $timeDiff !== $remaining_subscription_days) {
          update_user_option( get_current_user_id(), 'aa_remaining_subscription_days', $timeDiff);
      }

    }
    // 502 Bad Gateway ('The generate trial period does not get initalized in the elseif')
    return $generate_trial_period;
  }

  /**
   * Generate a description for the s2Member payment form
   *
   * @param string $total The amount for the recurring payment
   * @param bool $auto_renew Boolean if the user selected to auto renew their subscription
   * @param integer $level Their membership level, helps identify if they selected a free account
   * @param integer $trial_term
   * @param integer $is_renewal
   * @param string $currency_country The currency to be displayed in the description
   *
   * @return string s2Member form description
   */

  function build_desc ($total, $auto_renew, $level, $trial_term, $is_renewal, $currency_country = 'USD') {

    $s2memberAccessLevel = 2;
    /**
     * When a customer level 1 (Member) upgrades to level 2 (Corporate Member)
     * remove any trial term and do not mark the display content as a renewal
     */
    if (is_user_logged_in() && $s2memberAccessLevel === 1 && $level === 2) {
      $trial_term = 0;
      $is_renewal = false;
    }

    $free_desc      = 'Signup now, it\'s Free!';
    $amount_desc    = sprintf('$%d %s ', $total, $currency_country);
    $trial_term_desc = sprintf( _n('%d Day', '%d Days', 2), $trial_term);
    $trial_desc      = sprintf('%s free / then ', $trial_term_desc);

    if ($is_renewal === 1) {
      $trial_desc   = sprintf('%s left in membership period. ', $trial_term_desc);
      $fixed_desc = 'to extend membership for 1 year, non-recurring.';
      $recurring_desc = 'to extend yearly; recurring charge for ongoing access';
    } else {
      $fixed_desc    = '/ One Time (for 1 year access, non-recurring)';
      $recurring_desc = '/ Yearly (recurring charge, for ongoing access)';
    }

    if ($level > 0):
      if ($trial_term !== 0 && $auto_renew === 1) return $trial_desc.$amount_desc.$recurring_desc;
      if ($trial_term !== 0 && $auto_renew === 0) return $trial_desc.$amount_desc.$fixed_desc;
      if ($trial_term === 0 && $auto_renew === 1) return $amount_desc.$recurring_desc;
      if ($trial_term === 0 && $auto_renew === 0) return $amount_desc.$fixed_desc;
    else
      return $free_desc;
    endif;

  }

  /**
   * If $entry[1] is = to 'Member' then it returns the 'Membership Type'
   * Full || Hardship || Academic || Student
   * In addition it's pipped with the value
   * for example Full|100
   *
   * @param string $pipped_string The string value of "Membership Type" selection
   *
   * @return array that contains the type and amount
   */

  function get_member_amount ($pipped_string) {
    $items = explode('|',$pipped_string);
    return array('type' => $items[0], 'amount' => $items[1]);
  }

}
