<?php

namespace AgileAlliance\Membership\Signup\Organization;

use Helpers\Organization as O;

/**
 * Remove the content from Corporate Membership
 *
 * If the logged in user is a corporate membership
 * but has not created an Organization custom post type
 * we are removing the content from them, until they
 * create an organization
 *
 */

add_filter('the_content', function($content) {

    if( defined('AA_SHOW_ORG_CREATE_FORM') && AA_SHOW_ORG_CREATE_FORM ) {
        ob_start();
        /**
         * The include file below has access to $variables in this scope
         * for example $user_id maybe be used in the file below
         */
        include('templates/organization-cpt/create-organization-form.php');
        $content = ob_get_contents();
        ob_end_clean();
    }
    return $content;
});


/**
 * Update Organization and Corporate Membership relation and fields
 *
 *
 * The following code will use p2p (post to post plugin) to connect the
 * user submitting the organization cpt (custom post type). It will then
 * update the user's s2member_custom_fields adding a new field of
 * 'created_organization' value of true, in which the content hook
 * is checking to toggle the content from the user
 *
 */

add_action('wp_insert_post', function($post_id, $post_obj, $update_bool) {

    $relate_corp_member_to_org_condition = ( ! is_admin()
        && is_user_logged_in()
        && $post_obj->post_type === 'aa_organizations'
        && $post_obj->post_status === 'publish' );

    if ( $relate_corp_member_to_org_condition ) {

        $from = get_current_user_id();
        $to = $post_id;

        $did_organization_status = O\set_organization_status(true, $post_id);

        // Connect corporate membership to organization

        p2p_type('user_to_organization_member')
            ->connect($from, $to, [
                'date' => current_time('mysql'),
                'corporate_contact' => true
            ]);

        /** Flag creation of organizaiton */
        update_user_meta($from, 'aa_created_organization', true );

    }

}, 10, 3);

// Shortcode to display a button/link for coprorate contacts to easily access their organization dashbaord
add_shortcode('edit_organization_link', function() {
    if (!is_user_logged_in() || is_super_admin()) return;

    //see if they are a corporate member
    if (getRoleNumericalValue(getHighestRole()) !== 5) return;

    $organizations = O\get_organization_connected_to_user(get_current_user_id());
    
    if ($organizations) {
        foreach($organizations as $organization){
        $link = get_permalink($organization->ID);
        $organization_name = $organization->post_title ?: 'Organization';
        $label = "Edit $organization_name";
        echo "<a class='aa_view_organization aa_btn aa_border-green-primary' href='$link'>$label</a>";
        }
        
    } else {
        $link = site_url();
        $label = 'Create Organization';
        echo "<a class='aa_view_organization aa_btn aa_border-green-primary' href='$link'>$label</a>";
    }

    

});
// if you don't add 3 as as 4th argument, this will not work as expected
add_action( 'post_updated', 'my_save_post_function', 10, 3 );

function my_save_post_function( $post_ID, $post_after, $post_before ) {
    echo "<pre>";
    print_r($post_after);
    die;
 $relate_corp_member_to_org_condition = ( ! is_admin()
        && is_user_logged_in()
        && $post_obj->post_type === 'aa_organizations'
        && $post_obj->post_status === 'publish' );

    if ( $relate_corp_member_to_org_condition ) {

        $from = get_current_user_id();
        $to = $post_id;

        $did_organization_status = O\set_organization_status(true, $post_id);

        // Connect corporate membership to organization

        p2p_type('user_to_organization_member')
            ->connect($from, $to, [
                'date' => current_time('mysql'),
                'corporate_contact' => true
            ]);

        /** Flag creation of organizaiton */
        update_user_meta($from, 'aa_created_organization', true );

    }
}