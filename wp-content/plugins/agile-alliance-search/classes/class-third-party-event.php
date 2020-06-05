<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchThirdPartyEvent extends AASearchDocument {
	function get_short_description() {
		return get_field('location', $this->get_id());
	}
	function get_long_description() {
		return $this->sanitize_content_string(parent::get_short_description());
	}
	function get_related_users() {
		return null;
	}
}