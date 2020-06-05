<?php
/**
 * Agile-Alliance Sage includes
 *
 * The $sage_includes array determines the code library included in your theme.
 * Add or remove files to the array as needed. Supports child theme overrides.
 *
 * Please note that missing files will produce a fatal error.
 *
 * @link https://github.com/roots/sage/pull/1042
 */
$sage_includes = [
  'lib/utils.php',                 // Utility functions
  'lib/init.php',                  // Initial theme setup and constants
  'lib/wrapper.php',               // Theme wrapper class
  'lib/conditional-tag-check.php', // ConditionalTagCheck class
  'lib/config.php',                // Configuration
  'lib/assets.php',                // Scripts and stylesheets
  'lib/titles.php',                // Page titles
  'lib/extras.php',                // Custom functions
  'lib/bootstrap-nav-walker.php',  // Bootstrap Compatible Navigation Walker
  'lib/acf.php',                   // ACF Options Pages
];

foreach ($sage_includes as $file) {
  if (!$filepath = locate_template($file)) {
    trigger_error(sprintf(__('Error locating %s for inclusion', 'sage'), $file), E_USER_ERROR);
  }

  require_once $filepath;
}
unset($file, $filepath);

/**
 * Require a custom tft (tft = 352 = three five two) library
 * This library currently contains the following classes;
 * Debug, Registartion, Sanitization, String, S2Helper
 **/
require_once('lib/tft/lib.php');

// Limits the posts per page on the Search Results view
add_filter('post_limits', 'postsperpage');
function postsperpage($limits) {
  if (is_search()) {
    global $wp_query;
    $wp_query->query_vars['posts_per_page'] = 6;
  }
  return $limits;
}

/**
 * Add a error message if login fails
 **/
add_action('login_errors', 'show_my_msg');
function show_my_msg($errors) {
  if($_GET['action'] === 'lostpassword') {
    $message = "<b>Username or Email is not vaild.</b>";
  } else {
    $message = "<b>Username or Password is not vaild.</b>";
  }
  return $message;
}

function my_acf_init() {
  acf_update_setting('google_api_key', 'AIzaSyDlYZZKAjEMb7Y2BGMh4u033A08HMKLLfY');
}

add_action('acf/init', 'my_acf_init');

/**
 * Visual Composer Developer Tweaks / Config
 * VC Requires these to be in the themes main functions.php sadly
 */

// Make sure VC is activated - else the site will crash
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

// check for plugin using plugin name
if ( is_plugin_active( 'js_composer/js_composer.php' ) ) {
  // If plugin active - enable our tweaks (else the site crashes)

  // Disable VC Update & Register Nags
  add_action( 'vc_before_init', 'agilealliance_vcSetAsTheme' );
  function agilealliance_vcSetAsTheme() {
    vc_set_as_theme( $disable_updater = false );
  }

  // Disable Front End Editor
  function vc_remove_frontend_links() {
    vc_disable_frontend();
  }
  add_action( 'vc_after_init', 'vc_remove_frontend_links' );

  // Disable 'Edit with Visual Composer' links
  function vc_remove_wp_admin_bar_button() {
    remove_action( 'admin_bar_menu', array( vc_frontend_editor(), 'adminBarEditLink' ), 1000 );
  }
  add_action( 'vc_after_init', 'vc_remove_wp_admin_bar_button' );

}

/*
 *  Remove query strings from static resources
 */
function _remove_query_strings_1( $src ){
  $rqs = explode( '?ver', $src );
  return $rqs[0];
}
if ( is_admin() ) {
  // Remove query strings from static resources disabled in admin
}

else {
  add_filter( 'script_loader_src', '_remove_query_strings_1', 15, 1 );
  add_filter( 'style_loader_src', '_remove_query_strings_1', 15, 1 );
}

function _remove_query_strings_2( $src ){
  $rqs = explode( '&ver', $src );
  return $rqs[0];
}
if ( is_admin() ) {
  // Remove query strings from static resources disabled in admin
}

else {
  add_filter( 'script_loader_src', '_remove_query_strings_2', 15, 1 );
  add_filter( 'style_loader_src', '_remove_query_strings_2', 15, 1 );
}

/**
 * Override for Visual Composer / Yoast conflict
 * - This has to do with the VC Templates Panel javascript bug
 * - that prevents the hide/show action.
 */
//  function vc_template_panel_trigger_override() {
//    wp_enqueue_script( 'vc-template-panel-trigger-override', get_template_directory_uri() . '/vc-template-panel-trigger-override.js', array(), '1.0.0', true );
//  }
//  add_action( 'admin_enqueue_scripts', 'vc_template_panel_trigger_override' );

/**
 * Add checkbox to pages in order to conditionally display social share buttons in `base.php`
 */
if( function_exists('acf_add_local_field_group') ):

  acf_add_local_field_group(array (
    'key' => 'group_573a4641c15bc',
    'title' => 'SEO/Social Options',
    'fields' => array (
      array (
        'key' => 'field_573a4774f38e1',
        'label' => 'Show social share buttons',
        'name' => 'show_social_share_buttons',
        'type' => 'true_false',
        'instructions' => '',
        'required' => 0,
        'conditional_logic' => 0,
        'wrapper' => array (
          'width' => '',
          'class' => '',
          'id' => '',
        ),
        'message' => '',
        'default_value' => 0,
      ),
    ),
    'location' => array (
      array (
        array (
          'param' => 'post_type',
          'operator' => '==',
          'value' => 'page',
        ),
      ),
    ),
    'menu_order' => 0,
    'position' => 'side',
    'style' => 'default',
    'label_placement' => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen' => '',
    'active' => 1,
    'description' => '',
  ));

endif;

/**
 * Force an absolute URL for meta tags. The plugin Soil attempts to force all WP generated
 * URLs to be relative. This is cool but it breaks og:image and similar tags as they must
 * be fully absolute URLs. Disabling the relative URL feature breaks other parts of the
 * site that have been developed to expect relative paths. This seems to be an appropriate
 * fix for the situation.
 */
add_filter('aiosp_opengraph_meta', function($filtered_value, $t, $k){
  if ($k === 'thumbnail') {
    if (substr($filtered_value, 0, 1) === '/') {
      return site_url($filtered_value);
    }
  }
  return $filtered_value;
}, 3, 100);

/**
 * Return tags for all CPTs
 */
add_filter('pre_get_posts', 'query_post_type');
function query_post_type($query) {
  $post_types = get_post_types();
  if(is_category() || is_tag()) {
    $post_type = get_query_var('post_type');
    if($post_type)
      $post_type = $post_type;
    else
      $post_type = $post_types; // replace cpt to your custom post type
    $query->set('post_type',$post_type);
    return $query;
  }
}
add_filter('autoptimize_filter_noptimize','pagebuilder_noptimize',10,0);
function pagebuilder_noptimize() {
  if (current_user_can('edit_posts')) {
    return true;
  } else {
    return false;
  }
}

function myfeed_request($qv) {
  if (isset($qv['feed']) && !isset($qv['post_type']))
    $qv['post_type'] = array('post', 'aa_book', 'aa_event_session', 'aa_experience_report', 'aa_glossary', 'aa_initiative', 'aa_research_paper', 'aa_story', 'aa_video', 'aa_podcast');
  return $qv;
}
add_filter('request', 'myfeed_request');


/**
 * Show all parents, regardless of post status.
 *
 * @param   array  $args  Original get_pages() $args.
 *
 * @return  array  $args  Args set to also include posts with pending, draft, and private status.
 */
function my_slug_show_all_parents( $args ) {
  $args['post_status'] = array( 'publish', 'pending', 'draft', 'private' );
  return $args;
}
add_filter( 'page_attributes_dropdown_pages_args', 'my_slug_show_all_parents' );
add_filter( 'quick_edit_dropdown_pages_args', 'my_slug_show_all_parents' );

// disable wordpress canonical URL redirect - this is to allow sucuri firewall to cache site w/o being redirected
remove_filter('template_redirect', 'redirect_canonical');


if (!function_exists('get_meta_value')) :
  function get_meta_value($value) {
    if ( is_array($value) ) {
      return $value[0];
    }
    else return $value;
  }
endif;

  if (!function_exists('get_user_field')) :
  function get_user_field($field_id = '', $user_id = 0, $args = array())
  {
    global $wpdb; /** @var wpdb $wpdb Reference for IDEs. */
    $current_user = wp_get_current_user(); // Current user.
    if(is_object($user = $user_id ? new WP_User($user_id) : $current_user)
      && !empty($user->ID) && ($user_id = $user->ID))
    {
      $user_meta = get_user_meta($user->ID);
      $args = (array)$args; // Force array.
      if(isset($user->{$field_id}))
        return $user->{$field_id};

      else if(isset($user->data->{$field_id}))
        return $user->data->{$field_id};

      else if(isset($user->{$wpdb->prefix.$field_id}))
        return $user->{$wpdb->prefix.$field_id};

      else if(isset($user->data->{$wpdb->prefix.$field_id}))
        return $user->data->{$wpdb->prefix.$field_id};

      else if(strcasecmp($field_id, 'full_name') === 0)
        return trim($user->first_name.' '.$user->last_name);

      else if(preg_match('/^(?:email|user_email)$/i', $field_id))
        return $user->user_email;

      else if(preg_match('/^(?:login|user_login)$/i', $field_id))
        return $user->user_login;

      else if(preg_match('/^(?:s2member_)?registration_time$/i', $field_id))
        return $user->user_registered;

      else if(strcasecmp($field_id, 's2member_access_role') === 0)
        //return c_ws_plugin__s2member_user_access::user_access_role($user);
        //TODO: Find replacement
        return false;

      else if(strcasecmp($field_id, 's2member_access_level') === 0)
//                return c_ws_plugin__s2member_user_access::user_access_level($user);

        //TODO: Find replacement
        return false;
      else if(strcasecmp($field_id, 's2member_access_label') === 0)
//                return c_ws_plugin__s2member_user_access::user_access_label($user);

        //TODO: Find replacement
        return false;
      else if(strcasecmp($field_id, 's2member_access_ccaps') === 0)
//                return c_ws_plugin__s2member_user_access::user_access_ccaps($user);

        //TODO: Find replacement
        return false;
      else if(strcasecmp($field_id, 'ip') === 0 && !empty($current_user->ID) && $current_user->ID === $user_id)
//                return c_ws_plugin__s2member_utils_ip::current(); // Current IP address.

        //TODO: Find replacement
        return false;
      else if(strcasecmp($field_id, 's2member_registration_ip') === 0 || strcasecmp($field_id, 'reg_ip') === 0 || strcasecmp($field_id, 'ip') === 0)
        return get_user_option('s2member_registration_ip', $user_id);

      else if(strcasecmp($field_id, 's2member_subscr_or_wp_id') === 0)
        return ($subscr_id = get_user_option('s2member_subscr_id', $user_id)) ? $subscr_id : $user_id;

      else if(strcasecmp($field_id, 'avatar') === 0) // Avatar with a specific size?
        return get_avatar($user_id, !empty($args['size']) ? $args['size'] : 96);

      else if(is_array($fields = get_user_option('s2member_custom_fields', $user_id)))
      {
        $fieldMapping = [];
        $fieldMapping['country_code'] = 'mepr_country';
        $fieldMapping['company'] = 'mepr_company';
        $fieldMapping['title'] = 'mepr_title';
        $fieldMapping['telephone'] = 'mepr_telephone';
        $fieldMapping['full_bio'] = 'mepr_bio';
        $fieldMapping['short_bio'] = 'mepr_short_bio';
        $fieldMapping['twitter_handle'] = 'mepr_twitter';
        $fieldMapping['linkedin_url'] = 'mepr_linkedin';
        $fieldMapping['facebook_url'] = 'mepr_facebook';
        $fieldMapping['pinterest_url'] = 'mepr_pinterest';

        return get_meta_value($user_meta[$fieldMapping[$field_id]]);
//        $field_var = preg_replace('/[^a-z0-9]/i', '_', strtolower($field_id));
//        if(isset($fields[$field_var])) return $fields[$field_var];
      }
    }
    return FALSE; // Otherwise, return false.
  }
endif;

//function register_template_options_page() {
//  add_options_page('Template Mapping', 'Template Mapping', 'manage_options', 'templateoptions');
//}
//add_action('admin_menu', 'register_template_options_page');
//function register_memberpress_options_page() {
//  add_options_page('Memberpress Mapping', 'Memberpress Mapping', 'manage_options', 'meprmappingoptions');
//}
//add_action('admin_menu', 'register_memberpress_options_page');

if ($_SERVER['QUERY_STRING']) {
  $queries = array();
  parse_str($_SERVER['QUERY_STRING'], $queries);
  $qs_name = "redirect_id";
  if ($queries[$qs_name]) {
    $url = get_permalink($queries[$qs_name]);
    setcookie('redirect_url', $url, 0, "/"); // expire when the close the browser
  }
}

function isPostProtected($postId = null) {
  $post_tags = get_the_tags($postId);
  $tagOrder = ['subscriber', 'member' ];
  $role_names = [];
  foreach( $post_tags as $tag ) {
    array_push($role_names, $tag->name);
  }
  foreach($tagOrder as $tag) {
    if (in_array($tag, $role_names)) {
      return $tag;
    };
  }
  return false;
}

add_shortcode('minimum-membership-required', function($args) {
  $membershipMinimum = isPostProtected();
  if ($membershipMinimum) {
    return ucfirst($membershipMinimum);
  }
  return '';

});
add_shortcode('excerpt', function($args) {
  return the_excerpt();
});

add_shortcode('minimum-membership-required', function($args) {
  $membershipMinimum = isPostProtected();
  if ($membershipMinimum) {
    return ucfirst($membershipMinimum);
  }
  return '';

});

function getHighestRole() {
  $user_id = get_current_user_id();
  $user_info = get_userdata( $user_id );
  $roleOrder = ['administrator', 'Administrator',
                'corporate', 'Corporate', 's2member_level2',
                'member', 'Member', 's2member_level1',
                'subscriber', 'Subscriber', 's2member_level0'];
  foreach($roleOrder as $role) {
    if (in_array($role, $user_info->roles)) {
      if ($role == 's2member_level2') {
        return 'corporate';
      }
      if ($role == 's2member_level1') {
        return 'member';
      }
      if ($role == 's2member_level0') {
        return 'subscriber';
      }
      return $role;
    };
  }
  return 'not logged in';
}

add_shortcode('membership-name', function($args) {

  return getHighestRole();

});

function getRoleNumericalValue($role) {
  switch (strtolower($role)) {
    case 'administrator':
      return 10;
    case 'corporate':
      return 5;
    case 'member':
      return 2;
    case 'subscriber':
      return 1;
    default:
      return 0;
  }
}

function isInRole($role) {
  $user_id = get_current_user_id();
  $user_info = get_userdata( $user_id );
  return in_array($role, $user_info->roles);
}

add_action( 'admin_footer', 'my_action_javascript' ); // Write our JS below here

add_action( 'admin_menu', 's2_to_mepr_menu' );

function s2_to_mepr_menu() {
  add_menu_page( 's2Member to MemberPress Converter', 'S2 to MEPR', 'manage_options', 'S2toMEPR/S2toMEPR-admin-page.php', 'S2toMEPR_admin_page', 'dashicons-tickets', 6  );
}

function S2toMEPR_admin_page() {
  global $wpdb;
  $query = "SELECT count(*) FROM {$wpdb->prefix}usermeta WHERE meta_key = 's2_mepr_migrate_done'";
  $count = $wpdb->get_var( $query);
  $query = "SELECT parent_email, org FROM corporate_accounts_sub where parent_email is not null group by parent_email, org";
  $emails = $wpdb->get_results( $query);
  $query = "SELECT  parent_email, org FROM corporate_inactive_accounts_sub where parent_email is not null group by parent_email, org";
  $inactive_emails = $wpdb->get_results( $query);
  if ($wpdb->last_error) {
    echo 'Error executing query: ' . $wpdb->last_error;
    die();
  }
  $display = '<div>
    <p>Status: <div id="status_message"></div></p>
    <p>Limit: <input type="number" id="limit" value="1000"></p><br/>
    <p>Skip: <input type="number" id="skip" value="' . $count . '"></p><br/>
    <button class="export-button">Convert</button>
    <h3>Active Corp Accounts</h3>
    <ol>';
  foreach($emails as $item) {
    $display .= '<li>' . $item->org . ' - ' . $item->parent_email .' - <button onclick="download_subs_file(\'' . $item->parent_email .'\')">Download</button></li>';
  }
  $display .= '</ol></div>';
  $display .= '<h3>Inctive Corp Accounts</h3><ol>';
  foreach($inactive_emails as $item) {
    $display .= '<li>' . $item->org . ' - ' . $item->parent_email .' - <button onclick="download_subs_file(\'' . $item->parent_email .'\')">Download</button></li>';
  }
  $display .= '</ol></div>';
  echo $display;
}



function my_action_javascript() { ?>
  <script type="text/javascript" >
    function download_subs_file(value) {
      var data = {
        'action': 'get_subs',
        'parent_email': value
      };

      // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
      jQuery.post(ajaxurl, data)
        .done(function(response){
          const users = JSON.parse(response);
          const csvValues = [];
          const allValues = [];
          let headerValues = ['username', 'email'];
          // users.forEach((u) => {
          //   headerValues = [...new Set([...headerValues, ...Object.keys(u)])];
          // });
          users.forEach((u) => {
            const clean_row = [];
            headerValues.forEach(key => {
              let value = '';
              if (u[key]) {
                if (!u[key].replace) {
                  value = u[key];

                } else {
                  value = u[key].replace(/,/ig, '\\,');
                }
              }
              clean_row.push(value);
              allValues.push(value);
            });
            csvValues.push(clean_row);
          });
          const rows = [headerValues, ...csvValues];
          let csvContent = "";
          rows.forEach(function(rowArray){
            let row = rowArray.join("\",\"");
            csvContent += "\"" + row + "\"\r\n";
          });
          csvData = new Blob([csvContent], { type: 'text/csv' });
          var csvUrl = URL.createObjectURL(csvData);
          var link = document.createElement("a");
          link.setAttribute("href", csvUrl);
          link.setAttribute("download", value + ".csv");
          link.innerText = 'DOWNLOAD USER CSV!';
          document.body.appendChild(link); // Required for FF

          link.click(); // This will download the data file named "my_data.csv".
        })
        .fail(function(xhr, status, error) {
          // error handling
          console.log(error);
        });
    }
    jQuery(document).ready(function($) {
      jQuery('.export-button').click(function() {
        jQuery('#status_message').text('Running....');
        var data = {
          'action': 'direct_upgrade',
          'limit': $('#limit').val(),
          'skip': $('#skip').val()
        };

        // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
        jQuery.post(ajaxurl, data, function(response) {
          // console.log(response);
          // const users = JSON.parse(response);
          // const csvValues = [];
          // const allValues = [];
          // const checkingValue = 'twitter_handle';
          // let headerValues = [];
          // users.forEach((u) => {
          //   headerValues = [...new Set([...headerValues, ...Object.keys(u)])];
          // });
          // console.log(headerValues);
          // users.forEach((u) => {
          //   const clean_row = [];
          //   headerValues.forEach(key => {
          //     let value = '';
          //     if (u[key]) {
          //       if (!u[key].replace) {
          //         value = u[key];
          //
          //       } else {
          //         value = u[key].replace(/,/ig, '\\,');
          //       }
          //     }
          //     clean_row.push(value);
          //     if (key === checkingValue) {
          //       allValues.push(value);
          //     }
          //   });
          //   csvValues.push(clean_row);
          // });
          // console.log([...new Set(allValues)]);
          // const rows = [headerValues, ...csvValues];
          // let csvContent = "";
          // rows.forEach(function(rowArray){
          //   let row = rowArray.join("\",\"");
          //   csvContent += "\"" + row + "\"\r\n";
          // });
          // console.log(csvContent);
          // csvData = new Blob([csvContent], { type: 'text/csv' });
          // var csvUrl = URL.createObjectURL(csvData);
          // var link = document.createElement("a");
          // link.setAttribute("href", csvUrl);
          // link.setAttribute("download", "my_data.csv");
          // link.innerText = 'DOWNLOAD USER CSV!';
          // document.body.appendChild(link); // Required for FF

          //link.click(); // This will download the data file named "my_data.csv".
          var skip = Number($('#skip').val());
          skip = skip + Number($('#limit').val());
          $('#skip').val(skip);
          jQuery('#status_message').text('Complete.');
          console.log('Complete.' + response);
        });
      });
    });
  </script> <?php
}

add_action( 'wp_ajax_get_subs', 'get_subs' );
function get_subs() {
  global $wpdb; // this is how you get access to the database
  $pemail = $_POST['parent_email'];
  $query = "SELECT * FROM corporate_accounts_sub WHERE parent_email = '{$pemail}'";
  $users_list = $wpdb->get_results( $query, ARRAY_A );
  echo json_encode($users_list);
  wp_die(); // this is required to terminate immediately and return a proper response
}

add_action( 'wp_ajax_direct_upgrade', 'direct_upgrade' );
function direct_upgrade() {
  global $wpdb; // this is how you get access to the database
  $limit = intval( $_POST['limit'] );
  $skip = intval( $_POST['skip'] );

  $fieldMapping = [];
  $fieldMapping['country_code'] = 'mepr_country';
  $fieldMapping['company'] = 'mepr_company';
  $fieldMapping['title'] = 'mepr_title';
  $fieldMapping['telephone'] = 'mepr_telephone';
  $fieldMapping['full_bio'] = 'mepr_bio';
  $fieldMapping['short_bio'] = 'mepr_short_bio';
  $fieldMapping['twitter_handle'] = 'mepr_twitter';
  $fieldMapping['linkedin_url'] = 'mepr_linkedin';
  $fieldMapping['facebook_url'] = 'mepr_facebook';
  $fieldMapping['pinterest_url'] = 'mepr_pinterest';
  if (!$skip) {
    $skip = 0;
  }
  $query = "SELECT * FROM {$wpdb->prefix}usermeta WHERE meta_key = 'wp_s2member_custom_fields' LIMIT {$skip}, {$limit}";
  $users_meta = $wpdb->get_results( $query, ARRAY_A );
  $output = 'Output: ';
  foreach ($users_meta as $user_meta) {
    $userdata = unserialize($user_meta['meta_value']);
    $output = $output . $user_meta['user_id'] . ', ';
    foreach ($userdata as $key => $value) {
      //echo "$key => $value\n";
      if ($fieldMapping[$key]) {
        add_user_meta($user_meta['user_id'], $fieldMapping[$key], $value);
        //$output .= 'Adding: ' . $user_meta['user_id'] . ' ' . $fieldMapping[$key] . ' ' . $value . '\r\n';
      }
    }
    add_user_meta($user_meta['user_id'], 's2_mepr_migrate_done', 1);
  }

  echo $output;
  wp_die(); // this is required to terminate immediately and return a proper response
}

function login_customization () {
  echo
  '<style>' .
    '#login h1 a {' .
      'background-image:url(/wp-content/themes/agilealliance/assets/images/Agile_Alliance_Logo_Color.png);' .
      'width: auto;' .
      'height: 100px;' .
      'background-size: contain;' .
    '}' .
  '</style>';
  echo '<script>setTimeout(function () { jQuery("#login h1 a").attr("href", "https://pndev.xyz/").text(""); }, 1000);</script>';
}

add_action('login_head', login_customization);

/**
 * This is taken from the s2member library.
 */
function add_notes_to_user_profile (WP_User $user) {
  if (current_user_can('edit_user', $user->ID)) {
    echo '<h3>User Notes</h3>';
    echo '<tr>'."\n";
    echo '<th><label for="wp_s2member_notes">Administrative Notes:</label> <a href="#" onclick="alert(\'This is for Administrative purposes. You can keep a list of Notations about this account. These Notations are private; Users/Members will never see these.\'); return false;" tabindex="-1">[?]</a><br /><br /><small>These Notations are private; Users/Members will never see any of these notes.</small></th>'."\n";
    echo '<td><textarea name="wp_s2member_notes" id="wp_s2member_notes" rows="5" wrap="off" spellcheck="false" style="width:99%;">'.get_user_option("wp_s2member_notes", $user->ID).'</textarea></td>'."\n";
    echo '</tr>'."\n";
  }
}

add_action( 'edit_user_profile', 'add_notes_to_user_profile' );

function save_notes_to_user_proile ($userid) {
  if (!current_user_can('edit_user', $userId)) {
    return;
  }
  update_user_meta($userid, 'wp_s2member_notes', $_REQUEST['wp_s2member_notes']);
}

add_action('edit_user_profile_update', 'save_notes_to_user_proile');
if (!wp_next_scheduled('my_task_hook')) {
wp_schedule_event( time(), '1min', 'my_task_hook' );
}
//add_action ( 'init', 'my_task_function' );
function my_task_function() {
    global $wpdb;
    $table_name = $wpdb->prefix = 'transactions';
    $blogusers =  $wpdb->prepare("(
        SELECT GROUP_CONCAT(
                 DISTINCT t.product_id
                 ORDER BY t.product_id
                 SEPARATOR ','
               )
          FROM {$table_name} AS t
         WHERE t.user_id = u.ID
           AND (
             t.expires_at > %s
             OR t.expires_at = %s
             OR t.expires_at IS NULL
           )
           AND ( (
                t.txn_type IN (%s,%s,%s,%s)
                AND t.status=%s
             ) OR (
                t.txn_type=%s
                AND t.status=%s
             )
           )
      )");
      
    //dd_option('nadeem','value',1);
//echo 'I am a WordPress task. I will be called again tomorrow';
} 


add_filter( 'cron_schedules', 'example_add_cron_interval' );
function example_add_cron_interval( $schedules ) { 
    $schedules['five_seconds'] = array(
        'interval' => 5,
        'display'  => esc_html__( 'Every Five Seconds' ), );
    return $schedules;
}




add_action('save_post','save_post_callback');
function save_post_callback($post_id){
    global $post; 
     global $wpdb;
    if ($post->post_type != 'aa_organizations'){
        return;
    }
    $table = $wpdb->prefix . 'p2p';
    $old = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE p2p_to = $post->ID" ) );

$wpdb->query($wpdb->prepare("UPDATE $table SET p2p_from='$post->post_author' WHERE p2p_to=$post->ID"));
update_user_meta($old->p2p_from, 'aa_created_organization','0');
    //if you get here then it's your post type so do your thing....
}