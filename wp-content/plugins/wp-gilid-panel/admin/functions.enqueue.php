<?php
/*
 * GilidPanel Enqueue Scripts and Style for Admin Settings
 */

function load_gldpnl_admin_scripts($hook) {
	
	if( 'settings_page_gldpnl_plugin_options' == $hook ){
		wp_enqueue_media();
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script('wp-color-picker');
		
		wp_enqueue_script(
			'gilidPanel-js',
			GLDPNL_SCRIPTS . '/admin.js',
			array( 'jquery' ),
			'',
			true
		);
	}
}
add_action( 'admin_enqueue_scripts', 'load_gldpnl_admin_scripts' );

?>