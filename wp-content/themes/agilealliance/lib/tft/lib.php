<?php namespace Tft;

  /**
  * 352inc specific namespace with specific debug class
  **/

  class Debug {
    /**
    * Variable debugger
    * $var is the object you want to Output
    * $how is how you'd like to output the $var
    **/
    static function pre ($var, $how = 'default') {
      echo '<pre>';
      switch($how){
        case 'dump':
          var_dump($var);
        break;
        default:
          print_r($var);
      }
      echo '</pre>';
    }
  }

  /**
  *
  **/
  class Registartion {
    public $entry_id = '';
    public $entry_form_data = array();
    public $user_id = '';
    public $s2_custom_fields = array();
    public $s2_access_level = '';

    public function __construct () {
      $sanitized_vars = Sanitization::request_get_sanitized_vars();
      extract($sanitized_vars);

      $this->entry_id = s2member_decrypt($ei);
      $this->user_id = ($ui) ? : NULL;
      $this->entry_form_data  = \GFAPI::get_entry($this->entry_id);

      $this->set_s2_specific_data();
    }

    private function set_s2_specific_data () {
      $u_id = $this->user_id;
      if($u_id) {
        $this->s2_custom_fields = get_user_option(
          's2member_custom_fields',
          $u_id
        );
        $this->s2_access_level = get_user_field(
          's2member_access_level',
          $u_id
        );
      }
    }

  }

  /**
  *
  **/
  Class Sanitization {
    static function request_get_sanitized_vars () {
      $_get = array_map('sanitize_text_field',$_GET);
      return $_get;
    }
  }
