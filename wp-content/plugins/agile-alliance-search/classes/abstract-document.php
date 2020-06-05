<?php
namespace aa\search\document;

use aa\search\helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class AASearchDocument {
	public $document;
	public $post_meta;
	function __construct($document) {
		$this->document = $document;
	}
	private function meta() {
		if ($this->post_meta == null) {
			$this->post_meta = get_post_meta($this->get_id());
		}
		return $this->post_meta;
	}
	function get_id() {
		return $this->document->ID;
	}
	function get_type() {
		return $this->document->post_type;
	}
	function get_name() {
		if (array_key_exists('_aioseop_title', $this->meta())) {
			$name = head($this->meta()['_aioseop_title']);
		} else {
			$name = $this->document->post_title;
		}
		return $name;
	}
	function get_created_date() {
		return $this->document->post_date;
	}
	function get_short_description() {
		if (array_key_exists('_aioseop_description', $this->meta())) {
			$short_text = head($this->meta()['_aioseop_description']);
		} else {
			$short_text = $this->document->post_excerpt;
		}
		return $this->sanitize_content_string($short_text);
	}
	function get_long_description() {
		return $this->sanitize_content_string($this->document->post_content);
	}
	function get_related_users() {
		$author = get_user_by('id', $this->document->post_author);
		return [
			$author->display_name,
		];
	}
	function get_related_documents() {
		return [];
	}
	function get_document_uri() {
		return get_permalink($this->get_id());
	}
	function get_preview_image_uri() {

		$attachment_id = get_post_thumbnail_id($this->get_id());
		return wp_get_attachment_image($attachment_id, 'aa_search_2x');
	}
	function get_sources() {
		return $this->get_terms('content_source');
	}
	function get_categories() {
		return $this->get_terms('category');
	}
	function get_tags() {
		return $this->get_terms('post_tag');
	}
	function get_status() {
		return null;
	}
	function get_permission_level() {
	    //TODO: Fix permissions? Or remove.
//		$permissions = \c_ws_plugin__s2member_posts_sp::check_specific_post_level_access($this->get_id(), false);
//		if (array_key_exists('s2member_level_req', $permissions)) {
//			return $permissions['s2member_level_req'];
//		}
		return -1;
	}
	function get_custom_meta() {
		return [];
	}
	function extract_document() {
		return array_merge([
			'id' => $this->get_id(),
			'name' => $this->get_name(),
			'postType' => $this->get_type(),
			'createdDate' => date('c', strtotime($this->get_created_date())),
			'shortDescription' => $this->get_short_description(),
			'longDescription' => $this->get_long_description(),
			'relatedUsers' => $this->get_related_users(),
			'relatedDocuments' => $this->get_related_documents(),
			'documentUri' => $this->get_document_uri(),
			'previewImageUri' =>$this->get_preview_image_uri(),
			'sources' => $this->get_sources(),
			'categories' => $this->get_categories(),
			'tags' => $this->get_tags(),
			'permissionLevel' => $this->get_permission_level(),
			'status' => $this->get_status(),
		], $this->get_custom_meta());
	}
	final function get_p2p_connected_users($connection_types) {
		$authors = get_users(array(
			'connected_type' => $connection_types,
			'connected_items' => $this->get_id()
		));
		return array_map(function($user) {
			return $user->display_name;
		}, $authors);
	}
	final function get_p2p_connected_posts($connection_types) {
		$query = new \WP_Query(array(
			'connected_type' => $connection_types,
			'connected_items' => $this->document,
			'suppress_filters' => false,
			'nopaging' => true,
			'post_type' =>  'any'
		));
		if ($query->post_count == 0) {
			return [];
		}
		return array_map(function($post) {
			return $post->post_title;
		}, $query->posts);
	}
	final function get_terms($taxonomy = 'post_tag') {
		$terms = wp_get_post_terms($this->get_id(), $taxonomy);
		if (is_wp_error($terms)) {
			return [];
		} else {
			return array_map(function($term) { return $term->name; }, $terms);
		}
	}
	final function sanitize_content_string($string = '') {
		if(class_exists('WPBMap') && method_exists('WPBMap', 'addAllMappedShortcodes')) {
			\WPBMap::addAllMappedShortcodes(); // This is needed to ensure VS shortcodes are ready
		}
		$rendered_text = strip_shortcodes(do_shortcode($string)); // Render shortcode, remove any leftovers
		return helpers\strip_html_tags($rendered_text);
	}
}
