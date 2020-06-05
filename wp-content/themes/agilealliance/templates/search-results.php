<style>
  .aa_search-results article {
    margin-bottom: 1em !important;
  }
</style>

<div class="container aa_search-results">
  <div class="row">

    <div class="page-header header">

      <h1>
        Search Results for
        <br>
        "<?php echo esc_html( get_search_query( false ) ); ?>"
      </h1>

      <?php \Roots\Sage\Utils\get_search_form(); ?>

      <?php if (have_posts()) : ?>
        <!-- Number of posts on page with Total for both Page and Grand -->
        <?php
          $num_of_posts = 6;
          $count = $wp_query->post_count;
          $page_number = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
          $query_total = $wp_query->found_posts;

          if (!$num_of_posts > $count) {
            $page_post_total = $page_number * $count;
          } else {
            $page_post_total = ($page_number * $num_of_posts) - ($num_of_posts - $count);
          }

          $page_first_post = ($page_post_total + 1) - $count;
        ?>

        <p class="query-result-info">
          Showing
          <span><?php echo $page_first_post ?>-<?php echo $page_post_total ?></span>
          results out of
          <span><?php echo $query_total ?></span>
        </p>
      <?php endif; ?>

    </div><!-- .page-header header -->

    <?php if (!have_posts()) : ?>
      <div class="alert alert-warning">
        <?php _e('Sorry, no results were found.', 'sage'); ?>
      </div>
    <?php endif; ?>

    <?php while (have_posts()) : the_post(); ?>
      <?php get_template_part('templates/content', 'search'); ?>
    <?php endwhile; ?>

  </div>
</div>

<div class="container aa_post-pagination">
  <div class="row">
    <div class="col-xs-12">
      <div class="search-navigation">
        <?php
          $pagination = get_the_posts_pagination( array(
              'mid_size' => 1,
              'prev_text' => __( '< Previous', 'textdomain' ),
              'next_text' => __( 'Next >', 'textdomain' ),
          ) );

          echo $pagination;
        ?>
      </div>
    </div>
  </div>
</div>
