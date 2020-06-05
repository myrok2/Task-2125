<?php
	use Paradigm\Concepts\Functional as F;
	use Helpers\User as U;
	use Helpers\Organization as O;

	add_action('updated_user_meta', function($meta_id, $object_id, $meta_key, $_meta_value) {

		$_user_id = new F\Identity($object_id);
		$is_role = F\partial(U\_pntfn('is_user_role_of'), 's2member_level2');

		if ($is_role($_user_id->extract()) && $meta_key === 'wp_s2member_auto_eot_time') {

			if (!did_action('p2p_init')) {
				_p2p_init();
			}

			$members = O\get_organization_members_by('user', $_user_id->extract());
			$_members = new F\MaybeEmpty($members);
			$singlize_meta = F\compose(U\_pntfn('singleized_meta'), 'get_user_meta');

			$user_with_meta = $_user_id
				->bind(function($value) {
					return get_user_by('id', $value);
				})
				->bind(function($value) use ($singlize_meta) {
					$value->user_meta = $singlize_meta($value->ID);
					return $value;
				})
				->extract();

			define('BYPASS_USER_META_HOOK', true);

			$non_lvl2_members = $_members
				->bind(function($value) use ($is_role) {
					return array_filter($value, function($user) use ($is_role){
						return ! $is_role($user->ID);
					});
				})
				->bind(function($value) use ($singlize_meta) {
					return array_map(function($user) use ($singlize_meta) {
						$user->user_meta = $singlize_meta($user->ID);
						return $user;
					},$value);
				})
				->bind(function($value) use($user_with_meta) {
					return array_filter($value, function($user) use ($user_with_meta) {
						return $user_with_meta->user_meta['wp_s2member_auto_eot_time'] !== $user->user_meta['wp_s2member_auto_eot_time'];
					});
				})
				->bind(function($value) use($user_with_meta) {
					return array_map(function($user) use ($user_with_meta) {
						update_user_option($user->ID, 's2member_auto_eot_time', $user_with_meta->user_meta['wp_s2member_auto_eot_time']);
						return $user;
					}, $value);
				});
		}

	}, 10, 4);