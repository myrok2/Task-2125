<form class="hustle-bulk-actions-container sui-bulk-actions">

	<?php if ( ! $is_bottom ) : ?>

		<label for="hustle-check-all" class="sui-checkbox">
			<input type="checkbox" id="hustle-check-all" class="hustle-check-all">
			<span aria-hidden="true"></span>
			<span class="sui-screen-reader-text"><?php esc_html_e( 'Select all', 'wordpress-popup' ); ?></span>
		</label>

	<?php endif; ?>

	<select
		name="hustle_action"
		class="sui-select-sm sui-select-inline"
		data-width="200"
		data-placeholder="<?php esc_html_e( 'Bulk actions', 'wordpress-popup' ); ?>"
	>
		<option value="publish" data-icon="upload-cloud"><?php esc_html_e( 'Publish', 'wordpress-popup' ); ?></option>
		<option value="unpublish" data-icon="unpublish"><?php esc_html_e( 'Unpublish', 'wordpress-popup' ); ?></option>
		<option value="clone" data-icon="copy"><?php esc_html_e( 'Duplicate', 'wordpress-popup' ); ?></option>
		<option value="reset-tracking" data-icon="undo"><?php esc_html_e( 'Reset Tracking Data', 'wordpress-popup' ); ?></option>
		<option value="enable-tracking" data-icon="graph-line"><?php esc_html_e( 'Enable Tracking', 'wordpress-popup' ); ?></option>
		<option value="disable-tracking" data-icon="tracking-disabled"><?php esc_html_e( 'Disable Tracking', 'wordpress-popup' ); ?></option>
		<option value="delete" data-icon="trash"><?php esc_html_e( 'Delete', 'wordpress-popup' ); ?></option>
	</select>

	<button
		type="button"
		class="hustle-bulk-apply-button sui-button"
		data-type="<?php echo esc_attr( $module_type ); ?>"
		data-delete-title="<?php esc_html_e( 'Are you sure?', 'wordpress-popup' ); ?>"
		data-delete-description="<?php esc_html_e( 'Are you sure to delete selected modules? Their additional data, like subscriptions and tracking data, will be deleted as well.', 'wordpress-popup' ); ?>"
		data-reset-title="<?php esc_html_e( 'Reset Tracking Data', 'wordpress-popup' ); ?>"
		data-reset-description="<?php esc_html_e( 'Are you sure you wish to reset the tracking data of these modules?', 'wordpress-popup' ); ?>"
		data-nonce="<?php echo esc_attr( wp_create_nonce( 'hustle-bulk-action' ) ); ?>"
		<?php disabled( true ); ?>
	>
		<span class="sui-loading-text">
			<?php esc_html_e( 'Apply', 'wordpress-popup' ); ?>
		</span>
		<i class="sui-icon-loader sui-loading" aria-hidden="true"></i>
	</button>
</form>

