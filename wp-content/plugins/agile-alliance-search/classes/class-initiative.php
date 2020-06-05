<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchInitiative extends AASearchDocument {
	function get_related_users() {
		return $this->get_p2p_connected_users([
			'user_to_initiative_chair',
			'user_to_initiative_participant',
		]);
	}
	function get_related_documents() {
		return $this->get_p2p_connected_posts([
			'posts_to_initiative',
			'book_to_initiative',
			'story_to_initiative',
			'video_to_initiative',
		]);
	}
	function get_tags() {
		// Tags are used to indicate status for this post type
		return null;
	}
	function get_status() {
		return parent::get_tags();
	}
}