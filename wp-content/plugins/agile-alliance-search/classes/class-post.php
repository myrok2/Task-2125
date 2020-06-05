<?php
namespace aa\search\document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AASearchPost extends AASearchDocument {
    function get_related_users() {
        $contributors = $this->get_p2p_connected_users([
            'user_to_post'
        ]);
        if (count($contributors) > 0) {
            $author = get_user_by('id', $this->document->post_author);
            array_unshift($contributors, $author->display_name);
            return $contributors;
        }
        $author = get_user_by('id', $this->document->post_author);
        return [
            $author->display_name,
        ];
    }
}
