<?php
/**
 * This class used to manage settings page in backend.
 * @author Flipper Code <hello@flippercode.com>
 * @version 4.0.0
 * @package Avatar
 */

$avatar_obj = new WPUA_Avatar();
$data = $avatar_obj->avatar_settings();

// Server upload size limit
$upload_size_limit = wp_max_upload_size();
// Convert to KB
if ( $upload_size_limit > 1024 ) {
	$upload_size_limit /= 1024;
}
$upload_size_limit_with_units = (int) $upload_size_limit.'KB';

// User upload size limit
if ( ( $wpua_user_upload_size_limit = $data['wp_user_avatar_upload_size_limit'] ) == 0 || $data['wp_user_avatar_upload_size_limit'] > wp_max_upload_size() ) {
	$wpua_user_upload_size_limit = wp_max_upload_size();
}
// Value in bytes
$wpua_upload_size_limit = $wpua_user_upload_size_limit;
// Convert to KB
if ( isset($wpua_user_upload_size_limit) && $wpua_user_upload_size_limit > 1024 ) {
	$wpua_user_upload_size_limit /= 1024;
}
$wpua_upload_size_limit_with_units = (int) $wpua_user_upload_size_limit.'KB';

// Check for custom image sizes
$all_sizes = array_merge( get_intermediate_image_sizes(), array( 'original' ) );

$form  = new FlipperCode_HTML_Markup();
$form->set_header( __( 'General Settings', WPUAP_TEXT_DOMAIN ), $response );
$form->add_element('checkbox','wp_user_avatar_upload_registration',array(
	'lable' => __( 'Display on Registration Page',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['wp_user_avatar_upload_registration'] ) and ! empty( $data['wp_user_avatar_upload_registration'] )) ? $data['wp_user_avatar_upload_registration'] : 0,
	'default_value' => 0,
	'desc' => __( 'Allow to upload Avatar at registration page',WPUAP_TEXT_DOMAIN ),
));

$form->add_element('checkbox','wp_user_avatar_hide_webcam',array(
	'lable' => __( 'Hide Webcam',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['wp_user_avatar_hide_webcam'] ) and ! empty( $data['wp_user_avatar_hide_webcam'] )) ? $data['wp_user_avatar_hide_webcam'] : 0,
	'default_value' => 0,
	'desc' => __( 'Hide webcam option on upload avatar window',WPUAP_TEXT_DOMAIN ),
));

$form->add_element('checkbox','wp_user_avatar_hide_mediamanager',array(
	'lable' => __( 'Hide Media',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['wp_user_avatar_hide_mediamanager'] ) and ! empty( $data['wp_user_avatar_hide_mediamanager'] )) ? $data['wp_user_avatar_hide_mediamanager'] : 0,
	'default_value' => 0,
	'desc' => __( 'Hide media manager option on upload avatar window',WPUAP_TEXT_DOMAIN ),
));

$form->add_element( 'group', 'WPUAP_avatar_directory', array(
	'value' => __( 'Avatar Settings', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-12">',
	'after' => '</div>',
));

$storage_options = array(
'media' => __( 'Media Uploader',WPUAP_TEXT_DOMAIN ),
'directory' => __( 'Custom Directory',WPUAP_TEXT_DOMAIN ),
'aws' => __( 'Amazon S3 Storage',WPUAP_TEXT_DOMAIN ),
'dropbox' => __( 'Dropbox Storage',WPUAP_TEXT_DOMAIN ),
);
$form->add_element( 'radio', 'avatar_storage_option', array(
	'lable' => __( 'Avatar Storage', WPUAP_TEXT_DOMAIN ),
	'radio-val-label' => $storage_options,
	'current' => $data['avatar_storage_option'],
	'class' => 'chkbox_class',
	'default_value' => 'media',
));


$form->add_element('text','wp_user_avatar_storage[directory]',array(
	'lable' => __( 'Folder Path',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['directory'],
	'desc' => __( 'Upload directory for Avatar. Default folder is wp-content/uploads/wp-user-avatar/ ', WPUAP_TEXT_DOMAIN ),
	'default_value' => 'wp-content/uploads/wp-user-avatar/',
	'show' => ($data['avatar_storage_option'] == 'directory') ? 'true': 'false',
	'before' => '<div class="col-md-8 wp_storage_directory">',
	'after' => '</div>',
));

$form->add_element('text','wp_user_avatar_storage[setting][aws][key]',array(
	'lable' => __( 'Access Key',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['setting']['aws']['key'],
	'desc' => __( 'Amazon Web Services Access Key. Follow instruction given <a href="http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html">here</a>. ', WPUAP_TEXT_DOMAIN ),
	'default_value' => '',
	'before' => '<div class="col-md-8 wp_storage_aws">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'aws') ? 'true': 'false',
));

$form->add_element('text','wp_user_avatar_storage[setting][aws][secret_key]',array(
	'lable' => __( 'Secret Key',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['setting']['aws']['secret_key'],
	'desc' => __( 'Amazon Web Services Secret Key. Follow instruction given <a href="http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html">here</a>.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '',
	'before' => '<div class="col-md-8 wp_storage_aws">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'aws') ? 'true': 'false',
));

$form->add_element('text','wp_user_avatar_storage[aws]',array(
	'lable' => __( 'Bucket Name',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['aws'],
	'desc' => __( 'Enter bucket name.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '',
	'before' => '<div class="col-md-8 wp_storage_aws">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'aws') ? 'true': 'false',
));

$form->add_element('html','wp_user_avatar_html',array(
	'html' => '<ul>
<li>'.__( 'Step 1 : Create a dropbox application <a target="_blank" href="https://www.dropbox.com/developers/apps/create">here </a>',WPUAP_TEXT_DOMAIN ).'</li>
<li>'.__( 'Step 2 : Go to your <a target="_blank" href="https://www.dropbox.com/developers/apps">application</a>',WPUAP_TEXT_DOMAIN ).'</li>
<li>'.__( 'Step 3 : Configure your application and get generated access token.',WPUAP_TEXT_DOMAIN ).'</li>
</ul>',
	'before' => '<div class="col-md-8 wp_storage_dropbox">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'dropbox') ? 'true': 'false',
));
$form->add_element('text','wp_user_avatar_storage[dropbox][access_token]',array(
	'lable' => __( 'Access Token',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['dropbox']['access_token'],
	'desc' => __( 'Dropbox app generated access token.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '',
	'before' => '<div class="col-md-8 wp_storage_dropbox">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'dropbox') ? 'true': 'false',
));


$form->add_element('text','wp_user_avatar_storage[dropbox][upload_path]',array(
	'lable' => __( 'Folder Name',WPUAP_TEXT_DOMAIN ),
	'value' => @$data['wp_user_avatar_storage']['dropbox']['upload_path'],
	'desc' => __( 'Enter for folder name where to upload avatar. Leave empty to upload in app root.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '',
	'before' => '<div class="col-md-8 wp_storage_dropbox">',
	'after' => '</div>',
	'show' => ($data['avatar_storage_option'] == 'dropbox') ? 'true': 'false',
));


$form->add_element('text','wp_user_avatar_upload_size_limit',array(
	'lable' => __( 'Upload File Size',WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_upload_size_limit'],
	'desc' => sprintf(__('Maximum upload file size: %d%s.',WPUAP_TEXT_DOMAIN), esc_html(wp_max_upload_size()), esc_html(' bytes ('.format_size_units(wp_max_upload_size()).')')),
	'default_value' => wp_max_upload_size(),
));


$form->add_element('text','wp_user_avatar_upload_size_width',array(
	'lable' => __( 'Upload File Width',WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_upload_size_width'],
	'desc' => __('Maximum upload file width. Leave it blank for no limit.',WPUAP_TEXT_DOMAIN),
));

$form->add_element('text','wp_user_avatar_upload_size_height',array(
	'lable' => __( 'Upload File Height',WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_upload_size_height'],
	'desc' => __('Maximum upload file height. Leave it blank for no limit.',WPUAP_TEXT_DOMAIN),
));



$form->set_col( 2 );
$form->add_element('text','wp_user_avatar_thumbnail_w',array(
	'lable' => __( 'Avatar Width',WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_thumbnail_w'],
	'desc' => __( 'Avatar width in pixels.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '150',
));

$form->add_element('text','wp_user_avatar_thumbnail_h',array(
	'lable' => __( 'Avatar Height',WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_thumbnail_h'],
	'desc' => __( 'Avatar height in pixels.', WPUAP_TEXT_DOMAIN ),
	'default_value' => '150',
));
$form->set_col( 1 );

$form->add_element('checkbox','wp_user_avatar_resize_upload',array(
	'lable' => __( 'Resize avatars on upload',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['wp_user_avatar_resize_upload'] ) and ! empty( $data['wp_user_avatar_resize_upload'] )) ? $data['wp_user_avatar_resize_upload'] : 0,
	'default_value' => 0,
	'desc' => __( 'Check if resize your cropped image to fit the above width and height.',WPUAP_TEXT_DOMAIN ),
));

$form->add_element('checkbox','show_avatars',array(
	'lable' => __( 'Show Avatar',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['show_avatars'] ) and ! empty( $data['show_avatars'] )) ? $data['show_avatars'] : '',
	'default_value' => 1,
	'desc' => __( 'Uncheck to hide the avatar.',WPUAP_TEXT_DOMAIN ),
));

// avatar_default
$avatar_defaults = array(
'wp_user_avatar' => '<div id="wpua-preview"><img src="'.$data['default_avatar_url'].'" width="32" id="wp-user-avatar-img"></div> '.__( 'WP User Avatar',WPUAP_TEXT_DOMAIN ).'<button type="button" data-target="wp-user-avatar-img" data-source="wp-user-avatar" class="button ci_choose_image" data-ip-modal="#default_avatarModal" name="wpua-add" data-avatar_default="true" data-title="'.__( 'Choose Image: Default Avatar',WPUAP_TEXT_DOMAIN ).'">'.__( 'Choose Image',WPUAP_TEXT_DOMAIN ).'</button>',
'mystery' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&d=mm&r=g&forcedefault=1" /> '.__( 'Mystery Man',WPUAP_TEXT_DOMAIN ),
'blank' => ''.__( 'Blank',WPUAP_TEXT_DOMAIN ),
'gravatar_default' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&r=g&forcedefault=1" /> '.__( 'Gravatar Logo',WPUAP_TEXT_DOMAIN ),
'identicon' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&d=identicon&r=g&forcedefault=1" /> '.__( 'Identicon',WPUAP_TEXT_DOMAIN ),
'wavatar' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&d=wavatar&r=g&forcedefault=1" /> '.__( 'Wavatar',WPUAP_TEXT_DOMAIN ),
'monsterid' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&d=monsterid&r=g&forcedefault=1" /> '.__( 'MonsterID',WPUAP_TEXT_DOMAIN ),
'retro' => '<img src="http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=32&d=retro&r=g&forcedefault=1" /> '.__( 'Retro',WPUAP_TEXT_DOMAIN ),
);

$form->add_element( 'radio', 'avatar_default', array(
	'lable' => __( 'Default Avatar', WPUAP_TEXT_DOMAIN ),
	'radio-val-label' => $avatar_defaults,
	'current' => $data['avatar_default'],
	'class' => 'chkbox_class',
	'default_value' => 'mystery',
	'vertical' => 'true',
));




$form->add_element( 'group', 'WPUAP_avatar_gravatar', array(
	'value' => __( 'Gravatar Setting', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-12">',
	'after' => '</div>',
));


$form->add_element('checkbox','wp_user_avatar_disable_gravatar',array(
	'lable' => __( 'Disable Gravatar',WPUAP_TEXT_DOMAIN ),
	'value' => 1,
	'current' => (isset( $data['wp_user_avatar_disable_gravatar'] ) and ! empty( $data['wp_user_avatar_disable_gravatar'] )) ? $data['wp_user_avatar_disable_gravatar'] : 0,
	'default_value' => 0,
	'desc' => __( 'Disable Gravatar and use only local avatars',WPUAP_TEXT_DOMAIN ),
));


$ratings = array(
'G' => __( 'G — Suitable for all audiences',WPUAP_TEXT_DOMAIN ),
'PG' => __( 'PG — Possibly offensive, usually for audiences 13 and above',WPUAP_TEXT_DOMAIN ),
'R' => __( 'R — Intended for adult audiences above 17',WPUAP_TEXT_DOMAIN ),
'X' => __( 'X — Even more mature than above',WPUAP_TEXT_DOMAIN ),
);
$form->add_element( 'radio', 'avatar_rating', array(
	'lable' => __( 'Maximum Rating', WPUAP_TEXT_DOMAIN ),
	'radio-val-label' => $ratings,
	'current' => $data['avatar_rating'],
	'class' => 'chkbox_class',
	'default_value' => 'mystery',
	'vertical' => 'true',
));

$form->add_element( 'group', 'WPUAP_avatar_display', array(
	'value' => __( 'Apperance Settings', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-12">',
	'after' => '</div>',
));

$form->add_element( 'text', 'wp_user_avatar_settings[theme_color]', array(
	'lable' => __( 'Editor Theme', WPUAP_TEXT_DOMAIN ),
	'value' => $data['wp_user_avatar_settings']['theme_color'],
	'class' => 'color {pickerClosable:true} form-control',
	'desc' => __( 'Choose color for the icons and modal window.', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-2">',
	'default_value' => '#0073AA',
	'after' => '</div>',
));

$form->add_element( 'group', 'WPUAP_avatar_overlays', array(
	'value' => __( 'Advanced Settings', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-12">',
	'after' => '</div>',
));


$form->set_col(1);
$form->add_element( 'checkbox', 'wp_user_avatar_settings[link_profile]', array(
	'lable' => __( 'Add Link to Profile Image', WPUAP_TEXT_DOMAIN ),
	'value' => 'true',
	'current' => isset($data['wp_user_avatar_settings']['link_profile']) ? $data['wp_user_avatar_settings']['link_profile']: '',
	'desc' => __( 'Add a link to user profile.', WPUAP_TEXT_DOMAIN ),
	'class' => 'chkbox_class switch_onoff',
	'data' => array( 'target' => '.avatar_link_setting' ),
));

$form->add_element( 'text', 'wp_user_avatar_settings[link_url]', array(
	'lable' => __('Profile Link', WPUAP_TEXT_DOMAIN),
	'value' => isset($data['wp_user_avatar_settings']['link_url']) ? $data['wp_user_avatar_settings']['link_url']: '',
	'class' => '  form-control avatar_link_setting',
	'desc' => __( 'Use {website_url} or custom link eg. http://www.flippercode.com', WPUAP_TEXT_DOMAIN ),
	'before' => '<div class="col-md-6">',
	'show' => 'false',
	'after' => '</div>',
));

$form->add_element('submit','WPUAP_save_settings',array(
	'value' => __( 'Save Setting',WPUAP_TEXT_DOMAIN ),
));

$form->add_element('hidden','avatar_default_wp_user_avatar',array(
	'value' => $data['avatar_default_wp_user_avatar'],
	'id' => 'wp-user-avatar-url',
));
$form->add_element('hidden','wpua_mustache_url',array(
	'value' => '',
));

$form->add_element('hidden','operation',array(
	'value' => 'save',
));
$form->add_element('hidden','page_options',array(
	'value' => 'WPUAP_api_key,WPUAP_scripts_place',
));
$form->render();
