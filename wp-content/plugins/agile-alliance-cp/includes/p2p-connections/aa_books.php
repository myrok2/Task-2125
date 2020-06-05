<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to Books
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Book Authors
 */
function book_authors() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_book_author',
		'from'           => 'user',
		'to'             => 'aa_book',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Author of Book',
		),
		'to_labels'      => array(
			'column_title' => 'Author(s)',
		),
		'title'          => array(
			'from' => __( 'Books'),//Displayed on 'from' connection
			'to' => __('Authors')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'book_authors' );