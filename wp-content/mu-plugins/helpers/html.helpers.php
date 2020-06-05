<?php namespace Helpers\Html;

function error_container($message) {
	//@todo create a style class in our sass files
	$style = 'margin:200px 0; text-align: center;';
	$_html = '<div style="%s">%s</div>';
	$html = sprintf($_html, $style, $message);
	return $html;
}

function table($options) {

	$html = !empty($options[attributes]) ? '<table ' . attributes($options['attributes']) . '>' :'<table>';
	$html .= table_headings($options['headings']);
	$html .= table_rows($options['rows']);
	$html .= '</table>';

	return $html;
}

function table_headings($headings) {
	$headings_string = '<thead>';
	$headings_string .= '<tr>';
	foreach($headings as $key => $value) {
		$headings_string .= '<th>'. $value . '</th>';
	}
	$headings_string .= '</tr>';
	$headings_string .= '</thead>';
	return $headings_string;
}

function table_rows($rows) {
	$rows_string = '<tbody>';
	foreach($rows as $row => $cell) {
		$rows_string .= '<tr>';
		$rows_string .= table_cells($rows);
		$rows_string .= '</tr>';
	}
	$rows_string .= '</tbody>';
	return $rows_string;
}

function table_cells($cells) {
	$cells = current($cells);
	$cells_string = '';
	if(is_array($cells)) {
		foreach($cells as $key => $value) {
			$cells_string .= '<td>' . $value . '</td>';
		}
	} else {
		$cells_string .= '<td>' . $cells . '</td>';
	}
	return $cells_string;
}

function attributes($attributes) {
	
	$attributes = implode(' ', array_map(function($value, $attribute) {
		$attribute_string = '%s="%s"';
		return sprintf($attribute_string, $attribute, $value);
	}, $attributes, array_keys($attributes)));
	
	return $attributes;
}

function gen_button($attributes) {
	$text = $attributes['text'];
	unset($attributes['text']);

	$attributes = implode(' ', array_map(function($value, $attribute) {
		$attribute_string = '%s="%s"';
		return sprintf($attribute_string, $attribute, $value);
	}, $attributes, array_keys($attributes)));

	$button_html = '<button %s>%s</button>';
	return sprintf($button_html, $attributes, $text);
}

