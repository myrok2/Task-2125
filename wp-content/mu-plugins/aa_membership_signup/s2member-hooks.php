<?php namespace AgileAlliance\Membership\Signup\s2member\Hooks;

/**
 * Add the gravity form entry data to the registration post
 */

use function GuzzleHttp\default_ca_bundle;

add_action('init', function(){

	if ( isset($_POST['s2member_pro_authnet_checkout'])
	     && isset( $_COOKIE[GF_ENTRY_MS_COOKIE_NAME] ) ) {
		$_POST['gravity_form_entry'] = $_COOKIE[GF_ENTRY_MS_COOKIE_NAME];
	};

}, 1);



/**
 * On Registration Success
 *
 */

add_action('ws_plugin__s2member_during_configure_user_registration', function($arr) {

	if ( isset( $_COOKIE[GF_ENTRY_MS_COOKIE_NAME]) ) {

		$user = $arr['user'];
		$roles = $user->roles;

		$post_gravity_entry = $arr['_pmr']['gravity_form_entry'];
		$post_gravity_entry_decrypted = s2member_decrypt($post_gravity_entry);
		$entry_data_arr = unserialize($post_gravity_entry_decrypted);

		switch (true) {
			case ( in_array('s2member_level2', $roles) ):

				$membership_tier_value = explode(' ',
						$entry_data_arr['membership_tier'])[0];

				$update_user_meta = update_user_meta($user->ID,
						'aa_max_memberships', $membership_tier_value);

				if ( is_numeric($update_user_meta) ) {
					unset( $_COOKIE[GF_ENTRY_MS_COOKIE_NAME] );
					// Login the Corporate Member
					wp_set_auth_cookie($user->ID);
				}

			break;
			case ( in_array('s2member_level1', $roles) ) :

				/**
				 * Extract string from left of the pipe.
				 */
				$membership_type_value = strtolower(
						explode('|',
								$entry_data_arr['membership_types']
						)[0]
				);

				$update_user_meta = update_user_meta($user->ID,
						'aa_membership_type', $membership_type_value);

				if ( is_numeric($update_user_meta) ){
					unset($_COOKIE[GF_ENTRY_MS_COOKIE_NAME]);
                    wp_set_auth_cookie($user->ID);
				}

			break;
            default:
                unset($_COOKIE[GF_ENTRY_MS_COOKIE_NAME]);
                wp_set_auth_cookie($user->ID);
                break;
		}
	}

});
