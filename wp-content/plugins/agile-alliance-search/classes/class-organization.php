<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchOrganization extends AASearchDocument {
	function get_short_description() {
		$description = get_field('description', $this->get_id());
		return $this->sanitize_content_string($description);
	}
	function get_related_users() {
		// Get all users associated with organization
		$users = p2p_type('user_to_organization_member')
			->set_direction('to')
			->get_connected($this->get_id());

		if ($users->total_users === 0) return [];

		$cc_users = array_filter($users->results, function($user) {
			$p2p_corporate_contact = p2p_get_meta($user->data->p2p_id, 'corporate_contact', true);
			return $p2p_corporate_contact || in_array('s2member_level2', $user->roles);
		});

		return array_map(function($user) {
			return $user->display_name;
		}, $cc_users);
	}
	function get_preview_image_uri() {
		$image_id = get_field('logo', $this->get_id(), false);
		return wp_get_attachment_image($image_id, 'aa_search_2x');
	}
	function get_status() {
		return $this->get_terms('organizations_status');
	}
	function get_custom_meta() {
		return [
			'organizationCategories' => get_field('category', $this->get_id())
		];
	}
}