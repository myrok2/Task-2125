<?php
/*
Plugin Name: Video API
Version: 1.0
Description: Allows to to embed videos and playlists, display video metadata and stats, and upload videos from the WordPress console.
*/

require_once (dirname(__FILE__) . "/videoapi_php/VideoApi.php");

add_action('admin_menu', 'videoapi_plugin_menu');

function videoapi_plugin_menu() {
  add_options_page('Video API Options', 'Video API', 'manage_options', "wp_videoapi", 'videoapi_options');
  add_management_page( "Upload Video", "Video API: Upload Video", "manage_options", "wp_videoapi", "videoapi_upload");
}

function videoapi_upload() {
  if(isset($_GET["success"]) && $_GET["success"] == 1) {
    ?>
    <div class="updated"><p><strong><?php _e('Your video is being processed. ID: '.$_GET["_video_id"], 'videoapi-menu-test' ); ?></strong></p></div>
    <?php    
  }
  print _upload_widget(null);
}

function videoapi_options() {

  if (!current_user_can('manage_options')) {
    wp_die( __('You do not have sufficient permissions to access this page.') );
  }

  $hidden_field_name = 'mt_submit_hidden';

  $license_key = get_option("license_key");
  $contributor = get_option("contributor");
  $library_id = get_option("library_id");
  $api_input = get_option("api_server");
  $api_server = preg_replace('/https?\:\/\//', "", $api_input);

  if(isset($_POST[ $hidden_field_name ]) && $_POST[ $hidden_field_name ] == 'Y' ) {
    $license_key = $_POST["license_key"];
    $contributor = $_POST["contributor"];
    $library_id = $_POST["library_id"];
    $api_input = $_POST["api_server"];
	  $api_server = preg_replace('/https?\:\/\//', '', $api_input);

    update_option( "license_key", $license_key );
    update_option( "contributor", $contributor );
    update_option( "library_id", $library_id );
	  update_option( "api_server", $api_server );
    if(!_get_signature($license_key, $contributor, $library_id)) {
    ?>
    <div class="updated"><p><strong><?php _e('Invalid Account.', 'videoapi-menu-test' ); ?></strong></p></div>
    <?php
    } else {
    ?>
    <div class="updated"><p><strong><?php _e('Save Successful.', 'videoapi-menu-test' ); ?></strong></p></div>
    <?php 
    }  
  }
  echo '<div class="wrap">';
  echo "<h2>" . __( 'Video API Plugin Settings', 'videoapi-menu-test' ) . "</h2>";
  ?>

  <form name="form1" method="post" action="">
  <input type="hidden" name="<?php echo $hidden_field_name; ?>" value="Y">
  <p>Please provide the following information...</p>
  <p><?php _e("API Server:", 'twisage-menu-test' ); ?> 
  <input type="text" name="api_server" value="<?php echo $api_server; ?>" size="20"> 
  </p>
  
  <p>Please provide the following information for video uploads...</p>
  <p><?php _e("License Key:", 'twisage-menu-test' ); ?> 
  <input type="text" name="license_key" value="<?php echo $license_key; ?>" size="20">
  </p>
  <p><?php _e("Contributor:", 'twisage-menu-test' ); ?> 
  <input type="text" name="contributor" value="<?php echo $contributor; ?>" size="20">
  </p>
  <p><?php _e("Library ID:", 'twisage-menu-test' ); ?> 
  <input type="text" name="library_id" value="<?php echo $library_id; ?>" size="20">
  </p>
  
  <hr />
 
  <p class="submit">
  <input type="submit" name="Submit" class="button-primary" value="<?php esc_attr_e('Save Changes') ?>" />
  </p>
    </form>
  </div>
  <?php
}

function _get_user_agent($agent_string) {
  if (preg_match("/Mobi/", $agent_string)) {
    $user_agent = "mobile";
  } else {
    $user_agent = "compy";
  }
  return $user_agent;
}

function _embed_video($atts, $content = null) {
	$a = shortcode_atts(array(
		"video_id" => "",
		'width' => 400,
		'height' => 383,
		"player_profile" => "",
		"asset_id" => "",
		"video_format_name" => "",
		"autoplay" => "",
		"adaptv_context" => "",
		"dart_ad_keywords" => "",
		"playlist_id" => "",
		), $atts);

	$user_agent = _get_user_agent($_SERVER["HTTP_USER_AGENT"]); 
  if ($user_agent == "mobile") {
    $a["width"] = 240;
    $a["height"] = 150;
  }

	$param_string = "";
	foreach ($a as $k => $v) {
		if (strlen($v)) {
			$fixedk = $k;
			switch ($k) {
				case "video_id":
					$fixedk = "v";
					break;
				case "asset_id":
					$fixedk = "a";
					break;
				case "player_profile":
					$fixedk = "p";
					break;
			}
			$param_string .= $fixedk."=".$v."&";
		}
	}
	
	$ret = "";
	
	if ($a["playlist_id"] != "") {
		$id_suffix = $a["playlist_id"];
		$ret .= '<object width="'.$a["width"].'" height="'.$a["height"].'" id="embedded_player_'.$id_suffix.'" name="embedded_player" type="application/x-shockwave-flash" data="http://'.get_option("api_server").'/plugins/player.swf"><param name="movie" value="http://'.get_option("api_server").'/plugins/player.swf"/><param name="allowfullscreen" value="true"/><param name="allowscriptaccess" value="always"/><param name="base" value="http://'.get_option("api_server").'"/><param name="flashvars" value="'.$param_string.'&feed=http://'.get_option("api_server").'/playlists/'.$a["playlist_id"].'.rss&playlistObjectId=embedded_playlist_'.$id_suffix.'"/></object>';	
	} else {
		$ret .= '<object width="'.$a["width"].'" height="'.$a["height"].'" id="embedded_player" name="embedded_player" type="application/x-shockwave-flash" data="http://'.get_option("api_server").'/plugins/player.swf"><param name="movie" value="http://'.get_option("api_server").'/plugins/player.swf"/><param name="allowfullscreen" value="true"/><param name="allowscriptaccess" value="always"/><param name="base" value="http://'.get_option("api_server").'"/><param name="flashvars" value="'.$param_string.'"/></object>';
	
	}
	
	return $ret;
}

function _embed_video_js($atts, $content = null) {

  $a = shortcode_atts(array(
		'video_id' => '',
		'width' => 480,
		'height' => 383,
		'player_profile' => '',
		'asset_id' => '',
		'video_format_name' => '',
		'mobile_format_name' => '',
		'config' => ''
		), $atts);

	$user_agent = _get_user_agent($_SERVER["HTTP_USER_AGENT"]); 
  if ($user_agent == "mobile") {
    $a["width"] = 240;
    $a["height"] = 150;
  }

	$params = array();
	foreach ($a as $k => $v) {
		if (strlen($v)) {
			$vfixed = $v;
      if ($k != "config") {
        $vfixed = "'".$v."'";
      } else {
        $vfixed = "{".$v."}";
      }
			array_push($params, $k.": ".$vfixed);
		}
	}
	
	$param_string = "";
	$i = 1;
	foreach ($params as $p) {
		$param_string .= $p;
		if ($i < count($params)) {
			$param_string .= ", ";
		}
		$i++;
	}
	
	$video_id = $a["video_id"];
	
	// force server_detection = true
	$param_string .= ", server_detection: true";
	
	$ret = "";
	$ret .= '<script type="text/javascript" src="http://'.get_option("api_server").'/api/script"></script>';
	$ret .= '<script type="text/javascript">viewNode("'.$video_id.'", {'.$param_string.'});</script>';
	return $ret;
}

function _embed_playlist($atts, $content = null) {
	$a = shortcode_atts(array(
		'width' => 480,
		'height' => 100,
		"player_profile" => "",
		"playlist_id" => "",
		), $atts);

	$id_suffix = $a["playlist_id"];
	
	$ret = "";

	$ret .= '<br/><object data="http://'.get_option("api_server").'/plugins/carousel.swf" width="'.$a["width"].'" height="'.$a["height"].'" type="application/x-shockwave-flash" id="embedded_playlist_'.$id_suffix.'"><param name="allownetworking" value="all"/><param name="allowscriptaccess" value="always"/><param name="flashVars"  value="feed=http://'.get_option("api_server").'/playlists/'.$a["playlist_id"].'.rss&playerObjectId=embedded_player_'.$id_suffix.'"/><param name="movie" value="http://'.get_option("api_server").'/plugins/carousel.swf"/><param name="quality" value="high"/></object>';
	return $ret;
}

function _embed_playlist_js($atts, $content = null) {
	$a = shortcode_atts(array(
		'width' => 480,
		'height' => 100,
		"player_profile" => "",
		"asset_id" => "",
		"video_format_name" => "",
		"autoplay" => "",
		"adaptv_context" => "",
		"dart_ad_keywords" => "",
		"playlist_id" => "",
		"player_profile" => "",
		"vertical" => "",
		), $atts);
	
	$params = array();
	foreach ($a as $k => $v) {
		if (strlen($v)) {
			$vfixed = $v;
			if ($k != "config") {
				$vfixed = "'".$v."'";
			} else {
				$vfixed = "{".$v."}";
			}
			if ($k == "player_profile") {
				$k = "playerProfile";
			}
			array_push($params, '"'.$k.'": '.$vfixed);
		}
	}
	
	$param_string = "";
	foreach ($params as $p) {
		$param_string .= $p;
		$param_string .= ", ";
	}
	
	$video_id = $a["video_id"];
	
	$ret = "";
        if ($a['vertical'] === "") {
            $a['vertical'] = 'false';
        }
	
	$ret .= '<script type="text/javascript" src="http://'.get_option("api_server").'/api/carousel_script.js"></script>';
	$ret .= '<script type="text/javascript">jQuery(document).ready(function() { loadCarousel({'.$param_string.'"vertical":' . $a['vertical'] . ',"feed":"http://'.get_option("api_server").'/playlists/'.$a["playlist_id"].'.json","playerId":"embedded_player_'.$a["playlist_id"].'"}); });</script>
';
	$ret .= '<div id="div-embedded_player_'.$a["playlist_id"].'_carousel" style="width:'.$a["width"].'px;height:'.$a["height"].'px;"><ul id="embedded_player_'.$a["playlist_id"].'_carousel" class="jcarousel-skin-ie7"></ul></div>';
	return $ret;
}

function _get_signature($license_key, $contributor, $library_id) {
  $file = "http://".get_option("api_server")."/api/ingest_key"."?licenseKey=".urlencode($license_key)."&contributor=".urlencode($contributor)."&library_id=".urlencode($library_id);
  $signature = @file_get_contents($file);
	return $signature;
}

function _upload_widget($atts, $content = null) {
  $prefix = "http://";
  if (ereg('HTTPS', $_SERVER["SERVER_PROTOCOL"])) {
    $prefix = "https://"; 
  }
  $a = shortcode_atts(array(
	  'license_key' => get_option("license_key"),
	  'redirect' => $prefix.$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]."&success=1",
	  'params' => "",
	  'contributor' => get_option("contributor"),
	  'library_id' => get_option("library_id"),
	), $atts);
	$signature = _get_signature($a["license_key"], $a["contributor"], $a["library_id"]);
  if ($signature) {
		
    $ret = "";
	  $ret .= '<script type="text/javascript" src="http://'.get_option("api_server").'/api/upload_script"></script>';
	  $ret .= '<script type="text/javascript">uploadWizard(\''.$signature.'\', \''.$a["redirect"].'\');</script>';
	  return $ret;
  } else {
    $error = 'Please enter valid account settings <a href="options-general.php?page=wp_videoapi">here</a>.';
    echo $error;
  }
}

function _video_metadata($atts, $content = null) {
  extract(shortcode_atts(array(
      'company_id' => '',
      'license_key' => get_option("license_key"),
      'video_id' => '',
    ), $atts));
    
  $videoApi = VideoApi::for_account("http://".get_option("api_server"), $company_id, $license_key);
  $GLOBALS["video_metadata_data"] = $videoApi->getVideoMetadata($video_id);
  return (do_shortcode($content));
}

function _metadata($atts, $content = null) {
  extract(shortcode_atts(array(
      'field' => '',
    ), $atts));
  return ("|".$GLOBALS["video_metadata_data"]->$field."|");
}

function _video_stats($atts, $content = null) {
  extract(shortcode_atts(array(
      'company_id' => '',
      'license_key' => get_option("license_key"),
      'video_id' => '',
    ), $atts));
    
  $videoApi = VideoApi::for_account("http://".get_option("api_server"), $company_id, $license_key);
  $GLOBALS["video_stat_data"] = $videoApi->getDeliveryStatsForVideo($video_id, null);
  return (do_shortcode($content));
}

function _stat($atts, $content = null) {
  extract(shortcode_atts(array(
      'field' => '',
    ), $atts));
  return ("|".$GLOBALS["video_stat_data"][0]->$field."|");
}


add_shortcode("embed_video", "_embed_video");
add_shortcode("embed_video_js", "_embed_video_js");
add_shortcode("embed_playlist", "_embed_playlist");
add_shortcode("embed_playlist_js", "_embed_playlist_js");
add_shortcode("video_metadata", "_video_metadata");
add_shortcode("metadata", "_metadata");
add_shortcode("video_stats", "_video_stats");
add_shortcode("stat", "_stat");

?>
