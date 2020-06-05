<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Research Papers
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Research Paper Authors
 */
function research_paper_authors() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_research_paper_author',
		'from'           => 'user',
		'to'             => 'aa_research_paper',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Author of Research Paper',
		),
		'to_labels'      => array(
			'column_title' => 'Research Paper Author(s)',
		),
		'title'          => array(
			'from' => __( 'Research Papers'),//Displayed on 'from' connection
			'to' => __('Authors')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'research_paper_authors' );