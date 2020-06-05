<?php
namespace aa\search\admin;
use aa\search\config;

if( function_exists('acf_add_local_field_group') ):

	$allowed_post_types = array_map(function($post_type) {
		return array (
			array (
				'param' => 'post_type',
				'operator' => '==',
				'value' => $post_type,
			),
			array (
				'param' => 'current_user_role',
				'operator' => '==',
				'value' => 'administrator',
			),
		);
	}, config\allowed_post_types());

	acf_add_local_field_group(array (
		'key' => 'group_58f65710c8ac1',
		'title' => 'Custom Search',
		'fields' => array (
			array (
				'key' => 'field_58f657351dbd0',
				'label' => 'Exclude from Site Search',
				'name' => 'aa_search_excluded',
				'type' => 'true_false',
				'instructions' => 'Prevent this content from appearing in the site search, resource grid, and archive listings.',
				'required' => 0,
				'conditional_logic' => 0,
				'wrapper' => array (
					'width' => '',
					'class' => '',
					'id' => '',
				),
				'message' => '',
				'default_value' => 0,
				'ui' => 1,
				'ui_on_text' => 'Excluded',
				'ui_off_text' => 'Visible',
			),
		),
		'location' => $allowed_post_types,
		'menu_order' => PHP_INT_MAX, //needs to be last or overrides visibility of standard fields like content.
		'position' => 'side',
		'style' => 'default',
		'label_placement' => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen' => '',
		'active' => 1,
		'description' => '',
	));

endif;
