<?php
namespace aa\search;
use aa\search\{config};
use function Paradigm\Concepts\Functional\{reduce};

add_shortcode('aa_search', function($params) {

    $client_base = plugin_dir_path(__FILE__) . 'client/dist';
    $manifest_string = file_get_contents("$client_base/manifest.json");
    $client_manifest = $manifest_string ? json_decode($manifest_string, true) : false;
    $client_base_uri = plugin_dir_url(__FILE__) . 'client/dist';

	$param_defaults = array(
		// 'arg' => 'value', // Given `[aa_search arg="value"]`, $params['arg'] is available
		'initial_query' => '',
		'enable_text_search' => false,
		'max_pages' => false,
		'filter_post_type' => '',
		'filter_access_level' => '',
		'sort' => false,
		'sort_direction' => 'asc',
        'enable_infinite_scroll' => false,
	);

	$allowed_taxonomies = config\allowed_taxonomies();

	// This is passed directly to the client, it's getting mutated below just to avoid iterating same array twice.
	$client_taxonomy_data = [
		'permissionLevel' => [
			'label' => 'Membership Level',
			'terms' => [
				'Public',
				'Subscriber',
				'Member',
			],
		],
	];

	// This reduce has too purposes:
	// 1) Populate $client_taxonomy_data to be passed to the client
	// 2) Set a default value for each possible filter option
	$param_defaults_with_taxonomies = reduce($allowed_taxonomies, function($carry, $taxonomy_data, $taxonomy_name) use (&$client_taxonomy_data) {

		// Passed to the client
		$client_taxonomy_data[config\mapParamToIndexName("filter_{$taxonomy_name}")] = $taxonomy_data;

		// Default value for params
		$carry["filter_{$taxonomy_name}"] = '';
		return $carry;
	}, $param_defaults);

	$params = shortcode_atts($param_defaults_with_taxonomies, $params, 'aa_search');

	if (!AA_SEARCH_DEVELOPMENT) {

		if (!$client_manifest) {
			return 'No client manifest found.';
		}

		wp_enqueue_style(
			'aa_search',
			"$client_base_uri/{$client_manifest['app.css']}",
			[]);

		wp_enqueue_script(
			'aa_search/manifest',
			"$client_base_uri/{$client_manifest['manifest.js']}",
			[]);

		wp_enqueue_script(
			'aa_search/app',
			"$client_base_uri/{$client_manifest['app.js']}",
			['aa_search/manifest']);

	} else {

		wp_enqueue_script(
			'aa_search/app',
			'http://localhost:8080/app.js',
			[]);

	}

	// A map of all post types to use in the frontend UI
	$post_types = array_map('get_post_type_object', config\allowed_post_types());
	$post_type_labels = array_reduce($post_types, function($carry, $post_type) {
		$carry[$post_type->name] = [
			'name' => $post_type->labels->name,
			'singular_name' => $post_type->labels->singular_name,
		];
		return $carry;
	}, []);

	$user_filterable = []; // Mutated by the reduce function below because of laziness
	$active_filters = reduce($params, function($carry, $param_value, $param_name) use (&$user_filterable) {
		// Only include params that start with filter and have a value
		if (0 === strpos($param_name, 'filter_') && strlen($param_value) > 0) {
			$mapped_param_name = config\mapParamToIndexName($param_name);
			// Expand shortcode parameter value from VC into an array
			$filters = explode(',', $param_value);
			// Add the active filters (sans `allow_user_filter`) to the config array
			$carry[$mapped_param_name] = (array) array_diff($filters, ['allow_user_filter']);
			if(in_array('allow_user_filter', $filters)) {
				$user_filterable[] = $mapped_param_name;
			}
		}
		return $carry;
	}, []);

	// Pass params to global JS variable `aaSearch`
	wp_localize_script('aa_search/app', 'aaSearch', [
		'indexHost' => plugin_dir_url(__FILE__) . 'query.php',
		'adminAjax' => [
			'url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('aa_search_auth_nonce')
		],
		'debugMode' => AA_SEARCH_DEVELOPMENT,
		'postTypeLabels' => $post_type_labels,
		'taxonomies' => $client_taxonomy_data,
		'query' => [
			'initialQuery' => $params['initial_query'],
			'filters' => $active_filters,
			'sort' => $params['sort'],
			'sortDirection' => $params['sort_direction'],
		],
		'ui' => [
			'displayTextSearch' => filter_var($params['enable_text_search'], FILTER_VALIDATE_BOOLEAN),
            'displayInfiniteScroll' => filter_var($params['enable_infinite_scroll'], FILTER_VALIDATE_BOOLEAN),
			'maxPages' => $params['max_pages'],
			'filters' => $user_filterable,
		],
	]);

	return '<div id="aa-search"></div>';

});

/**
 * Just a generic display of the search utility to be used in page templates
 * @param {string} $options Options to be passed to shortcode
 */
function displayAASearch($options = []) {
	$defaults = [
		'enable_text_search' => true,
        'enable_infinite_scroll' => false,
		'filter_post_type' => 'allow_user_filter',
		'filter_category' => 'allow_user_filter',
	];
	$params = array_replace_recursive($defaults, $options);
	$param_array = reduce($params, function($carry, $value, $key) {
		$carry[] = "$key='$value'";
		return $carry;
	}, []);
	$param_string = implode(' ', $param_array);
	echo do_shortcode("[aa_search $param_string]");
}
