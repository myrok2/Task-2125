<?php

namespace AgileAlliance\Invites;

use Paradigm\Concepts\Functional as F;
use Helpers\Organization as O;
use \Exception;

class Invite {

	const MAX_MEMBERSHIP_META_KEY   = 'aa_max_memberships';
	const INVITE_TYPE_ACF_KEY       = 'field_56469ddab99a7';
	const INVITE_STATUS_ACF_KEY     = 'field_56469dfdb99a8';
	const INVITE_RECIPIENT_ACF_KEY  = 'field_56469f3cb99aa';
	const INVITE_FIRST_NAME_ACF_KEY = 'field_57445b363458f';
	const INVITE_LAST_NAME_ACF_KEY  = 'field_57445b4834590';
	const POST_TYPE = 'invite';
	const POST_STATUS = 'publish';
	const SENDER_TO_INVITE_P2P_TYPE = 'sender_to_invite';
	const ORG_TO_INVITE_P2P_TYPE = 'organization_to_invite';

	private static $meta_query_fields = [
		'relation' => 'OR',
		[
			'key'     => 'status',
			'value'   => 'pending',
			'compare' => '='
		],
		[
			'key'     => 'status',
			'value'   => 'pending-approval',
			'compare' => '='
		],
		[
			'key'     => 'status',
			'value'   => 'pending-activation',
			'compare' => '='
		]
	];


	/**
	 * @param $user_id
	 *
	 * @return mixed
	 */
	public static function get_max_membership($user_id) {
		return self::get_max_membership_meta($user_id);
	}

	/**
	 * @param $user_id
	 *
	 * @return int|string
	 */
	public static function get_available_invites($user_id) {

		$max_membership = self::get_max_membership($user_id);

		if( self::is_max_membership_unlimited($max_membership) ) {
			return 'unlimited';
		}

		$used_invites = self::get_used_invites_count(true);

		return ( (int) $max_membership - $used_invites);
	}

	/**
	 * Get the invites that can be discounted
	 * from the max membership
	 *
	 * @return WP_Query
	 */

	public static function get_invites() {
		$invites = new \WP_Query([
				'connected_type'  => 'organization_to_invite',
				'connected_items' => get_queried_object(),
				'meta_query'      => self::$meta_query_fields,
				'posts_per_page'  => -1,

		]);

		return $invites;
	}

	/**
	 *
	 * @param $max_membership_value
	 *
	 * @return mixed
	 */
	private static function is_max_membership_unlimited($max_membership_value) {
		return ( strcasecmp($max_membership_value, 'unlimited') === 0)
				? true : false;
	}

	/**
	 * @param $user_id
	 *
	 * @return mixed
	 */

	private static function get_max_membership_meta($user_id) {
		return get_user_meta($user_id, self::MAX_MEMBERSHIP_META_KEY, true);
	}

	/**
	 * @return mixed
	 */

	public static function get_used_invites_count($adjustedCount){
		$invite_count = self::get_used_invites()->post_count;
		if ($adjustedCount) {
			$organization = get_queried_object() ?: get_post();
			$members = O\get_organization_members($organization->ID);
			return (int) $invite_count + (int) count($members);
		}
		return $invite_count;
	}

	/**
	 * Get the invites that can be discounted
	 * from the max membership
	 *
	 * @return WP_Query
	 */

	private static function get_used_invites() {
		$invites = new \WP_Query([
				'connected_type'  => 'organization_to_invite',
				'connected_items' => get_queried_object() ?: get_post(),
				'posts_per_page' => -1,
				'meta_query'      => self::$meta_query_fields
		]);

		return $invites;
	}

	public static function process_bulk_invites($email_array, $organization_id = false) {
		
		if (is_string($email_array)) {
			$email_array = [$email_array];
		}

		$processed_invites = new F\MaybeEmpty($email_array);
		
		$processed_invites
			->bind(function($emails){
				return array_filter($emails, function($value) {
					return !empty($value) && (!filter_var($value, FILTER_VALIDATE_EMAIL) === false);
				});
			})
			->bind(function($emails) use ($organization_id) {
				foreach ($emails as $email) {
					self::create_send_invite($email, $organization_id);
				}
			});
	}

	/**
	 * @param $title
	 * @param null $corporate_id
	 *
	 * @return mixed
	 */

	public static function create($title, $corporate_id = null) {

		if (is_null($corporate_id)) {
			$corporate_id = get_current_user_id();
		}

		$post_arr = [
			'post_title'  => $title,
			'post_author' => $corporate_id,
			'post_type'   => self::POST_TYPE,
			'post_status' => self::POST_STATUS
		];

		return wp_insert_post($post_arr);
	}

	/**
	 * @param $values array
	 *
	 * @return mixed
	 */

	public static function update_invite_acf_fields($values) {

		return array_reduce($values, function($c, $i) {

			$selector = current($i);
			$value = next($i);
			$post_id = next($i);

			array_push($c, update_field($selector, $value, $post_id) );

			return $c;

		}, []);

	}

	/**
	 * @param $corporate_contact_id
	 * @param $invite_post_id
	 *
	 * @return mixed
	 */

	public static function connect_sender_to_invite($corporate_contact_id, $invite_post_id) {

		$connection_meta = ['date' => current_time('mysql')];

		return p2p_type(self::SENDER_TO_INVITE_P2P_TYPE)->connect(
			$corporate_contact_id,
			$invite_post_id,
			$connection_meta
		);

	}

	/**
	 * @param $organization_id
	 * @param $invite_post_id
	 *
	 * @return mixed
	 */
	public static function connect_organization_to_invite($organization_id, $invite_post_id) {
		$connection_meta = ['date' => current_time('mysql')];
		
		return p2p_type( self::ORG_TO_INVITE_P2P_TYPE )->connect(
			$organization_id,
			$invite_post_id,
			$connection_meta
		);
	}

	/**
	 * @param $invite_post_id
	 *
	 * @return mixed
	 */
	public static function create_invite_api_uri($invite_post_id) {
		return site_url('/?organization-invite='
		                .s2member_encrypt((string) $invite_post_id)
		);
	}

	/**
	 * @param array $data
	 *
	 * @return string
	 */
	public static function approved_invite_email_copy(array $data) {

		$requestor_first_name = $data['first_name'];
		$org_name = $data['org_name'];
		$corp_contact_name = $data['corp_contact_name'];
		$requestor_email = $data['requestor_email'];
		$activation_url = $data['activation_link'];

		$email_copy = 'Hi %s,'
		              . '<p>We\'re pleased to inform you that <i>%s</i> has approved your request to join the Corporate Membership for <i>%s</i>.</p>'
		              . '<p>Please verify your e-mail address in order to activate your connection to <i>%s</i> : <a href="%s">%s</a></p>';

		if (! get_user_by('email', $requestor_email) ) {
			$email_copy .= '<p>You will shortly receive additional email(s) with more information about your membership.</p>';
		}

		$email_copy = sprintf( $email_copy,
			$requestor_first_name, $corp_contact_name, $org_name,
			$org_name , $activation_url, $activation_url);

		return $email_copy;
	}

	/**
	 * @param array $data
	 *
	 * @return string
	 */
	public static function denied_invite_email_copy(array $data) {

		$requestor_first_name = $data['first_name'];
		$org_name = $data['org_name'];

		$membership_pricing_uri = site_url('/membership-pricing/');

		$email_copy = 'Hi %s,'
		              . '<p>We regret to inform you that your request to join the Corporate Membership for <i>%s</i> was declined.</p>'
		              . '<p>We encourage you to become an individual member of the Agile Alliance. See <a href="%s" > here </a> for more information.</p>';

		$email_copy = sprintf( $email_copy,
			$requestor_first_name, $org_name, $membership_pricing_uri );

		return $email_copy;
	}

	/**
	 * @param array $data
	 *
	 * @return string
	 */
	public static function request_to_join_email_copy(array $data) {

		$corp_contact_first_name = $data['corp_contact_first_name'];
		$requestor_name = $data['requestor_name'];
		$requester_email = $data['requester_email'];
		$organization_name = $data['organization_name'];
		$organization_invite_url = $data['organization_invite_url'];
		$mailto = $data['mailto'];
		
		$email_copy = 'Hi %s,'
		              . '<p><i>%s</i> at <i>%s</i> has requested to join the Corporate Membership for <i>%s</i>.</p>'
		              . '<p>'
		              . 'Please <a href="%s">click here</a> to approve or deny their request. '
		              . 'Until you approve or deny their request, it is considered an invite and will count against your maximum number of invites and memberships.' 
		              . '</p>'
		              . '<p>If you have any questions, please <a href="%s">contact us</a></p>';

		$email_copy = sprintf( $email_copy,
			$corp_contact_first_name, $requestor_name, $requester_email,
			$organization_name, $organization_invite_url, $mailto);

		return $email_copy;
	}

	/**
	 * @param $organization_post_id
	 *
	 * @return mixed
	 */
	public static function get_corporate_contact($organization_post_id) {
		return current(O\get_corporate_contact_by_organization( $organization_post_id ));
	}

	public static function create_send_invite($email, $organization_id = false) {

		$active_user = get_current_user_id();
		$organization_id = $organization_id ?: get_the_ID();
		$user_id = current(O\get_corporate_contact_by_organization($organization_id))->ID;

		if (empty($active_user) || empty($organization_id) || ($user_id !== $active_user && !is_super_admin())) {
			return false;
		}

		$available_invites = self::get_available_invites($user_id);
		if (   (is_numeric($available_invites) && $available_invites <= 0)
			|| (is_string($available_invites) && strcasecmp($available_invites, 'unlimited') !== 0)) {
			return false;
		}

		$post = [
			'post_title'  => get_the_title().' invites '.$email,
			'post_author' => $user_id,
			'post_type'   => 'invite',
			'post_status' => 'publish'
		];
		$post_id = wp_insert_post($post);

		/** Update advanced custom fields */
		update_field('field_56469ddab99a7', 'organization', $post_id);
		update_field('field_56469dfdb99a8', 'pending', $post_id);
		update_field('field_56469f3cb99aa', $email, $post_id);

		/** Relate the sender to invite post */
		p2p_type('sender_to_invite')->connect(
			$user_id,
			$post_id,
			[
				'date' => current_time('mysql')
			]
		);

		/** Relate the organization to the invite post */
		p2p_type('organization_to_invite')->connect(
			$organization_id,
			$post_id,
			[
				'date' => current_time('mysql')
			]
		);

		$organization_name = get_the_title();

		// Create user that was invited endpoint url
		$url = site_url('/?organization-invite='
			.s2member_encrypt((string) $post_id)
		);

		$subject = 'You have been invited by '.$organization_name ;

		$message = "{$organization_name} is a corporate member of Agile Alliance and you are invited to become a full member of the organization. This is an educational and career development opportunity provided at no cost to you.  Agile Alliance is the place to go for unbiased information on all things Agile.  We encourage you to join the Alliance and take advantage of this vast resource"
			."ful member of Agile Alliance."
			.PHP_EOL.PHP_EOL
			."To create your account, just click here: " ."<{$url}>";
		
		try {
			wp_mail($email, $subject, $message);
		} catch (Exception $ex) {
			set_error_handler('newrelic_notice_error');
			newrelic_notice_error($ex->getMessage(), $ex);
		}

		return $post_id;

	}
	
	public static function explode_validate_emails($email_string) {
		$emails_array = explode("\n", $email_string);

		if (is_string($emails_array)) {
			$emails_array = [$emails_array];
		}

		return array_filter(array_map('trim', $emails_array), function($value) {
			return filter_var($value, FILTER_VALIDATE_EMAIL);
		});
	}

}