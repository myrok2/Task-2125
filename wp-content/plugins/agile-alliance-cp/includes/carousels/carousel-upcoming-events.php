<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Add Upcoming Events Carousel Shortcode
function carousel_upcoming_events() {

// WP_Query arguments
	$args = array(
		'post_type'           => array(
			'event'
		),
		'post_status'         => array( 'publish' ),
		'pagination'          => true,
		'ignore_sticky_posts' => false,
		'order'               => 'DESC',
		'orderby'             => 'date',
		'connected_meta' => array(
			array(
				'key' => $meta_key,
				'value' => $meta_value,
			),
		),
	);

// The Query
	$cpts_all = new WP_Query( $args );

// The Loop
	?>

	<div id="upcoming-events">
	<div id="slick-upcoming-events" class="slick resource-carousel">
	<?php
	if ( $cpts_all->have_posts() ) {
		while ( $cpts_all->have_posts() ) {
			$cpts_all->the_post();
			?>
			<div class="slick-item">
			<div class="event-card">

			<div class="card-top">
				<div class="card-image-wrap">
					<?php
					if ( has_post_thumbnail() ) {
						the_post_thumbnail( 'carousel-event-large' );
					} else {
						?>
						<img src="<?php bloginfo( 'template_directory' ); ?>/dist/images/event-fallback.png"
							alt="<?php the_title(); ?>"/>
					<?php } ?>
				</div>
			</div>
			<div class="card-bottom">

				<?php // Display the Title as a link to the Post's permalink.?>
				<div class="col-xs-6 event-r-border">
					<div class="card-event-dates">
						<?php if( get_field( "event_date_range" ) ): ?>
						<p><?php the_field( 'event_date_range' ); ?></p>
						<?php endif; ?>
					</div>
				</div>
				<div class="col-xs-6 event-info-right">
					<div class="card-post-title">
						<h4>
							<a href="<?php the_field( 'carousel_link_designation' ); ?>" rel="bookmark"
								title="<?php the_title_attribute(); ?>"
								><?php the_title_limit( 35, '...' ); ?></a>
						</h4>
					</div>
					<div class="card-event-venue">
						<?php if( get_field( "carousel_venue_display" ) ): ?>
						<span>
							<?php the_field( 'carousel_venue_display' ); ?>
						</span>
						<?php endif; ?>
					</div>
					<div class="card-event-location">
						<?php if( get_field( "carousel_location_display" ) ): ?>
							<span>
							<?php the_field( 'carousel_location_display' ); ?>
						</span>
						<?php endif; ?>
					</div>
				</div>
			</div>

			</div><?php // Close resource card ?>
			</div><?php // Close slick item ?>
			<?php
		}
		?>
		</div> <?php // Close slick resource-carousel ?>
		</div> <?php // Close upcoming-events ?>
		<?php

	} else {
		// no posts found
	}

	// Restore original Post Data
	wp_reset_query();
}

add_shortcode( 'carousel-upcoming-events', 'carousel_upcoming_events' );