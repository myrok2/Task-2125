<?php
/**
 * Note: You may use any $variables in the actual 'organization-cpt.php' file
 * in which this file is in the scope of.
 */
?>

<h1 class="aa_org-form-headline">You need to create an organization</h1>

<?php

/** Change the post_title label on form display */
add_filter( 'acf/get_valid_field', function($field) {
	$field['label'] = ($field['name'] === '_post_title' )
		? __('Organization Name')
		: $field['label'];

	return $field;
});

acf_form([
	'post_id'      => 'new_post',
	'post_title'   => true,
	'new_post'     => [
		'post_type'   => 'aa_organizations',
		'post_status' => 'publish'
	],
	'submit_value' => __('Submit', 'acf'),
	'return'       => '%post_url%'
]);
