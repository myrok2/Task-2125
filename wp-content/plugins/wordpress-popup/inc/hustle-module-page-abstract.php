<?php

/**
 * Class Hustle_Module_Page
 */
abstract class Hustle_Module_Page_Abstract extends Hustle_Admin_Page_Abstract {

	/**
	 * Current module. Only set on wizards when the module exists.
	 * @since 4.0.3
	 * @var integer
	 */
	protected $module = false;

	protected function init() {

		$this->set_page_properties();

		$this->page_menu_title = $this->page_title;

		$this->page = Hustle_Module_Admin::get_listing_page_by_module_type( $this->module_type );

		$this->page_capability = 'hustle_edit_module';

		$this->page_edit = Hustle_Module_Admin::get_wizard_page_by_module_type( $this->module_type );

		$this->page_edit_capability = 'hustle_create';

		$this->page_edit_title = sprintf( esc_html__( 'New %s', 'wordpress-popup' ), Opt_In_Utils::get_module_type_display_name( $this->module_type ) );

		add_filter( 'submenu_file', array( $this, 'admin_submenu_file' ), 10, 2 );

		add_action( 'admin_head', array( $this, 'hide_unwanted_submenus' ) );

		// admin-menu-editor compat
		add_action( 'admin_menu_editor-menu_replaced', array( $this, 'hide_unwanted_submenus' ) );
	}

	abstract protected function set_page_properties();

	/**
	 * Actions to be performed on Dashboard page.
	 *
	 * @since 4.0.4
	 */
	protected function on_current_page_actions() {

		// Set the current module on Wizards, abort if invalid.
		$this->set_current_module();
		add_action( 'admin_init', array( $this, 'on_admin_init' ) );

		// For preview.
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_recaptcha_script' ] );
		add_action( 'admin_footer', array( $this, 'maybe_print_forminator_scripts' ) );
	}

	/**
	 * Set the current module only if the current page is wizard and the module is valid.
	 * @since 4.0.3
	 */
	private function set_current_module() {

		if ( $this->page_edit === $this->current_page ) {

			$module_id = filter_input( INPUT_GET, 'id', FILTER_VALIDATE_INT );
			$module = Hustle_Module_Collection::instance()->return_model_from_id( $module_id );

			if ( ! is_wp_error( $module ) ) {
				$this->module = $module;
			}
		}
	}

	public function register_admin_menu() {

		parent::register_admin_menu();

		add_submenu_page( 'hustle', $this->page_edit_title, $this->page_edit_title, $this->page_edit_capability, $this->page_edit,  array( $this, 'render_edit_page' ) );
	}

	/**
	 * Get the arguments used when rendering the main page.
	 *
	 * @since 4.0.1
	 * @return array
	 */
	protected function get_page_template_args() {

		$entries_per_page = Hustle_Settings_Admin::get_per_page( 'module' );

		$capability = array(
			'hustle_create' => current_user_can( 'hustle_create' ),
			'hustle_access_emails' => current_user_can( 'hustle_access_emails' ),
		);

		$paged = ! empty( $_GET['paged'] ) ? (int) $_GET['paged'] : 1; //don't use filter_input() here, because of see Hustle_Module_Admin::maybe_remove_paged function

		$modules = Hustle_Module_Collection::instance()->get_all( null, array(
				'module_type' => $this->module_type,
				'page' => $paged,
			), $entries_per_page );

		$total_modules = Hustle_Module_Collection::instance()->get_all( null, array(
				'module_type' => $this->module_type,
				'count_only' => true
			) );

		$active_modules = Hustle_Module_Collection::instance()->get_all( true, array(
				'module_type' => $this->module_type,
				'count_only' => true
			) );

		return array(
			'total' => $total_modules,
			'active' => $active_modules,
			'modules' => $modules,
			'is_free' => Opt_In_Utils::_is_free(),
			'capability'  => $capability,
			'page' => $this->page,
			'paged' => $paged,
			'entries_per_page' => $entries_per_page,
			'message' => filter_input( INPUT_GET, 'message', FILTER_SANITIZE_STRING ),
			'sui' => Opt_In::get_sui_summary_config( 'sui-summary-sm' ),
		);
	}

	/**
	 * Hide module's edit pages from the submenu on dashboard.
	 * @since 4.0.1
	 */
	public function hide_unwanted_submenus() {
		remove_submenu_page( 'hustle', $this->page_edit );
	}

	/**
	 * Highlight submenu's parent on admin page.
	 *
	 * @since 4.0.1
	 *
	 * @param $submenu_file
	 * @param $parent_file
	 *
	 * @return string
	 */
	public function admin_submenu_file( $submenu_file, $parent_file ) {
		global $plugin_page;

		if ( 'hustle' !== $parent_file ) {
			return $submenu_file;
		}

		if ( $this->page_edit === $plugin_page ) {
			$submenu_file = $this->page;
		}

		return $submenu_file;
	}

	/**
	 * Check whether the requested module exists.
	 * Redirect to the listing page if not.
	 *
	 * @since 4.0.0
	 */
	public function on_admin_init() {

		if ( $this->page_edit === $this->current_page && ! $this->module ) {
			$url = add_query_arg( array(
				'page' => $this->page,
				'message' => 'module-does-not-exists',
			), 'admin.php' );

			wp_safe_redirect( $url );
			exit;
		}

		$this->export();
	}

	/**
	 * Export single module
	 *
	 * @since 4.0.0
	 */
	private function export() {

		$nonce = filter_input( INPUT_POST, '_wpnonce', FILTER_SANITIZE_STRING );
		if ( ! wp_verify_nonce( $nonce, 'hustle_module_export' ) ) {
			return;
		}
		$id = filter_input( INPUT_POST, 'id', FILTER_VALIDATE_INT );
		if ( ! $id ) {
			return;
		}
		/**
		 * plugin data
		 */
		$plugin = get_plugin_data( WP_PLUGIN_DIR.'/'.Opt_In::$plugin_base_file );
		/**
		 * get module
		 */
		$module = Hustle_Module_Model::instance()->get( $id );
		if ( is_wp_error( $module ) ) {
			return;
		}
		/**
		 * Export data
		 */
		$settings = array(
			'plugin' => array(
				'name' => $plugin['Name'],
				'version' => Opt_In::VERSION,
				'network' => $plugin['Network'],
			),
			'timestamp' => time(),
			'attributes' => $module->get_attributes(),
			'data' => $module->get_data(),
			'meta' => array(),
		);

		if ( 'optin' === $module->module_mode ) {
			$integrations = array();
			$providers = Hustle_Providers::get_instance()->get_providers();
			foreach ( $providers as $slug => $provider ) {
				$provider_data = $module->get_provider_settings( $slug, false );
				if ( $provider_data && $provider->is_connected()
						&& $provider->is_form_connected( $id ) ) {
					$integrations[ $slug ] = $provider_data;
				}
			}

			$settings['meta']['integrations'] = $integrations;
		}

		$meta_names = $module->get_module_meta_names();
		foreach ( $meta_names as $meta_key ) {
			$settings['meta'][ $meta_key ] = json_decode( $module->get_meta( $meta_key ) );
		}
		/**
		 * Filename
		 */
		$filename = sprintf(
			'hustle-%s-%s-%s-%s.json',
			$module->module_type,
			date( 'Ymd-his' ),
			get_bloginfo( 'name' ),
			$module->module_name
		);
		$filename = strtolower( $filename );
		$filename = sanitize_file_name( $filename );
		/**
		 * Print HTTP headers
		 */
		header( 'Content-Description: File Transfer' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Content-Type: application/bin; charset=' . get_option( 'blog_charset' ), true );
		/**
		 * Check PHP version, for PHP < 3 do not add options
		 */
		$version = phpversion();
		$compare = version_compare( $version, '5.3', '<' );
		if ( $compare ) {
			echo wp_json_encode( $settings );
			exit;
		}
		$option = defined( 'JSON_PRETTY_PRINT' )? JSON_PRETTY_PRINT : null;
		echo wp_json_encode( $settings, $option );
		exit;
	}

	/**
	 * Add data to the current json array.
	 *
	 * @since 4.0.1
	 *
	 * @param array $current_array Currently registered data.
	 * @return array
	 */
	public function register_current_json( $current_array ) {

		// Wizard page only.
		if ( $this->module ) {

			$data         = $this->module->get_data();
			$module_metas = $this->module->get_module_metas_as_array();

			$current_array = $this->register_visibility_conditions_js_vars( $current_array );
			$current_array = $this->register_fields_js_vars( $current_array );

			$current_array['current'] = array_merge( $module_metas, array(
				'listing_page' => $this->page,
				'wizard_page'  => $this->page_edit,
				'section'      => Hustle_Module_Admin::get_current_section(),
				'data'         => $data,
				'shortcode_id' => $this->module->get_shortcode_id(),
			) );

			$current_array['messages']['settings'] = array(
				'popup'           => __( 'popup', 'wordpress-popup' ),
				'slide_in'        => __( 'slide in', 'wordpress-popup' ),
				'after_content'   => __( 'after content', 'wordpress-popup' ),
				'floating_social' => __( 'floating social', 'wordpress-popup' ),
			);

			// Listing page only.
		} elseif ( $this->page === $this->current_page ) { 

			$current_array['current'] = array(
				'wizard_page' => $this->page_edit,
				'module_type' => $this->module_type,
			);
		}

		// Both Wizard and Listing pages.
		$current_array['messages']['days_and_months'] = [
			'days_full'    => Opt_In_Utils::get_week_days(),
			'days_short'   => Opt_In_Utils::get_week_days( 'short' ),
			'days_min'     => Opt_In_Utils::get_week_days( 'min' ),
			'months_full'  => Opt_In_Utils::get_months(),
			'months_short' => Opt_In_Utils::get_months( 'short' ),
		];

		return $current_array;
	}

	/**
	 * Include the visibility conditions variables required in js side.
	 * These used to be registered in Hustle_Module_Admin before 4.0.3.
	 *
	 * @since 4.0.3
	 *
	 * @param array $vars
	 * @return array
	 */
	protected function register_visibility_conditions_js_vars( $vars ) {

		$post_ids = array();
		$page_ids = array();
		$tag_ids = array();
		$cat_ids = array();
		$tags = array();
		$cats = array();

		$module = Hustle_Module_Model::instance()->get( filter_input( INPUT_GET, 'id', FILTER_VALIDATE_INT ) );
		if ( ! is_wp_error( $module ) ) {
			$settings = $module->get_visibility()->to_array();

			$post_ids = $this->get_conditions_ids( $settings, 'posts' );
			$page_ids = $this->get_conditions_ids( $settings, 'pages' );
			$tag_ids = $this->get_conditions_ids( $settings, 'tags' );
			$cat_ids = $this->get_conditions_ids( $settings, 'categories' );
		}


		if ( $tag_ids ) {
			$tags = array_map( array( $this, 'terms_to_select2_data' ), get_categories( array(
				'hide_empty' => false,
				'include' => $tag_ids,
				'taxonomy' => 'post_tag',
			)));
		}

		if ( $cat_ids ) {
			$cats = array_map( array( $this, 'terms_to_select2_data' ), get_categories( array(
				'include' => $cat_ids,
				'hide_empty' => false,
			)));
		}

		$posts = $this->get_select2_data( 'post', $post_ids );

		/**
		 * Add all posts
		 */
		$all_posts = new stdClass();
		$all_posts->id = 'all';
		$all_posts->text = __( 'All Posts' );
		array_unshift( $posts, $all_posts );

		$pages = $this->get_select2_data( 'page', $page_ids );

		/**
		 * Add all pages
		 */
		$all_pages = new stdClass();
		$all_pages->id = 'all';
		$all_pages->text = __( 'All Pages' );
		array_unshift( $pages, $all_pages );

		/**
		 * Add all custom post types
		 */
		$post_types = array();
		$cpts = get_post_types( array(
			'public'   => true,
			'_builtin' => false,
		), 'objects' );
		foreach ( $cpts as $cpt ) {

			// skip ms_invoice
			if ( 'ms_invoice' === $cpt->name ) {
				continue;
			}

			$cpt_ids = $this->get_conditions_ids( $settings, $cpt->label );

			$cpt_array['name'] = $cpt->name;
			$cpt_array['label'] = $cpt->label;
			$cpt_array['data'] = $this->get_select2_data( $cpt->name, $cpt_ids );

			// all posts under this custom post type
			$all_cpt_posts = new stdClass();
			$all_cpt_posts->id = 'all';
			$all_cpt_posts->text = ! empty( $cpt->labels ) && ! empty( $cpt->labels->all_items )
				? $cpt->labels->all_items : __( 'All Items', 'wordpress-popup' );
			array_unshift( $cpt_array['data'], $all_cpt_posts );

			$post_types[ $cpt->name ] = $cpt_array;
		}

		$vars['cats'] = $cats;
		$vars['tags'] = $tags;
		$vars['posts'] = $posts;
		$vars['post_types'] = Opt_In_Utils::get_post_types();
		$vars['pages'] = $pages;

		$vars['countries'] = $this->_hustle->get_countries();
		$vars['roles'] = Opt_In_Utils::get_user_roles();
		$vars['templates'] = Opt_In_Utils::hustle_get_page_templates();

		//module error message
		$vars['messages']['sshare_module_error'] = __( "Couldn't save your module settings because there were some errors on {page} tab(s). Please fix those errors and try again.", 'wordpress-popup' );

		$vars['messages']['days_and_months'] = [
			'days_full'    => Opt_In_Utils::get_week_days(),
			'days_short'   => Opt_In_Utils::get_week_days( 'short' ),
			'days_min'     => Opt_In_Utils::get_week_days( 'min' ),
			'months_full'  => Opt_In_Utils::get_months(),
			'months_short' => Opt_In_Utils::get_months( 'short' ),
		];

		// Visibility conditions titles, labels and bodies.
		$vars['messages']['conditions'] = array(
			'visitor_logged_in'           => __( "Visitor's logged in status", 'wordpress-popup' ),
			'shown_less_than'             => __( 'Number of times visitor has seen', 'wordpress-popup' ),
			'only_on_mobile'              => __( "Visitor's Device", 'wordpress-popup' ),
			'from_specific_ref'           => __( 'Referrer', 'wordpress-popup' ),
			'from_search_engine'          => __( 'Source of Arrival', 'wordpress-popup' ),
			'on_specific_url'             => __( 'Specific URL', 'wordpress-popup' ),
			'visitor_has_never_commented' => __( 'Visitor Commented Before', 'wordpress-popup' ),
			'not_in_a_country'            => __( "Visitor's Country", 'wordpress-popup' ),
			'on_specific_roles'           => __( "Specific Roles", 'wordpress-popup' ),
			'on_specific_templates'       => __( "Specific Templates", 'wordpress-popup' ),
			'user_registration'				=> __( 'After registration', 'wordpress-popup' ),
			'page_404'						=> __( '404 page', 'wordpress-popup' ),
			'posts' => __( 'Posts', 'wordpress-popup' ),
			'pages' => __( 'Pages', 'wordpress-popup' ),
			'categories' => __( 'Categories', 'wordpress-popup' ),
			'tags' => __( 'Tags', 'wordpress-popup' ),
		);

		$vars['messages']['condition_labels'] = array(
			'mobile_only' => __( 'Mobile only', 'wordpress-popup' ),
			'desktop_only' => __( 'Desktop only', 'wordpress-popup' ),
			'any_conditions' => __( 'Any with {number} conditions', 'wordpress-popup' ),
			'number_views' => '< {number}',
			'any' => __( 'Any', 'wordpress-popup' ),
			'all' => __( 'All', 'wordpress-popup' ),
			'no' => __( 'No', 'wordpress-popup' ),
			'none' => __( 'None', 'wordpress-popup' ),
			'true' => __( 'True', 'wordpress-popup' ),
			'false' => __( 'False', 'wordpress-popup' ),
			'logged_in' => __( 'Logged in', 'wordpress-popup' ),
			'logged_out' => __( 'Logged out', 'wordpress-popup' ),
			'only_these' => __( 'Only {number}', 'wordpress-popup' ),
			'except_these' => __( 'Any except {number}', 'wordpress-popup' ),
			'user_registration' => __( 'Show after registration', 'wordpress-popup' ),
			'from_reg_date' => __( 'From day {number} ', 'wordpress-popup' ),
			'to_reg_date' => __( ' - To day {number} ', 'wordpress-popup' ),
			'after_registration' => __( 'Immediately', 'wordpress-popup' ),
		);

		return $vars;
	}

	/**
	 * Include the form fields variables required in js side.
	 * These used to be registered in Hustle_Module_Admin before 4.0.3.
	 *
	 * @since 4.0.3
	 *
	 * @param array $vars
	 * @return array
	 */
	protected function register_fields_js_vars( $vars ) {

		$vars['messages']['form_fields'] = array(
			'errors' => array(
				'no_fileds_info' => '<div class="sui-notice"><p>' . __( 'You don\'t have any {field_type} field in your opt-in form.', 'wordpress-popup' ) . '</p></div>',
				'custom_field_not_supported' => __( 'Custom fields are not supported by the active provider', 'wordpress-popup' ),
			),
			'label' => array(
				'placeholder'            => __( 'Enter placeholder here', 'wordpress-popup' ),
				'name_label'             => __( 'Name', 'wordpress-popup' ),
				'name_placeholder'       => __( 'E.g. John', 'wordpress-popup' ),
				'email_label'            => __( 'Email Address', 'wordpress-popup' ),
				'enail_placeholder'      => __( 'E.g. john@doe.com', 'wordpress-popup' ),
				'phone_label'            => __( 'Phone Number', 'wordpress-popup' ),
				'phone_placeholder'      => __( 'E.g. +1 300 400 500', 'wordpress-popup' ),
				'address_label'          => __( 'Address', 'wordpress-popup' ),
				'address_placeholder'    => '',
				'hidden_label'           => __( 'Hidden Field', 'wordpress-popup' ),
				'hidden_placeholder'     => '',
				'url_label'              => __( 'Website', 'wordpress-popup' ),
				'url_placeholder'        => __( 'E.g. https://example.com', 'wordpress-popup' ),
				'text_label'             => __( 'Text', 'wordpress-popup' ),
				'text_placeholder'       => __( 'E.g. Enter your nick name', 'wordpress-popup' ),
				'number_label'           => __( 'Number', 'wordpress-popup' ),
				'number_placeholder'     => __( 'E.g. 1', 'wordpress-popup' ),
				'datepicker_label'       => __( 'Date', 'wordpress-popup' ),
				'datepicker_placeholder' => __( 'Choose date', 'wordpress-popup' ),
				'timepicker_label'       => __( 'Time', 'wordpress-popup' ),
				'timepicker_placeholder' => '',
				'recaptcha_label'        => 'reCAPTCHA',
				'recaptcha_placeholder'  => '',
				'gdpr_label'             => __( 'GDPR', 'wordpress-popup' ),
			),
			'recaptcha_badge_replacement' => sprintf(
				/* translators: 1: closing 'a' tag, 2: opening privacy 'a' tag, 3: opening terms 'a' tag */
				esc_html__( 'This site is protected by reCAPTCHA and the Google %2$sPrivacy Policy%1$s and %3$sTerms of Service%1$s apply.', 'wordpress-popup' ),
				'</a>',
				'<a href="https://policies.google.com/privacy" target="_blank">',
				'<a href="https://policies.google.com/terms" target="_blank">'
			),
			'recaptcha_error_message'     => esc_html__( 'reCAPTCHA verification failed. Please try again.', 'wordpress-popup' ),
			'gdpr_message'                => sprintf( __( 'I\'ve read and accept the %1$sterms & conditions%2$s', 'wordpress-popup' ), '<a href="#">', '</a>' ),
		);

		return $vars;
	}

	/**
	 *
	 * @since 3.0.7
	 * @since 4.0.3 moved from Hustle_Modules_Admin to here.
	 *
	 * @param array $settings Display settings
	 * @param string $type posts|pages|tags|categories|{cpt}
	 * @return array
	 */
	private function get_conditions_ids( $settings, $type ) {
		$ids = array();
		if ( ! empty( $settings['conditions'] ) ) {
			foreach ( $settings['conditions'] as $conditions ) {
				if ( ! empty( $conditions[ $type ] )
					&& ( ! empty( $conditions[ $type ][ $type ] )
					|| ! empty( $conditions[ $type ]['selected_cpts'] ) ) ) {
					$new_ids = ! empty( $conditions[ $type ][ $type ] )
					? $conditions[ $type ][ $type ]
					: $conditions[ $type ]['selected_cpts'];

					$ids = array_merge( $ids, $new_ids );
				}
			}
		}

		return array_unique( $ids );
	}

	/**
	 * Converts term object to usable object for select2
	 * @since 4.0.3 moved from Hustle_Modules_Admin to here.
	 * @param $term Term
	 * @return stdClass
	 */
	public static function terms_to_select2_data( $term ) {
		$obj = new stdClass();
		$obj->id = $term->term_id;
		$obj->text = $term->name;
		return $obj;
	}

	/**
	 * Get usable objects for select2
	 *
	 * @since 4.0.3 moved from Hustle_Modules_Admin to here.
	 * @param string $post_type post type
	 * @param array $include_ids IDs
	 * @return array
	 */
	private function get_select2_data( $post_type, $include_ids = null ) {
		if ( empty( $include_ids ) ) {
			$data = array();
		} else {
			$data = [];
			$posts = get_posts( [
				'numberposts' => -1,
				'post_type' => $post_type,
				'include' => $include_ids,
				'post_status' => 'publish',
				'order' => 'ASC',
			] );

			foreach ( $posts as $post ) {
				$data[] = (object)[
					'id' => $post->ID,
					'text' => $post->post_title,
				];
			}
		}

		return $data;
	}

	/**
	 * Render the module's wizard page.
	 * @since 4.0.1
	 */
	public function render_edit_page() {

		if ( Hustle_Module_Model::SOCIAL_SHARING_MODULE !== $this->module_type ) {
			wp_enqueue_editor();
		}

		$template_args = $this->get_page_edit_template_args();
		$this->_hustle->render( $this->page_edit_template_path, $template_args );
	}

	/**
	 * Get the args for the wizard page.
	 *
	 * @since 4.0.1
	 * @return array
	 */
	protected function get_page_edit_template_args() {

		$current_section = Hustle_Module_Admin::get_current_section();

		return array(
			'section' => ( ! $current_section ) ? 'content' : $current_section,
			'module_id' => $this->module->module_id,
			'module' => $this->module,
			'is_active' => (bool) $this->module->active,
			'is_optin' => ( 'optin' === $this->module->module_mode ),
		);
	}
}
