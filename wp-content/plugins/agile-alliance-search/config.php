<?php
namespace aa\search\config;
use Aws\Credentials\{CredentialProvider, Credentials};

/**
 * @return array[String] Returns environment-specific array of hosts for ElasticSearch
 */
function get_indexer_hosts() {
	$env_key = get_env_key();
	$host_map = [
		// To add additional configurations, just use the PANTHEON_ENVIRONMENT value as the key... 'live' => ...
		'default' => ['https://search-agilealliance-hojm6wb4ywnezoyziowgl6lhru.us-east-1.es.amazonaws.com:443']
	];
	return array_key_exists($env_key, $host_map) ? $host_map[$env_key] : $host_map['default'];
}

/**
 * @return string Environment specific index name to be used for ElasticSearch
 */
function get_index_name() {
	$env_key = get_env_key();
	return "aa_$env_key";
}

/**
 * @return string The signing key to be used for JWT encoding, can vary based on environment
 */
function get_jwt_signing_key() {
	$env_key = get_env_key();
	$key_map = [
		'live' => '-Bh+v*,]$:hgA?:JbBt|Lxdk2$%g)KqA{9C_3r~U)4Dzbct?[L,~Xs%|',
		'default' => 'development'
	];
	return array_key_exists($env_key, $key_map) ? $key_map[$env_key] : $key_map['default'];
}

/**
 * @return string The pantheon environment if set, or 'local' if running elsewhere
 */
function get_env_key() {
	return isset($_ENV['PANTHEON_ENVIRONMENT']) ? $_ENV['PANTHEON_ENVIRONMENT'] : 'local';
}

/**
 * @return callable AWS CredentialProvider function
 */
function get_aws_credentials_provider() {
	$env_key = get_env_key();
	$aws_credential_map = [
		// To add additional credentials, just use the PANTHEON_ENVIRONMENT value as the key... 'live' => ...
		'default' => ['key' => 'AKIAJO7YBFYURMKIZ7KA', 'secret' => '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'], // IAM User: `agilealliance_elasticsearch`
	];
	$credentials = array_key_exists($env_key, $aws_credential_map) ? $aws_credential_map[$env_key] : $aws_credential_map['default'];
	return CredentialProvider::fromCredentials(
		new Credentials($credentials['key'], $credentials['secret'])
	);
}

/**
 * @return array CPTs which should be included in the external index
 */
function allowed_post_types() {
	return [
		'page',
		'post',
		'aa_book',
		'aa_community_groups',
		'aa_event_session',
		'aa_experience_report',
		'aa_glossary',
		'aa_initiative',
		'aa_organizations',
		'aa_research_paper',
		'aa_story',
    'aa_video',
    'aa_podcast',
		'third-party-event',
	];
}

/**
 * @return array post statuses for which content should be indexed and searchable
 */
function allowed_post_statuses() {
	return [
		'publish'
	];
}

/**
 * @return array associative array of all taxonomies that can be indexed
 */
function allowed_taxonomies() {
	return array_reduce(allowed_post_types(), function($carry_all, $post_type) {
		$taxonomies = get_object_taxonomies($post_type);
		return array_reduce($taxonomies, function($carry_tax, $tax) {
			if (!array_key_exists($tax, $carry_tax) && $tax !== 'post_format') {
				$carry_tax[$tax] = [
					'label' =>  get_taxonomy($tax)->label,
					'terms' => get_terms($tax, ['fields' => 'names']),
				];
			}
			return $carry_tax;
		}, $carry_all);
	}, []);
}

/**
 * @param $param_name {string} shortcode parameter name (e.g. 'filter_book_cat')
 *
 * @return string An object notation string path to the parameter's value in ES
 */
function mapParamToIndexName($param_name) {
	$param_map = [
		'filter_category' => 'categories',
		'filter_post_tag' => 'tags',
		'filter_content_source' => 'sources',
		'filter_community_group_locations' => 'communityGroupLocations',
		'filter_event_session_cat' => 'eventSessionTracks',
		'filter_session_aud_level' => 'eventSessionAudienceLevels',
		'filter_event_session_type' => 'eventSessionTypes',
		'filter_event_session_tags' => 'eventSessionKeywords',
		'filter_experience_report_cat' => 'experienceReportCategories',
		'filter_organizations_cat' => 'organizationCategories',
		'filter_organizations_status' => 'status',
		'filter_story_cat' => 'storyCategories',
		'filter_video_type' => 'videoTypes',
		'filter_video_aud_level' => 'videoAudienceLevels',
    'filter_podcast_type' => 'podcastTypes',
		'filter_post_type' => 'postType',
		'filter_access_level' => 'permissionLevel',
		];
	return array_key_exists($param_name, $param_map)
		? $param_map[$param_name]
		: $param_name;
}
