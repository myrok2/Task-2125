<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchPage extends AASearchDocument {
	function get_related_users() {
		return [];
	}
}