<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchBook extends AASearchDocument {
	function get_related_users() {
		return $this->get_p2p_connected_users('user_to_book_author');
	}
}