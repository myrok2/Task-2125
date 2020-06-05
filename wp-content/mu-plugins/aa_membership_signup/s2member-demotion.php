<?php

use Helpers\Organization as O;


add_action('ws_plugin__s2member_during_auto_eot_system_during_demote', function(array $vars) {
	$user = $vars['user'];
	$role_before_demotion = $vars['existing_role'];

	if ($role_before_demotion === 's2member_level2') {
		$register_organization_status = O\reg_taxonomy_organization_status();
		/** Remove/uncheck "Active" from the organization post */
		$org = O\get_organization_connected_to_user($user->ID);
		$removed = O\set_organization_status(false, $org->ID);
	}

});