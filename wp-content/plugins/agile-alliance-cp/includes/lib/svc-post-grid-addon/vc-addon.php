<?php

/**
 * Plugin Name: Visual Composer - Post Layout with Carousel
 * Description: This plugin makes post Grid/List addon with Carousel.
 * Version: 1.5
 * Author: Hitesh Khunt
 * Author URI: http://www.saragna.com/Hitesh-Khunt
 * Plugin URI: http://plugin.saragna.com/vc-addon
 * License: GPLv2 or later
 * Text Domain: svc-post-layout
 * 
 */

$svgrVersion = "1.5";

$currentFile = __FILE__;

$currentFolder = dirname($currentFile);

add_action('admin_init','svc_post_Init_Addon');
require_once( 'inc/add-param.php' );
require_once( 'inc/all_function.php' );
require_once( 'addons/post-grid/post-grid.php' );

////wp_enqueue_style( 'svc-fontawosem-css', plugins_url( ltrim( 'assets/css/font-awesome.min.css', '/' ), __FILE__ ), array(), '' );
//if(is_admin()){
//	//wp_enqueue_style( 'svc-admin-css', plugins_url( ltrim( 'assets/css/admin.css', '/' ), __FILE__ ), array(), '' );
//}
//if(!is_admin()){
//	//wp_enqueue_style( 'svc-front-css', plugins_url( ltrim( 'assets/css/front.css', '/' ), __FILE__ ), array(), '' );
//}


function svc_post_Init_Addon() {
	$required_vc 	= '3.9.9';
	if (defined('WPB_VC_VERSION')){
		if (version_compare($required_vc, WPB_VC_VERSION, '>')) {
			add_action('admin_notices', 'svc_post_Admin_Notice_Version');
		}
	}else{
		add_action('admin_notices', 'svc_post_Admin_Notice_Activation');
	}
}
function svc_post_Admin_Notice_Version() {
		echo '<div class="updated"><p>The <strong>Visual Composer Post Layout</strong> add-on requires <strong>Visual Composer</strong> version 4.0.0 or greater.</p></div>';	
	}
function svc_post_Admin_Notice_Activation() {
	echo '<div class="updated"><p>The <strong>Visual Composer Post Layout</strong> add-on requires the <strong>Visual Composer</strong> Plugin installed and activated.</p></div>';
}
?>