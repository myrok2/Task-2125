<div id="privacy-box" class="sui-box" data-tab="privacy" <?php if ( 'privacy' !== $section ) echo 'style="display: none;"'; ?>>

	<div class="sui-box-header">
		<h2 class="sui-box-title"><?php esc_html_e( "Viewer's Privacy", 'wordpress-popup' ); ?></h2>
	</div>

	<form id="hustle-privacy-settings-form" class="sui-box-body">

		<?php
		// SETTINGS: IP Tracking.
		$this->render(
			'admin/settings/privacy/ip-address',
			array( 'settings' => $settings )
		);
		?>

		<?php
		// Retaining submission and ip.
		$this->render(
			'admin/settings/privacy/submissions-privacy',
			array( 'settings' => $settings )
		);
		?>
		<?php
		// Retaining tracking.
		$this->render(
			'admin/settings/privacy/tracking-data',
			array( 'settings' => $settings )
		);
		?>

	</form>

	<div class="sui-box-footer">

		<div class="sui-actions-right">

			<button class="sui-button sui-button-blue hustle-settings-save" data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle-settings' ) ); ?>">
				<span class="sui-loading-text"><?php esc_html_e( 'Save Settings', 'wordpress-popup' ); ?></span>
				<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
			</button>

		</div>

	</div>

</div>
