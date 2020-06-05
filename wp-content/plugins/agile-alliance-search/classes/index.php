<?php
namespace aa\search\document;
use aa\search\config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require 'abstract-document.php';
require 'class-post.php';
require 'class-page.php';
require 'class-book.php';
require 'class-community-group.php';
require 'class-event-session.php';
require 'class-experience-report.php';
require 'class-glossary-term.php';
require 'class-initiative.php';
require 'class-organization.php';
require 'class-research-paper.php';
require 'class-third-party-event.php';
require 'class-story.php';
require 'class-video.php';
require 'class-podcast.php';

function init_object($type, $document) {
	// Map document type with a specific class
	// If not defined, will default to AASearchPost
	$class_map = [
		'page' => 'aa\search\document\AASearchPage',
        'post' => 'aa\search\document\AASearchPost',
		'aa_book' => 'aa\search\document\AASearchBook',
		'aa_community_groups' => 'aa\search\document\AASearchCommunityGroup',
		'aa_event_session' => 'aa\search\document\AASearchEventSession',
		'aa_experience_report' => 'aa\search\document\AASearchExperienceReport',
		'aa_glossary' => 'aa\search\document\AASearchGlossaryTerm',
		'aa_initiative' => 'aa\search\document\AASearchInitiative',
		'aa_organizations' => 'aa\search\document\AASearchOrganization',
		'aa_research_paper' => 'aa\search\document\AASearchResearchPaper',
		'third-party-event' => 'aa\search\document\AASearchThirdPartyEvent',
		'aa_story' => 'aa\search\document\AASearchStory',
    'aa_video' => 'aa\search\document\AASearchVideo',
    'aa_podcast' => 'aa\search\document\AASearchPodcast',
	];
	return array_key_exists($type, $class_map)
		? (new $class_map[$type]($document))
		: (new AASearchPost($document));
}

function init_post_as_document($post_id) {
	if (is_object($post_id)) {
		$post = $post_id;
	} else {
		$post = get_post($post_id);
	}
	if ($post == null || !in_array($post->post_type, config\allowed_post_types())) {
		return;
	}
	if (in_array($post->post_status, config\allowed_post_statuses())) {
		return init_object($post->post_type, $post);
	}
}
