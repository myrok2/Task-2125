<?php
namespace aa\search\auth;
use aa\search\config;
use \Firebase\JWT\JWT;

require 'vendor/autoload.php';

function encode($data) {
	$now = time();
	$key = config\get_jwt_signing_key();
	$expiration = strtotime('+7 days', $now);
	$base_token = array(
		'iss' => 'http://www.agilealliance.org',
		'iat' => $now,
		'exp' => $expiration,
	);
	$merged_token = array_merge($base_token, $data);
	return [
		'jwt' => JWT::encode($merged_token, $key),
		'exp' => $expiration,
	];
}

function decode($jwt) {
	$key = config\get_jwt_signing_key();
	return JWT::decode($jwt, $key, array('HS256'));
}