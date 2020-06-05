<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchStory extends AASearchDocument {
	function get_related_documents() {
		return $this->get_p2p_connected_posts([
			'story_to_initiative',
		]);
	}
	function get_custom_meta() {
		return [
			'storyCategories' => $this->get_terms('story_cat'),
		];
	}
}