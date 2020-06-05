<?php

function debug_this($text)
{
    echo('<script>console.log(' . $text . ');</script>');
}

function valid_email($str) {
    return (!preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $str)) ? FALSE : TRUE;
}

// Adding for future use.
function createContact($user_id, $fields)
{
    $swoogo_key = get_field('swoogo_key', 'option');
    $swoogo_secret = get_field('swoogo_secret', 'option');
    $api = new SwoogoApi($swoogo_key, $swoogo_secret);
    $response = $api->request('https://www.swoogo.com/api/v1/contacts/create.json', $fields, 'post');
    $data = json_decode($response);
    echo("<script>console.log('" . $response . "');</script>");
    if (property_exists($data, 'id')) {
        $swoogo_id = $data->id;
        update_user_meta($user_id, "swoogo_id", $swoogo_id);
        return $swoogo_id;
    } else {
        //what do do with errors
        echo("<script>console.log('" . $response . "');</script>");
        return -1;
    }
}

add_shortcode('swoogo_link', function ($args) {

    $debug_info = "";
    $swoogo_key = get_field('swoogo_key', 'option');
    $swoogo_secret = get_field('swoogo_secret', 'option');
    $api = new SwoogoApi($swoogo_key, $swoogo_secret);
    $event_id = $args['event_id'];
    $reg_type_id = $args['reg_type_id'];
    $button_text = $args['button_text'] ? $args['button_text'] : "Register";
    $thanks_text = $args['thanks_text'] ? $args['thanks_text'] : "Thanks for Registering";
    $error_text = $args['error_text'] ? $args['error_text'] : "There seems to be some issue. Please contact support at <a href='mailto:registration@agilealliance.org'>registration@agilealliance.org</a>";

    $error_class = $args['error_text'] ? $args['error_text'] : "";
    $register_class = $args['register_class'] ? $args['register_class'] : "";
    $button_class = $args['button_class'] ? $args['button_class'] : "";
    $thanks_class = $args['thanks_class'] ? $args['thanks_class'] : "";

    $testing = $args['testing'] ? true : false;

    //die (json_encode($args) . ' '.  $register_class);

    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        $user = get_user_by('id', $user_id);
        $user_data = get_user_meta($user_id); // does not return roles, but has first name/last name
        $email = $user->user_email;
        $first_name = $user_data['first_name'] ? $user_data['first_name'][0] : "";
        $last_name = $user_data['last_name'] ? $user_data['last_name'][0] : "";
        $company = $user_data['mepr_company'] ? $user_data['mepr_company'][0] : "";
        $job_title = $user_data['mepr_title'] ? $user_data['mepr_title'][0] : "";
        $work_phone = $user_data['mepr_telephone'] ? $user_data['mepr_telephone'][0] : "";
        $mobile_phone = $user_data['mepr_telephone'] ? $user_data['mepr_telephone'][0] : "";
        // Check to see if the phone is too long
        if (strlen($work_phone) > 10) {
            $work_phone = '';
        }
        if (strlen($mobile_phone) > 10) {
            $mobile_phone = '';
        }
        $twitter_handle = $user_data['mepr_twitter'] ? $user_data['mepr_twitter'][0] : "";
        // check to see if twitter handle is too long, if it is remove that and let them enter it themselves.
        if (strlen($twitter_handle) > 18) {
            //$twitter_handle = substr($twitter_handle, -18);
            $twitter_handle = "";
        }
        $bio = $user_data['mepr_bio'] ? $user_data['mepr_bio'][0] : "";

        $fields = array(
            'email' => $email,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'company' => $company,
            'job_title' => $job_title,
            'work_phone' => $work_phone,
            'mobile_phone' => $mobile_phone,
            'twitter_handle' => $twitter_handle,
            'bio' => $bio,
            'reference' => $user_id
        );
        if (!valid_email($email)) {
            unset($fields['email']);
        }
        $highest_role = getHighestRole();
        //logged in. Anyone other than subscribers..
        if ($highest_role == 'subscriber') {
            // Don't add the req type and let them pick
        } else {
            $fields['reg_type_id'] = $reg_type_id;
        }
        $response = $api->request('https://www.swoogo.com/api/v1/registrants/token.json', array(
            'event_id' => $event_id,
            'fields' => $fields,
        ), 'post');
        $data = json_decode($response);
        if ($testing) {
            $debug_info .= '<div>' . $event_id . '<br/>' . $reg_type_id . '<br/>' . json_encode($fields) . '<br/>' . json_encode($data) . '<br/></div>';
        }
        if ($data->errors) {
            debug_this($response);
            if ($data->errors->email) {
                return $debug_info . '<div class="' . $thanks_class . '">' . $thanks_text . '</div>';
            } else {
                return $debug_info . '<div class="' . $error_class . '">' . $error_text . '</div>';
            }
        } else {
            $url = $data->url;
            return $debug_info . '<div class="' . $register_class . '"><a class="' . $button_class . '" href=' . $url . '>' . $button_text . '</a></div>';
        }

    } else {
        $response = $api->request('https://www.swoogo.com/api/v1/registrants/token.json', array(
            'event_id' => $event_id), 'post');
        if ($testing) {
            $debug_info .= '<div>' . $response . '<br/></div>';
        }
        $data = json_decode($response);
        return $debug_info . '<div class="' . $register_class . '"><a class="' . $button_class . '" href=' . $data->url . '>' . $button_text . '</a></div>';
    }

});
