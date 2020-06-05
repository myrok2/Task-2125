<?php
/*
Plugin Name: MemberPress Math CAPTCHA
Plugin URI: http://memberpress.com
Description: Shows a Math question on the signup forms to prevent bots from signing up SPAM accounts.
Version: 1.1.4
Author: Caseproof, LLC
Author URI: http://caseproof.com
Text Domain: memberpress-math-captcha
Copyright: 2004-2014, Caseproof, LLC
*/

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

include_once(ABSPATH . 'wp-admin/includes/plugin.php');

if(is_plugin_active('memberpress/memberpress.php')) {
  function mpmath_plugin_info($field) {
    static $plugin_folder, $plugin_file;

    if(!isset($plugin_folder) or !isset($plugin_file)) {
      if(!function_exists('get_plugins'))
        require_once(ABSPATH . '/wp-admin/includes/plugin.php');

      $plugin_folder = get_plugins('/' . plugin_basename(dirname(__FILE__)));
      $plugin_file = basename((__FILE__));
    }

    if(isset($plugin_folder[$plugin_file][$field]))
      return $plugin_folder[$plugin_file][$field];

    return '';
  }

  define('MPMATH_VERSION', mpmath_plugin_info('Version'));
  define('MPMATH_PLUGIN_SLUG', plugin_basename(__FILE__));
  define('MPMATH_PLUGIN_NAME', dirname(MPMATH_PLUGIN_SLUG));
  define('MPMATH_PATH', WP_PLUGIN_DIR.'/'.MPMATH_PLUGIN_NAME);
  define('MPMATH_URL', plugins_url('/'.MPMATH_PLUGIN_NAME));
  define('MPMATH_I18N_PATH',MPMATH_PATH.'/i18n');
  define('MPMATH_DB_KEY', 'meprmath_unique_key');
  define('MPMATH_EDITION', 'memberpress-math-captcha');

  //Load up the language
  function meprmath_load_language() {
    load_plugin_textdomain('memberpress-math-captcha', false, str_replace(WP_PLUGIN_DIR, '', MPMATH_I18N_PATH));
  }
  add_action('plugins_loaded', 'meprmath_load_language');

  function meprmath_gen_unique_key() {
    $key = get_option(MPMATH_DB_KEY, false);

    if($key === false) {
      update_option(MPMATH_DB_KEY, time() . uniqid());
    }
  }

  add_action('init', 'meprmath_gen_unique_key');

  function meprmath_encrypt_data($num1, $num2) {
    $key = get_option(MPMATH_DB_KEY, false);

    return base64_encode(md5(($num1 + $num2) . $key));
  }

  function meprmath_compare_data($answer, $old_data) {
    $key = get_option(MPMATH_DB_KEY, false);
    $new_data = md5($answer . $key);
    $old_data = base64_decode($old_data);

    return ($new_data == $old_data);
  }

  function meprmath_gen_random_number($size = 'small') {
    $int = 0;

    switch($size) {
      case 'large':
        $int = mt_rand(16, 30);
        break;
      case 'medium':
        $int = mt_rand(6, 15);
        break;
      default: //small
        $int = mt_rand(1, 5);
       break;
    }

    return $int;
  }

  //This field will be updated via JS -- further
  function meprmath_show_field() {
    //Don't show to logged in users
    if(MeprUtils::is_user_logged_in())
      return;

    $num1 = meprmath_gen_random_number('medium');
    $num2 = meprmath_gen_random_number('small');
    $random_id = uniqid();

    $data = meprmath_encrypt_data($num1, $num2);
    ?>
    <div class="mp-form-row mepr_math_captcha">
      <div class="mp-form-label">
        <label for="meprmath_quiz"><span id="meprmath_captcha-<?php echo $random_id; ?>"></span>*</label>
      </div>
      <input type="text" name="meprmath_quiz" id="meprmath_quiz" value="" class="mepr-form-input" />
      <input type="hidden" name="meprmath_data" value="<?php echo $data; ?>" />
      <script>
        function mepr_base64_decode(encodedData) {
          var decodeUTF8string = function(str) {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(str.split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
          }
          if (typeof window !== 'undefined') {
            if (typeof window.atob !== 'undefined') {
              return decodeUTF8string(window.atob(encodedData))
            }
          } else {
            return new Buffer(encodedData, 'base64').toString('utf-8')
          }
          var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
          var o1
          var o2
          var o3
          var h1
          var h2
          var h3
          var h4
          var bits
          var i = 0
          var ac = 0
          var dec = ''
          var tmpArr = []
          if (!encodedData) {
            return encodedData
          }
          encodedData += ''
          do {
            // unpack four hexets into three octets using index points in b64
            h1 = b64.indexOf(encodedData.charAt(i++))
            h2 = b64.indexOf(encodedData.charAt(i++))
            h3 = b64.indexOf(encodedData.charAt(i++))
            h4 = b64.indexOf(encodedData.charAt(i++))
            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4
            o1 = bits >> 16 & 0xff
            o2 = bits >> 8 & 0xff
            o3 = bits & 0xff
            if (h3 === 64) {
              tmpArr[ac++] = String.fromCharCode(o1)
            } else if (h4 === 64) {
              tmpArr[ac++] = String.fromCharCode(o1, o2)
            } else {
              tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
            }
          } while (i < encodedData.length)
          dec = tmpArr.join('')
          return decodeUTF8string(dec.replace(/\0+$/, ''))
        }

        jQuery(document).ready(function() {
          document.getElementById("meprmath_captcha-<?php echo $random_id; ?>").innerHTML=mepr_base64_decode("<?php echo base64_encode(sprintf(__("%s equals?", 'memberpress-math-captcha'), "{$num1} + {$num2}")); ?>");
        });
      </script>
    </div>
    <?php
  }
  add_action('mepr-after-password-fields', 'meprmath_show_field', 12); //Higher priority to ensure it shows up below the strength meter
  add_action('mepr-forgot-password-form', 'meprmath_show_field');
  add_action('mepr-login-form-before-submit', 'meprmath_show_field');

  function meprmath_validate_answer($errors) {
    //Don't validate for already logged in users
    if(MeprUtils::is_user_logged_in())
      return $errors;

    if(!isset($_POST['meprmath_quiz']) || empty($_POST['meprmath_quiz'])) {
      $errors[] = __("You must fill out the Math Quiz correctly.", 'memberpress-math-captcha');
      return $errors;
    }

    if(!isset($_POST['meprmath_data']) || empty($_POST['meprmath_data'])) {
      $errors[] = __("You must fill out the Math Quiz correctly.", 'memberpress-math-captcha');
      return $errors;
    }

    $answer = (int)$_POST['meprmath_quiz'];
    $data = $_POST['meprmath_data'];

    if(!meprmath_compare_data($answer, $data))
      $errors[] = __("You must fill out the Math Quiz correctly.", 'memberpress-math-captcha');

    return $errors;
  }
  add_filter('mepr-validate-signup', 'meprmath_validate_answer');
  add_filter('mepr-validate-forgot-password', 'meprmath_validate_answer');
  add_filter('mepr-validate-login', 'meprmath_validate_answer');

  require_once(MPMATH_PATH . '/MpmathUpdateController.php');
  MpmathUpdateController::load_hooks();
} //End if (is plugin active)
