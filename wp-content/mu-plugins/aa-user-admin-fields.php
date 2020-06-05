<?php
/*
Plugin Name: AA Admin Fields
Version: 0.1
Description: Display additional metadata for a user in the admin screen
Author: 352 inc 
Author URI: http://352inc.com
Plugin URI: https://github.com/352Media/pantheon-agile-alliance
Text Domain: aaadminfields
Domain Path: /languages
*/

// do all the admin related stuff on admin requests only

if( is_admin()) {
  require 'aa-admin-fields/AdminFields.php';
  add_action( 'show_user_profile', ['AgileAlliance\AdminFields\AdminFields', 'showMetaFields'] );
  add_action( 'edit_user_profile', ['AgileAlliance\AdminFields\AdminFields', 'showMetaFields'] );
  add_action( 'edit_user_profile_update', ['AgileAlliance\AdminFields\AdminFields', 'saveMetaFields']);
}
