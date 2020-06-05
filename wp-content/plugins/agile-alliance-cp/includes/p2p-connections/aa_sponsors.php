<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect Sponsors to an Event
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Sponsors of an Event
 *  - Displayed in right hand-side
 */

function sponsors_to_events() {
	p2p_register_connection_type( array(
		'name'           => 'aa_sponsor_to_event',
		'from'           => 'aa_sponsor',
		'to'             => 'event',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Event(s) Sponsored',
		),
		'to_labels'      => array(
			'column_title' => 'Event Sponsor(s)',
		),
		'title'          => array(
			'from' => __( 'Events Sponsored'),//Displayed on 'from' connection
			'to' => __('Event Sponsors')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'sponsors_to_events' );