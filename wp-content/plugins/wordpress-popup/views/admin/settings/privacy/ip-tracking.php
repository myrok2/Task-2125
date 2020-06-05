<?php $ip_tracking = 'on' === $settings['ip_tracking']; ?>

<fieldset class="sui-form-field">

	<label class="sui-settings-label"><?php esc_html_e( 'IP Tracking', 'wordpress-popup' ); ?></label>

	<span class="sui-description"><?php esc_html_e( 'Choose whether you want to track the IP address of your visitors while collecting tracking data and submissions.', 'wordpress-popup' ); ?></span>

	<div class="sui-side-tabs" style="margin-top: 10px;">

		<div class="sui-tabs-menu">

			<label class="sui-tab-item<?php echo $ip_tracking ? ' active':''; ?>">
				<input type="radio"
				name="ip_tracking"
				id="hustle-ip-tracking--on"
				value="on"
				data-tab-menu="exclude-ips"
				<?php checked( $ip_tracking, true ); ?> />
				<?php esc_html_e( 'Enable', 'wordpress-popup' ); ?>
			</label>

			<label class="sui-tab-item<?php echo ! $ip_tracking ? ' active':''; ?>">
				<input type="radio"
				name="ip_tracking"
				id="hustle-ip-tracking--off"
				value="off"
				<?php checked( $ip_tracking, false ); ?> />
				<?php esc_html_e( 'Disable', 'wordpress-popup' ); ?>
			</label>

		</div>

	</div>

</fieldset>
