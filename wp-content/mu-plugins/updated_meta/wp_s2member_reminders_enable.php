<?php

/*
 * Set the initial toggle for EOT reminders to ON
 */

add_filter('insert_user_meta', function($meta, $user, $update){
    if (!$update) {
        $meta['wp_s2member_reminders_enable'] = 1;
    }
    return $meta;
}, 100, 3);