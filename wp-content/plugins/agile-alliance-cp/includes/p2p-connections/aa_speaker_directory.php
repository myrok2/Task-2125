<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect resources to the Speaker Directory
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Speaker Directory Item Presenter
 */
function speaker_item_presenter() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_speaker_directory_presenter',
		'from'           => 'user',
		'to'             => 'aa_speaker_directory',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Presentation Speaker',
		),
		'to_labels'      => array(
			'column_title' => 'Presenter(s);',
		),
		'title'          => array(
			'from' => __( 'Speaker Directory Items'),//Displayed on 'from' connection
			'to' => __('Presenters')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		)
	) );
}
add_action( 'p2p_init', 'speaker_item_presenter' );