<div class="sui-box-settings-row">

	<div class="sui-box-settings-col-1">
		<span class="sui-settings-label"><?php esc_html_e( 'Additional Closing Methods', 'wordpress-popup' ); ?></span>
		<span class="sui-description"><?php printf( esc_html__( 'Choose the additional closing methods for your %s apart from closing it by clicking on “x”.', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></span>
	</div>

	<div class="sui-box-settings-col-2">

		<?php
		// SETTINGS: Auto Close
		if ( true === $autoclose ) { ?>

			<div class="sui-form-field">

				<label for="hustle-methods--auto-hide" class="sui-toggle hustle-toggle-with-container" data-toggle-on="auto-hide">
					<input type="checkbox"
						id="hustle-methods--auto-hide"
						name="auto_hide" 
						data-attribute="auto_hide"
						{{ _.checked( _.isTrue( auto_hide ), true ) }}/>
					<span class="sui-toggle-slider"></span>
				</label>

				<label for="hustle-methods--auto-hide"><?php printf( esc_html__( 'Auto-Close %s', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></label>

				<span class="sui-description sui-toggle-description" style="margin-top: 0;"><?php printf( esc_html__( 'This will automatically close your %s after specified time.', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></span>

				<div class="sui-border-frame sui-toggle-content" data-toggle-content="auto-hide">

					<label class="sui-label"><?php printf( esc_html__( 'Automatically close %s after', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></label>

					<div class="sui-row">

						<div class="sui-col-md-6">

							<input type="number"
								value="{{ auto_hide_time }}"
								min="1"
								class="sui-form-control"
								name="auto_hide_time"
								data-attribute="auto_hide_time">

						</div>

						<div class="sui-col-md-6">

							<select name="auto_hide_unit" data-attribute="auto_hide_unit">

								<option value="seconds"
									{{ _.selected( ( 'seconds' === auto_hide_unit ), true) }}>
									<?php esc_html_e( 'seconds', 'wordpress-popup' ); ?>
								</option>

								<option value="minutes"
									{{ _.selected( ( 'minutes' === auto_hide_unit ), true) }}>
									<?php esc_html_e( 'minutes', 'wordpress-popup' ); ?>
								</option>

								<option value="hours"
									{{ _.selected( ( 'hours' === auto_hide_unit ), true) }}>
									<?php esc_html_e( 'hours', 'wordpress-popup' ); ?>
								</option>

							</select>

						</div>

					</div>

				</div>

			</div>

		<?php } ?>

		<?php
		if ( Hustle_Module_Model::POPUP_MODULE === $module_type ) :

			// SETTINGS: Close when click outside
			if ( true === $onclick ) { ?>

				<div class="sui-form-field">

					<label for="hustle-methods--close-mask" class="sui-toggle hustle-toggle-with-container" data-toggle-on="close-on-background-click">
						<input type="checkbox"
							id="hustle-methods--close-mask"
							name="close_on_background_click"
							data-attribute="close_on_background_click"
							{{ _.checked( _.isTrue( close_on_background_click ), true ) }} />
						<span class="sui-toggle-slider"></span>
					</label>

					<label for="hustle-methods--close-mask"><?php printf( esc_html__( 'Close %1$s when clicked outside', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></label>

					<span class="sui-description sui-toggle-description" style="margin-top: 0;"><?php printf( esc_html__( 'This will close the %1$s when a user clicks anywhere outside of the %1$s.', 'wordpress-popup' ), esc_html( $smallcaps_singular ), esc_html( $smallcaps_singular ) ); ?></span>

				</div>

			<?php } ?>
			
		<?php endif; ?>

		
		<?php
		// SETTINGS: Close after CTA conversion
		if ( Hustle_Module_Model::POPUP_MODULE === $module_type || Hustle_Module_Model::SLIDEIN_MODULE === $module_type ) : ?>

			<div class="sui-form-field" data-toggle-content="show-cta">

				<label for="hustle-close-cta" class="sui-toggle hustle-toggle-with-container" data-toggle-on="close-cta">
					<input type="checkbox"
						id="hustle-close-cta"
						name="close_cta"
						data-attribute="close_cta"
						{{ _.checked( _.isTrue( close_cta ), true ) }}
					/>
					<span class="sui-toggle-slider"></span>
				</label>
				
				<label for="hustle-close-cta"><?php printf( esc_html__( 'Close %s after CTA conversion', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></label>

				<span class="sui-description sui-toggle-description"><?php printf( esc_html__( 'Choose whether to close the %s after a user has clicked on the CTA button.', 'wordpress-popup' ), esc_html( $smallcaps_singular ) ); ?></span>

				<div class="sui-border-frame sui-toggle-content" data-toggle-content="close-cta">

					<label class="sui-label"><?php esc_html_e( 'Add delay', 'wordpress-popup' ); ?></label>

					<div class="sui-row">

						<div class="sui-col-md-6">

							<input type="number"
								value="{{ close_cta_time }}"
								min="1"
								class="sui-form-control"
								name="close_cta_time"
								data-attribute="close_cta_time">

						</div>

						<div class="sui-col-md-6">

							<select name="close_cta_unit" data-attribute="close_cta_unit">

								<option value="seconds"
									{{ _.selected( ( 'seconds' === close_cta_unit ), true) }}>
									<?php esc_html_e( 'seconds', 'wordpress-popup' ); ?>
								</option>

								<option value="minutes"
									{{ _.selected( ( 'minutes' === close_cta_unit ), true) }}>
									<?php esc_html_e( 'minutes', 'wordpress-popup' ); ?>
								</option>

								<option value="hours"
									{{ _.selected( ( 'hours' === close_cta_unit ), true) }}>
									<?php esc_html_e( 'hours', 'wordpress-popup' ); ?>
								</option>

							</select>

						</div>

					</div>

				</div>

			</div>

		<?php endif; ?>

	</div>

</div>
