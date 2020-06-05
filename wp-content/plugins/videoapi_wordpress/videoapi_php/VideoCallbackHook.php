<?php

/**
   <p>
   Implements the callback hook.  To use this class, create a subclass
   that implements the abstract methods createVideo(), updateVideo(), deleteVideo(),
   createAsset(), updateAsset(), deleteAsset(), and error().  You can also override
   the default implementation of test(), which responds with "Hello from the hook!".
   </p>
   <p>
   You can copy and paste the following code as a skeleton of the subclass you need to implement:
   </p>
   <pre>

   </pre>
 */
abstract class VideoCallbackHook {
    
  /**
   Handles HTTP requests, implementing the video callback hook.  
   Uses the 'action' request parameter and optional 'asset_action' request
   parameter to call the right action method.  The following summarizes the logic
   of which methods get called based on the valus of these request parameters:
   <p>
   action=create -> createVideo() <br/>
   action=update and asset_action not present -> updateVideo() <br/>
   action=delete -> deleteVideo() <br/>
   action=update and asset_action=create -> createAsset() <br/>
   action=update and asset_action=update -> updateAsset() <br/>
   action=update and asset_action=delete -> deleteAsset() <br/>
   action=error -> error() <br/>
   action=test -> test() <br/>
   </p>
   <p>
   See the documentation for those methods for details of the request parameters
   passed to them.
   </p>
  */
  public function execute () {

    // will only happen if you're calling this servlet yourself somehow to test it
    if (! isset ($_REQUEST['action'])) {
      throw new Exception ("Video callback hook: No action parameter in request!");
    }
    
    else if ($_REQUEST['action'] == "create") {	   
      $this->createVideo ($_REQUEST['vid'], $_REQUEST['title'], 
			  $this->getCustomVars());
    }
    
    else if ($_REQUEST['action'] == "update") {
      
      if ($_REQUEST['asset_action']) {
	
	if ($_REQUEST['asset_action'] == "create") {
	  $this->createAsset ($_REQUEST['vid'], $_REQUEST['title'], 
			      $_REQUEST['asset_id'], $_REQUEST['video_format_name']);
	}
	
	else if ($_REQUEST['asset_action'] == "update") {
	  $this->updateAsset ($_REQUEST['vid'], $_REQUEST['title'], 
			      $_REQUEST['asset_id'], $_REQUEST['video_format_name']);
	}
	
	else if ($_REQUEST['asset_action'] == "delete") {
	  $this->deleteAsset ($_REQUEST['vid'], $_REQUEST['title'], 
			      $_REQUEST['asset_id'], $_REQUEST['video_format_name']);
	}		
	
      } else {
	$this->updateVideo ($_REQUEST['vid'], $_REQUEST['title'], 
			    $_REQUEST['status'], $this->getCustomVars());
      }
    }
    
    else if ($_REQUEST['action'] == "delete") {
      $this->deleteVideo ($_REQUEST['vid'], $_REQUEST['title']);
    }
    
    else if ($_REQUEST['action'] == "error") {      
      $this->error ($_REQUEST['vid'], $_REQUEST['title'], 
		    $_REQUEST['error_id'], $_REQUEST['error_message']);
    }
    
    else if ($_REQUEST['action'] == "test") {
      $this->test ($_REQUEST['vid'], $_REQUEST['title']);
    }
    
    // will only happen if you're calling this servlet yourself somehow to test it
    else {
      throw new Exception ("Unrecognized value for parameter 'action': " . $_REQUEST['action']);
    }
  }
  
  /**
   Returns all request parameters found 
   that are not one of 'action', 'vid', 'title', or 'status'.
  */
  protected function getCustomVars () {
    $custom = array();
    foreach ($_REQUEST as $key => $value) {
      if (! ($key == "action" || 
	     $key == "vid" || 
	     $key == "title" || 
	     $key == "status" ||
	     $key == "video")) {
	$custom [$key] = $_REQUEST[$key];
      }
    }
    return $custom;
  }
  
  /**
   Called when action=test, meaning you have clicked the "Test hook" button in the 
   console to test this hook.  Note that any output written to the
   response's output stream
   will be displayed in the console to show the result of pressing "Test hook".
   <p>
   </p>
   For example, to have "Hello from the hook!" show up in the console in response to
   pressing the "Test hook" button, you could use the following code:
   </p>
   <p>
   The default behavior is to output a trace to System.out, 
   and to respond with "Hello from the hook!"
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected function test ($videoId, $title) {
    echo (date("d-M-Y H:i:s") . ": Hello from " . __FILE__ . ". videoId=$videoId, title=$title");
  }
  
  /**
   Called when action=create, as the first step of the publish process (before
   the source asset is stored or it is transcoded into any formats).
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param custom a Map<String, String> of custom data fields passed into the
   publish wizard (or in the metadata of the pull/push-publish API call)
   that published this hook call's video.  For example, if you provide a
   custom_id field in the publish process, the custom Map will contain
   a "custom_id" key whose value is the value you provided at publish time.
   For example, use this feature to link up the video ID with the relevant data in your 
   local database.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
  */
  protected abstract function createVideo ($videoId, $title, $custom);
  
  /**
   Called when action=update and there is no asset_action request parameter,
   meaning that this hook call pertains to the video, not a particular asset of the video,
   because the status of the video has changed.
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param status the video's status.  
   'available' -> the video has been transcoded or has been set to visible, 
   and is now available to be displayed.
   'hidden' -> the video has been hidden and will not play.
   'trash' -> the video has been moved to the trash, will not play, and will
   be deleted from the system within 7 days.
   
   @param custom a Map<String, String> of custom data fields passed into the
   publish wizard (or in the metadata of the pull/push-publish API call)
   that published this hook call's video.  
   <p>
   For example, if you provide a
   custom_id field in the publish process, the custom Map will contain
   a "custom_id" key whose value is the value you provided at publish time.
   For example, use this feature to link up the video ID with the relevant 
   data in your local database.
   </p>
   <p>
   NOTE: This map will only contain information on the first call to updateVideo().
   All subsequent calls will provide an empty Map of custom fields.  It is
   provided in the first update call as a convenience, so you have a choice as
   to whether you record the video in your local database at create time
   or when it has a status of 'available'.
   </p>
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */    
  protected abstract function updateVideo ($videoId, $title, $status, $custom);

  /**
   Called when action=delete, when this video has been deleted from the system.
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected abstract function deleteVideo ($videoId, $title);	
  
  /**
   Called when action=update and asset_action=create, 
   when a new asset has been created for this video (or when the source asset is 
   first given an asset ID).
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param assetId the ID of the asset this hook is being called about - one of this video's
   assets.
   
   @param formatName the video format name of the asset this hook is being called about - 
   one of this video's assets.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected abstract function createAsset ($videoId, $title, $assetId, $formatName);
  
  /**
   Called when action=update and asset_action=update, 
   when something about one of the video's assets has changed.
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param assetId the ID of the asset this hook is being called about - one of this video's
   assets.
   
   @param formatName the video format name of the asset this hook is being called about - 
   one of this video's assets.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected abstract function updateAsset ($videoId, $title, $assetId, $formatName);

  /**
   Called when action=update and asset_action=delete
   when one of this video's assets has been deleted.
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param assetId the ID of the asset this hook is being called about - one of this video's
   assets.
   
   @param formatName the video format name of the asset this hook is being called about - 
   one of this video's assets.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected abstract function deleteAsset ($videoId, $title, $assetId, $formatName);
  
  /**
   Called when action=error, meaning that an error has occurred pertaining to
   this video (e.g. it failed to transcode).
   <p>
   Abstract method - you must implement this in your subclass (though the implementation
   doesn't have to do anything).
   </p>
   <p>
   @param videoId the value of the 'vid' request parameter - the ID of the video this
   hook is being called about.
   
   @param title the value of the 'title' request parameter - the title of the video this
   hook is being called about.
   
   @param errorId An error code.
   
   @param errorMessage A message describing the error that occurred.
   
   @param req the HttpServletRequest.
   @param response the HttpServletResponse.
   </p>
  */
  protected abstract function error ($videoId, $title, $errorId, $errorMessage);

}

?>