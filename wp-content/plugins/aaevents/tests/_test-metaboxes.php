<?php

use AgileAlliance\Events\Metaboxes;

class TestMetaboxes extends \PHPUnit_Framework_TestCase {
    
    public function test_meta_name()
    {
        $mb = new Metaboxes;
        $this->assertEquals('someName', $mb->metaName('some name'));
        $this->assertEquals('thisIsCool', $mb->metaName('This is Cool'));
        $this->assertEquals('withSymbols', $mb->metaName('with-symbols'));
        $this->assertEquals('lotsOfSymbolsBleh', $mb->metaName('lots of symbols!@#$%^&*()_+{}[];\'bleh'));
    }

}