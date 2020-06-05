<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchVideo extends AASearchDocument {
	function get_related_users() {
		return $this->get_p2p_connected_users([
			'user_to_video_speaker'
		]);
	}
	function get_related_documents() {
		return $this->get_p2p_connected_posts([
			'video_to_event_session',
			'video_to_initiative'
		]);
	}
	function get_long_description() {
		return $this->sanitize_content_string(get_field('description', $this->get_id()));
	}
	function get_custom_meta() {
		return [
			'videoTypes' => $this->get_terms('video_type'),
			'videoAudienceLevels' => $this->get_terms('video_aud_level'),
		];
	}
}