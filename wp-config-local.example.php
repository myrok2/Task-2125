<?php
	define( 'DB_NAME', getenv('DB_NAME') );
	define( 'DB_USER', getenv('DB_USER') );
	define( 'DB_PASSWORD', getenv('DB_PASSWORD') );
	define( 'DB_HOST', getenv('DB_HOST') );
	define( 'WPLANG', '' );
	define( 'WP_DEBUG', false );
	define( 'SCRIPT_DEBUG', false );

	define( 'WP_HOME' , 'http://aa.docker.localhost:9000' );
	define( 'WP_SITEURL' , 'http://aa.docker.localhost:9000' );

	$_SERVER['CACHE_HOST'] = getenv('CACHE_HOST');
	$_SERVER['CACHE_PORT'] = getenv('CACHE_PORT');
	$_SERVER['CACHE_PASSWORD'] = getenv('CACHE_PASSWORD');
