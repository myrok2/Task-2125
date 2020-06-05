<article <?php post_class(); ?>>
  <header>
    <h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
    <?php //get_template_part('templates/entry-meta'); ?>
    <?php //the_category(); ?>
  </header>
  <div class="entry-summary">
    <?php echo \Roots\Sage\Utils\excerpt(50); ?>
    <?php //the_excerpt(); ?>
    <?php //the_title(); ?>
  </div>
</article>
