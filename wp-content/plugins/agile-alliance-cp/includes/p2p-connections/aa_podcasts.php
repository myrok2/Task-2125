<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to the Podcasts Directory
 * Avoid using from/to arrays - it can cause big issues down the road.
 * TODO: This can use default p2p_connected shortcode for now - however to match design a custom query will be made to include users title.
 */

/*
 * Podcast Speakers
 */
function podcast_speakers() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_podcast_speaker',
		'from'           => 'user',
		'to'             => 'aa_podcast',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Podcast Speaker',
		),
		'to_labels'      => array(
			'column_title' => 'Podcast Speaker(s)',
		),
		'title'          => array(
			'from' => __( 'Podcasts'),//Displayed on 'from' connection
			'to' => __('Speakers')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'podcast_speakers' );
