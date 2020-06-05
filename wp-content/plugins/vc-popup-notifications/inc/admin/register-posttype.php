<?php

add_action( 'init', 'vcpopup_register_admin_post_type' );
/**
 * Register a book post type.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_post_type
 */
function vcpopup_register_admin_post_type() {
	$labels = array(
		'name' => _x( 'VC POPUP', 'VC POPUPs', 'swp' ),
		'singular_name' => _x( 'VC POPUP', 'VC POPUPs', 'swp' ),
		'menu_name' => _x( 'VC POPUPS', 'admin menu', 'swp' ),
		'name_admin_bar' => _x( 'VC POPUP', 'Popup', 'swp' ),
		'add_new' => _x( 'Add New', 'Popup', 'swp' ),
		'add_new_item' => __( 'Add New Popup Notification', 'swp' ),
		'new_item' => __( 'New POPUP', 'swp' ),
		'edit_item' => __( 'Edit POPUP', 'swp' ),
		'view_item' => __( 'View POPUP', 'swp' ),
		'all_items' => __( 'All POPUPs', 'swp' ),
		'search_items' => __( 'Search POPUPs', 'swp' ),
		'parent_item_colon' => __( 'Parent POPUPs:', 'swp' ),
		'not_found' => __( 'No POPUP found.', 'swp' ),
		'not_found_in_trash' => __( 'No POPUPs found in Trash.', 'swp' ),
	);

	$args = array(
		'labels' => $labels,
		'menu_icon' => 'dashicons-info',
		'public' => true,
		'show_ui' => true,
		'_builtin' => false,
		'capability_type' => 'page',
		'hierarchical' => true,
		'rewrite' => false,
		'query_var' => "vcpopup",
		'show_in_menu' => true,
		'supports' => array( 'title', 'editor' ),
	);

	register_post_type( 'vcpopup', $args );
}

function vcpopup_enqueue_admin_scripts( $hook ) {

	global $post;

	if ( $hook == 'post-new.php' || $hook == 'post.php' ) {
		if ( 'vcpopup' === $post->post_type ) {
			wp_enqueue_style( 'vcpopup', VCPOP_UP_NOTIF_URL . '/css/vcpopup-admin.css' );
			wp_enqueue_script( 'vcpopup', VCPOP_UP_NOTIF_URL . '/js/vcpopup-admin.js' );
			add_action( 'admin_head', 'vcpopup_admin_head' );
		}
	} else if ( $hook == 'edit.php' ) {
			if ( 'vcpopup' === $post->post_type ) {
				wp_enqueue_style( 'vcpopup', VCPOP_UP_NOTIF_URL . '/css/vcpopup-admin.css' );
				add_action( 'admin_head', 'vcpopup_add_info_sidebar' );
				add_action( 'admin_footer', 'vcpopup_add_info_sidebar_html' );
				add_filter( 'page_row_actions', 'vcpopup_remove_edit_trash_links', 10, 2 );
				add_filter( 'manage_posts_columns' , 'vcpopup_remove_date_coloumn' );
			}
		}

}
add_action( 'admin_enqueue_scripts', 'vcpopup_enqueue_admin_scripts' );

function vcpopup_admin_head() {
	global $post;
?>
<script type="text/javascript">
(function($) {

	// vars
	vcpopup.post_id = <?php echo $post->ID;?>;
	vcpopup.nonce = "<?php echo wp_create_nonce( 'vcpopup_nonce' );?>";
	vcpopup.admin_url = "<?php echo admin_url();?>";
	vcpopup.ajaxurl = "<?php echo admin_url( 'admin-ajax.php' );?>";

})(jQuery);
</script>
		<?php
}

function vcpopup_add_info_sidebar() {

	global $post;
?>
<script type="text/javascript">
(function($) {

	$(function(){
// wrap
	$('#wpbody .wrap').attr('id', 'vcpopup-global');
	$('#vcpopup-global').wrapInner('<div id="vcpopup-global-col-left" />');
	$('#vcpopup-global').wrapInner('<div id="vcpopup-global-cols" />');

	// add sidebar
	$('#vcpopup-global-cols').prepend( $('#tmpl-vcpopup-global-col-right').html() );
	// take out h2 + icon
	$('#vcpopup-global-col-left > .icon32').insertBefore('#vcpopup-global-cols');
	$('#vcpopup-global-col-left > h2').insertBefore('#vcpopup-global-cols');

	})
})(jQuery);
</script>
		<?php

}


function vcpopup_add_info_sidebar_html() {

	$version = vcpopup_get_version();

?>
<script type="text/html" id="tmpl-vcpopup-global-col-right">
<div id="vcpopup-global-col-right">

	<div class="wp-box">
		<div class="inner">
			<h2><?php _e( "VC Popup Notifications", 'vcpn' ); ?> <?php echo $version; ?></h2>

			<h3><?php _e( "Changelog", 'vcpn' ); ?></h3>
			<p><?php _e( "See what's new in", 'vcpn' ); ?> <a target="_blank" href="http://codecanyon.net/item/visual-composer-popup-notifications/8215036?ref=webholics#item-description__changelog"><?php _e( "version", 'vcpn' ); ?> <?php echo $version; ?></a>

			<h3><?php _e( "Other Plugins", 'vcpn' ); ?></h3>
			<ul>
				<li style="float: left;margin-right: 20px;"><a href="http://codecanyon.net/item/visual-composer-mailchimp-addon/11556987?ref=webholics" target="_blank"><img src="https://0.s3.envato.com/files/135121326/vc-mailchimp-thumb.jpg"></a></li>
				<li><a href="http://codecanyon.net/item/visual-composer-icon-tabs/8321724?ref=webholics" target="_blank"><img src="https://0.s3.envato.com/files/98200763/vc-icontabs-thumb.jpg"></a></li>

			</ul>
		</div>
		<div class="footer footer-blue">
			<ul class="hl">
				<li><?php _e( "Created by", 'vcpn' ); ?><a target="_blank" href="http://codecanyon.net/user/webholics/portfolio?ref=webholics"> Webholics</a></li>
			</ul>
		</div>
	</div>
</div>
</script>

<?php

}

function vcpopup_remove_edit_trash_links( $actions, $post ) {
	if ( $post->post_type=='vcpopup' ) {
		unset( $actions['view'] );
		unset( $actions['inline hide-if-no-js'] );
		unset( $actions['edit_vc'] );
	}
	return $actions;
}

function vcpopup_remove_date_coloumn( $columns ) {
	unset( $columns['date'] );
	return $columns;
}


function vcpopup_get_version() {
	if ( VCPOP_UP_NOTIF_VER ) {
		return VCPOP_UP_NOTIF_VER;
	}else {
		return '';
	}

}
