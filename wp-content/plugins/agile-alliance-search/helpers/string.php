<?php
namespace aa\search\helpers;

// Sanitize functions courtesy of http://stackoverflow.com/a/11627115/2354352

//To remove all the hidden text not displayed on a webpage
function strip_html_tags($str){
	$str = preg_replace('/(<|>)\1{2}/is', '', $str);
	$str = preg_replace(
		array(// Remove invisible content
			'@<head[^>]*?>.*?</head>@siu',
			'@<style[^>]*?>.*?</style>@siu',
			'@<script[^>]*?.*?</script>@siu',
			'@<noscript[^>]*?.*?</noscript>@siu',
			'@<div class="widget widget_nav_menu">.*?</div>@siu',
		),
		"", //replace above with nothing
		$str );
	$str = remove_excessive_whitespace($str);
	$str = strip_tags($str);
	$str = preg_replace(
		array(// Remove arbitrary text leftover from VC
			'/^\W+RESOURCES\W+/',
			'/^\W+GLOSSARY\W+/',
			'/^\W+THE ALLIANCE\W+/',
			'/^\W+EVENTS\W+/',
		),
		'', //replace above with nothing
		$str);
	return $str;
} //function strip_html_tags ENDS

//To replace all types of whitespace with a single space
function remove_excessive_whitespace($str) {
	$result = $str;
	foreach (array(
		"  ", " \t",  " \r",  " \n",
		"\t\t", "\t ", "\t\r", "\t\n",
		"\r\r", "\r ", "\r\t", "\r\n",
		"\n\n", "\n ", "\n\t", "\n\r",
	) as $replacement) {
		$result = str_replace($replacement, $replacement[0], $result);
	}
	return $str !== $result ? remove_excessive_whitespace($result) : $result;
}