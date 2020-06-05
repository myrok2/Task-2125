<?php

if( !defined('WPINC') ) // MUST have WordPress.
    exit('Do not access this file directly.');

define('AA_S2_MEMBERSHIP_ENDPOINT_URL', '/check-membership');
define('AA_S2_MEMBERSHIP_ENDPOINT_TOKEN_BASE', 'AgI113@11i@nC3');
$keyMod = isset($_SERVER['PANTHEON_ENVIRONMENT']) ? $_SERVER['PANTHEON_ENVIRONMENT'] : 'dev';

$generateXmlResult = function($result, $message) {
    $string = "<?xml version='1.0' encoding='UTF-8'?><data><result>$result</result>";
    if (!empty($message))
        $string .= "<message>$message</message>";
    $string .= "</data>";
    return $string;
};

add_action('init', function() use ($generateXmlResult, $keyMod) {

    if (strtok($_SERVER["REQUEST_URI"],'?') !== AA_S2_MEMBERSHIP_ENDPOINT_URL || $_SERVER['REQUEST_METHOD'] !== 'POST') return;

    $dataPOST = trim(file_get_contents('php://input'));
    $xmlData = simplexml_load_string($dataPOST, 'SimpleXMLElement',
        LIBXML_NOERROR | LIBXML_NOWARNING );

    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    header("Content-type: text/xml; charset=utf-8");

    if (!$xmlData){
        echo $generateXmlResult('', 'PARSE_ERROR');
        exit;
    }

    if ($xmlData->api_key != sha1(AA_S2_MEMBERSHIP_ENDPOINT_TOKEN_BASE . '-' . $keyMod)){
        echo $generateXmlResult('', 'INVALID_API_KEY');
        exit;
    }

    $sanitizedEmail = trim(filter_var($xmlData->email, FILTER_SANITIZE_EMAIL));

    if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
        echo $generateXmlResult('', 'INVALID_EMAIL');
        exit;
    }

    $user = get_user_by('email', $sanitizedEmail);

    if (!$user) {
        echo $generateXmlResult(0, '');
        exit;
    }

    $appliedMemberRoles = array_intersect(['s2member_level2', 's2member_level1'], $user->roles);
    $returnVal = (int) (count($appliedMemberRoles) > 0);

    echo $generateXmlResult($returnVal, null);

    exit;

});