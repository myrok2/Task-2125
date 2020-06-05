<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchPodcast extends AASearchDocument {
	function get_related_users() {
		return $this->get_p2p_connected_users([
			'user_to_podcast_speaker'
		]);
	}
	function get_long_description() {
		return $this->sanitize_content_string(get_field('description', $this->get_id()));
	}
	function get_custom_meta() {
		return [
			'podcastTypes' => $this->get_terms('podcast_type')
		];
	}
}
