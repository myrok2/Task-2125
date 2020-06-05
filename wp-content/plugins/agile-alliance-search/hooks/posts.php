<?php
namespace aa\search\hooks\posts;
use aa\search\config;
use aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchPostHooks {
	function __construct($indexer) {
		$this->index = $indexer;
		$this->register_hooks();
	}
	function register_hooks() {
		//add_action('wp_ajax_esreindex', array(&$this, 'reindex'));
		//add_action('wp_ajax_esswap', array(&$this, 'swap'));
		add_action('save_post', array(&$this, 'save_post'));
		add_action('delete_post', array(&$this, 'delete_post'));
		add_action('trash_post', array(&$this, 'delete_post'));
		add_action('transition_post_status', array(&$this, 'transition_post'), 10, 3);
	}
	function save_post($post_id) {
		if (is_object($post_id)) {
			$post = $post_id;
		} else {
			$post = get_post($post_id);
		}
		// Exclude post types not defined in `config.php`
		if ($post == null || !in_array($post->post_type, config\allowed_post_types())) {
			return;
		}
		$is_allowed_post_status = in_array($post->post_status, config\allowed_post_statuses());
		$is_indexable = !get_field('aa_search_excluded', $post->ID);
		if ($is_allowed_post_status && $is_indexable) {
			$doc = document\init_object($post->post_type, $post);
			$this->index->upsert('resource', $doc->extract_document());
		} else {
			// @TODO: Prevent redundant deletes on autosave, drafts, etc
			$this->index->delete('resource', $post->ID);
		}
	}
	function transition_post($new_status, $old_status, $post) {
		if ($post == null || !in_array($post->post_type, config\allowed_post_types())) {
			return;
		}
		$was_allowed_status = in_array($old_status, config\allowed_post_statuses());
		$leaving_allowed_status = !in_array($new_status, config\allowed_post_statuses());
		if ($was_allowed_status && $leaving_allowed_status) {
			$this->index->delete('resource', $post->ID);
		}
	}
	function delete_post($post_id) {
		if (is_object($post_id)) {
			$post = $post_id;
		} else {
			$post = get_post($post_id);
		}
		if ($post == null || !in_array($post->post_type, config\allowed_post_types())) {
			return;
		}
		$this->index->delete('resource', $post->ID);
	}
}