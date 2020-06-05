<?php
if ( ! class_exists( 'DVK_Plugin_License_Manager', false ) ) {

	class DVK_Plugin_License_Manager extends DVK_License_Manager {

		/**
		 * Constructor
		 *
		 * @param DVK_Product $product
		 */
		public function __construct( DVK_Product $product ) {

			parent::__construct( $product );

			// Check if plugin is network activated. We should use site(wide) options in that case.
			if( is_admin() && is_multisite() ) {

				if ( ! function_exists( 'is_plugin_active_for_network' ) ) {
					require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
				}

				$this->is_network_activated = is_plugin_active_for_network( $product->plugin_basename );
			}
		}

		/**
		 * Setup auto updater for plugins
		 */
		public function setup_auto_updater() {
			if ( $this->license_is_valid() ) {
				// setup auto updater
				require_once( dirname( __FILE__ ) . '/class-update-manager.php' );
				require_once( dirname( __FILE__ ) . '/class-plugin-update-manager.php' );
				new DVK_Plugin_Update_Manager( $this->product, $this );
			}
		}

		/**
		 * Setup hooks
		 */
		public function specific_hooks() {
			// deactivate the license remotely on plugin deactivation
			register_deactivation_hook( $this->product->slug, array( $this, 'deactivate_license' ) );
		}
	}
}

