<?php
use Paradigm\Concepts\Functional as F;
use AgileAlliance\Invites\Invite as Invite;
use Helpers\Html as H;
use Helpers\Organization as O;
use Helpers\User as U;

/**
 * Gravity Form hooks for request invite feature
 */

$specific_gform_tag = function($tag) {
	$form_id = 24;
	return $tag . '_' . $form_id;
};

$pre_submission = $specific_gform_tag('gform_pre_submission');
$after_submission = $specific_gform_tag('gform_after_submission');
$gform_confirmation = $specific_gform_tag('gform_confirmation');

/**
 * Populate hidden fields
 */

add_action($pre_submission, function($form) {

	$post_id = get_the_ID();
	$post_title = get_the_title();

	$_POST['input_3'] = $post_id;
	$_POST['input_4'] = $post_title;

});

add_action($after_submission, function($entry, $form) {
	$author_agile_alliance = '6000331';
	$rgar = F\partial( 'rgar', $entry );
	$requester_first_name = $rgar('1.3');
	$requester_last_name  = $rgar('1.6');
	$requester_email      = $rgar('2');
	$organizataion_id     = $rgar('3');
	$organization_name    = $rgar('4');
	$invite_post_title = sprintf( '%s %s has requested to join %s',
		$requester_first_name, $requester_last_name, $organization_name );

	$invite_post_id = Invite::create( $invite_post_title, $author_agile_alliance );

	$post_update_arr = [
		[Invite::INVITE_TYPE_ACF_KEY, 'organization', $invite_post_id],
		[Invite::INVITE_STATUS_ACF_KEY, 'pending-approval', $invite_post_id],
		[Invite::INVITE_RECIPIENT_ACF_KEY, $requester_email, $invite_post_id],
		[Invite::INVITE_FIRST_NAME_ACF_KEY, $requester_first_name, $invite_post_id],
		[Invite::INVITE_LAST_NAME_ACF_KEY, $requester_last_name, $invite_post_id]
	];

	$updates_invite_post      = Invite::update_invite_acf_fields($post_update_arr);
	$sender_to_invite_conn_id = Invite::connect_sender_to_invite( $author_agile_alliance, $invite_post_id );
	$org_to_invite_conn_id    = Invite::connect_organization_to_invite( $organizataion_id, $invite_post_id );

	// Email Corporate Contact
	
	$corporate_contact = current(O\get_corporate_contact_by_organization( $organizataion_id ));
	$corporate_contact_meta = U\singleized_meta( get_user_meta($corporate_contact->ID) );
	$organization_permalink = get_permalink( $organizataion_id );

	$data = [
		'corp_contact_first_name' => $corporate_contact_meta['first_name'],
		'requestor_name' => $requester_first_name . ' ' . $requester_last_name,
		'requester_email' => $requester_email,
		'organization_name' => $organization_name,
		'organization_invite_url' => $organization_permalink . '?action=invite',
		'mailto' => 'mailto:membership@agilealliance.org?subject=Requested Invite'
	];

	$subject = $data['requestor_name'] . ' has requested to join ' . $organization_name;
	$headers[] = 'Content-Type: text/html; charset=UTF-8';
	$email_copy = Invite::request_to_join_email_copy($data);

	wp_mail($corporate_contact->user_email, $subject, $email_copy, $headers);


}, 10, 2);

// Mutate the confirmation, this will replace {{var_name}} to a variable value

add_action($gform_confirmation, function($confirmation, $form, $entry, $ajax) {

	$rgar = F\partial( 'rgar', $entry );
	$organizataion_id     = $rgar('3');
	$organization_name    = $rgar('4');
	$corporate_contact = current(O\get_corporate_contact_by_organization( $organizataion_id ));
	$corporate_contact_id = $corporate_contact->ID;
	$corporate_contact_meta = U\singleized_meta( get_user_meta($corporate_contact_id) );
	$corporate_contact_name = $corporate_contact_meta['first_name']
	                          . ' '
	                          . $corporate_contact_meta['last_name'];

	return array_reduce([
		['organization', $organization_name ],
		['corporate_contact', $corporate_contact_name]
	], function($carry, $item) {
		$key   = current($item);
		$value = next($item);
		$pattern = '/(\{\{' . $key . '\}\})/i';
		$carry = preg_replace($pattern, $value, $carry);
		return $carry;
	}, $confirmation);

}, 10, 4);

/**
 * Change the organization action template, if not enough invites
 */

add_filter('loaded_organization_action_template', function($org_action_tpl) {

	if (!empty($_GET['action']) && $_GET['action'] === 'request-invite') {

		$post_id = get_the_ID();
		$get_corporate_contact = F\compose('current', O\_pntfn( 'get_corporate_contact_by_organization' ) );
		$corporate_contact = $get_corporate_contact($post_id);
		$available_inivtes = Invite::get_available_invites( $corporate_contact->ID );

		if (is_numeric($available_inivtes)
		    && $available_inivtes <= 0
		    && empty($_POST['gform_submit'])
		    || ! is_numeric($available_inivtes)
		       && $available_inivtes !== 'unlimited') {

			$org_action_tpl = H\error_container('Requests are currently unavailable.');
		}

	}

	return $org_action_tpl;
});