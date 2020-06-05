<?php

require_once ('VideoCallbackHook.php');

class VideoCallbackEchoHook extends VideoCallbackHook {

  protected function sendOutput ($json) {
    mail ('jmiles@twistage.com', 'VideoCallbackEchoHook', $json);
  }

  protected function output ($method, $vid, $title, $props) {
    $props = array_merge ($props, 
			  array ('time' => date("d-M-Y H:i:s"),
				 'handler' => 'VideoCallbackEchoHook',
				 'method' => $method,
				 'vid' => $vid,
				 'title' => $title));
    
    $this->sendOutput (json_encode($props));
  }

  protected function test ($videoId, $title) {
    $this->output ("test", $videoId, $title, array());
  }

  protected function createVideo ($videoId, $title, $custom) {
    $this->output ("createVideo", $videoId, $title, $custom);
  }

  protected function updateVideo ($videoId, $title, $status, $custom) {
    $this->output ("updateVideo", $videoId, $title, 
		   array_merge (array('status' => $status), 
				$custom));
  }

  protected function deleteVideo ($videoId, $title) {
    $this->output ("deleteVideo", $videoId, $title, array());
  }

  protected function createAsset ($videoId, $title, $assetId, $formatName) {
    $this->output ("createAsset", $videoId, $title, array ('asset_id' => $assetId,
							   'asset_action' => 'create',
							   'video_format_name' => $formatName));
  }

  protected function updateAsset ($videoId, $title, $assetId, $formatName) {
    $this->output ("updateAsset", $videoId, $title, array ('asset_id' => $assetId,
							   'asset_action' => 'update',
							   'video_format_name' => $formatName));
  }

  protected function deleteAsset ($videoId, $title, $assetId, $formatName) {
    $this->output ("deleteAsset", $videoId, $title, array ('asset_id' => $assetId,
							   'asset_action' => 'delete',
							   'video_format_name' => $formatName));
  }

  protected function error ($videoId, $title, $errorId, $errorMessage) {
    $this->output ("error", $videoId, $title, array ('error_id' => $errorId,
						     'error_message' => $errorMessage));
  }
}


?>