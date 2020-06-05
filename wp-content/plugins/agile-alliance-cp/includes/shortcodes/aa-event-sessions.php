<?php

// Load aaevent shortcodes only if it's enabled
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
if ( is_plugin_active( 'aaevents/aaevents.php' ) ) {
	// This section reserved for pulling P2P "stage" meta data / taxonomies from connected "Venue"
	// aaevent venue stage shortcode
	function aa_event_venue_stage() {?>
		<?php
		// TODO: Consult Nic on best route else wire up p2p meta-taxonomy -- CPT & P2P route, or Taxonomy on venue cpt & p2p
		?>
	<?php }
	add_shortcode( 'event-venue-stage', 'aa_event_venue_stage' );
}

// Event Session "Types" Category Shortcode
function aa_event_session_cat($atts, $content = null) {

	$a = shortcode_atts( array(
		'slug' => false,
	), $atts );

	// get post by post id
	global $post;
	$post = get_post( $post->ID );

	// get post type by post
	$post_type = $post->post_type;

	$out = array();
	$out[] = '<ul>';

	if ($a['slug']) {

		// get the terms related to post
		$terms = get_the_terms( $post->ID, $a['slug'] );

		if ( !empty( $terms ) ) {
			foreach ( $terms as $term ) {
				$out[] = mapTermToLI($term, $a['slug']);
			}
			$out[] = "</ul>";
		}

	} else {

		// get post type taxonomies
		$taxonomies = get_object_taxonomies( $post_type, 'objects' );

		foreach ( $taxonomies as $taxonomy_slug => $taxonomy ){
			// get the terms related to post
			$terms = get_the_terms( $post->ID, $taxonomy_slug );
			if ( !empty( $terms ) ) {
				foreach ( $terms as $term ) {
					$out[] = mapTermToLI($term, $taxonomy_slug);
				}
			}
		}
	}

	$out[] = "</ul>";

	return implode('', $out );

}
add_shortcode( 'event-session-category', 'aa_event_session_cat' );

function mapTermToLI($term, $slug) {
	return '  <li style="list-style:none"><a href="'
	.    get_term_link( $term->slug, $slug ) .'">'
	.    $term->name
	. "</a></li>";
}