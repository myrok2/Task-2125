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
 * Video Speakers
 */
function video_speakers() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_video_speaker',
		'from'           => 'user',
		'to'             => 'aa_video',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Video Speaker',
		),
		'to_labels'      => array(
			'column_title' => 'Video Speaker(s)',
		),
		'title'          => array(
			'from' => __( 'Videos'),//Displayed on 'from' connection
			'to' => __('Speakers')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'video_speakers' );

/*
 * Videos to Event Sessions
 */
function videos_eventsessions() {
	p2p_register_connection_type( array(
		'name'           => 'video_to_event_session',
		'from'           => 'aa_video',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Event Sessions',
		),
		'to_labels'      => array(
			'column_title' => 'Videos',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),
			'to' => __('Videos')
		),
		'admin_dropdown' => true,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'videos_eventsessions' );