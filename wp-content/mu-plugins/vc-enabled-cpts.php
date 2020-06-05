<?php

/*
 * VC stores the active CPTs as role capabilities, for some reason
 * these settings are lost from time to time. The function below checks
 * that the roles defined in $roles_to_force have these enabled and
 * forces them to active if they are not.
 *
 * These settings are typically managed here: /wp-admin/admin.php?page=vc-roles
 */
add_action( 'admin_init', function () {
	$vc_capability_prefix = 'vc_access_rules_post_types';
	$roles_to_force = array_map('get_role', array(
		'administrator',
		'affiliate_admin',
		'editor',
		'initiative_chair',
	));
	$enabled_post_types = array(
		'post',
		'aa_book',
		'aa_glossary',
		'aa_speaker_directory',
		'page',
		'third-party-event',
		'aa_initiative',
		'aa_story',
		'aa_sponsor',
		'event',
		'aa_experience_report',
		'aa_research_paper',
	);
	foreach ($enabled_post_types as $cap) {
		foreach ($roles_to_force as $role) {
			if (!$role->has_cap("$vc_capability_prefix/$cap")) {
				$role->add_cap("$vc_capability_prefix/$cap");
			}
		}
	}
});

/**
 * Add a notice to the VC Roles Manager page to indicate that some
 * values are hardcoded.
 */
add_action('admin_notices', function () {
	if (get_current_screen()->id !== 'visual-composer_page_vc-roles') {
		return;
	}
	?>
	<div class="notice notice-info">
		<p>Note: The custom post type configuration below is hardcoded, refer to <code>mu-plugins/vc-enabled-cpts.php</code> to change.</p>
	</div>
	<?php
});
