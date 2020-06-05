<?php
$fields = [
	'name'       => [
		'icon'  => 'profile-male',
		'label' => __( 'Name', 'wordpress-popup' ),
	],
	'email'      => [
		'icon'  => 'mail',
		'label' => __( 'Email', 'wordpress-popup' ),
	],
	'phone'      => [
		'icon'  => 'phone',
		'label' => __( 'Phone', 'wordpress-popup' ),
	],
	'address'    => [
		'icon'  => 'pin',
		'label' => __( 'Address', 'wordpress-popup' ),
	],
	'url'        => [
		'icon'  => 'web-globe-world',
		'label' => __( 'Website', 'wordpress-popup' ),
	],
	'text'       => [
		'icon'  => 'style-type',
		'label' => __( 'Text', 'wordpress-popup' ),
	],
	'number'     => [
		'icon'  => 'element-number',
		'label' => __( 'Number', 'wordpress-popup' ),
	],
	'datepicker' => [
		'icon'  => 'calendar',
		'label' => __( 'Datepicker', 'wordpress-popup' ),
	],
	'timepicker' => [
		'icon'  => 'clock',
		'label' => __( 'Timepicker', 'wordpress-popup' ),
	],
	'recaptcha'  => [
		'icon'   => 'recaptcha',
		'label'  => __( 'reCaptcha', 'wordpress-popup' ),
		'single' => true,
	],
	'gdpr'       => [
		'icon'   => 'gdpr',
		'label'  => __( 'GDPR Approval', 'wordpress-popup' ),
		'single' => true,
	],
	'hidden'     => [
		'icon'  => 'eye-hide',
		'label' => __( 'Hidden Field', 'wordpress-popup' ),
	],
];

?>
<div id="hustle-dialog--optin-fields" class="sui-dialog" aria-hidden="true" tabindex="-1">

	<div class="sui-dialog-overlay sui-fade-out"></div>

	<div role="dialog"
		class="sui-dialog-content sui-bounce-out"
		aria-labelledby="dialogTitle"
		aria-describedby="dialogDescription">

		<div class="sui-box" role="document">

			<div class="sui-box-header">


		     	<h3 class="sui-box-title" id="dialogTitle"><?php esc_html_e( 'Insert Fields', 'wordpress-popup' ); ?></h3>

		     	<div class="sui-actions-right">

		     		<button class="hustle-cancel-insert-fields sui-dialog-close">
		     			<span class="sui-screen-reader-text"><?php esc_html_e( 'Close this dialog window', 'wordpress-popup' ); ?></span>
		     		</button>

				</div>

			</div>

			<div class="sui-box-body">

				<p><?php esc_html_e( 'Choose which fields you want to insert into your opt-in form.', 'wordpress-popup' ); ?></p>

			</div>

			<div class="sui-box-selectors sui-box-selectors-col-5">

				<ul class="sui-spacing-slim">

					<?php foreach ( $fields as $field_type => $data ) : ?>

						<li><label for="hustle-optin-insert-field--<?php echo esc_attr( $field_type ); ?>" class="sui-box-selector sui-box-selector-vertical <?php echo empty( $data['single'] ) ? '' : 'hustle-skip'; ?>">
							<input
								id="hustle-optin-insert-field--<?php echo esc_attr( $field_type ); ?>"
								type="checkbox"
								value="<?php echo esc_attr( $field_type ); ?>"
								name="optin_fields"
								<?php
								if ( ! empty( $data['single'] ) ) {
									disabled( array_key_exists( $field_type, $form_elements ) );
									checked( array_key_exists( $field_type, $form_elements ) );
								}
								?>
							/>
							<span>
								<i class="sui-icon-<?php echo esc_attr( $data['icon'] ); ?>" aria-hidden="true"></i>
								<?php echo esc_html( $data['label'] ); ?>
							</span>
						</label></li>

					<?php endforeach; ?>

				</ul>

			</div>

			<div class="sui-box-footer">

				<button class="sui-button sui-button-ghost hustle-cancel-insert-fields">
					<?php esc_attr_e( 'Cancel', 'wordpress-popup' ); ?>
				</button>

				<div class="sui-actions-right">

					<button id="hustle-insert-fields" class="sui-button sui-button-blue">
						<span class="sui-loading-text"><?php esc_attr_e( 'Insert Fields', 'wordpress-popup'); ?></span>
						<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
					</button>

				</div>

			</div>

		</div>

	</div>

</div>
