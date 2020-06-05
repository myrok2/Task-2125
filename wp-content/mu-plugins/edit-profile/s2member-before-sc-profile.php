<?php

use Helpers\Html as html;
use Helpers\Organization as O;

if (!defined('DOING_CRON') && !defined('DOING_AJAX')) {

	add_action('ws_plugin__s2member_before_sc_profile', function() {

		if (S2MEMBER_CURRENT_USER_ACCESS_LEVEL > 0) {

			$automatic_cell_message = function() {

				$eot = s2member_eot();
				$is_auto_renew = (!empty($eot['type']) && $eot['type'] === 'fixed') ? false : true;

				if ($is_auto_renew ) {

					$organization = O\get_organization_connected_to_user(get_current_user_id());

					if( preg_match('/^this user has no/i', $eot['debug']) && empty($organization)) {

						return 'There appears to be an error with your account.'
						       . 'Please <a href="/contact-us/?inquiry=Membership">contact us</a>.';
					}

					return 'Automatic Renewal';
				}

				return date('D F j, Y ', $eot['time']);
			};

			// user_to_organization_member

			$table = [
				'attributes' => [
					'class' => 'table table-hover table-bordered',
					'style' => 'margin-bottom:30px'
				],
				'headings' => [
					'Account Expiration'
				],
				'rows' => [
					[
						$automatic_cell_message()
					]
				]
			];

			echo html\table($table);
		}

	});

}