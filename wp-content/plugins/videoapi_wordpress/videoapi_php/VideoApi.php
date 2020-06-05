<?php

require_once ('MediaApi.php');

class VideoApi extends MediaApi {

  /**
   * Creates a VideoApi object scoped to the given library
   * within the given account.
   * 
   * @param string $baseUrl the service base url - see online documentation for this value.
   * @param string $accountId the account's ID
   * @param string $libraryId the ID of the library within the account to work with
   * @param string $licenseKey the license key to use for all authorization requests.  it can be the license key of a user associated with the given library, or an account-wide user.
   * @return VideoApi the created VideoApi object
  */
  public static function for_library ($baseUrl, $accountId, $libraryId, $licenseKey) {
    return new VideoApi (MediaApi::create_settings_hash ($baseUrl, $accountId, $libraryId, $licenseKey), true);
  }

  /**
   * Creates a VideoApi object scoped to the entire account (i.e. not to a specific library within the account).
   * 
   * @param string $baseUrl the service base url - see online documentation for this value.
   * @param string $accountId the account's ID
   * @param string $licenseKey the license key to use for all authorization requests.  it must be the license key for an account-level user, not a user assigned to a specific library.
   * @return VideoApi the created VideoApi object
   *
   * Note: to call the video ingest or import methods, you must
   * call VideoApi.for_library instead, or those methods will
   * raise an error.
  */
  public static function for_account ($baseUrl, $accountId, $licenseKey) {
    return new VideoApi (MediaApi::create_settings_hash ($baseUrl, $accountId, null, $licenseKey), false);
  }

  /**
   * Takes the filepath of a PHP .ini file and parses it for
   * the following values: base_url, account_id, library_id, license_key.
   * library_id is optional.
   * 
   * @return VideoApi object initialized with the values in the ini file.
   */
  public static function from_settings_file ($filepath) {
    return new VideoApi (MediaApi::settings_file_path_to_hash ($filepath));
  }

  /**
   * @param array $conf a hash containing the following keys: base_url, 
   * account_id, license_key, and optionally library_id.
   * @return VideoApi object initialized with the values in the hash.
   */
  public static function from_props ($conf) {
    return new VideoApi ($conf);
  }
   
  /**
   * Returns HTML for the upload wizard, generating the
   * ingest authenticatin token
   * for the given contributor, and encoding the given $params
   * PHP associative array into the equivalent JSON hash.
   * 
   * @param params a PHP associative array containing the same configuration
   * parameters you would construct the JSON object from to initialize the upload
   * wizard, as described in the online documentation.
   * 
   * example:
   * 
   * echo $api->createUploadWizard("admin", "http://yoursitename.com/redirect/url",
   * array ("ingest_profile" => "development",
   * "custom_id" => "12345"));
   * 
   */
  public function createIngestWizard($contributor, $redirectUrl, $params=null) {

    $auth = $this->authenticateForIngest ($contributor);
    
    $thirdParam = ($params ? ", " . json_encode($params) : "");

    return <<<DOC
      <script type="text/javascript" src="http://service.twistage.com/api/publish_script"></script>
      <script>
        uploadWizard('$auth', '$redirectUrl' $thirdParam);
      </script>
DOC;
  }

  /**
   * Identical to getDownloadrl, but does not append a view authentication signature regardless of whether isAuthRequiredForDownload returns true.
   */
  public function getDownloadUrlNoAuth ($videoId, $selector=null, $value=null) {

    $subUrl = "videos/$videoId/";

    if ($selector == 'asset_id') {
      $subUrl .= "assets/$value/file";
    }

    else if ($selector == 'format') {
      $subUrl .= "formats/$value/file";
    }

    else if ($selector == 'ext') {
      $subUrl .= "file.$value";
    }

    else if ($selector == null) {
      $subUrl .= "file";
    }

    else {
      throw new VideoApiException ("Unrecognized selector: $selector");
    }

    return $this->createUrl ($subUrl);
  }

  /**
   * @param videoId the video ID
   * @param selector specifies how to interpret the value parameter.  can be one of "asset_id", "format", "ext" (for extension).
   * @return string the specified video asset's download URL.  If isAuthRequiredForDownload returns true, also appends a view authentication signature.
   * If selector is null, returns the download url for the main asset.
   * 
   * For example, to get the URL for a file's main asset,
   * 
   * $url = $api->getDownloadUrl ($videoId);
   * 
   * to get the URL of a file by asset_id
   * 
   * $url = $api->getDownloadUrl ($videoId, 'asset_id', '12345');
   * 
   * to get the URL of a file by format name
   * 
   * $url = $api->getDownloadUrl ($videoId, 'format', 'ipod');
   * 
   * to get the URL of a file by extension
   * 
   * $url = $api->getDownloadUrl ($videoId, 'ext', 'flv');
   * 
   * to get the URL of a file's source asset:
   * 
   * $url = $api->getDownloadUrl ($videoId, 'ext', 'source');
  */
  public function getDownloadUrl ($videoId, $selector=null, $value=null) {

    $url = $this->getDownloadUrlNoAuth ($videoId, $selector, $value);

    if ($this->isAuthRequiredForDownload()) {
      $url .= "?signature=" . $this->authenticateForView();
    }

    return $url;
  }

  /**
   * @return string the download URL for the given video's source asset.
   */
  public function getDownloadUrlForSourceAsset ($videoId) {
    return $this->getDownloadUrl ($videoId, 'ext', 'source');
  }
  
  /**
   * returns the URL of the given video's stillframe image with the specified width.
   * If no width specified, defaults to 50.
   * 
   * Currently width can only be one of the values 50, 150 and 320.
   * 
  */
  public function getStillFrameUrl ($videoId, $params=null) {    

    $params = ($params ? $params : array());

    $width = isset($params['width']) ? $params['width'] : null;
    $height = isset($params['height']) ? $params['height'] : null;

    return $this->createUrl ("videos/$videoId/screenshots/" . 
			     ($width || $height ? "" : 'original') .
			     ($width ? "${width}w" : '') . 
			     ($height ? "${height}h" : '') . 
			     ".jpg");
  }
  
  /**
   * Calls the Video Metadata API.
   * 
   * @param $videoId
   * @param $format either 'xml' or 'json'.  if provided, returns the string result in that format.  if not provided, returns the result of parsing the json result into a PHP object tree.
   * 
  */
  public function getVideoMetadata ($videoId, $format=null) {

    if ($format == null) {
      return $this->cleanupItemCustomFields(json_decode ($this->getVideoMetadata ($videoId, 'json')));
    } else {
      try {
	return $this->getHttp()->get ($this->createUrl ("videos/$videoId.$format"),
				      $this->addViewAuthParam());
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Playlist Metadata API.
   * 
   * @param $videoId
   * @param $format either 'rss' or 'json'.  if provided, returns the string result in that format.  if not provided, returns the result of parsing the json result into PHP objects (return an array of video objects).
   * 
  */
  public function getPlaylistMetadata ($playlistId, $format=null) {
    if ($format == null) {
      return json_decode ($this->getPlaylistMetadata ($playlistId, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createUrl ("playlists/$playlistId.$format"),
				      $this->addViewAuthParam());
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }
  
  /**
   * Returns the URL of a video RSS feed for all videos matching the
   * given criteria.
   * 
   * If this api object was created using for_library, the
   * RSS feed is restricted to the library.  If for_account was used,
   * the results are from the entire account.
   * 
   * See the online documentation for details of the accepted criteria.
  */
  public function getRssUrl ($criteria) {
    return $this->createVideoSearchUrl ($criteria, 'rss');
  }

  /**
   * Calls the Search Videos API, scoping to the account or library
   * depending on whether this api object was constructed using
   * for_account or for_library.
   * 
   * @param format optional format type.  if omitted, this method returns the metadata as a tree of php objects, generated by obtaining the search results in json format and parsing it.
   * 'xml' returns the search results as an xml string.
   * 'json' returns the search results as a json string.
   * 
   * See the online documentation for the "Search Videos" API for details
   * of accepted search criteria.
  */
  public function searchVideos ($criteria, $format=null) {

    if ($format == null) {
      
      $page = json_decode ($this->searchVideos ($criteria, 'json'));

      $this->cleanupSearchResults ($page->videos);      

      return $page;

    } else {
      try {

	return $this->getHttp()->get ($this->createVideoSearchUrl($criteria, 
								  $format));

      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }      
    }
  }

  /** 
   * Calls searchVideos (Video Search API) with the given params, 
   * paginating through the entire result set, 
   * calling rhe provided SearchPageAction with 
   * each page of search results
   * as it is obtained.  The action can break the loop
   * (stop calling for further pages of results) by returning
   * false.  
   
   * @param params a hash of params to pass to searchVideos.
   * @param action a SearchPageAction.  To iterate over videos instead of pages,
   * provide an instance of VideoSearchVideoAction instead.
   */    
  function searchVideosEachPage ($params, $action) {
    
    $paramsCopy = array_merge ($params);      
    $page = null;
    $keepGoing = true;
    
    do {
      
      $paramsCopy["page"] = ($page == null 
			     ? 1
			     : $page->page_info->page_number + 1);
      
      $page = $this->searchVideos ($paramsCopy);
      
      $keepGoing = $action->processPage ($page);
      
    } while (! ($page->page_info->is_last_page || $keepGoing === false));
  }

  /** 
   * Calls searchVideos (Video Search API) with the given params, 
   * paginating through the entire result set, 
   * calling rhe provided VideoSearchVideoAction with 
   * each video as it is obtained.  The action can break the loop
   * (stop calling for further pages of results) by returning
   * false.  
   
   * @param params a hash of params to pass to searchVideos.
   * @param action a VideoSearchVideoAction. 
   */    
  function searchVideosEach ($params, $action) {
    $this->searchVideosEachPage ($params, new VideoSearchPageToVideoAction ($action));
  }

  /**
   * Calls the Video Tags API, returning a list of all tags
   * and the number of videos with each tag.
   * 
   * Scopes the request
   * to the whole account if you created this api object using for_account,
   * and to the specific library if you created this api object with for_library.
   * 
   * @param format 'xml', 'json' or null.  If null, returns the result of
   * parsing the json results into PHP objects.
  */
  public function getTags($format=null) {
    if ($format == null) {
      return json_decode ($this->getTags ('json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("tags.$format"),
				      $this->addViewAuthParam());
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Returns a list of tags (just their names, not the number of videos
   * using each tag).
   * 
   * Scopes the request
   * to the whole account if you created this api object using for_account,
   * and to the specific library if you created this api object with for_library.
   */
  public function getTagNames () {
    $result = $this->getTags();
    $names = array();
    foreach ($result as $tag) {
      $names[] = $tag->name;
    }
    return $names;
  }
  
  /**
   * Calls the Video Delivery Statistics API.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * See the online documentation for the accepted params and the
   * return data structure.
  */
  public function getDeliveryStats ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getDeliveryStats ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_delivery.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }
    
  /**
   * Calls the Video Delivery Statistics API for the specified video.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * @return array|string the usage statistics data for the given video, constrained usage the given
   * criteria.
   * 
   * See the online documentation for details of the accepted params.
  */
  public function getDeliveryStatsForVideo ($videoId, $params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getDeliveryStatsForVideo ($videoId, $params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createUrl ("videos/$videoId/statistics.$format"),
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Video Delivery Statistics API for the specified tag.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * @return array|string the usage statistics data for the given video, constrained usage the given
   * criteria.
   * 
   * See the online documentation for details of the accepted params.
  */
  public function getDeliveryStatsForTag ($tag, $params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getDeliveryStatsForTag ($tag, $params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl ("tags/$tag/statistics.$format"),
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * deprecated - use getIngestStatsEncode instead.
   */
  public function getIngestStats ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getIngestStats ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_publish.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Video ingest Statistics API, grouping results by source.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * See the online documentation for the accepted params and the
   * return data structure.
  */
  public function getIngestStatsSource ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getIngestStatsSource ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_publish/source.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Video ingest Statistics API, grouping results by encode.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * See the online documentation for the accepted params and the
   * return data structure.
  */
  public function getIngestStatsEncode ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getIngestStatsEncode ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_publish/encode.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Video ingest Statistics API, grouping results by file-type 
   * breakdown.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * See the online documentation for the accepted params and the
   * return data structure.
  */
  public function getIngestStatsBreakdown ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getIngestStatsBreakdown ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_publish/breakdown.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  /**
   * Calls the Video Storage Statistics API.
   * 
   * @param params The parameters to apply to the API request.
   * @param format 'json', 'xml', 'csv', or null.  If null, returns the
   * result of parsing the json results into PHP objects.
   * 
   * See the online documentation for the accepted params and the
   * return data structure.
  */
  public function getStorageStats ($params, $format=null) {
    if ($format == null) {
      return json_decode ($this->getStorageStats ($params, 'json'));
    } else {
      try {
	return $this->getHttp()->get ($this->createScopedUrl("statistics/video_publish/disk_usage.$format"), 
				      $this->addViewAuthParam ($params));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }
    
  /**
   * Calls the Video Update API to update the given videoId's video with the given
   * params.
   * 
   * See online documentation for accepted params.
   * 
   * As a convenience, this method makes sure all params
   * are wrappedin video[] before calling the API.  So the following are
   * valid param arrays for updating the title:
   * 
   * array('video[title]' => 'my new title')
   * 
   * array('title' => 'my new title')
   * 
  */
  public function updateVideo ($videoId, $params) {
      try {
	
	$this->getHttp()->put ($this->createUrl ("videos/$videoId"), 
			       $this->addUpdateAuthParam ($this->wrapUpdateVideoParams($params)));
	
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
  }   

  /**
   * Calls the Video Update API, setting the given video's hidden state.
   * 
   * @param visible true if the video should be made viewable (not hidden),
   * false if the video should be made hidden (not viewable).
   * 
  */
  public function setVideoVisible ($videoId, $visible) {
    $this->updateVideo ($videoId,  
			array("video[hidden]" => ($visible ? "false" : "true")));
  }

  /**
   * Calls the Delete Video API.
   * 
   * Moves the video with the given videoId into the trash.
  */
  public function deleteVideo ($videoId) {
    try {
      
      $this->getHttp()->delete ($this->createUrl ("videos/$videoId"), 
				$this->addUpdateAuthParam());
      
    } catch (HttpClientException $e) {
      throw $this->videoApiException ($e);
    }
  }  

  /**
   * Restores the given video from the trash.
   * Videos remain in the trash for 7 days, after which they are permanently
   * deleted.  Only call this method for videos still in the trash.
   */
  public function undeleteVideo ($videoId) {
    $this->updateVideo ($videoId, array('deleted_at' => ''));
  }

  /**
   * Calls the Video Import API.
   * 
   * Imports the videos specified in the given XML document (a String), using
   * the given contributor.
   * 
   * See the online documentation for details of the XML document structure.
  */
  public function importVideosFromXmlString ($xml, $contributor, $params=null) {
    try {
      
      return $this->getHttp()->post ($this->createUrl ("videos/create_many"),
				     $this->addIngestAuthParam ($contributor, $params),
				     "text/xml",
				     $xml);

    } catch (HttpClientException $e) {
      throw $this->videoApiException ($e);
    }
  }

  /**
   * Calls the Video Import API.
   * 
   * Imports the videos specified in the given XML document (a String), using
   * the given contributor.
   * 
   * See the online documentation for details of the XML document structure.
  */
  public function importVideosFromXmlFile ($path, $contributor, $params=null) {
    return $this->importVideosFromXmlString (file_get_contents($path), $contributor, $params);
  }    
  
  /**
   * Calls the Video Import API with an XML document created from the
   * given array of Hash objects, each representing
   * one of the <entry> elements in the import.
   * nested elements like <customdata> should represented by
   * a nested Hash.
   * 
   * for example:
   * 
   * importVideosFromEntries(array(
   * array('src' => "http://www.mywebsite.com/videos/1",
   * 'title' => "video 1",
   * 'tags' => array(array('tag' => 'balloons'))),
   * array('src' => "http://www.mywebsite.com/videos/2",
   * 'title' => "video 2",
   * 'customdata' => array('my_custom_field' => true))
   * );
  */
  public function importVideosFromEntries ($entries, $contributor=null, $params=null) {
    return $this->importVideosFromXmlString ($this->createVideoImportXmlFromHashes($entries), 
					     $contributor,
					     $params);
  }

  /** 
   * Calls the Progressive Download API, downloading one of the given video's assets into a file on the local hard drive.
   * @param video_id the ID of the video to download.
   * @param file_path the path of the local file to create (to download the video asset as)
   * @param selector optional array specifying which asset to download.  Usage here is identical to that of get_download_url.  If omitted, downloads the video's main asset.
   * @param value the parameter whose meaning is defined by selector.
  */
  public function downloadVideoAsset ($videoId, $filepath, $selector=null, $value=null) {
    try {
      return $this->getHttp()->downloadFile ($this->getDownloadUrl($videoId, $selector, $value),
					     $filepath);
    } catch (HttpClientException $e) {
      throw $this->videoApiException ($e);
    }
  }

  /** 
   * Calls the Progressive Download API, downloading the given video's source asset into a file on the local hard drive.
   * @param video_id the ID of the video to download.
   * @param file_path the path of the local file to create (to download the video asset as)
  */
  public function downloadVideoSourceAsset ($videoId, $filepath) {
    return $this->downloadVideoAsset ($videoId, $filepath, 'ext', 'source');
  }

  /**
   Synonym for uploadMedia().
   */
  public function uploadVideo ($path, $contributor, $params=null) {
    return $this->uploadMedia ($path, $contributor, $params);
  }

  /**
   * Calls the slice API, which cuts a video into pieces, creating a new video ID
   * for each slice.
   * 
   * @param videoId the video to slice
   * @contributor the contribute to use for the newly created segment videos.
   * @param xml the xml to post, conforming to the Video Slice API.
   * @param format (optional) format name specifying the asset to slice.  If omitted, slices the source asset.
   *
   * See the online documentation for details.
  */
  public function sliceVideo ($videoId, $contributor, $xml, $format='source') {    
    try {

      $url = "videos/$videoId/formats/$format/slice.xml";
      
      return $this->getHttp()->post ($this->createUrl ($url),
				     $this->addIngestAuthParam ($contributor),
				     "text/xml",
				     $xml);
      
    } catch (HttpClientException $e) {
      throw $this->videoApiException ($e);
    }
  }

  /**
   * @ignore
   */
  protected function createVideoSearchUrl ($criteria, $format) {
    return $this->createSearchUrl ("videos", $criteria, $format);
  }

  /**
   * Collects the video IDs of the given videos and returns them in an array.
   * @ignore
   */
  protected static function collectVideoIdsFromVideos ($videos) {
    $ids = array();
    foreach ($videos as $video) {
      $ids[] = $video->{'video-id'};
    }
    return $ids;
  }

  /**
   * @ignore
   */
  protected function wrapUpdateVideoParams ($params) {
    $newParams = array();
    foreach ($params as $k=>$v) {
      if (preg_match('/^video\[.*\]/', $k)) {
	$newParams[$k] = $v;
      } else {
	$newParams["video[$k]"] = $v;
      }
    }
    return $newParams;
  }

  /**
   * @ignore
   */
  protected function createVideoImportXmlFromHashes ($entries) {

    $entryXmls = array();
    foreach ($entries as $entry) {
      $entryXmls[] = $this->createVideoImportXmlFromValue (array('entry' => $entry));
    }

    return '<?xml version="1.0" encoding="UTF-8"?><add><list>' . join("\n", $entryXmls) . '</list></add>';
  }

  /**
   * @ignore
   */
  protected function createVideoImportXmlFromValue ($value) {
    if (is_array($value)) {

      if (isset($value[0])) {
	$children = array();
	foreach ($value as $item) {
	  $children[] = $this->createVideoImportXmlFromValue($item);
	}
	return (join("\n", $children));

      } else {
	$children = array();
	foreach ($value as $k=>$v) {
	  $children[] = "<$k>" . $this->createVideoImportXmlFromValue($v) . "</$k>";
	}
	
	return join("\n", $children);
      }

    } else {
      return '' . $value;
    }
  }

  /**
   * @ignore
   */
  protected function __construct ($props, $require_library=false) {
    parent::__construct ($props, $require_library);
  }

  /**
   * @ignore
   */
  protected function videoApiException ($exception) {
    return $this->mediaApiException ($exception);
  }
  
  /**
   * @ignore
   */
  protected function mediaApiException ($exception) {
    $superResponse = parent::mediaApiException ($exception);
    try {
      throw $superResponse;
    } catch (MediaApiAuthenticationFailedException $e) {
      return new VideoApiAuthenticationFailedException ($e);
    } catch (VideoApiException $e) {
      return $e;
    } catch (MediaApiException $e) {
      return new VideoApiException ($e);
    }
  }
}

class VideoApiException extends MediaApiException {

  /**
   * You can call this with either one argument or two.
   * If with one, call it with an excetion or a message.
   * If with two, call it with a message and an Exception.
   */
  public function __construct ($exceptionOrMessage, $exception=null) {
    parent::__construct ($exceptionOrMessage . ": $exception");
  }
}

/**
   * Thrown by VideoApi when it can't obtain an authentication signature.
 */
class VideoApiAuthenticationFailedException extends VideoApiException {

  public function __construct ($source) {
    parent::__construct ($source);
  }
}

interface SearchPageAction {
  
  /**
   * Called with each successive page in the search results.
   * return false to terminate pagination.
   */
  function processPage ($page);
}

interface VideoSearchVideoAction {
  
  /**
   * Called with each video in the search results.
   * return false to terminate pagination.
   */
  function processVideo ($video);
}

class VideoSearchPageToVideoAction implements SearchPageAction {

  private $action;

  public function __construct ($action) {
    $this->action = $action;
  }
  
  function processPage ($page) {
    foreach ($page->videos as $video) {
      if (! $this->action->processVideo ($video)) {
	return false;
      }
    }
    return true;
  }
}

