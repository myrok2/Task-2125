<?php

if ( ! defined( 'ABSPATH' ) ) exit;
/**
* Truncate post titles where necessary - IE Carousel cards
*/

function the_title_limit($length, $replacer = '...') {
$string = the_title('','',FALSE);
if(strlen($string) > $length)
$string = (preg_match('/^(.*)\W.*$/', substr($string, 0, $length+1), $matches) ? $matches[1] : substr($string, 0, $length)) . $replacer;
echo $string;
}