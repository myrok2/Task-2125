<?php
/**
 * Template Name: Full Width Page
 */
?>

<?php while (have_posts()) : the_post(); ?>
 <?php
  if ( is_front_page() && is_home() ) {
    // Default homepage
  } elseif ( is_front_page() ) {
    // static homepage
  } elseif ( is_home() ) {
    // blog page
  } else {
     get_template_part('templates/page', 'header');
  }
  ?>
  <?php get_template_part('templates/content', 'page'); ?>
<?php endwhile; ?>
