<?php
$settings = Hustle_Settings_Admin::get_data_settings();
?>
<div id="data-box" class="sui-box hustle-settings-tab-data" data-tab="data" <?php if ( $section && 'data' !== $section ) echo 'style="display: none;"'; ?>>


	<div class="sui-box-header">
		<h2 class="sui-box-title"><?php esc_html_e( 'Data', 'wordpress-popup' ); ?></h2>
	</div>

	<div class="sui-box-body">

		<?php
		// SECTION: Uninstallation
		$this->render(
			'admin/settings/data/uninstallation-settings',
			array( 'settings' => $settings )
		); ?>

		<?php
		// SECTION: Reset
		$this->render( 'admin/settings/data/reset-data-settings' ); ?>

	</div>

	<div class="sui-box-footer">

		<div class="sui-actions-right">

			<button class="sui-button sui-button-blue hustle-settings-save" data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle-settings' ) ); ?>">
				<span class="sui-loading-text"><?php esc_html_e( 'Save Settings', 'wordpress-popup' ); ?></span>
				<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
			</button>


		</div>

	</div>

	<?php
	// DIALOG: Reset plugin
	$this->render( 'admin/settings/data/reset-data-dialog', array() ); ?>

</div>
