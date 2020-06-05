<?php

include_once dirname( __FILE__ ).'/dropbox/autoload.php';

class Wpua_Dropbox_Storage extends Wpua_Storage {

	private $dropbox;

	private $app_client = 'wp-user-avatar/1.0';

	private $folder_path = '/';

	public function load() {

		$options = $this->get_storage_option();

		if ( empty( $options['access_token'] ) ) {
			return new WP_Error( 'drobbox_token', __( 'Dropbox access token is required.','wp-user-avatar-pro' ) ); }

		$this->dropbox = new Dropbox\Client( $options['access_token'], $this->app_client );
		try {
			$this->dropbox->getAccountInfo();
		} catch ( Exception $e ) {
			return new WP_Error( 'drobpox_api_invalid', $e->getMessage() );
		}

		if ( ! empty( $options['folder_path'] ) ) {
			$this->folder_path .= ltrim( $options['folder_path'], '/' ); }

	}

	public function getUploadPath($filename) {

		return trailingslashit( $this->folder_path ).$filename;

	}

	public function wpua_avatar_upload( $file ) {
		try {
			 $fp = fopen( $file->path, 'rb' );
			 $metadata = $this->dropbox->uploadFile( $this->getUploadPath( $file->name ), Dropbox\WriteMode::add(), $fp );
			 fclose( $fp );
			 $sharable = $this->dropbox->createShareableLink( $this->getUploadPath( $file->name ) );
			if ( $sharable ) {
				remove_query_arg( 'dl',  $sharable );
				$this->avatar_url = add_query_arg( 'dl', '1', $sharable );
				$this->avatar_filename = $file->name;
				$this->resource = trailingslashit( $this->folder_path );
				$this->save();
			}
		} catch ( Exception $e ) {
			return new WP_Error( 'upload_problem', $e->getMessage() );
		}
	}

}
