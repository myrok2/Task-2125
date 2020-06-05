<?php

require_once(ABSPATH . 'wp-admin/includes/plugin.php');

if (!isset($_ENV['PANTHEON_ENVIRONMENT']) || $_ENV['PANTHEON_ENVIRONMENT'] !== 'live') {

	$authnet_api_login_id = '54sRk8GwWhY';
	$authnet_api_trans_key = '2f6353Qp49YkqDY9';

	// Force plugins
	$blacklist = array(
		'google-analytics-for-wordpress/googleanalytics.php',
		'mailchimp-for-wp/mailchimp-for-wp.php',
		'mc4wp-premium/mc4wp-premium.php'
	);
	if (defined('LOCALHOST') && LOCALHOST === true) {
		$blacklist[] = 'wp-redis/wp-redis.php';
		$blacklist[] = 'webriti-smtp-mail/webriti-smtp-mail.php';
		$blacklist[] = 'solr-power/solr-power.php';
	}

	$whitelist = array(
		'wp-reroute-email/wp-reroute-email.php',
	);

	deactivate_plugins($blacklist);
	activate_plugins($whitelist);

	// Force Auth.net test credentials in S2Member
	$s2_options = get_option('ws_plugin__s2member_options');
	if ($s2_options['pro_authnet_sandbox'] === "0") {
		$s2_options['pro_authnet_api_login_id'] = $authnet_api_login_id;
		$s2_options['pro_authnet_api_trans_key'] = $authnet_api_trans_key;
		$s2_options['pro_authnet_api_salt_key'] = "bigR3d!";
		$s2_options['pro_authnet_sandbox'] = "1";
		update_option('ws_plugin__s2member_options', $s2_options);
	}

	// Force Auth.net test credentials in Gravity Forms addon
	$gforms_authnet_options = get_option('gravityformsaddon_gravityformsauthorizenet_settings');
	if ($gforms_authnet_options && $gforms_authnet_options['mode'] === 'production') {
		$gforms_authnet_options['mode'] = 'test';
		$gforms_authnet_options['loginId'] = $authnet_api_login_id;
		$gforms_authnet_options['transactionKey'] = $authnet_api_trans_key;
		update_option('gravityformsaddon_gravityformsauthorizenet_settings', $gforms_authnet_options);
	}

}

// Force on all environments
activate_plugins([
	'posts-to-posts/posts-to-posts.php',
	'advanced-custom-fields-pro/acf.php',
	'agile-alliance-cp/agile-alliance-cp.php',
	'agile-alliance-quotes/agile-alliance-quotes.php',
	'wp-user-avatar-pro/wp-user-avatar-pro.php',
]);
