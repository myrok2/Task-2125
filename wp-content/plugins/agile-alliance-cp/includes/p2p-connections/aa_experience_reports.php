<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Experience Reports
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Experience Report Authors
 */
function experience_report_authors() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_experience_report_author',
		'from'           => 'user',
		'to'             => 'aa_experience_report',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Author of Experience Report',
		),
		'to_labels'      => array(
			'column_title' => 'Experience Report Author(s)',
		),
		'title'          => array(
			'from' => __( 'Experience Reports'),//Displayed on 'from' connection
			'to' => __('Authors')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'experience_report_authors' );