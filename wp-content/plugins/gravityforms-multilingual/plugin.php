<?php
/*
Plugin Name: Gravity Forms Multilingual
Plugin URI: http://wpml.org/documentation/related-projects/gravity-forms-multilingual/
Description: Add multilingual support for Gravity Forms
Author: OnTheGoSystems
Author URI: http://www.onthegosystems.com/
Version: 1.3.6
Plugin Slug: gravityforms-multilingual
*/

if ( defined( 'GRAVITYFORMS_MULTILINGUAL_VERSION' ) ) {
	return;
}

define( 'GRAVITYFORMS_MULTILINGUAL_VERSION', '1.3.6' );
define( 'GRAVITYFORMS_MULTILINGUAL_PATH', dirname( __FILE__ ) );

require_once 'embedded/wpml/commons/autoloader.php';
$wpml_auto_loader_instance = WPML_Auto_Loader::get_instance();
$wpml_auto_loader_instance->register( GRAVITYFORMS_MULTILINGUAL_PATH . '/' );

add_action( 'wpml_gfml_has_requirements', 'load_gfml' );

new WPML_GFML_Requirements();

function load_gfml() {
	if ( defined( 'ICL_SITEPRESS_VERSION' ) ) {
		require GRAVITYFORMS_MULTILINGUAL_PATH . '/inc/wpml-dependencies-check/wpml-bundle-check.class.php';
		require GRAVITYFORMS_MULTILINGUAL_PATH . '/inc/gfml-string-name-helper.class.php';
		require GRAVITYFORMS_MULTILINGUAL_PATH . '/inc/gravity-forms-multilingual.class.php';

		if ( version_compare( ICL_SITEPRESS_VERSION, '3.2', '<' ) ) {
			require GRAVITYFORMS_MULTILINGUAL_PATH . '/inc/gfml-tm-legacy-api.class.php';
			$GLOBALS['wpml_gfml_tm_api'] = new GFML_TM_Legacy_API();
		} else {
			require GRAVITYFORMS_MULTILINGUAL_PATH . '/inc/gfml-tm-api.class.php';
			$GLOBALS['wpml_gfml_tm_api'] = new GFML_TM_API();
		}
		do_action( 'wpml_gfml_tm_api_loaded', $GLOBALS['wpml_gfml_tm_api'] );
	}
}

// Disable the normal wpml admin language switcher for gravity forms.
function gfml_disable_wpml_admin_lang_switcher($state)
{
	global $pagenow;

	if ($pagenow == 'admin.php' && isset($_GET['page']) &&
		$_GET['page'] == 'gf_edit_forms') {

		$state = false;
	}

	return $state;
}
add_filter('wpml_show_admin_language_switcher', 'gfml_disable_wpml_admin_lang_switcher');
