<div id="general-box" class="sui-box" data-tab="general" <?php if ( 'general' !== $section ) echo 'style="display: none;"'; ?>>

	<div class="sui-box-header">
		<h2 class="sui-box-title"><?php esc_html_e( 'General', 'wordpress-popup' ); ?></h2>
	</div>

	<div class="sui-box-body">

		<?php
		// SETTINGS: IP Tracking.
		$this->render(
			'admin/settings/general/dashboard',
			array( 'settings' => $settings )
		); ?>

		<?php
		// SETTINGS: From Headers.
		$this->render(
			'admin/settings/general/from-headers',
			array( 'settings' => $settings )
		); ?>

		<?php
		// SETTINGS: Pagination.
		$this->render(
			'admin/settings/general/pagination',
			array( 'settings' => $settings )
		); ?>

		<?php
		// SETTINGS: Debug Mode.
		$this->render(
			'admin/settings/general/debug-mode',
			array( 'settings' => $settings )
		); ?>

	</div>

	<div class="sui-box-footer">

		<div class="sui-actions-right">

			<button class="sui-button sui-button-blue hustle-settings-save" data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle-settings' ) ); ?>">
				<span class="sui-loading-text"><?php esc_html_e( 'Save Settings', 'wordpress-popup' ); ?></span>
				<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
			</button>

		</div>

	</div>

</div>
