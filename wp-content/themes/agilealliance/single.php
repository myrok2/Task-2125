<?php

$vc_enabled = get_post_meta(get_the_ID(), '_wpb_vc_js_status', true) !== 'false';

// Post types for which comments should be allowed
$comments_enabled = [
  'post',
  'aa_book',
  'aa_event_session',
  'aa_experience_report',
  'aa_glossary',
  'aa_initiative',
  'aa_research_paper',
  'aa_video',
  'aa_podcast',
];

$full_width_if_vc = [
  'post',
  'aa_story',
];

$is_full_width = in_array(get_post_type(), $full_width_if_vc) && $vc_enabled;

$blog_disclaimer = "
  <hr class='aa-blog-single__disclaimer-divider' />
  <p class='aa-blog-single__disclaimer'>
    This is an Agile Alliance community blog post. Opinions represented
    are personal and belong solely to the author. They do not represent opinion or policy of Agile Alliance. 
  </p>
";

$authors = get_users( array(
  'connected_type' => 'user_to_post',
  'connected_items' => $post
) );

?>


  <?php while (have_posts()) : the_post(); ?>

    <?php if ( 'post' === get_post_type() ) : ?>

      <?php $url = wp_get_attachment_url( get_post_thumbnail_id($post->ID) ); ?>
      <header class="full-width-header row" style="background-image: url('<?php echo $url ?>');">
        <div class="aa_img-overlay"></div>
        <div class="fwh-wpr">
          <div class="hidden-xs col-sm-4" style="text-align: right;">
            <?php
              if (count($authors) == 0) {
                echo get_avatar(get_the_author_meta( 'ID'), '105px');
              } else {
                echo "<img alt=\"\" src=\"" . get_template_directory_uri() . "/assets/images/aa_logo_white_background.png\" class=\"avatar avatar-105 photo\" height=\"105\" width=\"105\">";

              }
            ?>
          </div>
          <div class="col-xs-12 col-sm-8">
            <h1 class="entry-title"><?php the_title(); ?></h1>
            <?php get_template_part('templates/entry-meta'); ?>
            <span class="fwh-category">Added to <?php the_category( ' ' ); ?></span>
          </div>
        </div>
      </header>

    <?php endif; ?>

    <div class="<?= $is_full_width ? '' : 'aa-layout' ?>">

    <?php

    /*
     * Content Area
     */



    $defaultRestrictedTemplateId = get_field('default_restricted_template_id', 'option');
    switch (get_post_type()) {
      // Setup Template on live site under WP Admin > Visual Composer > Templates ...use post id below. Template naming scheme "CPT Template -- [Post Type Name]"
      case 'aa_event_session':
        $eventTemplateId = get_field('event_sessions_template_id', 'option');
        $eventTemplateRestricted = get_field('event_sessions_restricted_template_id', 'option') ?: $defaultRestrictedTemplateId;
        echo render_protected(
          '[templatera id="' . $eventTemplateId . '"]',
          '[templatera id="' . $eventTemplateRestricted . '"]');

        break;
      case 'aa_video':
        //echo do_shortcode('[templatera id="1719"]');
        $videoTemplateRestricted = get_field('video_restricted_template_id', 'option') ?: $defaultRestrictedTemplateId;
        $videoTemplateId = get_field('video_template_id', 'option');
        echo render_protected(
          '[templatera id="' . $videoTemplateId . '"]',
          '[templatera id="' . $videoTemplateRestricted . '"]');
        break;
      case 'aa_podcast':
//        echo do_shortcode('[templatera id="8046245"]');
        $podcastTemplateRestricted = get_field('podcast_restricted_template_id', 'option') ?: $defaultRestrictedTemplateId;
        $podcastTemplateId = get_field('podcast_template_id', 'option');
        echo render_protected(
          '[templatera id="' . $podcastTemplateId . '"]',
          '[templatera id="' . $podcastTemplateRestricted . '"]');
        break;
      case 'aa_community_groups':
//        echo do_shortcode('[templatera id="2225"]');
        $communityGroupTemplateRestricted = get_field('community_group_restricted_template_id', 'option') ?: $defaultRestrictedTemplateId;
        $communityGroupTemplateId = get_field('community_group_template_id', 'option');
        echo render_protected(
          '[templatera id="' . $communityGroupTemplateId . '"]',
          '[templatera id="' . $communityGroupTemplateRestricted . '"]');
        break;
      case 'post':
        $wrapper_class = $vc_enabled ? 'aa-blog-single--vc--enabled' : 'aa-blog-single--vc-disabled';
        if ($vc_enabled) {
          echo "<div class='aa-blog-single $wrapper_class'>";
            the_content();
			echo "<div class='aa-blog-single__disclaimer-wrapper'>$blog_disclaimer</div>";
			echo "</div>";
			 break;
			}

        ob_start();
        dynamic_sidebar('sidebar-primary');
        $sidebar = ob_get_contents();
        ob_end_clean();
        echo do_shortcode(sprintf("
          <div class='aa-blog-single %s row'>
            <div class='col-md-8 aa-blog-single__content'>
                %s
                %s
            </div>
            <div class='col-md-4 aa-blog-single__sidebar'>%s</div>
          </div>
        ", $wrapper_class, wpautop(apply_filters('the_content', get_the_content())), $blog_disclaimer, $sidebar));
        break;
      case 'aa_story': // Same as `post` above except with a title
        if ($vc_enabled) {
          the_content();
          break;
        }

        $wrapper_class = $vc_enabled ? 'aa-blog-single--vc--enabled' : 'aa-blog-single--vc-disabled';
        ob_start();
        dynamic_sidebar('sidebar-primary');
        $sidebar = ob_get_contents();
        ob_end_clean();
        echo do_shortcode(sprintf("
          <div class='aa-blog-single %s row'>
            <div class='col-md-8 aa-blog-single__content'>
                <h1 class='entry-title'>%s</h1>
                %s
             </div>
            <div class='col-md-4 aa-blog-single__sidebar'>%s</div>
          </div>
        ", $wrapper_class, get_the_title(), wpautop(apply_filters('the_content', get_the_content())), $sidebar));
        break;
      default:
        the_content();
					    }
		 		     ?>


    <?php // This forces specific VC rows to act as if they had the "Stretch Content" option applied. ?>
    <script type="text/javascript">
      jQuery(function($) {
        $('.aa_page-header:not([data-vc-full-width]), .aa_sub-menu-wpr:not([data-vc-full-width])')
          .attr('data-vc-full-width', true)
          .attr('data-vc-stretch-content', true)
          .after('<div class="vc_row-full-width vc_clearfix" />');
      });
    </script>

    <?php // Conditionally output disqus comments based on array defined at the top of this file ?>
    <?php if (in_array(get_post_type(), $comments_enabled)) : ?>
      <div class="row">
        <hr class="section-border-hr">
      </div>
      <div class="aa-disqus <?= $vc_enabled ? 'aa-disqus--vs-enabled' : '' ?>">
        <?php comments_template('/templates/comments.php'); ?>
      </div>
    <?php endif; ?>

  </div>

<?php endwhile; ?>

