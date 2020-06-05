<?php
//Videos Shortcodes


function video_vimeo_id_embed() {

    ob_start();

    ?>

	<?php if( get_field( "vimeo_video_id" ) ) {
		$vimeoId = get_field( "vimeo_video_id" );
		$videoContent =  '<div class="wpb_wrapper">

			<div class="wpb_video_widget wpb_content_element">
				<div class="wpb_wrapper">

					<div class="wpb_video_wrapper"><div class="entry-content-asset"><iframe src="https://player.vimeo.com/video/' . $vimeoId . '" width="500" height="281" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div></div>
				</div>
			</div>
			<div class="vc_empty_space" style="height: 1em"><span class="vc_empty_space_inner"></span></div>
		</div>';
		echo render_protected($videoContent, '');

	}

	?>

    <?php

    return ob_get_clean();

 }

add_shortcode( 'aa-vimeo-embed', 'video_vimeo_id_embed' );
