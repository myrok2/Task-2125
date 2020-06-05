<?php
/**
 * Only a member that is of this organization and has the capability of
 * 'aa_admin_organization' will be able to see the form below
 */
	if (CAN_USER_ADMIN_THIS_ORG) : ?>

	<h1 style="text-align: center;"> Edit | <?php echo get_the_title(); ?> </h1>

	<?php acf_form();?>

<?php endif; ?>