<?php
//Podcast Shortcodes


function podcast_embed() {?>

	<?php if( get_field( "podcast_code" ) ): ?>

  <div class="podcast-wrapper">
    <?php echo the_field('podcast_code', false, false);?>
  </div>

	<?php endif; ?>

<?php }
add_shortcode( 'aa-podcast-embed', 'podcast_embed' );