<?php
$reset_settings_uninstall = '1' === $settings['reset_settings_uninstall']; ?>
<div class="sui-box-settings-row">

	<div class="sui-box-settings-col-1">
		<span class="sui-settings-label"><?php esc_html_e( 'Uninstallation', 'wordpress-popup' ); ?></span>
		<span class="sui-description"><?php esc_html_e( 'When you uninstall this plugin, what do you want to do with your plugin’s settings and data?', 'wordpress-popup' ); ?></span>
	</div>

	<div class="sui-box-settings-col-2">

		<div class="sui-form-field">

			<div class="sui-side-tabs" style="margin-top: 10px;">

				<div class="sui-tabs-menu">

					<label
						for="hustle-uninstall-settings--preserve"
						class="sui-tab-item <?php echo ! $reset_settings_uninstall ? ' active':''; ?>"
					>
						<input
							type="radio"
							name="reset_settings_uninstall"
							value="0"
							id="hustle-uninstall-settings--preserve"
							<?php checked( $reset_settings_uninstall, false ); ?>
						/>
						<?php esc_html_e( 'Preserve', 'wordpress-popup' ); ?>
					</label>


					<label
						for="hustle-uninstall-settings--reset"
						class="sui-tab-item <?php echo $reset_settings_uninstall ? ' active':''; ?>"
					>
						<input
							type="radio"
							name="reset_settings_uninstall"
							value="1"
							id="hustle-uninstall-settings--reset"
							data-tab-menu="data-reset-notice"
							<?php checked( $reset_settings_uninstall, true ); ?>
						/>
						<?php esc_html_e( 'Reset', 'wordpress-popup' ); ?>
					</label>

				</div>

				<div class="sui-tabs-content">

					<div class="<?php echo $reset_settings_uninstall ? ' active' : ''; ?>" data-tab-content="data-reset-notice">

						<?php
						$this->render(
							'admin/elements/notice-inline',
							[
								'content' => array(
									esc_html__( 'This will delete all the modules and their data - submissions, conversion data, and plugin settings when the plugin is uninstalled.', 'wordpress-popup' )
								),
							]
						);
						?>

					</div>

				</div>

			</div>

		</div>

	</div>

</div>
