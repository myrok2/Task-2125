<div class="sui-box-settings-row">

	<div class="sui-box-settings-col-1">
		<span class="sui-settings-label"><?php esc_html_e( 'Reset Plugin', 'wordpress-popup' ); ?></span>
		<span class="sui-description"><?php esc_html_e( 'Needing to start fresh? Use this setting to roll back to the default plugin state.', 'wordpress-popup' ); ?></span>
	</div>

	<div class="sui-box-settings-col-2">

		<button
			id="hustle-dialog-open--reset-data-settings"
			class="sui-button sui-button-ghost"
			data-dialog-title="<?php esc_html_e( 'Reset Plugin', 'wordpress-popup' ); ?>"
			data-dialog-info="<?php esc_html_e( "Are you sure you want to reset the plugin to its default state?", 'wordpress-popup' ); ?>"
		>
			<i class="sui-icon-undo" aria-hidden="true"></i> <?php esc_html_e( 'Reset', 'wordpress-popup' ); ?>
		</button>

		<span class="sui-description" style="margin-top: 10px;"><?php esc_html_e( 'Note: This will delete all the modules you currently have and their data - submissions, conversion data, and revert all settings to their default state.', 'wordpress-popup' ); ?></span>

	</div>

</div>