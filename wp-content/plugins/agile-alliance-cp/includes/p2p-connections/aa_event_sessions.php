<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Event Sessions
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Event Session Featured Presenters
 *  - Displayed in right hand-side
 */
function event_session_featured_presenter() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_event_session_featured_presenter',
		'from'           => 'user',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Featured Presenter of Session',
		),
		'to_labels'      => array(
			'column_title' => 'Featured Presenter',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
			'to' => __('Featured Presenters')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'event_session_featured_presenter' );

/*
 * Event Session Presenters
 *  - Displayed in bottom resource area
 */
function event_session_presenter() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_event_session_presenter',
		'from'           => 'user',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Presenter of Session',
		),
		'to_labels'      => array(
			'column_title' => 'Presenter(s)',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
			'to' => __('Presenters')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'event_session_presenter' );


/*
 * Event Session Events
 */
function event_session_events() {
	p2p_register_connection_type( array(
		'name'           => 'event_to_event_session',
		'from'           => 'event',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Session of Event',
		),
		'to_labels'      => array(
			'column_title' => 'Event Session(s)',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
			'to' => __('Events')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'event_session_events' );

/*
 * Event Session Venues
 */
//function event_session_venues() {
//	p2p_register_connection_type( array(
//		'name'           => 'venue_to_event_session',
//		'from'           => 'venue',
//		'to'             => 'aa_event_session',
//		'reciprocal'     => true,
//		'sortable'   => 'any',
//		'admin_column'   => 'any',
//		'from_labels'    => array(
//			'column_title' => 'Session Venue(s)',
//		),
//		'to_labels'      => array(
//			'column_title' => 'Event Session Venue(s)',
//		),
//		'title'          => array(
//			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
//			'to' => __('Venues')//Displayed on 'to' connection
//		),
//		'admin_dropdown' => false,
//		'admin_box'      => array(
//			'show'    => 'any',
//			'context' => 'side' // side or advanced(below)
//		)
//	) );
//}
//add_action( 'p2p_init', 'event_session_venues' );


/*
 * Event Session Experience Reports
 */
function event_session_expreport() {
	p2p_register_connection_type( array(
		'name'           => 'experience_report_to_event_session',
		'from'           => 'aa_experience_report',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Event Session(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Experience Report(s)',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
			'to' => __('Experience Reports')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'event_session_expreport' );

/*
 * Event Session Experience Reports
 */
function event_session_research_paper() {
	p2p_register_connection_type( array(
		'name'           => 'research_paper_to_event_session',
		'from'           => 'aa_research_paper',
		'to'             => 'aa_event_session',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Event Session(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Research Paper(s)',
		),
		'title'          => array(
			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
			'to' => __('Research Papers')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'event_session_research_paper' );

/*
 * Event Session Speaker Directory Items
 */
//function speaker_directory_item_to_event_session() {
//	p2p_register_connection_type( array(
//		'name'           => 'speaker_directory_item_to_event_session',
//		'from'           => 'aa_speaker_directory',
//		'to'             => 'aa_event_session',
//		'reciprocal'     => true,
//		'sortable'   => 'any',
//		'admin_column'   => 'any',
//		'from_labels'    => array(
//			'column_title' => 'Event Session(s)',
//		),
//		'to_labels'      => array(
//			'column_title' => 'Speaker Directory Item(s)',
//		),
//		'title'          => array(
//			'from' => __( 'Event Sessions'),//Displayed on 'from' connection
//			'to' => __('Speaker Directory Items')//Displayed on 'to' connection
//		),
//		'admin_dropdown' => false,
//		'admin_box'      => array(
//			'show'    => 'any',
//			'context' => 'side' // side or advanced(below)
//		)
//	) );
//}
//add_action( 'p2p_init', 'speaker_directory_item_to_event_session' );