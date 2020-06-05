<?php
namespace aa\local_navigation;
use function Paradigm\Concepts\Functional\reduce;

const AA_LOCAL_NAVIGATION_SHORTCODE = 'aa-local-navigation';

class Local_Nav_Walker extends \Walker_Nav_Menu {

	public $highlight_active_ancestor;

	function __construct($highlight_active_ancestor = false) {
		$this->highlight_active_ancestor = $highlight_active_ancestor;
	}

	function start_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "\n$indent\n";
	}

	function end_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "$indent\n";
	}

	function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

		$li_classes = [];
		$a_classes = [];
		$li_classes[] = AA_LOCAL_NAVIGATION_SHORTCODE . '__item';
		$li_classes[] = 'menu-item-' . $item->ID;

		$isDirectParent = $item->object_id == get_post()->post_parent;
		$highlighted_ancestor = $this->highlight_active_ancestor && in_array('current-page-ancestor', $item->classes) && $isDirectParent;

		if (in_array('current-menu-item', $item->classes) || $highlighted_ancestor) {
			$li_classes[] = AA_LOCAL_NAVIGATION_SHORTCODE . '__item--active';
			$a_classes[] = AA_LOCAL_NAVIGATION_SHORTCODE . '__link--active';
		}

		$a_classes[] = AA_LOCAL_NAVIGATION_SHORTCODE . '__link';

		$id = $item->ID;
		$li_class_names = join( ' ', $li_classes );
		$a_class_names = join( ' ', $a_classes );

		$output .= $indent . '';

		$attributes  = ! empty( $item->attr_title ) ? ' title="'  . esc_attr( $item->attr_title ) .'"' : '';
		$attributes .= ! empty( $item->target )     ? ' target="' . esc_attr( $item->target     ) .'"' : '';
		$attributes .= ! empty( $item->xfn )        ? ' rel="'    . esc_attr( $item->xfn        ) .'"' : '';
		$attributes .= ! empty( $item->url )        ? ' href="'   . esc_attr( $item->url        ) .'"' : '';
		$attributes .= ! empty( $a_class_names )    ? ' class="'  . esc_attr( $a_class_names    ) .'"' : '';

		$item_output = $args->before;
		$item_output .= "<li class='$li_class_names'><a $attributes>";
		$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
		$item_output .= '</a>';
		$item_output .= $args->after;

		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}


	function end_el( &$output, $item, $depth = 0, $args = array() ) {
		$output .= "\n";
	}
}

\add_shortcode(AA_LOCAL_NAVIGATION_SHORTCODE, function($params) {

	$key = AA_LOCAL_NAVIGATION_SHORTCODE;

	$param_defaults = array(
		// 'arg' => 'value', // Given `[aa_search arg="value"]`, $params['arg'] is available
		'menu' => false,
		'highlight_active_ancestor' => false,
		'color_background' => false,
		'color_text' => false,
		'color_background_active' => false,
		'color_text_active' => false,
		'default_color_scheme' => 'blue',
	);
	$params = shortcode_atts($param_defaults, $params, $key);

	if (!$params['menu']) {
		return '';
	}

	$menu_markup = wp_nav_menu([
		'menu' => $params['menu'],
		'walker' => new Local_Nav_Walker($params['highlight_active_ancestor']),
		'menu_id' => $key . '_' . $params['menu'],
		'menu_class' => implode(' ', [$key, "{$key}--{$params['default_color_scheme']}"]),
		'container' => 'ul',
		'depth' => 1,
		'echo' => false,
	]);

	$style_map = [
		'color_background' => ".{$key}__link { background-color: %s !important }",
		'color_text' => ".{$key}__link { color: %s !important }",
		'color_background_active' => ".{$key}__link--active { background-color: %s !important }",
		'color_text_active' => ".{$key}__link--active { color: %s !important }",
	];

	$override_styles = reduce($params, function($carry, $value, $param_name) use ($style_map) {
		if (0 === strpos($param_name, 'color_') && $value) {
			$carry[] = sprintf($style_map[$param_name], $value);
		}
		return $carry;
	}, []);

	if (count($override_styles) > 0) {
		$style_strings = implode(' ', $override_styles);
		return "<style>$style_strings</style>" . $menu_markup;
	}

	$current_page_id = get_the_ID();
	$menu_items = reduce(wp_get_nav_menu_items($params['menu']), function($carry, $item) use ($current_page_id) {
		// echo "<pre>" . print_r($item, true) . "</pre>";
		$selected = $current_page_id == $item->object_id ? 'selected' : '';
		$carry .= "<option value='{$item->url}' $selected>{$item->title}</option>";
		return $carry;
	}, '');

	$menu_markup .= "<select class='{$key}__dropdown' data-js-dropdown-nav>$menu_items</select>";

	$menu_markup .= "<script>(function($) { $('[data-js-dropdown-nav]').on('change', function() { window.location = $(this).find(':selected').val(); }) })(jQuery)</script>";

	return $menu_markup;

});

\add_action('vc_before_init', function () {
	$menus = \get_terms('nav_menu', array('hide_empty' => true));
	\vc_map(array(
		'name' => 'Local Navigation',
		'base' => AA_LOCAL_NAVIGATION_SHORTCODE,
		'class' => '',
		'category' => 'Agile Alliance Components',
		'params' => array(
			array(
				'type' => 'dropdown',
				'holder' => 'div',
				'edit_field_class' => 'vc_col-xs-12',
				'heading' => 'Menu',
				'param_name' => 'menu',
				'value' => array_reduce($menus, function($carry, $menu_term) {
					$carry["{$menu_term->name} ({$menu_term->count} Items)"] = $menu_term->term_id;
					return $carry;
				}, []),
				'description' => 'Select the menu to display'
			),
			array(
				'type' => 'dropdown',
				'holder' => 'div',
				'edit_field_class' => 'vc_col-xs-12',
				'heading' => 'Color Scheme',
				'param_name' => 'default_color_scheme',
				'value' => array(
					'Agile 101 (Blue)' => 'blue',
					'Resources (Purple)' => 'purple',
					'Events (Yellow)' => 'yellow',
					'Community (Orange)' => 'orange',
					'The Alliance (Default Gray Blue)' => 'grey_blue',
					'Membership (Green)' => 'green',
				),
				'description' => 'Select the default color scheme to display'
			),
			array(
				'type' => 'checkbox',
				'holder' => 'div',
				'heading' => 'Highlight active ancestor',
				'param_name' => 'highlight_active_ancestor',
				'value' => [
					'Enable' => true,
				],
				'description' => 'Menu items will appear active when a descendant page is active'
			),
			array(
				'type' => 'colorpicker',
				'group' => 'Color Override',
				'class' => '',
				'heading' => 'Default Background Color Override',
				'param_name' => 'color_background',
				'description' => 'Override the background color'
			),
			array(
				'type' => 'colorpicker',
				'group' => 'Color Override',
				'class' => '',
				'heading' => 'Default Text Color Override',
				'param_name' => 'color_text',
				'description' => 'Override the text color'
			),
			array(
				'type' => 'colorpicker',
				'group' => 'Color Override',
				'class' => '',
				'heading' => 'Active Item Background Color Override',
				'param_name' => 'color_background_active',
				'description' => 'Override the active item\'s background color'
			),
			array(
				'type' => 'colorpicker',
				'group' => 'Color Override',
				'class' => '',
				'heading' => 'Active Item Text Color Override',
				'param_name' => 'color_text_active',
				'description' => 'Override the active item\'s text color'
			),
		),
	));
});
