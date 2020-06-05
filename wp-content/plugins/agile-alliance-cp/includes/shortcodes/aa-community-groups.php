<?php
//Community Group Shortcodes

function community_group_image() {?>

<div class="wpb_single_image wpb_content_element vc_align_right   aa_our-people-profile-img">

	<?php if( get_field( "group_image" ) ): ?>
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper vc_box_circle  vc_box_border_grey">
				<img class="vc_single_image-img " src="<?php echo the_field('group_image');?>" width="auto" height="auto" alt="Our Community Group" title="Our Community Group"></div>
		</figure>
	<?php endif; ?>
	</div>

<?php }
add_shortcode( 'community-group-image', 'community_group_image' );


function community_group_about_title() {?>

	<div class="community-group-title">
		<h2>
			<?php _e('About', 'agile-alliance-cp');?>&nbsp;<?php echo the_title();?>
		</h2>
	</div>

<?php }
add_shortcode( 'community-group-about-title', 'community_group_about_title' );


function community_group_telephone() {?>

	<?php if( get_field( "contact_number" ) ): ?>
	<div class="community-group-tel">
		<h2>
			<?php _e('tel:', 'agile-alliance-cp');?>&nbsp;<?php echo the_field( 'contact_number' );?>
		</h2>
	</div>
	<?php endif; ?>

<?php }
add_shortcode( 'community-group-telephone', 'community_group_telephone' );


function community_group_website() {?>

	<?php if( get_field( "website" ) ): ?>
		<div class="community-group-website">
			<h3><?php _e('Official Group', 'agile-alliance-cp'); ?></h3>
			<a href="<?php the_field( 'website' );?>" target="_blank" ><p><?php echo the_field( 'website' );?></p></a>
		</div>
	<?php endif;?>

<?php }
add_shortcode( 'community-group-website', 'community_group_website' );


function community_group_meetup() {?>

	<?php if( get_field( "meetup" ) ): ?>
		<div class="community-group-meetup">
			<h3><?php _e('Meetup', 'agile-alliance-cp'); ?></h3>
			<a href="<?php the_field( 'meetup' );?>" target="_blank" ><p><?php echo the_field( 'meetup' );?></p></a>
		</div>
	<?php endif; ?>

<?php }
add_shortcode( 'community-group-meetup', 'community_group_meetup' );


function community_group_logo() {?>


	<div class="wpb_single_image wpb_content_element vc_align_center">
		<figure class="wpb_wrapper vc_figure">
			<div class="vc_single_image-wrapper vc_box_border_grey"><?php the_post_thumbnail(); ?></div>
		</figure>
	</div>


<?php }
add_shortcode( 'community-group-logo', 'community_group_logo' );

function community_group_socials() {?>

	<div class="community-group-socials">
		<?php if( get_field( "facebook_url" ) ): ?>
		<a href="<?php echo the_field( 'facebook_url' ); ?>" class="facebook" target="_blank">
			<i class="fa fa-facebook"></i>
		</a>
		<?php endif; ?>
		<?php if( get_field( "twitter_url" ) ): ?>
		<a href="<?php echo the_field( 'twitter_url' ); ?>" class="twitter" target="_blank">
			<i class="fa fa-twitter"></i>
		</a>
		<?php endif; ?>
		<?php if( get_field( "community_group_email" ) ): ?>
		<a href="mailto:<?php echo the_field( 'community_group_email' ); ?>" class="mailto">
			<i class="fa fa-envelope-o"></i>
		</a>
		<?php endif; ?>
	</div>

<?php }
add_shortcode( 'community-group-socials', 'community_group_socials' );


