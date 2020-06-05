<?php while (have_posts()) : the_post(); ?>
  <?php get_template_part('templates/page', 'header'); ?>

  <?php if (is_page( 'blog' )) {
    get_template_part('templates/content', 'blog');
  } else {
    get_template_part('templates/content', 'page');
  }
   ?>
<?php endwhile; ?>