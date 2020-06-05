<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchResearchPaper extends AASearchDocument {
	function get_related_documents() {
		return $this->get_p2p_connected_posts([
			'research_paper_to_event_session',
		]);
	}
	function get_related_users() {
		return $this->get_p2p_connected_users([
			'user_to_research_paper_author',
		]);
	}
}