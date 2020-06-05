<?php defined( 'ABSPATH' ) or die( '' );
use Helpers\Organization as O;


/** Cap the s2Membership levels from 0 to 2 */
define('MEMBERSHIP_LEVELS', 2);

/**
 * If you find yourself having to write replicate conditional logic across
 * different files,create a constant here to then be used accross all
 * plugins or files. You may or my not have to wrap your constant blocks
 * in add_action hooks.
 */

/**
 * Define whether to force the organization creation form
 */

add_action('init', function() {

	if ( is_user_logged_in() && ! defined('AA_SHOW_ORG_CREATE_FORM') ) {

		$user_id = get_current_user_id();
		// see if the user is a sub account to a corporate account by seeing if they have a value for
        // mpca_corporate_account_id in their meta
        $ownsCorpAccount = get_user_meta($user_id, 'mpca_corporate_account_id') ? 0 : 1;
        // see if they have a record for the corp accounts in memberpress
        $hasCorpRecord = O\get_corporate_account($user_id);
        // validate both since when using the link to join an org, they get a record in the corporate account table
        $ownsCorpAccount = $hasCorpRecord && $ownsCorpAccount;
        $created_org = get_user_meta($user_id, 'aa_created_organization', true);
        //die ('User: ' . $user_id . ' = ' . ($hasCorpRecord && $ownsCorpAccount) . ' - ' . json_encode($created_org));//. $ownsCorpAccount . ' - ' . json_encode($hasCorpRecord) . '' );
		$set_constant = function() use ($created_org, $ownsCorpAccount) {

			if( is_user_logged_in() &&
                $ownsCorpAccount == 1
			    && $created_org !== '1'
			    && ! is_super_admin() ){
				return true;
			}
			return false;
		};
		/** @var  $set_constant_result bool for toggeling org create form
		 * locally remember to set it back to $set_constant() */

//		$set_constant_result = true;
		$set_constant_result = $set_constant();
		define('AA_SHOW_ORG_CREATE_FORM', $set_constant_result );
	}

});

add_action('wp', function($wp_obj) {

	$this_user_id = get_current_user_id();
	$this_post_id = get_the_ID();
	$query_vars = $wp_obj->query_vars;

	/**
	 * 'aa_organizations' related constants
	 */
	if ( $query_vars['post_type'] === 'aa_organizations' && !is_404() ) {

		$p2p_id = p2p_type('user_to_organization_member')
				->get_p2p_id($this_user_id, $this_post_id);

		if ( ! defined('LOAD_ACF_FORM_HEAD') ) {

			$set_constant = function() use ($query_vars) {
				if( $query_vars['action'] === 'edit' ) {

					return true;
				}
				return false;
			};
			$set_constant_result = $set_constant();

			define('LOAD_ACF_FORM_HEAD', $set_constant_result);

		}

		if ( ! defined('IS_USER_MEMBER_THIS_ORG') ) {

			$set_constant = function($connected){
				return (bool) $connected;
			};

			$set_constant_result = $set_constant($p2p_id);

			define('IS_USER_MEMBER_THIS_ORG', $set_constant_result);
		}

		if ( ! defined('CAN_USER_ADMIN_THIS_ORG') ) {

			$set_constant = function() {
				if ( IS_USER_MEMBER_THIS_ORG
				     && current_user_can( 'aa_admin_organization' )
				){
					return true;
				}
				return false;
			};

			$set_constant_result = $set_constant();

			define('CAN_USER_ADMIN_THIS_ORG', $set_constant_result);
		}

		if( ! defined('CAN_USER_ADMIN_INVITE_TO_ORG') ) {

			$set_constant = function(){
				$aa_invoice_paid = get_user_meta(get_current_user_id(),
						'aa_invoice_paid', true);

				if ( empty($aa_invoice_paid) || $aa_invoice_paid === 'true'){
					return true;
				}

				return false;
			};

			$set_constant_result = $set_constant();

			define('CAN_USER_ADMIN_INVITE_TO_ORG', $set_constant_result);

		}

	}

});
