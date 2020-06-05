<?php
use CampaignMonitor as CM;
use function Helpers\User\{get_user_data};

if(! defined('DOING_CRON') || ! defined('DOING_AJAX')) :

    function add_subscriber($arr) {
        if (! isset($_GET['organization-invite'])) {
            $fields = $arr['fields'];
            $level = $arr['level'];
            $user_id = $arr['user_id'];
            $body = [
                'EmailAddress' => $arr['email'],
                'Name' => $arr['name'],
            ];
            $campaign_monitor_list_by_level = CM\get_list_per_user_level($level);

            // Backtrace to get the do_action that triggered a Campaign Monitor subscription.
            $get_action = (new Paradigm\Concepts\Functional\Maybe(debug_backtrace()))
                ->bind(function($backtrace) {
                    return array_filter($backtrace, function($item) {
                        if ($item['function'] !== 'do_action' ||
                            ! in_array($item['args'][0], CM_CREATE_SUBSCRIPTION_TRIGGERS) ) {
                            return false;
                        }
                        return true;
                    });
                })
                ->bind(function($action) {
                    return array_shift(array_shift($action)['args']);
                })
                ->extract();

            $customFields = [
                [ 'Company' => $fields['company'] ],
                [ 'Country' => $fields['country_code'] ],
                [ 'LastUpdate' => CM\date_format(strtotime('now'))],
                [ 'LastUpdateTrigger' => $get_action],
                [ 'App Environment' => ($_ENV['PANTHEON_ENVIRONMENT'] ?? 'local') ],
            ];

            if (isset($fields['topic'])) {
                foreach ($fields['topic'] as $aTopic) {
                    array_push($customFields, ['Topic' => $aTopic]);
                }
            }
            if((int)$level > 0) {

                $eot = ((int)$level === 1 && empty($arr['auto_eot_time']))
                    ? 'auto'
                    : CM\date_format( $arr['auto_eot_time'] );

                $customFields[] = [ 'MembershipExpires' =>  $eot];
                $customFields[] = [ 'AutoRenew' => ($eot === 'auto') ? 'Y' : 'N'];

                switch ( $level ) {
                    case '1':
                        $membership_type = get_user_meta( $user_id, 'aa_membership_type', true );
                        $customFields[] = [ 'MembershipType' => $membership_type ];
                        break;
                    case '2':
                        $max_memberships = get_user_meta( $user_id, 'aa_max_memberships', true );
                        $customFields[] = [ 'CorpMemberType' => $max_memberships ];
                        break;
                    default:
                }

                if (array_key_exists('resubscribe', $arr)
                    && $arr['resubscribe'] === true) {
                    $body['Resubscribe'] = true;
                }

            }
            $cf = function ( $arr ) {
                return CM\gen_custom_field( $arr );
            };

            $body = $body + [
                'CustomFields' => array_map($cf , $customFields ),
            ];

            return CM\add_to_mailing_list($campaign_monitor_list_by_level, $body);
        }

    };

    function get_s2_user_level_by_roles($user_roles) {
        $level = null;
        switch(true) {
            case in_array('s2member_level1', $user_roles) :
                $level = '1';
                break;
            case in_array('s2member_level2', $user_roles):
                $level = '2';
                break;
            case in_array('subscriber', $user_roles):
                $level = '0';
                break;
        }
        return $level;
    }

    /**
     * @param object $user
     * @param array $user_meta
     * @param array $user_s2_custom_fields
     * @param int $s2_level
     * @param array $eot
     * @param string $callee_trigger
     * @return array
     */
    function generate_subscription_body($user, array $user_meta, array $user_s2_custom_fields, int $s2_level, array $eot, string $callee_trigger = '') {
        $default_custom_fields = [
            [ 'Company' => $user_s2_custom_fields['company'] ],
            [ 'Country' => $user_s2_custom_fields['country_code'] ],
            [ 'Topic' => $user_s2_custom_fields['topic'] ],
            [ 'LastUpdate' => CM\date_format(strtotime('now'))],
            [ 'LastUpdateTrigger' => $callee_trigger],
            [ 'App Environment' => ($_ENV['PANTHEON_ENVIRONMENT'] ?? 'local') ],
        ];

        if ($s2_level > 0) {
            $s2_signup_vars = unserialize($user_meta['wp_s2member_ipn_signup_vars']);
            $recurring_amount = (int) $s2_signup_vars['recurring'];
            $is_auto_renew = ($recurring_amount === 0) ? 'N' : 'Y';
            $eot_date = '';

            if (strcasecmp('fixed', $eot['type']) === 0) {
                $eot_date = CM\date_format($eot['time']);
            }

            $default_custom_fields[] = ['MembershipExpires' => $eot_date];
            $default_custom_fields[] = ['AutoRenew' => $is_auto_renew];

            switch($s2_level) {
                case 1:
                    $default_custom_fields[] = ['MembershipType' => $user_meta['aa_membership_type']];
                    break;
                case 2:
                    $default_custom_fields[] = ['CorpMemberType' => $user_meta['aa_max_memberships']];
                    break;
                default:
            }
        }

        $body = [
            'EmailAddress' => $user->user_email,
            'Name' => $user_meta['first_name'] . ' ' . $user_meta['last_name'],
            'CustomFields' => array_map(function($item) {
                return CM\gen_custom_field($item);
            }, $default_custom_fields),
        ];

        return $body;
    }

    // Action Hooks & Filters

    // Subscribe successful invitees to an email list
    add_action('aa_invite_accepted', function($user) {
        $user_data = get_user_data($user->ID);
        $member_level = $user_data['s2member_level'];
        $member_email = $user->user_email;
        $cm_list_subscription_body = generate_subscription_body(
            $user,
            $user_data['user_meta'],
            $user_data['s2member_custom_fields'],
            $member_level,
            $user_data['s2member_eot'],
            'invite'
        );
        $list = CM\get_list_per_user_level($member_level);
        $res  = CM\update_or_add_subscriber($list, $member_email, $cm_list_subscription_body);
    }, 10, 1);

    add_action(S2_REGISTRATION_ACTION, 'add_subscriber', 11, 1);

    // Display Campaign Monitor subscriber page link and content.
    add_action('ws_plugin__s2member_before_sc_profile', function() {
        $cm_subscriber_page_url = constant('CM_SUBSCRIBE_PAGE_LINK_LEVEL_' . S2MEMBER_CURRENT_USER_ACCESS_LEVEL );
        $cm_subscriber_page_anchor = sprintf('<a href="%s" class="btn btn-primary aa_btn">re-subscribe</a>', $cm_subscriber_page_url);
        $content = '<p> Your benefits include a subscription to our Newsletter. 
        If you feel you may have unsubscribed by accident use the Re-subscribe 
        button to reactivate your newsletter subscription.</p> <div style="margin-bottom:25px;">%s</div>';
        $complete_content = sprintf($content, $cm_subscriber_page_anchor);
        echo $complete_content;
    });

    add_filter('send_email_change_email', function($send, $user, $user_data) {
        $previous_user_data = get_user_data($user['ID']);
        $member_has_subscription = CM\has_subscription($user['user_email'], $previous_user_data['s2member_level']);

        if ($member_has_subscription) {
            $previous_user_data = get_user_data($user_data['ID']);
            $body = generate_subscription_body(
                $previous_user_data['user'],
                $previous_user_data['user_meta'],
                $previous_user_data['s2member_custom_fields'],
                $previous_user_data['s2member_level'],
                $previous_user_data['s2member_eot'],
                'send_email_change_email'
            );
            $body['EmailAddress'] = $user_data['user_email'];
            $list = CM\get_list_per_user_level($previous_user_data['s2member_level']);
            $res = CM\update_subscriber($list, $user['user_email'], $body );
        }

        return $send;
    }, 10 , 3);

    add_filter('update_user_metadata', function($null, $object_id, $meta_key, $meta_value, $prev_value) {
        // Should only fires when user is update from edit profile, or admin edit user view in dashboard
        if ($meta_key === 'wp_s2member_custom_fields' && !isset($_POST['s2member_pro_authnet_checkout'])) {
            // At this point in the life cycle, the update user metadata has not been update in the database, therefore
            // a call to get user data will be the current data in the database before this meta_value update
            $user_data = get_user_data($object_id);
            $list = CM\get_list_per_user_level($user_data['s2member_level']);
            $member_has_subscription = CM\has_subscription($user_data['user']->user_email, $user_data['s2member_level']);

            if ($member_has_subscription) {
                $trigger = $_REQUEST['_wp_http_referer'] ?? '';
                $body = generate_subscription_body(
                    $user_data['user'],
                    $user_data['user_meta'],
                    $meta_value,
                    $user_data['s2member_level'],
                    $user_data['s2member_eot'],
                    $trigger
                );
                CM\update_subscriber($list, $user_data['user']->user_email, $body);
            }

            return null;
        }
    }, 10, 5);

endif;
