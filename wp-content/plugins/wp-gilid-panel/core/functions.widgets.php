<?php
/*
 * Create Custom Sidebar for GilidPanel Contents
 */

//Register Sidebar
register_sidebar(array(
  'name' => __( 'GilidPanel Widgets' ),
  'id' => 'gilidpanel-sidebar',
  'description' => __( 'Widgets in this area will be shown on the panel sidebar.' ),
  'before_widget' => '<li id="%1$s" class="widget %2$s">',
  'after_widget'  => '</li>'
));

function gldpnl_add_menu_parent_class( $items ) {
    $parents = array();
    foreach ( $items as $item ) {
        if ( $item->menu_item_parent && $item->menu_item_parent > 0 ) {
            $parents[] = $item->menu_item_parent;
        }
    }
 
    foreach ( $items as $item ) {
        if ( in_array( $item->ID, $parents ) ) {
            $item->classes[] = 'gldpnl-has-children';
        }
    }
 
    return $items;
}
add_filter( 'wp_nav_menu_objects', 'gldpnl_add_menu_parent_class' );

?>