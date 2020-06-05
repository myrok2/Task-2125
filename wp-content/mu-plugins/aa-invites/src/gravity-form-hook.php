<?php

use AgileAlliance\Invites\Invite as Invite;
use Helpers\Organization as O;

/**
 * Limit the amount of list inputs
 *
 * This limits the max rows that
 * as user can add to their list
 *
 * @see https://www.gravityhelp.com/documentation/article/gform_pre_render/
 */
add_filter( 'gform_pre_render_12', function($form) {

	$user_id = get_current_user_id();

	$available_invites = Invite::get_available_invites($user_id);

	foreach($form['fields'] as $key => $obj){
		if ($obj->id === 1) {
			$form['fields'][$key]->maxRows = ( is_numeric($available_invites) )
					? $available_invites
					: 0;
			break;
		}
	}

	return $form;

}, 10);

add_action( 'gform_enqueue_scripts_12', function() {

	$organization_id = get_the_ID();
	$user_id = current(O\get_corporate_contact_by_organization($organization_id))->ID;
	$invites_allowed = Invite::get_available_invites($user_id);
	$invites_allowed = is_numeric($invites_allowed) ? $invites_allowed : false;

	?>

	<style>
		#field_12_4 label.gfield_label {
			display: inline-block;
			position: static;
		}
		#field_12_4 label.gfield_label.isFocus {
			margin-top: 25px;
			top: -44px;
		}
		.gchoice_12_3_0 {
			margin-right: 15px !important;
		}
		#input_12_4 {
			padding: 10px !important;
			border: 1px solid #E7E7E7;
		}
		.invite-alert {
			display: none;
		}
		.exceeded .invite-alert {
			display: block;
		}
	</style>

	<script>
		(function($){
			$(function(){
				var $invites = $('#input_12_4');
				var $parent = $invites.parent().parent();

				$invites.parent().prepend(
					'<p class="gfield_description validation_message invite-alert">Maximum number of invites exceeded.</p>'
				);

				$invites.on('change keyup', function() {
					var $this = $(this);
					var rows = <?php echo (int)$invites_allowed ?>;
					var splitval = $this.val().split("\n").filter(function(val){ return val.trim() !== ''; });
					if (rows && splitval.length > rows) {
						$parent.addClass('exceeded');
					} else {
						$parent.removeClass('exceeded');
					}
				}).change();
			});
		})(jQuery);
	</script>

	<?php
}, 10, 2 );


/**
 * Redirect back to this org's invite screen
 *
 * This eliminates the refresh problem.
 */

add_filter('gform_confirmation_12', function($confirmation) {
	$post = get_post();
	$post_guid = $post->guid;
	$organization_post_url = $post_guid.'?action=invite';
	$redirect_url = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : $organization_post_url;
	$confirmation = [ 'redirect' => $redirect_url ];
	return $confirmation;
});

add_filter('gform_validation_12', function ($validation_result) {

	if ( strcasecmp($validation_result['form']['title'], 'organization invite') === 0 ) {
		$form = $validation_result['form'];

		if (strcasecmp(rgpost('input_3'), 'Bulk') ===  0) {

			// Filter/Extract emails from form to array
			$filtered_emails = Invite::explode_validate_emails(rgpost('input_4'));

			if (count($filtered_emails) === 0) {
				$validation_result['is_valid'] = false;
				$form['fields'][3]->failed_validation = true;
				$form['fields'][3]->validation_message = 'No valid email addresses entered.';

			} else {

				// Calculate available emails
				$user_id = get_current_user_id();
				$invites_allowed = Invite::get_available_invites($user_id);

				if (is_numeric($invites_allowed) && count($filtered_emails) > $invites_allowed) {
					$validation_result['is_valid'] = false;
					$form['fields'][3]->failed_validation = true;
					$form['fields'][3]->validation_message = 'Insufficient invites available, please try again with fewer email addresses.';
				}
			}
		}

		//Assign modified $form object back to the validation result
		$validation_result['form'] = $form;
		return $validation_result;
	}

});


add_action('gform_after_submission', function($entry, $form) {

	if ( strcasecmp($form['title'], 'organization invite') === 0 ) {
		$emails = false;
		switch ($entry[3]) {
			case 'Bulk':
				$emails = Invite::explode_validate_emails($entry[4]);
				break;
			case 'Single':
				$emails = unserialize($entry[1]);
				break;
			default:
				return false;
				break;
		}
		if ($emails) {
			Invite::process_bulk_invites($emails);
		}
	}

}, 10, 2);



