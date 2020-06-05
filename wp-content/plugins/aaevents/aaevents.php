<?php
/*
Plugin Name: AA Events
Version: 1.1.4
Description: Events Management
Author: 352 inc
Author URI: http://352inc.com
Plugin URI: https://github.com/352Media/pantheon-agile-alliance
Text Domain: aaevents
Domain Path: /languages
*/

if (!defined('AA_EVENTS_EMAIL_HEADER')) {
  define('AA_EVENTS_EMAIL_HEADER',
      'Reply-To: Agile Alliance <registration@agilealliance.org>' . "\r\n" .
      'From: Agile Alliance <registration@agilealliance.org>' . "\r\n"
  );
}

require_once 'vendor/autoload.php';

// Init hooks
add_action('init', ['AgileAlliance\Events\Setup', 'setOptions'], 0 );
add_action('init', ['AgileAlliance\Events\Cpts', 'registerCpts'], 0 );

// do all the admin related stuff on admin requests only
if( is_admin() ) {
  add_action( 'admin_menu', ['AgileAlliance\Events\Controllers\ImporterController', 'addMenu']);
}
