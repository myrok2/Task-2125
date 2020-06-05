<?php
namespace aa\search\hooks\template_include;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

const SEARCH_TEMPLATE = AA_SEARCH_PLUGIN_DIR . '/templates/search.php';
const ARCHIVE_TEMPLATE = AA_SEARCH_PLUGIN_DIR . '/templates/archive.php';

class AASearchTemplateInclude {
	function __construct($options) {
		$this->options = $options;
		$this->register_hooks();
	}
	function register_hooks() {
		if ($this->options['replace_search']) {
			add_filter('template_include', [$this, 'replace_search']);
		}
		if ($this->options['replace_archive']) {
			add_filter('template_include', [$this, 'replace_archive']);
		}
	}
	function replace_search($template) {
		global $wp_query;
		if (!$wp_query->is_search) {
			return $template;
		}
        return SEARCH_TEMPLATE;
	}
	function replace_archive($template) {
		global $wp_query;
		if ($wp_query->is_archive && !$wp_query->is_author) {
			return ARCHIVE_TEMPLATE;
		}
		return $template;
	}
}