<?php

namespace Roots\Sage\Init;

use Roots\Sage\Assets;

/**
 * Theme setup
 */
function setup() {
  // Make theme available for translation
  // Community translations can be found at https://github.com/roots/sage-translations
  load_theme_textdomain('sage', get_template_directory() . '/lang');

  // Enable plugins to manage the document title
  // http://codex.wordpress.org/Function_Reference/add_theme_support#Title_Tag
  add_theme_support('title-tag');

  // Register wp_nav_menu() menus
  // http://codex.wordpress.org/Function_Reference/register_nav_menus
  register_nav_menus([
	'unified_navigation' => 'Primary Navigation',
	'agile101_navigation' => __('Agile-101 Navigation', 'sage'),
	'resources_navigation' => __('Resources Navigation', 'sage'),
	'events_navigation' => __('Events Navigation', 'sage'),
	'community_navigation' => __('Community Navigation', 'sage'),
	'thealliance_navigation' => __('The Alliance Navigation', 'sage'),
	'agilealliance_brazil' => __('Agile Alliance Brazil Navigation', 'sage'),
  ]);

  // Add post thumbnails
  // http://codex.wordpress.org/Post_Thumbnails
  // http://codex.wordpress.org/Function_Reference/set_post_thumbnail_size
  // http://codex.wordpress.org/Function_Reference/add_image_size

  add_theme_support('post-thumbnails');

  // After adding an image size also add it to the aa_image_sizes
  add_image_size( 'carousel-rectangle', 285, 135, array( 'center', 'center' ) );
  add_image_size( 'carousel-event-large', 600, 180 ); // Proportional Resize & Crop
  add_image_size( 'carousel-square', 400, 400 ); // Proportional Resize & Crop

  // Add post formats
  // http://codex.wordpress.org/Post_Formats
  add_theme_support('post-formats', ['aside', 'gallery', 'link', 'image', 'quote', 'video', 'audio']);

  // Add HTML5 markup for captions
  // http://codex.wordpress.org/Function_Reference/add_theme_support#HTML5
  add_theme_support('html5', ['caption', 'comment-form', 'comment-list']);

  // Tell the TinyMCE editor to use a custom stylesheet
  //add_editor_style(Assets\asset_path('styles/editor-style.css'));

	/**
	 * Add excerpts to pages
	 */
	add_post_type_support('page', 'excerpt');

}

add_action('after_setup_theme' , __NAMESPACE__ . '\\setup');


/**
 * Register sidebars
 */
function widgets_init() {
  register_sidebar([
    'name'          => __('Primary', 'sage'),
    'id'            => 'sidebar-primary',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>'
  ]);
    register_sidebar([
        'name'          => __('Headline', 'sage'),
        'id'            => 'sidebar-headline',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>'
    ]);
    register_sidebar([
        'name'          => __('Header', 'sage'),
        'id'            => 'sidebar-header',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>'
    ]);
    register_sidebar([
        'name'          => __('Footer Column 1', 'sage'),
        'id'            => 'sidebar-footer-1',
        'before_widget' => '<div class="footer-widget-column__item">',
        'after_widget'  => '</div>',
        'before_title'  => '<h6>',
        'after_title'   => '</h6>'
    ]);
    register_sidebar([
        'name'          => __('Footer Column 2', 'sage'),
        'id'            => 'sidebar-footer-2',
        'before_widget' => '<div class="footer-widget-column__item">',
        'after_widget'  => '</div>',
        'before_title'  => '<h6>',
        'after_title'   => '</h6>'
    ]);
    register_sidebar([
        'name'          => __('Footer Column 3', 'sage'),
        'id'            => 'sidebar-footer-3',
        'before_widget' => '<div class="footer-widget-column__item">',
        'after_widget'  => '</div>',
        'before_title'  => '<h6>',
        'after_title'   => '</h6>'
    ]);
    register_sidebar([
        'name'          => __('Footer Column 4', 'sage'),
        'id'            => 'sidebar-footer-4',
        'before_widget' => '<div class="footer-widget-column__item">',
        'after_widget'  => '</div>',
        'before_title'  => '<h6>',
        'after_title'   => '</h6>'
    ]);
    register_sidebar([
        'name'          => __('Footer Column 5', 'sage'),
        'id'            => 'sidebar-footer-5',
        'before_widget' => '<div class="footer-widget-column__item">',
        'after_widget'  => '</div>',
        'before_title'  => '<h6>',
        'after_title'   => '</h6>'
    ]);
    register_sidebar([
        'name'          => __('Left Footer', 'sage'),
        'id'            => 'sidebar-left-footer',
        'before_widget' => '<div class="widget %1$s %2$s col-xs-12 col-sm-6 footer-widget-left">',
        'after_widget'  => '</div>'
    ]);
    register_sidebar([
        'name'          => __('Right Footer', 'sage'),
        'id'            => 'sidebar-right-footer',
        'before_widget' => '<div class="widget %1$s %2$s col-xs-12 col-sm-6 footer-widget-right">',
        'after_widget'  => '</div>'
    ]);
}
add_action('widgets_init', __NAMESPACE__ . '\\widgets_init');
