<?php
// 	define( 'DB_NAME', getenv('DB_NAME') );
// 	define( 'DB_USER', getenv('DB_USER') );
// 	define( 'DB_PASSWORD', getenv('DB_PASSWORD') );

	define( 'DB_NAME', 'pndev_pantheon' );
	define( 'DB_USER', 'pndev_pantheon' );
	define( 'DB_PASSWORD', 'pantheon' );
	define( 'DB_HOST', getenv('DB_HOST') );
	define( 'WPLANG', '' );
	define( 'WP_DEBUG', false );
	define( 'SCRIPT_DEBUG', true );

	define( 'WP_HOME' , 'https://pndev.xyz' );
	define( 'WP_SITEURL' , 'https://pndev.xyz' );

	$_SERVER['CACHE_HOST'] = getenv('CACHE_HOST');
	$_SERVER['CACHE_PORT'] = getenv('CACHE_PORT');
	$_SERVER['CACHE_PASSWORD'] = getenv('CACHE_PASSWORD');
