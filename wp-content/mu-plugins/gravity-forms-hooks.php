<?php

if (!defined('AUTHOR_BIO_CONTACT_FORM_GFORM_ID')) {
	define('AUTHOR_BIO_CONTACT_FORM_GFORM_ID', 37); // NOTE: This is also referenced in author.php
}


/*
 * Author Bio Contact Form
 */
$author_bio_contact_form_id = AUTHOR_BIO_CONTACT_FORM_GFORM_ID;

// Suppress entry from being persisted in database
add_action("gform_after_submission_$author_bio_contact_form_id", function($entry) {
	GFAPI::delete_entry($entry['id']);
});

// Configure author contact notification to be directed appropriately
add_filter( 'gform_notification', function($notification) {
	$qv_author_name = get_query_var('author_name');
	$qv_author = get_query_var('author');
	$curauth = ($qv_author_name) ? get_user_by('id', $qv_author_name) : get_userdata($qv_author);

	if ($notification['name'] === 'Author Confirmation') {
		$notification['message'] = str_replace('[NAME]', $curauth->display_name, $notification['message']);
	} elseif ($notification['name'] === 'User Message') {
		$notification['toType'] = 'email';
		$notification['to'] = $curauth->user_email;
	}
	return $notification;
}, 10, 3 );
