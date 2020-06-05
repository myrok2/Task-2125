<?php
namespace AgileAlliance\Submissions;
use Paradigm\Concepts\Functional as F;

define('SUBMISSIONS_SYSTEM_KEY', \get_option('dev_submissions_key') );
define('SUBMISSIONS_COOKIE_EXPIRE', strtotime('+2 weeks') );
define('SUBMISSIONS_COOKIE_PATH', '/');
define('SUBMISSIONS_COOKIE_DOMAIN', get_domain_name( $_SERVER['HTTP_HOST']) );
define('SUBMISSIONS_COOKIE_NAME', 'IDENTITYID');
define('LOGIN_REFERER_COOKIE_NAME', 'STYXKEY-login-referer');
define('SUBMISSIONS_API_KEY', 'ea5f672d8a322d3e5849c2f074042a2f');

if ( ! defined( 'IDENTITYID_META_KEY') ) {
	define('IDENTITYID_META_KEY', 'aa_original_identity_id');
}

/** Actions */

add_filter('allowed_redirect_hosts', function($content) {
	$content[] = 'submissions.agiall.dev';
	$content[] = 'submissions-staging.agilealliance.org';
	$content[] = 'submissions.agilealliance.org';
	return $content;
});

add_filter('login_redirect', function($a, $b) {

	$url_to_parse = $_SERVER['HTTP_REFERER'];
	$parse_url_component = PHP_URL_QUERY;
	$has_url_query = \parse_url($url_to_parse, $parse_url_component);

	if ( $has_url_query !== null ) {

		$parse_str_return_arr = function() {
			return function($str) {
				\parse_str($str, $results);
				return $results;
			};
		};

		// invoke so clousre is useable
		$parse_str = $parse_str_return_arr();
		$query_arr = $parse_str($has_url_query);

		if ( ! empty($query_arr)
		     && isset( $query_arr['returnurl'] )
		) {
			return urldecode( $query_arr['returnurl'] );
		}

	}

	return $a;
}, 10, 2);

/**
 * Set IDENTITYID cookie when user logs in.
 */
add_action('wp_login', function($user_login, $user) {

	/**
	 * Set cookie
	 *
	 * @param $expire
	 * @param $path
	 * @param $domain
	 * @param $name
	 *
	 * @return \Closure
	 */
	$create_cookie = function( $expire, $path, $domain, $name ) {
		return function( $value ) use ($expire, $path, $domain, $name){
			return setcookie($name, $value, $expire, $path, $domain);
		};
	};

	$crypter = F\partial( ns_fun('cyrpt_blowfish_ecb'), SUBMISSIONS_SYSTEM_KEY );
	$encrypter = F\partial($crypter, 'mcrypt_encrypt');
	$encryption = F\compose($encrypter, ns_fun('get_user_identity_id') );

	$setup_cookie = $create_cookie(
			SUBMISSIONS_COOKIE_EXPIRE,
			SUBMISSIONS_COOKIE_PATH,
			SUBMISSIONS_COOKIE_DOMAIN,
			SUBMISSIONS_COOKIE_NAME
	);

	$set_submissions_cookie = F\compose( $setup_cookie, $encryption);
	$set_submissions_cookie($user->data->ID);

} , 10, 2);

/**
 * Namespacing function
 *
 * @param $fun string Namespaced string of your function
 *
 * @return string
 */
function ns_fun($fun){
	return __NAMESPACE__."\\$fun";
}

/**
 * Check if user has legacy IDENTITYID
 *
 * This will return bool of false if
 * the user option IDENTITYID_META_KEY
 * is not found
 *
 * @param $user_id
 *
 * @return mixed
 */
function user_has_identity_id($user_id) {
	return get_user_option( IDENTITYID_META_KEY, $user_id );
}

/**
 * Return user's IDENTITYID
 *
 * If the user has an old IDENTITYID that
 * will return an alpha numeric string
 *
 * If the user does not have an IDENTITYID
 * you will the value of table wp_users
 * column ID
 *
 * @param $user_id
 *
 * @return mixed
 */
function get_user_identity_id($user_id) {

	$has_identity_id = user_has_identity_id($user_id);

	if ( $has_identity_id !== false ) {
		$user_id = $has_identity_id;
	}

	return $user_id;
}

/**
 * Return a user's Wordpress ID
 *
 * This is mainly used in the Submissions
 * get user endpoint, so that incase a
 * IDENTITYID is passed we can get the user's
 * WordPress ID and get user's information
 * later
 *
 * @param $user_id
 *
 * @return mixed
 */

function get_user_id_by_identifier($user_id) {

	if ( ! is_numeric( $user_id ) ) {
		//
		$user = get_users([
				'meta_key'   => IDENTITYID_META_KEY,
				'meta_value' => $user_id
		])[0];

		$user_id = $user->ID;
	}

	return $user_id;

}

/**
 * Identify Pantheon's enviroment
 *
 * Options are: 'dev','test','live';
 *
 * @param $env_string
 *
 * @return bool
 */

function is_pantheon_env($env_string){
	return ( isset($_SERVER['PANTHEON_ENVIRONMENT'])
	         && strcasecmp($_SERVER['PANTHEON_ENVIRONMENT'], $env_string) === 0
	);
}

/**
 *  If 'PANTHEON_ENVIROMENT' is not set the function assumes the application
 *  is on a local dev envritoment.
 *
 * @todo: This needs to be refactored, if moved from pantheon
 *
 * @return bool
 */

function is_enviroment_local() {
	return ! isset($_SERVER['PANTHEON_ENVIRONMENT']);
}

/**
 * Return domain name from string
 *
 * The fuction assumes that there is only
 * one set subdomain. So "sub.sub.domain.tld"
 * would not returl "domain.tld"
 *
 * @param $url
 *
 * @return string
 */
function get_domain_name($url) {
	$arr = explode('.', $url);
	return ( count($arr) <= 2)
		? implode('.', $arr)
		:  implode('.', array_slice($arr, 1 ) );
}

/**
 * Submissions system specific crypting
 *
 *
 * @param $key string
 * @param $fun string
 * @param $data string
 *
 * @return string
 */
function cyrpt_blowfish_ecb($key, $fun, $data) {
	$key = base64_decode($key);
	$data = ($fun === 'mcrypt_decrypt') ? base64_decode($data) : $data;
	$result = $fun(MCRYPT_BLOWFISH, $key, $data, MCRYPT_MODE_ECB);
	$return = ($fun === 'mcrypt_encrypt') ? base64_encode($result) : $result;
	return $return ;
}

/**
 * Verify the decriptions is same as the plain text value
 *
 * @param $plain_text string
 * @param $decrypted binary string
 *
 * @return bool
 */
function decrypt_verify($plain_text, $decrypted) {
	if (strncmp($decrypted, $plain_text, strlen($plain_text)) == 0) {
		return true;
	}
	return false;
}
