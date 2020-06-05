<?php

namespace AgileAlliance\Dashboard;
use Paradigm\Concepts\Functional as F;
use AgileAlliance\Invites\Invite as Invite;

defined( 'ABSPATH' ) or die( '' );

require_once('aa-dashboard/vendor/autoload.php');

add_action('init', new Shortcode() );

add_filter( 'single_template', function($single_template) {

	global $post;

	if( $post->post_type === 'aa_organizations' ) {
		$template_dir = __DIR__.'/aa-dashboard/src/templates/';
		$single_template =  $template_dir.'/dashboard.php';
	}

	return $single_template;

} );

add_action('init', function(){
	add_rewrite_tag('%action%', '([^&]+)');
});

/** @todo make fancy custom rewrite rules */
/*add_action('init', function(){

	add_rewrite_rule(
			'^organizations/mak-wfh/([^/]*)/?',
			'index.php?&post_type=aa_organizations&p=929&action=$matches[1]'
	);

});*/

add_action('p2p_init', function(){

	p2p_register_connection_type([
		'name' => 'organization_to_invite',
		'from' => 'aa_organizations',
		'to' => 'invite',
		'cardinality' => 'one-to-many',
		'duplicate_connections' => false,
		'reciprocal' => true

	]);

});