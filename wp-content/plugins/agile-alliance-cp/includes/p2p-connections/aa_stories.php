<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Stories
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Story/Stories Authors
 */
function story_authors() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_story_author',
		'from'           => 'user',
		'to'             => 'aa_story',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Author of Story',
		),
		'to_labels'      => array(
			'column_title' => 'Author(s)',
		),
		'title'          => array(
			'from' => __( 'Stories'),//Displayed on 'from' connection
			'to' => __('Authors')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'story_authors' );