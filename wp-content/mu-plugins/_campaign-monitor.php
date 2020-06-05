<?php namespace CampaignMonitor;

if ( ($_ENV['PANTHEON_ENVIRONMENT'] ?? 'local') !== 'live') {
    define('CM_AUTHORIZATION', '8e2b2f7f53ec102f597f5d05370de421');
    define('CM_LIST_FOR_LEVEL_SUBSCRIBER', 'db8b54260ceffda65d77ed9feda8fc51');
    define('CM_LIST_FOR_LEVEL_INDIVIDUAL', 'c33fb1e0846276b54675b5a3930ad50b');
    define('CM_LIST_FOR_LEVEL_CORPORATE', '325484b5963286e9f4fce2e79f8ab582');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_0', 'https://confirmsubscription.com/h/d/C1C3F14F97928E01');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_1', 'https://confirmsubscription.com/h/d/BBC4989FC1F9B44E');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_2', 'https://confirmsubscription.com/h/d/891ABE6C2850E67B');
} else {
    define('CM_AUTHORIZATION', '9ee4af759f96a0e91fa4437a10b85bcd');
    define('CM_LIST_FOR_LEVEL_SUBSCRIBER', '86b75b985959d7868521d556d0016b37');
    define('CM_LIST_FOR_LEVEL_INDIVIDUAL', '9add0220c916f5d4da204897228c7757');
    define('CM_LIST_FOR_LEVEL_CORPORATE', '506003fa90e06abd2485c8608ced261c');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_0', 'https://confirmsubscription.com/h/y/AEBDBCAF9EF3533B');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_1', 'https://confirmsubscription.com/h/y/0166099F55CE4930');
	define('CM_SUBSCRIBE_PAGE_LINK_LEVEL_2', 'https://confirmsubscription.com/h/y/8736469C23D12C33');
}

define('S2_REGISTRATION_ACTION', 'ws_plugin__s2member_after_configure_user_registration');
define('S2_PROFILE_MODIFICATIONS_ACTION', 'ws_plugin__s2member_during_handle_profile_modifications');
define('CM_CREATE_SUBSCRIPTION_TRIGGERS', [
    S2_REGISTRATION_ACTION,
    S2_PROFILE_MODIFICATIONS_ACTION,
]);

function get_list_per_user_level($level) {
	$lists = [
		0 => CM_LIST_FOR_LEVEL_SUBSCRIBER,
		1 => CM_LIST_FOR_LEVEL_INDIVIDUAL,
		2 => CM_LIST_FOR_LEVEL_CORPORATE,
	];
	return $lists[$level];
}

function get_lists($client_id) {
	$api_path = sprintf('clients/%s/lists.json', $client_id);
	$res = http_request_async('GET', $api_path);
	return $res;
}

// custom fields need to be ['key' => value];
function add_to_mailing_list($list_id, $body) {
	$api_path = sprintf('subscribers/%s.json', $list_id);
	return http_request_async('POST', $api_path, $body);
};

// custom fields need to be ['key' => value];
function add_bulk_to_mailing_list($list_id, $body) {
	$api_path = sprintf('subscribers/%s/import.json', $list_id);
	return http_request_async('POST', $api_path, $body);
};

function unsubscribe_from_mailing_list($list_id, $email) {
	$api_path = sprintf('subscribers/%s/unsubscribe.json', $list_id);
	$body = ['EmailAddress' => $email];
	$res = http_request_async('POST', $api_path, $body);
	return $res;
};

function get_subscriber_details($list_id, $email) {
	$api_path = sprintf('subscribers/%s.json?email=%s',$list_id, urlencode($email));
	$res = http_request_async('GET', $api_path);
	return $res;
}

function update_subscriber($list_id, $email, $body) {
	$api_path = sprintf('subscribers/%s.json?email=%s', $list_id, urlencode($email));
	$res = http_request_async('PUT', $api_path, $body);
	return $res;
};

function update_or_add_subscriber($list_id, $email, $body) {
    $did_update = update_subscriber($list_id, $email, $body);
    $did_update_decode = json_decode($did_update);

    if (is_object($did_update_decode) &&
        property_exists($did_update_decode, 'Code') &&
        $did_update_decode->Code === 203)
    {
        return add_to_mailing_list($list_id, $body);
    }

    return $did_update;
}

function date_format($timestamp) {
	return date('Y/m/d', $timestamp);
}

function gen_custom_field($arr) {
	return ['Key' => key($arr), 'Value' => $arr[key($arr)]];
}

function has_subscription(string $email, string $s2_level) {
	$list = get_list_per_user_level($s2_level);
	$res_obj = json_decode(get_subscriber_details($list, $email));

	if ($res_obj->Code === 203) {
		return false;
	}
	
	return $res_obj->State;
}

function http_request($method, $api_path, $body = null) {

	$base_uri = 'https://api.createsend.com/api/v3.1/';
	$api = $base_uri.$api_path;

	$opts = [
		'http' => [
			'method' => $method,
			'ignore_errors' => '1',
			'header' => [
				'Content-Type: application/json',
				'Authorization: Basic '. base64_encode(CM_AUTHORIZATION . ':' . 'x')
			],
			'content' => json_encode($body)
		]
	];

	if(empty($body)) {
		unset($opts['http']['content']);
	}

	$context = stream_context_create($opts);
	return @file_get_contents($api, false, $context);
}

function http_request_async($method, $api_path, $body = null) {

    $base_uri = 'https://api.createsend.com/api/v3.1/';
    $api = $base_uri.$api_path;

    $opts = [
        'http' => [
            'method' => $method,
            'ignore_errors' => '1',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Basic '. base64_encode(CM_AUTHORIZATION . ':' . 'x')
            ],
            'content' => json_encode($body)
        ]
    ];

    if(empty($body)) {
        unset($opts['http']['content']);
    }

    $context = stream_context_create($opts);
    $fp = fopen($api, 'rb', false, $context);
    stream_set_blocking($fp, 0); // non-blocking mode
    $data = fread($fp, 8192); // Up to length number of bytes read (8MB)
    fclose($fp);

    return $data;
}