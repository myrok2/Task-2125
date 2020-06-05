<?php
/*
 * Plugin Name: Agile Alliance
 * Version: 1.0
 * Plugin URI:
 * Description: Registers all CPT's, ACF Pro, Custom Carousels & Resource Library Grid, Posts-to-Posts, Featured Image Column for Admin Panel, Custom Agile Alliance Quotes Widget, WP Days Ago & Custom Functions / Tweaks.
 * Author: 352 Inc - Agile Alliance Team
 * Author URI: http://www.352 Inc - Agile Alliance Team.com/
 * Requires at least: 4.0
 * Tested up to: 4.3.1
 *
 * Text Domain: agile-alliance-cp
 * Domain Path: /lang/
 *
 * @package WordPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load plugin class files
require_once( 'includes/class-agile-alliance-cp.php' );
require_once( 'includes/class-agile-alliance-cp-settings.php' );
require_once( 'includes/class-agile-alliance-cp-admin-api.php' );
require_once( 'includes/class-agile-alliance-cp-post-type.php' );
require_once( 'includes/class-agile-alliance-cp-taxonomy.php' );

// Custom hacks to the carousels - IE: title truncation
require_once( 'includes/carousels/carousel-hacks.php' );
// Recent Resources - Home Page Carousel
require_once( 'includes/carousels/carousel-recent-resources.php' );
// Upcoming Events - Home Page Carousel
require_once( 'includes/carousels/carousel-upcoming-events.php' );
// Organization Logos - Home Page Carousel
require_once( 'includes/carousels/carousel-organizations.php' );

// Custom Shortcodes
require_once( 'includes/shortcodes/aa-author-bio.php' );
require_once( 'includes/shortcodes/aa-mobile-menu.php' );
require_once( 'includes/shortcodes/aa-community-groups.php' );
//require_once( 'includes/shortcodes/aa-location-map.php' ); // Removing Google Maps integration (this API now requires a subscription)
require_once( 'includes/shortcodes/cpt-categories.php' );
require_once( 'includes/shortcodes/cpt-type-days-ago.php' );
require_once( 'includes/shortcodes/aa-event-sessions.php' );
require_once( 'includes/shortcodes/aa-videos.php' );
require_once( 'includes/shortcodes/aa-podcasts.php' );
require_once( 'includes/shortcodes/aa-sponsor-carousel.php' );
require_once( 'includes/shortcodes/aa-speaker-directory.php' );
require_once( 'includes/shortcodes/aa-sidebar-navigation.php' );
require_once( 'includes/shortcodes/aa-alphabetical-org-listing.php' );
require_once( 'includes/shortcodes/aa-local-navigation.php' );
require_once( 'includes/shortcodes/aa-restricted-page.php' );

// Add a global shortcode to display the page content
// Particularly useful with imported content - such as Event Sessions
function shortcode_the_content() {	the_content();} add_shortcode( 'content', 'shortcode_the_content' );

// Load Resource Library posts-to-posts inits
require_once('includes/p2p-connections/aa_posts.php');// Posts
require_once( 'includes/p2p-connections/aa_books.php' );// Books
require_once( 'includes/p2p-connections/aa_event_sessions.php' );// Event Sessions
require_once( 'includes/p2p-connections/aa_experience_reports.php' );// Experience Reports
require_once( 'includes/p2p-connections/aa_initiatives.php' );// Initiatives
require_once( 'includes/p2p-connections/aa_organizations.php' );// Organizations
require_once( 'includes/p2p-connections/aa_research_papers.php' );// Research Papers
require_once( 'includes/p2p-connections/aa_speaker_directory.php' );// Speaker Directory
require_once( 'includes/p2p-connections/aa_stories.php' );// Stories
require_once( 'includes/p2p-connections/aa_videos.php' );// Videos
require_once( 'includes/p2p-connections/aa_podcasts.php' );// Podcasts
require_once( 'includes/p2p-connections/aa_sponsors.php' );// Sponsors

// Load VC dependant add-ons only if VC is enabled
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
if ( is_plugin_active( 'js_composer/js_composer.php' ) ) {
	require_once( 'includes/lib/svc-post-grid-addon/vc-addon.php' );// Resources Grid
}

/**
 * Returns the main instance of Agile_Alliance_CP to prevent the need to use globals.
 *
 * @since  1.0.0
 * @return object Agile_Alliance_CP
 */
function Agile_Alliance_CP() {
	$instance = Agile_Alliance_CP::instance( __FILE__, '1.0.0' );

	if ( is_null( $instance->settings ) ) {
		$instance->settings = Agile_Alliance_CP_Settings::instance( $instance );
	}

	return $instance;
}

/**
 * Register Custom Post Types
 */

Agile_Alliance_CP()->register_post_type( 'aa_book',
	'Books',
	'Book',
	'Agile Alliance Books',
	'',
	'dashicons-book',
	'resources/books',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_community_groups',
	'Community Groups',
	'Community Group',
	'Agile Alliance World-Wide Community User Groups',
	'',
	'dashicons-groups',
	'communities',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_event_session',
	'Event Sessions',
	'Event Session',
	'Agile Alliance Event Sessions',
	'',
	'dashicons-welcome-view-site',
	'resources/sessions',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_experience_report',
	'Experience Reports',
	'Experience Report',
	'Agile Alliance Experience Reports',
	'',
	'dashicons-analytics',
	'resources/experience-reports',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_glossary',
	'Glossary Terms',
	'Glossary Term',
	'Agile Alliance A-Z Glossary',
	'',
	'dashicons-editor-ul',
	'glossary',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_initiative',
	'Initiatives',
	'Initiative',
	'Agile Alliance Initiatives',
	'',
	'dashicons-welcome-learn-more',
	'resources/initiatives',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_organizations',
	'Organizations',
	'Organization',
	'Agile Alliance Corporate Members and Organizations',
	'',
	'dashicons-businessman',
	'organizations',
	'true'
);
Agile_Alliance_CP()->register_post_type( 'aa_research_paper',
	'Research Papers',
	'Research Paper',
	'Agile Alliance Research Papers',
	'',
	'dashicons-media-text',
	'resources/research-papers',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_speaker_directory',
	'Speakers',
	'Speaker',
	'Agile Alliance Speaker Directory',
	'',
	'dashicons-groups',
	'resources/speakers',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_story',
	'News & Press',
	'News & Press',
	'Agile Alliance news stories or items',
	'',
	'dashicons-format-status',
	'the-alliance/news-press',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_sponsor',
	'Sponsors',
	'Sponsor',
	'Agile Alliance Sponsors',
	'19',
	'dashicons-awards',
	'sponsors',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_video',
	'Videos',
	'Video',
	'Agile Alliance Videos',
	'',
	'dashicons-format-video',
	'resources/videos',
	'false'
);
Agile_Alliance_CP()->register_post_type( 'aa_podcast',
  'Podcasts',
  'Podcast',
  'Agile Alliance Podcasts',
  '',
  'dashicons-format-audio',
  'resources/podcasts',
  'false'
);

/**
 * Register Custom Categories (Taxonomies)
 */

Agile_Alliance_CP()->register_taxonomy( 'community_group_locations',
	'Locations',
	'Location',
	'true',
	'locations',
	'true',
	'aa_community_groups'
);
Agile_Alliance_CP()->register_taxonomy( 'event_session_cat',
	'Event Session Tracks',
	'event_session_cat',
	'',
	'resources/event-sessions/session-category',
	'',
	'aa_event_session'
);
Agile_Alliance_CP()->register_taxonomy( 'session_aud_level',
	'Audience Levels',
	'Audience Level',
	'',
	'resources/event-sessions/session-levels',
	'',
	'aa_event_session'
);
Agile_Alliance_CP()->register_taxonomy( 'event_session_type',
	'Session Types',
	'Session Type',
	'',
	'resources/event-sessions/session-type',
	'',
	'aa_event_session'
);
// Load aaevent 'venue' stages taxonomy only if aaevents is activated
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
if ( is_plugin_active( 'aaevents/aaevents.php' ) ) {
	Agile_Alliance_CP()->register_taxonomy( 'event_venue_stages',
		'Event Venue Stages',
		'Event Venue Stage',
		'true',
		'venue-stage',
		'true',
		'venue'
	);
}
Agile_Alliance_CP()->register_taxonomy( 'experience_report_cat',
	'Experience Report Categories',
	'Experience Report Category',
	'true',
	'experience-report-category',
	'true',
	'aa_experience_report'
);
Agile_Alliance_CP()->register_taxonomy( 'organizations_cat',
	'Organizations Categories',
	'Organization Category',
	'true',
	'organization-category',
	'true',
	'aa_organizations'
);
Agile_Alliance_CP()->register_taxonomy( 'organizations_status',
	'Organization Status',
	'Organization Status',
	'true',
	'organization-status',
	'false',
	'aa_organizations'
);
Agile_Alliance_CP()->register_taxonomy( 'speaker_directory_type',
	'Speaker Types',
	'Speaker Type',
	'true',
	'speaker-directory-type',
	'true',
	'aa_speaker_directory'
);
Agile_Alliance_CP()->register_taxonomy( 'sponsorship_levels',
	'Sponsorship Levels',
	'Sponsorship Level',
	'true',
	'sponsorship-level',
	'true',
	'aa_sponsor'
);
Agile_Alliance_CP()->register_taxonomy( 'story_cat',
	'Story Categories',
	'Story Category',
	'true',
	'story-category',
	'true',
	'aa_story'
);
Agile_Alliance_CP()->register_taxonomy( 'video_type',
	'Video Types',
	'Video Type',
	'true',
	'videos',
	'true',
	'aa_video'
);
Agile_Alliance_CP()->register_taxonomy( 'video_aud_level',
	'Audience Levels',
	'Audience Level',
	'true',
	'resources/videos/levels',
	'true',
	'aa_video'
);
Agile_Alliance_CP()->register_taxonomy( 'podcast_type',
  'Podcast Types',
  'Podcast Type',
  'true',
  'podcasts',
  'true',
  'aa_podcast'
);

// The source of a piece of content (e.g. Event, etc)
Agile_Alliance_CP()->register_taxonomy( 'content_source',
	'Sources',
	'Source',
	'true',
	'sources',
	'true',
	AA_SOURCE_TAXONOMY_POST_TYPES,
	false // Set taxonomy to private
);

/**
 * Register Custom Tags (Taxonomies)
 */
Agile_Alliance_CP()->register_taxonomy( 'event_session_tags',
	'Event Session Keywords',
	'Keyword',
	'',
	'session-keywords',
	'',
	'aa_event_session'
);

/*
 * Register ACF fields for custom post types above
 */

if( function_exists('acf_add_local_field_group') ):

	define('AA_SPONSOR_WEBSITE_LINK_FIELD', 'field_57211506bba1a');

	acf_add_local_field_group(array (
		'key' => 'group_572114f9c69aa',
		'title' => 'Sponsor Meta',
		'fields' => array (
			array (
				'key' => AA_SPONSOR_WEBSITE_LINK_FIELD,
				'label' => 'Website Link',
				'name' => 'link',
				'type' => 'url',
				'instructions' => '',
				'required' => 0,
				'conditional_logic' => 0,
				'wrapper' => array (
					'width' => '',
					'class' => '',
					'id' => '',
				),
				'default_value' => '',
				'placeholder' => '',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'aa_sponsor',
				),
			),
		),
		'menu_order' => 0,
		'position' => 'acf_after_title',
		'style' => 'default',
		'label_placement' => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen' => '',
		'active' => 1,
		'description' => '',
	));

endif;
