<?php
	$request_invite_form_id = 24;
	$post_id = get_the_ID();
	$post_title = get_the_title();
	$request_invite_title_string = 'Request to join <span style="font-style: italic">%s</span>';
	$request_invite_title = sprintf( $request_invite_title_string, $post_title );
	$request_invite_form = gravity_form($request_invite_form_id, false, false, false, '', false, 1, false);
?>

<div class="container">
	<div style="margin: 80px 0;">
		<h1>
			<?php echo $request_invite_title ?>
		</h1>
		<?php echo $request_invite_form; ?>
	</div>
</div>
