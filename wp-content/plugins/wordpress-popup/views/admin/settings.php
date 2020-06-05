<?php
/**
 * @var Opt_In $this
 */
$sections = array(
	'general' => array(
		'label' => __( 'General', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'settings' => Hustle_Settings_Admin::get_general_settings(),
		),
	),
	'palettes' => array(
		'label' => __( 'Color Palettes', 'wordpress-popup' ),
		'data' => array(
			'palettes' => Hustle_Settings_Admin::get_custom_color_palettes(),
		),
	),
	'analytics' => array(
		'label' => __( 'Dashboard Analytics', 'wordpress-popup' ),
		'status' => 'hide',
		'data' => array(
			'settings' => isset( $hustle_settings['analytics'] ) ? $hustle_settings['analytics'] : array(),
		),
	),
	'data' => array(
		'label' => __( 'Data', 'wordpress-popup' ),
		'status' => 'show',
	),
	'privacy' => array(
		'label' => __( 'Viewer\'s Privacy', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'settings' => Hustle_Settings_Admin::get_privacy_settings(),
		),
	),
	'permissions' => array(
		'label' => __( 'Permissions', 'wordpress-popup' ),
		'status' => 'hide',
		'data' => array(
			'filter' => $filter,
			'modules' => $modules,
			'modules_count' => $modules_count,
			'modules_limit' => $modules_limit,
			'modules_page' => $modules_page,
			'modules_show_pager' => $modules_show_pager,
			'modules_edit_roles' => $modules_edit_roles,
			'hustle_settings' => $hustle_settings,
			'roles' => Opt_In_Utils::get_user_roles(),
		),
	),
	'recaptcha' => array(
		'label' => __( 'reCAPTCHA', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'settings' => Hustle_Settings_Admin::get_recaptcha_settings(),
		),
	),
	'accessibility' => array(
		'label' => __( 'Accessibility', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'settings' => Hustle_Settings_Admin::get_hustle_settings( 'accessibility' ),
		),
	),
	'metrics' => array(
		'label' => __( 'Top Metrics', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'stored_metrics' => Hustle_Settings_Admin::get_top_metrics_settings(),
		),
	),
	'unsubscribe' => array(
		'label' => __( 'Unsubscribe', 'wordpress-popup' ),
		'status' => 'show',
		'data' => array(
			'messages' => Hustle_Settings_Admin::get_unsubscribe_messages(),
			'email'	   => Hustle_Settings_Admin::get_unsubscribe_email_settings(),
		),
	),
);
?>

<main class="<?php echo implode( ' ', apply_filters( 'hustle_sui_wrap_class', null ) ); ?>">

	<div class="sui-header">
		<h1 class="sui-header-title"><?php esc_html_e( 'Settings', 'wordpress-popup' ); ?></h1>
		<?php $this->render( 'admin/commons/view-documentation' ); ?>
	</div>

	<div class="sui-row-with-sidenav">

		<div class="sui-sidenav">

			<ul class="sui-vertical-tabs sui-sidenav-hide-md">
				<?php
				foreach ( $sections as $key => $value ) {

					if ( ! empty( $value['status'] ) && 'hide' === $value['status'] ) {
						continue;
					}

					$classes = array(
						'sui-vertical-tab',
					);

					if ( $section === $key ) {
						$classes[] = 'current';
					}

					printf(
						'<li class="%s"><a href="#" data-tab="%s">%s</a></li>',
						esc_attr( implode( ' ', $classes ) ),
						esc_attr( $key ),
						esc_html( $value['label'] )
					);
				}
				?>
			</ul>

		</div>

		<?php
		foreach ( $sections as $key => $value ) {

			if ( ! empty( $value['status'] ) && 'hide' === $value['status'] ) {
				continue;
			}

			$data = isset( $value['data'] )? $value['data']:array();
			$data['section'] = $section;
			$template = sprintf( 'admin/settings/tab-%s', esc_attr( $key ) );

			$this->render( $template, $data );
		}
		?>

	</div>

	<?php
	// Global Footer
	$this->render( 'admin/footer/footer' );

	// DIALOG: Delete.
	$this->render( 'admin/commons/sui-listing/dialogs/delete-module' );

	// DIALOG: Delete All IPs.
	$this->render( 'admin/settings/privacy/dialog-ip-delete' );

	// DIALOG: Dissmiss migrate tracking notice modal confirmation.
	if ( Hustle_Module_Admin::is_show_migrate_tracking_notice() ) {
		$this->render( 'admin/dashboard/dialogs/migrate-dismiss-confirmation' );
	}

	// DIALOG: Palette tab - Edit palette.
	$this->render(
		'admin/dialogs/modal-settings-edit-palette',
		array(
			'palettes' => Hustle_Module_Model::get_all_palettes_slug_and_name(),
		)
	);
	?>

</main>
