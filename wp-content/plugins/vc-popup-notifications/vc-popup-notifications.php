<?php
/*
Plugin Name: Visual Composer Popup Notifications
Plugin URI: http://amansaini.me
Description: Create Popup Notifications and insert into page/posts
Version: 1.2.1
Author: Aman Saini
Author URI:  http://amansaini.me
 */

// don't load directly
if (!defined('ABSPATH')) {
	die('-1');
}

define("VCPOP_UP_NOTIF_VER", '1.2.1');
define("VCPOP_UP_NOTIF_DIR", WP_PLUGIN_DIR . "/" . basename(dirname(__FILE__)));
define("VCPOP_UP_NOTIF_URL", plugins_url() . "/" . basename(dirname(__FILE__)));

require_once VCPOP_UP_NOTIF_DIR . '/inc/admin/register-posttype.php';

// TODO : Add conditions to show popup on certain pages
require_once VCPOP_UP_NOTIF_DIR.'/inc/admin/metaboxes.php';
add_action( 'plugins_loaded', array( 'Vc_Popup_Notification_Metabox', 'setup' ) );

require_once VCPOP_UP_NOTIF_DIR . '/inc/global-popup.php';
add_action('plugins_loaded', array('VC_Pop_Global', 'setup'));

class VCExtendPopUpNotifications {
	function __construct() {

		// We safely integrate with VC with this hook
		add_action('vc_before_init', array($this, 'integrateWithVC'));

		add_action('wp_enqueue_scripts', array($this, 'vcpn_add_scripts_to_frontend'));

	}

	public function vcpn_add_scripts_to_frontend() {

		wp_enqueue_style('amarancss', plugins_url('css/jquery.amaran.css', __FILE__));
		wp_enqueue_style('amaranallthemecss', plugins_url('css/theme/all-themes.css', __FILE__));
		wp_enqueue_style('fontawsomecss', plugins_url('css/font-awsome.css', __FILE__));
		wp_enqueue_style('popupanimate', plugins_url('css/animate.min.css', __FILE__));
		wp_enqueue_style('open-sanscss', 'https://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,400,600');

		wp_enqueue_script('amaranjs', plugins_url('js/jquery.amaran.js', __FILE__), array('jquery'));
	}

	public function integrateWithVC() {
		// Check if Visual Composer is installed
		if (!defined('WPB_VC_VERSION') || !function_exists('wpb_map')) {

			// Display notice that Visual Compser is required
			add_action('admin_notices', array($this, 'showVcVersionNotice'));
			return;

		}
		add_shortcode_param('fa_icon', array($this, 'fontawsomeicons'), plugins_url('js/script-vc.js', __FILE__));
		//add animate.css param
		add_shortcode_param('popup_animate_sel_field', array($this, 'popup_animate_sel_field'));

		vc_map(array(
			"name" => __("Popup Notifications", "vcpn"),
			"base" => "vcpn",
			"icon" => "icon-wpb-vc_popup_notification",
			"category" => __("Settings", "vcpn"),
			"description" => __('Add popup notifications', 'vcpn'),
			"admin_enqueue_css" => array(plugins_url('css/vc_extend_popup-admin.css', __FILE__)),
			"params" => array(

				array(
					'type' => 'textfield',
					'heading' => __('Number of times to show', 'vcpn'),
					'param_name' => 'times',
					"group" => "Settings",
					'description' => __('Number of times popup to show (uses cookies in browser).Leave it empty for unlimited times', 'vcpn'),
				)
				,
				array(
					'type' => 'checkbox',
					'heading' => __('Hide Forever on close click', 'vcpn'),
					'param_name' => 'hide_forever',
					"group" => "Settings",
					'description' => __('Check it if you never want to show the popup again on page after user clicks close button', 'vcpn'),
					'value' => array(__('Yes, please', 'vcpn') => 'yes'),
				)
				,
				array(
					"type" => "dropdown",
					"heading" => __("Notification Theme", "vcpn"),
					"param_name" => "theme",
					"group" => "Settings",
					"value" => array(
						'Default' => 'default',
						'User' => 'user',
						'Blur' => 'blur',
						'Dark' => 'simdark',
						'Rounded' => 'rounded',
						'Readmore' => 'readmore',
					),
					"description" => __("Select the popup notification theme.", "vcpn"),
				),

				array(
					'type' => 'dropdown',
					'heading' => __('Theme Variation (Color)', 'js_composer'),
					'param_name' => 'variation',
					"group" => "Settings",
					'description' => __('Color of theme.', 'vcpn'),
					'value' => array(
						'Green' => 'green',
						'Red' => 'red',
						'Orange' => 'orange',
						'Blue' => 'blue',
						'Yellow' => 'yellow',
						'Pink' => 'pink',
						'Magenta' => 'magenta',
						'Gold' => 'gold',
						'Warning' => 'warning',

					),
					'dependency' => array(
						'element' => 'theme',
						'value' => array('default', 'user', 'readmore', 'rounded', 'simdark'),
					),
				),

				array(
					'type' => 'textfield',
					'heading' => __('Width', 'vcpn'),
					'param_name' => 'width',
					"group" => "Settings",
					'description' => __('Width of Popup in px. example 200px.', 'vcpn'),
					'value' => '225px',

				),
				array(
					'type' => 'textfield',
					'heading' => __('Height', 'vcpn'),
					'param_name' => 'height',
					"group" => "Settings",
					'value' => '70px',
					'description' => __('Height of Popup in px. example 100px.', 'vcpn'),

				),

				array(
					'type' => 'textfield',
					'heading' => __('Heading', 'vcpn'),
					'param_name' => 'heading',
					"group" => "Settings",
					'description' => __('Main Heading in Popup.', 'vcpn'),
					'dependency' => array(
						'element' => 'theme',
						'value' => array('default', 'blur', 'user', 'readmore', 'simdark'),
					),
				)
				,
				array(
					'type' => 'textfield',
					'heading' => __('Sub Heading', 'vcpn'),
					'param_name' => 'sub_heading',
					"group" => "Settings",
					'description' => __('Text below the main Heading.', 'vcpn'),
					'dependency' => array(
						'element' => 'theme',
						'value' => array('default'),
					),
				),
				array(
					'type' => 'attach_image',
					'heading' => __('Image', 'js_composer'),
					'param_name' => 'image',
					'value' => '',
					"group" => "Settings",
					'description' => __('Add Image to show in Popup.', 'vcpn'),
					'dependency' => array(
						'element' => 'theme',
						'value' => array('rounded', 'user', 'readmore'),
					),
				),
				array(
					'type' => 'fa_icon',
					'heading' => __('Chose Icon', 'vcpn'),
					'param_name' => 'icon',
					"group" => "Settings",
					'dependency' => array(
						'element' => 'theme',
						'value' => array('default'),
					),

				),
				array(
					'type' => 'textarea_html',

					'heading' => __('Content', 'vcpn'),
					'param_name' => 'content',
					"group" => "Settings",
					'description' => __('You can also insert the shortcode here .', 'vcpn'),
					'dependency' => array(
						'element' => 'theme',
						'value' => array('default', 'readmore'),
					),
				),
				array(
					'type' => 'dropdown',
					'heading' => __('Position', 'js_composer'),
					'param_name' => 'position',
					"group" => "Animation",
					'description' => __('Text Below the main Heading.', 'vcpn'),
					'value' => array(
						'Bottom Right' => 'bottomright',
						'Bottom Left' => 'bottomleft',
						'Top Left' => 'topleft',
						'Top Right' => 'topright',
					),
				),
				array(
					'type' => 'popup_animate_sel_field',
					'heading' => __('Notifications in effects', 'vcpn'),
					'param_name' => 'ineffect',
					"group" => "Animation",
					'description' => __('Notifications appear effect.', 'vcpn'),

				),
				array(
					'type' => 'popup_animate_sel_field',
					'heading' => __('Notification out effects', 'vcpn'),
					'param_name' => 'outeffect',
					"group" => "Animation",
					'description' => __('Notifications disappearing effect.', 'vcpn'),

				),
				array(
					'type' => 'textfield',
					'heading' => __('Show Delay', 'js_composer'),
					'param_name' => 'startdelay',
					"group" => "Animation",
					'description' => __('Default auto show time is 1 seconds you can specify auto show time with show delay option..', 'vcpn'),
					'value' => 1,
				),
				array(
					'type' => 'textfield',
					'heading' => __('Hide Delay', 'js_composer'),
					'param_name' => 'delay',
					"group" => "Animation",
					'description' => __('Default auto hide time is 3 seconds you can specify auto hide time with hide delay option..', 'vcpn'),
					'value' => 3,
				),
				array(
					'type' => 'dropdown',
					'heading' => __('Sticky', 'js_composer'),
					'param_name' => 'sticky',
					"group" => "Animation",
					'description' => __('Notifications remain on screen.', 'vcpn'),
					'value' => array(
						'False' => 'false',
						'True' => 'true',
					),
				),
				array(
					'type' => 'dropdown',
					'heading' => __('Close on Click', 'js_composer'),
					'param_name' => 'closeonclick',
					"group" => "Animation",
					'description' => __('You can close notifications by clicking on them.', 'vcpn'),
					'value' => array(
						'True' => 'true',
						'False' => 'false',

					),
				),
				array(
					'type' => 'dropdown',
					'heading' => __('Close Button', 'js_composer'),
					'param_name' => 'closebutton',
					"group" => "Animation",
					'description' => __('You can add close button to notifications.', 'vcpn'),
					'value' => array(
						'False' => 'false',
						'True' => 'true',
					),
				),
			),
		)
		);

	}

	public function fontawsomeicons($settings, $value) {
		$dependency = vc_generate_dependencies_attributes($settings);
		return '<div class="my_param_block">'
		. '<div class="vcpn_icon_preview" style="display: inline-block;
					margin-right: 10px;
					height: 60px;
					width: 90px;
					text-align: center;
					background: #FAFAFA;
					font-size: 60px;
					padding: 15px 0;
					margin-bottom: 10px;
					border: 1px solid #DDD;
					float: left;
					box-sizing: content-box;"><i class="bk-ice-cream"></i></div>'
		. '<input placeholder="' . __("Search icon or pick one below...", 'vcpn') . '" name="' . $settings['param_name'] . '"'
		. ' data-param-name="' . $settings['param_name'] . '"'
		. ' data-icon-css-path="' . plugins_url('/', __FILE__) . '"'
		. 'class="wpb_vc_param_value wpb-textinput'
		. $settings['param_name'] . ' ' . $settings['type'] . '_field" type="text" value="'
		. $value . '" ' . $dependency . ' style="width: 230px; margin-right: 10px; vertical-align: top; float: left; margin-bottom: 10px"/>'

		. '<div class="vcpn_select_font_window" style="display: none; font-size: 40px; width: 100%; padding: 8px;
					box-sizing: border-box;
					-moz-box-sizing: border-box;
					background: #FAFAFA;
					height: 250px;
					overflow-y: scroll;
					border: 1px solid #DDD;
					clear: both"></div>'
		. '</div>';
	}

	/**
	 * Add the animate dropdown filed param
	 *
	 * @author Aman Saini
	 * @since  1.0
	 * @param [type]  $settings
	 * @param [type]  $value
	 * @return
	 */
	function popup_animate_sel_field($settings, $value) {

		$dependency = vc_generate_dependencies_attributes($settings);

		$select = '<select class=" wpb_vc_param_value wpb-selectinput' . $settings['param_name'] . ' ' . $settings['type'] . '_field" name="' . $settings['param_name'] . '" ' . $dependency . '  id="' . $settings['param_name'] . '">


												<option ' . selected($value, 'slideBottom', false) . ' value="slideBottom">Slide Bottom</option>
												<option ' . selected($value, 'slideTop', false) . ' value="slideTop">Slide Top</option>
												<option ' . selected($value, 'slideRight', false) . ' value="slideRight">Slide Right</option>
												<option ' . selected($value, 'slideLeft', false) . ' value="slideLeft">Slide Left</option>

												<optgroup label="Attention Seekers">
													<option ' . selected($value, 'bounce', false) . ' value="bounce">bounce</option>
													<option ' . selected($value, 'flash', false) . ' value="flash">flash</option>
													<option ' . selected($value, 'pulse', false) . ' value="pulse">pulse</option>
													<option ' . selected($value, 'rubberBand', false) . ' value="rubberBand">rubberBand</option>
													<option ' . selected($value, 'shake', false) . ' value="shake">shake</option>
													<option ' . selected($value, 'swing', false) . ' value="swing">swing</option>
													<option ' . selected($value, 'tada', false) . ' value="tada">tada</option>
													<option ' . selected($value, 'wobble', false) . ' value="wobble">wobble</option>
												</optgroup>

												<optgroup label="Bouncing Entrances">
													<option ' . selected($value, 'bounceIn', false) . ' value="bounceIn">bounceIn</option>
													<option ' . selected($value, 'bounceInDown', false) . ' value="bounceInDown">bounceInDown</option>
													<option ' . selected($value, 'bounceInLeft', false) . ' value="bounceInLeft">bounceInLeft</option>
													<option ' . selected($value, 'bounceInRight', false) . ' value="bounceInRight">bounceInRight</option>
													<option ' . selected($value, 'bounceInUp', false) . ' value="bounceInUp">bounceInUp</option>
												</optgroup>

												<optgroup label="Bouncing Exits">
													<option ' . selected($value, 'bounceOut', false) . ' value="bounceOut">bounceOut</option>
													<option ' . selected($value, 'bounceOutDown', false) . ' value="bounceOutDown">bounceOutDown</option>
													<option ' . selected($value, 'bounceOutLeft', false) . ' value="bounceOutLeft">bounceOutLeft</option>
													<option ' . selected($value, 'bounceOutRight', false) . ' value="bounceOutRight">bounceOutRight</option>
													<option ' . selected($value, 'bounceOutUp', false) . ' value="bounceOutUp">bounceOutUp</option>
												</optgroup>

												<optgroup label="Fading Entrances">
													<option ' . selected($value, 'fadeIn', false) . ' value="fadeIn">fadeIn</option>
													<option ' . selected($value, 'fadeInDown', false) . ' value="fadeInDown">fadeInDown</option>
													<option ' . selected($value, 'fadeInDownBig', false) . ' value="fadeInDownBig">fadeInDownBig</option>
													<option ' . selected($value, 'fadeInLeft', false) . ' value="fadeInLeft">fadeInLeft</option>
													<option ' . selected($value, 'fadeInLeftBig', false) . ' value="fadeInLeftBig">fadeInLeftBig</option>
													<option ' . selected($value, 'fadeInRight', false) . ' value="fadeInRight">fadeInRight</option>
													<option ' . selected($value, 'fadeInRightBig', false) . ' value="fadeInRightBig">fadeInRightBig</option>
													<option ' . selected($value, 'fadeInUp', false) . ' value="fadeInUp">fadeInUp</option>
													<option ' . selected($value, 'fadeInUpBig', false) . ' value="fadeInUpBig">fadeInUpBig</option>
												</optgroup>

												<optgroup label="Fading Exits">
													<option ' . selected($value, 'fadeOut', false) . ' value="fadeOut">fadeOut</option>
													<option ' . selected($value, 'fadeOutDown', false) . ' value="fadeOutDown">fadeOutDown</option>
													<option ' . selected($value, 'fadeOutDownBig', false) . ' value="fadeOutDownBig">fadeOutDownBig</option>
													<option ' . selected($value, 'fadeOutLeft', false) . ' value="fadeOutLeft">fadeOutLeft</option>
													<option ' . selected($value, 'fadeOutLeftBig', false) . ' value="fadeOutLeftBig">fadeOutLeftBig</option>
													<option ' . selected($value, 'fadeOutRight', false) . ' value="fadeOutRight">fadeOutRight</option>
													<option ' . selected($value, 'fadeOutRightBig', false) . ' value="fadeOutRightBig">fadeOutRightBig</option>
													<option ' . selected($value, 'fadeOutUp', false) . ' value="fadeOutUp">fadeOutUp</option>
													<option ' . selected($value, 'fadeOutUpBig', false) . ' value="fadeOutUpBig">fadeOutUpBig</option>
												</optgroup>

												<optgroup label="Flippers">
													<option ' . selected($value, 'flip', false) . ' value="flip">flip</option>
													<option ' . selected($value, 'flipInX', false) . ' value="flipInX" >flipInX</option>
													<option ' . selected($value, 'flipInY', false) . ' value="flipInY">flipInY</option>
													<option ' . selected($value, 'flipOutX', false) . ' value="flipOutX">flipOutX</option>
													<option ' . selected($value, 'flipOutY', false) . ' value="flipOutY">flipOutY</option>
												</optgroup>

												<optgroup label="Lightspeed">
													<option ' . selected($value, 'lightSpeedIn', false) . ' value="lightSpeedIn">lightSpeedIn</option>
													<option  ' . selected($value, 'lightSpeedOut', false) . 'value="lightSpeedOut">lightSpeedOut</option>
												</optgroup>

												<optgroup label="Rotating Entrances">
													<option ' . selected($value, 'rotateIn', false) . ' value="rotateIn">rotateIn</option>
													<option ' . selected($value, 'rotateInDownLeft', false) . ' value="rotateInDownLeft">rotateInDownLeft</option>
													<option ' . selected($value, 'rotateInDownRight', false) . ' value="rotateInDownRight">rotateInDownRight</option>
													<option ' . selected($value, 'rotateInUpLeft', false) . ' value="rotateInUpLeft">rotateInUpLeft</option>
													<option ' . selected($value, 'rotateInUpRight', false) . ' value="rotateInUpRight">rotateInUpRight</option>
												</optgroup>

												<optgroup label="Rotating Exits">
													<option ' . selected($value, 'rotateOut', false) . ' value="rotateOut">rotateOut</option>
													<option ' . selected($value, 'rotateOutDownLeft', false) . ' value="rotateOutDownLeft">rotateOutDownLeft</option>
													<option ' . selected($value, 'rotateOutDownRight', false) . ' value="rotateOutDownRight">rotateOutDownRight</option>
													<option ' . selected($value, 'rotateOutUpLeft', false) . ' value="rotateOutUpLeft">rotateOutUpLeft</option>
													<option ' . selected($value, 'rotateOutUpRight', false) . ' value="rotateOutUpRight">rotateOutUpRight</option>
												</optgroup>

												<optgroup label="Specials">
													<option ' . selected($value, 'hinge', false) . ' value="hinge">hinge</option>
													<option ' . selected($value, 'rollIn', false) . ' value="rollIn">rollIn</option>
													<option ' . selected($value, 'rollOut', false) . ' value="rollOut">rollOut</option>
												</optgroup>

												<optgroup label="Zoom Entrances">
													<option ' . selected($value, 'zoomIn', false) . ' value="zoomIn">zoomIn</option>
													<option ' . selected($value, 'zoomInDown', false) . ' value="zoomInDown">zoomInDown</option>
													<option ' . selected($value, 'zoomInLeft', false) . ' value="zoomInLeft">zoomInLeft</option>
													<option ' . selected($value, 'zoomInRight', false) . ' value="zoomInRight">zoomInRight</option>
													<option ' . selected($value, 'zoomInUp', false) . ' value="zoomInUp">zoomInUp</option>
												</optgroup>

												<optgroup label="Zoom Exits">
													<option ' . selected($value, 'zoomOut', false) . ' value="zoomOut">zoomOut</option>
													<option ' . selected($value, 'zoomOutDown', false) . ' value="zoomOutDown">zoomOutDown</option>
													<option ' . selected($value, 'zoomOutLeft', false) . ' value="zoomOutLeft">zoomOutLeft</option>
													<option ' . selected($value, 'zoomOutRight', false) . ' value="zoomOutRight">zoomOutRight</option>
													<option ' . selected($value, 'zoomOutUp', false) . ' value="zoomOutUp">zoomOutUp</option>
												</optgroup>
											</select>';

		return $select;

	}

	/*
	Show notice if your plugin is activated but Visual Composer is not
	 */
	public function showVcVersionNotice() {
		$plugin_data = get_plugin_data(__FILE__);
		echo '
		<div class="updated">
		  <p>' . sprintf(__('<strong>%s</strong> requires <strong><a href="http://bit.ly/vcomposer" target="_blank">Visual Composer</a></strong> plugin to be installed and activated on your site.', 'vc_extend'), $plugin_data['Name']) . '</p>
		</div>';
	}
}
// Finally initialize code
new VCExtendPopUpNotifications();

function vcpn_add_popup_notification($atts, $content = "") {

	extract(shortcode_atts(array(
		'times' => '',
		'theme' => 'default',
		'variation' => 'green',
		'width' => '225px',
		'height' => '70px',
		'heading' => '',
		'sub_heading' => '',
		'hide_forever' => 'no',
		'icon' => '',
		'image' => '',
		'position' => 'bottomright',
		'ineffect' => 'fadeIn',
		'outeffect' => 'fadeOut',
		'startdelay' => 1,
		'delay' => 3,
		'sticky' => 'false',
		'closeonclick' => 'true',
		'closebutton' => 'false',
	), $atts));

	// Generate a random number for div id that contains the content
	$unique_id = rand(100, 2000);
	echo '<div id="hidden-content-' . $unique_id . '" style="display:none">' . do_shortcode($content) . '</div>';
	$message = '';

	switch ($position) {
		case 'bottomright':
			$position = 'bottom right';
			break;
		case 'bottomleft':
			$position = 'bottom left';
			break;
		case 'topright':
			$position = 'top right';
			break;
		case 'topleft':
			$position = 'top left';
			break;

		default:
			$position = 'bottom right';
			break;
	}

	$post_id = get_the_id();

	$value = 0;

	// if no icon , then add the class to make the popup full width
	if (empty($icon)) {
		$fullwidth = 'true';
	} else {
		$fullwidth = 'false';
	}

	// check if to use animate.css or default animation depending on the value

	$default_anim = array('slideBottom', 'slideTop', 'slideRight', 'slideLeft');

	// For Ineffects
	if (in_array($ineffect, $default_anim)) {
		$in_effect = 'inEffect:"' . $ineffect . '"';
	} else {
		$in_effect = 'cssanimationIn:"' . $ineffect . '"';
	}

	// For OutEffects
	if (in_array($outeffect, $default_anim)) {
		$out_effect = 'outEffect:"' . $outeffect . '"';
	} else {
		$out_effect = 'cssanimationOut:"' . $outeffect . '"';
	}

	?>

 <script type="text/javascript">

	  (function($){

		$(function(){

			var hideforever = "<?php echo $hide_forever;?>";

			if( hideforever !='' && hideforever!='no'){
			$('body').on('click','.amaran-close',function(){
				//set the cookie
					document.cookie="hide_pop_forever=yes; expires=Thu, 18 Dec 2020 12:00:00 GMT";
			})
			}else{
				// delete the cookie
					document.cookie="hide_pop_forever=no; expires=Thu, 18 Dec 2008 12:00:00 GMT";
			}
		})

	  })(jQuery)
	  </script>

<?php

	if (!empty($theme)) {

		if (!empty($image)) {

			$img_array = wp_get_attachment_image_src($image);

			$image = $img_array[0];

		}
		// include the theme file
		include_once 'templates/' . $theme . '.php';
	}

}

add_shortcode('vcpn', 'vcpn_add_popup_notification');
