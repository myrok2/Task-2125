<?php //src/Event.php

/**
 * Agile Alliance event class
 */

namespace AgileAlliance\AdminFields;
//use AgileAlliance\Events\Forms as Form;
use AgileAlliance\Events\Helpers as Helpers;

class AdminFields {

  public static $level2Fields = [
      ['label' => 'Max Memberships', 'type' => 'text', 'metaName' => 'aa_max_memberships'],
      ['label' => 'Invoice Paid', 'type' => 'text', 'metaName' => 'aa_invoice_paid'],
      ['label' => 'Invoice Paid Entry ID', 'type' => 'text', 'metaName' => 'aa_invoice_paid_entry_id'],
      ['label' => 'Organization Created', 'type' => 'text', 'metaName' => 'aa_created_organization'],
      ['label' => 'Membership Type', 'type' => 'text', 'metaName' => 'aa_membership_type'],
    ];

  public static $level01Fields = [
      ['label' => 'Membership Type', 'type' => 'text', 'metaName' => 'aa_membership_type'],
    ];

  //We only want to show and/or update these fields for level 2 peeps
  public static function checkLevel2() {
    $editedUser = get_user_by('id', $_REQUEST['user_id']);
    if($editedUser->roles) {
      return in_array('s2member_level2', $editedUser->roles);  
    } else {
      return false;
    }
  }

  public static function getUserData($userId = false) {
    $user = $userId ? Helpers::get_user_and_meta($userId) : Helpers::get_user_and_meta($_GET['user_id']);

    $connectedOrg = new \WP_Query([
        'connected_type' => 'user_to_organization_member',
        'connected_items' => $user,
        'posts_per_page' => -1,
        'post_type' => 'aa_organizations',
        'paging' => 'nopaging',
        'post_status' => 'any',
      ]);
    
    $user->organization = $connectedOrg->post;
    
    return $user;
  } 

  public function saveMetaFields() {
    // if(! self::checkLevel2()) {
    //   return;
    // }

    $fields = [];

    if (!empty(self::checkLevel2())) {
      $fields = self::$level2Fields + self::$level01Fields;
    } else {
      $fields = self::$level01Fields;
    }

    foreach($fields as $pb) {
      update_user_meta($_POST['user_id'], $pb['metaName'], $_POST[$pb['metaName']]);
    }

  }

  public function showMetaFields() {

    $user = self::getUserData();
    $output = '<hr>';
    $fieldRow = file_get_contents( __DIR__ . '/Templates/AdminFieldRow.php' );
    $fieldTable = file_get_contents( __DIR__ . '/Templates/AdminFieldTable.php' );

    if(self::checkLevel2()) {
      $renderedFields = Helpers::renderFormFields(self::$level2Fields);

      foreach(self::$level2Fields as $pb) {
        $pb['value'] = $user->meta[$pb['metaName']][0];
        $fieldRows .= sprintf($fieldRow, $pb['label'], Helpers::renderFormFields($pb), '');
      }

      $output .= sprintf($fieldTable, $fieldRows);
      $output .= '<p>Organization: </p><a href="' . get_edit_post_link( $user->organization->ID) . '">' . $user->organization->post_title . '</a>';
    } else {
      $renderedFields = Helpers::renderFormFields(self::$level01Fields);

      foreach(self::$level01Fields as $pb) {
        $pb['value'] = $user->meta[$pb['metaName']][0];
        $fieldRows .= sprintf($fieldRow, $pb['label'], Helpers::renderFormFields($pb), '');
      }

      $output .= sprintf($fieldTable, $fieldRows);
    }



    echo $output;
  }
}
