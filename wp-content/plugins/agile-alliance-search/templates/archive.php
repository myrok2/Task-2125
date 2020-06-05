<?php
  use function aa\search\displayAASearch;
  $queried_object = get_queried_object();
  $use_custom_search = array_key_exists($queried_object->taxonomy, aa\search\config\allowed_taxonomies());
  $taxonomy = get_taxonomy($queried_object->taxonomy);
?>

<div class="aa-layout aa-layout--wide">
  <h1 style="margin-top: 50px;"><?= $taxonomy->labels->singular_name ?>: <?= $queried_object->name ?></h1>
  <?php if($queried_object && $use_custom_search): ?>
    <?php displayAASearch(["filter_{$queried_object->taxonomy}" => $queried_object->name]); ?>
  <?php else: ?>
    <?php while (have_posts()) : the_post(); ?>
      <?php get_template_part('templates/content', get_post_type() != 'post' ? get_post_type() : get_post_format()); ?>
    <?php endwhile; ?>
    <?php the_posts_navigation(); ?>
  <?php endif; ?>
</div>

