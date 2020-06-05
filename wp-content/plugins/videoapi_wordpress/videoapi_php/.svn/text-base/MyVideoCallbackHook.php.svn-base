<?php

require_once ('VideoCallbackHook.php');

class MyVideoCallbackHook extends VideoCallbackHook {

  /**
     Called when a video is first created.

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     custom = an array of key=>value, containing any custom data fields you provided
       to the publish wizard or in the push/pull-publish API call that produced this video.
   */
  protected function createVideo ($videoId, $title, $custom) {

  }

  /**
     Called when a video's status or metadata changes.

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     status = the video's status.  status will be 'available' when the video is ready.
     custom = an array of key=>value, containing any custom data fields you provided
       to the publish wizard or in the push/pull-publish API call that produced this video.
       Note: the custom array will only contain values the first tme updateVideo() is called.
             all subsequent calls will contain an empty custom array.
   */
  protected function updateVideo ($videoId, $title, $status, $custom) {

  }

  /**
     Called when this video is deleted (i.e. when it has been in the trash for a week
     and the trash is emptied).

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
   */
  protected function deleteVideo ($videoId, $title) {

  }

  /**
     Called whenever an individual asset is created in <%= current_reseller.name %>.
     This includes the source asset - when the original file is first uploaded,
     this is called for that source asset as well before any transcoding is done.

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     assetId = the asset's ID
     formatName = the asset's video format name.
   */
  protected function createAsset ($videoId, $title, $assetId, $formatName) {

  }

  /**
     Called whenever an individual asset is updated.

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     assetId = the asset's ID
     formatName = the asset's video format name.
   */
  protected function updateAsset ($videoId, $title, $assetId, $formatName) {

  }

  /**
     Called whenever an individual asset is deleted.

     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     assetId = the asset's ID
     formatName = the asset's video format name.
   */
  protected function deleteAsset ($videoId, $title, $assetId, $formatName) {

  }

  /**
     Called if a video throws an error, for example if it fails to transcode.
     
     videoId = the video'd <%= current_reseller.name %> ID.
     title = the video's title
     errorId = a numeric code for the error condition.
     errorMessage = a string summarizing the error condition.
   */
  protected function error ($videoId, $title, $errorId, $errorMessage) {

  }
}

?>
