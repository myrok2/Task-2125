<?php
/*
 * GilidPanel Enqueue Scripts and Style
 * Sept. 24, 2013
 */

function gldpnl_scripts_method() {
	wp_enqueue_style( 'gilidPanel-css', GLDPNL_STYLES . '/gilid.panel.css', array(), null );
	wp_enqueue_style( 'nanoscroller-css', GLDPNL_STYLES . '/nanoscroller.css', array(), null );
	$fonts = array();
		if(isset(gldpnl_fontsOption()->general)){
			$fonts[] = gldpnl_fontsOption()->general;
		}
		if(isset(gldpnl_fontsOption()->headings)){
			$fonts[] = gldpnl_fontsOption()->headings;
		}
		if(isset(gldpnl_fontsOption()->nav)){
			$fonts[] = gldpnl_fontsOption()->nav;
		}
	$fonts = array_unique($fonts);

	foreach ($fonts as $key => $value) {
		if(!empty($value)){
			$googlefont = str_replace('-', '+', $value);
			wp_enqueue_style( 'gilidPanel-'. $key .'-css', 'http://fonts.googleapis.com/css?family=' . $googlefont . ':300italic,400italic,600italic,700italic,400,600,700,300', array(), null );
		}
	}

	wp_register_script(
		'gilidPanel-js',
		GLDPNL_SCRIPTS . '/jquery.gilid.js',
		array( 'jquery' ),
		'',
		true
	);
	wp_register_script(
		'easing',
		GLDPNL_SCRIPTS . '/jquery.easing.1.3.js',
		array( 'jquery' ),
		'',
		true
	);
	wp_register_script(
		'nanoscroller',
		GLDPNL_SCRIPTS . '/jquery.nanoscroller.min.js',
		array( 'jquery' ),
		'',
		true
	);

	wp_enqueue_script('easing');
	wp_enqueue_script('nanoscroller');
	wp_enqueue_script('gilidPanel-js');
}

add_action( 'wp_enqueue_scripts', 'gldpnl_scripts_method' );
?>