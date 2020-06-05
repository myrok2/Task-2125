<?php

function render_protected($content, $unauth = '') {
    $postProtected = isPostProtected();
    $ruleIds = false;
    //Wrap protected content in the memberpress shortcode:
    if ($postProtected == 'member') {
        $ruleIds  = get_field('member_rule_ids', 'option') ?: '8049253';
    } else if ($postProtected == 'subscriber') {
        $ruleIds  = get_field('subscriber_rule_ids', 'option') ?: '8049252';
    }
    if ($ruleIds) {
        echo do_shortcode('[mepr-active rules="' . $ruleIds . '" ifallowed="hide"]' . $unauth . '[/mepr-active]');
        echo do_shortcode('[mepr-active rules="' . $ruleIds . '" ifallowed="show"]' . $content . '[/mepr-active]');
    } else {
        return  do_shortcode($content);
    }
}

