<?php
use Paradigm\Concepts\Functional as F;

define('HOMEPAGE_ORG_CAROUSEL_CACHE_KEY', 'aa_homepage_organization_carousel');
define('HOMEPAGE_ORG_CAROUSEL_CACHE_LIFE', DAY_IN_SECONDS);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function carousel_organization_logos() {

	$cached_markup = get_transient(HOMEPAGE_ORG_CAROUSEL_CACHE_KEY);

	if (!empty($cached_markup))
		return $cached_markup;

	global $wpdb;
	$orgs = $wpdb->get_results("
	SELECT 
		p.post_title AS 'title',
		p.ID AS 'post_id',
		(SELECT wp_postmeta.meta_value FROM wp_postmeta WHERE p.ID = wp_postmeta.post_id AND wp_postmeta.meta_key = 'logo') AS 'logo'
	FROM wp_posts p
		INNER JOIN wp_term_relationships ON (p.ID = wp_term_relationships.object_id)
		WHERE 1=1
		AND wp_term_relationships.term_taxonomy_id IN (165)
		AND p.post_type = 'aa_organizations'
		AND p.post_status = 'publish'
	GROUP BY p.ID ORDER BY RAND() LIMIT 25;
		", ARRAY_A);

	$output_string = '<div id="organization-members">
	<div id="org-members-carousel" class="slick resource-carousel">';

	$output_string .= F\reduce($orgs, function ($carry, $post) {
		$logo = wp_get_attachment_image_url($post['logo'], 'medium');
		$permalink = get_permalink($post['post_id']);
		if (!$logo || !$permalink) return $carry;
		$carry .= "
			<div class=\"slick-item\">
				<div class=\"logo\">
					<a href=\"{$permalink}\" rel=\"bookmark\"
						title=\"View {$post['title']}\">
						<img data-lazy=\"{$logo}\" />
					</a>
				</div>
			</div>
		";
		return $carry;
	}, '');

	$now = date('F j, Y, g:i a', strtotime('now'));
	wp_enqueue_style('slick-theme', '//cdn.jsdelivr.net/jquery.slick/1.5.9/slick-theme.css');
	wp_enqueue_style('slick', '//cdn.jsdelivr.net/jquery.slick/1.5.9/slick.css');
	$output_string .= "</div></div>

	<!-- Cached: $now -->
    <script async type=\"text/javascript\">
		jQuery(document).ready(function ($) {
              $('#org-members-carousel').slick({
                  infinite: true,
                  slidesToShow: 6,
                  pauseOnHover: true,
                  pauseOnDotsHover: true,
                  slidesToScroll: 6,
                  arrows: false,
                  dots: true,
                  autoplay: true,
                  lazyLoad: 'ondemand',
                  autoplaySpeed: 3400,
                  responsive: [
                      {
                          breakpoint: 1200,
                          settings: {
                              slidesToShow: 6,
                              slidesToScroll: 1,
                              dots: false
                          }
                      },
                      {
                          breakpoint: 992,
                          settings: {
                              slidesToShow: 4,
                              slidesToScroll: 1,
                              dots: false
                          }
                      },
                      {
                          breakpoint: 768,
                          settings: {
                              autoplay: false,
                              slidesToShow: 3,
                              slidesToScroll: 2,
                              dots: false
                          }
                      },
                      {
                          breakpoint: 480,
                          settings: {
                              autoplay: false,
                              slidesToShow: 2,
                              slidesToScroll: 2,
                              dots: false
                          }
                      }
                  ]
              });
          });
    </script>
	";

	set_transient(HOMEPAGE_ORG_CAROUSEL_CACHE_KEY, $output_string, DAY_IN_SECONDS );

	return $output_string;
}

add_shortcode( 'carousel-organizations', 'carousel_organization_logos' );
