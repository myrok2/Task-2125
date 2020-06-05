<?php

namespace AgileAlliance\Events\Controllers;
use AgileAlliance\Events\SessionImporter;
use AgileAlliance\Events\SessionAttachmentImporter;

class ImporterController {

  //private $importer;

  public function __construct () {
    // $this->importer = new Importer;
    // $this->importer->isUpload();
  }

  /**
   * Add an Importer menu to the
   * admin sidebar
   */

  public static function addMenu() {
    add_submenu_page('edit.php?post_type=event', 'Importer', 'Importer', 'manage_options', 'aa-event-import', ['AgileAlliance\Events\Controllers\ImporterController', 'formLoader']);
  }

  /**
   * Decide whether to process a file, or
   * display the importer form
   */

  public function formLoader() {
    $importer = new SessionImporter;
    $importer->isUpload();
    if($importer->isUpload && (int) $_FILES['sessionsFile']['error'] === 0) {
      $importer->uploadSessions();
    } elseif ($importer->isUpload && (int) $_FILES['sessionsAttachmentsFile']['error'] === 0) {
      $importer->uploadSessionsAttachments();
    } elseif ($importer->isUpload && (int) $_FILES['sessionsVideosFile']['error'] === 0) {
      $importer->uploadSessionsVideos();
    }
    self::displayMenu($importer->importCount);
  }
  /**
   * Display the reports menu
   */

  public function displayMenu($withResults = false) {
    $message = $withResults ? '<div class="update-nag bsf-update-nag">' . $withResults .' item(s) imported</div>' : '';
    ob_start();
    $select = self::getEventSourceSelect();
    $sessionsCsv = plugins_url( '/../Templates/sessions-import.csv' , __FILE__ );
    $sessionsVideosCsv = plugins_url( '/../Templates/sessions-videos-import.csv' , __FILE__ );
    $sessionsAttachmentsCsv = plugins_url( '/../Templates/sessions-attachments-import.csv' , __FILE__ );
    $markup = file_get_contents(__DIR__ . '/../Templates/ImportsAdmin.php');
    $markup = sprintf($markup, $message, $select, $sessionsCsv, $sessionsVideosCsv, $sessionsAttachmentsCsv);

    echo $markup;
    ob_end_flush();
  }

  protected function getEventsSelect() {
  $events = new \WP_Query(['post_type' => 'event', 'posts_per_page' => -1]);
    $options = "<option>Select Event(s)</option>";
    foreach($events->posts as $e) {
      $options .= "<option value={$e->ID}>{$e->post_title}</option>";
    }

    $select = "<select name='event'>{$options}</select>";
    return $select;
  }

  protected function getEventSourceSelect() {

      return wp_dropdown_categories(
          array(
              'show_option_all'    => '',
              'show_option_none'   => '',
              'option_none_value'  => '-1',
              'orderby'            => 'ID',
              'order'              => 'ASC',
              'show_count'         => 0,
              'hide_empty'         => 0,
              'child_of'           => 0,
              'exclude'            => '',
              'include'            => '',
              'echo'               => 0,
              'selected'           => 0,
              'hierarchical'       => 1,
              'name'               => 'event',
              'id'                 => '',
              'class'              => 'postform',
              'depth'              => 0,
              'tab_index'          => 0,
              'taxonomy'           => 'content_source',
              'hide_if_empty'      => false,
              'value_field'	     => 'term_id',
      ));
  }

}
