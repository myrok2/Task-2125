<?php

add_shortcode('qs', function($args) {
    if (isset($args['param'])) {
        return  'value_'. filter_input(INPUT_GET, $args['param'], FILTER_SANITIZE_STRING);
    }
});

function fix_pricing_links($content) {
    //grab the redirect ID from the query string
    $redirect_id = filter_input(INPUT_GET, 'redirect_id', FILTER_SANITIZE_NUMBER_INT);
    if (!$redirect_id && $_REQUEST["_s2member_vars"]) {
        $member_vars = explode("..", $_REQUEST["_s2member_vars"]);
        list($restriction_type, $requirement_type, $requirement_type_value, $seeking_type, $seeking_type_value, $seeking_uri) = $member_vars;
        $redirect_id = $seeking_type_value;
    }
    if (!$redirect_id) {
        $redirect_id = get_the_ID();
    }
    // Only matches urls with a selection
    $pattern = '/(rt\=Member)|(rt\=Corporate\+Membership)|(rt=\Subscriber)/';

    // now run the pattern and callback function on content
    // and process it through a function that appends redirect_id={id} to the query string on the url
    $content = preg_replace_callback($pattern, function ($matches) use ($redirect_id) {
        return $matches[0] . '&redirect_id=' . $redirect_id;
    }, $content);
    return $content;
}

add_filter('the_content', 'fix_pricing_links', 99);

function convertS2CodeToNumericalValue($s2role) {
        switch (strtolower($s2role)) {
            case 'administrator':
                return 10;
            case 's2member_level2':
            case 'access_s2member_level2':
                return 5;
            case 'member':
            case 's2member_level1':
            case 'access_s2member_level1':
                return 2;
            case 'subscriber':
            case 's2member_level0':
            case 'access_s2member_level0':
                return 1;
            default:
                return 0;
        }
    }

function if_shortcode($args, $content) {
    $theCheck = $args[0];
    $comparison = true;
    $params = 'no params';
    if (!$theCheck[0]) {
        echo '';
        return;
    }
    if ($theCheck[0] == '!') {
        $comparison = false;
        $theCheck = substr($theCheck, 1);
    }
    $indexOfParameters = strpos($theCheck, '(');
    $indexOfParametersEnd = strpos($theCheck, ')');
    $functionCalled = substr($theCheck, 0, $indexOfParameters);
    if ($indexOfParameters + 1 < $indexOfParametersEnd) {
        $params = substr($theCheck, $indexOfParameters  + 1, $indexOfParametersEnd - $indexOfParameters  - 1);
    }
    switch ($functionCalled) {
        case 'current_user_can':
            //[s2If !current_user_can(access_s2member_level1)]
            //[s2If !current_user_can(access_s2member_level0)]
            $highestRole = getRoleNumericalValue(getHighestRole());
            $s2Role = convertS2CodeToNumericalValue($params);
            if ($highestRole >= $s2Role) {
                $decision = true;
            } else {
                $decision = false;
            }
            break;
        case 'current_user_is':
            //[s2If current_user_is(s2member_level2)]
            //[s2If current_user_is(administrator)]
            //[s2If current_user_is(s2member_level0)]
            //[s2If current_user_is(subscriber)]
            $highestRole = getRoleNumericalValue(getHighestRole());
            $s2Role = convertS2CodeToNumericalValue($params);
            if ($highestRole == $s2Role) {
                $decision = true;
            } else {
                $decision = false;
            }
            break;
        case 'is_user_logged_in':
            //[s2If is_user_logged_in()]
            //[s2If !is_user_logged_in()]
            if (is_user_logged_in()) {
                $decision = true;
            } else {
                $decision = false;
            }
            break;
        case 'is_user_logged_out':
            if (is_user_logged_in()) {
                $decision = false;
            } else {
                $decision = true;
            }
            break;
        default:
            $decision = false;
    }

    //echo '<h2>' . $args[0] . ' = ('.  $comparison . ') (' . $decision . ')</h2>';
    if ($comparison == $decision) {
        return do_shortcode($content);
    } else {
        return '';
    }
}

add_shortcode('s2if', 'if_shortcode');
add_shortcode('s2If', 'if_shortcode');
