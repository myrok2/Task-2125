<?php

require_once ('HttpClientCurl.php');

class MediaApi {

  private $baseUrl;
  private $libraryId;
  private $licenseKey;
  private $accountId;
  private $rssAuthRequired;
  private $authRequiredForDownload;
  private $http;

  private $viewToken;
  private $updateToken;
  private $ingestToken;

  private $authTokenDurationInMinutes;

  /**   
   * Calls the authentication API.
   * 
   * @return string a one-time-use read-authentication signature.
   * 
   * In general you do not need to call this directly - the other methods in this class
   * that require an authentication signature will call this for you.
  */
  public function authenticateForView () {
    return $this->getAuthSignature ($this->getViewAuthToken(), 
				    $this->authTokenDurationInMinutes);
  }

  /**
   * 
   * Calls the authentication API.
   * 
   * @return string a one-time-use update-authentication signature.
   * 
   * In general you do not need to call this directly - the other methods in this class
   * that require an authentication signature will call this for you.
  */
  public function authenticateForUpdate () {	
      return $this->getAuthSignature ($this->getUpdateAuthToken(), 
				      $this->authTokenDurationInMinutes);
  }

  /**
   * Calls the authentication API.
   * 
   * @return string a one-time-use ingest-authentication signature.
   * 
   * In general you do not need to call this directly - the other methods in this class
   * that require an authentication signature will call this for you.
   *
   * @param contributor the string to use as the media's contributor
   * @param params a hash containing other params to include.  currently the
   * only param to include is :ingest_profile, specifying the ingest profile 
   * to use when ingesting the media.
   * 
  */
  public function authenticateForIngest ($contributor, $params=null) {

    $params = ($params ? $params : array());
    
    if (! $contributor) {
      throw $this->mediaApiException (new MediaApiException ("You must provide a non-blank contributor to obtain an ingest authentication signature."));
    }
    
    if (! $this->getLibraryId()) {
      throw $this->mediaApiException (new MediaApiException ("You must provide a non-blank library ID to obtain an ingest authentication signature."));
    }
    
    return $this->getAuthSignature ($this->getIngestAuthToken(),
				    0,
				    array_merge ($params,
						 array('userID' => $contributor,
						       'library_id' => $this->getLibraryId())));
  }

  public function isViewTokenExpired() {
    return $this->getViewAuthToken()->isExpired ();
  }

  public function isUpdateTokenExpired() {
    return $this->getUpdateAuthToken()->isExpired ();
  }
    
  public function resetAuthTokenCache() {
    $this->getViewAuthToken()->resetCache();
    $this->getUpdateAuthToken()->resetCache();
  }

  /**
   * Sets the auth token duration for subsequent calls to the authentication API.
   * The default value is 15 minutes - call this method to change it.  To force
   * a call for a new signature every time one is needed, call this with 0 or
   * call clearAuthTokenDuration().
   */
  public function setAuthTokenDurationInMinutes($durationInMinutes) {
    $this->authTokenDurationInMinutes = $durationInMinutes;
  }

  /**
   * Returns the duration in minutes that will be provided in subsequent calls
   * to the authentication API, requesting tokens that last that long.
   */
  public function getAuthTokenDurationInMinutes() {
    return $this->authTokenDurationInMinutes;
  }

  /**
   * Sets the auth token duration parameter value to 0, forcing a call to
   * the authentication API every time a signature is needed.
   */
  public function clearAuthTokenDuration() {
    $this->setAuthTokenDurationInMinutes (0);
  }
  
  /**   
   * Calls the Upload API.
   * 
   * Uploads the media file at the given filepath,
   * using the given contributor as the contributor and the given params
   * to specify custom data for the upload.
   * 
   * To specify an ingest profile, include an 'ingest_profile'
   * in params.  It will be used in the call to authenticate_for_ingest.
   *
   * See the online documentation for the Video Upload API for details.
  */
  public function uploadMedia ($path, $contributor, $params=null) {

    $params = ($params ? $params : array());

    $auth_params = $this->selectAuthParamsFromUploadMediaParams ($params);
    $upload_params = $this->selectNonAuthParamsFromUploadMediaParams ($params);

    $authSig = $this->authenticateForIngest ($contributor, $auth_params);

    try {

      $uploadUrl = $this->getHttp()->get ($this->createUrl ("upload_sessions/$authSig/http_open"), 
					  $upload_params);
            
      $this->getHttp()->postMultipartFileUpload ($uploadUrl, $path);
      
      return trim($this->getHttp()->get ($this->createUrl ("upload_sessions/$authSig/http_close")));
      
    } catch (HttpClientException $e) {
      throw $this->mediaApiException ($e);
    }
  }  

  protected function selectAuthParamsFromUploadMediaParams ($params) {
    $result = array();
    foreach ($params as $k=>$v) {
      if ($this->isIngestAuthParamKey($k)) {
	$result[$k] = $v;
      }
    }
    return $result;
  }

  protected function selectNonAuthParamsFromUploadMediaParams ($params) {
    $result = array();
    foreach ($params as $k=>$v) {
      if (! $this->isIngestAuthParamKey($k)) {
	$result[$k] = $v;
      }
    }
    return $result;
  }

  protected function isIngestAuthParamKey($key) {
    return in_array($key, array("ingest_profile"));
  }

  /**
   * Returns true if the calling browser is an iphone or iPod.
   */
  public function is_user_agent_iphone() {
    $browser = strtolower($_SERVER["HTTP_USER_AGENT"]); 
    return (strpos($browser, 'iphone') !== false ||
	    strpos($browser, 'ipod') !== false);
  }

  ///////////////////////////////////////
  // implementation

  /**
   * @ignore
   */
  protected function __construct ($params, $require_library=false) {
    try {

      if ($require_library && ((! isset($params['library_id'])) || (strlen(trim($params['library_id'])) == 0))) {
	throw new MediaApiException ("library_id required");
      }

      if ((! isset($params['base_url'])) || strlen(trim($params['base_url'])) == 0) {
	throw new MediaApiException ("baseUrl required.");
      }

      if ((! isset($params['account_id'])) || strlen(trim($params['account_id'])) == 0) {
	throw new MediaApiException ("accountId required.");
      }

      if ((! isset($params['license_key'])) || strlen(trim($params['license_key'])) == 0) {
	throw new MediaApiException ("licenseKey required.");
      }
      
      $this->setBaseUrl ($params['base_url']);
      $this->accountId = $params['account_id'];
      $this->libraryId = $params['library_id'];
      $this->licenseKey = $params['license_key'];    
      
      $this->rssAuthRequired = false;
      $this->http = $this->createHttpClient();
      
      $this->setAuthTokenDurationInMinutes(15);
      
      $this->viewToken = null;
      $this->updateToken = null;
      $this->ingestToken = null;          

    } catch (Exception $e) {
      throw $this->mediaApiException ($e);
    }
  }

  protected static function settings_file_path_to_hash ($filepath) {
    return parse_ini_file ($filepath);    
  }

  protected static function create_settings_hash ($baseUrl, $accountId, $libraryId, $licenseKey) {
    return array ("base_url" => $baseUrl,
		  "account_id" => $accountId,
		  "library_id" => $libraryId,
		  "license_key" => $licenseKey);
  }

  protected function mediaApiException ($exception) {
    try {
      // use try/catch to dispatch on exception type
      throw $exception;
    } catch (HttpClientException $httpClientException) {
      if ($httpClientException->getHttpCode() && 
	  $httpClientException->getHttpCode() >= 400 &&
	  $httpClientException->getHttpCode() < 500) {
	return new MediaApiException ("Server returned HTTP code " . $httpClientException->getHttpCode());
      } else {
	return $httpClientException;
      }
    } catch (Exception $exception) {
      return $exception;
    }
  }

  /**
   * @ignore
   * Don't call this - public for testing only.  Call authenticateForView().
   */
  public function getViewAuthToken() {
    if ($this->viewToken == null) {
      $this->viewToken = new AuthToken("view_key", $this->getLicenseKey());
    }
    return $this->viewToken;
  }

  /**
   * @ignore
   */
  protected function getUpdateAuthToken() {
    if ($this->updateToken == null) {
      $this->updateToken = new AuthToken("update_key", $this->getLicenseKey());
    }
    return $this->updateToken;
  }

  /**
   * @ignore
   */
  protected function getIngestAuthToken() {
    if ($this->ingestAuthToken == null) {
      $this->ingestAuthToken = new AuthToken("ingest_key", $this->getLicenseKey());
    }
    return $this->ingestAuthToken;
  }

  /**
   * Returns a valid auth signature.  Provide an AuthToken object, the duration in minutes, and params to include other than the duration parameter.
   * This will return the AuthToken's signature if it hasn't expired yet, otherwise will
   * call the API for a new signature and update the token object with it.
   * Throws MediaApiAuthenticationFailedException if call fails or 
   * token isn't valid.
   *
   * @ignore
   */
  protected function getAuthSignature ($token, $duration, $params=null) {    
    try {

      try {

	$params = ($params ? $params : array());
	
	// if we have one that isn't expired yet, use it
	if (! $token->isExpired ()) {
	  return $token->getToken();
	} else {
	  return $token->renew ($this->fetchAuthToken($token->getName(),
						      $duration,
						      $params),
				$duration);
	}

      } catch (HttpClientException $e) {
	throw mediaApiException ($e);
      }

    } catch (MediaApiException $e) {
      throw $this->mediaApiException (new MediaApiAuthenticationFailedException ($e));
    }
  }

  protected function fetchAuthToken ($name, $duration, $params) {
    try {
      return $this->getHttp()->get ($this->createUrl("api/$name"), 
				    array_merge ($params, 
						 array('duration' => $duration, 
						       'licenseKey' => $this->getLicenseKey())));
    } catch (HttpClientException $e) {
      throw new MediaApiAuthenticationFailedException($e);
    }
  }

  /**
   * @ignore
   */
  protected function createSearchUrl ($type, $criteria, $format) {
    return $this->createScopedUrl ("$type.$format") .
      $this->getHttp()->createQueryString ($this->isAuthRequiredForSearch($format) 
					   
					   ? $this->addViewAuthParam($criteria) 
					   : $criteria);
  }

  /**
   * @ignore
   */
  protected function isAuthRequiredForSearch ($format) {
    // the only case that doesn't require it is rss when rss auth is not required
    return ! ($format == 'rss' && ! $this->isRssAuthRequired());
  }

  /**
   * @ignore
   */
  protected function cleanupItemCustomFields ($item) {
    if (isset($item->custom_fields)) {
      $item->custom_fields = $this->custom_fields_to_hash($item->custom_fields);
    }    
    return $item;
  }

  /**
   * @ignore
   */
  protected function cleanupSearchResults ($items) {
    foreach ($items as $item) {
      $this->cleanupItemCustomFields ($item);
    }  
    return $item;
  }

  /**
   * @ignore
   */
  protected function custom_fields_to_hash($fields) {
    $hash = array();
    foreach ($fields as $field) {
      $hash[$field->name] = $field->value;
    }
    return $hash;
  }
  
  /**
   * @ignore
   */
  protected function confirmIsArray ($array, $videoId, $name) {
  
    if (! $array) {
      throw new Exception ("VideoApi.initVideo: video does not contain $name array.  video ID = $videoId");
    }
    
    if (! is_array($array)) {
      throw new Exception ("VideoApi.initVideo: video->$name is not an array!  video ID = $videoId");
    }
  }
  
  /**
   * @ignore
   */
  protected function createUrl ($subUrl) {
    return substr($subUrl, 0, 7) == "http://"
      ? $subUrl 
      : $this->getBaseUrl() . $subUrl;
  }

  /**
   * @ignore
   */
  protected function createScopedUrl ($subUrl) {
    return $this->createUrl ("companies/" . $this->getAccountId() .
			     ($this->getLibraryId() 
			      ? "/sites/" . $this->getLibraryId() . "/" 
			      : "/") 
			     . $subUrl);
  }

  /**
   * @ignore
   */
  protected function addParam ($param, $value, $params=null) {
    $result = ($params == null ? array() : array_merge($params));
    $result[$param] = $value;
    return $result;
  }
  
  /**
   * @ignore
   */
  protected function addViewAuthParam ($params=null) {
    return $this->addParam ("signature", $this->authenticateForView(), $params);
  }

  /**
   * @ignore
   */
  protected function addUpdateAuthParam ($params=null) {
    return $this->addParam ("signature", $this->authenticateForUpdate(), $params);
  }

  /**
   * @ignore
   */
  protected function addIngestAuthParam ($contributor, $params=null) {
    return $this->addParam ("signature", $this->authenticateForIngest($contributor), $params);
  }

  /**
   * @ignore
   */
  protected function createHttpClient() {
    return new HttpClientCurl();
  }
  
  public function getHttp() {
    return $this->http;
  }
  
  /**
   * Returns the account ID provided to the constructor.
  */
  public function getAccountId() {  
    return $this->accountId;
  }

  /**
   * Returns the ID of this VideoApi object's library.
   * If you created this api object using for_account, scoping the api
   * object to the entire account, this will return null.
  */
  public function getLibraryId() {
    return $this->libraryId;
  }

  public function getLicenseKey() {
    return $this->licenseKey;
  }
  
  /**
   * Returns the base URL provided to the constructor.
  */
  public function getBaseUrl() {
    return $this->baseUrl;
  }
    
  /**
   * @ignore
   */
  protected function setBaseUrl ($baseUrl) {
    $this->baseUrl = (substr($baseUrl, -1) == '/' 
		      ? $baseUrl 
		      : $baseUrl . '/');
  }
  
  /**
   * Returns the flag provided to the constructor, specifying whether
   * this account has RSS authentication turned on, meaning
   * that this VideoApi will obtain and include an authentication signature
   * when producing an RSS URL.
  */
  public function isRssAuthRequired() {
    return $this->rssAuthRequired;
  }

  /**
   * @param rssAuthRequired specifies whether or not your account requires authentication
   * when accessing the RSS API.  This setting is adjustable in the console.
  */
  public function setRssAuthRequired ($required) {
    $this->rssAuthRequired = $required;
  }

  /**
   * @param required specified whether or not the library requires
   * authentication when downloading assets.  If true,
   * this api object will append a valid signature to all
   * download urls.
   */
  public function setAuthRequiredForDownload ($required) {
    $this->authRequiredForDownload = $required;
  }

  /**
   * returns true if this api object will append a valid view
   * signature to all download urls.
   */
  public function isAuthRequiredForDownload() {
    return $this->authRequiredForDownload;
  }
}

class AuthToken {

  private $tokenFileDir;
  private $name;
  private $licenseKey;
  private $token;
  private $durationInMinutes;
  private $startTime;

  private function out ($s) {
    global $authTrace;
    if ($authTrace) {
      echo $s . "\n";
    }
  }

  public function __construct ($name, $licenseKey) {    

    $this->tokenFileDir = sys_get_temp_dir();
    $this->name = $name;    
    $this->licenseKey = $licenseKey;

    if ($licenseKey == null || strlen($licenseKey) == 0) {
      throw new MediaApiException ("licenseKey cannot be null");
    }

    if ($name == null || strlen($name) == 0) {
      throw new Exception ("AuthToken: name cannot be null");
    }
  }

  public function getName() {
    return $this->name;
  }

  public function getPath() {    
    return "$this->tokenFileDir/video_api.php.$this->name.$this->licenseKey.json";
  }

  protected function loadCache() {
    $this->out ("loadTokenFromFile");
    $this->reset();

    // cache file doesn't exist yet
    if (! $this->isCacheFilePresent()) {
      return;
    }

    $props = json_decode (file_get_contents ($this->getPath()));

    // if the file is corrupt, delete it to force a lazy-create next time
    if (! $props) {
      unlink($this->getPath());
      return;
    }

    $this->token = $props->token;
    $this->durationInMinutes = $props->duration_in_minutes;
    $this->startTime = $props->start_time;
  }

  protected function writeCache($token, $durationInMinutes, $startTime) {
    $this->out ("writeCache: $token, $durationInMinutes, $startTime");
    $json = json_encode (array ('token' => $token,
				'duration_in_minutes' => $durationInMinutes,
				'start_time' => $startTime));
    $file = fopen($this->getPath(), "w");
    fwrite ($file, $json);
    fclose ($file);
  }

  public function getToken() {
    $this->out ("getToken");
    if (! $this->token) {
      $this->loadCache();
    }
    $this->out ("token: $this->token");
    return $this->token;
  }

  public function getStartTime() {
    $this->out ("getStartTime");
    if (! $this->startTime) {
      $this->loadCache();
    }
    $this->out ("startTime: $this->startTime");
    return $this->startTime;
  }

  public function getDuration() {
    if (! $this->durationInMinutes) {
      $this->loadCache();
    }
    $this->out ("duration: $this->duration");
    return $this->durationInMinutes;
  }

  public function isExpired () {
    $this->out ("isExpired");

    // if we have no token here or on file, we need a new one
    if ($this->getToken() == null) {
      return true;
    }

    $now = time();

    // pad by 30 seconds to avoid the case of the token expiring on the server
    // just after checking it here.  30 seconds allows for plenty of http 
    // connection delay, but also allows for the case of a 1-minte token,
    // which effectively becomes a 30-second token
    $elapsedSeconds = $now - $this->getStartTime() + 30;
    $this->out ("elapsedSeconds=$elapsedSeconds");
    $elapsedMinutes = $elapsedSeconds / 60;
    $this->out ("elapsedMinutes=$elapsedMinutes");
    $expired = ($elapsedMinutes >= $this->getDuration());
    $this->out ("expired: " . ($expired ? 'true' : 'false'));
    return $expired;
  }

  public function renew($token, $durationInMinutes) {
    $this->out ("renew: $token, $durationInMinutes");
    // update the token file
    $this->writeCache (AuthToken::assertValid($token), 
		       $durationInMinutes, 
		       time());

    $this->reset();

    return $this->getToken();
  }

  protected function reset() {
    $this->out ("reset");
    $this->token = null;
    $this->durationInMinutes = null;
    $this->startTime = null;
  }
  
  public function resetCache() {
    $this->writeCache (null, 0, 0);
  }

  public function isCacheFilePresent() {
    return file_exists ($this->getPath());
  }

  /**
   * @ignore
   */
  public static function assertValid ($signature) {

    $trimmed = trim($signature);
    
    if (strlen($trimmed) == 0) {
      throw new MediaApiAuthenticationFailedException ($trimmed);
    }
    
    $containsLetter = false;
    $containsNumber = false;
    $containsOther = false;
    for ($i = 0; $i < strlen($trimmed); $i++) {
      $c = substr($trimmed, $i, 1);
      
      $containsLetter = $containsLetter || AuthToken::isLetter($c);
      $containsNumber = $containsNumber || AuthToken::isDigit($c);
      
      $containsOther = $containsOther || 
	 (! (AuthToken::isLetter($c) || AuthToken::isDigit($c)));	 
    }
    
    if (! ($containsLetter && $containsNumber && (! $containsOther))) {
      throw new MediaApiAuthenticationFailedException ($trimmed);
    }
    
    return $trimmed;
  }

  /**
   * @ignore
   */
  static function isLetter ($char) {
    return strstr("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", $char);
  }

  /**
   * @ignore
   */
  static function isDigit($char) {
    return strstr("0123456789", $char);
  }
}

class MediaApiException extends Exception {

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
class MediaApiAuthenticationFailedException extends MediaApiException {

  /**
   * You can call this with either one argument or two.
   * If with one, call it with an excetion or a message.
   * If with two, call it with a message and an Exception.
   */
  public function __construct ($exceptionOrSignature) {
    parent::__construct ("Authentication API call failed to return valid signature " . 
			 "(possible invalid license key or exceeded maximum number of allowed " . 
			 "authentication signatures per minute)" . 
			 ($exceptionOrSignature == null ? "" : ", api call returned " . $exceptionOrSignature));
  }
}

?>