<?php
/**
 * Template Name: AA Layout - Narrow (800px)
 */
?>

<?php while (have_posts()) : the_post(); ?>
  <div class="aa-layout aa-layout--narrow">
    <?php get_template_part('templates/content', 'page'); ?>
  </div>
<?php endwhile; ?>
