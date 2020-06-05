<?php
/**
 * Template Name: AA Layout - Standard (1080px)
 */
?>

<?php while (have_posts()) : the_post(); ?>
  <div class="aa-layout">
    <?php get_template_part('templates/content', 'page'); ?>
  </div>
<?php endwhile; ?>
