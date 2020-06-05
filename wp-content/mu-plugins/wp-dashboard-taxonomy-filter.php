<?php

$source_taxonomy_name = 'content_source';

/**
 * Display a custom taxonomy dropdown in admin
 * @author Mike Hemberger
 * @link http://thestizmedia.com/custom-post-type-filter-admin-custom-taxonomy/
 */
add_action('restrict_manage_posts', function() use ($source_taxonomy_name) {
	global $typenow;
	if (in_array($typenow, AA_SOURCE_TAXONOMY_POST_TYPES)) {
		$selected      = isset($_GET[$source_taxonomy_name]) ? $_GET[$source_taxonomy_name] : '';
		$info_taxonomy = get_taxonomy($source_taxonomy_name);
		wp_dropdown_categories(array(
			'show_option_all' => __("Show All {$info_taxonomy->label}"),
			'taxonomy'        => $source_taxonomy_name,
			'name'            => $source_taxonomy_name,
			'orderby'         => 'name',
			'selected'        => $selected,
			'show_count'      => false,
			'hide_empty'      => true,
		));
	};
});

/**
 * Filter posts by taxonomy in admin
 * @author  Mike Hemberger
 * @link http://thestizmedia.com/custom-post-type-filter-admin-custom-taxonomy/
 */
add_filter('parse_query', function($query) use ($source_taxonomy_name) {
	global $pagenow;
	$q_vars    = &$query->query_vars;
	if ( $pagenow == 'edit.php' && isset($q_vars['post_type']) && in_array($q_vars['post_type'], AA_SOURCE_TAXONOMY_POST_TYPES) && isset($q_vars[$source_taxonomy_name]) && is_numeric($q_vars[$source_taxonomy_name]) && $q_vars[$source_taxonomy_name] != 0 ) {
		$term = get_term_by('id', $q_vars[$source_taxonomy_name], $source_taxonomy_name);
		$q_vars[$source_taxonomy_name] = $term->slug;
	}
});