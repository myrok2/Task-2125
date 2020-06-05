<?php
/*
 * Display Functions
 */

add_action('wp_footer','gldpnl_display',0);

function gldpnl_display(){

	$all_options = wp_load_alloptions();
	$sidebars_widgets = get_option('sidebars_widgets');
	$sidebars_widgets = (!empty($sidebars_widgets['gilidpanel-sidebar'])) ? $sidebars_widgets['gilidpanel-sidebar'] : '';

	$display = false;

	//configure display via location settings
	if(!empty(gldpnl_generalOption()->location)){
		if(isset(gldpnl_generalOption()->location['all']) && '1' == gldpnl_generalOption()->location['all']){
			$display = true;
		}

		foreach (gldpnl_generalOption()->location as $location => $val ) {
			if($location == "home"){
				if(is_home() || is_front_page()){
					$display = true;
					break;
				}
			}
			if($location == "pages"){
				if(is_page()){
					$display = true;
					break;
				}
			}
			if($location == "posts"){
				if(is_single()){
					$display = true;
					break;
				}
			}
			if($location == "category"){
				if(is_category() || is_tax()){
					$display = true;
					break;
				}
			}
			if($location == "date"){
				if(is_date()){
					$display = true;
					break;
				}
			}
			if($location == "tag"){
				if(is_tag()){
					$display = true;
					break;
				}
			}
			if($location == "author"){
				if(is_author()){
					$display = true;
					break;
				}
			}
			if($location == "search"){
				if(is_search()){
					$display = true;
					break;
				}
			}
		}
	} //end location setting display

	if($display == true): 
	if(!empty($sidebars_widgets)){
		echo <<<EOF
<style>
EOF;
		/*
		 * Custom Fonts
		 */
		if(!empty(gldpnl_fontsOption()->general) && gldpnl_fontsOption()->general != " "){
			echo 'div.gilidPanel, div.gilidPanel h1, div.gilidPanel h2, div.gilidPanel h3, div.gilidPanel h4, div.gilidPanel h5, div.gilidPanel h6,div.gilidPanel h7, div.gilidPanel p, div.gilidPanel li, div.gilidPanel input { font-family: "'. str_replace('-', ' ', gldpnl_fontsOption()->general) .'", san-serif; }';
		}
		if(!empty(gldpnl_fontsOption()->headings) && gldpnl_fontsOption()->headings != " "){
			echo 'div.gilidPanel .widget .widgettitle{ font-family: "'. str_replace('-', ' ', gldpnl_fontsOption()->headings) .'", san-serif; }';
		}
		if(!empty(gldpnl_fontsOption()->nav) && gldpnl_fontsOption()->nav != " "){
			echo 'div.gilidPanel .widget .menu li a{ font-family: "'. str_replace('-', ' ', gldpnl_fontsOption()->nav) .'", san-serif; }';
		}
		if(!empty(gldpnl_fontsOption()->fontsize) && gldpnl_fontsOption()->fontsize != " "){
			echo 'div.gilidPanel { font-size:'. gldpnl_fontsOption()->fontsize .'px; }';
		}
		if(!empty(gldpnl_fontsOption()->titlesize) && gldpnl_fontsOption()->titlesize != " "){
			echo 'div.gilidPanel .widget .widgettitle { font-size:'. gldpnl_fontsOption()->titlesize .'px; }';
		}
		if(!empty(gldpnl_fontsOption()->navsize) && gldpnl_fontsOption()->navsize != " "){
			echo 'div.gilidPanel .widget .menu li a { font-size:'. gldpnl_fontsOption()->navsize .'px; }';
		}

		/*
		 * Custom Color Scheme
		 */
		
		if(!empty(gldpnl_generalOption()->width) && gldpnl_generalOption()->width != " "){
			echo 'div.gilidPanel { width:'. gldpnl_generalOption()->width .'px; }';
		}
		if(!empty(gldpnl_colorOption()->coloropener) && gldpnl_colorOption()->coloropener != " "){
			echo '.gilidPanel-opener a, .gilidPanel-opener a:visited { color:'. gldpnl_colorOption()->coloropener .'; }';
		}
		if(!empty(gldpnl_colorOption()->coloropenerbg) && gldpnl_colorOption()->coloropenerbg != " "){
			echo '.gilidPanel-opener a, .gilidPanel-opener a:visited { background:'. gldpnl_colorOption()->coloropenerbg .'; }';
		}
		if(!empty(gldpnl_colorOption()->panelbg) && gldpnl_colorOption()->panelbg != " "){
			echo 'div.gilidPanel { background:'. gldpnl_colorOption()->panelbg .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorbg) && gldpnl_colorOption()->colorbg != " "){
			echo 'div.gilidPanel .gilidPanel-wrap .widget { background:'. gldpnl_colorOption()->colorbg .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorhead) && gldpnl_colorOption()->colorhead != " "){
			echo 'div.gilidPanel .gilidPanel-wrap h2.widgettitle { color:'. gldpnl_colorOption()->colorhead .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorheadbg) && gldpnl_colorOption()->colorheadbg != " "){
			echo 'div.gilidPanel .gilidPanel-wrap h2.widgettitle { background:'. gldpnl_colorOption()->colorheadbg .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorlink) && gldpnl_colorOption()->colorlink != " "){
			echo 'div.gilidPanel .gilidPanel-wrap a, div.gilidPanel .gilidPanel-wrap span.gldpnl-dropdown { color:'. gldpnl_colorOption()->colorlink .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorp) && gldpnl_colorOption()->colorp != " "){
			echo 'div.gilidPanel .gilidPanel-wrap, div.gilidPanel .gilidPanel-wrap p{ color:'. gldpnl_colorOption()->colorp .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorlist) && gldpnl_colorOption()->colorlist != " "){
			echo 'div.gilidPanel .gilidPanel-wrap li{ color:'. gldpnl_colorOption()->colorlist .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorbt) && gldpnl_colorOption()->colorbt != " "){
			echo 'div.gilidPanel .gilidPanel-wrap button, div.gilidPanel .gilidPanel-wrap input[type="button"], div.gilidPanel .gilidPanel-wrap input[type="submit"]{ color:'. gldpnl_colorOption()->colorbt .'; }';
		}
		if(!empty(gldpnl_colorOption()->colorb) && gldpnl_colorOption()->colorb != " "){
			echo 'div.gilidPanel .gilidPanel-wrap button, div.gilidPanel .gilidPanel-wrap input[type="button"], div.gilidPanel .gilidPanel-wrap input[type="submit"]{ background:'. gldpnl_colorOption()->colorb .'; }';
		}

		//hover
		if(!empty(gldpnl_colorOption()->hoveropener) && gldpnl_colorOption()->hoveropener != " "){
			echo '.gilidPanel-opener a:hover { color:'. gldpnl_colorOption()->hoveropener .'; }';
		}
		if(!empty(gldpnl_colorOption()->hoveropenerbg) && gldpnl_colorOption()->hoveropenerbg != " "){
			echo '.gilidPanel-opener a:hover { background:'. gldpnl_colorOption()->hoveropenerbg .'; }';
		}
		if(!empty(gldpnl_colorOption()->hoverlink) && gldpnl_colorOption()->hoverlink != " "){
			echo 'div.gilidPanel .gilidPanel-wrap a:hover, div.gilidPanel .gilidPanel-wrap span.gldpnl-dropdown:hover{ color:'. gldpnl_colorOption()->hoverlink .'; }';
		}
		if(!empty(gldpnl_colorOption()->hoverbt) && gldpnl_colorOption()->hoverbt != " "){
			echo 'div.gilidPanel .gilidPanel-wrap button:hover, div.gilidPanel .gilidPanel-wrap input[type="button"]:hover, div.gilidPanel .gilidPanel-wrap input[type="submit"]:hover{ color:'. gldpnl_colorOption()->hoverbt .'; }';
		}
		if(!empty(gldpnl_colorOption()->hoverb) && gldpnl_colorOption()->hoverb != " "){
			echo 'div.gilidPanel .gilidPanel-wrap button:hover, div.gilidPanel .gilidPanel-wrap input[type="button"]:hover, div.gilidPanel .gilidPanel-wrap input[type="submit"]:hover{ background:'. gldpnl_colorOption()->hoverb .'; }';
		}
		if(!empty(gldpnl_colorOption()->padding) && gldpnl_colorOption()->padding != " "){
			echo 'div.gilidPanel .gilidPanel-wrap .widget{ padding:'. gldpnl_colorOption()->padding .'px; }';
		}

		/*
		 * Attribute
		 */
		$attr = '';
		if(!empty(gldpnl_generalOption()->position) && gldpnl_generalOption()->position != " ")
			$attr .= '"position" : "'. gldpnl_generalOption()->position .'"';
		if(!empty(gldpnl_generalOption()->type) && gldpnl_generalOption()->type != " ")
			$attr .= ', "type" : "'. gldpnl_generalOption()->type .'"';
		if(!empty(gldpnl_animationOption()->easing) && gldpnl_animationOption()->easing != " ")
			$attr .= ', "easing" : "'. gldpnl_animationOption()->easing .'"';
		if(!empty(gldpnl_animationOption()->speed) && gldpnl_animationOption()->speed != " ")
			$attr .= ', "animSpeed" : "'. gldpnl_animationOption()->speed .'"';


		echo <<<EOF
</style>
EOF;
	
	
	echo <<<EOF
<script type="text/javascript">
	jQuery(document).ready(function($){
		$('div.gilidPanel').gilidFn({ $attr });

		$(".nano").nanoScroller({
			contentClass: 'gilidPanel-wrap',
			preventPageScrolling: 'false'
		});
	});
</script>
EOF;

$opener_icon = gldpnl_fontawesome( gldpnl_iconOption()->icon );

?>
<style>
.gilidPanel-opener a i:before{
	content: "<?php echo $opener_icon;?>";
	*zoom: expression( this.runtimeStyle['zoom'] = '1', this.innerHTML = '&#x<?php echo str_replace("\\","",$opener_icon);?>;');
}
</style>
<div class="gilidPanel-overlay"></div>
<div class="gilidPanel-opener gilidPanel-opener-<?php echo gldpnl_generalOption()->position;?> <?php if(gldpnl_iconOption()->icon == 'custom'){ echo 'gilidPanel-opener-custom'; }?>">
	<a href="#" >
		<?php if(gldpnl_iconOption()->icon == 'custom'){ ?>
			<img src="<?php echo gldpnl_iconOption()->image; ?>" />
		<?php }else{ ?>
		<i class="fa <?php echo gldpnl_iconOption()->icon;?>"></i>
		<?php } ?>
	</a>
</div>
		<div class="gilidPanel <?php if( isset(gldpnl_generalOption()->responsive) && gldpnl_generalOption()->responsive == 1){ echo 'gilidPanel-responsive'; }?>" id="gilidPanel-slide-<?php echo gldpnl_generalOption()->position;?>">
			<div class="nano">
				<div class="gilidPanel-wrap">
				<?php	
				if(!dynamic_sidebar('gilidpanel-sidebar')):
				endif;
				?>
				</div>
			</div>
		</div>

<?php 
}
	endif; //end display
} 

?>