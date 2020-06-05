<?php

use Paradigm\Concepts\Functional as F;

$plugin_dirs = [
	'helpers',
	'edit-profile'
];

/**
 * Muse Use Plugin Loader
 *
 * The logic below will "auto-load"
 * the files in the directory array
 * specified above.
 *
 * @todo allow to take in options
 */

$monad = new F\ListMonad($plugin_dirs);

$load_plugin = $monad
	->bind(function($value) {
		return __DIR__.'/'.$value;
	})
	->bind(function($value) {
		$files_dirs = array_diff(scandir($value), ['.','..']);
		return array_map(function($file) use ($value) {
			return $value.'/'.$file;
		}, $files_dirs);
	})
	->bind(function($value) {
		return array_filter($value, function($file_dir) {
			return is_file($file_dir);
		});
	})
	->bind(function($value) {
		return array_reduce($value, function($carry, $item) {
			require_once($item);
			return $carry;
		}, []);
	});