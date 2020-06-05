<?php
add_action('init','svc_post_grid_register_style_script');
function svc_post_grid_register_style_script(){
	wp_register_style( 'svc-animate-css', plugins_url('../assets/css/animate.css', __FILE__));
	
	//wp_register_style( 'svc-bootstrap-css', plugins_url('../assets/css/bootstrap.css', __FILE__));

	wp_register_style( 'svc-megnific-css', plugins_url('../assets/css/magnific-popup.css', __FILE__));
	wp_register_script('svc-megnific-js', plugins_url('../assets/js/megnific.js', __FILE__), array("jquery"), false, false);
	
	wp_register_script('svc-isotop-js', plugins_url('../assets/js/isotope.pkgd.min.js', __FILE__), array("jquery"), false, false);
	
	wp_register_script('svc-imagesloaded-js', plugins_url('../assets/js/imagesloaded.pkgd.min.js', __FILE__), array("jquery"), false, false);
	wp_register_script('svc-ddslick-js', plugins_url('../assets/js/jquery.ddslick.min.js', __FILE__), array("jquery"), false, false);
	wp_register_script('svc-script-js', plugins_url('../assets/js/script.js', __FILE__), array("jquery"), false, false);
	wp_register_script('svc-carousel-js', plugins_url('../assets/js/owl.carousel.min.js', __FILE__), array("jquery"), false, false);
	wp_register_script('svc-flip-js', plugins_url('../assets/js/jquery.flip.min.js', __FILE__), array("jquery"),
		false, false);
}
add_action('wp_head','svc_inline_css_for_imageloaded');
function svc_inline_css_for_imageloaded(){
	?>
    <style>
	.svc_post_grid_list_container{ display:none;}
	#loader {background-image: url("<?php echo plugins_url('../addons/post-grid/css/loader.GIF',__FILE__);?>");}
	</style>
    <?php	
}
function svc_post_layout_excerpt($excerpt,$limit) {
	$excerpt = strip_tags($excerpt);
	$excerpt = explode(' ', $excerpt, $limit);
	if (count($excerpt)>=$limit) {
		array_pop($excerpt);
		$excerpt = implode(" ",$excerpt).'...';
	} else {
		$excerpt = implode(" ",$excerpt);
	} 
	$excerpt = preg_replace('`\[[^\]]*\]`','',$excerpt);
	return $excerpt;
}

add_action('wp_ajax_svc_layout_post','svc_layout_post');
add_action('wp_ajax_nopriv_svc_layout_post','svc_layout_post');
function svc_layout_post(){
	extract($_POST);
	echo do_shortcode('[svc_post_layout 
		query_loop="'.$query_loop.'" 
		grid_link_target="'.$grid_link_target.'" 
		grid_layout_mode="'.$grid_layout_mode.'" 
		grid_columns_count_for_desktop="'.$grid_columns_count_for_desktop.'" 
		grid_columns_count_for_tablet="'.$grid_columns_count_for_tablet.'" 
		grid_columns_count_for_mobile="'.$grid_columns_count_for_mobile.'" 
		grid_thumb_size="'.$grid_thumb_size.'" 
		svc_excerpt_length="'.$svc_excerpt_length.'" 
		skin_type="'.$skin_type.'" 
		title="'.$title.'" 
		effect="'.$effect.'" 
		read_more="'.$read_more.'" 
		svc_class="'.$svc_class.'" 
		dexcerpt="'.$dexcerpt.'" 
		dfeatured="'.$dfeatured.'" 
		dpost_popup="'.$dpost_popup.'" 
		dcategory="'.$dcategory.'" 
		dmeta_data="'.$dmeta_data.'" 
		dimg_popup="'.$dimg_popup.'" 
		dsocial="'.$dsocial.'" 
		pbgcolor="'.$pbgcolor.'" 
		pbghcolor="'.$pbghcolor.'" 
		tcolor="'.$tcolor.'" 
		thcolor="'.$thcolor.'" 
		load_more_color="'.$load_more_color.'" 
		popup_bgcolor="'.$popup_bgcolor.'" 
		popup_line_color="'.$popup_line_color.'" 
		popup_max_width="'.$popup_max_width.'" 
		paged="'.$paged.'" 
		svc_grid_id="'.$svc_grid_id.'" 
		ajax="1" 
		show_featured_image="'.$show_featured_image.'" 
		search_keyword="'.$search_keyword.'" ]');
	die();
}

add_action('wp_ajax_svc_post_layout_carousel','svc_post_layout_carousel');
add_action('wp_ajax_nopriv_svc_post_layout_carousel','svc_post_layout_carousel');
function svc_post_layout_carousel(){
	extract($_POST);
	echo do_shortcode('[svc_post_layout svc_type="'.$svc_type.'" query_loop="'.$query_loop.'" grid_link_target="'.$grid_link_target.'" grid_layout_mode="'.$grid_layout_mode.'" grid_thumb_size="'.$grid_thumb_size.'" svc_excerpt_length="'.$svc_excerpt_length.'" skin_type="'.$skin_type.'" title="'.$title.'" read_more="'.$read_more.'" svc_class="'.$svc_class.'" dexcerpt="'.$dexcerpt.'" dfeatured="'.$dfeatured.'" dpost_popup="'.$dpost_popup.'" dcategory="'.$dcategory.'" dmeta_data="'.$dmeta_data.'" dimg_popup="'.$dimg_popup.'" dsocial="'.$dsocial.'" pbgcolor="'.$pbgcolor.'" pbghcolor="'.$pbghcolor.'" tcolor="'.$tcolor.'" thcolor="'.$thcolor.'" paged="'.$paged.'" svc_grid_id="'.$svc_grid_id.'" ajax="1"]');
	die();
}

add_action('wp_ajax_svc_inline_post_popup','svc_inline_post_popup');
add_action('wp_ajax_nopriv_svc_inline_post_popup','svc_inline_post_popup');
function svc_inline_post_popup(){
	extract($_GET);
	$post = get_post($pid);
	$post_type = $post->post_type;
    $content = apply_filters('the_content', $post->post_content);
	?>
	<div class="svc-magnific-popup-container svc-magnific-popup-container-<?php echo $pid;?>">
    <style type="text/css">
	<?php if($bgcolor != ''){?>
	.svc-magnific-popup-container{background-color:#<?php echo $bgcolor;?> !important;}
	<?php }
	if($line_color != ''){?>
	.svc-magnific-popup-container{border-bottom-color:#<?php echo $line_color;?> !important;}
	<?php }
	if($max_width != ''){?>
	.svc-magnific-popup-container{max-width:<?php echo $max_width;?>px !important;}
	<?php }?>
	.svc-popup-img-div{ text-align:center; line-height:0;}
	.svc-content-container{padding:0; width:auto;}
	.svc-magnific-popup-container .svc_post_cat{ margin-bottom:10px;}
	.svc-magnific-popup-container .svc_social_share > ul li{margin-right: 0px !important;padding: 3px 6px;float:left;margin-bottom:0px; list-style:none;}
	.svc-magnific-popup-container .svc_social_share{display: inline-block;float: none;position: relative;margin-top:10px;}
	.svc-magnific-popup-container .svc_social_share ul{ padding:0px !important; text-indent:0 !important;}
	.svc-magnific-popup-container .svc_social_share > ul li a {font-size: 13px;color:#fff !important;}
	.svc-magnific-popup-container .svc_social_share > ul li:first-child{background:#6CDFEA;}
	.svc-magnific-popup-container .svc_social_share > ul li:nth-child(2){background:#3B5998;padding:3px 8.5px !important;}
	.svc-magnific-popup-container .svc_social_share > ul li:nth-child(3){background:#995fb6;}
	</style>
    <?php if($fi != 'yes'){?>
	<div class="svc-popup-img-div"><?php echo get_the_post_thumbnail( $pid, 'full'); ?></div>
    <?php }?>
	<div class="svc-content-container">
	<h1><?php echo get_the_title($pid);?></h1>
	<?php 
	$tax_co= 0;
	$post_taxonomies = get_object_taxonomies( $post_type );
	for($i = 0;$i < count($post_taxonomies); $i++){
		if($post_taxonomies[$i] == 'post_format'){
			unset($post_taxonomies[$i]);
		}
	}
	foreach ($post_taxonomies as $taxonomy) {
		if($taxonomy != 'post_tag'){
			$terms = get_the_terms( $pid, $taxonomy );
			if ($tax_co==0){?>
			<div class="svc_post_cat">
				<i class="fa fa-tags"></i>
			<?php }
			if ( !empty( $terms ) ) {
			  foreach ( $terms as $term ) {
			  if($tax_co>0){echo ', ';}
			  ?>
				 <a href="<?php echo get_term_link( $term->slug, $taxonomy );?>"><?php echo $term->name;?></a>
			<?php
			$tax_co++;
			  }
			}
		}
	}
	if($tax_co!= 0 ){?>
	</div>
	<?php }
	echo $content;?>
	<div class="svc_social_share">
		<ul>
		  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
		  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
		  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
		</ul>
	</div>
	</div>
	</div>
	<?php
	die();
}
function svc_kriesi_pagination($pages = '',$svc_grid_id, $range = 2)
{  
     $showitems = ($range * 2)+1;  

     global $paged;
     if(empty($paged)) $paged = 1;

     if($pages == '')
     {
         global $wp_query;
         $pages = $wp_query->max_num_pages;
         if(!$pages)
         {
             $pages = 1;
         }
     }   

     if(1 != $pages)
     {
         echo "<div class='svc_pagination svc_pagination_".$svc_grid_id."'>";
         //if($paged > 2 && $paged > $range+1 && $showitems < $pages) echo "<a href='".get_pagenum_link(1)."'>&laquo;</a>";
         if($paged > 1 && $showitems < $pages) echo "<a href='".get_pagenum_link($paged - 1)."'>&lsaquo;</a>";

         for ($i=1; $i <= $pages; $i++)
         {
             //if (1 != $pages &&( !($i >= $paged+$range+1 || $i <= $paged-$range-1) || $pages <= $showitems )){
                 echo ($paged == $i)? "<a href='".get_pagenum_link($i)."' class='current' page='".$i."'>".$i."</span>":"<a href='".get_pagenum_link($i)."' class='inactive' page='".$i."'>".$i."</a>";
             //}
         }

         //if ($paged < $pages && $showitems < $pages) echo "<a href='".get_pagenum_link($paged + 1)."' page='".($paged + 1)."'>&rsaquo;</a>";  
         //if ($paged < $pages-1 &&  $paged+$range-1 < $pages && $showitems < $pages) echo "<a href='".get_pagenum_link($pages)."' page='".($pages)."'>&raquo;</a>";
         echo "</div>\n";
     }
}
?>
