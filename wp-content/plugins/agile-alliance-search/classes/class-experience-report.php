<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchExperienceReport extends AASearchDocument {
	function get_related_documents() {
		return $this->get_p2p_connected_posts('experience_report_to_event_session');
	}
	function get_related_users() {
		return $this->get_p2p_connected_users('user_to_experience_report_author');
	}
	function get_custom_meta() {
		return [
			'experienceReportCategories' => $this->get_terms('experience_report_cat')
		];
	}
}