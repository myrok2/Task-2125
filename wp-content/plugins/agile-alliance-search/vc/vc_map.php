<?php
namespace aa\search;
use aa\search\config;

add_action('vc_before_init', function () {

	$params = array(
		array(
			'type' => 'checkbox',
			'holder' => 'div',
			'class' => 'aa-search-admin__post_types',
			'edit_field_class' => 'aa-search-admin__three-col-checkboxes',
			'heading' => 'Post Types',
			'param_name' => 'filter_post_type',
			'group' => 'Filter Output',
			'value' => array_merge([
				'User Filterable' => 'allow_user_filter' // Should post type be filterable by user?
			], array_reduce(config\allowed_post_types(), function($carry, $post_type) {
				$post_type_object = get_post_type_object( $post_type );
				if ($post_type_object) {
					$carry[$post_type_object->label] = $post_type;
				} else {
					$carry[$post_type] = $post_type;
				}
				return $carry;
			}, [])),
			'description' => 'Filter the available post types that can be displayed'
		),
		array(
			'type' => 'checkbox',
			'holder' => 'div',
			'class' => 'aa-search-admin__allow-permission-level-filter',
			'edit_field_class' => 'aa-search-admin__filter aa-search-admin__three-col-checkboxes',
			'heading' => 'Permission Level Filter',
			'param_name' => 'filter_access_level',
			'group' => 'Filter Output',
			'value' => [
				'User Filterable' => 'allow_user_filter',
				'Public' => 'Public',
				'Subscriber' => 'Subscriber',
				'Member' => 'Member'
			],
			'description' => 'Allow user to filter by the S2 permission level for each document.'
		),
		array(
			'type' => 'textfield',
			'holder' => 'div',
			'class' => 'aa-search-admin__initial-query',
			'edit_field_class' => '',
			'heading' => 'Initial Search Query',
			'param_name' => 'initial_query',
			'group' => 'User Interface',
			'description' => 'Pre-populate the text search field with a value'
		),
		array(
			'type' => 'textfield',
			'holder' => 'div',
			'class' => 'aa-search-admin__max-pages',
			'edit_field_class' => '',
			'heading' => 'Maximum Number of Pages',
			'param_name' => 'max_pages',
			'group' => 'User Interface',
			'description' => 'Enforce a maximum number of possible pages to be returned'
		),
        array(
            'type' => 'checkbox',
            'holder' => 'div',
            'class' => 'aa-search-admin__display-infinite-scroll',
            'edit_field_class' => '',
            'heading' => 'Enable Infinite Scroll',
            'param_name' => 'enable_infinite_scroll',
            'group' => 'User Interface',
            'value' => [
                'Enable' => true,
            ],
            'description' => 'Removes pagination and adds infinite scroll'
        ),
		array(
			'type' => 'checkbox',
			'holder' => 'div',
			'class' => 'aa-search-admin__display-text-search',
			'edit_field_class' => '',
			'heading' => 'Text Search',
			'param_name' => 'enable_text_search',
			'group' => 'User Interface',
			'value' => [
				'Enable' => true,
			],
			'description' => 'Allow user to enter search text'
		),
		array(
			'type' => 'dropdown',
			'holder' => 'div',
			'class' => 'aa-search-admin__sort-option',
			'edit_field_class' => '',
			'heading' => 'Sort By...',
			'param_name' => 'sort',
			'group' => 'User Interface',
			'value' => [
//				'Relevance' => 0,
				'Select Option' => '',
				'Name' => 'name.sort',
				'Published Date' => 'createdDate',
			],
			'description' => 'Define the default sort of the results displayed to the user'
		),
		array(
			'type' => 'dropdown',
			'holder' => 'div',
			'class' => 'aa-search-admin__sort-direction',
			'edit_field_class' => '',
			'heading' => 'Sort Direction',
			'param_name' => 'sort_direction',
			'group' => 'User Interface',
			'value' => [
				'Select Option' => '',
				'Ascending' => 'asc',
				'Descending' => 'desc',
			],
			'description' => 'Define the default sort order of the results displayed to the user'
		),
	);

	/*
	 * Adds a config section for each taxonomy associated with the allowed post
	 * types.
	 */
	foreach(config\allowed_taxonomies() as $taxonomy_name => $taxonomy_data) {
		$params[] = array(
				'type' => 'checkbox',
				'holder' => 'div',
				'class' => "aa-search-admin__{$taxonomy_name}",
				'edit_field_class' => 'aa-search-admin__filter aa-search-admin__three-col-checkboxes',
				'heading' => $taxonomy_data['label'],
				'param_name' => "filter_{$taxonomy_name}",
				'group' => 'Filter Output',
				'value' => ['User Filterable' => 'allow_user_filter']
				           + array_combine($taxonomy_data['terms'], $taxonomy_data['terms']),
				'description' => 'Filter the available terms that can be displayed'
			);
	}

	vc_map(array(
		'name' => 'Custom Search',
		'base' => 'aa_search',
		'class' => '',
		'category' => 'Agile Alliance Components',
		'admin_enqueue_js' => array(
			plugin_dir_url(__FILE__) . 'aa-search-admin-vc.js',
		),
		'admin_enqueue_css' => array(
			plugin_dir_url(__FILE__) . 'aa-search-admin-vc.css',
		),
		'params' => $params
	));
});
