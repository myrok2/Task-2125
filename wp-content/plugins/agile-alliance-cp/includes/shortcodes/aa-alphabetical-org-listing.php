<?php
use Paradigm\Concepts\Functional as F;

add_shortcode('aa_alphabetical_org_listing', function($atts) {
    global $wpdb;

    $alphabet = range('A', 'Z');
    $alphabet_arr = array_fill_keys($alphabet, []);
    $alphabet_arr = ['#' => []] + $alphabet_arr;

    // Query is faster than using get_posts
    $orgs_query = "SELECT p.ID, p.post_title 
      FROM wp_posts p
        INNER JOIN wp_term_relationships ON p.ID=wp_term_relationships.object_id
        WHERE wp_term_relationships.term_taxonomy_id=%d
        AND p.post_type=%s
        AND p.post_status=%s
        ORDER BY p.post_title ASC";

    $orgs_query_prepare = $wpdb->prepare( $orgs_query, [
        165, // ID of 'Active' under 'wp_terms' table
        'aa_organizations',
        'publish'
    ]);

    $orgs = $wpdb->get_results($orgs_query_prepare);

    ob_start();

    echo '<div class="alphabetized-orgs-container">';

    // Display Alphabet
    echo '<div class="alphabet-container">';
    array_map(function($letter) {
        echo sprintf('<div><a href="#%s" class="%s">%s</a></div>',
            $letter, 'alphabet-letter', $letter);
    }, array_keys($alphabet_arr));
    echo '</div>';

    $orgs_grouped = array_reduce($orgs, function($c, $i) {

        $first_letter = strtoupper($i->post_title[0]);

        (is_numeric($first_letter))
            ? $c['#'][] = $i
            : $c[$first_letter][] = $i;

        return $c;

    }, $alphabet_arr);

    echo '<div class="alphabet-orgs-list">';
    foreach($orgs_grouped as $label => $orgs) {

        echo sprintf('<div class="%s %s">',
            'alphabet-grouped-orgs', $label);

        echo sprintf('<label class="%s"><a id="%s"></a>%s</label>',
            'alphabet-letter', $label, $label);

        foreach($orgs as $key => $org_obj) {
            echo sprintf('<div class="%s">',
                'org-name');

            echo sprintf('<a href="%s">%s</a>',
                get_permalink($org_obj->ID), $org_obj->post_title);

            echo '</div>';
        }

        echo '</div>';
    }
    echo '</div>';

    echo '</div>';

    return ob_get_clean();
});

add_action('vc_before_init', function(){
    vc_map(array(
        'name' => 'Alphabetical Organization Listing',
        'base' => 'aa_alphabetical_org_listing',
        'category' => __('Agile Alliance Components','js_composer'),
    ));
});