<?php

namespace CampaignMonitor\EOT_Updater;

use Paradigm\Concepts\Functional as F;
use Helpers\User as U;
use Helpers\Organization as O;
use CampaignMonitor as CM;

define('S2_NOTIFICATION_KEY', '8389yfh3FUEh383fuhe308REfieih3r09rhr');

if(defined('DOING_CRON') || defined('DOING_AJAX'))
	return;

function buildBody($display_name, $email, $company, $country_code, $eot_time, $additional_cf = []) {
	$custom_fields = [
		['MembershipExpires' => $eot_time],
		['Company' => $company],
		['Country' => $country_code],
        ['LastUpdate' => CM\date_format(strtotime('now'))],
        ['LastUpdateTrigger' => filter_input(INPUT_GET, 'notify_type', FILTER_SANITIZE_STRING)],
        ['App Environment' => ($_ENV['PANTHEON_ENVIRONMENT'] ?? 'local') ],
	];

	array_push($custom_fields, $additional_cf);

	$cm_custom_fields = array_map(function($arr) {
		return CM\gen_custom_field($arr);
	}, $custom_fields);

	$body = [
		'EmailAddress' => $email,
		'Name' => $display_name,
		'CustomFields' => $cm_custom_fields
	];

	return $body;
}

function easyAdd($list_id, $display_name, $email, $company, $country_code, $eot_time, $additional_cf = []) {
	$body = buildBody($display_name, $email, $company, $country_code, $eot_time, $additional_cf);
	$res = CM\add_to_mailing_list($list_id, $body);
	return $res;
}

function processUserUpdate($user_id, $override_eot = false) {
	$user = get_userdata($user_id);
	$s2_custom_fields = get_user_option('s2member_custom_fields', $user_id);
	$meta = U\singleized_meta(get_user_meta($user_id));
	$eot = !!$override_eot ? $override_eot : $meta['wp_s2member_auto_eot_time'];

	switch(true) {

		case U\is_user_role_of('s2member_level1', $user_id):

		    $current_membership_type = $meta['aa_membership_type'];

		    // Create variables that will return the correct membership type, after renewal.
            $signup_s2member_custom = $meta['wp_s2member_custom'] ?? $current_membership_type;
            $signup_membership_type = explode('|', $signup_s2member_custom)[1] ?? $current_membership_type;
            $membership_type = strtolower($signup_membership_type);

			return easyAdd(
				CM\get_list_per_user_level(1),
				$user->display_name,
				$user->user_email,
				$s2_custom_fields['company'],
				$s2_custom_fields['country_code'],
				CM\date_format($eot),
				['Membership Type' => $membership_type]
			);
			break;

		case U\is_user_role_of('s2member_level2', $user_id):
			$res = easyAdd(
				CM\get_list_per_user_level(2),
				$user->display_name,
				$user->user_email,
				$s2_custom_fields['company'],
				$s2_custom_fields['country_code'],
				CM\date_format($eot),
				['Corp Member Type' => $meta['aa_max_memberships']]
			);

			$org_members = O\get_organization_members_by('user', $user_id);
			$_org_members = new F\MaybeEmpty($org_members);

			$l1_members = $_org_members
				->bind(function($value) {
					return array_filter($value, function($user) {
						return U\is_user_role_of('s2member_level1', $user->ID);
					});
				})
				->bind(function($value) use ($eot) {
					return array_map(function($user) use ($eot) {
						$s2_cf = get_user_option('s2member_custom_fields', $user->ID);
						return buildBody(
							$user->display_name,
							$user->user_email,
							$s2_cf['company'],
							$s2_cf['country_code'],
							CM\date_format($eot),
							[ 'Membership Type' => 'corporate' ]
						);
					}, $value);
				})
				->extract();

			$body = [ 'Subscribers' => array_values($l1_members) ];
			return CM\add_bulk_to_mailing_list(CM\get_list_per_user_level(1), $body);
			break;
	}
}

/*
 * Force S2 notification URLs to use consistent format and the active domain
 * Updates these Notification URLS; /wp-admin/admin.php?page=ws-plugin--s2member-api-ops
 */
add_action('admin_init', function () {
	$notification_url_keys = [
		'signup_notification_urls',
		'registration_notification_urls',
		'payment_notification_urls',
		'modification_notification_urls',
		'cancellation_notification_urls',
		'eot_del_notification_urls',
		'ref_rev_notification_urls',
		'sp_sale_notification_urls',
		'sp_ref_rev_notification_urls',
	];
	$s2_options = get_option('ws_plugin__s2member_options');
	$base_url = site_url('?s2_notification=1&user_id=%%user_id%%&key=' . S2_NOTIFICATION_KEY);
	foreach ($notification_url_keys as $n) {
		$s2_options[$n] = $base_url . '&notify_type=' . $n;
	}
	update_option('ws_plugin__s2member_options', $s2_options);
});

/*
 * Handle manual (and hopefully auto) renewals
 * This uses S2's notification webhook to initialize updates to Campaign Monitor
 *
 * - Level1 members are updated to the L1 List directly
 * - Level2 memberships push the Corp Contact to the L2 list and all L1 members to the L1 list
 */
add_action('init', function() {
	if (
		!filter_input(INPUT_GET, 's2_notification', FILTER_VALIDATE_BOOLEAN) ||
		filter_input(INPUT_GET, 'key', FILTER_SANITIZE_STRING) !== S2_NOTIFICATION_KEY ||
		filter_input(INPUT_GET, 'notify_type', FILTER_SANITIZE_STRING) !== 'modification_notification_urls'
	) {
		return;
	}

	$user_id = filter_input(INPUT_GET, 'user_id', FILTER_SANITIZE_NUMBER_INT);

	if (!$user_id)
		return;

	processUserUpdate($user_id);

	exit;
});

/*
 * Sync EOT on manual updates by admin
 */
add_action('admin_init', function () {
	add_filter('update_user_metadata', function ($null, $object_id, $meta_key, $meta_value) {
		if (defined('BYPASS_USER_META_HOOK') && BYPASS_USER_META_HOOK)
			return;

		if ('wp_s2member_auto_eot_time' == $meta_key) {
			$user = get_userdata($object_id);
			$prev_value = get_user_meta($user->ID, 'wp_s2member_auto_eot_time', true);
			if ($meta_value != $prev_value) {
				processUserUpdate($object_id, $meta_value);
			}
		}
	}, 9, 4);
});
