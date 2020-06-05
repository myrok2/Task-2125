<?php

use AgileAlliance\Events\Forms;

class TestForms extends \PHPUnit_Framework_TestCase {
    
    public function setup() {
      $fields = [['label' => 'First Name', 'type' => 'text', 'metaName' => 'firstName']];
    }
    public function test_text_field_rendering()
    {
        $form = new Forms;
        $markup = $form->renderFields($fields);
        // $this->assertEquals('no dashes', $cpt->cleanName('no-dashes'));
        // $this->assertEquals('no dashes', $cpt->cleanName('no*dashes'));
        // $this->assertEquals('no dashes', $cpt->cleanName('no^dashes'));
        // $this->assertEquals('no dashes', $cpt->cleanName('no!@#$%^&*()_+{}[];\'dashes'));
    }

}