<?php namespace AgileAlliance\Membership\Signup\Redirect\Hooks;

/**
 * A redirector that allows us to pass conditional closure
 *
 * @param $pagename
 * @param $rediect_to
 * @param int $status
 * @param null $fun closure Must return bool
 */

$redirect = function($pagename, $rediect_to, $status = 302, $fun = null ) {

	if( strcasecmp(REQUEST_PAGENAME, $pagename) === 0 ) {

		/** @var  $fun_return */
		$fun_return = ( is_callable($fun) ) ? call_user_func($fun) : null;

		switch(true) {
			case ($fun === null):
			case ($fun_return === true):
				wp_redirect($rediect_to, $status);
		}
	}
};
 
/** @todo test the const for change  */
add_action('request', function($req) use ($redirect) {

	define('REQUEST_PAGENAME', $req['pagename']);

	$redirect('membership/checkout',
		S2MEMBER_MEMBERSHIP_OPTIONS_PAGE_URL,
		406, function() {
			return ( ! isset($_COOKIE[GF_ENTRY_MS_COOKIE_NAME])
			         || empty($_COOKIE[GF_ENTRY_MS_COOKIE_NAME]) );
		}
	);

	return $req;
});
