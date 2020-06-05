<?php
/*
Plugin Name: Per page head
Plugin URI: http://www.evona.nl/plugins/per-page-head
Description: Allows you to add content into the <head> section for a specific page, like custom JS or custom HTML
Version: 1.4.2
Author: Erik von Asmuth
Author URI: http://evona.nl/over-mij/
License: GPLv2
Text Domain: per-page-ath
*/

defined( 'ABSPATH' ) or die( 'Direct access not allowed' );
load_plugin_textdomain('per-page-ath', false, basename( dirname( __FILE__ ) ) . '/languages' );

//Add the meta box
function perpageathaddbox() {
	if(current_user_can('add-to-head')||current_user_can('manage_options')){
		$addtohead = __('Add to head', 'per-page-ath');
		$screens = get_option('ppath_types_allowed', array('post', 'page'));
		foreach ( $screens as $screen ) {
			add_meta_box( 'per-page-ath', $addtohead, 'athcallback', $screen, 'normal',
			 'default', null );
		}
	}
}
add_action( 'add_meta_boxes', 'perpageathaddbox' );

function athcallback($post){
	
  // Add an nonce field so we can check for it later.
  wp_nonce_field( 'athcallback', 'athcontent' );

  /*
   * Use get_post_meta() to retrieve an existing value
   * from the database and use the value for the form.
   */
  $value = get_post_meta( $post->ID, 'per-page-ath-content', true );

  echo '<label for="per-page-ath">';
       _e( "Put your head html here", 'per-page-ath' );
  echo '</label><br/> ';
  echo '<textarea id="perpageathtextbox" style="width:100%; min-height:120px; white-space: pre-wrap;" name="per-page-ath">'.str_replace('%BREAK%', "\n",stripslashes_deep(esc_attr($value))).'</textarea>';
}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function perpageath_save_postdata( $post_id ) {

  /*
   * We need to verify this came from the our screen and with proper authorization,
   * because save_post can be triggered at other times.
   */

  // Check if our nonce is set.
  if ( ! isset( $_POST['athcontent'] ) )
    return $post_id;

  $nonce = $_POST['athcontent'];

  // Verify that the nonce is valid.
  if ( ! wp_verify_nonce( $nonce, 'athcallback' ) )
      return $post_id;

  // If this is an autosave, our form has not been submitted, so we don't want to do anything.
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return $post_id;

  // Check the user's permissions.
  if ( 'page' == $_POST['post_type'] ) {

    if ( ! current_user_can( 'edit_page', $post_id ) )
        return $post_id;
  
  } else {

    if ( ! current_user_can( 'edit_post', $post_id ) )
        return $post_id;
  }

  /* OK, its safe for us to save the data now. */

  // Add slashes because update_post_meta will expect them
  $mydata = addslashes($_POST['per-page-ath'] );

  // Update the meta field in the database.
  update_post_meta( $post_id, 'per-page-ath-content', $mydata );
}
add_action( 'save_post', 'perpageath_save_postdata' );
//Now that's done. Let's add the meta field to the head

function perpageath_display(){
	$html = get_option("ppath_head_every_page", "");
	if(empty($html)){
		$htmlfile = dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR.'evonapluginconfig'.DIRECTORY_SEPARATOR.'everyheadpage.html';
		if(file_exists($htmlfile)&& filesize($htmlfile) > 0){
			if($htmlhandle = fopen($htmlfile, 'r')){
				$html = fread($htmlhandle, filesize($htmlfile));
				fclose($htmlhandle);
				echo do_shortcode($html);
			 }else{
				 echo "<!-- Error reading ".$htmlfile."! Is the file readable? -->";
			 }
		}
	}else{
		echo do_shortcode($html);
	}
	if(!is_archive()){
		$pageid = get_queried_object_id();
		$addtoheadcontent = get_post_meta( $pageid, 'per-page-ath-content', true );
		if(!empty($addtoheadcontent)){
			echo do_shortcode(str_replace('%BREAK%', "\n", stripslashes_deep($addtoheadcontent)));
		}
	}
}
add_action('wp_head', 'perpageath_display', 1000);

//Create a menu
//Load in the option page
function EvonaCreateATHMenu() {
	$menuname = __('Per Page Add To Head', 'per-page-ath');
	add_options_page( $menuname, $menuname, 'manage_options', 'perpageath-every-page', 'PerPageATHSettings' );
}

function PerPageATHSettings(){
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	include_once(dirname(__FILE__).DIRECTORY_SEPARATOR.'settings.php');
	perpageath_config();
}

//Create the option menu, and load admin CSS to it
add_action( 'admin_menu', 'EvonaCreateATHMenu' );

//Installation
function PerPageATHInstallStep1(){
	include_once(dirname(__FILE__).DIRECTORY_SEPARATOR.'installdeinstall.php');
	PerPageATHInstallStep2();	
}
register_activation_hook( __FILE__, 'PerPageATHInstallStep1');
//Deinstallation
function PerPageATHDeinstallStep1(){
	include_once(dirname(__FILE__).DIRECTORY_SEPARATOR.'installdeinstall.php');
	PerPageATHDeinstallStep2();	
}
register_uninstall_hook( __FILE__, 'PerPageATHDeinstallStep1');
?>