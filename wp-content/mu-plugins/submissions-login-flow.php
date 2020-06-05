<?php namespace AgileAlliance\Submissions;

use Paradigm\Concepts\Functional as F;

/**
 * Create 'STYXKEY-login-referer'
 */

add_action('login_head', function() {

	$short_circuit_isset = function($var, $default_value = NULL) {
		return	(isset($var)) ? : $default_value;
	};

	$return_url = $short_circuit_isset( $_GET['returnurl'] );

	$submissions_referer_cookie_data = [
			'name'   => LOGIN_REFERER_COOKIE_NAME,
			'value'  => 'submissions',
			'expire' => strtotime('+2 hours'),
			'path'   => SUBMISSIONS_COOKIE_PATH,
			'domain' => SUBMISSIONS_COOKIE_DOMAIN
	];

	$submissions_cookie_monad = new F\Identity($submissions_referer_cookie_data);

	/**
	 * Referer must be the Submission System, set cookie
	 */
	if ( ! empty($return_url) ) {

		$set_submissions_cookie = $submissions_cookie_monad
				->bind( function($value) {
					$value = setcookie($value['name'],
							$value['value'],
							$value['expire'],
							$value['path'],
							$value['domain']);
					return $value;
				})
				->extract();
	}

});

/**
 * Create "Sign Up" button
 */
add_action('login_footer', function() {

	$heading         = __('Not a Member or Subscriber?');
	$sign_up_context = __('SIGN UP');
	$membership_url  = ( isset($_GET['returnurl']) && ! empty($_GET['returnurl']) )
			? site_url( '/membership/?rt=Subscriber&redirect_id=' . get_the_ID())
			: site_url( '/membership-pricing/?redirect_id=' . get_the_ID());

	/**
	 * Front-end @todo refactor
	 */

	echo <<<HTML
		<style>
			.login-footer{
				max-width:550px;
				margin: 0 auto;
				background: #545454;
				padding: 20px 0;
				text-align: center;
			}
			.login-footer h3{
				font-size: 24px !important;
				font-family: sofia-pro,sans-serif!important;
				font-weight: 300!important;
				text-align: center;
				line-height: 35px;
				color: #fff;
				margin-bottom: 25px;
			}
			.login-footer .btn{
				display: inline-block;
				width: auto;
				padding: 8px 32px!important;
				color: #fff!important;
				font-size: 13px!important;
				font-weight: 600;
				letter-spacing: 1.25px;
				text-transform: uppercase;
				border: 3px solid transparent!important;
				border-radius: 30px!important;
				text-decoration: none;
				transition: all .3s ease-in-out;
				text-align: center;
				vertical-align: middle;
				touch-action: manipulation;
				cursor: pointer;
			}
			.login-footer .aa_global-signup{
			    background: #26D975!important;
			    border-color: #26D975!important;
			    line-height: normal;
			}
		</style>
		<div class="login-footer">
			<h3>$heading</h3>
			<a href="/membership-pricing"
			   class="btn aa_btn aa_global-signup"
			   id="login-signup-button">
				$sign_up_context
			</a>
		</div>
HTML;

});

/**
 *  Create Submissions needed cookie when registering "IDENTITYID"
 *
 * @var mixed $array Contains 3 items keyed: (int) user_id, (string) password
 *                   (object) wpdb
 */

add_action('user_register',
	function($user_id) {
        $arr['user_id'] = $user_id;
		$user_id_monad = new F\Identity($arr['user_id']);

		$set_submissions_identity_cookie = $user_id_monad
				->bind( function($value){
					$value = cyrpt_blowfish_ecb(SUBMISSIONS_SYSTEM_KEY,
							'mcrypt_encrypt',
							$value);
					return $value;
				})
				->bind( function($value) {
					$value = setcookie(SUBMISSIONS_COOKIE_NAME,
							$value,
							SUBMISSIONS_COOKIE_EXPIRE,
							SUBMISSIONS_COOKIE_PATH,
							SUBMISSIONS_COOKIE_DOMAIN);
					return $value;
				})
				->extract();

	}
);
