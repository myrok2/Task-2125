<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class Agile_Alliance_CP_Taxonomy {

                /**
                 * The name for the taxonomy.
                 * @var 	string
                 * @access  public
                 * @since 	1.0.0
                 */
                public $taxonomy;

                /**
                 * The plural name for the taxonomy terms.
                 * @var 	string
                 * @access  public
                 * @since 	1.0.0
                 */
                public $plural;

                /**
                 * The singular name for the taxonomy terms.
                 * @var 	string
                 * @access  public
                 * @since 	1.0.0
                 */
                public $single;

                /**
                 * The true or false selection for categories vs tags.
                 *  True = Categories   /   False = Tags.
                 * @var   string
                 * @access  public
                 * @since   1.0.0
                 */
                public $categories;

                /**
                 * The defined slug for the archive / custom taxonomy or tags
                 * @var   string
                 * @access  public
                 * @since   1.0.0
                 */
                public $defined_slug;

                /**
                 * The true or false selection for hierarchical slugs.
                 *  True = includes base post type   /   False = just the slug.
                 * @var   string
                 * @access  public
                 * @since   1.0.0
                 */
                public $hierarchical_slugs;

                // Should term be public
                public $is_public;

                /**
                 * The array of post types to which this taxonomy applies.
                 * @var 	array
                 * @access  public
                 * @since 	1.0.0
                 */
                public $post_types;

	public function __construct ( $taxonomy = '', $plural = '', $single = '', $categories = '', $defined_slug = '', $hierarchical_slugs = '', $post_types = array(), $is_public = true ) {


		if ( ! $taxonomy || ! $plural || ! $single ) return;

            // Taxonomy name and labels
                $this->taxonomy = $taxonomy;
                $this->plural = $plural;
                $this->single = $single;
                $this->categories = $categories;
                $this->defined_slug = $defined_slug;
                $this->hierarchical_slugs = $hierarchical_slugs;
                $this->$is_public = $is_public;

            if ( ! is_array( $post_types ) ) {
                $post_types = array( $post_types );
            }
            $this->post_types = $post_types;


		// Register taxonomy
		add_action('init', array( $this, 'register_taxonomy' ), 0 );
	}

	/**
	 * Register new taxonomy
	 * @return void
	 */
	public function register_taxonomy () {

        $labels = array(
            'name' => $this->plural,
            'singular_name' => $this->single,
            'menu_name' => $this->plural,
            'all_items' => sprintf(  'All %s' , $this->plural ),
            'edit_item' => sprintf(  'Edit %s' , $this->single ),
            'view_item' => sprintf(  'View %s' , $this->single ),
            'update_item' => sprintf(  'Update %s' , $this->single ),
            'add_new_item' => sprintf(  'Add New %s' , $this->single ),
            'new_item_name' => sprintf(  'New %s Name' , $this->single ),
            'parent_item' => sprintf(  'Parent %s' , $this->single ),
            'parent_item_colon' => sprintf(  'Parent %s:' , $this->single ),
            'search_items' =>  sprintf(  'Search %s' , $this->plural ),
            'popular_items' =>  sprintf(  'Popular %s' , $this->plural ),
            'separate_items_with_commas' =>  sprintf(  'Separate %s with commas' , $this->plural ),
            'add_or_remove_items' =>  sprintf(  'Add or remove %s' , $this->plural ),
            'choose_from_most_used' =>  sprintf(  'Choose from the most used %s' , $this->plural ),
            'not_found' =>  sprintf(  'No %s found' , $this->plural ),
        );

        $rewrite = array(
          'slug'                       => $this->defined_slug,
//          'with_front'                 => true,  /* Use taxonomy slug as URL base*/
          'hierarchical'               => $this->hierarchical_slugs,  /*Allow hierarchical URLs*/
        );

        $args = array(
            'label' => $this->plural,
            'labels' => $this->taxonomy . '_labels', $labels,
            'public' => $this->is_public,
            'show_ui' => true,
            'show_in_nav_menus' => true,
            'show_tagcloud' => true,
            'meta_box_cb' => null,
            'show_admin_column' => true,
            'update_count_callback' => '',
            'query_var' => $this->taxonomy,
            'rewrite' => $rewrite,
            'sort' => '',
            'hierarchical' => $this->categories, /* for cats use TRUE in agile-alliance-cp */
        );

        register_taxonomy( $this->taxonomy, $this->post_types, $args );
    }

}
