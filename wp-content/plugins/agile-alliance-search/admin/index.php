<?php
namespace aa\search\admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require 'admin-options.php';
require 'ajax.php';
require 'admin-image-sizes.php';
require 'admin-acf-exclude-option.php';

add_action('admin_enqueue_scripts', function ($hook) {
	if ( 'settings_page_aa-search' != $hook ) {
		return;
	}

	wp_enqueue_script(
		'admin-aa-search',
		plugin_dir_url(__FILE__) . '/admin-aa-search.js'
	);
});