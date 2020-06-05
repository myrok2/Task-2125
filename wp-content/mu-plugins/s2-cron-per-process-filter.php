<?php

add_filter('ws_plugin__s2member_pro_eot_reminders_per_process', function($current, $vars){
    return 100;
}, 0, 2);