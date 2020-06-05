<?php

use Paradigm\Concepts\Functional as F;
use Helpers\Html as Html;
use Helpers\Organization as O;
/**
 * Gravity forms custom redirect on confirmation
 * The custom_confirmation targets gravity form id 6
 * which is the form that setups up the s2member billing form
 * when a visitor is registering for membership or corporate memberhip
 **/

/**
 * @param $confirmation
 * @param $form
 * @param $entry
 * @param $ajax
 *
 * @return mixed
 */

function custom_confirmation ( $confirmation, $form, $entry, $ajax ) {

	if ( strcasecmp( $form['title'] , 'membership options') === 0
	     && strcasecmp( trim($entry[14]), 'invoice' ) !== 0
	) {

		$arr_form_fields = array_map(function($field_obj){
			return (array) $field_obj;
		}, $form['fields']);

		$arr_form_fields_id = array_column($arr_form_fields, 'id');

		/** associate the form field label as the key for entry  */
		$entry_assoc_keys = F\reduce($entry, function($p, $c, $i, $a) use ($arr_form_fields, $arr_form_fields_id) {

			$found = array_search( $i, $arr_form_fields_id);

			if ($found === false) {
				$p[$i] = $c;
			} else {

				$field_label = new F\Identity($arr_form_fields[ $found ]['label']);
				$strtolower = F\curry('strtolower', 1);
				$str_replace = F\curry('str_replace', 3);

				$search_for_spaces = $str_replace(' ');
				$replace_spaces = $search_for_spaces('_');

				$search_for_colon = $str_replace(':');
				$replace_colon = $search_for_colon('');

				$search_for_double_underscore = $str_replace('__');
				$relpace_double_underscore = $search_for_double_underscore('_');

				$formatted_label = $field_label
						->bind($replace_spaces)
						->bind($replace_colon)
						->bind($relpace_double_underscore)
						->bind($strtolower)
						->extract();

				$p[$formatted_label] = $c;
			}

			return $p;

		}, []);

		$rekeyed_entry_monad = new F\Identity($entry_assoc_keys);
		$serialize = F\curry('serialize', 1);

		$serialized_entry_arr = $rekeyed_entry_monad
				->bind($serialize)
				->extract();

		setcookie(GF_ENTRY_MS_COOKIE_NAME, $serialized_entry_arr);

	}

	return $confirmation;
}

add_filter( 'gform_confirmation', 'custom_confirmation', 10, 4 );

/**
 *
 * Handle renewal conditions
 *
 * @todo Refactor; there is a lot of redundancy.
 *
 * @param $form
 *
 * @return mixed
 *
 * @see https://www.gravityhelp.com/documentation/article/gform_pre_render/
 */

function _gform_id_16($form) {

	if( is_user_logged_in() ) {

		$user_s2_access_level = S2MEMBER_CURRENT_USER_ACCESS_LEVEL;
		$form_fields = $form['fields'];
		$_form = new F\Identity($form);
		$is_corporate_contact = false;
		$organization = O\get_organization_connected_to_user(get_current_user_id());

		if (!empty($organization)) {
			$p2p_meta_corporate_contact = p2p_get_meta($organization->p2p_id, 'corporate_contact', true);
			$is_corporate_contact = ! empty($p2p_meta_corporate_contact);
		}
		/**
		 * Set the membership-renewal input to true, overides the need of
		 * using a $_GET parameter. Which just enables
		 */
		$membership_renewal = $_form
			->bind(function($value) {
				$fields = $value['fields'];
				$membership_renewal_field = array_filter($fields, function($field) {
					return (strcasecmp($field->inputName, 'membership-renewal') === 0);
				});
				$membership_renewal_field[key($membership_renewal_field)]['defaultValue'] = '1';
				return $membership_renewal_field;
			})
			->bind(function($value) use ($form) {
				return array_merge($form['fields'], $value);
			});

		/**
		 *
		 */
		$set_access_level_value = $_form
			->bind(function($form) {
				return $form['fields'];
			})
			->bind(function($fields) {
				return array_filter($fields, function($field) {
					return $field->id === 37;
				});
			})
			->bind(function($access_level) use ($user_s2_access_level) {
				current($access_level)['defaultValue'] = $user_s2_access_level;
				return $access_level;
			});

		/**
		 * Hide the 'invoice' option in the payment method select
		 */
		$payment_method_field_id = 14;

		$remove_invoice_choice = $_form
			->bind(function($value) use ($payment_method_field_id) {
				$fields = $value['fields'];
				$payment_method_field = array_filter($fields, function($field) use ($payment_method_field_id) {
					return $field->id === $payment_method_field_id;
				});
				return $payment_method_field;
			})
			->bind(function($payment_method) use ($payment_method_field_id) {

				 current($payment_method)['choices'] = array_filter(current($payment_method)['choices'], function($choice) {
					return strcasecmp($choice['text'], 'invoice') !== 0;
				});

				return $payment_method;
			})
			->bind(function($payment_method) use ($form) {
				return array_merge($form['fields'], $payment_method);
			});

		/**
		 *
		 */
		$data = array_map(function($int) {
			$constant = sprintf('S2MEMBER_LEVEL%d_LABEL', $int);
			return constant($constant);
		}, range(0, MEMBERSHIP_LEVELS));

		$get_eligible_renewal_keys = array_filter(array_keys($data), function($level) {
			if (S2MEMBER_CURRENT_USER_ACCESS_LEVEL === 0) return $level;
			return ($level >= S2MEMBER_CURRENT_USER_ACCESS_LEVEL);
		});

		$eligible_levels = array_map(function($int) use ($data) {
			return $data[$int];
		}, $get_eligible_renewal_keys);

		/**
		 * Membership Levels
		 */
		$membership_levels = array_filter($form_fields, function($field_obj) {
			return (strcasecmp($field_obj->label, 'Membership Level') === 0);
		});
		$membership_levels_key = key($membership_levels);

		/**
		 * @note a subscriber should be able to upgrade to any account role;
		 *
		 * @note Important, currently a subscriber's role will be upgraded
		 * but specific user_meta for the roles they are upgrading to will
		 * not be inserted or updated, so their upgrade will be partial.
		 */
		if (S2MEMBER_CURRENT_USER_ACCESS_LEVEL === 0 && ! $is_corporate_contact) {

			$from_fields = $_form
				->bind(function($form) {
					return $form['fields'];
				});

			/**
			 * Hide corporate membership fields
			 */
			$fields_set_to_admin = $from_fields
				->bind(function($fields) {
					return array_filter( $fields, function ( $field ) {
						$corp_mem_field_ids = [ 9, 30, 35, 14, 36 ];
						return in_array( $field->id, $corp_mem_field_ids );
					} );
				})
				->bind(function($fields) {
					array_map(function($field) {
						$field['adminOnly'] = true;
					}, $fields);

					return $fields;
				})
				->bind(function($fields) use ($form) {
					return array_merge($form['fields'], $fields);
				});

			$membership_choices = array_filter(current($membership_levels)->choices, function($choice) use ($eligible_levels) {
				return in_array($choice['value'], $eligible_levels);
			});

		} else {
			/**
			 * @note as of right now Member and Corporate member can not upgrade, in the futre this whole block can be deleted
			 * and the top block $membership_choices can be used with out the condition. Only for upgrading
			 */
			$get_current_membership_label = F\compose('constant', 'sprintf');
			$current_membership_label = $get_current_membership_label('S2MEMBER_LEVEL%d_LABEL', S2MEMBER_CURRENT_USER_ACCESS_LEVEL);
			if ($is_corporate_contact) {
				$current_membership_label = $get_current_membership_label('S2MEMBER_LEVEL%d_LABEL', 2);
			}
			$membership_choices = array_filter(current($membership_levels)->choices, function($choice) use ($current_membership_label) {
				return strcasecmp($choice['value'], $current_membership_label) === 0;
			});
		}

		$form['fields'][$membership_levels_key]->choices = $membership_choices;

		/**
		 * Individual Membership
		 * Only allow 'Full' as a choice for membership types when renewing
		 */
		if ($user_s2_access_level === 1) {

			$membership_type = get_user_option('aa_membership_type');

			$get_membership_type_field = array_filter($form_fields, function($field_obj) {
				return (strcasecmp($field_obj->label, 'Membership Types') === 0);
			});
			$membership_type_field_key = key($get_membership_type_field);
			$just_membership_type_obj = current($get_membership_type_field);

			$membership_type_selected_choice = array_map(function($choice) use ($membership_type) {
				if (strcasecmp($choice['value'], $membership_type) === 0) {
					$choice['isSelected'] = true;
				}
				return $choice;
			}, $just_membership_type_obj->choices);

			$form['fields'][$membership_type_field_key]->choices = $membership_type_selected_choice;

		}

		/**
		 * Corporate Membership
		 */
		if ($user_s2_access_level === 2 || $is_corporate_contact) {

			/**
			 * Hide the HTML content field meant only for subscribers
			 * whom are not a corporate contact
			 */

			$_hide_field_38 = $_form
				->bind(function($form) {
					return $form['fields'];
				})
				->bind(function($fields) {
					$field_38 = array_filter($fields, function($field) {
						return $field->id === 38;
					});
					return $field_38;
				})
				->bind(function($field_38) {
					$_key = key($field_38);
					$_field_38 = current($field_38);
					$_field_38->conditionalLogic['actionType'] = 'hide';
					$field_38[$_key] = $_field_38;
					return $field_38;
				})
				->bind(function($field_38) use ($form) {
					array_merge($form['fields'], $field_38);
				});

			/**
			 * Override the logic that hides the button, when a subscriber
			 * selectes corporate membership.
			 */

			$form['button']['conditionalLogic'] = '';


			//@todo, what to do if this comes out to be false, should not default to 'unlimited'

			$max_membership_u_label = 'unlimited';
			$get_max_membership     = get_user_option( 'aa_max_memberships' );
			$max_membership         = ( strcasecmp( $get_max_membership, $max_membership_u_label ) === 0 ) ? $max_membership_u_label : (int) $get_max_membership;

			$form_membership_tier_field = array_filter( $form['fields'], function ( $field_obj ) {
				return ( strcasecmp( $field_obj->label, 'membership tier' ) === 0 );
			} );

			$form_membership_tier_field_key = key( $form_membership_tier_field );

			$membership_tier_eligilbe_choices = array_filter( current( $form_membership_tier_field )->choices, function ( $choice ) use ( $max_membership ) {
				$get_choice_value = F\compose( 'trim', 'str_replace' );
				$choice_value     = $get_choice_value( 'Members', '', $choice['value'] );

				if ( strcasecmp( $max_membership, 'unlimited' ) === 0 ) {
					return ! is_numeric( $choice_value );
				}

				return ( (int) $choice_value === $max_membership);
			} );

			$form['fields'][ $form_membership_tier_field_key ]->choices = $membership_tier_eligilbe_choices;

		}

	}

	return $form;
}

add_filter('gform_pre_render_16', '_gform_id_16');

/**
 * Do not render the membership option form, if certain conditions are not met
 */
add_filter('the_content', function($content) {

	if ( is_user_logged_in()
	    && strcasecmp( $GLOBALS['post']->post_name, 'membership' ) === 0 ) {

		$out_error = F\memoize('Helpers\Html\error_container');
		$user_level = S2MEMBER_CURRENT_USER_ACCESS_LEVEL;

		$connected_organizations = get_posts([
			'connected_type'   => 'user_to_organization_member',
			'connected_items'  => wp_get_current_user(),
			'suppress_filters' => false,
			'nopaging'         => true
		]);

		$lvl1_eot_conditions = $user_level === 1 && empty(s2member_eot()['time']) && count($connected_organizations) === 0;
		$lvl2_eot_conditions = $user_level === 2 && empty(s2member_eot()['time']);


		/** Corporate Member */
		if ( $user_level === 2 ) {

			$get_max_membership = get_user_option( 'aa_max_memberships' );

			/** All "Corporate Members" s2Member level = 2, should have aa_max_membership in their user_meta */
			if (empty($get_max_membership)) {
				$error_message = 'Your account does not have a max membership set. '
				                 .'We cannot process your corporate membership renewal at this time. '
				                 .'Please contact membership@agilealliance.org for assistance.';
				return $content = $out_error($error_message);
			}
		}

		if ($lvl1_eot_conditions || $lvl2_eot_conditions ) {
			$error_html = '<div>You may have an automatic renewal subscription setup or there is an issue with your account. Please <a href="/contact-us">contact us.</div>';
			$content = $out_error($error_html);
		}

		if ($user_level === 1) {

			if (count($connected_organizations) > 0) {
				$message = sprintf('To renew your membership, please contact your Corporate Contact about renewing your organization\'s Corporate Membership.
					Questions? Please <a href="%s">contact us</a>', 'registration@agilealliance.org');
				$error_html = sprintf('<div>%s</div>', $message);
				$content = $out_error($error_html);
			}
		}

	}

	return $content;
});
