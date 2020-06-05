<?php namespace Helpers\User;

	use Paradigm\Concepts\Functional as F;

	/**
	 *
	 * pntfn = Prepend namespace to function name
	 *
	 * @param $fn
	 *
	 * @return string
	 */
	function _pntfn($fn) {
		return __NAMESPACE__.'\\'.$fn;
	}

	function is_user_role_of($role, $user_id) {
		$user_info = get_userdata($user_id);
		return in_array($role, $user_info->roles);
	}

	function singleized_meta($meta_arr) {
		return array_map(function($meta_val) {
			return current($meta_val);
		}, $meta_arr);
	}

	/**
	 *
	 * Use s2member_eot function to determine
	 * if the type of eot is fixed. This is
	 * associated to non recurring customers
	 *
	 * @param $user_id
	 *
	 * @return bool
	 */
	function has_fixed_eot($user_id) {
		$eot_data = s2member_eot($user_id);
		return strcasecmp($eot_data['type'], 'fixed') === 0;
	}

    /**
     * Use to create an object that contains as much data that one would need for the user
     * mainly to help with creating the body for campaign monitor list.
     *
     * @param $user_id
     * @return array
     */
    function get_user_data($user_id) {
        $user = get_user_by('id', $user_id);
        $user_meta = singleized_meta(get_user_meta($user_id));
        $unserialize_custom_fields = unserialize($user_meta['wp_s2member_custom_fields']) ? unserialize($user_meta['wp_s2member_custom_fields']) : null;
        $s2_user_custom_fields =  $unserialize_custom_fields ?? get_user_option('s2member_custom_fields', $user_id);
        $level_int = get_user_field('s2member_access_level', $user_id);
        //$eot = s2member_eot($user_id);

        return [
            'user' => $user,
            'user_meta' => $user_meta,
            's2member_custom_fields' => $s2_user_custom_fields,
            's2member_level' => $level_int,
//            's2member_eot' => $eot,
        ];

    }
