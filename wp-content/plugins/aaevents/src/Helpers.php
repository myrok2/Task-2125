<?php

/**
 * Agile Alliance Events plugin helpers
 */

namespace AgileAlliance\Events;

class Helpers {

  public static function get_post_and_meta($postId) {
    $post = get_post($postId);
    if($post->ID) {
      $post->meta = get_post_meta($postId);
      return $post;
    } else {
      return false;
    }
  }

  public static function get_user_and_meta($userId) {
    $user = get_user_by('ID', $userId);
    if($user->ID) {
      $user->meta = get_user_meta($userId);
      return $user;
    } else {
      return false;
    }
  }

  public static function log($logItem) {
    $bt = debug_backtrace();
    $caller = array_shift($bt);
    $file = array_pop(explode('/', $caller['file']));
    $logFormat = "[{$file} @ {$caller['line']}] %s";

    if(is_array($logItem) || is_object($logItem)) {
      foreach($logItem as $k => $v) {
        error_log(sprintf($logFormat, "{$k} => {$v}"));
      }
    } else {
       error_log(sprintf($logFormat, $logItem));
    }
  }

  public static function isMembershipCurrent($userId) {
    $user = new \WP_User($userId);
    $memberships = ['s2member_level1', 's2member_level2'];
    foreach ($memberships as $m) {
      if(in_array($m, $user->roles)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Given some field data, render fields markup
   * @TODO a similar method is included in the Form class
   * but it's not as general purpose. Eventually I'd like to
   * get rid of the one in Form class and have it use the
   * one in the Helper class
   * @TODO add select, state, and country fields
   */

  public static function renderFormFields($fields, $formOptions = []) {
      // Set up form options
      $textMarkup = $formOptions['textFieldMarkup'] ?:
                      '<input type="%s" name="%s" id="%s" value="%s" placeholder="%s" class="%s" />';
      $hiddenMarkup = $formOptions['hiddenMarkup'] ?: 
                        '<input type="%s" name="%s" id="%s" value="%s" />';
      $checkboxMarkup = $formOptions['checkboxMarkup'] ?: 
                          '<input type="%s" name="%s" id="%s" value="%s" class="%s" %s />';
      $textareaMarkup = $formOptions['textareaMarkup'] ?: 
                          '<label class="%s" for="%s">%s</label><textarea name="%s" id="%s" cols=%d rows=%d>%s</textarea>';

     // foreach($fields as $f) {
        switch ($fields['type']) {
          case 'text':
          case 'email':
          case 'tel':
            $output .= sprintf($textMarkup, $fields['type'], $fields['metaName'], $fields['metaName'], $fields['value'], $fields['placeholder'], $fields['class']);
            break;
          case 'hidden':
            $output .= sprintf($hiddenMarkup, $fields['type'], $fields['metaName'], $fields['metaName'], $fields['value']);
            break;
          case 'textarea':
            $output .= sprintf($textareaMarkup, $fields['class'], $fields['metaName'], $fields['label'], $fields['metaName'], $fields['metaName'], $fields['cols'], $fields['rows']);
            break;
          case 'checkbox':
            //@TODO handle multiple options. We don't need it right this second,
            // but when we refactor the Form class, we will.
            $output .= sprintf($checkboxMarkup, $fields['type'], $fields['metaName'], $fields['metaName'], $fields['value'], $fields['class'], $fields['checked']);
            break;
          case 'radio':
            //@TODO handle radio. We don't need it right this second,
            // but when we refactor the Form class, we will.
            break;
         
        } // end switch
     // } // end foreach

      return $output;
  }

  public static function event_wp_mail($recipient, $subject, $message, $headers = AA_EVENTS_EMAIL_HEADER, $attachment = null) {
    add_filter('wp_mail_smtp_custom_options', function($phpmailer) {
      $phpmailer->clearReplyTos();
      $phpmailer->From = 'registration@agilealliance.org';
      return $phpmailer;
    });
    return wp_mail($recipient, $subject, $message, $headers, $attachment);
  }

  /**
   * HTML Helpers
   */


  /**
   * @param $attributes array
   *
   * @return mixed
   */
  public static function gen_button($attributes) {
    $text = $attributes['text'];
    unset($attributes['text']);

    $attributes = implode(' ', array_map(function($value, $attribute) {
      $attribute_string = '%s="%s"';
      return sprintf($attribute_string, $attribute, $value);
    }, $attributes, array_keys($attributes)));

    $button_html = '<button %s>%s</button>';
    return sprintf($button_html, $attributes, $text);
  }

  /**
   * @param $group_reg_code
   *
   * @return bool
   */
  public static function is_group_registration($group_reg_code) {
    return ! empty($group_reg_code);
  }

  /**
   * @param $group_contact_email
   * @param null $current_user_email
   *
   * @return bool
   */
  public static function is_group_registration_contact ($group_contact_email, $current_user_email = null) {
    
    if (is_null($current_user_email)) {
      $user = wp_get_current_user();
      $current_user_email = $user->user_email;
    }
    
    return strcasecmp($group_contact_email, $current_user_email) === 0;
  }
  
}