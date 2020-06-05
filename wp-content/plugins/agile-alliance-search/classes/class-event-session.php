<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchEventSession extends AASearchDocument {
	function get_related_users() {
		return $this->get_p2p_connected_users([
			'user_to_event_session_featured_presenter',
			'user_to_event_session_presenter'
		]);
	}
	function get_related_documents() {
		return $this->get_p2p_connected_posts([
			'event_to_event_session',
			'experience_report_to_event_session',
			'research_paper_to_event_session',
			'video_to_event_session',
		]);
	}
	function get_custom_meta() {
		return [
			'eventSessionTracks' => $this->get_terms('event_session_cat'),
			'eventSessionAudienceLevels' => $this->get_terms('session_aud_level'),
			'eventSessionTypes' => $this->get_terms('event_session_type'),
			'eventSessionKeywords' => $this->get_terms('event_session_tags'),
		];
	}
}