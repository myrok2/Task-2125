<?php
/*
 * GilidPanel Admin Settings
 */

class Settings_API_Tabs_GLDPNL_Plugin {
	
	/*
	 * For easier overriding we declared the keys
	 * here as well as our tabs array which is populated
	 * when registering settings
	 */
	private $general_settings_key = 'gldpnl_general_settings';
	private $animation_settings_key = 'gldpnl_animation_settings';
	private $color_settings_key = 'gldpnl_color_settings';
	private $fonts_settings_key = 'gldpnl_fonts_settings';
	private $icon_settings_key = 'gldpnl_icon_settings';
	private $other_settings_key = 'gldpnl_other_settings';
	private $plugin_options_key = 'gldpnl_plugin_options';
	private $plugin_settings_tabs = array();

	/**
    * @var array $options for the options for this plugin
    */
    var $options = array();
	var $api_key = '?key=AIzaSyDOMX7dvwq20uFMzoXwkjNDq_uS5yRrhto';
	var $api_url = 'https://www.googleapis.com/webfonts/v1/webfonts';
	var $gf_data_option_name = "gldpnl_googlefonts_data";
	var $gf_fonts_file = 'font/webfonts.php';
	
	/*
	 * Fired during plugins_loaded (very very early),
	 * so don't miss-use this, only actions and filters,
	 * current ones speak for themselves.
	 */
	function __construct() {
		add_action( 'init', array( &$this, 'gldpnl_load_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_general_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_animation_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_color_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_fonts_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_icon_settings' ) );
		add_action( 'admin_init', array( &$this, 'gldpnl_register_other_settings' ) );
		add_action( 'admin_menu', array( &$this, 'gldpnl_add_admin_menus' ) );
		add_action('admin_init' , array(&$this,'gldpnl_on_load_page'));
		$this->gldpnl_update_font_cache();
	}

	function gldpnl_on_load_page(){
		// wp_enqueue_media();
		wp_enqueue_style( 'font-awesome', GLDPNL_STYLES . '/font-awesome.css', array(), null );
	}
	
	/*
	 * Loads both the general and advanced settings from
	 * the database into their respective arrays. Uses
	 * array_merge to merge with default values if they're
	 * missing.
	 */
	function gldpnl_load_settings() {
		$this->general_settings = (array) get_option( $this->general_settings_key );
		$this->animation_settings = (array) get_option( $this->animation_settings_key );
		$this->color_settings = (array) get_option( $this->color_settings_key );
		$this->fonts_settings = (array) get_option( $this->fonts_settings_key );
		$this->icon_settings = (array) get_option( $this->icon_settings_key );
		$this->other_settings = (array) get_option( $this->other_settings_key );


		if( !isset( $this->icon_settings['version'] ) ){
			add_action('admin_notices', array( $this, 'showNotice' ));
		}
	}
	
	/*
	 * Registers the general settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_general_settings() {
		$this->plugin_settings_tabs[$this->general_settings_key] = __('General', 'gilidpanel');
		
		register_setting( $this->general_settings_key, $this->general_settings_key );
		add_settings_section( 'general_section', __('General Options', 'gilidpanel'), array( &$this, 'gldpnl_general_options_section' ), $this->general_settings_key );
	}

	function gldpnl_general_options_section(){ ?>
		<p><?php _e('This options allows you to set panel position', 'gilidpanel'); ?></p>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-responsive"><?php _e('Responsive','gilidpanel'); ?></label></th>
					<td>
						<input type="checkbox" id="gldpnl-responsive" name="<?php echo $this->general_settings_key; ?>[responsive]" value="1" <?php echo ( isset($this->general_settings['responsive']) ) ? 'checked=""checked' : ''; ?> /> <em><?php _e('Turn responsive for browser width less than 768px only.', 'gilidpanel');?></em><br />
					</td>
				</tr>

				<tr valign="top">
					<th scope="row"><label for="gldpnl-width"><?php _e('Panel Width', 'gilidpanel'); ?></label></th>
					<td>
						<input type="text" id="gldpnl-width" name="<?php echo $this->general_settings_key; ?>[width]" value="<?php echo $this->general_settings['width'];?>" size = "5"/> px
					</td>
				</tr>

				<tr valign="top">
					<th scope="row"><label for="gldpnl-position"><?php _e('Panel Position','gilidpanel'); ?></label></th>
					<td>
						<select id="gldpnl-position" name="<?php echo $this->general_settings_key; ?>[position]">
							<option value="left" <?php echo ($this->general_settings['position'] == "left") ? 'selected="selected"' : '';?>><?php _e('Left', 'gilidpanel'); ?></option>
							<option value="right" <?php echo ($this->general_settings['position'] == "right") ? 'selected="selected"' : '';?>><?php _e('Right', 'gilidpanel'); ?></option>
						</select>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row"><label for="gldpnl-type"><?php _e('Panel Type', 'gilidpanel');?></label></th>
					<td>
						<select id="gldpnl-type" name="<?php echo $this->general_settings_key; ?>[type]">
							<option value="slide" <?php echo ($this->general_settings['type'] == "slide") ? 'selected="selected"' : '';?>><?php _e('Slide', 'gilidpanel');?></option>
							<option value="push" <?php echo ($this->general_settings['type'] == "push") ? 'selected="selected"' : '';?>><?php _e('Push', 'gilidpanel');?></option>
						</select>
					</td>
				</tr>
				
			</tbody>
		</table><br />
		<p><?php _e('Please select the locations that you wish to allow the panel to show.', 'gilidpanel');?></p>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label><?php _e('Location','gilidpanel');?></label></th>
					<td>
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][all]" value="1" <?php echo ( isset($this->general_settings['location']['all']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('<strong>All Posts, Pages, Templates and Plugin Pages</strong> - <em> Display GilidPanel on any wordpress pages, this will override all individual locations below.</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][home]" value="1" <?php echo ( isset($this->general_settings['location']['home']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Home page - <em>The front page of the blog (if set to a static page), or the main blog page (if set to your latest posts).</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][blog]" value="1" <?php echo ( isset($this->general_settings['location']['blog']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Blog page - <em>The home page of the blog if is set to your latest posts, or the posts page if the home page is set to a static page</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][posts]" value="1" <?php echo ( isset($this->general_settings['location']['posts'] ) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Posts - <em>Single post pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][pages]" value="1" <?php echo ( isset($this->general_settings['location']['pages']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Pages - <em>Individual Wordpress pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][category]" value="1" <?php echo ( isset($this->general_settings['location']['category']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Category archives - <em>Category archive pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][date]" value="1" <?php echo ( isset($this->general_settings['location']['date']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Date archives - <em>Date archive pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][tag]" value="1" <?php echo ( isset($this->general_settings['location']['tag']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Tag archives - <em>Tag archive pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][author]" value="1" <?php echo ( isset($this->general_settings['location']['author']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Author archives - <em>Author archive pages</em>', 'gilidpanel');?><br />
						<input type="checkbox" name="<?php echo $this->general_settings_key; ?>[location][search]" value="1" <?php echo ( isset($this->general_settings['location']['search']) ) ? 'checked=""checked' : ''; ?> /> <?php _e('Search results - <em>Search results pages</em>', 'gilidpanel');?><br />
					</td>
				</tr>				
			</tbody>
		</table>
	<?php }

	/*
	 * Registers the animation settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_animation_settings() {
		$this->plugin_settings_tabs[$this->animation_settings_key] = __('Animation', 'gilidpanel');
		
		register_setting( $this->animation_settings_key, $this->animation_settings_key );
		add_settings_section( 'animation_section', __('Easing Options', 'gilidpanel'), array( &$this, 'gldpnl_animation_options_section' ), $this->animation_settings_key );
	}
	function gldpnl_animation_options_section(){ 
		$easing = array('swing','easeInQuad','easeOutQuad','easeInOutQuad','easeInCubic','easeOutCubic','easeInOutCubic','easeInQuart','easeOutQuart','easeInOutQuart','easeInQuint','easeOutQuint','easeInOutQuint','easeInSine','easeOutSine','easeInOutSine','easeInExpo','easeOutExpo','easeInOutExpo','easeInCirc','easeOutCirc','easeInOutCirc','easeInElastic','easeOutElastic','easeInOutElastic','easeInBack','easeOutBack','easeInOutBack','easeInBounce','easeOutBounce','easeInOutBounce');
		?>
		<p><?php _e('Change animation speed and easing effect','gilidpanel');?></p>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-speed"><?php _e('Animation Speed','gilidpanel');?></label></th>
					<td>
						<input type="text" id="gldpnl-speed" name="<?php echo $this->animation_settings_key; ?>[speed]" value="<?php echo $this->animation_settings['speed'];?>" size = "5"/> ms
					</td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-effect"><?php _e('Easing Effect','gilidpanel');?></label></th>
					<td>
						<select id="gldpnl-effect" name="<?php echo $this->animation_settings_key; ?>[easing]"  >
							<option value=""><?php _e('Select Effect', 'gilidpanel');?></option>
							<?php foreach ($easing as $key => $value) { ?>
							<option value="<?php echo $value;?>" <?php echo ($this->animation_settings['easing'] == $value) ? 'selected="selected"' : '';?>><?php echo $value;?></option>
							<?php } ?>
							
							</select>
					</td>
				</tr>
			</tbody>
		</table><br />
	<?php }

	/*
	 * Registers the color settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_color_settings() {
		$this->plugin_settings_tabs[$this->color_settings_key] = __('Appearance', 'gilidpanel');
		
		register_setting( $this->color_settings_key, $this->color_settings_key );
		add_settings_section( 'color_section', __('Custom Color Scheme','gilidpanel'), array( &$this, 'gldpnl_color_options_section' ), $this->color_settings_key );
	}

	function gldpnl_color_options_section(){ ?>
		<p><?php _e('Create your own panel color scheme by using the following options.', 'gilidpanel');?></p>

		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-coloropener"><?php _e('Opener', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-coloropener" name="<?php echo $this->color_settings_key; ?>[coloropener]" class="colorwell" value="<?php echo (!empty($this->color_settings['coloropener'])) ? $this->color_settings['coloropener'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-coloropenerbg"><?php _e('Opener Background', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-coloropenerbg" name="<?php echo $this->color_settings_key; ?>[coloropenerbg]" class="colorwell" value="<?php echo (!empty($this->color_settings['coloropenerbg'])) ? $this->color_settings['coloropenerbg'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-panelbg"><?php _e('Panel Background','gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-panelbg" name="<?php echo $this->color_settings_key; ?>[panelbg]" class="colorwell" value="<?php echo (!empty($this->color_settings['panelbg'])) ? $this->color_settings['panelbg'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorbg"><?php _e('Widget Background','gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorbg" name="<?php echo $this->color_settings_key; ?>[colorbg]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorbg'])) ? $this->color_settings['colorbg'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorhead"><?php _e('Widget Title', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorhead" name="<?php echo $this->color_settings_key; ?>[colorhead]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorhead'])) ? $this->color_settings['colorhead'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorheadbg"><?php _e('Widget Title Background', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorheadbg" name="<?php echo $this->color_settings_key; ?>[colorheadbg]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorheadbg'])) ? $this->color_settings['colorheadbg'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorlink"><?php _e('Links', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorlink" name="<?php echo $this->color_settings_key; ?>[colorlink]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorlink'])) ? $this->color_settings['colorlink'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorp"><?php _e('Paragraph', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorp" name="<?php echo $this->color_settings_key; ?>[colorp]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorp'])) ? $this->color_settings['colorp'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorlist"><?php _e('Lists', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorlist" name="<?php echo $this->color_settings_key; ?>[colorlist]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorlist'])) ? $this->color_settings['colorlist'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorbt"><?php _e('Button Text', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorbt" name="<?php echo $this->color_settings_key; ?>[colorbt]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorbt'])) ? $this->color_settings['colorbt'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-colorb"><?php _e('Button Background', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-colorb" name="<?php echo $this->color_settings_key; ?>[colorb]" class="colorwell" value="<?php echo (!empty($this->color_settings['colorb'])) ? $this->color_settings['colorb'] : '' ; ?>" /></td>
				</tr>
			</tbody>
		</table>
		<h3><?php _e('Hover Color Scheme', 'gilidpanel');?></h3>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hoveropener"><?php _e('Opener', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-hoveropener" name="<?php echo $this->color_settings_key; ?>[hoveropener]" class="colorwell" value="<?php echo (!empty($this->color_settings['hoveropener'])) ? $this->color_settings['hoveropener'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hoveropenerbg"><?php _e('Opener Background', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-hoveropenerbg" name="<?php echo $this->color_settings_key; ?>[hoveropenerbg]" class="colorwell" value="<?php echo (!empty($this->color_settings['hoveropenerbg'])) ? $this->color_settings['hoveropenerbg'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hoverlink"><?php _e('Links', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-hoverlink" name="<?php echo $this->color_settings_key; ?>[hoverlink]" class="colorwell" value="<?php echo (!empty($this->color_settings['hoverlink'])) ? $this->color_settings['hoverlink'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hoverbt"><?php _e('Button Text','gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-hoverbt" name="<?php echo $this->color_settings_key; ?>[hoverbt]" class="colorwell" value="<?php echo (!empty($this->color_settings['hoverbt'])) ? $this->color_settings['hoverbt'] : '' ; ?>" /></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hoverb"><?php _e('Button Background', 'gilidpanel');?></label></th>
					<td><input type="text" id="gldpnl-hoverb" name="<?php echo $this->color_settings_key; ?>[hoverb]" class="colorwell" value="<?php echo (!empty($this->color_settings['hoverb'])) ? $this->color_settings['hoverb'] : '' ; ?>" /></td>
				</tr>
			</tbody>
		</table>
		<h3><?php _e('Spacing', 'gilidpanel');?></h3>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-padding"><?php _e('Widget Item Padding', 'gilidpanel');?></label></th>
					<td>
						<input type="text" id="gldpnl-padding" name="<?php echo $this->color_settings_key; ?>[padding]" value="<?php echo $this->color_settings['padding'];?>" size = "5"/> px
					</td>
				</tr>
			</tbody>
		</table>
	<?php }

	/*
	 * Registers the fonts settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_fonts_settings() {
		$this->plugin_settings_tabs[$this->fonts_settings_key] = __('Fonts', 'gilidpanel');
		
		register_setting( $this->fonts_settings_key, $this->fonts_settings_key );
		add_settings_section( 'fonts_section', __('Font family Options','gilidpanel'), array( &$this, 'gldpnl_fonts_options_section' ), $this->fonts_settings_key );
	}

	function gldpnl_fonts_options_section(){ 
		$fonts = get_option($this->gf_data_option_name);
		$fonts = json_decode($fonts);
		?>

		<table class="form-table">
			<tbody>
				<?php if($fonts): ?>
				<tr valign="top">
					<th scope="row">
						<label for="gldpnl-font"><?php _e('Panel Font Family','gilidpanel')?></label>
					</th>
					<td>
						<select name="<?php echo $this->fonts_settings_key; ?>[general]" id="gldpnl-font">
							<option value=""><?php _e('Default', 'gilidpanel');?></option>
							<?php foreach($fonts->items as $font){
								$selected = '';
								$normalized_name = $this->gldpnl_normalize_font_name($font->family);
								if($this->fonts_settings['general'] == $normalized_name)
									$selected = 'selected="selected"';
								echo '<option value="'. $normalized_name .'" '. $selected .'>'. $font->family .'</option>';
							}?>
						</select>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<label for="gldpnl-headings"><?php _e('Widget Titles Font Family','gilidpanel')?></label>
					</th>
					<td>
						<select name="<?php echo $this->fonts_settings_key; ?>[headings]" id="gldpnl-headings">
							<option value=""><?php _e('Default','gilidpanel');?></option>
							<?php foreach($fonts->items as $font){
								$selected = '';
								$normalized_name = $this->gldpnl_normalize_font_name($font->family);
								if( $this->fonts_settings['headings'] == $normalized_name)
									$selected = 'selected="selected"';
								echo '<option value="'. $normalized_name .'" '. $selected .'>'. $font->family .'</option>';
							}?>
						</select>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<label for="gldpnl-nav"><?php _e('Navigation Links Font Family','gilidpanel')?></label>
					</th>
					<td>
						<select name="<?php echo $this->fonts_settings_key; ?>[nav]" id="gldpnl-nav">
							<option value=""><?php _e('Default', 'gilidpanel');?></option>
							<?php foreach($fonts->items as $font){
								$selected = '';
								$normalized_name = $this->gldpnl_normalize_font_name($font->family);
								if( $this->fonts_settings['nav'] == $normalized_name)
									$selected = 'selected="selected"';
								echo '<option value="'. $normalized_name .'" '. $selected .'>'. $font->family .'</option>';
							}?>
						</select>
					</td>
				</tr>

				<?php endif;?>
			</tbody>
		</table>

		<h3><?php _e('Font Size','gilidpanel');?></h3>
		<table class="form-table">
			<tbody>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-fsize"><?php _e('Panel Font Size','gilidpanel');?></label></th>
					<td>
						<input type="text" id="gldpnl-fsize" name="<?php echo $this->fonts_settings_key; ?>[fontsize]" value="<?php echo $this->fonts_settings['fontsize'];?>" size = "5"/> px
					</td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-hsize"><?php _e('Widget Titles Font Size', 'gilidpanel');?></label></th>
					<td>
						<input type="text" id="gldpnl-hsize" name="<?php echo $this->fonts_settings_key; ?>[titlesize]" value="<?php echo $this->fonts_settings['titlesize'];?>" size = "5"/> px
					</td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="gldpnl-navsize"><?php _e('Navigation Links Font Size', 'gilidpanel');?></label></th>
					<td>
						<input type="text" id="gldpnl-navsize" name="<?php echo $this->fonts_settings_key; ?>[navsize]" value="<?php echo $this->fonts_settings['navsize'];?>" size = "5"/> px
					</td>
				</tr>
			</tbody>
		</table>
	<?php }

	/*
	 * Registers the fonts settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_icon_settings() {
		$this->plugin_settings_tabs[$this->icon_settings_key] = __('Icon', 'gilidpanel');
		
		register_setting( $this->icon_settings_key, $this->icon_settings_key );
		add_settings_section( 'icon_section', __('Select Opener Icon', 'gilidpanel'), array( &$this, 'gldpnl_icon_options_section' ), $this->icon_settings_key );
	}

	function gldpnl_icon_options_section(){ 
		$icons = gldpnl_fontawesome();
		$count = 1;
		$total = count($icons);
		?>
		<style>
			.gldpnl-icon-table label i{
				font-size: 22px;
			}
			.gldpnl-icon-table label{
				padding: 2px 10px;
			}
			.wpgldpnl_media_image img{
				max-width: 100%;
				padding: 10px;
			}
		</style>
		<input type="hidden" name="<?php echo $this->icon_settings_key; ?>[version]" value="<?php echo GLDPNL_VERSION;?>"/>
		<table class="form-table gldpnl-icon-table">
			<tbody>
					<tr valign="top"> 
						<td colspan="10">
							<input type="radio" name="<?php echo $this->icon_settings_key; ?>[icon]" value="custom" id="gldpnl-icon-custom" <?php  if($this->icon_settings['icon'] == 'custom'){ echo 'checked="checked"'; };?> />
							<label for="gldpnl-icon-custom"><?php _e('Custom Image', 'gilidpanel');?></label>
							<input type="hidden" name="<?php echo $this->icon_settings_key; ?>[image]" class="gldpnl_icon_settings_image" value="<?php if(isset($this->icon_settings['image'])){ echo $this->icon_settings['image']; }?>" />
							
							<!-- <p> -->
								<input type='button' class="button-primary wpgldpnl_media_upload" id="wpgldpnl-uploader" value="Upload Image" data-uploader_title="<?php _e( 'Choose Image', 'gilidpanel' ); ?>" data-uploader_button_text="<?php _e( 'Use Image', 'gilidpanel' ); ?>" />
								<input type="button" class="button-secondary wpgldpnl_remove_image" value="Remove Image" />
								<em><small> &nbsp;&nbsp;<?php _e('Please Upload Exact Image Size. Thanks!', 'gilidpanel');?></small></em>
								<br />
								<div class="wpgldpnl_media_image" style="width:100%; overflow:hidden;"><?php if(isset($this->icon_settings['image'])){ echo '<img src="'. $this->icon_settings['image'] .'" />'; }?></div>
							<!-- </p> -->
						</td>
					</tr>
					<?php 
						foreach ($icons as $key => $value) { ?>
							<?php if(($count % 10) == 1) :?><tr valign="top"> <?php endif;?>
								<td>
									<input type="radio" name="<?php echo $this->icon_settings_key; ?>[icon]" value="<?php echo $key;?>" id="gldpnl-icon<?php echo $count;?>" <?php  if($this->icon_settings['icon'] == $key){ echo 'checked="checked"'; };?> />
									<label for="gldpnl-icon<?php echo $count;?>"><i class="fa <?php echo $key;?>"></i></label>
								</td>
							<?php if( (($count % 10) == 0) || (($count % 10) != 0 && $count == $total) ) :?> </tr> <?php endif;?>
						<?php $count++; }
					?>
			</tbody>	
		</table>
	<?php }

	/*
	 * Registers the other settings via the Settings API,
	 * appends the setting to the tabs array of the object.
	 */
	function gldpnl_register_other_settings() {
		$this->plugin_settings_tabs[$this->other_settings_key] = __('Other Option', 'gilidpanel');
		
		register_setting( $this->other_settings_key, $this->other_settings_key );
		add_settings_section( 'other_section', __('Open Panel via Menu or Link', 'gilidpanel'), array( &$this, 'gldpnl_other_options_section' ), $this->other_settings_key );
	}

	function gldpnl_other_options_section(){ 
		?>
		<p><?php _e('Yes! You can trigger the open and close of the panel using any navigation link menu and anchor link. Just add this class : <strong>open-gilidpanel</strong>', 'gilidpanel');?></p>
		<p><strong><?php _e('Example :', 'gilidpanel');?></strong><br /><br />
			<strong><?php _e('LINK :', 'gilidpanel');?></strong> <br />
			<?php _e('&#60;a href="#" class="<strong>open-gilidpanel</strong>"&#62;Open Panel&#60;/a&#62; ', 'gilidpanel');?><br /><br />

			<strong><?php _e('MENU :', 'gilidpanel');?></strong><br />
			<img src="<?php echo GLDPNL_IMG;?>/menu-opener.png" />
		</p>
	<?php }
	
	/*
	 * Called during admin_menu, adds an options
	 * page under Settings called My Settings, rendered
	 * using the wplftr_plugin_options_page method.
	 */
	function gldpnl_add_admin_menus() {
		add_options_page( 'GilidPanel Settings', 'GilidPanel Setting', 'manage_options', $this->plugin_options_key, array( &$this, 'gldpnl_plugin_options_page' ) );
	}
	
	/*
	 * Plugin Options page rendering goes here, checks
	 * for active tab and replaces key with the related
	 * settings key. Uses the wplftr_plugin_options_tabs method
	 * to render the tabs.
	 */
	function gldpnl_plugin_options_page() {
		$tab = isset( $_GET['tab'] ) ? $_GET['tab'] : $this->general_settings_key;
		?>
		<div class="wrap">
			<?php $this->gldpnl_plugin_options_tabs(); ?>
			<form method="post" action="options.php">
				<?php wp_nonce_field( 'update-options' ); ?>
				<?php settings_fields( $tab ); ?>
				<?php do_settings_sections( $tab ); ?>
				<?php 
				if(function_exists('submit_button')) { submit_button(); } else { ?>
				<p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Save Changes"></p>
				<?php }?>
			</form>
		</div>
		<?php
	}
	
	/*
	 * Renders our tabs in the plugin options page,
	 * walks through the object's tabs array and prints
	 * them one by one. Provides the heading for the
	 * wplftr_plugin_options_page method.
	 */
	function gldpnl_plugin_options_tabs() {
		$current_tab = isset( $_GET['tab'] ) ? $_GET['tab'] : $this->general_settings_key;

		screen_icon();
		echo '<h2 class="nav-tab-wrapper">';
		foreach ( $this->plugin_settings_tabs as $tab_key => $tab_caption ) {
			$active = $current_tab == $tab_key ? 'nav-tab-active' : '';
			echo '<a class="nav-tab ' . $active . '" href="?page=' . $this->plugin_options_key . '&tab=' . $tab_key . '">' . $tab_caption . '</a>';	
		}
		echo '</h2>';
	}

	/*
	 * Google Fonts
	 */
	function gldpnl_download_font_list($url){
		$fonts_json = null;
		
		if(function_exists('wp_remote_get')){
			
			$response = wp_remote_get($url, array('sslverify' => false));
			
			if( is_wp_error($response)){
			
			}else{
				/* see if the response has an error */
				
				if(isset($response['body']) && $response['body']){
					
					if(strpos($response['body'], 'error') === false){
						/* no errors, good to go */
						$fonts_json = $response['body'];
						
					}
				}
			}
		}
		
		return $fonts_json;
	}
	function gldpnl_get_local_fonts(){
		$fonts = null;
		
		include_once( dirname( __DIR__ ). '/font/webfonts.php' );

		return $fonts;
	}
	function gldpnl_update_font_cache(){
		$updated = false;
		$gldpnl_cache = get_option('gldpnl_cache');
		$date = date('d-m-Y');
		update_option('gldpnl_cache',$date);
		if($date != $gldpnl_cache){
			$fonts_json = $this->gldpnl_download_font_list($this->api_url);
			
			/* if we didn't get anything, try with api key */
			if(!$fonts_json){
				$fonts_json = $this->gldpnl_download_font_list($this->api_url.$this->api_key);
			}
			
			/* if still nothing and do not have a cache already, then get the local file instead */
			if(!$fonts_json){
				$fonts_json = $this->gldpnl_get_local_fonts();
			}
			
			if($fonts_json){
				/* put into option in WordPress */
				$updated = update_option($this->gf_data_option_name,$fonts_json);
			}
			
			return $updated;
		}
	}
	function gldpnl_normalize_font_name($name){
		return(str_replace(" ","-",trim($name)));
	}
	/*
    Show notice if your plugin is activated but Visual Composer is not
    */
    public function showNotice() {
        $plugin_data = get_plugin_data(__FILE__);
        echo '
        <div class="updated">
          <p>'. __('You have successfully updated GilidPanel. Opener icon needs to be updated to worked properly, <a href="'. admin_url('options-general.php?page=' . $this->plugin_options_key . '&tab='. $this->icon_settings_key ) . '">click here</a> to update. Thanks!', 'gilidpanel') .'</p>
        </div>';
    }
};

// Initialize the plugin
add_action( 'plugins_loaded', create_function( '', '$settings_api_tabs_gldpnl_plugin = new Settings_API_Tabs_GLDPNL_Plugin;' ) );

?>