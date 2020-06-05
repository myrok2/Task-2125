<?php
function svc_post_layout_shortcode($attr,$content=null){
	extract(shortcode_atts( array(
		'title' => '',
		'svc_type' => 'post_layout',
		'query_loop' => '',
		'skin_type' => 's4',
		'car_display_item' => '6',
		'car_pagination' => '',
		'car_pagination_num' => '',
		'car_navigation' => '',
		'car_autoplay' => '',
		'car_autoplay_time' => '5',
		'car_loadmore' => '',
		'synced' => '',
		'synced_display' => '10',
		'car_transition' => '',
		'grid_columns_count_for_desktop' => 'col-md-2',
		'grid_columns_count_for_tablet' => 'col-sm-3',
		'grid_columns_count_for_mobile' => 'col-xs-12',
		'grid_link_target' => 'sw',
		'filter' => '',
		'sort_filter' => '',
		'grid_list_filter' => '',
		'exclude_texo' => '',
		'filter_type' => 'dropdown',
		'count_display' => '',
		'grid_layout_mode' => 'fitRows',
		'grid_thumb_size' => 'full',
		's5_min_height' => '150',
		'svc_excerpt_length' => '20',
		'load_more' => 'loadmore',
		'hide_showmore' => '',
		'effect' => '',
		'read_more' => '',
		'loadmore_text' => '',
		'car_loadmore_text' => '',
		'show_featured_image' => false,
		'svc_class' => '',
		'dexcerpt' => '',
		'dcategory' => '',
		'dmeta_data' => '',
		'dsocial' => 'no',
		'dpost_popup' => '',
		'dimg_popup' => '',
		'pbgcolor' => '',
		'pbghcolor' => '',
		'ps8o_bgcolor' => '',
		'ps8_bgcolor' => '',
		'line_color' => '',
		'tcolor' => '',
		'thcolor' => '',
		'load_more_color' => '',
		'filter_text_color' => '',
		'filter_text_active_color' => '',
		'filter_text_active_bgcolor' => '',
		'pagination_bgcolor' => '',
		'pagination_active_bgcolor' => '',
		'pagination_number_color' => '',
		'car_navigation_color' => '',
		'dfeatured' => '',
		'popup_bgcolor' => '',
		'popup_line_color' => '',
		'popup_max_width' => '600',
		'popup_effect' => '',
		'paged' => '1',
		'svc_grid_id' => '',
		'ajax' => '0',
		'enable_search' => 'false',
		'search_keyword' => ''
	), $attr));

	wp_register_style( 'svc-post-grid-css', plugins_url('css/css.css', __FILE__));
	wp_enqueue_style( 'svc-post-grid-css');
	wp_enqueue_style( 'svc-bootstrap-css' );
	wp_enqueue_style( 'svc-megnific-css' );
	wp_enqueue_style( 'svc-animate-css');
	
	wp_enqueue_script('svc-imagesloaded-js');
	wp_enqueue_script('svc-isotop-js');
	wp_enqueue_script('svc-script-js');
	wp_enqueue_script('svc-megnific-js');
	wp_enqueue_script('svc-ddslick-js');
	wp_enqueue_script('svc-carousel-js');
	wp_enqueue_script('svc-flip-js');
	
	
	$var = get_defined_vars();
	$loop=$query_loop;
	$posts = array();
	if(empty($loop)) return;

	//$paged = 1;
	$query=$query_loop;
	$query=explode('|',$query);
	
	$query_posts_per_page=10;
	$query_post_type='post';
	$query_meta_key='';
	$query_orderby='date';
	$query_order='ASC';
	
	$query_by_id='';
	$query_by_id_not_in='';
	$query_by_id_in='';
	
	$query_categories='';
	$query_cat_not_in='';
	$query_cat_in='';

	$query_tags='';
	$query_tags_in='';
	$query_tags_not_in='';
	
	$query_author='';
	$query_author_in='';
	$query_author_not_in='';
	
	$query_tax_query='';
	
	foreach($query as $query_part)
	{
		$q_part=explode(':',$query_part);
		switch($q_part[0])
		{
			case 'post_type':
				$query_post_type=explode(',',$q_part[1]);
			break;
			
			case 'size':
				$query_posts_per_page=($q_part[1]=='All' ? -1:$q_part[1]);
			break;
			
			case 'order_by':
				
				$query_meta_key='';
				$query_orderby='';
				
				$public_orders_array=array('ID','date','author','title','modified','rand','comment_count','menu_order');
				if(in_array($q_part[1],$public_orders_array))
				{
					$query_orderby=$q_part[1];
				}else
				{
					$query_meta_key=$q_part[1];
					$query_orderby='meta_value_num';
				}
				
			break;
			
			case 'order':
				$query_order=$q_part[1];
			break;
			
			case 'by_id':
				$query_by_id=explode(',',$q_part[1]);
				$query_by_id_not_in=array();
				$query_by_id_in=array();
				foreach($query_by_id as $ids)
				{
					if($ids<0)
					{
						$query_by_id_not_in[]=$ids;
					}else{
						$query_by_id_in[]=$ids;
					}
				}
			break;
			
			case 'categories':
				$query_categories=explode(',',$q_part[1]);
				$query_cat_not_in=array();
				$query_cat_in=array();
				foreach($query_categories as $cat)
				{
					if($cat<0)
					{
						$query_cat_not_in[]=$cat;
					}else
					{
						$query_cat_in[]=$cat;
					}
				}
			break;
			
			case 'tags':
				$query_tags=explode(',',$q_part[1]);
				$query_tags_not_in=array();
				$query_tags_in=array();
				foreach($query_tags as $tags)
				{
					if($tags<0)
					{
						$query_tags_not_in[]=$tags;
					}else
					{
						$query_tags_in[]=$tags;
					}
				}
			break;
			
			case 'authors':
				$query_author=explode(',',$q_part[1]);
				$query_author_not_in=array();
				$query_author_in=array();
				foreach($query_author as $author)
				{
					if($tags<0)
					{
						$query_author_not_in[]=$author;
					}else
					{
						$query_author_in[]=$author;
					}
				}
				
			break;

			case 'tax_query':
				$all_tax=get_object_taxonomies( $query_post_type );

				$tax_query=array();
				$query_tax_query=array('relation' => 'AND');
				foreach ( $all_tax as $tax ) {
					$values=$tax;
					$query_taxs_in=array();
					$query_taxs_not_in=array();
					
					$query_taxs=explode(',',$q_part[1]);
					foreach($query_taxs as $taxs)
					{
						if(term_exists( absint($taxs), $tax )){
							if($taxs<0)
							{
								$query_taxs_not_in[]=absint($taxs);
							}else
							{
								$query_taxs_in[]=$taxs;
							}
						}
					}

					if(count($query_taxs_not_in)>0)
					{
						$query_tax_query[]=array(
							'taxonomy' => $tax,
							'field'    => 'id',
							'terms'    => $query_taxs_not_in,
							'operator' => 'NOT IN',
						);
					}else if(count($query_taxs_in)>0)
					{
						$query_tax_query[]=array(
							'taxonomy' => $tax,
							'field'    => 'id',
							'terms'    => $query_taxs_in,
							'operator' => 'IN',
						);
					}
					
					//break;
				}
				
			break;
		}
	}

	$query_final=array(
		'post_type' => $query_post_type,
		'post_status'=>'publish',
		'posts_per_page'=>$query_posts_per_page,
		'meta_key' => $query_meta_key,
		'orderby' => $query_orderby,
		'order' => $query_order,
		'paged'=>$paged,
		
		'post__in'=>$query_by_id_in,
		'post__not_in'=>$query_by_id_not_in,
		
		'category__in'=>$query_cat_in,
		'category__not_in'=>$query_cat_not_in,
		
		'tag__in'=>$query_tags_in,
		'tag__not_in'=>$query_tags_not_in,
		
		'author__in'=>$query_author_in,
		'author__not_in'=>$query_author_not_in,
		
		'tax_query'=>$query_tax_query
	 );

	 if (!empty($search_keyword)) {
	    $query_final['s'] = $search_keyword;
	 }

	$exclude_texo_array = explode(',',$exclude_texo);
	$my_query = new WP_Query($query_final);

	if(!$ajax){
		$svc_grid_id = rand(50,1000);
	}
	$var['svc_grid_id'] = $svc_grid_id;
	$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;

	ob_start();
	?>

	<script>
		(function($) {
			var doc = $(document);
			doc.trigger('publish', [
				'<?php echo $my_query->found_posts?>',
				'<?php echo $my_query->max_num_pages;?>'
			]);
		})(jQuery);
	</script>

	<?php
	if ($enable_search === 'true') {
		include_once('post-grid-search.php');
	}

	if(!$ajax){
	?>
	<style type="text/css">
	<?php if($filter_text_color != ''){?>
	.svc_categories_filter_<?php echo $svc_grid_id;?> li a{color:<?php echo $filter_text_color;?> !important;border:1px solid <?php echo $filter_text_color;?> !important;}
	<?php }?>
	.svc_categories_filter_<?php echo $svc_grid_id;?> li a.active{color:<?php echo $filter_text_active_color;?> !important;background:<?php echo $filter_text_active_bgcolor;?> !important;}
	<?php if($grid_list_filter == 'yes'){?>
	.svc_view_type_div_<?php echo $svc_grid_id;?>{ background:<?php echo $filter_text_active_bgcolor;?> !important;}
	.svc_view_type_div_<?php echo $svc_grid_id;?> div{color:<?php echo $filter_text_active_color;?> !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?>.svc_post_grid_s6 article header,div.svc_post_grid_<?php echo $svc_grid_id;?>.svc_post_grid_s6 article,div.svc_post_grid_<?php echo $svc_grid_id;?>.svc_post_grid_s6 article{ border-bottom:0px !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?>.svc_post_grid_s6 article{ border-top:0px !important;}
	<?php }?>
	/*for dropdown start*/
	<?php if($filter_text_active_bgcolor != ''){?>
	#svc_categories_filter_<?php echo $svc_grid_id;?>0 .dd-select,
	#svc_categories_filter_<?php echo $svc_grid_id;?>1 .dd-select,
	#svc_categories_filter_<?php echo $svc_grid_id;?>2 .dd-select,
	#svc_categories_filter_<?php echo $svc_grid_id;?>3 .dd-select,
	#svc_categories_filter_<?php echo $svc_grid_id;?>4 .dd-select{border-color:<?php echo $filter_text_active_bgcolor;?> !important;background:<?php echo $filter_text_active_bgcolor;?> !important;}
	.svc_sort_div_<?php echo $svc_grid_id;?>{background:<?php echo $filter_text_active_bgcolor;?> !important;}
	<?php }
	if($filter_text_active_color != ''){?>
	#svc_categories_filter_<?php echo $svc_grid_id;?>0 .dd-pointer.dd-pointer-down,
	#svc_categories_filter_<?php echo $svc_grid_id;?>1 .dd-pointer.dd-pointer-down,
	#svc_categories_filter_<?php echo $svc_grid_id;?>2 .dd-pointer.dd-pointer-down,
	#svc_categories_filter_<?php echo $svc_grid_id;?>3 .dd-pointer.dd-pointer-down,
	#svc_categories_filter_<?php echo $svc_grid_id;?>4 .dd-pointer.dd-pointer-down{border-color:<?php echo $filter_text_active_color;?> transparent transparent !important;}
	#svc_categories_filter_<?php echo $svc_grid_id;?>0 .dd-pointer.dd-pointer-down.dd-pointer-up,
	#svc_categories_filter_<?php echo $svc_grid_id;?>1 .dd-pointer.dd-pointer-down.dd-pointer-up,
	#svc_categories_filter_<?php echo $svc_grid_id;?>2 .dd-pointer.dd-pointer-down.dd-pointer-up,
	#svc_categories_filter_<?php echo $svc_grid_id;?>3 .dd-pointer.dd-pointer-down.dd-pointer-up,
	#svc_categories_filter_<?php echo $svc_grid_id;?>4 .dd-pointer.dd-pointer-down.dd-pointer-up{border-color:transparent transparent <?php echo $filter_text_active_color;?> !important;}
	#svc_categories_filter_<?php echo $svc_grid_id;?>0 .dd-selected,
	#svc_categories_filter_<?php echo $svc_grid_id;?>1 .dd-selected,
	#svc_categories_filter_<?php echo $svc_grid_id;?>2 .dd-selected,
	#svc_categories_filter_<?php echo $svc_grid_id;?>3 .dd-selected,
	#svc_categories_filter_<?php echo $svc_grid_id;?>4 .dd-selected{color:<?php echo $filter_text_active_color;?> !important;}
	.svc_sort_div_<?php echo $svc_grid_id;?>,.svc_sort_div_<?php echo $svc_grid_id;?> a{color:<?php echo $filter_text_active_color;?> !important;}
	<?php }?>
	/*for dropdown end*/
	<?php if($skin_type == 's8' || $skin_type == 's9' || $skin_type == 's10'){
		if($ps8_bgcolor != ''){?>
	div.svc_post_grid_s8.svc_post_grid_<?php echo $svc_grid_id;?> article section{ background:<?php echo $ps8_bgcolor;?> !important;}
	div.svc_post_grid_s9.svc_post_grid_<?php echo $svc_grid_id;?> article figcaption{background:<?php echo $ps8_bgcolor;?> !important;}
	div.svc_post_grid_s10.svc_post_grid_<?php echo $svc_grid_id;?> article figcaption{background:<?php echo $ps8_bgcolor;?> !important;}
	<?php }
	if($ps8o_bgcolor != ''){?>
	div.svc_post_grid_s8.svc_post_grid_<?php echo $svc_grid_id;?> article section.s8_no_image{ background:<?php echo $ps8o_bgcolor;?> !important;}
	<?php }
	}
	if($skin_type != 's7'){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article{ background:<?php echo $pbgcolor;?> !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?> article:hover{ background:<?php echo $pbghcolor;?> !important;}
	<?php }elseif($skin_type == 's7'){?>
	ul.svc_post_grid_<?php echo $svc_grid_id;?> li.svc_event{ background:<?php echo $pbgcolor;?> !important;}
	ul.svc_post_grid_<?php echo $svc_grid_id;?> li.svc_event:hover{ background:<?php echo $pbghcolor;?> !important;}
	<?php }?>
	<?php if($skin_type == 's1' && $line_color != ''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article header{border-bottom: 3px solid <?php echo $line_color;?> !important;}
	<?php }
	if($skin_type == 's2' && $line_color != ''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article{border-bottom: 3px solid <?php echo $line_color;?> !important;}
	<?php }
	if($skin_type == 's4' && $line_color != ''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article{border-top: 5px solid <?php echo $line_color;?> !important;}
	<?php }
	if($skin_type == 's1' || $skin_type == 's2' || $skin_type == 's4' || $skin_type == 's5' || $skin_type == 's8'){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article section p a.svc_title{color:<?php echo $tcolor;?> !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?> article section p a.svc_title:hover{color:<?php echo $thcolor;?> !important;}
	<?php }
	if($skin_type == 's7'){?>
	ul.svc_post_grid_<?php echo $svc_grid_id;?> li.svc_event section p a.svc_title{color:<?php echo $tcolor;?> !important;}
	ul.svc_post_grid_<?php echo $svc_grid_id;?> li.svc_event section p a.svc_title:hover{color:<?php echo $thcolor;?> !important;}
	<?php }
	if($skin_type == 's9' || $skin_type == 's10'){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article figcaption h3 a{color:<?php echo $tcolor;?> !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?> article figcaption h3 a:hover{color:<?php echo $thcolor;?> !important;}
	<?php }
	if(($skin_type == 's5' || $skin_type == 's8') && $s5_min_height!=''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article .relative_div{ min-height:<?php echo $s5_min_height;?>px !important;}
	<?php }
	if($skin_type == 's5' && $pbghcolor!=''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article:hover{ border-bottom:5px solid <?php echo $pbghcolor;?> !important;}
	<?php }
	if($skin_type == 's5' && $pbgcolor!=''){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article{ border-bottom:5px solid <?php echo $pbgcolor;?> !important;}
	<?php }
	if($skin_type == 's3' || $skin_type == 's6'){?>
	div.svc_post_grid_<?php echo $svc_grid_id;?> article header p a.svc_title{color:<?php echo $tcolor;?> !important;}
	div.svc_post_grid_<?php echo $svc_grid_id;?> article header p a.svc_title:hover{color:<?php echo $thcolor;?> !important;}
	<?php }?>
	nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner .ui-spinner .side .fill{ background:<?php echo $load_more_color;?> !important;}
	<?php if($pagination_bgcolor != ''){?>
	.svc_pagination_<?php echo $svc_grid_id;?> a{ background:<?php echo $pagination_bgcolor;?> !important;}
	<?php }
	if($pagination_active_bgcolor != ''){?>
	.svc_pagination_<?php echo $svc_grid_id;?> a:hover,.svc_pagination_<?php echo $svc_grid_id;?> .current{background:<?php echo $pagination_active_bgcolor;?> !important;}
	<?php }
	if($pagination_number_color != ''){?>
	.svc_pagination_<?php echo $svc_grid_id;?> a:hover,.svc_pagination_<?php echo $svc_grid_id;?> a{color:<?php echo $pagination_number_color;?> !important;}
	<?php }
	if($svc_type == 'carousel' && $car_navigation_color != ''){?>
	.svc_carousel_container_<?php echo $svc_grid_id;?>.owl-theme .owl-controls .owl-buttons div,.svc_carousel_container_<?php echo $svc_grid_id;?>.owl-theme .owl-controls .owl-page span{ background:<?php echo $car_navigation_color;?> !important;}
	.svc_carousel2_container_<?php echo $svc_grid_id;?> .owl-item.synced:after{border-bottom: 8px solid <?php echo $car_navigation_color;?> !important;}
	.svc_carousel2_container_<?php echo $svc_grid_id;?> .owl-item.synced:before {border-bottom: 3px solid <?php echo $car_navigation_color;?> !important;}
	<?php }
	if($car_loadmore == 'yes'){?>
		nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner .ui-spinner .side .fill{ background:<?php echo $car_navigation_color;?> !important;}
	<?php }?>
	</style>
	<div class="svc_post_grid_list <?php echo $svc_class;?>">
	<?php if($title != ''){?>
	<div class="svc_grid_title"><?php echo $title;?></div>
	<?php }?>
	<div class="svc_mask <?php echo $svc_class;?>" id="svc_mask_<?php echo $svc_grid_id;?>">
		<div id="loader"></div>
	</div>

	<div class="svc_post_grid_list_container <?php echo $svc_class;?>" id="svc_post_grid_list_container_<?php echo $svc_grid_id;?>">
	<?php 
	if($svc_type != 'carousel'){
	$cpt = 0;
	$u=0;
	foreach($query_post_type as $post_type_cat){
		$cpt++;
		if($post_type_cat){
		$taxonomy_names = get_object_taxonomies( $post_type_cat );
		for($i = 0;$i < count($taxonomy_names); $i++){
			if($taxonomy_names[$i] == 'post_format'){
				unset($taxonomy_names[$i]);
			}
		}
		$u=0;
		$taxonomiess = $taxonomy_names;?>
        <div class="svc_filter_main_div">
        <?php
		//echo "<pre>";print_r($taxonomiess);
		foreach($taxonomiess as $taxonomies){
			if(!in_array($taxonomies,$exclude_texo_array)){
			$args = array(
				'exclude' => $query_cat_not_in,
				'include' => $query_cat_in,
			);
			$terms = get_terms($taxonomies, $args);
			$for_liner = '';
			if($filter == 'yes' && count($terms) > 0){
			$texono_name = get_taxonomy($taxonomies);
			if($filter_type != 'dropdown'){$for_liner = '_for_liner';}?>
			<div class="filter_child_divs<?php echo $for_liner;?> filter_child_divs_<?php echo $svc_grid_id;?> <?php if($filter_type != 'dropdown'){echo 'svc_clear';}?>">
			<?php if($filter_type == 'dropdown'){?>
				<select class="svc_categories_filter vc_col-sm-12 vc_clearfix svc_categories_filter_<?php echo $svc_grid_id;?>" id="svc_categories_filter_<?php echo $svc_grid_id.$u;?>" data-filter-group="<?php echo $texono_name->label;?>">
					<option value="*"><?php _e( 'All '.$texono_name->label, 'js_composer' ) ?></option>
					<?php foreach($terms as $term){?>
					<option value=".svc-grid-cat-<?php echo $term->term_id; ?>"><?php echo esc_attr( $term->name ); ?> <?php if($count_display == 'yes'){ echo '('.$term->count.')';}?></option>
					<?php }?>
				</select>
			<?php }else{?>
				<ul class="svc_categories_filter vc_col-sm-12 vc_clearfix svc_categories_filter_<?php echo $svc_grid_id;?>" id="svc_categories_filter_<?php echo $svc_grid_id.$u;?>">
						<li><a href="#" data-filter="*" class="active"><?php _e( 'All '.$texono_name->label, 'js_composer' ) ?></a></li>
				<?php foreach($terms as $term){?>
					<li><a href="#" data-filter=".svc-grid-cat-<?php echo $term->term_id; ?>"><?php echo esc_attr( $term->name ); ?> <?php if($count_display == 'yes'){ echo '('.$term->count.')';}?></a></li>
				<?php }?>
				</ul>
			<?php }?>
			</div>
			<?php
			}
		$u++;
		}
		}
		
		if(count($query_post_type) == $cpt){
			if($sort_filter == 'yes'){
			
			$output = '
			<div class="svc_fl svc_sort_div svc_sort_div_'.$svc_grid_id.' svc_sort_div'.$for_liner.'">
				<div class="svc_sort_title">'.__(ucwords ( str_replace('_',' ',$query_orderby) ),'js_composer').'</div>
				<a href="javascript:;" class="'.($query_order=='ASC' ? "svc_active":"").'" id="svc_sort_asc_'.$svc_grid_id.'"><i class="fa fa-chevron-up"></i></a>
				<a href="javascript:;" class="'.($query_order=='DESC' ? "svc_active":"").' " id="svc_sort_desc_'.$svc_grid_id.'"><i class="fa fa-chevron-down"></i></a>
			</div>';
			echo $output;
		}
		
			if($grid_list_filter == 'yes'){?>
        	<div class="svc_view_type_div svc_fl svc_view_type_div_<?php echo $svc_grid_id;?>">
            <?php 
			$vsactive_class = $vactive_class = '';
			if($skin_type != 's6'){$vactive_class = 'svc_active';}else{$vsactive_class = 'svc_active';}?>	
                <div id="grid_view" class="<?php echo $vactive_class;?>" title="Grid View" skin-type="<?php echo ($skin_type != 's6') ? $skin_type : 's1';?>"><i class="fa fa-th-large"></i></div>
                <div id="list_view" class="<?php echo $vsactive_class;?>" title="List View" skin-type="s6"><i class="fa fa-th-list"></i></div>
            </div>
        <?php }
		}?>
		
        </div>
        <?php
		}
	}
	
	if ($skin_type=='s7'){?>
	<ul class="svc_timeline svc_post_grid_<?php echo $skin_type;?> svc_post_grid_<?php echo $svc_grid_id;?> <?php echo $svc_class;?>">
	<?php }else{?>
	<div class="svc_post_grid svc_post_grid_<?php echo $skin_type;?> svc_post_grid_<?php echo $svc_grid_id;?> <?php echo $svc_class;?>" id="svc_post_grid_<?php echo $svc_grid_id;?>">
	<?php }
		}else{?>
	<div class="svc_post_grid svc_post_grid_<?php echo $skin_type;?> svc_post_grid_<?php echo $svc_grid_id;?> svc_carousel_container_<?php echo $svc_grid_id;?> <?php echo $svc_class;?>" id="svc_carousel_container_<?php echo $svc_grid_id;?>">
		<?php 
		$grid_columns_count_for_desktop = $grid_columns_count_for_tablet = $grid_columns_count_for_mobile = '';
		}
	}
	if($svc_type == 'carousel'){
		$grid_columns_count_for_desktop = $grid_columns_count_for_tablet = $grid_columns_count_for_mobile = '';
	}
	
	$link_target = $grid_link_target;
	$lt = '';
	if($link_target == 'sw'){
		$lt = 'target="_self"';
	}elseif($link_target == 'nw'){
		$lt = 'target="_self"';
	}
	$img_array = array();
	$s7 = 0;
	while ( $my_query->have_posts() ) {
		$my_query->the_post(); // Get post from query
		$post = new stdClass(); // Creating post object.
		$post->id = get_the_ID();
		$post->link = get_permalink($post->id);
		$img_id=get_post_meta( $post->id , '_thumbnail_id' ,true );
		$img_array[] = $img_id;

		$post_thumbnail = wpb_getImageBySize(array( 'post_id' => $post->id, 'thumb_size' => $grid_thumb_size ));
		$current_img_large = $post_thumbnail['thumbnail'];
		//$current_img_full = wp_get_attachment_image_src( $img_id[$img_counter++] , 'full' );
		
		$post_type = get_post_type( $post->id );
		$resource_type = get_post_type_object($post_type);
		$post_taxonomies = get_object_taxonomies($post_type);
		// TODO: Disable line below before push to pantheon
//		echo "<pre>";print_r($post_taxonomies);
//      echo "<pre>";print_r($post_type);
		for($i = 0;$i < count($post_taxonomies); $i++){
			if($post_taxonomies[$i] == 'post_format'){
				unset($post_taxonomies[$i]);
			}
		}
		$tax_counter = 0;
		
		$order_value = '';

		if($sort_filter == 'yes') {
			$public_orders_array = array('ID','date','author','title','modified','rand','comment_count','menu_order');

			if (in_array($query_orderby,$public_orders_array))
			{
				switch($query_orderby)
				{
					case 'ID':
						$order_value=get_the_id();
					break;

					case 'date':
						$order_value=get_the_date('Y/m/d');
					break;

					case 'author':
						$order_value=get_the_author();
					break;

					case 'title':
						$order_value=get_the_title();
					break;

					case 'modified':
						$order_value=get_the_modified_date('Y/m/d');
					break;

					case 'rand':
						$order_value=rand(0,1000);
					break;

					case 'comment_count':
						$order_value=wp_count_comments($post->id);
						$order_value=$order_value->total_comments ;
					break;

					case 'menu_order':
						$thispost = get_post($post->id);
						$order_value=$thispost->menu_order;
					break;
				}
			}
			else{
				$order_value=get_post_meta($post->id, $query_orderby , true);
			}
		}

		if ($skin_type=='s1'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		<?php if($img_id != ''){?>
		  <header>
			<a href="<?php echo $post->link;?>" <?php echo $lt;?>>
				<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			</a>
            <?php if($dimg_popup != 'yes'){?>
			<a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
            <?php }
			if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
		  </header>
		<?php }?>
		  <section>
			<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a></p>
			<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">
										<i class="fa fa-tags"></i> ';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$output .= ', ';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if($tax_co!= 0 && $dpost_popup != 'yes'){
				$output .= '<a href="'.$post->link.'" data-mfp-src="'.admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured.'" class="ajax-popup-link ajax-popup-link-'.$svc_grid_id.'"><i class="fa fa-expand pull-right"></i></a>';
				$output.='</div>';
			}
			echo $output;
			}
			if($dexcerpt != 'yes'){?>
			<p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
			<?php }?>
		  </section>
		  <footer>
			<div>
			 <?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span>
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
		  </footer>
		</article>
	<?php
		}
		if ($skin_type=='s2'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
			<section>
			<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a></p>
		  </section>
		<?php if($img_id != ''){?>
		  <header>
			<a href="<?php echo $post->link;?>" <?php echo $lt;?>>
				<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			</a>
            <?php if($dimg_popup != 'yes'){?>
			<a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
			  <i class="fa fa-arrows-alt"></i>
			</a>
            <?php }
			if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
		  </header>
		<?php }?>
		<section>
		<?php
		if($dcategory != 'yes'){
			$tax_co= 0;
			$output = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
				$terms = get_the_terms( $post->id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">
										<i class="fa fa-tags"></i> ';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$output .= ', ';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if($tax_co!= 0 && $dpost_popup != 'yes'){
				$output .= '<a href="'.$post->link.'" data-mfp-src="'.admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured.'" class="ajax-popup-link ajax-popup-link-'.$svc_grid_id.'"><i class="fa fa-expand pull-right"></i></a>';
				$output.='</div>';
			}
			echo $output;
			}
			if($dexcerpt != 'yes'){?>
			<p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
			<?php }?>
			</section>
		  <footer>
			<div>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span>
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
		  </footer>
		</article>
	<?php
		}
		if ($skin_type=='s3'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' no-pad '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		  <header>
          <?php if($img_id != ''){?>
          	<div class="col-md-4 col-sm-4 col-xs-4 svc_tac">
                <a href="<?php echo $post->link;?>" <?php echo $lt;?>>
                    <?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
                </a>
                <?php if($dimg_popup != 'yes'){?>
                <a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
                    <i class="fa fa-arrows-alt"></i>
                </a>
                <?php }
				if($dpost_popup != 'yes'){?>
				<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
			  		<i class="fa fa-file-text-o"></i>
				</a>
                <?php }?>
            </div>
         <?php }
		 if($img_id == ''){?>
         	<div class="col-md-12 col-sm-12 col-xs-12" style="width:100%;">
         <?php }else{?>
            <div class="col-md-8 col-sm-8 col-xs-8" style="padding-left:10px;">
         <?php }?>
            	<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a>
                <?php if($dpost_popup != 'yes'){?>
                <a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>"><i class="fa fa-expand pull-right"></i></a>
                <?php }?>
                </p>
                <?php if($dexcerpt != 'yes'){?>
                <p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
                <?php }
				if($dcategory != 'yes'){
					$tax_co= 0;
					$output = '';
					foreach ($post_taxonomies as $taxonomy){
						if($taxonomy != 'post_tag'){
							$terms = get_the_terms( $post->id, $taxonomy );
							if ( (!empty( $terms )) && ($tax_co<=1) ) {
								if ($tax_co==0){
									$output .='<div class="svc_post_cat">
												<i class="fa fa-tags"></i> ';
								}
								foreach ( $terms as $term ){
									if($tax_co>0){$output .= ', ';}
									$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
									$tax_co++;
								}
							}
						}
					}
					if($tax_co!= 0 ){ $output.='</div>';}
					echo $output;
					}
				?>
            </div>
		  </header>
		  <footer>
			<div>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span> 
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
		  </footer>
		</article>
	<?php
		}
		if ($skin_type=='s4'){
			include(locate_template('templates/card-s4.php'));
		}
		if ($skin_type=='s5'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
        <div class="relative_div">
        	<header>
		<?php if($img_id != ''){?>		  
			<a href="<?php echo $post->link;?>" <?php echo $lt;?>>
				<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			</a>
            <?php if($dimg_popup != 'yes'){?>
            <a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
		<?php }
		}
		if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
        	</header>
		  <section>
			<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a></p>
			<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = $slash = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$slash = ',';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$slash.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if ($tax_co!=0){
				$output.='</div>';
			}
			echo $output;
			}
			if($dmeta_data != 'yes'){?>
            <ul class="svg_post_meta">
               <li class="time">
                  <span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
                  <span><i class="fa fa-pencil"></i> <?php the_author();?></span>
               </li>
            </ul>
			<?php }
			if($dsocial != 'yes'){?>
            <div class="svc_social_share">
                <ul>
                  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
                  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
                  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
                </ul>
             </div>
		  <?php }?>
		  </section>
          </div>
		</article>
	<?php
		}
		if ($skin_type=='s6'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item col-md-12 <?php echo $filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		  <header>
          <?php if($img_id != ''){?>
          	<div class="col-md-4 col-sm-4 col-xs-4 svc_tac">
                <a href="<?php echo $post->link;?>" <?php echo $lt;?>>
                    <?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
                </a>
                <?php if($dimg_popup != 'yes'){?>
                <a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
                    <i class="fa fa-arrows-alt"></i>
                </a>
                <?php }
				if($dpost_popup != 'yes'){?>
				<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
			  		<i class="fa fa-file-text-o"></i>
				</a>
                <?php }?>
            </div>
         <?php }
		 if($img_id == ''){?>
         	<div class="col-md-12 col-sm-12 col-xs-12" style="width:100%;">
         <?php }else{?>
            <div class="col-md-8 col-sm-8 col-xs-8" style="padding-left:10px;">
         <?php }?>
            	<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a>
                <?php if($dpost_popup != 'yes'){?>
                <a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width;?>&fi=<?php echo $dfeatured;?>" class="ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>"><i class="fa fa-expand pull-right"></i></a>
                <?php }?>
                </p>
                <?php if($dexcerpt != 'yes'){?>
                <p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
                <?php }
				if($dcategory != 'yes'){
					$tax_co= 0;
					$output = '';
					foreach ($post_taxonomies as $taxonomy){
						if($taxonomy != 'post_tag'){
							$terms = get_the_terms( $post->id, $taxonomy );
							if ( (!empty( $terms )) && ($tax_co<=1) ) {
								if ($tax_co==0){
									$output .='<div class="svc_post_cat">
												<i class="fa fa-tags"></i> ';
								}
								foreach ( $terms as $term ){
									if($tax_co>0){$output .= ', ';}
									$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
									$tax_co++;
								}
							}
						}
					}
					if($tax_co!= 0 ){ $output.='</div>';}
					echo $output;
					}
				?>
                <div>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span> 
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
            </div>
		  </header>
		</article>
	<?php
		}
		if ($skin_type=='s7'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}
		if($s7 == 0){
			if(!$ajax){?><li class="svc_year first"><i class="fa fa-circle"></i></li><?php } }?>
		<li class="svc_event <?php echo ($s7 == 0 && !$ajax) ? 'offset-first' : '';?> <?php echo $filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		<?php $s7++;
		if($img_id != ''){?>
		  <header>
			<a href="<?php echo $post->link;?>" <?php echo $lt;?>>
				<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			</a>
            <?php if($dimg_popup != 'yes'){?>
			<a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
            <?php }
			if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
		  </header>
		<?php }?>
		  <section>
			<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a></p>
			<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">
										<i class="fa fa-tags"></i> ';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$output .= ', ';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if($tax_co!= 0 && $dpost_popup != 'yes'){
				$output .= '<a href="'.$post->link.'" data-mfp-src="'.admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured.'" class="ajax-popup-link ajax-popup-link-'.$svc_grid_id.'"><i class="fa fa-expand pull-right"></i></a>';
				$output.='</div>';
			}
			echo $output;
			}
			if($dexcerpt != 'yes'){?>
			<p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
			<?php }?>
		  </section>
		  <footer>
			<div>
			 <?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span>
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
		  </footer>
		</li>
	<?php
		}
		if ($skin_type=='s8'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
        <div class="relative_div">
        	<header class="<?php if($img_id == ''){ echo 's8_no_image';}?>">
		<?php if($img_id != ''){?>		  
			<a href="<?php echo $post->link;?>" <?php echo $lt;?>>
				<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			</a>
            <?php if($dimg_popup != 'yes'){?>
            <a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
		<?php }
		}
		if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
        	</header>
		  <section class="<?php if($img_id == ''){ echo 's8_no_image';}?>">
			<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a></p>
			<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = $slash = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$slash = ',';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$slash.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if ($tax_co!=0){
				$output.='</div>';
			}
			echo $output;
			}
			if($dmeta_data != 'yes'){?>
            <ul class="svg_post_meta">
               <li class="time">
                  <span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
                  <span><i class="fa fa-pencil"></i> <?php the_author();?></span>
               </li>
            </ul>
			<?php }
			if($dexcerpt != 'yes'){?>
            <p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
			<?php }?>
            <div class="svc_inner_abs_div">
            	<a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_read_mure_s8"><?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
				<?php if($dsocial != 'yes'){?>
                <div class="svc_share">                            
				    <i class="fa fa-share-alt"></i>
				    <div class="svc_share-box full-color">
				      <ul class="s8-social">
                        <li class="facebook">
                            <a title="" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-facebook"></i>
                            </a>
                        </li>
                        <li class="google">
                            <a title="" target="_blank" href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-google-plus"></i>
                            </a>
                        </li>
                        <li class="twitter">
                            <a title="" target="_blank" href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-twitter"></i>
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
              <?php }?>
            </div>
		  </section>
          </div>
		</article>
	<?php

		}
		if ($skin_type=='s9'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}
		if($img_id != ''){?>
		<article class="element-item cs-style-3 <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		<figure>
		<?php if($img_id != ''){?>
			<?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
			<?php if($dimg_popup != 'yes'){?>
			<a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
            <?php }
			if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
            <div class="svc_inner_abs_div">
				<?php if($dsocial != 'yes'){?>
                <div class="svc_share">                            
				    <i class="fa fa-share-alt"></i>
				    <div class="svc_share-box full-color">
				      <ul class="s8-social">
                        <li class="facebook">
                            <a title="" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-facebook"></i>
                            </a>
                        </li>
                        <li class="google">
                            <a title="" target="_blank" href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-google-plus"></i>
                            </a>
                        </li>
                        <li class="twitter">
                            <a title="" target="_blank" href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-twitter"></i>
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
              <?php }?>
            </div>
        <?php }?>
			<figcaption>
				<h3><a href="<?php echo $post->link;?>"><?php echo get_the_title();?></h3></a>
				<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = $slash = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$slash = ' / ';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$slash.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if($tax_co!= 0 && $dpost_popup != 'yes'){
				$output.='</div>';
			}
			echo $output;
			}?>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?></span>
				</li>
			  </ul>
			<?php }?>
			</figcaption>
		</figure>

		</article>
	<?php
			}
		}
		if ($skin_type=='s10'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}
		if($img_id != ''){?>
		<article class="element-item cs-style-4 <?php echo $grid_columns_count_for_desktop.' '.$grid_columns_count_for_tablet.' '.$grid_columns_count_for_mobile.' '.$filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		<figure>
		<?php if($img_id != ''){?>
			<div><?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?></div>
			<?php if($dimg_popup != 'yes'){?>
			<a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
		  		<i class="fa fa-arrows-alt"></i>
			</a>
            <?php }
			if($dpost_popup != 'yes'){?>
			<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
		  		<i class="fa fa-file-text-o"></i>
			</a>
            <?php }?>
            <div class="svc_inner_abs_div">
				<?php if($dsocial != 'yes'){?>
                <div class="svc_share">
				    <i class="fa fa-share-alt"></i>
				    <div class="svc_share-box full-color">
				      <ul class="s8-social">
                        <li class="facebook">
                            <a title="" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-facebook"></i>
                            </a>
                        </li>
                        <li class="google">
                            <a title="" target="_blank" href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-google-plus"></i>
                            </a>
                        </li>
                        <li class="twitter">
                            <a title="" target="_blank" href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank">
                                <i class="fa fa-twitter"></i>
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
              <?php }?>
            </div>
        <?php }?>
			<figcaption>
				<h3><a href="<?php echo $post->link;?>"><?php echo get_the_title();?></h3></a>
				<?php
			if($dcategory != 'yes'){
			$tax_co= 0;
			$output = $slash = '';
			foreach ($post_taxonomies as $taxonomy){
				if($taxonomy != 'post_tag'){
					$terms = get_the_terms( $post_id, $taxonomy );
					if ( (!empty( $terms )) && ($tax_co<=1) ) {
						if ($tax_co==0){
							$output .='<div class="svc_post_cat">';
						}
						foreach ( $terms as $term ){
							if($tax_co>0){$slash = ' / ';}
							$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$slash.$term->name.'</a>';
							$tax_co++;
						}
					}
				}
			}
			if($tax_co!= 0 && $dpost_popup != 'yes'){
				$output.='</div>';
			}
			echo $output;
			}?>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span><br>
					<span><i class="fa fa-pencil"></i> <?php the_author();?></span>
				</li>
			  </ul>
			<?php }?>
			<a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_read_mure_s10"><?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</figcaption>
		</figure>

		</article>
	<?php
			}
		}
		if ($skin_type=='aa-cgl'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item col-md-12 <?php echo $filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		  <header>
<?php
		 if($img_id == ''){?>
         	<div class="col-md-12 col-sm-12 col-xs-12" style="width:100%;">
         <?php }else{?>
            <div class="col-md-8 col-sm-8 col-xs-8" style="padding-left:10px;">
         <?php }?>
            	<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a>
                </p>
                <?php if($dexcerpt != 'yes'){?>
                <p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
                <?php }
				if($dcategory != 'yes'){
					$tax_co= 0;
					$output = '';
					foreach ($post_taxonomies as $taxonomy){
						if($taxonomy != 'post_tag'){
							$terms = get_the_terms( $post->id, $taxonomy );
							if ( (!empty( $terms )) && ($tax_co<=1) ) {
								if ($tax_co==0){
									$output .='<div class="svc_post_cat">
												<i class="fa fa-tags"></i> ';
								}
								foreach ( $terms as $term ){
									if($tax_co>0){$output .= ', ';}
									$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
									$tax_co++;
								}
							}
						}
					}
					if($tax_co!= 0 ){ $output.='</div>';}
					echo $output;
					}
				?>
				<div>
					<?php if($dmeta_data != 'yes'){?>
						<ul class="svg_post_meta">
						<li class="time">
						<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span>
						</li>
						</ul>
					<?php }?>
				</div>
            </div>
		  </header>
		</article>
	<?php
		}
		if ($skin_type=='aa-event-sponsors'){
			$filter_class = '';
			foreach ($post_taxonomies as $taxonomy){
				$khj = get_the_terms( $post->id, $taxonomy );
				if (!empty( $khj )){
					foreach( $khj as $term_m ){
						$filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
					}
				}
			}?>
		<article class="element-item col-md-12 <?php echo $filter_class;?>" svc-animation="<?php if($effect != ''){ echo $effect;}?>" sort="<?php echo $order_value;?>">
		  <header>
          <?php if($img_id != ''){?>
          	<div class="col-md-4 col-sm-4 col-xs-4 svc_tac">
                <a href="<?php echo $post->link;?>" <?php echo $lt;?>>
                    <?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
                </a>
                <?php if($dimg_popup != 'yes'){?>
                <a href="<?php echo wp_get_attachment_url($img_id);?>" class="svc_highres svc_highres_<?php echo $svc_grid_id;?>" title="<?php echo get_the_title();?>" data-source="<?php echo wp_get_attachment_url($img_id);?>">
                    <i class="fa fa-arrows-alt"></i>
                </a>
                <?php }
				if($dpost_popup != 'yes'){?>
				<a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width.'&fi='.$dfeatured;?>" class="svc_read ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>">
			  		<i class="fa fa-file-text-o"></i>
				</a>
                <?php }?>
            </div>
         <?php }
		 if($img_id == ''){?>
         	<div class="col-md-12 col-sm-12 col-xs-12" style="width:100%;">
         <?php }else{?>
            <div class="col-md-8 col-sm-8 col-xs-8" style="padding-left:10px;">
         <?php }?>
            	<p><a href="<?php echo $post->link;?>" <?php echo $lt;?> class="svc_title"><?php echo get_the_title();?></a>
                <?php if($dpost_popup != 'yes'){?>
                <a href="<?php echo $post->link;?>" data-mfp-src="<?php echo admin_url( 'admin-ajax.php' ).'?action=svc_inline_post_popup&pid='.$post->id.'&bgcolor='.str_replace('#','',$popup_bgcolor).'&line_color='.str_replace('#','',$popup_line_color).'&max_width='.$popup_max_width;?>&fi=<?php echo $dfeatured;?>" class="ajax-popup-link ajax-popup-link-<?php echo $svc_grid_id;?>"><i class="fa fa-expand pull-right"></i></a>
                <?php }?>
                </p>
                <?php if($dexcerpt != 'yes'){?>
                <p class="svc_info"><?php echo svc_post_layout_excerpt(get_the_content(),$svc_excerpt_length);?></p>
                <?php }
				if($dcategory != 'yes'){
					$tax_co= 0;
					$output = '';
					foreach ($post_taxonomies as $taxonomy){
						if($taxonomy != 'post_tag'){
							$terms = get_the_terms( $post->id, $taxonomy );
							if ( (!empty( $terms )) && ($tax_co<=1) ) {
								if ($tax_co==0){
									$output .='<div class="svc_post_cat">
												<i class="fa fa-tags"></i> ';
								}
								foreach ( $terms as $term ){
									if($tax_co>0){$output .= ', ';}
									$output .= '<a href="' .get_term_link($term->slug, $taxonomy) .'">'.$term->name.'</a>';
									$tax_co++;
								}
							}
						}
					}
					if($tax_co!= 0 ){ $output.='</div>';}
					echo $output;
					}
				?>
                <div>
			<?php if($dmeta_data != 'yes'){?>
			  <ul class="svg_post_meta">
				<li class="time">
					<span><i class="fa fa-calendar-o"></i> <?php echo get_the_date();?>&nbsp;&nbsp;</span>
					<span><i class="fa fa-pencil"></i> <?php the_author();?>&nbsp;&nbsp;</span>
					<span><a class="fa fa-comments-o" href="<?php echo get_comments_link();?>"> <?php echo get_comments_number( '0', '1', '% responses' );?></a></span>
				</li>
			  </ul>
			 <?php }
			 if($dsocial != 'yes'){?>
			  <div class="svc_social_share">
				<ul>
				  <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
				  <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
				  <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
				</ul>
			  </div>
			  <?php }?>
			  <a href="<?php echo $post->link;?>" class="svc_read_more" <?php echo $lt;?>>
			  <?php if($read_more == ''){ _e('Read More','svc-post-layout');}else{ _e($read_more,'svc-post-layout');}?>&nbsp;<i class="fa fa-angle-double-right"></i></a>
			</div>
            </div>
		  </header>
		</article>
	<?php
		}
	}

	wp_reset_query();

	if(!$ajax){
		if($car_loadmore == 'yes' && $svc_type == 'carousel'){?>
		<article style="min-height:100px; width:100%;">
			<nav id="svc_infinite" class="svc_infinite_<?php echo $svc_grid_id;?>">
			  <div class="loading-spinner svc_carousel_loading-spinner">
				<div class="ui-spinner">
				  <span class="side side-left">
					<span class="fill"></span>
				  </span>
				  <span class="side side-right">
					<span class="fill"></span>
				  </span>
				</div>
			  </div>
			  <a href="javascript:;" class="svc_load_more_<?php echo $svc_grid_id;?> svc_carousel_loadmore" rel="<?php echo $svc_grid_id;?>"><?php if($car_loadmore_text != ''){ _e($car_loadmore_text,'svc_carousel');}else{ _e('Show More','svc_carousel');}?></a>
			</nav>
		</article>
		<?php }
	if($skin_type=='s7'){?>
	</ul>
	<?php }else{?>
	</div>
	<?php }
	if($synced == 'yes' && $car_display_item == 1 && $car_loadmore != 'yes'){?>
	<div id="svc_carousel2_container_<?php echo $svc_grid_id;?>" class="svc_carousel2_container svc_carousel2_container_<?php echo $svc_grid_id;?>">
		<?php foreach ( $img_array as $img_arr ) {
		$img_src = wp_get_attachment_image_src( $img_arr, 'thumbnail');?>
		<div>
		<?php if($img_arr != ''){?>
			<img src="<?php echo $img_src[0];?>" class="svc_post_image"/>
		<?php }else{?>
        	<img src="<?php echo plugins_url( 'css/one_pix.jpg', __FILE__ );?>">
        <?php }?>
		</div>
		<?php }?>
	</div>
	<?php }?>
    
	<?php 
	if($svc_type != 'carousel'){
	$all_page_number=$my_query->max_num_pages;
	$fields='';
	$arr=$var;

	foreach($arr as $key => $value) {
		if ($key != 'paged') {
			$fields.='<input type="hidden" name="'.$key.'" value="'.$value.'" id="'.$key.'_'.$svc_grid_id.'"/>';
		}
	}
	?>
	<form id="svc_form_load_more_<?php echo $svc_grid_id;?>">
		<?php echo $fields;?>
		<input type="hidden" name="_wpnonce " value="<?php echo rand(0,100000);?>"/>
		<input type="hidden" name="paged" value="<?php echo $paged;?>" id="svc_paged_<?php echo $svc_grid_id;?>"/>
		<input type="hidden" name="total_paged" value="<?php echo $all_page_number;?>" id="svc_total_paged_<?php echo $svc_grid_id;?>"/>
	</form>
	<?php if($all_page_number>1 && $hide_showmore != 'yes' && $load_more != 'pagination' && $sort_filter != 'yes'){?>
	<div class="load_more_main_div <?php echo $svc_class;?>">
		<nav id="svc_infinite" class="svc_infinite_<?php echo $svc_grid_id;?>">
		  <div class="loading-spinner">
			<div class="ui-spinner">
			  <span class="side side-left">
				<span class="fill"></span>
			  </span>
			  <span class="side side-right">
				<span class="fill"></span>
			  </span>
			</div>
		  </div>
		  <p><a href="/page/<?php echo $paged;?>/" class="svc_load_more_<?php echo $svc_grid_id;?> load-more-link" rel="<?php echo $svc_grid_id;?>"><?php if($loadmore_text != ''){echo $loadmore_text;}else{echo 'Show More';}?></a></p>
		</nav>
	</div>
	<input type="hidden" id="svc_infinite_<?php echo $svc_grid_id;?>" value="0" />
	<?php }?>
	<?php if($all_page_number>1 && ($load_more == 'pagination' || $sort_filter == 'yes')){?>
	<div class="svc_pagination_div">
	<?php svc_kriesi_pagination($all_page_number,$svc_grid_id);?>
	</div>
	<?php }
	}elseif($svc_type == 'carousel' && $car_loadmore == 'yes'){
		$all_page_number=$my_query->max_num_pages;
		$fields='';
		$arr=$var;
		
		foreach($arr as $key => $value){
			if($key != 'paged'){
				$fields.='<input type="hidden" name="'.$key.'" value="'.$value.'" id="'.$key.'_'.$svc_grid_id.'"/>';
			}
		}
		?>
		<form id="svc_form_load_more_<?php echo $svc_grid_id;?>">
			<?php echo $fields;?>
			<input type="hidden" name="_wpnonce " value="<?php echo rand(0,100000);?>"/>
			<input type="hidden" name="paged" value="<?php echo $paged;?>" id="svc_paged_<?php echo $svc_grid_id;?>"/>
			<input type="hidden" name="total_paged" value="<?php echo $all_page_number;?>" id="svc_total_paged_<?php echo $svc_grid_id;?>"/>
		</form>
	<?php }//end not carousel?>

	</div>    
	</div>

	<script>
	var wl = jQuery(window);
	jQuery(document).ready(function(){

//		$(".pflip").flip({
//		axis: 'y',
//		trigger: 'hover'
//		});

<?php if($svc_type == 'carousel'){?>
	var sync1 = jQuery("#svc_carousel_container_<?php echo $svc_grid_id;?>");
	sync1.imagesLoaded().done(function(){
		 sync1.owlCarousel({
			<?php if($car_autoplay == 'yes'){?>
			autoPlay: <?php echo $car_autoplay_time*1000;?>,
			<?php }?>
			items : <?php echo $car_display_item;?>,
			pagination:<?php if($car_pagination == 'yes'){echo 'true';}else{echo 'false';}?>,
			navigation: <?php if($car_navigation == 'yes'){echo 'false';}else{echo 'true';}?>,
			<?php if($car_pagination == 'yes' && $car_pagination_num == 'yes'){?>
			paginationNumbers:true,
			<?php }
			if($car_display_item == 1 && $car_transition != ''){?>
			transitionStyle : "<?php echo $car_transition;?>",
			<?php }
			if($car_display_item == 1){?>
			autoHeight:true,
			singleItem:true,
			<?php }
			if($synced == 'yes' && $car_display_item == 1){?>
			afterAction : svc_syncPosition_<?php echo $svc_grid_id;?>,
			responsiveRefreshRate : 200,
			<?php }?>
			 navigationText: [
				"<i class='fa fa-chevron-left icon-white'></i>",
				"<i class='fa fa-chevron-right icon-white'></i>"
			],
			afterInit:function(){
				jQuery('#svc_mask_<?php echo $svc_grid_id;?>').hide();
				jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').show();
			}
		});
		
		<?php if($car_loadmore == 'yes'){?>
		setTimeout(function(){
		var lh = jQuery('.svc_carousel_container_<?php echo $svc_grid_id;?> .owl-wrapper-outer').innerHeight();
		jQuery('.svc_carousel_container_<?php echo $svc_grid_id;?> .owl-wrapper-outer .owl-item:last article').css('height',(lh-15)+'px');
		jQuery('.svc_carousel_container_<?php echo $svc_grid_id;?> .owl-wrapper-outer .owl-item:last article').parent('.owl-item').css({'display':'-webkit-flex','display':'flex'});
		},2000);
		function svc_load_more_<?php echo $svc_grid_id;?>(){
			jQuery('.svc_load_more_<?php echo $svc_grid_id;?>').click(function(e) {
				e.preventDefault();
				jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> a').css('visibility','hidden');
				jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner').show();
				jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val(Number(jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val())+1);
		
				var params=jQuery('#svc_form_load_more_<?php echo $svc_grid_id;?>').serialize();
				jQuery.ajax({
					type: 'POST',
					url: '<?php echo admin_url( 'admin-ajax.php' );?>',
					data:  params+'&action=svc_post_layout_carousel',
					success: function(response) {
						var content = response;
						var tpg = jQuery('#svc_total_paged_<?php echo $svc_grid_id;?>').val();
						var cpg = jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val();
						var ht = jQuery("#svc_carousel_container_<?php echo $svc_grid_id;?> .owl-item").last().html();
						if(content != '' && tpg != cpg){
							content = content+ht;
						}else{
							content = content;
						}
						jQuery("#svc_carousel_container_<?php echo $svc_grid_id;?>").data('owlCarousel').removeItem();
						sync1.data('owlCarousel').addItem(content);
						var owl = sync1.data('owlCarousel');
						owl.goTo((cpg-1)*<?php echo $query_posts_per_page;?>);
						jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> a').css('visibility','visible');
						jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner').hide();
						jQuery('.svc_carousel_container_<?php echo $svc_grid_id;?> .owl-wrapper-outer .owl-item:last article').parent('.owl-item').css({'display':'-webkit-flex','display':'flex'});
						svc_load_more_<?php echo $svc_grid_id;?>();
					}
				});
			});
		}
		svc_load_more_<?php echo $svc_grid_id;?>();
		<?php }?>
		
		<?php if($synced == 'yes' && $car_display_item == 1 && $car_loadmore != 'yes'){?>
		var sync2 = jQuery("#svc_carousel2_container_<?php echo $svc_grid_id;?>");
		 sync2.owlCarousel({
			items : <?php echo $synced_display;?>,
			itemsDesktop : [1199,10],
			itemsDesktopSmall : [979,10],
			itemsTablet : [768,8],
			itemsMobile : [479,4],
			pagination:false,
			responsiveRefreshRate : 100,
			afterInit : function(el){
				el.find(".owl-item").eq(0).addClass("synced");
			}
		});

		function svc_syncPosition_<?php echo $svc_grid_id;?>(el){
			var current = this.currentItem;
			jQuery("#svc_carousel2_container_<?php echo $svc_grid_id;?>")
			.find(".owl-item")
			.removeClass("synced")
			.eq(current)
			.addClass("synced")
			if(jQuery("#svc_carousel2_container_<?php echo $svc_grid_id;?>").data("owlCarousel") !== undefined){
				svc_center_<?php echo $svc_grid_id;?>(current)
			}
		}
		jQuery("#svc_carousel2_container_<?php echo $svc_grid_id;?>").on("click", ".owl-item", function(e){
			e.preventDefault();
			var number = jQuery(this).data("owlItem");
			sync1.trigger("owl.goTo",number);
		});
		function svc_center_<?php echo $svc_grid_id;?>(number){
			var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
			var num = number;
			var found = false;
			for(var i in sync2visible){
				if(num === sync2visible[i]){
					var found = true;
				}
			}
			if(found===false){
				if(num>sync2visible[sync2visible.length-1]){
					sync2.trigger("owl.goTo", num - sync2visible.length+2)
				}else{
					if(num - 1 === -1){
						num = 0;
					}
				sync2.trigger("owl.goTo", num);
				}
			}else if(num === sync2visible[sync2visible.length-1]){
				sync2.trigger("owl.goTo", sync2visible[1])
			}else if(num === sync2visible[0]){
				sync2.trigger("owl.goTo", num-1)
			}
		}
		<?php }?>
		
	});
	<?php 
}else{
	if($load_more == 'infinite'){?>

		jQuery('.pflip').flip({
			axis: 'y',
			trigger: 'hover'
		});

		var $loadMore = jQuery('.svc_load_more_<?php echo $svc_grid_id;?>');
		var $infinite = jQuery('#svc_infinite_<?php echo $svc_grid_id;?>');

		jQuery(document).scroll(function() {
			if ($loadMore.offset()) {
				if ((($loadMore.offset().top - wl.scrollTop()) - 10) < wl.height()) {
					if ($infinite.val() == '0') {
						$infinite.val('1');
						if ($loadMore.is(':visible')) {
							$loadMore.click();
						}
					}
				}
			}
		});

	<?php }
	if($load_more != 'pagination'){?>
        jQuery(document).ready(function(){
            jQuery(".pflip").flip({
            axis: 'y',
            trigger: 'hover'
            });
        });
		jQuery('.svc_load_more_<?php echo $svc_grid_id;?>').click(function(event) {
			event.preventDefault(event);
			jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> p').css('visibility','hidden');
			jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner').show();
			var div_position=jQuery('#svc_form_load_more_<?php echo $svc_grid_id;?>').position().top;
			jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val(Number(jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val())+1);
	
			var params=jQuery('#svc_form_load_more_<?php echo $svc_grid_id;?>').serialize();
			jQuery.ajax({
				type: 'POST',
				url: '<?php echo admin_url( 'admin-ajax.php' );?>',
				data:  params+'&action=svc_layout_post',
				success: function(response) {
				<?php if($skin_type == 's7'){?>
					jQuery('.svc_post_grid_<?php echo $svc_grid_id;?>').append(response);
					jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> p').css('visibility','visible');
					jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner').hide();
					jQuery('#svc_infinite_<?php echo $svc_grid_id;?>').val('0');
					if(jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val() == jQuery('#svc_total_paged_<?php echo $svc_grid_id;?>').val()){
						jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?>').hide();
						jQuery('#svc_infinite_<?php echo $svc_grid_id;?>').val('1');
					}
					jQuery('.svc_highres_<?php echo $svc_grid_id;?>').magnificPopup({
					  type: 'image',
					  closeOnContentClick: false,
					  closeBtnInside: false
					});
					jQuery('.ajax-popup-link-<?php echo $svc_grid_id;?>').magnificPopup({
					  type: 'ajax',
					  closeBtnInside:false,
					  <?php if($popup_effect != ''){?>
					  removalDelay: 500,
					  mainClass: '<?php echo $popup_effect;?>',
					  <?php }?>
					});
				<?php }else{?>
					isotop_callback(response,'');
				<?php }?>
				}
			});
		});
	<?php }?>
	
	<?php if($load_more == 'pagination' || $sort_filter == 'yes'){?>
	jQuery('.svc_pagination_<?php echo $svc_grid_id;?> a').click(function(event) {
		event.preventDefault(event);
		if(jQuery(this).hasClass('current') == false){
		jQuery('#svc_mask_<?php echo $svc_grid_id;?>').show();
		jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').hide();
		div_position=jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').position().top;
		jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val(Number(jQuery(this).attr('page')));
		jQuery('.svc_pagination_<?php echo $svc_grid_id;?> a').removeClass('current').addClass('inactive');
		jQuery(this).addClass('current').removeClass('inactive');
			var params=jQuery('#svc_form_load_more_<?php echo $svc_grid_id;?>').serialize();
			jQuery.ajax({
				type: 'POST',
				url: '<?php echo admin_url( 'admin-ajax.php' );?>',
				data:  params+'&action=svc_layout_post',
				success: function(response) {
					<?php if($skin_type == 's7'){?>
					jQuery('.svc_post_grid_<?php echo $svc_grid_id;?>').html(response);					
					jQuery('.svc_highres_<?php echo $svc_grid_id;?>').magnificPopup({
					  type: 'image',
					  closeOnContentClick: false,
					  closeBtnInside: false
					});
					jQuery('.ajax-popup-link-<?php echo $svc_grid_id;?>').magnificPopup({
					  type: 'ajax',
					  closeBtnInside:false,
					  <?php if($popup_effect != ''){?>
					  removalDelay: 500,
					  mainClass: '<?php echo $popup_effect;?>',
					  <?php }?>
					});
				<?php }else{?>
					isotop_callback(response,'');
				<?php }?>
					jQuery('#svc_mask_<?php echo $svc_grid_id;?>').hide();
					jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').show();
					jQuery("#svc_post_grid_list_container_<?php echo $svc_grid_id;?>").animate({top: 0}, 1000);
				}
			});
		}
	});
	<?php }?>
		
	<?php if($grid_list_filter == 'yes'){?>
		jQuery('.svc_view_type_div_<?php echo $svc_grid_id;?> div').click(function(){
			var skin = jQuery(this).attr('skin-type');
			jQuery('#skin_type_<?php echo $svc_grid_id;?>').val(skin);
			jQuery('.svc_view_type_div_<?php echo $svc_grid_id;?> div').removeClass('svc_active');
			jQuery(this).addClass('svc_active');
			
			jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val('1');
			jQuery('#svc_mask_<?php echo $svc_grid_id;?>').show();
			jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').hide();
			
			var params=jQuery('#svc_form_load_more_<?php echo $svc_grid_id;?>').serialize();
			jQuery.ajax({
				type: 'POST',
				url: '<?php echo admin_url( 'admin-ajax.php' );?>',
				data:  params+'&action=svc_layout_post',
				success: function(response) {
					if(skin == 's6'){
						jQuery('#svc_post_grid_<?php echo $svc_grid_id;?>').addClass('svc_post_grid_s6').removeClass('svc_post_grid_s1 svc_post_grid_s2 svc_post_grid_s3 svc_post_grid_s4 svc_post_grid_s5');
					}else{
						jQuery('#svc_post_grid_<?php echo $svc_grid_id;?>').addClass('svc_post_grid_'+skin).removeClass('svc_post_grid_s6');
					}
					isotop_callback(response,'yes');
					jQuery('#svc_mask_<?php echo $svc_grid_id;?>').hide();
					jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').show();
					jQuery('.svc_infinite_<?php echo $svc_grid_id;?>').css('display','inline-block');
				}
			});
		});
	<?php }?>
		
		var container = jQuery('#svc_post_grid_<?php echo $svc_grid_id;?>').imagesLoaded( function() {
			jQuery('#svc_post_grid_list_container_<?php echo $svc_grid_id;?>').show();
			jQuery('#svc_mask_<?php echo $svc_grid_id;?>').hide();
			svc_imag_animation();
			container.isotope({
			  itemSelector: '.element-item',
			  <?php if($effect != ''){?>
			  transformsEnabled: false,
			  isResizeBound: false,
			  transitionDuration: '0.8s',
			  <?php }?>
			  filter: '*',
			  <?php if($grid_layout_mode == 'fitRows'){?>
			  layoutMode: 'fitRows',
			  <?php }elseif($grid_layout_mode == 'masonry'){?>
			  layoutMode: 'masonry',
			  masonry: {
				columnWidth: 1
			  }
			  <?php }?>
			});
			//var ic = 0;
			//var ci = setInterval(function(){container.isotope();if(ic>10){clearInterval(ci);}ic++;},400);
		});
		
		<?php  if($sort_filter == 'yes'){?>
		jQuery('#svc_sort_asc_<?php echo $svc_grid_id;?>').click(function() {
			jQuery('.svc_sort_div_<?php echo $svc_grid_id;?> a').removeClass('svc_active');
			jQuery(this).addClass('svc_active');
			container.isotope({
			  sortBy: 'sort',
			  sortAscending : true
			});
		});
		jQuery('#svc_sort_desc_<?php echo $svc_grid_id;?>').click(function() {
			jQuery('.svc_sort_div_<?php echo $svc_grid_id;?> a').removeClass('svc_active');
			jQuery(this).addClass('svc_active');
			container.isotope({
			  sortBy: 'sort',
			  sortAscending : false
			});
		});
		<?php }?>

		<?php if($filter_type == 'linear'){
			$u=0;
			foreach($query_post_type as $post_type_cat){
				if($post_type_cat){
				$taxonomy_names = get_object_taxonomies( $post_type_cat );
				for($i = 0;$i < count($taxonomy_names); $i++){
					if($taxonomy_names[$i] == 'post_format'){
						unset($taxonomy_names[$i]);
					}
				}
				$taxonomiess = $taxonomy_names;
		for($y=0;$y<count($taxonomiess);$y++){?>
		jQuery('#svc_categories_filter_<?php echo $svc_grid_id.$u;?> li').on( 'click', 'a', function(e) {
		  e.preventDefault();
		  jQuery('#svc_categories_filter_<?php echo $svc_grid_id.$u;?> li a').removeClass('active');
		  jQuery(this).addClass('active');
		  //var filterValue = jQuery(this).attr('data-filter');
		  
		  var filterValue = '';
		  jQuery('.svc_categories_filter_<?php echo $svc_grid_id;?> li a').each(function(){
		  	if(jQuery(this).hasClass('active')){
				var v = jQuery(this).attr('data-filter');
				if(typeof v != 'undefined' && v != '*'){
					filterValue += v;
				}
			}
		  });
	
			if(filterValue == '**' || filterValue == ''){
				filterValue = '*';
			}
		  
		  container.isotope({ filter: filterValue }).isotope();
		});
		<?php $u++;
		}}}
		}?>
		var filters = {};
		<?php if($filter_type == 'dropdown'){
			$u=0;
			foreach($query_post_type as $post_type_cat){
				if($post_type_cat){
				$taxonomy_names = get_object_taxonomies( $post_type_cat );
				for($i = 0;$i < count($taxonomy_names); $i++){
					if($taxonomy_names[$i] == 'post_format'){
						unset($taxonomy_names[$i]);
					}
				}
				$taxonomiess = $taxonomy_names;
		for($y=0;$y<count($taxonomiess);$y++){?>
		jQuery('#svc_categories_filter_<?php echo $svc_grid_id.$u;?>').ddslick({
			onSelected: function(selectedData){
				//var filterValue = selectedData.selectedData.value;
				var filterValue = '';
				jQuery('.filter_child_divs_<?php echo $svc_grid_id;?>').each(function(){
					var v = jQuery(this).children('div').children('div').children('.dd-selected-value').val();
					if(typeof v != 'undefined' && v != '*'){
						filterValue += v;
					}
				});

  				if(filterValue == '**' || filterValue == ''){
					filterValue = '*';
				}
				
				container.isotope({ filter: filterValue }).isotope();
			}   
		});
		<?php $u++;
		}}
		}}?>
		
		function isotop_callback(response,view_filter){
			var res = jQuery(response);
			res.imagesLoaded( function() {
				if(view_filter == 'yes'){
					container.html('');
				}
				<?php if($sort_filter == 'yes' || $load_more == 'pagination'){?>
				container.html('');
				<?php }?>
				container.isotope({
						transformsEnabled: false,
						isResizeBound: false,
						transitionDuration: 0
					})
					.isotope( 'insert', jQuery( response ) )
					.isotope({
						transformsEnabled: false,
						isResizeBound: false,
						transitionDuration: '0.8s'
					});
			svc_imag_animation();
			//var ic = 0;
			//var ci = setInterval(function(){container.isotope();if(ic>8){clearInterval(ci);}ic++;},400);
				
				jQuery('#svc_infinite_<?php echo $svc_grid_id;?>').val('0');
				if(jQuery('#svc_paged_<?php echo $svc_grid_id;?>').val() == jQuery('#svc_total_paged_<?php echo $svc_grid_id;?>').val()){
					jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?>').hide();
					jQuery('#svc_infinite_<?php echo $svc_grid_id;?>').val('1');
				}
				jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> p').css('visibility','visible');
				jQuery('nav.svc_infinite_<?php echo $svc_grid_id;?> div.loading-spinner').hide(); 
				jQuery('.svc_highres_<?php echo $svc_grid_id;?>').magnificPopup({
				  type: 'image',
				  closeOnContentClick: false,
				  closeBtnInside: false
				});
				
				jQuery('.ajax-popup-link-<?php echo $svc_grid_id;?>').magnificPopup({
				  type: 'ajax',
				  closeBtnInside:false,
				  <?php if($popup_effect != ''){?>
				  removalDelay: 300,
		  		  mainClass: '<?php echo $popup_effect;?>'
				  <?php }?>
				});
				jQuery('.pflip').flip( {
					axis: 'y',
					trigger: 'hover'
				});
			});
		}
<?php }?>
	jQuery('.svc_highres_<?php echo $svc_grid_id;?>').magnificPopup({
		  type: 'image',
		  closeOnContentClick: false,
		  closeBtnInside: false
		});
		jQuery('.ajax-popup-link-<?php echo $svc_grid_id;?>').magnificPopup({
		  type: 'ajax',
		  closeBtnInside:false,
		  <?php if($popup_effect != ''){?>
		  removalDelay: 500,
		  mainClass: '<?php echo $popup_effect;?>',
		  <?php }?>
		});
	});

	jQuery(document).ready(function(){
		jQuery(".pflip").flip({
		axis: 'y',
		trigger: 'hover'
		});
	});
	</script>
<?php
	}

	return ob_get_clean();
}