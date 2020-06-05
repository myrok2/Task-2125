<div class="container" style="margin: 200px auto;">
	<h1>Your account was created successfully</h1>
	<p>
		An email has been sent to you at <?php echo $invite_recipient;?> with
		instructions for setting your password and thus becoming a full member of
		Agile Alliance under the corporate membership of <?php echo $organization->post_title; ?>.
	</p>
	<p>
		When you log in for the first time, you will be able to update your personal
		profile information.
	</p>
	<p>
		Questions?
		<a href="<?php echo site_url('/contact-us/?inquiry=Membership'); ?>">
			Please contact us for help!
		</a>
	</p>
</div>