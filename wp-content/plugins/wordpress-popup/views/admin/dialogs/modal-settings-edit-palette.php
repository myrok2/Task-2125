<div class="sui-modal sui-modal-lg">

	<div
		role="dialog"
		id="hustle-dialog--edit-palette"
		class="sui-modal-content"
		aria-modal="true"
		aria-labelledby="customPaletteTitle"
		aria-describedby="customPaletteDesc"
	>

		<div class="sui-box" role="document">

			<div class="sui-box-header">

				<button class="sui-button-icon sui-button-float--right hustle-cancel-palette">
					<i class="sui-icon-close sui-md" aria-hidden="true"></i>
					<span class="sui-screen-reader-text"><?php esc_html_e( 'Close this dialog window', 'wordpress-popup' ); ?></span>
				</button>

				<h3 id="customPaletteTitle" class="sui-box-title"><?php esc_html_e( 'Create Custom Palette', 'wordpress-popup' ); ?></h3>

			</div>

			<form id="hustle-edit-palette-form" class="sui-box-body">

				<?php // STEP 1: Create Palette. ?>
				<div id="hustle-edit-palette-first-step" style="margin-bottom: 0;">

					<p id="customPaletteDesc" class="sui-description"><?php esc_html_e( "Let's start by giving your color palette a name and choosing a base palette. You can either begin with one of our default color palettes or import colors from one of your existing modules.", 'wordpress-popup' ); ?></p>

					<div class="sui-form-field">

						<label for="hustle-palette-name" id="hustle-palette-name-label" class="sui-label"><?php esc_html_e( 'Name', 'wordpress-popup' ); ?></label>

						<input
							type="text"
							autocomplete="off"
							name="palette_name"
							value=""
							placeholder="<?php esc_html_e( 'Custom Palette Name', 'wordpress-popup' ); ?>"
							id="hustle-palette-name"
							class="hustle-required-field sui-form-control"
							aria-labelledby="hustle-palette-name-label"
							aria-describedby="hustle-palette-name-error"
							data-error-message="<?php esc_attr_e( 'The palette name is required.', 'wordpress-popup' ); ?>"
						/>

						<span id="hustle-palette-name-error" class="sui-error-message" style="display: none;" aria-hidden="true" hidden></span>

					</div>

					<div class="sui-form-field">

						<label id="hustle-base-palette-label" class="sui-label"><?php esc_html_e( 'Base Palette', 'wordpress-popup' ); ?></label>

						<div id="hustle-base-palette" class="sui-tabs sui-side-tabs" style="margin-top: 5px;">

							<div role="tablist" class="sui-tabs-menu">

								<label
									id="hustle-palette-default-label"
									for="hustle-palette-base-source-palette"
									class="sui-tab-item active"
								>
									<input
										tabindex="-1"
										type="radio"
										name="base_source"
										value="palette"
										id="hustle-palette-base-source-palette"
										style="display: none;"
										aria-hidden="true"
										hidden
										checked="checked"
										data-tab-menu="default"
									/>
									<?php esc_html_e( 'Default Palettes', 'wordpress-popup' ); ?>
								</label>

								<label
									id="hustle-palette-import-label"
									for="hustle-palette-base-source-module"
									class="sui-tab-item"
								>
									<input
										tabindex="-1"
										type="radio"
										name="base_source"
										value="module"
										id="hustle-palette-base-source-module"
										style="display: none;"
										aria-hidden="true"
										hidden
										data-tab-menu="module"
									/>
									<?php esc_html_e( 'Import From A Module', 'wordpress-popup' ); ?>
								</label>

							</div>

							<div class="sui-tabs-content">

								<?php // TAB: Default Palettes. ?>
								<div
									role="tabpanel"
									tabindex="0"
									id="hustle-palette-default"
									class="sui-tab-content sui-border-frame active"
									aria-labelledby="hustle-palette-default-label"
									data-tab-content="default"
								>

									<p class="sui-description" style="margin-bottom: 20px;"><?php esc_html_e( 'Choose one of the default color palettes and click on the next button to start customizing it.', 'wordpress-popup' ); ?></p>

									<div class="sui-form-field">

										<label for="hustle-pick-palette" id="hustle-pick-palette-label" class="sui-label"><?php esc_html_e( 'Color Palette', 'wordpress-popup' ); ?></label>

										<select id="hustle-pick-palette" name="base_palette" aria-labelledby="hustle-pick-palette-label">
											<?php foreach ( $palettes as $slug => $display_name ) : ?>
												<option value="<?php echo esc_attr( $slug ); ?>"><?php echo esc_attr( $display_name ); ?></option>
											<?php endforeach; ?>
										</select>

									</div>

								</div>

								<?php // TAB: Import Palette. ?>
								<div
									role="tabpanel"
									tabindex="0"
									id="hustle-palette-import"
									class="sui-tab-content sui-border-frame"
									aria-labelledby="hustle-palette-import-label"
									data-tab-content="module"
									hidden
								>

									<p class="sui-description" style="margin-bottom: 20px;"><?php esc_html_e( 'Import colors from one of your existing modules and click on the next button to start customizing the base palette.', 'wordpress-popup' ); ?></p>

									<div class="sui-form-field" style="margin-bottom: 20px;">

										<label for="hustle-palette-module-type" id="hustle-palette-module-type-label" class="sui-label"><?php esc_html_e( 'Module Type', 'wordpress-popup' ); ?></label>

										<select id="hustle-palette-module-type" name="module_type" aria-labelledby="hustle-palette-module-type-label">

											<?php
											foreach ( Hustle_Module_Model::get_module_types() as $module_type ) :
												if ( Hustle_Module_Model::SOCIAL_SHARING_MODULE === $module_type ) {
													continue;
												}
												?>

												<option value="<?php echo esc_attr( $module_type ); ?>"><?php echo esc_html( Opt_In_Utils::get_module_type_display_name( $module_type, false, true ) ); ?></option>

											<?php endforeach; ?>

										</select>

									</div>

									<div class="sui-form-field" style="margin-bottom: 20px;">

										<label for="hustle-palette-module-name" id="hustle-palette-module-name-label" class="sui-label"><?php esc_html_e( 'Module Name', 'wordpress-popup' ); ?></label>

										<select id="hustle-palette-module-name" name="module_id" class="sui-select" aria-labelledby="hustle-palette-module-name-label"></select>

									</div>

									<div class="sui-form-field">

										<label for="hustle-palette-module-fallback" id="hustle-palette-module-fallback-label" class="sui-label"><?php esc_html_e( 'Fallback Color Palette', 'wordpress-popup' ); ?></label>

										<select id="hustle-palette-module-fallback" name="fallback_palette" aria-labelledby="hustle-palette-module-fallback-label" aria-describedby="hustle-palette-module-fallback-message">
											<?php foreach ( $palettes as $slug => $display_name ) : ?>
												<option value="<?php echo esc_attr( $slug ); ?>" ><?php echo esc_html( $display_name ); ?></option>
											<?php endforeach; ?>
										</select>

										<span id="hustle-palette-module-fallback-message" class="sui-description"><?php esc_html_e( 'We will use this palette to import colors which are not available in your chosen module.', 'wordpress-popup' ); ?></span>

									</div>

								</div>

							</div>

						</div>

					</div>

				</div>

				<?php // STEP 2: Edit Palette. ?>
				<div id="hustle-edit-palette-second-step" style="display: none; margin-bottom: 0;" tabindex="-1" aria-hidden="true" hidden></div>

			</form>

			<div class="sui-box-footer sui-content-separated">

				<button class="sui-button sui-button-ghost hustle-cancel-palette">
					<?php esc_attr_e( 'Cancel', 'wordpress-popup' ); ?>
				</button>

				<button
					class="hustle-button-action sui-button"
					data-hustle-action="go-to-step"
					data-form-id="hustle-edit-palette-form"
					data-step="2"
				>
					<span id="hustle-step-button-text" class="sui-loading-text">
						<?php esc_attr_e( 'Next', 'wordpress-popup' ); ?>
					</span>
					<span id="hustle-finish-button-text" class="sui-loading-text" style="display:none;">
						<?php esc_attr_e( 'Save Palette', 'wordpress-popup' ); ?>
					</span>
					<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
				</button>

			</div>

		</div>

	</div>

</div>

<script type="text/template" id="hustle-dialog--edit-palette-tpl">

	<p class="sui-description"><?php esc_html_e( 'Customize your base palette as per your liking and click on the “Create Palette“ button to add this to your palettes list.', 'wordpress-popup' ); ?></p>

	<?php
	// Render the Popup optin's palette because it has all the properties a module can have.
	Opt_In::static_render(
		'admin/commons/sui-wizard/elements/palette-optin',
		array(
			'module_type'  => Hustle_Module_Model::POPUP_MODULE,
			'colors_label' => true,
		)
	);
	?>

	<# if ( 'undefined' !== typeof slug ) { #>
		<input type="hidden" name="slug" value="{{ slug }}">
	<# } #>

</script>
