<?php

use Paradigm\Concepts\Functional as F;

/**
 * Check if "Contact Information" email field is already associated with an account
 */

add_filter('gform_validation', function($validation_result) {

	$form = $validation_result['form'];

	if ( strcasecmp( trim($form['title']), 'membership options') === 0
	     && strcasecmp( trim(rgpost('input_14')), 'invoice' ) === 0 ) {

		if( email_exists( trim( rgpost('input_18') ) ) ) {

			$validation_result['is_valid'] = false;

			foreach ( $form['fields'] as &$field) {

				if ( $field->id == '18') {
					$field->failed_validation = true;
					$field->validation_message = 'That Email Address is already in use. Please try again.';
					break;
				}

			}
		}

	}
	$validation_result['form'] = $form;
	return $validation_result;
});


/**
 * Handle when from entry is marked as paid
 * 26 = "Paid", 28 = "User Id"
 */

add_action('gform_after_update_entry', function($form, $entry_id, $orginal_entry) {

	if ( strcasecmp( trim($form['title']), 'membership options') === 0 ) {

		$entry = GFAPI::get_entry($entry_id);
		$user_id = $orginal_entry[28];
		$invoice_paid_entry_id = trim(get_user_meta($user_id, 'aa_invoice_paid_entry_id', true));

		if( strcasecmp($entry[26], $orginal_entry[26]) !== 0
		    && strcasecmp($entry[26], 'yes') === 0
		    && $invoice_paid_entry_id !== 'true'
		) {

			/**
			 * Modify user's EOT time
			 */

			$op = [
				'op'   => 'modify_user',
				'data' => [
					'user_id' => $user_id,
					's2member_auto_eot_time' => '+1 year'
				]
			];

			$modify_user = c_ws_plugin__s2member_pro_remote_ops_in::modify_user($op);
			$modify_user_result = @unserialize($modify_user)['ID'];

			/**
			 * Update user meta
			 */

			if ( is_numeric($modify_user_result) ) {
				$update_user_meta = F\partial('update_user_meta', $user_id);
				$update_user_meta('aa_invoice_paid', 'true');
				$update_user_meta('aa_invoice_paid_entry_id', $entry_id);

				/**
				 * Add marked as paid note to the entry
				 */

				$eot_time = get_user_meta($user_id, 'wp_s2member_auto_eot_time', true );

				$note = 'Marked as paid.'
				        .PHP_EOL
				        .'User Id : '.$user_id
				        .PHP_EOL
				        .'End Of Time : '.date('F j, Y  g:i a e', $eot_time );

				GFFormsModel::add_note( $entry_id, 0, 'System', $note, null );

			}

		}
	}

}, 10, 3);


/**
 * Handle corporate membership invoice payment method
 */

add_filter( 'gform_confirmation', function( $confirmation, $form, $entry, $ajax ) {

	if (strcasecmp($form['title'], 'membership options') === 0
	    && strcasecmp( trim($entry[1] ), 'corporate membership') === 0
	    && strcasecmp( trim($entry[14]), 'invoice' ) === 0
	) {

		$contact_information = [
			'company_name' => $entry[24],
			'first_name'   => $entry['17.3'],
			'last_name'    => $entry['17.6'],
			'email'        => $entry[18],
			'phone'        => $entry[19]
		];

		/** @var  $c_op array s2Member Create user options */
		$c_op = [
			'op'   => 'create_user',
			'data' => [
				'user_login'             => sanitize_user($contact_information['email']),
				'user_email'             => $contact_information['email'],
				'first_name'             => $contact_information['first_name'],
				'last_name'              => $contact_information['last_name'],
				's2member_level'         => '2',
				's2member_auto_eot_time' => '+60 day',
				'notification'           => '1'
			]
		];

		/** @var  $create_user mixed Assumption user id is returned serialized */
		$create_user = c_ws_plugin__s2member_pro_remote_ops_in::create_user($c_op);
		$user_id = @unserialize($create_user)['ID'];

		/**
		 * If $user_id is not an error
		 */
		if ( is_numeric($user_id) ) {

			/**
			 * Update s2member custom fields
			 */
			$custom_fields = get_user_option('s2member_custom_fields', $user_id);
			$custom_fields['telephone'] = $contact_information['phone'];
			$custom_fields['company'] = $contact_information['company_name'];
			update_user_option($user_id, 's2member_custom_fields', $custom_fields);

			/**
			 * Update custom user meta
			 */
			$max_membership = explode(' ', $entry[9])[0];
			$update_user_meta = F\partial('update_user_meta', $user_id);
			$update_user_meta('aa_invoice_paid', 'false');
			$update_user_meta('aa_invoice_paid_entry_id', 'false');
			$update_user_meta('aa_max_memberships', strtolower($max_membership) );
			$update_user_meta('aa_created_organization', false);

			/**
			 * Update user id field on this entry
			 */
			$entry['28'] = $user_id;
			GFAPI::update_entry($entry);
		}

		/**
		 * Redirect to checkout success
		 */
		$confirmation = [
				'redirect' => site_url( '/membership/checkout/success/?level=2i' )
		];

	}

	return $confirmation;

}, 10, 4 );
