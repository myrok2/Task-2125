<?php namespace Helpers\Organization;

	use Paradigm\Concepts\Functional as F;
	use Helpers\User as U;

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

	function get_corporate_account($user_id) {
        global $wpdb;
        if ($user_id) {
            $queryStr = "SELECT * FROM {$wpdb->prefix}mepr_corporate_accounts WHERE user_id = {$user_id}";
            $result = $wpdb->get_row($queryStr , OBJECT );
        } else {
            //for unauthenticated users
            $result = "failed!";
        }
        return $result;
    }

    function get_corporate_membership_count($corp_membership_id) {
        global $wpdb;
        if ($corp_membership_id) {
            $queryStr = "SELECT count(*) FROM {$wpdb->prefix}usermeta WHERE meta_key = 'mpca_corporate_account_id' AND meta_value = {$corp_membership_id}";
            return $wpdb->get_var($queryStr);
        } else {
            return false;
        }

    }

	function get_organization_members_by($filter, $obj_id) {
		if($filter === 'post') return get_organization_members($obj_id);
		$org_connected = get_organization_connected_to_user($obj_id);
		if (!$org_connected) {
		    return null;
        }
        $members = F\compose(_pntfn('get_organization_members'), _pntfn('extract_id'));
		return $members($org_connected);
	}

	function get_corporate_contact_by_organization($post_id) {
		$get_org_users = F\partial(_pntfn('get_organization_members_by'), 'post');

		$users = $get_org_users($post_id);
		$_org_users = new F\MaybeEmpty($users);
		$s2member = $_org_users
			->bind(function($value) {
				return array_filter($value, function($user){
					return in_array('s2member_level2', $user->roles);
				});
			});

		return $s2member->extract();
	}

	function is_p2p_org_meta($user_id, $meta_key) {
		if (!did_action('p2p_init')) {
			_p2p_init();
		}
		$organization = get_organization_connected_to_user($user_id);
		return p2p_get_meta($organization->p2p_id, $meta_key, true);
	}

	/**
	 * Get the user's connected post of type aa_organizations
	 *
	 * @param $user_id
	 *
	 * @return mixed
	 */
	function get_organization_connected_to_user($user_id) {
		if (!did_action('p2p_init')) {
			_p2p_init();
		}
		$get_connected_posts = F\compose(F\compose('', 'get_posts'), _pntfn('get_connected_organization_options'));
		return $get_connected_posts($user_id);
	}

	function get_organization_members($post_id) {
		$get_users = F\compose( 'get_users', _pntfn( 'get_organization_users_option' ) );
		return $get_users($post_id);
	}

	/**
	 * @param $post_id
	 * @param $user_id
	 *
	 * @return bool
	 */

	function is_connected_to_post($post_id, $user_id) {

		$args = get_organization_users_option( $post_id );
		$users = get_users($args);
		$empty = function($obj) {
			return empty($obj);
		};
		$is_match_user_empty = F\compose($empty, 'array_filter');
		return ! $is_match_user_empty ($users, function($user) use ($user_id) {
			return $user->ID === (int) $user_id;
		});
	}

	function extract_id($obj) {
		return $obj->ID;
	}

	function get_organization_users_option($post_id) {
		return [
			'connected_type' => 'user_to_organization_member',
			'connected_items' => $post_id
		];
	}

	function get_connected_organization_options($user_id) {
		return [
			'connected_type' => 'user_to_organization_member',
			'connected_items' => $user_id,
			'suppress_filters' => false,
			'nopaging' => true
		];
	}

	/**
	 * @param $bool
	 * @param $post_id
	 * @param bool $hierarchical
	 *
	 * @return mixed
	 */
	function set_organization_status($bool, $post_id, $hierarchical = true) {
		$taxonomy = 'organizations_status';
		$term_id = [165];
		$term_slug = 'active';
		$term = ($hierarchical) ? $term_id : $term_slug;

		if (!$bool) {
			return wp_remove_object_terms($post_id, $term, $taxonomy);
		}

		return wp_set_post_terms($post_id, $term, $taxonomy);
	}

	function reg_taxonomy_organization_status() {

		/**
		 * Need "Organization Status" taxonomy during s2member demotion hook, which runs
		 * before `init` action therefore registering this specific taxonomy in
		 * this hook
		 *
		 * This taxonomy also gets loaded in the following file:
		 * /wp-content/plugins/agile-alliance-cp/agile-alliance-cp.php
		 *
		 */

		$taxonomy_args = [
			'name' => 'Organization Status',
			'singular_name' => 'Organization Status',
			'menu_name' => 'Organization Status',
			'all_items' => 'All Organization Status',
			'edit_item' => 'Edit Organization Status',
			'view_item' => 'View Organization Status',
			'update_item' => 'Update Organization Status',
			'add_new_item' => 'Add New Organization Status',
			'new_item_name' => 'New Organization Status Name',
			'parent_item' => 'Parent Organization Status',
			'parent_item_colon' => 'Parent Organization Status:',
			'search_items' => 'Search Organization Status',
			'popular_items' => 'Popular Organization Status',
			'separate_items_with_commas' => 'Separate Organization Status with commas',
			'add_or_remove_items' => 'Add or remove Organization Status',
			'choose_from_most_used' => 'Choose from the most used Organization Status',
			'not_found' => 'No Organization Status found',
		];

		return register_taxonomy('organizations_status', 'aa_organizations', $taxonomy_args);
	}
