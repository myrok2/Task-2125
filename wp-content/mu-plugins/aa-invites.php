<?php namespace AgileAlliance\Invites;

use Paradigm\Concepts\Functional as F;
use Helpers\Organization as O;
use Helpers\User as U;
use Helpers\Html as H;

require_once('aa-invites/vendor/autoload.php');
require_once('aa-invites/src/bulk-meta-box.php');

add_action('init', new CustomPostTypes() );
add_action('p2p_init', new Relationships() );

/** Invitation endpoint  */
add_action('p2p_init', function() {

    $endpoint_request_encrypted = $_GET['organization-invite'];

    if (  ! empty( $endpoint_request_encrypted )
        && ! is_admin() ) {

        $invite_id = (int) s2member_decrypt($endpoint_request_encrypted);

        if ( $invite_id > 0 ) {

            // Get this invite's advanced custom fields
            $invite_acf = get_fields( $invite_id );

            // Get the organization related to this invite
            $organization = p2p_type('organization_to_invite')
                ->set_direction('to')
                ->get_connected($invite_id)
                ->post;

            if ( $invite_acf['status'] === 'pending'
                 || $invite_acf['status'] === 'pending-activation'
                 && ! is_admin() ) {

                // Grab the first
                $connected = p2p_type('user_to_organization_member')
                    ->set_direction('to')
                    ->get_connected($organization->ID)
                    ->results;

                // Grab the corporate member from the organization
                $corporate_membership = current(array_filter($connected, function($item) {
                    return ( in_array('s2member_level2', $item->roles) );
                }));

                $corporate_membership_meta = get_user_meta($corporate_membership->ID);
                $corporate_membership_custom_fields = get_user_option('s2member_custom_fields', $corporate_membership->ID);

                // The recipient is assumed to be an email
                $invite_recipient = $invite_acf['recipient'];

                // Initial User Data
                $user_data = [
                    'user_login' => $invite_recipient,
                    'user_pass' => NULL,
                    'user_email' => $invite_recipient
                ];

                if ( ! email_exists( $user_data['user_email'] ) ) {

                    // @note plus emailing is remove in nickname/username
                    $user_id = wp_insert_user($user_data);

                    if ( ! is_wp_error($user_id) ) {

                        // Set user to s2Member "Member" status
                        $user = new \WP_User($user_id);
                        $user->set_role('s2member_level1');

                        // Set EOT Time, same time as the Corporate Membership
                        update_user_option(
                            $user_id,
                            's2member_auto_eot_time',
                            $corporate_membership_meta['wp_s2member_auto_eot_time'][0]
                        );

                        update_user_option($user_id, 's2member_custom_fields', $corporate_membership_custom_fields);

                        // Connect the new user to the organization
                        p2p_type('user_to_organization_member')->connect(
                            $user_id,
                            $organization->ID,
                            [ 'date' => current_time('mysql') ]
                        );

                        // Update this invite status
                        update_field('status', 'active', $invite_id);

                        // Send set password default email
                        wp_new_user_notification($user_id, null, 'both');

                        // Disable ETO reminder notifications
                        update_user_meta($user_id, 'wp_s2member_reminders_enable', '0');

                        update_user_meta($user_id, 'aa_membership_type', 'corporate');

                        do_action('aa_invite_accepted', $user);

                        add_filter('the_content', function($content) use ($organization, $invite_recipient) {

                            ob_start();
                            include('aa-invites/src/templates/invite-endpoint-content.php');
                            $content = ob_get_contents();
                            ob_end_clean();

                            return $content;
                        });
                    }

                } else {

                    $_corporate_membership_meta = U\singleized_meta($corporate_membership_meta);
                    $_corporate_membership_eot = $_corporate_membership_meta['wp_s2member_auto_eot_time'];
                    $maybe_existing_customer = new F\MaybeEmpty(get_user_by('email', $user_data['user_email']));

                    $non_associated_customer = $maybe_existing_customer
                        ->bind(function($user) {
                            $is_connected_to_an_org = ! empty(O\get_organization_connected_to_user($user->ID));
                            return $is_connected_to_an_org ? null : $user;
                        });
                    
                    $process_customer = $non_associated_customer
                        ->bind(function($user) {

                            // Append to user object data, if user has fixed eot
                            $non_recurring_condition = U\has_fixed_eot($user->ID)
                                                       || in_array('subscriber', $user->roles);
                            $user->s2member_fixed_eot = $non_recurring_condition;

                            return $user;
                        })
                        ->bind(function($user) {

                            // Append to user object data the subscr id
                            if (empty($user->s2member_fixed_eot)) {

                                $s2member_subscr_id = get_user_option('s2member_subscr_id', $user->ID);

                                if (! empty($s2member_subscr_id)) {
                                    $user->s2member_subscr_id = $s2member_subscr_id;
                                }
                            }

                            return $user;
                        })
                        ->bind(function($user) {

                            // Cancel Authnet recurring subscription
                           if (!empty($user->s2member_subscr_id)) {

                               $authnet = [
                                   'x_method' => 'cancel',
                                   'x_subscription_id' => $user->s2member_subscr_id
                               ];
                               $res = \c_ws_plugin__s2member_pro_authnet_utilities::authnet_arb_response($authnet);
                               $user->authnet_res = $res;
                           }

                            return $user;
                        })
                        ->bind(function($user) use ($organization) {

                            // Connect to organization
                            $connected = p2p_type('user_to_organization_member')->connect(
                                $user->ID,
                                $organization->ID,
                                [ 'date' => current_time('mysql') ]
                            );

                            return ! empty($connected) ? $user : null;
                        })
                        ->bind(function($user) use ($_corporate_membership_eot) {

                            // Update user EOT
                            $updated_eot = update_user_option($user->ID, 's2member_auto_eot_time', $_corporate_membership_eot);

                            return ! empty($updated_eot) ? $user : null;
                        })
                        ->bind(function($user) use ($corporate_membership_custom_fields) {
                            $update_custom_fields = update_user_option($user->ID, 's2member_custom_fields', $corporate_membership_custom_fields);
                            return ! empty($update_custom_fields) ? $user : null;
                        })
                        ->bind(function($user) {

                            // Disable ETO reminder notifications
                            $updated_meta = update_user_meta($user->ID, 'wp_s2member_reminders_enable', '0');

                            return ! empty($updated_meta) ? $user : null;
                        })
                        ->bind(function($user) {
                            $update_meta = update_user_meta($user_id, 'aa_membership_type', 'corporate');
                            return ! empty($update_meta) ? $user : null;
                        })
                        ->bind(function($user) use ($invite_id) {

                            // Update user Role
                            if (!in_array('s2member_level1', $user->roles)) {
                                $user->set_role('s2member_level1');
                            }

                            // Update invitation status
                            update_field('status', 'active', $invite_id);

                            do_action('aa_invite_accepted', $user);

                            return $user;
                        });

                    // Display endpoint content
                    if (is_null($non_associated_customer->extract())) {

                        add_filter('the_content', function($content) {
                            $content = H\error_container('Error, you\'re already associated to an organization. <div>Please <a href="/contact-us/?inquiry=Membership">contact us</a> for help!</div>');
                            return $content;
                        });

                    } else {

                        add_filter('the_content', function($content) use ($organization) {
                            
                            ob_start();
                            include('aa-invites/src/templates/existing-customer-invite-endpoint-content.php');
                            $content = ob_get_contents();
                            ob_end_clean();
                            
                            return $content;
                        });
                    }

                }

            }

        }

    }
}, 11); // Set after any other p2p_init hooks