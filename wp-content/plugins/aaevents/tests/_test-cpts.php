<?php

use phpmock\phpunit\PHPMock;
use AgileAlliance\Events\Cpts;
use AgileAlliance\Events\Relaptionships;

class TestCpts extends \PHPUnit_Framework_TestCase {
    use PHPMock;

    public function test_clean_names()
    {
        $p2pReg = $this->getFunctionMock('p2p_register_connection_type');
        $p2pReg->expects($this->once())
               ->willReturn(true);
        $cpt = new Cpts;
        $this->assertEquals('no dashes', $cpt->cleanName('no-dashes'));
        $this->assertEquals('no dashes', $cpt->cleanName('no*dashes'));
        $this->assertEquals('no dashes', $cpt->cleanName('no^dashes'));
        $this->assertEquals('no dashes', $cpt->cleanName('no!@#$%^&*()_+{}[];\'dashes'));
    }

}