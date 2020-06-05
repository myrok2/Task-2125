<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Add Recent Resources Carousel Shortcode
function carousel_recent_resources() {

// WP_Query arguments
	$args = array(
		'post_type'           => array(
			'post',
			'aa_book',
			'aa_event_session',
			'aa_experience_report',
			'aa_research_paper',
			'aa_story',
			'aa_video',
			'aa_podcast'
		),
		'post_status'         => array( 'publish' ),
		'pagination'          => true,
		'ignore_sticky_posts' => false,
		'order'               => 'DESC',
		'orderby'             => 'date',
	);

// The Query
	$cpts_all = new WP_Query( $args );

// The Loop
	?>

	<div id="recent-resources">
	<div id="slick-recent-resources" class="slick resource-carousel">
	<?php
	if ( $cpts_all->have_posts() ) {
		while ( $cpts_all->have_posts() ) {
			$cpts_all->the_post();
			$post = new stdClass(); // Creating post object.
			$post->id = get_the_ID();
			$post_type = get_post_type( $post->id );
			$resource_type = get_post_type_object( $post_type );

			// Map CPT slug to desired archive page (useful if CPT doesn't have a traditional archive page)
			$archive_map = [
				'aa_event_session' => '/resources/event-sessions/',
				'post' => '/community/blog/'
			];
			$archive_url = $archive_map[$post_type] ?: dirname(get_permalink( $post->id ));

//			$post_author = get_the_author( $post->id );
			$post_author_id = get_the_author_meta('ID');
			?>

			<div class="slick-item">
			<div class="resource-card <?php echo $post_type; ?>">
			
			<div class="card-bottom">
				<?php // Display the Title as a link to the Post's permalink.?>
				<div class="card-post-title">
					<h4>
						<a href="<?php the_permalink(); ?>" rel="bookmark"
							title="<?php the_title_attribute(); ?>"><?php the_title_limit( 50, '...' ); ?></a>
					</h4>
				</div>
				<div class="card-post-author">

					<?php if($post_type === 'post') {the_author_posts_link();} ?>

					<?php if($post_type === 'aa_community_groups') {
						$terms_as_text = get_the_term_list( $post->ID, 'community_group_locations', '', ', ', '' ) ;
						echo strip_tags($terms_as_text); } ?>
					<?php if($post_type === 'aa_book') { echo do_shortcode( '[p2p_connected type=user_to_book_author mode=ul]' ); } ?>
					<?php if($post_type === 'aa_experience_report') { echo do_shortcode( '[p2p_connected
									type=user_to_experience_report_author mode=ul]' ); } ?>

					<?php if($post_type === 'aa_event_session') {
						echo do_shortcode( '[p2p_connected type=user_to_event_session_presenter mode=ul]' );
					} ?>
					<?php if($post_type === 'aa_initiative') {
						echo do_shortcode( '[p2p_connected type=user_to_initiative_director mode=ul]' );
						echo do_shortcode( '[p2p_connected type=user_to_initiative_chair mode=ul]' );
					} ?>
					<?php if($post_type === 'aa_video') {
					?>
					<div class="grid-p2p pull-right">
						<?php
						$terms_as_text = get_the_term_list( $post->ID, 'video_aud_level', '', ', ', '' ) ;
						echo strip_tags($terms_as_text);
						?>
					</div>
					<div class="grid-p2p"><?php
						echo do_shortcode( '[p2p_connected type=user_to_video_speaker mode=ul]' );
						?>
					</div>
						<?php
						} ?>
          <?php if($post_type === 'aa_podcast') { ?>
            <div class="grid-p2p">
              <?php echo do_shortcode( '[p2p_connected type=user_to_podcast_speaker mode=ul]' ); ?>
            </div>
          <?php } ?>
				</div>
				<div class="card-bottom-details">
					<?php // Display the Item Category ?>
					<div class="card-post-category">
						<a href="<?php echo $archive_url ?>" class="<?php echo $post_type ?>"><?php echo
							$resource_type->label; ?></a>
					</div>
				</div>
			</div>

			</div><?php // Close resource card ?>
			</div><?php // Close slick item ?>
			<?php
		}
		?>
		</div> <?php // Close slick resource-carousel ?>
		</div> <?php // Close recent-resources ?>
		<?php

	} else {
		// no posts found
	}

	// Restore original Post Data
	wp_reset_query();
}

add_shortcode( 'carousel-recent-resources', 'carousel_recent_resources' );