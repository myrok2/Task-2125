<?php

/*
 * This prevents excessive display of the user avatar which causes
 * WP User Avatar to break the site on Pantheon for some sad reason
 * https://352inc.atlassian.net/browse/AA-1038
 */

// Disabled WP User Avatar filter when browsing in the admin
add_action('wp_loaded', function () {
	global $wpua_functions;
	if (is_admin()) {
		remove_filter( 'get_avatar', array( $wpua_functions, 'wpua_get_avatar_filter') );
	}
}, 999 );