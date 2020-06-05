<?php

function cpt_type_days_ago() {
  $post = new stdClass(); // Creating post object.
  $post->id = get_the_ID();
  $post_type = get_post_type( $post->id );
  $resource_type = get_post_type_object($post_type);
  $archive_url = dirname($post->link);
?>

<div class="aa_cpt-bottom-details">
  <?php echo $post_type; ?>
  <?php // Display the Item Category ?>
  <div class="aa_cpt-post-category">
    <a href="<?php echo $archive_url ?>" class="<?php echo $post_type ?>"><?php echo $resource_type->label; ?></a>
  </div>
</div>

    <div class="aa_cpt-post-date">
        <p><?php echo human_time_diff( get_the_time('U'), current_time('timestamp') ) . ' ago'; ?></p>
    </div>

  <?php
}
add_shortcode( 'cpt-type-days-ago', 'cpt_type_days_ago' );