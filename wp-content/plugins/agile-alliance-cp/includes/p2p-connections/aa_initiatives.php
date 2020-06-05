<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Initiatives
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Initiative Posts
 */
function posts_to_initiative() {
	p2p_register_connection_type( array(
		'name'           => 'posts_to_initiative',
		'from'           => 'post',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Initiative',
		),
		'to_labels'      => array(
			'column_title' => 'Post(s)',
		),
		'admin_dropdown' => false,
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Posts')
		),
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'posts_to_initiative' );

/*
 * Initiative Directors
 */
function initiative_directors() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_initiative_director',
		'from'           => 'user',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Director of Initiative',
		),
		'to_labels'      => array(
			'column_title' => 'Director(s)',
		),
		'admin_dropdown' => false,
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Directors')
		),
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_directors' );

/*
 * Initiative Co-Chairs
 */
function initiative_co_chairs() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_initiative_chair',
		'from'           => 'user',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Co-Chair of Initiative',
		),
		'to_labels'      => array(
			'column_title' => 'Co-Chair(s)',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Co-Chairs')
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_co_chairs' );

/*
 * Initiative Participants
 */
function initiative_participants() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_initiative_participant',
		'from'           => 'user',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'admin_dropdown' => false,
		'from_labels'    => array(
			'column_title' => 'Participant of Initiative',
		),
		'to_labels'      => array(
			'column_title' => 'Participant(s)',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Participants')
		),
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_participants' );


/*
 * Initiative Books
 */
function initiative_books() {
	p2p_register_connection_type( array(
		'name'           => 'book_to_initiative',
		'from'           => 'aa_book',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Initiative(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Book(s)',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Books')
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_books' );


/*
 * Initiative Event Sessions
 */
//function initiative_eventsessions() {
//	p2p_register_connection_type( array(
//		'name'           => 'event_session_to_initiative',
//		'from'           => 'aa_event_session',
//		'to'             => 'aa_initiative',
//		'reciprocal'     => true,
//		'sortable'   => 'any',
//		'admin_column'   => 'any',
//		'from_labels'    => array(
//			'column_title' => 'Initiative(s)',
//		),
//		'to_labels'      => array(
//			'column_title' => 'Event Session(s)',
//		),
//		'title'          => array(
//			'from' => __( 'Initiatives'),
//			'to' => __('Event Sessions')
//		),
//		'admin_dropdown' => true,
//		'admin_box'      => array(
//			'show'    => 'any',
//			'context' => 'side' // side or advanced(below)
//		)
//	) );
//}
//add_action( 'p2p_init', 'initiative_eventsessions' );

/*
 * Initiative Organizations
 */
function initiative_organizations() {
	p2p_register_connection_type( array(
		'name'           => 'organization_to_initiative',
		'from'           => 'aa_organizations',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Initiative(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Organization(s)',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Organizations')
		),
		'admin_dropdown' => true,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_organizations' );


/*
 * Initiative Sponsors
 * Deprecated
 */
//function initiative_sponsors() {
//	p2p_register_connection_type( array(
//		'name'           => 'sponsor_to_initiative',
//		'from'           => 'aa_sponsor',
//		'to'             => 'aa_initiative',
//		'reciprocal'     => true,
//		'sortable'   => 'any',
//		'admin_column'   => 'any',
//		'from_labels'    => array(
//			'column_title' => 'Initiative(s)',
//		),
//		'to_labels'      => array(
//			'column_title' => 'Sponsor(s)',
//		),
//		'title'          => array(
//			'from' => __( 'Initiatives'),
//			'to' => __('Sponsors')
//		),
//		'admin_dropdown' => true,
//		'admin_box'      => array(
//			'show'    => 'any',
//			'context' => 'side' // side or advanced(below)
//		)
//	) );
//}
//add_action( 'p2p_init', 'initiative_sponsors' );

/*
 * Initiative Stories
 */
function initiative_stories() {
	p2p_register_connection_type( array(
		'name'           => 'story_to_initiative',
		'from'           => 'aa_story',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Initiative(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Stories',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),//Displayed on 'from' connection
			'to' => __('Stories')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_stories' );

/*
 * Initiative Videos
 */
function initiative_videos() {
	p2p_register_connection_type( array(
		'name'           => 'video_to_initiative',
		'from'           => 'aa_video',
		'to'             => 'aa_initiative',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Initiative(s)',
		),
		'to_labels'      => array(
			'column_title' => 'Video(s)',
		),
		'title'          => array(
			'from' => __( 'Initiatives'),
			'to' => __('Videos')
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'initiative_videos' );
