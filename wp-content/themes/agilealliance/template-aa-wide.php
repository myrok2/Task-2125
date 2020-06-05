<?php
/**
 * Template Name: AA Layout - Wide (1280px)
 */
?>

<?php while (have_posts()) : the_post(); ?>
  <div class="aa-layout aa-layout--wide">
    <?php get_template_part('templates/content', 'page'); ?>
  </div>
<?php endwhile; ?>
