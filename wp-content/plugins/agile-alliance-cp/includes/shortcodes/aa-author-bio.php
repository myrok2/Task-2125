<?php
namespace aa\author_bio;
const AA_AUTHOR_BIO_SHORTCODE = 'aa-author-bio';

// Maps post types to their P2P author field(s). If false, the default WP author will be used
$author_map = [
	'post' => 'user_to_post',
	'aa_book' => 'user_to_book_author',
	'aa_event_session' => [
		'user_to_event_session_featured_presenter',
		'user_to_event_session_presenter'
	],
	'aa_experience_report' => 'user_to_experience_report_author',
	'aa_research_paper' => 'user_to_research_paper_author',
	'aa_video' => 'user_to_video_speaker',
    'aa_podcast' => 'user_to_podcast_speaker',
];

$author_bio_template = '
	<div class="aa-author-bio">
		<h3 class="aa-author-bio__name">
			<a class="aa-author-bio__link collapsed" href="#aa-author-bio-%d" data-toggle="collapse"><i class="ult_ex_icon Defaults-angle-up is-left"></i>%s</a>
		</h3>
		<div id="aa-author-bio-%d" class="aa-author-bio__content collapse">
			<p class="aa-author-bio__text">
				%s
			</p>
			<div>
				<a class="btn btn-blue-dark aa_btn" href="/author/%d" target="_blank">
					View Profile
				</a>
			</div>
		</div>
	</div>
';

add_shortcode(AA_AUTHOR_BIO_SHORTCODE, function($params) use ($author_map, $author_bio_template) {
	$param_defaults = array(
		// 'arg' => 'value', // Given `[aa_search arg="value"]`, $params['arg'] is available
		'authors' => false,
	);
	$params = shortcode_atts($param_defaults, $params, AA_AUTHOR_BIO_SHORTCODE);

	$current_post = get_queried_object();

	// Only post types in $author_map have authors which can be inferred
	if (!$params['authors'] && !array_key_exists($current_post->post_type, $author_map)) {
		return '';
	}

	// Use any author IDs passed in manually
	$author_ids = $params['authors'] ? explode(',', $params['authors']) : [];

	// Pull authors from p2p connection or default to post author
	if ($author_map[$current_post->post_type]) {
		$p2p_authors = array_map(function($user) {
			return $user->ID;
		}, get_users(array(
			'connected_type' => $author_map[$current_post->post_type],
			'connected_items' => $current_post->ID,
		)));
		$author_ids = array_merge($author_ids, $p2p_authors);
		if ($current_post->post_type == 'post') {
		   array_unshift($author_ids, get_user_by('id', $current_post->post_author));
        }
	} else if ($current_post->post_type === 'post') {
		$author_ids[] = get_user_by('id', $current_post->post_author);
	}

	$author_bio_markup = array_reduce($author_ids, function($carry, $user_id) use ($author_bio_template) {
		$name = get_user_field('full_name', $user_id);
		if (is_object($user_id)) {
            $user_id = $user_id->ID;
        }
		if (!$name) {
			return $carry;
		}
		$carry .= sprintf(
			$author_bio_template,
			(int) $user_id,
			$name,
			(int) $user_id,
			get_user_field('full_bio', $user_id) ?: 'No bio currently available.',
			(int) $user_id
		);
		return $carry;
	}, '');

	return $author_bio_markup;

});
