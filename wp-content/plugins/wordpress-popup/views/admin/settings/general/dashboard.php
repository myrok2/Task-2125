<?php
$types = [
	'popup' => array(
		'lowercase'  => Opt_In_Utils::get_module_type_display_name( 'popup', true ),
		'capitalize' => Opt_In_Utils::get_module_type_display_name( 'popup', true, true ),
		'setting_prefix' => 'popup',
	),
	'slidein' => array(
		'lowercase'  => Opt_In_Utils::get_module_type_display_name( 'slidein', true ),
		'capitalize' => Opt_In_Utils::get_module_type_display_name( 'slidein', true, true ),
		'setting_prefix' => 'slidein',
	),
	'embedded' => array(
		'lowercase'  => Opt_In_Utils::get_module_type_display_name( 'embedded', true ),
		'capitalize' => Opt_In_Utils::get_module_type_display_name( 'embedded', true, true ),
		'setting_prefix' => 'embedded',
	),
	'social_sharing' => array(
		'number_label' => __( 'top converting pages', 'wordpress-popup' ),
		'number_description'  => __( 'top converting pages', 'wordpress-popup' ),
		'capitalize' => Opt_In_Utils::get_module_type_display_name( 'social_sharing', true, true ),
		'setting_prefix' => 'shares_per_page',
	),
];
?>

<div class="sui-box-settings-row">

	<div class="sui-box-settings-col-1">
		<span class="sui-settings-label"><?php esc_html_e( 'Dashboard', 'wordpress-popup' ); ?></span>
		<span class="sui-description"><?php esc_html_e( 'Customize the Hustle dashboard as per your liking.', 'wordpress-popup' ); ?></span>
	</div>

	<div class="sui-box-settings-col-2">

		<label id="" class="sui-settings-label"><?php esc_html_e( 'Modules Listing', 'wordpress-popup' ); ?></label>
		<span id="" class="sui-description"><?php esc_html_e( 'Choose the number of modules and the preferred status you want to see on your Hustle dashboard for each module type.', 'wordpress-popup' ); ?></span>

		<div class="sui-tabs sui-tabs-overflow" style="margin-top: 10px;">

			<div tabindex="-1" class="sui-tabs-navigation" aria-hidden="true">
				<button type="button" class="sui-button-icon sui-tabs-navigation--left">
					<i class="sui-icon-chevron-left"></i>
				</button>
				<button type="button" class="sui-button-icon sui-tabs-navigation--right">
					<i class="sui-icon-chevron-right"></i>
				</button>
			</div>

			<div role="tablist" class="sui-tabs-menu">

				<?php foreach ( $types as $type => $data ) : ?>

					<button
						type="button"
						role="tab"
						id="hustle-<?php echo esc_html( $type ); ?>-modules-tab"
						class="sui-tab-item<?php echo ( 'popup' === $type ) ? ' active' : ''; ?>"
						aria-controls="hustle-<?php echo esc_html( $type ); ?>-modules-content"
						aria-selected="<?php echo ( 'popup' === $type ) ? 'true' : 'false'; ?>"
						<?php echo ( 'popup' === $type ) ? '' : 'tabindex="-1"'; ?>
					>
						<?php echo esc_html( $data['capitalize'] ); ?>
					</button>

				<?php endforeach; ?>

			</div>

			<div class="sui-tabs-content">

				<?php
				foreach ( $types as $type => $data ) :
					$number_label       = empty( $data['number_label'] ) ? $data['capitalize'] : $data['number_label'];
					$number_description = empty( $data['number_description'] ) ? __( 'recent ', 'wordpress-popup' ) . $data['lowercase'] : $data['number_description'];
					?>

					<div
						role="tabpanel"
						tabindex="0"
						id="hustle-<?php echo esc_html( $type ); ?>-modules-content"
						class="sui-tab-content<?php echo ( 'popup' === $type ) ? ' active' : ''; ?>"
						aria-labelledby="hustle-<?php echo esc_html( $type ); ?>-modules-tab"
						<?php echo ( 'popup' === $type ) ? '' : 'hidden'; ?>
					>

						<div class="sui-form-field">

							<label
								for="hustle-<?php echo esc_html( $type ); ?>-number"
								id="hustle-<?php echo esc_html( $type ); ?>-number-label"
								class="sui-settings-label"
							>
								<?php printf( esc_html__( 'Number of %s', 'wordpress-popup' ), esc_html( $number_label ) ); ?>
							</label>

							<span id="hustle-<?php echo esc_html( $type ); ?>-number-description" class="sui-description">
								<?php printf( esc_html__( 'Choose the number of %s to be shown on your dashboard.', 'wordpress-popup' ), esc_html( $number_description ) ); ?>
							</span>

							<input
								type="number"
								min="1"
								value="<?php echo intval( $settings[ $data['setting_prefix'] . '_on_dashboard'] ); ?>"
								name="<?php echo esc_attr( $data['setting_prefix'] . '_on_dashboard' ); ?>"
								id="hustle-<?php echo esc_html( $type ); ?>-number"
								class="sui-form-control sui-input-sm"
								style="max-width: 100px; margin-top: 10px;"
								aria-labelledby="hustle-<?php echo esc_html( $type ); ?>-number-label"
								aria-describedby="hustle-<?php echo esc_html( $type ); ?>-number-description"
							/>

						</div>

						<?php if ( 'social_sharing' !== $type ) { ?>

							<div class="sui-form-field">

								<label id="hustle-<?php echo esc_html( $type ); ?>-status-label" class="sui-settings-label"><?php esc_html_e( 'Status', 'wordpress-popup' ); ?></label>

								<span id="hustle-<?php echo esc_html( $type ); ?>-status-description" class="sui-description" style="margin-bottom: 10px;"><?php printf( esc_html__( 'By default, we display %1$s with any status. However, you can display %1$s with a specific status only on the dashboard.', 'wordpress-popup' ), esc_html( $data['lowercase'] ) ); ?></span>

								<label
									for="hustle-<?php echo esc_attr( $type ); ?>-status--published"
									class="sui-checkbox sui-checkbox-stacked sui-checkbox-sm"
								>
									<input
										type="checkbox"
										name="published_<?php echo esc_attr( $type ); ?>_on_dashboard"
										value="1"
										id="hustle-<?php echo esc_attr( $type ); ?>-status--published"
										<?php checked( $settings['published_' . $type . '_on_dashboard'] ); ?>
									>
									<span aria-hidden="true"></span>
									<span><?php esc_html_e( 'Published', 'wordpress-popup' ); ?></span>
								</label>

								<label
									for="hustle-<?php echo esc_attr( $type ); ?>-status--drafts"
									class="sui-checkbox sui-checkbox-stacked sui-checkbox-sm"
								>
									<input
										type="checkbox"
										id="hustle-<?php echo esc_attr( $type ); ?>-status--drafts"
										name="draft_<?php echo esc_attr( $type ); ?>_on_dashboard"
										value="1"
										<?php checked( $settings['draft_' . $type . '_on_dashboard'] ); ?>
									>
										<span aria-hidden="true"></span>
										<span><?php esc_html_e( 'Drafts', 'wordpress-popup' ); ?></span>
									</label>

							</div>

						<?php } ?>

					</div>

				<?php endforeach; ?>

			</div>

		</div>

	</div>

</div>
