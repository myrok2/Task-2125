<?php defined( 'ABSPATH' ) or die();

	// Add rewrite rule to allow numerical value
	add_action('init', function() {
		add_rewrite_rule('^author/([0-9]+/?)','index.php?author=$matches[1]','top');
	});

	// Redirect if a user_nicename is used on a author_name request
	add_filter('request', function($request) {
		$author_rk = 'author_name';

		if(array_key_exists($author_rk, $request) && ! is_numeric($request[$author_rk]) ) {
			$author_rv = $request[$author_rk];
			$by_field = (is_email($author_rv)) ? 'email' : 'slug';
			$user = get_user_by($by_field, $request[$author_rk]);
			$user_id = $user->ID;
			wp_redirect(author_int_url($user_id), 301);
			exit;
		}

		return $request;
	});

	//Filter the url to the author's page
	add_action('setup_theme', function() {
		add_filter('author_link', function($link, $author_id, $author_nicename) {
			$author_url = author_int_url($author_id);
			return $author_url;
		}, 10, 3);
	});

	function author_int_url($author_id) {
		return home_url('/author/'.$author_id);
	}