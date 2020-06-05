<?php
namespace aa\search;
use aa\search\{admin, hooks, indexer};

/**
 * Plugin Name: Agile Alliance Search
 * Description: Offload search indexing and provide a frontend UI for viewing results
 * Version:     1.0
 * Author:      352 Inc.
 */

if ( ! defined( 'ABSPATH' ) || (defined('DOING_CRON') && DOING_CRON) ) {
	exit; // Exit if accessed directly.
}

// This determines if script/style tags should be loaded to point to client/dist or webpack dev server
// If this is true, `yarn dev` must be running from within the client directory
define('AA_SEARCH_DEVELOPMENT', (defined('LOCALHOST') && LOCALHOST === true));

define('AA_SEARCH_PLUGIN_DIR', plugin_dir_path(__FILE__));

require 'vendor/autoload.php';
require 'config.php';
require 'helpers/string.php';
require 'classes/index.php';
require 'indexer/index.php';
require 'hooks/index.php';
require 'admin/index.php';
require 'auth.php';
require 'shortcode.php';
require 'vc/vc_map.php';

class AASearch {
	private static $instance = null;
	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
		}
		return self::$instance;
	}
	private function __construct() {
		$this->index = indexer\get_indexer();
		$this->options = get_option('aa_search_option');
		$this->hooks = new hooks\Hooks($this->index, $this->options);
		$this->ajax = new admin\Ajax($this->index);
	}
}

add_action('init', function() {
	AASearch::get_instance();
});