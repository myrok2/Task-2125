<?php defined( 'ABSPATH' ) or die( '' );

/**
 * Specific acf hooks or filters
 */

/** Conditional loading of acf_form_head() */
add_action('wp_head', function() {

	if ( (defined('AA_SHOW_ORG_CREATE_FORM') && AA_SHOW_ORG_CREATE_FORM )
	    || (defined('LOAD_ACF_FORM_HEAD') && LOAD_ACF_FORM_HEAD)
    ) {
		/** Clean all values
		 * @see http://www.advancedcustomfields.com/resources/acf_form/#security
		 */
		add_filter('acf/update_value', 'wp_kses_post', 10, 1);
		acf_form_head();
	}

});
