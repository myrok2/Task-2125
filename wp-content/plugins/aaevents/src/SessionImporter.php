<?php

namespace AgileAlliance\Events;
use AgileAlliance\Events\Event;
use AgileAlliance\Events\Helpers;

class SessionImporter
{

  private $buffer;
  private $eventId;
  private $sessionsFieldName = 'sessionsFile';
  private $attachmentFieldName = 'sessionsAttachmentsFile';
  private $videoFieldName = 'sessionsVideosFile';
  private $cptType = 'aa_event_session';
  public $importCount = 0;

  /**
   * Check whether we are loading the form
   * or uploading a file for processing
   */

  public function isUpload() {
    $this->isUpload = isset($_FILES[$this->sessionsFieldName]);
  }

  public function validate() {
    if($_FILES[$this->sessionsFieldName]['type'] = 'text/csv' && (int)$_FILES[$this->sessionsFieldName]['error'] === 0) {
      return true;
    }
    return false;
  }

  /**
   * Open the uploaded file and set the file
   * handler
   */

  public function loadBuffer($filename) {
    if (($fh = fopen($filename, "r")) !== FALSE) {
      while (($row = fgetcsv($fh, 0, ",")) !== FALSE) {
        $this->buffer[] = $row;
      }
      fclose($fh);
      array_shift($this->buffer);
    } else {
      $this->buffer = null;
    }
  }

  /**
   * Reads the CSV data and processes
   * the post creation, relationships, etc.
   */

  public function uploadSessions() {
    $this->eventId = (int) $_POST['event'];
    $filePath = $_FILES[$this->sessionsFieldName]['tmp_name'];
    $this->loadBuffer($filePath);
    $this->createSessions();
  }

  /**
   * Reads the CSV data, and processes importing
   * attachments and attaching them to sessions
   */

  public function uploadSessionsAttachments() {
    $this->eventId = (int) $_POST['event'];
    $filePath = $_FILES[$this->attachmentFieldName]['tmp_name'];
    $this->loadBuffer($filePath);
    $this->attachAttachments();
  }

  /**
   * Reads the CSV data, and processes importing
   * videos and attaching them to sessions
   */

  public function uploadSessionsVideos() {
    $this->eventId = (int) $_POST['event'];
    $filePath = $_FILES[$this->videoFieldName]['tmp_name'];
    $this->loadBuffer($filePath);
    $this->attachVideos();
  }

  /**
   * Create session posts
   * Note: We have the advantage of forcing the CSV
   * file format to use, so we can rely on array indices
   * with confidence.
   * [0] => Session ID
   * [1] => Title
   * [2] => Description
   * [3] => Track name
   * [4] => Session type
   * [5] => Audience Level
   * [6] => Presenter (email)
   * [7] => Co-presenter (email)
   * [8] => Speaker directory (presented as "t" or "f")
   * [9] => Tags
   */

  public function createSessions() {
    foreach($this->buffer as $sessionInfo) {
      if($sessionId = $this->createSession($sessionInfo)) {
        $this->addSessionMeta($sessionId, $this->extractMeta($sessionInfo));
        $this->linkPresenters($sessionId, $sessionInfo);
        $this->linkEvent($sessionId, $this->eventId);
        $this->importCount++;
      }
    }
  }

  /**
   * Insert session post
   */

  protected function createSession($sessionInfo) {
    $post = [
        'post_content' => $sessionInfo[2],
        'post_title' => $sessionInfo[1],
        'post_status' => 'private',
        'post_type' => $this->cptType,
        'ping_status' => 'closed',
        'post_excerpt' => $sessionInfo[2],
      ];
      $postId = wp_insert_post($post);
      if ($sessionInfo[9]) {
          wp_set_post_tags($postId, $sessionInfo[9]);
      }
      return $postId > 0 ? $postId : false;
  }

  /**
   * Insert session metadata
   */

  protected function addSessionMeta($sessionId, $sessionMeta) {

    $tax_map = [
      'audienceLevel' => 'session_aud_level',
      'sessionType' => 'event_session_type',
      'trackName' => 'event_session_cat'
    ];

    foreach($sessionMeta as $metaName => $metaValue) {
      if (array_key_exists($metaName, $tax_map)){
        wp_set_post_terms($sessionId, $metaValue, $tax_map[$metaName]);
      } elseif($metaName == 'speakerDirectory') {
        update_field(EVENT_SESSION_SPEAKER_DIR_FIELD_KEY, $metaValue, $sessionId);
      } else {
        update_post_meta($sessionId, $metaName, $metaValue);
      }
    }
  }

  /**
   * Extract meta fields from session info
   * array
   */

  protected function extractMeta($sessionInfo) {
    $sessionMeta = [
      'oldSessionId' => $sessionInfo[0],
      'trackName' => $sessionInfo[3],
      'sessionType' => $sessionInfo[4],
      'audienceLevel' => $sessionInfo[5],
      'speakerDirectory' => strtolower(trim($sessionInfo[8])) === 't' ? true : false,
    ];

    return $sessionMeta;
  }

  protected function linkPresenters($sessionId, $sessionInfo) {
    $presenter = get_user_by('email', $sessionInfo[6]);
    $copresenter = get_user_by('email', $sessionInfo[7]);

    if($presenter) {
      p2p_type('user_to_event_session_presenter')->connect($presenter->ID, $sessionId,
      ['date' => current_time('mysql')]);
    }

    if($copresenter) {
      p2p_type('user_to_event_session_presenter')->connect($copresenter->ID, $sessionId,
      ['date' => current_time('mysql')]);
    }

  }

  /**
   * Attach event sessions to an event
   */

  protected function linkEvent($sessionId, $eventId) {
    //$test = p2p_type('event_to_event_session')->connect($eventId, $sessionId, ['date' => current_time('mysql')]);
      $test = wp_set_post_terms($sessionId, $eventId,'content_source', true);
      return;
  }

  /**
   * Attach attachments to sessions
   */

  public function attachAttachments() {
    foreach($this->buffer as $attachmentInfo) {
      if($attachment = $this->attachAttachment($attachmentInfo)) {
        $this->importCount++;
      }
    }
  }

  /**
   * Attach an attachment to a session
   * [0] => Session ID
   * [1] => Original Attachment ID
   * [2] => Attachment Filename
   * [3] => URL
   */

  public function attachAttachment($attachmentInfo) {
    $args = [
      'post_type' => $this->cptType,
      'posts_per_page' => 1,
      'meta_query'      => [
        'relation' => 'AND',
        [
          'key'     => 'oldSessionId',
          'value'   => $attachmentInfo[0],
          'compare' => '='
        ],
      ]
    ];

    $query = new \WP_Query($args);

    if($query->post_count > 0) {
      $field_key = EVENT_SESSION_ATTACHMENT_FIELD_KEY;
      $post_id = $query->posts[0]->ID;
      $value = get_field($field_key, $post_id);
      $value[] = array(
          "title" => $attachmentInfo[2],
          "url" => $attachmentInfo[3]);
      update_field( $field_key, $value, $post_id );
      return true;
    }
    return false;
  }

  /**
   * Attach videos to sessions
   */

  public function attachVideos() {
    foreach($this->buffer as $videoInfo) {
      if($video = $this->attachVideo($videoInfo)) {
        $this->importCount++;
      }
    }
  }

   /**
   * Attach an video to a session
   * [0] => Session ID
   * [1] => Video CPT Post Id
   */

  public function attachVideo($videoInfo) {
    $args = [
      'post_type' => $this->cptType,
      'posts_per_page' => 1,
      'meta_query'      => [
        'relation' => 'AND',
        [
          'key'     => 'oldSessionId',
          'value'   => $videoInfo[0],
          'compare' => '='
        ],
      ]
    ];

    $query = new \WP_Query($args);

    if($query->post_count > 0) {
      p2p_type('video_to_event_session')->connect($videoInfo[1], $query->posts[0]->ID);
      return true;
    }
    return false;
  }





}
