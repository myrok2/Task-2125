<?php

/**
 * Using the hook below; to hook into s2Member after an account has gone
 * through the checkout form. This gets called when an existing customer
 * renews their subscription.
 *
 * This is considered the "modify" or "modification" form.
 */

use Paradigm\Concepts\Functional as F;
use Helpers\User as U;
use Helpers\Organization as O;

/**
 * When Corporate Contact was demoted to Subscriber and updates back
 * to Corporate Contact.
 */

add_action('ws_plugin__s2member_during_paypal_notify_during_subscr_signup_w_update_vars', function($array) {

	$user = $array['user'];
	$roles = $user->roles;

	if (in_array('s2member_level2', $roles)) {

		$p2p_corporate_contact_meta = O\is_p2p_org_meta($user->ID, 'corporate_contact');

		if (!empty($p2p_corporate_contact_meta)) {

			$organization = O\get_organization_connected_to_user($user->ID);
			$register_organization_status = O\reg_taxonomy_organization_status();
			$set_organization_status = O\set_organization_status(true, $organization->ID, false);

			$new_eot           = $array['eot_time'];
			$corporate_contact = $user;
			$members = O\get_organization_members_by( 'post', $organization->ID );
			$members = array_filter( $members, function ( $user ) use ( $corporate_contact ) {
				return $user->ID !== $corporate_contact->ID;
			} );
			$members = new F\ListMonad( $members );

			$update_members = $members
				->bind( function ( $member ) use ( $new_eot ) {
					update_user_option( $member->ID, 's2member_auto_eot_time', $new_eot );

					return $member;
				} )
				->bind( function ( $member ) {
					if ( U\is_user_role_of( 'subscriber', $member->ID ) ) {
						$member->set_role( 's2member_level1' );
					}

					return $member;
				});
		}
	}

}, 10, 1);

/**
 * When a Subscriber upgrades to a new role, set the correct user options
 */

add_action('ws_plugin__s2member_during_paypal_notify_during_subscr_signup_w_update_vars', function($array) {

    $case_insensitive_string_comparison = function($str1, $str2) {
        if (strcasecmp($str1, $str2) !== 0) { return false; }
        return true;
    };
    $case_insensitive_string_comparison_curry = F\curry($case_insensitive_string_comparison, 2);
	$user = $array['user'];
	$current_role = $array['current_role'];
    $current_role_compare = $case_insensitive_string_comparison_curry($current_role);
    $s2member_custom = explode('|', $_REQUEST['custom']);
    $aa_membership_type = strtolower($s2member_custom[1]);

    // When Individual Member, renews and changed membership type update the data.
    if ($current_role_compare('s2member_level1') &&
        ! empty($aa_membership_type) &&
        get_user_meta($user->ID, 'aa_membership_type', true) !== $aa_membership_type) {
            update_user_meta($user->ID, 'aa_membership_type', $aa_membership_type);
    }

    // When Subscriber upgrades, add meta depending on selected account
	if (strcasecmp($current_role, 'subscriber') === 0 ) {

		$s2member_checkout_custom_vars = explode('|',$_REQUEST['custom']);
		$new_roles = $user->roles;

		if (in_array('s2member_level1', $new_roles)) {
			$s2member_membership_type = strtolower($s2member_checkout_custom_vars[1]);
			update_user_meta($user->ID, 'aa_membership_type', $s2member_membership_type);
			update_user_option($user->ID, 's2member_reminders_enable', '1');
		}

		if ( in_array('s2member_level2', $new_roles)) {
			$s2member_member_tier = $s2member_checkout_custom_vars[2];
			$s2member_member_tier = is_numeric($s2member_member_tier) ? $s2member_member_tier : strtolower($s2member_member_tier);
			update_user_meta($user->ID, 'aa_max_memberships', $s2member_member_tier);
		}

	}

}, 10, 1);
