<?php
use aa\search\{auth, config, es};

const RESULT_PAGE_SIZE = 9;

require 'vendor/autoload.php';
require './auth.php';
require './config.php';
require 'indexer/elasticsearch.aws.php';

header('Content-Type: application/json');

function dieWithError($msg) {
	echo json_encode(['error' => $msg]);
	die();
}

// Require HTTPS when on Pantheon
if (isset($_SERVER['PANTHEON_ENVIRONMENT']) &&
    ($_SERVER['HTTPS'] === 'OFF') &&
    (php_sapi_name() != "cli")) {
	if (!isset($_SERVER['HTTP_X_SSL']) ||
	    (isset($_SERVER['HTTP_X_SSL']) && $_SERVER['HTTP_X_SSL'] != 'ON')) {
		header('HTTP/1.0 301 Moved Permanently');
		header('Location: https://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
		exit();
	}
}

$is_dev = !isset($_ENV['PANTHEON_ENVIRONMENT']) || $_ENV['PANTHEON_ENVIRONMENT'] !== 'live';

if ($is_dev) {
	header('Access-Control-Allow-Origin: http://localhost:8080');
	header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	dieWithError($is_dev ? 'Error: Invalid HTTP method' : true);
}

try {
	$params = json_decode(file_get_contents('php://input'), true);
	$user = auth\decode($params['jwt']);
} catch (Exception $ex) {
	dieWithError($is_dev ? "Error: JWT decode failed:\n\n" . $ex : true);
}

try {
	$client = es\get_es_client();
} catch (Exception $ex) {
	dieWithError($is_dev ? "Error: Failed to build ES client\n\n" . $ex : true);
	die();
}

$startIndex = (isset($params['page']) ? (((int) $params['page'] - 1) * RESULT_PAGE_SIZE) : 0);
$endIndex = (isset($params['page']) ? ((int) $params['page'] * RESULT_PAGE_SIZE) : RESULT_PAGE_SIZE);
$infiniteScroll = (isset($params['infinite']) ? (boolean) $params['infinite'] : false);
if ($infiniteScroll) {
    $params = [
        'index' => config\get_index_name(),
        'type' => 'resource',
        'body' => $params['queryBody'],
        'size' => $endIndex,
        'from' => 0
    ];
} else {
    $params = [
        'index' => config\get_index_name(),
        'type' => 'resource',
        'body' => $params['queryBody'],
        'size' => RESULT_PAGE_SIZE,
        'from' => $startIndex
    ];
}

try {
	$res = $client->search($params);
	echo json_encode($res);
	die();
} catch (Exception $ex) {
	dieWithError($is_dev ? "Error: Failed to run query\n\n" . $ex : '');
}
