<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchCommunityGroup extends AASearchDocument {
	function get_short_description() {
		$group_description = get_field('group_description', $this->get_id());
		return $this->sanitize_content_string($group_description);
	}
	function get_related_users() {
		$contacts = get_field('direct_contact_information', $this->get_id());
		if ($contacts == null) {
			return [];
		} else {
			return array_map(function($contact) {
				return $contact['contact_name'];
			}, $contacts);
		}
	}
	function get_custom_meta() {
		return [
			'communityGroupLocations' => $this->get_terms('community_group_locations'),
		];
	}
}