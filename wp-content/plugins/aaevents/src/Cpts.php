<?php //src/PluginSetup.php

/**
 * Agile Alliance Events plugin setup
 */

namespace AgileAlliance\Events;

class Cpts {

    protected static $cpts = [
      [
        'singular' => 'event', 
        'plural' => 'events', 
        'description' => 'Agile Alliance Events',
        'taxonomies' => array('category', 'post_tag')
      ],
      [
        'singular' => 'third-party-event',
        'plural'  => 'third-party-events',
        'description' => 'Third Party Events',
        'show_in_menu' => 'edit.php?post_type=event',
          'taxonomies' => array('category', 'post_tag')
      ],
    ];

    public static function registerCpts() {
      foreach(self::$cpts as $cpt) {
            $args = self::makeArguments($cpt);
            register_post_type( strtolower($cpt['singular']), $args );  
      }
      self::registerCustomFields();
    }

    protected static function makeLabels($singular, $plural) {
        $clean_singular = self::cleanName($singular);
        $clean_plural = self::cleanName($plural);

        return [
            'name' => _x( ucwords($clean_singular), strtolower($clean_singular) ),
            'singular_name' => _x( ucwords($clean_singular), strtolower($clean_singular) ),
            'add_new' => _x( 'Add New', strtolower($clean_singular) ),
            'add_new_item' => _x( 'Add New ' . ucwords($clean_singular), strtolower($clean_singular) ),
            'edit_item' => _x( 'Edit ' . ucwords($clean_singular), strtolower($clean_singular) ),
            'new_item' => _x( 'New ' . ucwords($clean_singular), strtolower($clean_singular) ),
            'view_item' => _x( 'View ' . ucwords($clean_singular), strtolower($clean_singular) ),
            'search_items' => _x( 'Search ' . ucwords($clean_plural), strtolower($clean_singular) ),
            'not_found' => _x( 'No ' . strtolower($clean_plural) . ' found', strtolower($clean_singular) ),
            'not_found_in_trash' => _x( 'No ' . strtolower($clean_plural). ' found in Trash', strtolower($clean_singular) ),
            'parent_item_colon' => _x( 'Parent ' . ucwords($clean_singular) . ':', strtolower($clean_singular) ),
            'menu_name' => _x( ucwords($clean_plural), strtolower($clean_singular) ),
        ];
    }

    protected static function makeArguments(array $cptOptions) {
        return [
            'labels' => self::makeLabels($cptOptions['singular'], $cptOptions['plural']),
            'hierarchical' => isset($cptOptions['hierarchical']) ? $cptOptions['hierarchical'] : false,
            'description' => isset($cptOptions['description']) ? $cptOptions['description'] : false,
            'supports' => isset($cptOptions['supports']) ? $cptOptions['supports'] : ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
            'taxonomies' => isset($cptOptions['taxonomies']) ? $cptOptions['taxonomies'] : ['category'],
            'public' => isset($cptOptions['public']) ? $cptOptions['public'] : true,
            'show_ui' => isset($cptOptions['show_ui']) ? $cptOptions['public'] : true,
            'show_in_menu' => isset($cptOptions['show_in_menu']) ? $cptOptions['show_in_menu'] : true,
            'menu_position' => isset($cptOptions['menu_position']) ? $cptOptions['menu_position'] : 10,
            'show_in_nav_menus' => isset($cptOptions['show_in_nav_menus']) ? $cptOptions['show_in_nav_menus'] : true,
            'publicly_queryable' => isset($cptOptions['publicly_queryable']) ? $cptOptions['publicly_queryable'] : true,
            'exclude_from_search' => isset($cptOptions['exclude_from_search']) ? $cptOptions['exclude_from_search'] : false,
            'has_archive' => isset($cptOptions['has_archive']) ? $cptOptions['has_archive'] : true,
            'query_var' => isset($cptOptions['query_var']) ? $cptOptions['query_var'] : true,
            'can_export' => isset($cptOptions['can_export']) ? $cptOptions['can_export'] : true,
            'rewrite' => isset($cptOptions['rewrite']) ? $cptOptions['rewrite'] : true,
            'capability_type' => isset($cptOptions['capability_type']) ? $cptOptions['capability_type'] : 'post',
        ];
    }

    /**
     * Some cpt names may use slashes, underscores, or other
     * symbols that looks silly when doing "Add New custom-post-type"
     * so we replace them all with spaces
     */

    public static function cleanName($name) {
      return preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-Z\d\s]/', ' ', $name));
    }

    /**
     * Register applicable ACF Fields in code for VCS and easy deployment
     */
    protected static function registerCustomFields() {
        if( function_exists('acf_add_local_field_group') ):
            acf_add_local_field_group(array (
                'key' => 'group_571fc1749c37f',
                'title' => 'Third Party Event Meta',
                'fields' => array (
                    array (
                        'key' => 'field_571fc1817678c',
                        'label' => 'Start Date',
                        'name' => 'start_date',
                        'type' => 'date_picker',
                        'instructions' => '',
                        'required' => 1,
                        'conditional_logic' => 0,
                        'wrapper' => array (
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'prepend' => '',
                        'append' => '',
                        'maxlength' => '',
                        'readonly' => 0,
                        'disabled' => 0,
                        'display_format' => 'm/d/Y',
                        'return_format' => 'U',
                        'first_day' => 1,
                    ),
                    array (
                        'key' => 'field_571fc1817678d',
                        'label' => 'End Date',
                        'name' => 'end_date',
                        'type' => 'date_picker',
                        'instructions' => '',
                        'required' => 1,
                        'conditional_logic' => 0,
                        'wrapper' => array (
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'prepend' => '',
                        'append' => '',
                        'maxlength' => '',
                        'readonly' => 0,
                        'disabled' => 0,
                        'display_format' => 'm/d/Y',
                        'return_format' => 'U',
                        'first_day' => 1,
                    ),
                    array (
                        'key' => 'field_571fc1a27678d',
                        'label' => 'Location',
                        'name' => 'location',
                        'type' => 'text',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array (
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'prepend' => '',
                        'append' => '',
                        'maxlength' => '',
                        'readonly' => 0,
                        'disabled' => 0,
                    ),
                ),
                'location' => array (
                    array (
                        array (
                            'param' => 'post_type',
                            'operator' => '==',
                            'value' => 'third-party-event',
                        ),
                    ),
                ),
                'menu_order' => 0,
                'position' => 'acf_after_title',
                'style' => 'default',
                'label_placement' => 'top',
                'instruction_placement' => 'label',
                'hide_on_screen' => '',
                'active' => 1,
                'description' => '',
            ));

        endif;
    }

}