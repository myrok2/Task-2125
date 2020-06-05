<?php
$args = array( 'role' => 'alert' );

// Set unique identifier to notice.
if ( ! empty( $id ) ) {
	$args['id'] = esc_attr( $id );
}

// Set default class.
$args['class'] = 'sui-notice';

// Set type of notice.
if ( ! empty( $type ) ) {
	$args['class'] .= ' sui-notice-' . esc_attr( $type );
}

// Make notice dismissable.
if ( ! empty( $dismiss ) ) {
	$args['class'] .= ' sui-can-dismiss';
}

// Set custom sui class(es).
if ( ! empty( $sui_class ) ) {
	$args['class'] .= ' sui-notice-' . esc_attr( $class );
}

// Set custom class(es).
if ( ! empty( $class ) ) {
	$args['class'] .= ' ' . esc_attr( $class );
}

// Show "style" argument.
if ( ! empty( $hidden ) || ! empty( $style ) ) {
	$args['style'] = '';
}

// Hide notice on load.
if ( ! empty( $hidden ) ) {
	$args['style'] .= 'display: none;';
}

// Set custom inline styles.
if ( ! empty( $style ) ) {
	$args['style'] .= ' ' . $style;
}

foreach ( $args as $key => $value ) {
	$attrs[] = $key . '="' . $value . '"';
}
?>

<div <?php echo implode( ' ', wp_kses_post( $attrs ) ); ?>>

	<?php if ( isset( $content ) ) { ?>

		<div class="sui-notice-content">

			<?php
			foreach ( $content as $text ) {

				if ( '' !== $text ) {
					echo '<p>' . $text . '</p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
			}
			?>

		</div>

	<?php } ?>

</div>
