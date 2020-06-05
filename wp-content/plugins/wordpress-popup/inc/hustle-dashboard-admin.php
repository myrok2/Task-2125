<?php

/**
 * Hustle_Dashboard_Admin.
 */
class Hustle_Dashboard_Admin extends Hustle_Admin_Page_Abstract {

	const WELCOME_MODAL_NAME = 'welcome_modal';
	const MIGRATE_MODAL_NAME = 'migrate_modal';
	const MIGRATE_NOTICE_NAME = 'migrate_notice';

	protected function init() {

		$this->page = 'hustle';

		$this->page_title = __( 'Dashboard', 'wordpress-popup' );

		$this->page_menu_title = $this->page_title;

		$this->page_capability = 'hustle_menu';

		$this->page_template_path = 'admin/dashboard';

	}

	/**
	 * Register Hustle's parent menu.
	 * Call the parent method to add the submenu page for Dashboard.
	 *
	 * @since 4.0.1
	 */
	public function register_admin_menu() {

		$parent_menu_title = Opt_In_Utils::_is_free() ? __( 'Hustle', 'wordpress-popup' ) : __( 'Hustle Pro', 'wordpress-popup' );

		// Parent menu
		add_menu_page( $parent_menu_title , $parent_menu_title , $this->page_capability, 'hustle', array( $this, 'render_main_page' ), Opt_In::$plugin_url . 'assets/images/icon.svg' );

		parent::register_admin_menu();
	}

	/**
	 * Actions to be performed on Dashboard page.
	 *
	 * @since 4.0.4
	 *
	 * @return void
	 */
	protected function on_current_page_actions() {

		// For preview.
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_recaptcha_script' ] );
		add_action( 'admin_footer', array( $this, 'maybe_print_forminator_scripts' ) );
	}

	/**
	 * Get $active variable for get_all method
	 *
	 * @param array $settings General settings
	 * @param string $type Module type
	 * @return boolean|null
	 */
	private function is_getting_active( $settings, $type ) {
		$return = null;

		if ( $settings['published_' . $type . '_on_dashboard'] && ! $settings['draft_' . $type . '_on_dashboard'] ) {
			$return = true;
		} elseif ( !$settings['published_' . $type . '_on_dashboard'] && $settings['draft_' . $type . '_on_dashboard'] ) {
			$return = false;
		}

		return $return;
	}

	/**
	 * Get limit from general settings
	 *
	 * @param array $settings General settings
	 * @param string $type Module type
	 * @return string
	 */
	private static function get_limit( $settings, $type ) {
		$limit =  $settings[ $type . '_on_dashboard'];
		if ( $limit < 1 ) {
			$limit = 1;
		}
		return $limit;
	}


	/**
	 * Get the arguments used when rendering the main page.
	 *
	 * @since 4.0.1
	 * @return array
	 */
	public function get_page_template_args() {

		$collection_instance = Hustle_Module_Collection::instance();

		$general_settings = Hustle_Settings_Admin::get_general_settings();
		$modules = [
			'popup'    => [],
			'slidein'  => [],
			'embedded' => [],
		];
		foreach ( $modules as $type => $instances ) {
			$active = self::is_getting_active( $general_settings, $type );
			$limit  = self::get_limit( $general_settings, $type );

			$modules[ $type ] = $collection_instance->get_all( $active, array( 'module_type' => $type ), $limit );
		}

		$active_modules = $collection_instance->get_all( true, array(
			'count_only' => true,
		));

		$last_conversion = Hustle_Tracking_Model::get_instance()->get_latest_conversion_date( 'all' );

		return array(
			'metrics' => $this->get_3_top_metrics(),
			'active_modules' => $active_modules,
			'popups' => $modules['popup'],
			'slideins' => $modules['slidein'],
			'embeds' => $modules['embedded'],
			'last_conversion' => $last_conversion ? date_i18n( 'j M Y @ H:i A', strtotime( $last_conversion ) ) : __( 'Never', 'wordpress-popup' ),
			'sshare_per_page_data' => $this->get_sshare_per_page_conversions( self::get_limit( $general_settings, 'shares_per_page' ) ),
			'need_migrate' => Hustle_Migration::check_tracking_needs_migration(),
			'sui' => Opt_In::get_sui_summary_config(),
		);
	}

	/**
	 * Get the data for listing the ssharing modules conversions per page.
	 *
	 * @since 4.0.0
	 * @param int $limit
	 * @return array
	 */
	private function get_sshare_per_page_conversions( $limit ) {

		$tracking_model = Hustle_Tracking_Model::get_instance();
		$tracking_data = $tracking_model->get_ssharing_per_page_conversion_count( $limit );

		$data_array = array();
		foreach ( $tracking_data as $data ) {

			if ( '0' !== $data->page_id ) {
				$title = get_the_title( $data->page_id );
				$url = get_permalink( $data->page_id );
			} else {
				$title = get_bloginfo( 'name', 'display' );
				$url = get_home_url();
			}

			if ( empty( $url ) ) {
				continue;
			}
			$data_array[] = array(
				'title' => $title,
				'url' => $url,
				'count' => $data->tracked_count,
			);
		}

		return $data_array;
	}

	/**
	 * Get 3 Top Metrics
	 *
	 * @since 4.0.0
	 *
	 * @return array $data Array of 4 top metrics.
	 */
	private function get_3_top_metrics() {
		global $hustle;
		$names = array(
			'average_conversion_rate' => __( 'Average Conversion Rate', 'wordpress-popup' ),
			'total_conversions' => __( 'Total Conversions', 'wordpress-popup' ),
			'most_conversions' => __( 'Most Conversions', 'wordpress-popup' ),
			'today_conversions' => __( 'Today\'s Conversion', 'wordpress-popup' ),
			'last_week_conversions' => __( 'Last 7 Day\'s Conversion', 'wordpress-popup' ),
			'last_month_conversions' => __( 'Last 1 Month\'s Conversion', 'wordpress-popup' ),
			'inactive_modules_count' => __( 'Inactive Modules', 'wordpress-popup' ),
			'total_modules_count' => __( 'Total Modules', 'wordpress-popup' ),
		);
		$keys = array_keys( $names );
		$metrics = Hustle_Settings_Admin::get_top_metrics_settings();
		$metrics = array_values( array_intersect( $keys, $metrics ) );

		while ( 3 > count( $metrics ) ) {
			$key = array_shift( $keys );
			if ( ! in_array( $key, $metrics, true ) ) {
				$metrics[] = $key;
			}
		}
		$data = array();
		$tracking = Hustle_Tracking_Model::get_instance();
		$module_instance = Hustle_Module_Collection::instance();
		foreach ( $metrics as $key ) {

			switch ( $key ) {
				case 'average_conversion_rate':
					$value = $tracking->get_average_conversion_rate();
				break;
				case 'total_conversions':
					$value = $tracking->get_total_conversions();
				break;
				case 'most_conversions':
					$module_id = $tracking->get_most_conversions_module_id();
					if ( ! $module_id ) {
						$value = __( 'None', 'wordpress-popup' );
						break;
					}
					$module = Hustle_Module_Model::instance()->get( $module_id );
					if ( ! is_wp_error( $module ) ) {
						$value = $module->module_name;
						$url = add_query_arg( 'page', $module->get_wizard_page() );
						if ( ! empty( $url ) ) {
							$url = add_query_arg( 'id', $module->module_id, $url );
							$value = sprintf(
								'<a href="%s">%s</a>',
								esc_url( $url ),
								esc_html( $value )
							);
						}
					}
				break;
				case 'today_conversions':
					$value = $tracking->get_today_conversions();
				break;
				case 'last_week_conversions':
					$value = $tracking->get_last_week_conversions();
				break;
				case 'last_month_conversions':
					$value = $tracking->get_last_month_conversions();
				break;
				case 'inactive_modules_count':
					$value = $module_instance->get_all( false, array( 'count_only' => true ) );
				break;
				case 'total_modules_count':
					$value = $module_instance->get_all( 'any', array( 'count_only' => true ) );
				break;
				default:
					$value = __( 'Unknown', 'wordpress-popup' );
			}
			if ( 0 === $value ) {
				$value = __( 'None', 'wordpress-popup' );
			}
			$data[ $key ] = array(
				'label' => $names[ $key ],
				'value' => $value,
			);
		}
		return $data;
	}
}
