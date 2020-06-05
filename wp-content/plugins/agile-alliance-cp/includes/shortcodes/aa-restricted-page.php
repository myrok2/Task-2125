<?php

add_shortcode('aa_restricted_page_detail', function($atts){
    $seeking_post = null;

    if (count($atts) > 0) {
        if ($atts && $_REQUEST['_s2member_seeking'] && $_REQUEST['_s2member_seeking']['post']) {
            $seeking_post = get_post($_REQUEST['_s2member_seeking']['post']);
            $seeking_post = object_to_array($seeking_post);
        }
        if ($atts && $_REQUEST['_s2member_seeking'] && $_REQUEST['_s2member_seeking']['page']) {
            $seeking_post = get_post($_REQUEST['_s2member_seeking']['page']);
            $seeking_post = object_to_array($seeking_post);
        }
        $property = $atts[0];
        if ($seeking_post && $seeking_post[$property]) {
           return $seeking_post[$property];
        } else if (count($atts) > 1) {
            return implode(' ', array_slice($atts, 1));
        }
    }
    return '';
});

add_shortcode('aa_restricted_to', function($atts = [], $content = null){
    if ($_REQUEST['s2member_level_req'] == $atts[0]) {
        return do_shortcode($content);
    }
    return '';
});

function object_to_array($obj) {
    if(is_object($obj)) $obj = (array) $obj;
    if(is_array($obj)) {
        $new = array();
        foreach($obj as $key => $val) {
            $new[$key] = object_to_array($val);
        }
    }
    else $new = $obj;
    return $new;
}

