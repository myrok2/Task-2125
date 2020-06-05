<div id="recaptcha-box" class="sui-box hustle-settings-tab-recaptcha" data-tab="recaptcha"  <?php if ( 'recaptcha' !== $section ) echo 'style="display: none;"'; ?>>

	<div class="sui-box-header">
		<h2 class="sui-box-title"><?php esc_html_e( 'reCAPTCHA', 'wordpress-popup' ); ?></h2>
	</div>

	<div class="sui-box-body">

		<div class="sui-box-settings-row">

			<div class="sui-box-settings-col-1">
				<span class="sui-settings-label"><?php esc_html_e( 'Configure', 'wordpress-popup' ); ?></span>
				<span class="sui-description"><?php esc_html_e( 'You need to enter your API keys here to use reCAPTCHA field in your opt-in forms.', 'wordpress-popup' ); ?></span>
			</div>

			<div class="sui-box-settings-col-2">

				<div id="hustle-recaptcha-script-container"></div>

				<form id="hustle-settings-recaptcha-form">

					<?php
					// SETTINGS: API Keys.
					$this->render(
						'admin/settings/recaptcha/api-keys',
						array( 'settings' => $settings )
					); ?>

					<?php
					// SETTINGS: Language.
					$this->render(
						'admin/settings/recaptcha/language',
						array( 'settings' => $settings )
					); ?>

				</form>

			</div>

		</div>

	</div>

	<div class="sui-box-footer">

		<div class="sui-actions-right">

			<button
				form="hustle-settings-recaptcha-form"
				class="sui-button sui-button-blue hustle-settings-save"
				data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle-settings' ) ); ?>"
			>
				<span class="sui-loading-text"><?php esc_html_e( 'Save Settings', 'wordpress-popup' ); ?></span>
				<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
			</button>

		</div>

	</div>

</div>
