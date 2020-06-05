<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Connect resources to the Videos Directory
 * Avoid using from/to arrays - it can cause big issues down the road.
 * TODO: This can use default p2p_connected shortcode for now - however to match design a custom query will be made to include users title.
 */

/*
 * Videos to Event Sessions
 */
function users_posts() {
    p2p_register_connection_type( array(
        'name'           => 'user_to_post',
        'from'           => 'user',
        'to'             => 'post',
        'reciprocal'     => true,
        'sortable'   => 'any',
        'admin_column' => 'any',
        'admin_box'      => array(
            'show'    => 'any',
            'context' => 'side' // side or advanced(below)
        ),
        'from_labels'    => array(
            'column_title' => 'Posts',
        ),
        'to_labels'      => array(
            'column_title' => 'Additional Author(s)',
        ),
        'title'          => array(
            'from' => __( 'Posts'),//Displayed on 'from' connection
            'to' => __('Additional Authors')//Displayed on 'to' connection
        ),
    ) );
}
add_action( 'p2p_init', 'users_posts' );
