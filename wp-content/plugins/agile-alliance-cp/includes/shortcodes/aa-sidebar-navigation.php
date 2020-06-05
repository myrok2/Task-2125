<?php
namespace aa\sidebar_navigation;
//use function Paradigm\Concepts\Functional\reduce;
const AA_SIDEBAR_NAVIGATION_SHORTCODE = 'aa-sidebar-navigation';

class Sidebar_Navigation_Walker extends \Walker_Nav_Menu {

	function __construct() {
		$this->current_parent_menu_item = null;
		$this->current_item_ancestor = false;
	}

	function start_lvl( &$output, $depth = 0, $args = array() ) {
		$classes = [AA_SIDEBAR_NAVIGATION_SHORTCODE . '__sub-menu'];
		if (!$this->current_item_ancestor) {
			$classes[] = 'collapse';
		}
		$start_class = implode(' ', $classes);
		$id = !is_null($this->current_parent_menu_item) ? "id='menu-id-{$this->current_parent_menu_item}'" : '';
		$indent = str_repeat("\t", $depth);
		$output .= "\n$indent<ul $id class='$start_class'>\n";
		$this->current_parent_menu_item = null;
	}
	function end_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "$indent</ul>\n";
	}
	function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {

		if ($this->has_children) {
			$this->current_parent_menu_item = $item->object_id;
		}

		$this->current_item_ancestor = $item->current_item_ancestor;

		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';
		$li_classes = [];
		$a_classes = [];
		$li_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__item';
		$li_classes[] = 'menu-item-' . $item->ID;
		if (in_array('current-menu-item', $item->classes)) {
			$li_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__item--active';
			$a_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__link--active';
		}
		if ($this->has_children) {
			$li_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__item--has-children';
			$a_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__link--has-children';
		}
		if ($this->has_children && !$item->current_item_ancestor) {
			$a_classes[] = 'collapsed';
		}
		$a_classes[] = AA_SIDEBAR_NAVIGATION_SHORTCODE . '__link';
		$li_class_names = join( ' ', $li_classes );
		$a_class_names = join( ' ', $a_classes );
		$output .= $indent . '';
		$attributes  = ! empty( $item->attr_title )                  ? ' title="'  . esc_attr( $item->attr_title ) .'"' : '';
		$attributes .= ! empty( $item->target )                      ? ' target="' . esc_attr( $item->target     ) .'"' : '';
		$attributes .= ! empty( $item->xfn )                         ? ' rel="'    . esc_attr( $item->xfn        ) .'"' : '';
		$attributes .= ! empty( !$this->has_children && $item->url ) ? ' href="'   . esc_attr( $item->url        ) .'"' : '';
		$attributes .= ! empty( $a_class_names )                     ? ' class="'  . esc_attr( $a_class_names    ) .'"' : '';
		$attributes .= ! empty( $this->has_children )
			? ' data-toggle="collapse" data-target="#menu-id-' . esc_attr( $item->object_id  ) .'"'
			: '';
		$item_output = $args->before;
		$item_output .= "<li data-depth='$depth' class='$li_class_names'><a $attributes>";
		$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
		$item_output .= '</a>';
		$item_output .= $args->after;
		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}
	function end_el( &$output, $item, $depth = 0, $args = array() ) {
		$output .= "\n";
	}
}

\add_shortcode(AA_SIDEBAR_NAVIGATION_SHORTCODE, function($params) {
	$key = AA_SIDEBAR_NAVIGATION_SHORTCODE;
	$param_defaults = array(
		// 'arg' => 'value', // Given `[aa_search arg="value"]`, $params['arg'] is available
		'menu' => false,
	);
	$params = shortcode_atts($param_defaults, $params, $key);
	if (!$params['menu']) {
		return '';
	}
	$menu_markup = wp_nav_menu([
		'menu' => $params['menu'],
		'walker' => new Sidebar_Navigation_Walker(),
		'menu_id' => $key . '_' . $params['menu'],
		'menu_class' => $key . '__ul',
		'container' => 'div',
		'depth' => 2,
		'echo' => false,
	]);
	return "
		<div class='$key'>
			<h2 class='{$key}__title'>Navigation</h2>
			$menu_markup
		</div>
	";
});

\add_action('vc_before_init', function () {
	$menus = \get_terms('nav_menu', array('hide_empty' => true));
	\vc_map(array(
		'name' => 'Sidebar Navigation',
		'base' => AA_SIDEBAR_NAVIGATION_SHORTCODE,
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
			)
		),
	));
});
