<?php
if ( isset( $smallcaps_singular ) ) {
	$smallcaps_singular = $smallcaps_singular;
} else {
	$smallcaps_singular = esc_html__( 'module', 'wordpress-popup' );
}

$integrations_url = add_query_arg( 'page', Hustle_Module_Admin::INTEGRATIONS_PAGE, 'admin.php' );
?>

<div id="hustle-box-section-integrations" class="sui-box" <?php if ( 'integrations' !== $section ) echo 'style="display: none;"'; ?> data-tab="integrations">

	<div class="sui-box-header">

		<h2 class="sui-box-title"><?php esc_html_e( 'Integrations', 'wordpress-popup' ); ?></h2>

	</div>

	<div class="sui-box-body">

		<div class="sui-box-settings-row">

			<div class="sui-box-settings-col-1">

				<span class="sui-settings-label"><?php esc_html_e( 'Applications', 'wordpress-popup' ); ?></span>

				<span class="sui-description"><?php printf( esc_html__( 'Send this %1$s’s data to a third party applications. Connect to more 3rd party applications via the %2$sIntegrations%3$s page.', 'wordpress-popup' ), esc_html( $smallcaps_singular ), '<a href="' . esc_url( $integrations_url ) . '">', '</a>' ); ?></span>

			</div>

			<div class="sui-box-settings-col-2">

				<div class="sui-form-field">

					<label class="sui-label"><?php esc_html_e( 'Active apps', 'wordpress-popup' ); ?></label>

					<div id="hustle-connected-providers-section">

						<div class="hustle-integrations-display"></div>

					</div>

				</div>

				<div class="sui-form-field">

					<label class="sui-label"><?php esc_html_e( 'Connected apps', 'wordpress-popup' ); ?></label>

					<div id="hustle-not-connected-providers-section">

						<div class="hustle-integrations-display"></div>

					</div>

				</div>

			</div>

		</div>

		<div class="sui-box-settings-row">

			<div class="sui-box-settings-col-1">

				<span class="sui-settings-label"><?php esc_html_e( 'Integrations Behavior', 'wordpress-popup' ); ?></span>

				<span class="sui-description"><?php esc_html_e( 'Have more control over the integrations behavior of your active apps as per your liking.', 'wordpress-popup' ); ?></span>

			</div>

			<div class="sui-box-settings-col-2">

				<label for="hustle-integrations-allow-subscribed-users" class="sui-settings-label"><?php esc_html_e( 'Allow already subscribed user to submit the form', 'wordpress-popup' ); ?></label>

				<span class="sui-description"><?php esc_html_e( 'Choose whether you want to submit the form and subscribe the user to the rest of the active apps when the user is already subscribed to one of the active apps or want the form submission to fail.', 'wordpress-popup' ); ?></span>

				<?php $allowed = '1' === $settings['allow_subscribed_users']; ?>

				<div class="sui-side-tabs" style="margin-top: 10px; margin-bottom: 0;">

					<div class="sui-tabs-menu">

						<label class="sui-tab-item<?php echo $allowed ? ' active' : ''; ?>">
							<input type="radio" name="allow_subscribed_users" value="1" data-attribute="allow_subscribed_users"<?php checked( $allowed ); ?>>
							<?php esc_html_e( 'Allow Submission', 'wordpress-popup' ); ?></label>

						<label class="sui-tab-item<?php echo $allowed ? '' : ' active'; ?>">
							<input type="radio" name="allow_subscribed_users" value="0" data-attribute="allow_subscribed_users"<?php checked( !$allowed ); ?> data-tab-menu="allow_submit">
							<?php esc_html_e( 'Disallow Submission', 'wordpress-popup' ); ?></label>

					</div>

					<div class="sui-tabs-content">

						<div class="sui-tab-boxed<?php echo !$allowed ? ' active' : ''; ?>" data-tab-content="allow_submit">

							<div class="sui-form-field">

								<label class="sui-label"><?php esc_html_e( 'Error Message', 'wordpress-popup' ); ?></label>

								<input type="text"
									name="disallow_submission_message"
									data-attribute="disallow_submission_message"
									value="<?php echo esc_attr( $settings['disallow_submission_message'] ); ?>"
									class="sui-form-control" />

							</div>

						</div>

					</div>

				</div>




				<input
					type="hidden"
					id="hustle-integrations-active-integrations"
					data-attribute="active_integrations"
					name="active_integrations"
					value="<?php echo esc_html( $settings['active_integrations'] ); ?>"
				/>
				<input
					type="hidden"
					id="hustle-integrations-active-count"
					data-attribute="active_integrations_count"
					name="active_integrations_count"
					value="<?php echo esc_html( $settings['active_integrations_count'] ); ?>"
				/>
			</div>

		</div>

	</div>

	<div class="sui-box-footer">

		<button class="sui-button wpmudev-button-navigation"
			data-direction="prev">
			<i class="sui-icon-arrow-left" aria-hidden="true"></i> <?php esc_html_e( 'Emails', 'wordpress-popup' ); ?>
		</button>

		<div class="sui-actions-right">
			<button class="sui-button sui-button-icon-right wpmudev-button-navigation"
				data-direction="next">
				<?php esc_html_e( 'Appearance', 'wordpress-popup' ); ?> <i class="sui-icon-arrow-right" aria-hidden="true"></i>
			</button>
		</div>

	</div>

</div>
