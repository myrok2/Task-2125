<?php

require_once ('MediaApi.php');

class AudioApi extends MediaApi {

  /**
   * Creates a AudioApi object scoped to the given library
   * within the given account.
   * 
   * @param string $baseUrl the service base url - see online documentation for this value.
   * @param string $accountId the account's ID
   * @param string $libraryId the ID of the library within the account to work with
   * @param string $licenseKey the license key to use for all authorization requests.  it can be the license key of a user associated with the given library, or an account-wide user.
   * @return AudioApi the created AudioApi object
  */
  public static function for_library ($baseUrl, $accountId, $libraryId, $licenseKey) {
    return new AudioApi (MediaApi::create_settings_hash ($baseUrl, $accountId, $libraryId, $licenseKey), true);
  }

  /**
   * Creates a AudioApi object scoped to the entire account (i.e. not to a specific library within the account).
   * 
   * @param string $baseUrl the service base url - see online documentation for this value.
   * @param string $accountId the account's ID
   * @param string $licenseKey the license key to use for all authorization requests.  it must be the license key for an account-level user, not a user assigned to a specific library.
   * @return AudioApi the created AudioApi object
   *
   * Note: to call the video ingest or import methods, you must
   * call AudioApi.for_library instead, or those methods will
   * raise an error.
  */
  public static function for_account ($baseUrl, $accountId, $licenseKey) {
    return new AudioApi (MediaApi::create_settings_hash ($baseUrl, $accountId, null, $licenseKey), false);
  }

  /**
   * Takes the filepath of a PHP .ini file and parses it for
   * the following values: base_url, account_id, library_id, license_key.
   * library_id is optional.
   * 
   * @return AudioApi object initialized with the values in the ini file.
   */
  public static function from_settings_file ($filepath) {
    return new AudioApi (MediaApi::settings_file_path_to_hash ($filepath));
  }

  /**
   * @param array $conf a hash containing the following keys: base_url, 
   * account_id, license_key, and optionally library_id.
   * @return AudioApi object initialized with the values in the hash.
   */
  public static function from_props ($conf) {
    return new AudioApi ($conf);
  }

    /**
   * Returns the URL of an audio track RSS feed for all tracks matching the
   * given criteria.
   * 
   * If this api object was created using for_library, the
   * RSS feed is restricted to the library.  If for_account was used,
   * the results are from the entire account.
   * 
   * See the online documentation for details of the accepted criteria.
  */
  public function getTracksRssUrl ($criteria) {
    return $this->createTrackSearchUrl ($criteria, 'rss');
  }

  /**
   * Calls the Audio Tracks Search API, scoping to the account or library
   * depending on whether this api object was constructed using
   * for_account or for_library.
   * 
   * @param format optional format type.  if omitted, this method returns the metadata as a tree of php objects, generated by obtaining the search results in json format and parsing it.
   * 'xml' returns the search results as an xml string.
   * 'json' returns the search results as a json string.
   * 
   * See the online documentation for details
   * of accepted search criteria.
  */
  public function searchTracks ($criteria, $format=null) {

    if ($format == null) {
      
      $page = json_decode ($this->searchTracks ($criteria, 'json'));

      $this->cleanupSearchResults ($page->tracks);

      return $page;

    } else {
      try {
	return $this->getHttp()->get ($this->createTrackSearchUrl($criteria, 
								  $format));
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }      
    }
  }

  /**
   * Calls the Track Metadata API.
   * 
   * @param $trackId
   * @param $format either 'xml' or 'json'.  if provided, returns the string result in that format.  if not provided, returns the result of parsing the json result into a PHP object tree.
   * 
   */
  public function getTrackMetadata ($trackId, $format=null) {

    if ($format == null) {
      return $this->cleanupItemCustomFields(json_decode ($this->getTrackMetadata ($trackId, 'json')));
    } else {
      try {
	return $this->getHttp()->get ($this->createUrl ("tracks/$trackId.$format"),
				      $this->addViewAuthParam());
      } catch (HttpClientException $e) {
	throw $this->videoApiException ($e);
      }
    }
  }

  protected function __construct ($params, $require_library=false) {
    parent::__construct ($params, $require_library);
  }

  /**
   * @ignore
   */
  protected function createTrackSearchUrl ($criteria, $format) {
    return $this->createSearchUrl ("tracks", $criteria, $format);
  }

  /**
   * @ignore
   */
  protected function audioApiException ($exception) {
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
      throw new AudioApiAuthenticationFailedException ($e);
    } catch (AudioApiException $e) {
      throw $e;
    } catch (MediaApiException $e) {
      throw new AudioApiException ($e);
    }
  }
}

class AudioApiException extends MediaApiException {

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
class AudioApiAuthenticationFailedException extends AudioApiException {

  public function __construct ($source) {
    parent::__construct ($source);
  }
}

