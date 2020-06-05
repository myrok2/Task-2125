<?php namespace AgileAlliance\Invites;

class CustomPostTypes{

	protected $post_types = [];

	public function __construct() {

		$this->post_types[] = [
			'post_type' => 'invite',
			'args' => [
				'labels' => [
					'name'              => _x('Invites', 'post type general name'),
					'singular_name'     => _x('Invite', 'post type singular name'),
					'menu_name'         => _x('Invites', 'admin menu'),
					'name_admin_bar'    => _x('Invite', 'add new on admin bar'),
					'add_new'           => __('Add New', 'invite'),
					'add_new_item'      => __('Add New Invite'),
					'new_item'          => __('New Invite'),
					'edit_item'         => __('Edit Invite'),
					'view_item'         => __('View Invite'),
					'all_items'         => __('All Invites'),
					'search_items'      => __('Search Invites'),
					'parent_item_colon' => __('Parent Invites'),
					'not_found'         => __('No invites found'),
					'not_found_in_trash'=> __('No invites found in Trash')
				],
				'description' => __('Agile Alliance must use invites plugin.'),
				'public' => false,
				'show_ui' => true,
				'show_in_menu' => true,
				'supports' => ['title','author','custom-fields'],
				'has_archive' => false
			]
		];

	}

	public function __invoke() {
		array_reduce($this->post_types, function($carry, $item){
			register_post_type($item['post_type'], $item['args']);
		});
	}
}