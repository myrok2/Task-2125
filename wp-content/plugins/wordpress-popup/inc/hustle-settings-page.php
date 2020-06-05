<?php
/**
 * Class Hustle_Settings_Page
 *
 */
class Hustle_Settings_Page extends Hustle_Admin_Page_Abstract {

	/**
	 * Key of the Hustle's settings in wp_options.
	 * @since 4.0
	 */
	const SETTINGS_OPTION_KEY = 'hustle_settings';

	const DISMISSED_USER_META = 'hustle_dismissed_notifications';

	public function init() {

		$this->page = 'hustle_settings';

		$this->page_title = __( 'Hustle Settings', 'wordpress-popup' );

		$this->page_menu_title = __( 'Settings', 'wordpress-popup' );

		$this->page_capability = 'hustle_edit_settings';

		$this->page_template_path = 'admin/settings';

        /**
         * Add visual settings classes
         */
		add_filter( 'hustle_sui_wrap_class', array( $this, 'sui_wrap_class' ) );
	}

	public function get_page_template_args() {
		$current_user = wp_get_current_user();
		$general_settings = Hustle_Settings_Admin::get_general_settings();
		$modules = Hustle_Module_Collection::instance()->get_all_paginated();
		return array(
			'user_name' => ucfirst( $current_user->display_name ),
			'filter' => $modules['filter'],
			'modules' => $modules['modules'],
			'modules_count' => $modules['count'],
			'modules_page' => $modules['page'],
			'modules_limit' => $modules['limit'],
			'modules_show_pager' => $modules['show_pager'],
			'modules_edit_roles' => $modules['edit_roles'],
			'email_name' => $general_settings['sender_email_name'],
			'email_address' => $general_settings['sender_email_address'],
			'unsubscription_messages' => Hustle_Settings_Admin::get_unsubscribe_messages(),
			'unsubscription_email' => Hustle_Settings_Admin::get_unsubscribe_email_settings(),
			'hustle_settings' => Hustle_Settings_Admin::get_hustle_settings(),
			'section' => Hustle_Module_Admin::get_current_section( 'general' ),
		);
	}

	/**
	 * Add data to the current json array.
	 *
	 * @since 4.0.3
	 *
	 * @param array $current_array
	 * @return void
	 */
	public function register_current_json( $current_array ) {

		if ( $this->page === $_GET['page'] ) { // CSRF: ok.

			$palettes = array();
			$args = array( 'except_types' => array( Hustle_Module_Model::SOCIAL_SHARING_MODULE ) );
			$modules = Hustle_Module_Collection::instance()->get_all( null, $args );

			foreach( $modules as $module ) {
				$palettes[ $module->module_type ][ $module->module_id ] = $module->module_name;
			}
			$current_array['current'] = $palettes;
		}

		return $current_array;
	}

		/**
		 * Handle SUI wrapper container classes.
		 *
		 * @since 4.0.06
		 */
    public function sui_wrap_class( $classes ) {
        if ( is_string( $classes ) ) {
            $classes = array( $classes );
        }
        if ( ! is_array( $classes ) ) {
            $classes = array();
        }
        $classes[] = 'sui-wrap';
        $classes[] = 'sui-wrap-hustle';
        /**
         * Add high contrast mode.
         */
        $accessibility = Hustle_Settings_Admin::get_hustle_settings( 'accessibility' );
        $is_high_contrast_mode = !empty( $accessibility['accessibility_color'] );
        if ( $is_high_contrast_mode ) {
            $classes[] = 'sui-color-accessible';
        }
        /**
         * Set hide branding
         *
         * @since 4.0.0
         */
        $hide_branding = apply_filters( 'wpmudev_branding_hide_branding', false );
        if ( $hide_branding ) {
            $classes[] = 'no-hustle';
        }
        /**
         * hero image
         *
         * @since 4.0.0
         */
        $image = apply_filters( 'wpmudev_branding_hero_image', 'hustle-default' );
        if ( empty( $image ) ) {
            $classes[] = 'no-hustle-hero';
        }
        return $classes;
    }
}
