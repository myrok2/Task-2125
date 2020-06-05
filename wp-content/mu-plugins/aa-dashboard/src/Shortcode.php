<?php namespace AgileAlliance\Dashboard;

class Shortcode {

	function __invoke() {
		add_shortcode( 'aa-dashboard', [ __CLASS__, 'load_dashbaord' ] );
	}

	static function load_dashbaord( $atts, $content, $tag ) {

		global $wp_query;

		$a = shortcode_atts( [
			'type' => 'member'
		], $atts );

		ob_start();
		switch($wp_query->query_vars['action']){
			case 'edit':
				include_once('templates/organization/edit.php');
				break;
			case 'invite':
				include_once('templates/organization/invite.php');
				break;
			case 'members':
				include_once('templates/organization/members.php');
				break;
			case 'request-invite' :
				include_once('templates/organization/request-invite.php');
				break;
			default:
				include_once('templates/organization/dashboard.php');
		}
		$template = ob_get_contents();
		ob_end_clean();

		if (has_filter('loaded_organization_action_template')) {
			$template = apply_filters('loaded_organization_action_template', $template);
		}

		return $template;
	}

}