<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Connect users to Organizations
 * Avoid using from/to arrays - it can cause big issues down the road.
 */

/*
 * Organization Members (Users)
 */
function organization_members() {
	p2p_register_connection_type( array(
		'name'           => 'user_to_organization_member',
		'from'           => 'user',
		'to'             => 'aa_organizations',
		'reciprocal'     => true,
		'sortable'   => 'any',
		'admin_column'   => 'any',
		'from_labels'    => array(
			'column_title' => 'Member of Organization',
		),
		'to_labels'      => array(
			'column_title' => 'Member(s)',
		),
		'title'          => array(
			'from' => __( 'Organizations'),//Displayed on 'from' connection
			'to' => __('Members')//Displayed on 'to' connection
		),
		'admin_dropdown' => false,
		'admin_box'      => array(
			'show'    => 'any',
			'context' => 'side' // side or advanced(below)
		),
		'fields' => array(
			'corporate_contact' => array(
				'title' => 'Corporate Contact',
				'type' => 'checkbox',
			),
		)
	) );
}
add_action( 'p2p_init', 'organization_members' );

add_filter('acf/load_field/key=field_56c76ff62b77a', 'populate_corporate_contact_field');

function populate_corporate_contact_field($field) {

	// Hide unless viewing form as an admin, from the dashboard
	if (!is_admin() || !is_super_admin()) return null;

	// Ensure the field is passed through normally on other views
	$screen = get_current_screen();
	if ($screen->post_type !== 'aa_organizations' || $screen->parent_base !== 'edit') return $field;

	global $post;

	// Get all users associated with organization
	$users = p2p_type('user_to_organization_member')
		->set_direction('to')
		->get_connected($post->ID);

	if ($users->total_users === 0) return null;

	$cc_users = array_filter($users->results, function($user) {
		$p2p_corporate_contact = p2p_get_meta($user->data->p2p_id, 'corporate_contact', true);
		return    $p2p_corporate_contact
			   || in_array('s2member_level2', $user->roles);
	});

	if (count($cc_users) === 0) return null;

	$field['message'] = "<style>
    .corporate-contact dt {
        float: left;
        font-weight: 600;
        color: #444444;
    }
    </style>";

	$field['message'] = array_reduce($cc_users, function($carry, $user) {

		$meta = get_user_meta($user->ID);
		$s2_fields = unserialize($meta['wp_s2member_custom_fields'][0]);

		if (!empty($s2_fields) && gettype($s2_fields) === 'string') {
			$s2_fields = unserialize($s2_fields);
		}

		$display_name = $user->data->display_name;
		$user_link = "/wp-admin/user-edit.php?user_id=$user->ID";
		$email = !empty($s2_fields['work_email']) ? $s2_fields['work_email'] : $user->data->user_email;
		$telephone = $s2_fields['telephone'];

		$carry .= "<dl class=\"corporate-contact\">
			<dt>Name</dt> <dd><a href='$user_link'>$display_name</a></dd>";
		$carry .= !empty($telephone) ? "<dt>Phone</dt> <dd>$telephone</dd>" : '';
		$carry .= !empty($email) ? "<dt>Email</dt> <dd><a href='mailto:$email'>$email</a></dd>" : '';
		$carry .= "</dl>";

		return $carry;
	}, $field['message']);


	return $field;

}
