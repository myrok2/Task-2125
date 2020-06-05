<?php
/**
 * Class: WPUAP_Model_Settings
 * @author Flipper Code <hello@flippercode.com>
 * @version 4.0.0
 * @package Avatar
 */

if ( ! class_exists( 'WPUAP_Model_Settings' ) ) {

	/**
	 * Setting model for Plugin Options.
	 * @package Avatar
	 * @author Flipper Code <hello@flippercode.com>
	 */
	class WPUAP_Model_Settings extends FlipperCode_Model_Base {
		/**
		 * Intialize Backup object.
		 */
		function __construct() {
		}
		/**
		 * Admin menu for Settings Operation
		 * @return array Admin menu navigation(s).
		 */
		function navigation() {
			return array(
				'wpuap_view_overview' => __( 'WP User Avatar', WPUAP_TEXT_DOMAIN ),
				'wpuap_manage_settings' => __( 'Settings', WPUAP_TEXT_DOMAIN ),
			);
		}
		/**
		 * Add or Edit Operation.
		 */
		function save() {

			if ( isset( $_REQUEST['_wpnonce'] ) ) {
				$nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ); }

			if ( isset( $nonce ) and ! wp_verify_nonce( $nonce, 'wpgmp-nonce' ) ) {

				die( 'Cheating...' );

			}

			$this->verify( $_POST );

			if ( is_array( $this->errors ) and ! empty( $this->errors ) ) {
				$this->throw_errors();
			}
			
			
			update_option( 'wp_user_avatar_upload_registration',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_upload_registration'] ) ) );
			update_option( 'wp_user_avatar_hide_webcam',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_hide_webcam'] ) ) );
			update_option( 'wp_user_avatar_hide_mediamanager',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_hide_mediamanager'] ) ) );
			update_option( 'avatar_storage_option',sanitize_text_field( wp_unslash( $_POST['avatar_storage_option'] ) ) );
			update_option( 'wp_user_avatar_upload_size_limit',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_upload_size_limit'] ) ) );
			update_option( 'wp_user_avatar_upload_size_width',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_upload_size_width'] ) ) );
			update_option( 'wp_user_avatar_upload_size_height',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_upload_size_height'] ) ) );

			update_option( 'wp_user_avatar_thumbnail_w',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_thumbnail_w'] ) ) );
			update_option( 'wp_user_avatar_thumbnail_h',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_thumbnail_h'] ) ) );
			update_option( 'wp_user_avatar_resize_upload',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_resize_upload'] ) ) );
			update_option( 'show_avatars',sanitize_text_field( wp_unslash( $_POST['show_avatars'] ) ) );
			update_option( 'avatar_default',sanitize_text_field( wp_unslash( $_POST['avatar_default'] ) ) );
			update_option( 'wp_user_avatar_disable_gravatar',sanitize_text_field( wp_unslash( $_POST['wp_user_avatar_disable_gravatar'] ) ) );
			update_option( 'avatar_rating',sanitize_text_field( wp_unslash( $_POST['avatar_rating'] ) ) );
			update_option( 'wp_user_avatar_storage', $_POST['wp_user_avatar_storage'] );
			update_option( 'avatar_default_wp_user_avatar', $_POST['avatar_default_wp_user_avatar'] );
			update_option( 'wp_user_avatar_settings', $_POST['wp_user_avatar_settings'] );
			$response['success'] = __( 'Setting(s) saved successfully.',WPUAP_TEXT_DOMAIN );
			return $response;

		}

		function install(){

		  $defaults = array(
			'wp_user_avatar_hide_webcam' => 0,
			'wp_user_avatar_hide_mediamanager' => 0,
			'avatar_storage_option' => 'media',
			'wp_user_avatar_upload_size_limit' => 8388608,
			'wp_user_avatar_upload_registration' => 1
		  );
		  foreach( $defaults as $key => $value )
		   if( get_option( $key, false ) === false )
		   update_option( $key, $value );

		}
	}
}
