<?php

class VideoCallbackHookTester {

  private $hook_url;
  private $video_id;
  private $video_title;
  private $custom_vars;

  public function __construct ($hook_url, $video_id, $video_title, $custom_vars) {
    $this->hook_url = $hook_url;
    $this->video_id = $video_id;
    $this->video_title = $video_title;
    $this->custom_vars = $custom_vars;
  }

  protected function call_hook ($action, $vars=null) {
    
    $vars = ($vars ? $vars : array());

    $data = array_merge ($vars, array('action' => $action,
				      'vid' => $this->video_id,
				      'title' => $this->video_title));
    
    $ch = curl_init ($this->hook_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL

    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    $error = curl_error($ch);
    curl_close($ch);    

    if ($response === false || ! $this->isValidHttpCode($info['http_code'])) {
      throw new HttpClientException ("CURL request for url $fullUrl failed.  HTTP code = " . $info['http_code'] . ", CURL error = " . $error);
    }

    return $response;
  }

  protected function isValidHttpCode($code) {
    return $code == '200';
  }

  public function call_test() {
    try {
      echo $this->call_hook ('test');
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_create() {
    try {
      echo $this->call_hook ('create', array_merge ($this->custom_vars));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_update_first_call($status) {
    try {
      echo $this->call_hook ('update', array_merge ($this->custom_vars,
						    array('status' => $status)));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_update ($status) {
    try {
      echo $this->call_hook ('update', array('status' => $status));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_create_asset ($assetId, $formatName) {
    try {
      echo $this->call_hook ('update', array('asset_action' => 'create',
					     'asset_id' => $assetId,
					     'video_format_name' => $formatName));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_update_asset ($assetId, $formatName) {
    try {
      echo $this->call_hook ('update', array('asset_action' => 'update',
					     'asset_id' => $assetId,
					     'video_format_name' => $formatName));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_delete_asset ($assetId, $formatName) {
    try {
      echo $this->call_hook ('update', array('asset_action' => 'delete',
					     'asset_id' => $assetId,
					     'video_format_name' => $formatName));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_delete () {
    try {
      echo $this->call_hook ('delete');
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public function call_error ($error_id, $error_message) {
    try {
      echo $this->call_hook ('error', array ('error_id' => $error_id,
					     'error_message' => $error_message));
      return true;
    } catch (Exception $e) {
      echo $e->getMessage();
      return false;
    }
  }

  public static function command_line ($url, $videoId, $title, $custom, $command_line_args) {

    $hook_tester = new VideoCallbackHookTester ($url, $videoId, $title, $custom);

    if (count($command_line_args) < 2) {
      die ("Usage: hook_action <extra_action_var> ...\n");
    }
    
    $action = $command_line_args[1];
    
    switch ($action) {
      
      case 'test': 
	return ($hook_tester->call_test());
      
      case 'create': 
	return ($hook_tester->call_create());
      
      case 'update_first_call': 
	if (count($command_line_args) < 3) {
	  return ("update_first_call requires status argument.");
	}
	$status = $command_line_args[2];
        return ($hook_tester->call_update_first_call($status));
      
      case 'update': 
	if (count($command_line_args) < 3) {
	  return ("update requires status argument.");
	}
	$status = $command_line_args[2];
        return ($hook_tester->call_update($status));
      
      case 'delete':
	return ($hook_tester->call_delete());
      
      case 'error':
	if (count($command_line_args) < 4) {
	  return ("error requires error_id and error_message argument (include message in quotes)");
	}    
        return ($hook_tester->call_error ($command_line_args[2], $command_line_args[3]));
      
      default:
        die ("Unrecognized hook action specified: $action");
    }
  }
}

?>