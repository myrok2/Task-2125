<?php
include('post-grid-shortcode.php');
if(!class_exists('svc_post_layout'))
{
	class svc_post_layout
	{
		function __construct()
		{
			add_action('admin_init',array($this,'svc_post_layout_init'));
			add_shortcode('svc_post_layout','svc_post_layout_shortcode');
		}
		function svc_post_layout_init()
		{

			if(function_exists('vc_map'))
			{
				$animations = array(
				'None' => '',
				'bounce'		=>	'bounce',
				'flash'			=>	'flash',
				'pulse'			=>	'pulse',
				'rubberBand'	=>	'rubberBand',
				'shake'			=>	'shake',
				'swing'			=>	'swing',
				'tada'			=>	'tada',
				'bounce'		=>	'bounce',
				'wobble'		=>	'wobble',
				'bounceIn'		=>	'bounceIn',
				'bounceInDown'	=>	'bounceInDown',
				'bounceInLeft'	=>	'bounceInLeft',
				'bounceInRight'	=>	'bounceInRight',
				'bounceInUp'	=>	'bounceInUp',
				'fadeIn'			=>	'fadeIn',
				'fadeInDown'		=>	'fadeInDown',
				'fadeInDownBig'		=>	'fadeInDownBig',
				'fadeInLeft'		=>	'fadeInLeft',
				'fadeInLeftBig'		=>	'fadeInLeftBig',
				'fadeInRight'		=>	'fadeInRight',
				'fadeInRightBig'	=>	'fadeInRightBig',
				'fadeInUp'			=>	'fadeInUp',
				'fadeInUpBig'		=>	'fadeInUpBig',
				'flip'	=>	'flip',
				'flipInX'	=>	'flipInX',
				'flipInY'	=>	'flipInY',
				'lightSpeedIn'	=>	'lightSpeedIn',
				'rotateIn'			=>	'rotateIn',
				'rotateInDownLeft'	=>	'rotateInDownLeft',
				'rotateInDownRight'	=>	'rotateInDownRight',
				'rotateInUpLeft'	=>	'rotateInUpLeft',
				'rotateInUpRight'	=>	'rotateInUpRight',
				'slideInUp' => 'slideInUp',
				'slideInDown' => 'slideInDown',
				'slideInLeft' => 'slideInLeft',
				'slideInRight' => 'slideInRight',
				'zoomIn'		=>	'zoomIn',
				'zoomInDown'	=>	'zoomInDown',
				'zoomInLeft'	=>	'zoomInLeft',
				'zoomInRight'	=>	'zoomInRight',
				'zoomInUp'		=>	'zoomInUp',
				'rollIn'	=>	'rollIn',
				'twisterInDown'	=>	'twisterInDown',
				'twisterInUp'	=>	'twisterInUp',
				'swap'			=>	'swap',
				'puffIn'	=>	'puffIn',
				'vanishIn'	=>	'vanishIn',
				'openDownLeftRetourn'	=>	'openDownLeftRetourn',
				'openDownRightRetourn'	=>	'openDownRightRetourn',
				'openUpLeftRetourn'		=>	'openUpLeftRetourn',
				'openUpRightRetourn'	=>	'openUpRightRetourn',
				'perspectiveDownRetourn'	=>	'perspectiveDownRetourn',
				'perspectiveUpRetourn'		=>	'perspectiveUpRetourn',
				'perspectiveLeftRetourn'	=>	'perspectiveLeftRetourn',
				'perspectiveRightRetourn'	=>	'perspectiveRightRetourn',
				'slideDownRetourn'	=>	'slideDownRetourn',
				'slideUpRetourn'	=>	'slideUpRetourn',
				'slideLeftRetourn'	=>	'slideLeftRetourn',
				'slideRightRetourn'	=>	'slideRightRetourn',
				'swashIn'		=>	'swashIn',
				'foolishIn'		=>	'foolishIn',
				'tinRightIn'	=>	'tinRightIn',
				'tinLeftIn'		=>	'tinLeftIn',
				'tinUpIn'		=>	'tinUpIn',
				'tinDownIn'		=>	'tinDownIn',
				'boingInUp'		=>	'boingInUp',
				'spaceInUp'		=>	'spaceInUp',
				'spaceInRight'	=>	'spaceInRight',
				'spaceInDown'	=>	'spaceInDown',
				'spaceInLeft'	=>	'spaceInLeft'
			);
				vc_map( array(
					"name" => __('Resources Grid','js_composer'),
					"base" => 'svc_post_layout',		
					"icon" => 'vc-animate-icon',		
					'category' => __('Agile Alliance Components','js_composer'),
					'params' => array(
						array(
							'type' => 'textfield',
							'heading' => __( 'Title', 'js_composer' ),
							'param_name' => 'title',
							'holder' => 'div',
							'description' => __( 'Enter resource grid title - This likely should remain empty!',
								'js_composer' )
						),
						array(
							"type" => "dropdown",
							"heading" => __("Grid type" , 'js_composer' ),
							'param_name' => 'svc_type',
							'value' =>array(
								__("Resource Grid", 'js_composer' )=>"post_layout",
								__("Resource Carousel", 'js_composer' )=>"carousel",
								__("Resource List", 'js_composer' )=>"list_layout"
								),
							"description" => __("Choose Resource Grid or Carousel type.", 'js_composer' ),
						),
						array(
							'type' => 'loop',
							'heading' => __('Build Post Query','js_composer'),
							'param_name' => 'query_loop',
							'settings' => array(
								'post_type' => array('value' => 'post'),
								'size' => array( 'hidden' => false, 'value' => 10 ),
								'order_by' => array( 'value' => 'date' ),
								'order' => array('value' => 'DESC')
							),
							'description' => __('Create a WordPress loop, to populate content from your site.',
								'js_composer')
						),
						array(
							"type" => "dropdown",
							"heading" => __("Custom Grid Style" , 'js_composer' ),
							"param_name" => "skin_type",
							"value" =>array(
//								__("Style1", 'js_composer' )=>"s1",
//								__("Style2", 'js_composer' )=>"s2",
//								__("Style3", 'js_composer' )=>"s3",
								__("Agile Alliance Resource Grid (default)", 'js_composer' )=>"s4",
//								__("Style5", 'js_composer' )=>"s5",
								__("AA Blog & Community Group List View", 'js_composer' )=>"s6",
//								__("Timeline", 'js_composer' )=>"s7",
//								__("Style8", 'js_composer' )=>"s8",
//								__("Style9", 'js_composer' )=>"s9",
//								__("Style10", 'js_composer' )=>"s10",
								__("AA Community Groups List(No thumbnails)", 'js_composer' )=>"aa-cgl",
								__("In Development - AA Events Sponsors", 'js_composer' )=>"aa-event-sponsors",
								),
							"description" => __("Choose the custom design for your grid. Default / Custom for Agile
							Alliance
							.",
								'js_composer' ),
						),
						array(
							'type' => 'num',
							'heading' => __( 'Items Display', 'js_composer' ),
							'param_name' => 'car_display_item',
							'value' => 6,
							'min' => 1,
							'max' => 100,
							'suffix' => '',
							'step' => 1,
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'This variable allows you to set the maximum amount of items displayed at a time inside carousels. Not available in resource grid layout. ', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Show pagination', 'js_composer' ),
							'param_name' => 'car_pagination',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'Show pagination', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Show pagination Numbers', 'js_composer' ),
							'param_name' => 'car_pagination_num',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'car_pagination','value' => 'yes'),
							'description' => __( 'Show numbers inside pagination buttons.', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide navigation', 'js_composer' ),
							'param_name' => 'car_navigation',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'Display "next" and "prev" buttons.', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'AutoPlay', 'js_composer' ),
							'param_name' => 'car_autoplay',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'Set Slider Autoplay. ', 'js_composer' )
						),
						array(
							'type' => 'num',
							'heading' => __( 'autoPlay Time', 'js_composer' ),
							'param_name' => 'car_autoplay_time',
							'value' => '5',
							'min' => 1,
							'max' => 100,
							'suffix' => 'seconds',
							'step' => 1,
							'dependency' => array('element' => 'car_autoplay','value' => 'yes'),
							'description' => __( 'Carousels : Set Autoplay slider speed. Not available in resource grid layout.', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Show more', 'js_composer' ),
							'param_name' => 'car_loadmore',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'add Show more Post last element of Carousel.', 'js_composer' ),
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Synced Slider', 'js_composer' ),
							'param_name' => 'synced',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'car_display_item','value' => '1'),
							'description' => __( 'Set Synced Slider.see Example <a href="http://owlgraphic.com/owlcarousel/demos/sync.html" target="_black">here</a>', 'js_composer' ),
						),
						array(
							'type' => 'num',
							'heading' => __( 'Synced Display', 'js_composer' ),
							'param_name' => 'synced_display',
							'value' => '10',
							'min' => 1,
							'max' => 1000,
							'suffix' => '',
							'step' => 1,
							'dependency' => array('element' => 'synced','value' => 'yes'),
							'description' => __( 'Set Synces Slider Display elements.', 'js_composer' )
						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Transition effect', 'js_composer' ),
							'param_name' => 'car_transition',
							'value' => array(
								__( 'None', 'js_composer' ) => '',
								__( 'fade', 'js_composer' ) => 'fade',
								__( 'backSlide', 'js_composer' ) => 'backSlide',
								__( 'goDown', 'js_composer' ) => 'goDown',
								__( 'scaleUp', 'js_composer' ) => 'scaleUp'
							),
							'dependency' => array('element' => 'car_display_item','value' => '1'),
							'description' => __( 'Add CSS3 transition style. Works only with one item on screen.', 'js_composer' )
						),
						array(
							"type" => "dropdown",
							"heading" => __("Desktop Columns Count" , 'js_composer' ),
							'param_name' => 'grid_columns_count_for_desktop',
							'value' =>array(
								__("1 Column", 'js_composer' )=>"col-md-12",
								__("2 Columns", 'js_composer' )=>"col-md-6",
								__("3 Columns", 'js_composer' )=>"col-md-4",
								__("4 Columns", 'js_composer' )=>"col-md-3",
								__("6 Columns", 'js_composer' )=>"col-md-2",
								),
							'std' => 'col-md-2',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							"description" => __("Choose Desktop(PC Mode) Columns Count", 'js_composer' ),
						),
						array(
							"type" => "dropdown",
							"class" => "",
							"heading" => __("Tablet Columns Count" , 'js_composer' ),
							'param_name' => 'grid_columns_count_for_tablet',
							'value' =>array(
								__("1 Column", 'js_composer' )=>"col-sm-12",
								__("2 Columns", 'js_composer' )=>"col-sm-6",
								__("3 Columns", 'js_composer' )=>"col-sm-4",
								__("4 Columns", 'js_composer' )=>"col-sm-3",
								),
							'std' => 'col-sm-3',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							"description" => __("Choose Tablet Columns Count", 'js_composer' ),
						),
						array(
							"type" => "dropdown",
							"class" => "",
							"heading" => __("Mobile Columns Count" ,'js_composer' ),
							'param_name' => 'grid_columns_count_for_mobile',
							'value' =>array(
								__("1 Column", 'js_composer' )=>"col-xs-12",
								__("2 Columns", 'js_composer' )=>"col-xs-6",
//								__("3 Columns", 'js_composer' )=>"col-xs-4",
//								__("4 Columns", 'js_composer' )=>"col-xs-3",
								),
							'std' => 'col-xs-12',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							"description" => __("Choose Mobile Columns Count", 'js_composer'),
						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Link target', 'js_composer' ),
							'param_name' => 'grid_link_target',
							'value' => array('Same Window' => 'sw','New Window' => 'nw'),
						),
//						array(
//							'type' => 'checkbox',
//							'heading' => __( 'Show filter', 'js_composer' ),
//							'param_name' => 'filter',
//							'value' => array( __( 'Yes, please', 'js_composer' ) => 'yes' ),
//							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
//							'description' => __( 'Select to add animated category filter to your posts grid.', 'js_composer' )
//						),
//						array(
//							'type' => 'checkbox',
//							'heading' => __( 'Show Sorting Filter', 'js_composer' ),
//							'param_name' => 'sort_filter',
//							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
//							'dependency' => array('element' => 'filter','value' => 'yes'),
//							'description' => __( 'Display Sorting Filter.', 'js_composer' )
//						),
//						array(
//							'type' => 'checkbox',
//							'heading' => __( 'Show Grid/List View Type Filter', 'js_composer' ),
//							'param_name' => 'grid_list_filter',
//							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
//							'dependency' => array('element' => 'filter','value' => 'yes'),
//							'description' => __( 'Display Grid/List View Filter.', 'js_composer' )
//						),
//						array(
//							'type' => 'textfield',
//							'heading' => __( 'Exclude taxonomies', 'js_composer' ),
//							'param_name' => 'exclude_texo',
//							'dependency' => array('element' => 'filter','value' => 'yes'),
//							'description' => __( 'Enter Exclude taxonomies slug, Divide each with comma.', 'js_composer' )
//						),
//						array(
//							'type' => 'dropdown',
//							'heading' => __( 'Filter mode', 'js_composer' ),
//							'param_name' => 'filter_type',
//							'value' => array(
//								__( 'Dropdown', 'js_composer' ) => 'dropdown',
//								__( 'Linear', 'js_composer' ) => 'linear'
//							),
//							'dependency' => array('element' => 'filter','value' => 'yes'),
//							'description' => __( 'Filter Layout Option.', 'js_composer' )
//						),
//						array(
//							'type' => 'checkbox',
//							'heading' => __( 'Show Filter value counter', 'js_composer' ),
//							'param_name' => 'count_display',
//							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
//							'dependency' => array('element' => 'filter','value' => 'yes'),
//							'description' => __( 'Filter category Count display.', 'js_composer' )
//						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Layout mode', 'js_composer' ),
							'param_name' => 'grid_layout_mode',
							'value' => array(
								__( 'Fit rows', 'js_composer' ) => 'fitRows',
								__( 'Masonry', 'js_composer' ) => 'masonry'
							),
							'std' => 'fitRows',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							'description' => __( 'Select layout template.', 'js_composer' )
						),
						array(
							'type' => 'textfield',
							'heading' => __( 'Thumbnail size', 'js_composer' ),
							'param_name' => 'grid_thumb_size',
							'description' => __( 'Enter thumbnail size. Example: thumbnail, medium, large, full or other sizes defined by current theme. Alternatively enter image size in pixels: 200x100 (Width x Height).', 'js_composer' )
						),
						array(
							'type' => 'num',
							'heading' => __( 'Minimum Height', 'js_composer' ),
							'param_name' => 's5_min_height',
							'value' => '285',
							'min' => 50,
							'max' => 1000,
							'suffix' => 'px',
							'step' => 1,
							'dependency' => array('element' => 'skin_type','value' => array('s5','s8')),
							'description' => __( 'Minimum Height for article.default:170px', 'js_composer' )
						),
						array(
							'type' => 'num',
							'heading' => __( 'Excerpt Length', 'js_composer' ),
							'param_name' => 'svc_excerpt_length',
							'value' => '20',
							'min' => 10,
							'max' => 900,
							'suffix' => '',
							'step' => 1,
							'description' => __( 'set excerpt length.default:20 (may not apply to some custom grids)',
								'js_composer' )
						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Pagination Style', 'js_composer' ),
							'param_name' => 'load_more',
							'value' => array(
								__( 'Show More', 'js_composer' ) => 'loadmore',
								__( 'Infinite Scroll', 'js_composer' ) => 'infinite',
								__( 'Number Pagination', 'js_composer' ) => 'pagination'
							),
							'std' => 'loadmore',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							'description' => __( 'Select Pagination Style.', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide Show more Button', 'js_composer' ),
							'param_name' => 'hide_showmore',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'dependency' => array('element' => 'load_more','value' => 'loadmore'),
							'description' => __( 'hide Show more button.', 'js_composer' )
						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Post load Effect', 'js_composer' ),
							'param_name' => 'effect',
							'value' => $animations,
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							'description' => __( 'Select post load effect.', 'js_composer' )
						),
						array(
							'type' => 'textfield',
							'heading' => __( 'Read More translate', 'js_composer' ),
							'param_name' => 'read_more',
							'description' => __( 'Enter Post Read more text.Default : Read more.', 'js_composer' )
						),
						array(
							'type' => 'textfield',
							'heading' => __( 'Show more text', 'js_composer' ),
							'param_name' => 'loadmore_text',
							'dependency' => array('element' => 'svc_type','value' => 'post_layout'),
							'description' => __( 'add Show more button text.Default:Show More', 'js_composer' )
						),
						array(
							'type' => 'textfield',
							'heading' => __( 'Show more text', 'js_composer' ),
							'param_name' => 'car_loadmore_text',
							'dependency' => array('element' => 'car_loadmore','value' => 'yes'),
							'description' => __( 'add Show more button text.Default:Show More', 'js_composer' )
						),
						array(
							'type' => 'textfield',
							'heading' => __( 'Extra class name', 'js_composer' ),
							'param_name' => 'svc_class',
							'holder' => 'div',
							'description' => __( 'If you wish to style particular content element differently, then use this field to add a class name and then refer to it in your css file.', 'js_composer' )
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Show Featured Image', 'js_composer' ),
							'param_name' => 'show_featured_image',
							'value' => array( __( 'Yes', 'js_composer' ) => 'true' ),
							'description' => __( 'Hide the Featured Image.', 'js_composer' ),
							'group' => __('Display Setting', 'js_composer')
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide Excerpt', 'js_composer' ),
							'param_name' => 'dexcerpt',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'description' => __( 'hide Excerpt content.', 'js_composer' ),
							'group' => __('Display Setting', 'js_composer')
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide Category', 'js_composer' ),
							'param_name' => 'dcategory',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'description' => __( 'hide category content.', 'js_composer' ),
							'group' => __('Display Setting', 'js_composer')
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide meta data', 'js_composer' ),
							'param_name' => 'dmeta_data',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'description' => __( 'hide meta content.like date,author,comment counter', 'js_composer' ),
							'group' => __('Display Setting', 'js_composer')
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Display Social icons', 'js_composer' ),
							'param_name' => 'dsocial',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'description' => __( 'Show Social Icons',
								'js_composer' ),
							'group' => __('Display Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Post Background Color', 'js_composer' ),
							'param_name' => 'pbgcolor',
							'description' => __( 'set post background color.', 'js_composer' ),
							'dependency' => array('element' => 'skin_type','value' => array('s1','s2','s3','s4','s5','s6','s7')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Post hover Background Color', 'js_composer' ),
							'param_name' => 'pbghcolor',
							'description' => __( 'set post hover background color.', 'js_composer' ),
							'dependency' => array('element' => 'skin_type','value' => array('s1','s2','s3','s4','s5','s6','s7')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Post without image Background Color', 'js_composer' ),
							'param_name' => 'ps8o_bgcolor',
							'description' => __( 'set post without image background color.', 'js_composer' ),
							'dependency' => array('element' => 'skin_type','value' => array('s8')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Post with image Background Color', 'js_composer' ),
							'param_name' => 'ps8_bgcolor',
							'description' => __( 'set post with image background color.', 'js_composer' ),
							'dependency' => array('element' => 'skin_type','value' => array('s8','s9','s10')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Top line color', 'js_composer' ),
							'param_name' => 'line_color',
							'description' => __( 'set the top color.', 'js_composer' ),
							'dependency' => array('element' => 'skin_type','value' => array('s1','s2','s4')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Title Color', 'js_composer' ),
							'param_name' => 'tcolor',
							'description' => __( 'set Title color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Title Hover Color', 'js_composer' ),
							'param_name' => 'thcolor',
							'description' => __( 'set Title hover color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Show More Color', 'js_composer' ),
							'param_name' => 'load_more_color',
							'description' => __( 'set show more color.', 'js_composer' ),
							'dependency' => array('element' => 'load_more','value' => array('loadmore','infinite')),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Filter text and border color', 'js_composer' ),
							'param_name' => 'filter_text_color',
							'dependency' => array('element' => 'filter','value' => 'yes'),
							'description' => __( 'set Filter text and border color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Active Filter text color', 'js_composer' ),
							'param_name' => 'filter_text_active_color',
							'dependency' => array('element' => 'filter','value' => 'yes'),
							'description' => __( 'set Active Filter text color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Active Filter text background color', 'js_composer' ),
							'param_name' => 'filter_text_active_bgcolor',
							'dependency' => array('element' => 'filter','value' => 'yes'),
							'description' => __( 'set Active Filter text background color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Pagination background color', 'js_composer' ),
							'param_name' => 'pagination_bgcolor',
							'dependency' => array('element' => 'load_more','value' => 'pagination'),
							'description' => __( 'set Pagination background color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Pagination active background color', 'js_composer' ),
							'param_name' => 'pagination_active_bgcolor',
							'dependency' => array('element' => 'load_more','value' => 'pagination'),
							'description' => __( 'set Pagination active background color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Pagination Number color', 'js_composer' ),
							'param_name' => 'pagination_number_color',
							'dependency' => array('element' => 'load_more','value' => 'pagination'),
							'description' => __( 'set Pagination Number color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Navigation and Pagination color', 'js_composer' ),
							'param_name' => 'car_navigation_color',
							'dependency' => array('element' => 'svc_type','value' => 'carousel'),
							'description' => __( 'Set Navigation and pagination color.', 'js_composer' ),
							'group' => __('Color Setting', 'js_composer')
						),
						array(
							'type' => 'checkbox',
							'heading' => __( 'Hide featured Image in popup', 'js_composer' ),
							'param_name' => 'dfeatured',
							'value' => array( __( 'Yes', 'js_composer' ) => 'yes' ),
							'description' => __( 'hide featured Image in popup.', 'js_composer' ),
							'group' => __('Popup Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Popup background color', 'js_composer' ),
							'param_name' => 'popup_bgcolor',
							'description' => __( 'set popup background color.', 'js_composer' ),
							'group' => __('Popup Setting', 'js_composer')
						),
						array(
							'type' => 'colorpicker',
							'heading' => __( 'Popup bottom line color', 'js_composer' ),
							'param_name' => 'popup_line_color',
							'description' => __( 'set popup bottom line color.', 'js_composer' ),
							'group' => __('Popup Setting', 'js_composer')
						),
						array(
							'type' => 'num',
							'heading' => __( 'Max Width For popup', 'js_composer' ),
							'param_name' => 'popup_max_width',
							'value' => '600',
							'min' => 10,
							'max' => 5000,
							'suffix' => 'px',
							'step' => 1,
							'description' => __( 'set popup max width.default:600px', 'js_composer' ),
							'group' => __('Popup Setting', 'js_composer')
						),
						array(
							'type' => 'dropdown',
							'heading' => __( 'Popup Effect', 'js_composer' ),
							'param_name' => 'popup_effect',
							'value' => array(
								__( 'None', 'js_composer' ) => '',
								__( 'flip-h-3d', 'js_composer' ) => 'flip-h-3d',
								__( 'rotate-carouse-left', 'js_composer' ) => 'rotate-carouse-left',
								__( 'slide-in-top', 'js_composer' ) => 'slide-in-top',
								__( 'fade-in-scale', 'js_composer' ) => 'fade-in-scale',
								__( 'mfp-newspaper', 'js_composer' ) => 'mfp-newspaper',
								__( 'mfp-zoom-in', 'js_composer' ) => 'mfp-zoom-in',
								__( 'mfp-move-horizontal', 'js_composer' ) => 'mfp-move-horizontal',
								__( 'mfp-3d-unfold', 'js_composer' ) => 'mfp-3d-unfold',
								__( 'mfp-zoom-out', 'js_composer' ) => 'mfp-zoom-out'
							),
							'description' => __( 'set Inline Post Popup effect.', 'js_composer' ),
							'group' => __('Popup Setting', 'js_composer')
						),
						[
							'type' => 'checkbox',
							'holder' => 'div',
							'heading' => __('Enable Search', 'js_composer'),
							'param_name' => 'enable_search',
							'group' => __('Search & Filters', 'js_composer')
						]
					)
				) );

			}
		}

	}
	

	//instantiate the class
	$svc_post_layout = new svc_post_layout;
}

add_action('pre_get_posts', function($query){
	if (is_admin()) {
		return $query;
	}
	$post_type = $query->query['post_type'];
	if (count($post_type) === 1 && $post_type === 'third-party-event' || $post_type[0] === 'third-party-event') {
		$query->set('orderby', 'meta_value');
		$query->set('meta_key', 'start_date');
		$query->set('order', 'ASC');
	}
	return $query;
});

add_action('wp_enqueue_scripts', function() {
	$search_js =  plugin_dir_url( __FILE__ ) . 'js/search.js';
	wp_register_script('svc-post-grid-search', $search_js);
});


