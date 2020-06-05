<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class Agile_Alliance_CP_Post_Type {

	/**
	 * The name for the custom post type.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $post_type;

	/**
	 * The plural name for the custom post type posts.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $plural;

	/**
	 * The singular name for the custom post type posts.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $single;

	/**
	 * The description of the custom post type.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $description;

	/**
	 * The position of the menu icon.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $menu_position;

	/**
 * The menu icon to for this item (See WP Codex).
 * @var 	string
 * @access  public
 * @since 	1.0.0
 */
	public $menu_icon;

	/**
	 * The slug of the custom post type.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $slug;

	/**
	 * Define if custom post type has archive.
	 * @var 	string
	 * @access  public
	 * @since 	1.0.0
	 */
	public $has_archive;

	public function __construct ( $post_type = '', $plural = '', $single = '', $description = '', $menu_position =
	'', $menu_icon = '', $slug = '', $has_archive = '') {

		if ( ! $post_type || ! $plural || ! $single ) return;

		// Post type name and labels
		$this->post_type = $post_type;
		$this->plural = $plural;
		$this->single = $single;
		$this->description = $description;
		$this->menu_position = $menu_position;
		$this->menu_icon = $menu_icon;
		$this->slug = $slug;
		$this->has_archive = $has_archive;

		// Register post type
		add_action( 'init' , array( $this, 'register_post_type' ), 0 );

		// Display custom update messages for posts edits
		add_filter( 'post_updated_messages', array( $this, 'updated_messages' ) );
		add_filter( 'bulk_post_updated_messages', array( $this, 'bulk_updated_messages' ), 10, 2 );
	}

	/**
	 * Register new post type
	 * @return void
	 */
	public function register_post_type () {

		$labels = array(
			'name' => $this->plural,
			'singular_name' => $this->single,
			'name_admin_bar' => $this->single,
			'add_new' => _x( 'Add New', $this->post_type , 'agile-alliance-cp' ),
			'add_new_item' => sprintf(  'Add New %s' , $this->single ),
			'edit_item' => sprintf(  'Edit %s' , $this->single ),
			'new_item' => sprintf(  'New %s' , $this->single ),
			'all_items' => sprintf(  'All %s' , $this->plural ),
			'view_item' => sprintf(  'View %s' , $this->single ),
			'search_items' => sprintf(  'Search %s' , $this->plural ),
			'not_found' =>  sprintf(  'No %s Found' , $this->plural ),
			'not_found_in_trash' => sprintf(  'No %s Found In Trash' , $this->plural ),
			'parent_item_colon' => sprintf( __( 'Parent %s' ), $this->single ),
			'menu_name' => $this->plural,
		);

		$rewrite = array(
			'slug'                => $this->slug,
			'with_front'          => true,
			'pages'               => true,
			'feeds'               => true,
		);

		$args = array(
			'labels' => apply_filters( $this->post_type . '_labels', $labels ),
			'description' => $this->description,
			'public' => true,
			'publicly_queryable' => true,
			'exclude_from_search' => false,
			'show_ui' => true,
			'show_in_menu' => true,
			'show_in_nav_menus' => true,
			'query_var' => true,
			'can_export' => true,
			'rewrite' => $rewrite,
			'capability_type' => 'post',
			'has_archive' => $this->has_archive,
			'hierarchical' => true,
			'supports' => array( 'title', 'author', 'editor', 'revisions', 'publicize', 'excerpt', 'comments', 'thumbnail', 'page-attributes' ),
			'menu_position' => $this->menu_position,
			'menu_icon' => $this->menu_icon,
			'taxonomies' => array('category', 'post_tag')
		);

		register_post_type( $this->post_type,  $args );
	}


	/** NOTE ABOUT HIERARCHICAL
	Note: this parameter was planned for Pages. Be careful, when choosing it for your custom post type - if you are planning to have many entries (say - over 100), you will run into memory issue. With this parameter set to true WordPress will fetch all entries of that particular post type, together with all meta data, on each administration page load for your post type.
	**/

	/**
	 * Set up admin messages for post type
	 * @param  array $messages Default message
	 * @return array           Modified messages
	 */
	public function updated_messages ( $messages = array() ) {
	  global $post, $post_ID;

	  $messages[ $this->post_type ] = array(
	    0 => '',
	    1 => sprintf( '%1$s updated. %2$sView %3$s%4$s.', $this->single, '<a href="' . esc_url( get_permalink( $post_ID ) ) . '">', $this->single, '</a>' ),
	    2 =>  'Custom field updated.' ,
	    3 =>  'Custom field deleted.' ,
	    4 => sprintf(  '%1$s updated.' , $this->single ),
	    5 => isset( $_GET['revision'] ) ? sprintf(  '%1$s restored to revision from %2$s.' , $this->single, wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
	    6 => sprintf(  '%1$s published. %2$sView %3$s%4s.' , $this->single, '<a href="' . esc_url( get_permalink( $post_ID ) ) . '">', $this->single, '</a>' ),
	    7 => sprintf(  '%1$s saved.' , $this->single ),
	    8 => sprintf(  '%1$s submitted. %2$sPreview post%3$s%4$s.' , $this->single, '<a target="_blank" href="' . esc_url( add_query_arg( 'preview', 'true', get_permalink( $post_ID ) ) ) . '">', $this->single, '</a>' ),
	    9 => sprintf(  '%1$s scheduled for: %2$s. %3$sPreview %4$s%5$s.' , $this->single, '<strong>' . date_i18n(  'M j, Y @ G:i' , strtotime( $post->post_date ) ) . '</strong>', '<a target="_blank" href="' . esc_url( get_permalink( $post_ID ) ) . '">', $this->single, '</a>' ),
	    10 => sprintf(  '%1$s draft updated. %2$sPreview %3$s%4$s.' , $this->single, '<a target="_blank" href="' . esc_url( add_query_arg( 'preview', 'true', get_permalink( $post_ID ) ) ) . '">', $this->single, '</a>' ),
	  );

	  return $messages;
	}

	/**
	 * Set up bulk admin messages for post type
	 * @param  array  $bulk_messages Default bulk messages
	 * @param  array  $bulk_counts   Counts of selected posts in each status
	 * @return array                Modified messages
	 */
	public function bulk_updated_messages ( $bulk_messages = array(), $bulk_counts = array() ) {

		$bulk_messages[ $this->post_type ] = array(
	        'updated'   => sprintf( _n( '%1$s %2$s updated.', '%1$s %3$s updated.', $bulk_counts['updated'], 'agile-alliance-cp' ), $bulk_counts['updated'], $this->single, $this->plural ),
	        'locked'    => sprintf( _n( '%1$s %2$s not updated, somebody is editing it.', '%1$s %3$s not updated, somebody is editing them.', $bulk_counts['locked'], 'agile-alliance-cp' ), $bulk_counts['locked'], $this->single, $this->plural ),
	        'deleted'   => sprintf( _n( '%1$s %2$s permanently deleted.', '%1$s %3$s permanently deleted.', $bulk_counts['deleted'], 'agile-alliance-cp' ), $bulk_counts['deleted'], $this->single, $this->plural ),
	        'trashed'   => sprintf( _n( '%1$s %2$s moved to the Trash.', '%1$s %3$s moved to the Trash.', $bulk_counts['trashed'], 'agile-alliance-cp' ), $bulk_counts['trashed'], $this->single, $this->plural ),
	        'untrashed' => sprintf( _n( '%1$s %2$s restored from the Trash.', '%1$s %3$s restored from the Trash.', $bulk_counts['untrashed'], 'agile-alliance-cp' ), $bulk_counts['untrashed'], $this->single, $this->plural ),
	    );

	    return $bulk_messages;
	}

}
