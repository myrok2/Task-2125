<?php
namespace aa\search\hooks;
use aa\search\hooks\{posts,template_include};

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require 'posts.php';
require 'template_include.php';

class Hooks {
	function __construct($indexer, $options) {
		$this->post_hooks = new posts\AASearchPostHooks($indexer);
		$this->template_include = new template_include\AASearchTemplateInclude($options);
	}
}