<?php

namespace Regonline\Endpoint;

use Paradigm\Concepts\Functional as F;

if( !defined('WPINC') ) // MUST have WordPress.
	exit('Do not access this file directly.');

// Note the lack of a trailing slash
define('AA_S2_REGONLINE_ENDPOINT_URL', '/regonline');

// Triggers emails at various points for debugging on pantheon
define('AA_S2_REGONLINE_ENDPOINT_DEBUG', false);
define('AA_S2_REGONLINE_ENDPOINT_DEBUG_RECIPIENT', 'eschoellhorn@352inc.com');

/*
 * This flag permits pulling the IP from insecure HTTP_X_FORWARDED_FOR header.
 * When RegOnline supports TLS 1.2, this endpoint should be hit directly
 * instead of via the Heroku proxy. Once that's the case, set this flag to
 * false in order to reduce susceptibility for IP spoofing.
 */
define('REGONLINE_PROXY_IS_ACTIVE', true);

// All IPs of Regonline, not used anymore
$allowedIPs = [
	'52.22.43.139',
	'52.22.43.226',
	'52.23.138.77',
	'52.23.92.3',
	'52.23.92.6',
	'52.3.20.189',
	'52.5.54.51',
	'52.70.98.60',
	'52.3.139.233',
	'52.23.109.61',
	'70.169.187.174' // <= 352 Gainesville
];

function getRequestIP() {
	$client_ip = REGONLINE_PROXY_IS_ACTIVE ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
	return trim(current(explode(',', $client_ip)));
}

function regOnlineEndpointDebugLog($subject, $vars) {
	if (AA_S2_REGONLINE_ENDPOINT_DEBUG) {
		wp_mail(AA_S2_REGONLINE_ENDPOINT_DEBUG_RECIPIENT, $subject, print_r($vars, true));
	}
}

$getXmlKey = function($key, $value = '') {
	$val = gettype($value) === 'boolean' ? ($value ? 'true' : 'false') : $value;
	return !empty($val) ? "<$key>$val</$key>" : "<$key />";
};

$generateXmlResult = function($success, $error, $response = []) use ($getXmlKey) {
	$string = '<authresponse xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.regonline.com/api">';
	$string .= $getXmlKey('success', $success);
	$string .= $getXmlKey('errormessage', $error);
	$string .= F\reduce($response, function($carry, $value, $key) use ($getXmlKey) {
		$carry .= $getXmlKey($key, $value);
		return $carry;
	}, '');
	$string .= "</authresponse>";
	return $string;
};

$allowedParams = [
	'email'         => ['filter' => FILTER_SANITIZE_EMAIL,      'required' => false],
	'eventid'       => ['filter' => FILTER_SANITIZE_NUMBER_INT, 'required' => true ],
	'regtypeid'     => ['filter' => FILTER_SANITIZE_NUMBER_INT, 'required' => true ],
	'clienteventid' => ['filter' => FILTER_SANITIZE_STRING,     'required' => false],
	'regtypename'   => ['filter' => FILTER_SANITIZE_STRING,     'required' => true ],
	'username'      => ['filter' => FILTER_SANITIZE_STRING,     'required' => false ],
	'passwordhash'  => ['filter' => FILTER_SANITIZE_STRING,     'required' => false],
	'eventlang'     => ['filter' => FILTER_SANITIZE_STRING,     'required' => false ],
	'xid'           => ['filter' => FILTER_SANITIZE_STRING,     'required' => true ]
];

add_action('init', function() use ($generateXmlResult, $allowedParams, $allowedIPs) {

	if (strtok($_SERVER['REQUEST_URI'],'?') !== AA_S2_REGONLINE_ENDPOINT_URL || $_SERVER['REQUEST_METHOD'] !== 'GET') return;

	header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
	header('Cache-Control: post-check=0, pre-check=0', false);
	header('Pragma: no-cache');
	header('Content-type: text/xml; charset=utf-8');

	// Ensure IP address is known
	/*if (!in_array(getRequestIP(), $allowedIPs)) {
		$response = $generateXmlResult(false, 'FAILED_TO_LOAD_ENDPOINT');
		echo $response;
		exit;
	}*/

	regOnlineEndpointDebugLog('regonline-endpoint PRE_PARSE', $_GET);

	// Sanitize and enforce required params
	try {
		$params = F\reduce($allowedParams, function($carry, $value, $key) {
			$sanitized = filter_input(INPUT_GET, $key, $value['filter']);
			if (empty($sanitized) && $value['required']) {
				regOnlineEndpointDebugLog('regonline-endpoint MISSING_REQUIRED_PARAMETER', get_defined_vars());
				throw new \Exception('MISSING_REQUIRED_PARAMETER');
			}
			$carry[$key] = !empty($sanitized) ? $sanitized : '';
			return $carry;
		}, []);
	} catch(\Exception $ex) {
		$response = $generateXmlResult(false, $ex->getMessage());
		echo $response;
		exit;
	}

	regOnlineEndpointDebugLog('regonline-endpoint VALID_REQUEST', $params);

	// Fetch user data, meta, and s2 fields
	$user = current(get_users(array(
		'meta_key'     => 'regonline_xid_token',
		'meta_value'   => $params['xid'],
		'meta_compare' => '=',
	)));

	if (!$user) return;

	if ($user->user_email !== $params['email']) {
		$response = $generateXmlResult(false, 'You must register with the same email address as you use on Agile Alliance.');
		delete_user_meta($user->ID, 'regonline_xid_created');
		delete_user_meta($user->ID, 'regonline_xid_token');
		regOnlineEndpointDebugLog('regonline-endpoint EMAIL_MISMATCH', get_defined_vars());
		echo $response;
		exit;
	}

	$meta = get_user_meta($user->ID);
	$xid_creation = current($meta['regonline_xid_created']);
	$xid_age = time() - $xid_creation;

	// Avoid expired XID tokens-- delete and return error
	if ($xid_age > (5 * MINUTE_IN_SECONDS * 1000)) {
		$response = $generateXmlResult(false, 'Registration expired, please start over.');
		delete_user_meta($user->ID, 'regonline_xid_created');
		delete_user_meta($user->ID, 'regonline_xid_token');
		regOnlineEndpointDebugLog('regonline-endpoint EXPIRED_TOKEN', get_defined_vars());
		echo $response;
		exit;
	}

	$s2_fields = unserialize($meta['wp_s2member_custom_fields'][0]);
	if (!empty($s2_fields) && gettype($s2_fields) === 'string') {
		$s2_fields = unserialize($s2_fields);
	}

	regOnlineEndpointDebugLog('regonline-endpoint USER_DATA', ['user' => $user, 'meta' => $meta, 's2fields' => $s2_fields]);

	/*
	 * Validate user eligibility, ensuring s2 member level of 1 or 2
	 */
	$valid_member_roles = [
		's2member_level1',
		's2member_level2'
	];

	$user_is_member = F\reduce($valid_member_roles, function($carry, $role) use ($user){
		regOnlineEndpointDebugLog('regonline-endpoint USER_ROLES', $user->roles);
		$user_has_role = in_array($role, $user->roles);
		return $carry || $user_has_role;
	}, is_super_admin());

	if (!$user_is_member) {
		$response = $generateXmlResult(false, 'Insufficient membership level.');
		delete_user_meta($user->ID, 'regonline_xid_created');
		delete_user_meta($user->ID, 'regonline_xid_token');
		regOnlineEndpointDebugLog('regonline-endpoint INSUFFICIENT_MEMBER_LEVEL', get_defined_vars());
		echo $response;
		exit;
	}

	/*
	 * Below are all of the allowed keys, populate where relevant
	 * this array will be returned to regonline in full
	 */
	$responseKeys = [
		'firstname' => current($meta['first_name']),
		'middlename' => '',
		'lastname' => current($meta['last_name']),
		'suffix' => '',
		'jobtitle' => $s2_fields['title'],
		'company' => $s2_fields['company'],
		'address1' => '',
		'address2' => '',
		'city' => '',
		'state' => '',
		'postalcode' => '',
		'workphone' => '',
		'homephone' => '',
		'country' => '',
		'extension' => '',
		'fax' => '',
		'mobilephone' => '',
		'emergencycontactphone' => '',
		'dob' => '',
		'gender' => '',
		'secondaryemail' => '',
		'email' => $params['email']
	];

	$response = $generateXmlResult(true, '', $responseKeys);

	regOnlineEndpointDebugLog('regonline-endpoint RESPONSE', $response);

	delete_user_meta($user->ID, 'regonline_xid_created');
	delete_user_meta($user->ID, 'regonline_xid_token');

	echo $response;
	exit;

});