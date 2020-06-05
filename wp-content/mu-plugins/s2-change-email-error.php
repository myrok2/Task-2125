<?php

/*
 * Unfortunately S2 doesn't kick an error back to the user if they try to change their
 * primary email address to one that already exists. Instead, S2 just displays a confirmation
 * message that everything was updated successfully. This hack checks if this situation
 * has happened and injects some JS to display a more accurate error message.
 */

add_action('ws_plugin__s2member_after_handle_profile_modifications', function($vars) {
	$form_email = $vars['_p']['ws_plugin__s2member_profile_email'];
	if(strcasecmp($form_email, $vars['user']->user_email) !== 0 && email_exists($form_email)) {
		add_action('wp_footer', function() use ($form_email) {
			echo "
			<script>
				(function($) {
					$('#ws-plugin--s2member-profile-saved')
						.removeClass('alert-success')
						.addClass('alert-danger')
						.text('Error updating email address. Email already exists.');
				})(jQuery);
			</script>
			";
		});
	}
});