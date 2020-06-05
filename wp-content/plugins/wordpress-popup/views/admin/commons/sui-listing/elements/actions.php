<?php
$is_embedded_or_social = Hustle_Module_Model::EMBEDDED_MODULE === $module->module_type || Hustle_Module_Model::SOCIAL_SHARING_MODULE === $module->module_type;

// BUTTON: Open dropdown list ?>
<button class="sui-button-icon sui-dropdown-anchor" aria-expanded="false">
	<span class="sui-loading-text">
		<i class="sui-icon-widget-settings-config" aria-hidden="true"></i>
	</span>
	<span class="sui-screen-reader-text"><?php esc_html_e( 'More options', 'wordpress-popup' ); ?></span>
	<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
</button>

<?php // Start dropdown options ?>

<ul>

	<?php
	// Edit module
	if ( ! empty( $dashboard ) ) : ?>

		<li><a href="<?php echo esc_url( $module->decorated->get_edit_url() ); ?>" class="hustle-onload-icon-action">
			<i class="sui-icon-pencil" aria-hidden="true"></i>
			<?php esc_html_e( 'Edit', 'wordpress-popup' ); ?>
		</a></li>

	<?php 
	endif; ?>

	<?php
	// Preview module
	if ( Hustle_Module_Model::SOCIAL_SHARING_MODULE !== $module->module_type ) : ?>

		<li><button
			class="hustle-preview-module-button hustle-onload-icon-action"
			data-id="<?php echo esc_attr( $module->id ); ?>"
			data-type="<?php echo esc_attr( $module->module_type ); ?>">
			<i class="sui-icon-eye" aria-hidden="true"></i>
			<?php esc_html_e( 'Preview', 'wordpress-popup' ); ?>
		</button></li>

	<?php
	endif; ?>

	<?php
	// Copy shortcode
	if ( $is_embedded_or_social ) : ?>

		<li><button
			class="hustle-copy-shortcode-button"
			data-shortcode='[wd_hustle id="<?php echo esc_attr( $module->get_shortcode_id() ); ?>" type="<?php echo esc_attr( $module->module_type ); ?>"/]'>
			<i class="sui-icon-code" aria-hidden="true"></i>
			<?php esc_html_e( 'Copy Shortcode', 'wordpress-popup' ); ?>
		</button></li>

	<?php endif; ?>

	<?php
	// Toggle Status button ?>

	<li><button
		class="hustle-single-module-button-action hustle-onload-icon-action"
		data-module-id="<?php echo esc_attr( $module->id ); ?>"
		data-hustle-action="toggle-status"
	>
		<span class="<?php echo $module->active ? '' : 'sui-hidden'; ?>">
			<i class="sui-icon-unpublish" aria-hidden="true"></i>
			<?php esc_html_e( 'Unpublish', 'wordpress-popup' ); ?>
		</span>
		<span class="<?php echo $module->active ? ' sui-hidden' : ''; ?>">
			<i class="sui-icon-web-globe-world" aria-hidden="true"></i>
			<?php esc_html_e( 'Publish', 'wordpress-popup' ); ?>
		</span>
	</button></li>

<?php
// TODO: FIX INDENTATION.

	// View Email List
if (
		Hustle_Module_Model::SOCIAL_SHARING_MODULE !== $module->module_type
		&& $capability['hustle_access_emails']
		&& 'optin' === $module->module_mode
	) {
	$url = add_query_arg(
		array(
		'page' => Hustle_Module_Admin::ENTRIES_PAGE,
		'module_type' => $module->module_type,
		'module_id' => $module->module_id,
		),
		admin_url( 'admin.php' )
	);
	printf( '<li><a href="%s" class="hustle-onload-icon-action">', esc_url( $url ) );
	echo '<i class="sui-icon-community-people" aria-hidden="true"></i> ';
	esc_html_e( 'View Email List', 'wordpress-popup' );
	echo '</a></li>';
}
?>

<?php
// Duplicate 
?>
<?php if ( empty( $dashboard ) ) : ?>
	<li><button 
		class="<?php echo $can_create ? 'hustle-single-module-button-action hustle-onload-icon-action' : 'hustle-upgrade-modal-button'; ?>"
		data-module-id="<?php echo esc_attr( $module->id ); ?>"
		data-hustle-action="clone"
	>
		<i class="sui-icon-copy" aria-hidden="true"></i>
		<?php esc_html_e( 'Duplicate', 'wordpress-popup' ); ?>
	</button></li>
<?php endif; ?>

<?php 
// Tracking 
?>
<?php if ( empty( $dashboard ) ) : ?>

	<li>
		<?php 
		if ( ! $is_embedded_or_social ) : 

			$is_tracking_enabled = $module->is_tracking_enabled( $module->module_type );
			?>

			<button
				class="hustle-single-module-button-action hustle-onload-icon-action"
				data-module-id="<?php echo esc_attr( $module->id ); ?>"
				data-hustle-action="toggle-tracking"
			>
				<span class="<?php echo $is_tracking_enabled ? '' : 'sui-hidden'; ?>">
					<i class="sui-icon-tracking-disabled" aria-hidden="true"></i>
					<?php esc_html_e( 'Disable Tracking', 'wordpress-popup' ); ?>
				</span>
				<span class="<?php echo $is_tracking_enabled ? ' sui-hidden' : ''; ?>">
					<i class="sui-icon-graph-line" aria-hidden="true"></i>
					<?php esc_html_e( 'Enable Tracking', 'wordpress-popup' ); ?>
				</span>
			</button>
		<?php
		else :

			$trackings = $module->get_tracking_types();
			$enabled_trackings = $trackings ? implode( ',', array_keys( $trackings ) ) : '';
			?>
			<button
				class="hustle-manage-tracking-button"
				data-module-id="<?php echo esc_attr( $module->id ); ?>"
				data-tracking-types="<?php echo esc_attr( $enabled_trackings ); ?>"
			>
				<i class="sui-icon-graph-line" aria-hidden="true"></i>
				<?php esc_html_e( 'Manage Tracking', 'wordpress-popup' ); ?>
			</button>
		<?php endif; ?>
	</li>

	<li>
		<button class="hustle-module-tracking-reset-button"
				data-module-id="<?php echo esc_attr( $module->id ); ?>"
				data-title="<?php esc_attr_e( 'Reset Tracking Data', 'wordpress-popup' ); ?>"
				data-description="<?php esc_attr_e( 'Are you sure you wish reset the tracking data of this module?', 'wordpress-popup' ); ?>"
			>
			<i class="sui-icon-undo" aria-hidden="true"></i> <?php esc_html_e( 'Reset Tracking Data', 'wordpress-popup' ); ?>
		</button>
	</li>

<?php endif; ?>

	<?php // Export ?>
	<li>
		<form method="post">
			<input type="hidden" name="hustle_action" value="export">
			<input type="hidden" name="id" value="<?php echo esc_attr( $module->id ); ?>">
			<?php wp_nonce_field( 'hustle_module_export' ); ?>
			<button>
				<i class="sui-icon-cloud-migration" aria-hidden="true"></i>
				<?php esc_html_e( 'Export', 'wordpress-popup' ); ?>
			</button>
		</form>
	</li>

	<?php 
	// Import
	if ( empty( $dashboard ) ) : ?>

		<li><button
			class="hustle-import-module-button"
			data-module-id="<?php echo esc_attr( $module->id ); ?>"
			data-module-mode="<?php echo esc_attr( $module->module_mode ); ?>"
		>
			<span>
				<i class="sui-icon-upload-cloud" aria-hidden="true"></i>
				<?php esc_html_e( 'Import', 'wordpress-popup' ); ?>
			</span>
		</button></li>

	<?php
	endif; ?>

	<?php
	// Delete module ?>
	<li><button class="sui-option-red hustle-delete-module-button"
		data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle_listing_request' ) ); ?>"
		data-type="<?php echo esc_attr( $module->module_type ); ?>"
		data-id="<?php echo esc_attr( $module->id ); ?>"
		data-title="<?php printf( esc_attr__( 'Delete %s' ), esc_attr( $capitalize_singular ) ); ?>"
		data-description="<?php printf( esc_attr__( 'Are you sure you wish to permanently delete this %s? Its additional data, like subscriptions and tracking data, will be deleted as well.' ), esc_attr( $smallcaps_singular ) ); ?>"
	>
		<i class="sui-icon-trash" aria-hidden="true"></i> <?php esc_html_e( 'Delete', 'wordpress-popup' ); ?>
	</button></li>

</ul>
