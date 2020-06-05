<?php
use Paradigm\Concepts\Functional as F;
use AgileAlliance\Invites\Invite as Invite;
use Helpers\Organization as O;
use Helpers\Html as html;

global $wpdb;

/**
 * @todo: Front-end make pretty.
 */

// Just data with key names similar to original labels
// var_dump(get_fields());
// This includes labels and other info
// var_dump(get_field_objects());

// $acf_fields = get_field_objects();

$post_id = get_the_ID();
$get_corporate_contact = F\compose('current', O\_pntfn( 'get_corporate_contact_by_organization' ));
//get user associated with the org Post
$corporate_contact = $get_corporate_contact($post_id);
$ownedCorpAccount = O\get_corporate_account(get_current_user_id());
$is_current_corporate_contact = $ownedCorpAccount->user_id && $corporate_contact->ID && ($ownedCorpAccount->user_id == $corporate_contact->ID);

//user ID of the current user or the user that owns the organization.
$user_id =  (is_user_logged_in() && $is_current_corporate_contact) ? get_current_user_id() : $corporate_contact->ID;
//get corp details:
$corp_membership = O\get_corporate_account($user_id);
//get list of user
$sub_accounts_num = O\get_corporate_membership_count($corp_membership->id);
$max_memberships   = $corp_membership->num_sub_accounts; //::get_max_membership($user_id);
$available_invites = $corp_membership->num_sub_accounts - $sub_accounts_num; //Invite::get_available_invites($user_id);

$corp_contact = (new F\MaybeEmpty(get_the_ID()))
    ->bind(function($org_id){
      return O\get_corporate_contact_by_organization($org_id);
    })
    ->bind(function($user_array){
      return is_array($user_array) ? current($user_array) : null;
    })
    ->extract();
$request_invite_button = '';

// Needs to not be a member of the organization
$userRole = getHighestRole();
//todo: figure out how we'll manage the new role.
$request_invite_base_conditions = $userRole != 'corporate'
                                  && $available_invites > 0
                                  ||  $userRole != 'corporate'
                                     && $available_invites === 'unlimited';
$request_invite_conditions = !is_user_logged_in()
                             && $request_invite_base_conditions
                             || (is_user_logged_in()
                                 && $request_invite_base_conditions
                                 && ! O\is_connected_to_post( $post_id, get_current_user_id() ));
// Invites got removed with memberpress
//if ($request_invite_conditions) {
//
//  $button = [
//    'text'  => 'request to join',
//    'class' => 'aa_btn aa_border-green-primary',
//    'style' => 'width:100%;margin-bottom:30px;',
//    'onclick' => 'window.location = \'?action=request-invite\'; '
//  ];
//
//  $request_invite_button = html\gen_button($button);
//
//}

?>

<style>
    .aa_profile-org .container {
        padding: 0;
    }
    @media screen and (max-width: 991px) {
        .aa_profile-org .container {
            width: 100%;
        }
    }
</style>

<div class="aa_profile-org">


  <?php // Top Row ?>
  <div class="row">
    <div class="container">
        <?php // Top Section 1 - Logo/Title ?>
        <div class="col-sm-6 col-md-3 aa_acf-content-top aa_profile-plrz aa_s1">
            <div class="aa_logo-title-wpr">
                <div class="aa_logo-title">

                    <?php // Logo ?>
                    <?php if( get_field( 'logo' ) ) : ?>
                        <img src="<?php echo site_url(); ?><?php the_field('logo'); ?>" alt="org-logo">
                    <?php endif; ?>

                    <?php // Organization Name ?>
                    <h2><?php echo the_title(); ?></h2>

                    <?php // Category ?>
                    <?php if( get_field( 'category' ) ) : ?>
                        <p><?php the_field('category'); ?></p>
                    <?php endif; ?>

                    <?php // Admin level options ?>
                    <?php if ( $is_current_corporate_contact ) : ?>
                        <div class="aa_admin-btn-wpr">

                            <a href="?action=edit" class="aa_admin-btn aa_btn aa_border-green-primary">Edit Organization</a>

                            <a href="/account/?action=manage_sub_accounts&ca=<?= $corp_membership->uuid ?>" class="aa_admin-btn aa_btn aa_border-green-primary">Manage Members</a>
                            <p>
                            <h3>Membership Tier</h3>
                            <?= ucfirst($max_memberships) ?> Members
                            <?php if (is_numeric($available_invites)) : ?>
                                (<?= $available_invites ?> Invites Remaining)
                            <?php endif; ?>
                            </p>

                        </div>
                    <?php endif; ?>

                    <?php echo $request_invite_button; ?>

                </div><?php // .aa_logo-title ?>
            </div><?php // .aa_logo-title-wpr ?>
        </div><?php // .aa_s1 ?>

        <?php // Top Section 2 - Contact ?>
        <div class="col-sm-6 col-md-3 aa_acf-content-top aa_profile-plrz aa_s2 aa_profile-border-left">
            <ul class="aa_profile-contact-wpr">
                <li class="aa_profile-contact title aa_profile-plr15 titleHeight">
                    <h4>Contact</h4>
                </li>

                <?php // Corporate Contact ?>
                <?php if( $corp_contact ) : ?>
                    <li class="aa_profile-contact aa_profile-plr15 email">
                    <i class="fa fa-user aa_profile-icon"></i>
                    <a href="/author/<?php echo $corp_contact->user_nicename; ?>/" class="aa_profile-list-link"><?php echo $corp_contact->display_name; ?></a>
                    </li><?php // .aa_profile-contact ?>
                <?php endif; ?>

                <?php // if has Toll Free OR Local Telephone ?>
                <?php if( get_field( 'toll-free_telephone' ) || get_field( 'local_telephone' ) || get_field( 'fax' ) ) : ?>
                    <li class="aa_telephones-wpr">

                    <?php // Telephones ?>
                    <ul class="aa_telephones">

                    <?php if( get_field( 'toll-free_telephone' ) ) : ?>
                        <li class="aa_profile-plr15 phone-1">
                            <i class="fa fa-phone aa_profile-icon"></i>
                            <span><?php the_field('toll-free_telephone'); ?></span>
                        </li>
                    <?php endif; ?>

                    <?php if( get_field( 'local_telephone' ) ) : ?>
                        <li class="aa_profile-plr15 phone-2">
                            <i class="fa fa-phone-square aa_profile-icon"></i>
                            <span><?php the_field('local_telephone'); ?></span>
                        </li>
                    <?php endif; ?>

                    <?php if( get_field( 'fax' ) ) : ?>
                        <li class="aa_profile-plr15 phone-3">
                            <i class="fa fa-fax aa_profile-icon"></i>
                            <span><?php the_field('fax'); ?></span>
                        </li>
                    <?php endif; ?>

                    </ul><?php // .aa_telephones ?>

                    </li><?php // .aa_telephones-wpr ?>
                <?php endif; ?>

                <?php // Email ?>
                <?php if( get_field( 'email' ) ) : ?>
                    <li class="aa_profile-contact aa_profile-plr15 email">
                    <i class="fa fa-envelope-o aa_profile-icon"></i>
                    <a href="mailto:<?php the_field('email'); ?>" class="aa_profile-list-link"><?php the_field('email'); ?></a>
                    </li><?php // .aa_profile-contact ?>
                <?php endif; ?>

                <?php // Website ?>
                <?php if( get_field( 'website' ) ) : ?>
                    <li class="aa_profile-contact aa_profile-plr15 website">
                    <i class="fa fa-globe aa_profile-icon"></i>
                    <a href="<?php the_field('website'); ?>" target="_blank" class="aa_profile-list-link"><?php the_field('website'); ?></a>
                    </li><?php // .aa_profile-contact ?>
                <?php endif; ?>

            </ul><?php // .aa_profile-contact-wpr ?>
        </div><?php // .aa_s2 ?>

        <?php // Top Section 3 - Work Info ?>
        <div class="col-sm-6 col-md-3 aa_acf-content-top aa_profile-plrz aa_s3 aa_profile-border-left">
            <ul class="aa_profile-location-wpr">
                <li class="aa_profile-location title aa_profile-plr15 titleHeight">
                    <h4>Location</h4>
                </li>

                <?php // Address Fields ?>
                <li class="aa_profile-location aa_profile-plr15">
                    <div class="aa_location-fields">

                        <?php // Street Address 1 ?>
                        <?php if( get_field( 'street_address' ) ) : ?>
                            <p><?php the_field('street_address'); ?></p>
                        <?php endif; ?>

                        <?php // Street Address 2 ?>
                        <?php if( get_field( 'street_address_2' ) ) : ?>
                            <p><?php the_field('street_address_2'); ?></p>
                        <?php endif; ?>

                        <?php // City/Town and State/Province ?>
                        <?php if( get_field( 'citytown' ) || get_field( 'stateprovince' ) ) : ?>
                            <p>
                                <?php if( get_field( 'citytown' ) ) : ?>
                                    <span><?php the_field('citytown'); ?></span>
                                <?php endif; ?>
                                <?php if( get_field( 'stateprovince' ) ) : ?>
                                    <span><?php the_field('stateprovince'); ?></span>
                                <?php endif; ?>
                            </p>
                        <?php endif; ?>

                        <?php // Zip/Postal Code ?>
                        <?php if( get_field( 'zippostal_code' ) ) : ?>
                            <p><?php the_field('zippostal_code'); ?></p>
                        <?php endif; ?>

                        <?php // Zip/Postal Code ?>
                        <?php if( get_field( 'country' ) ) : ?>
                            <p><?php the_field('country'); ?></p>
                        <?php endif; ?>
                    </div><?php // .aa_location-fields ?>

                </li><?php // .aa_profile-location ?>
            </ul><?php // .aa_profile-location-wpr ?>
        </div>

        <?php // Top Section 4 - Membership Details ?>
        <div class="col-sm-6 col-md-3 aa_acf-content-top aa_profile-plrz aa_s4 aa_profile-border-left" style="border-right: 1px solid rgba(153,153,153,.3);">
            <?php // Whitepaper Link ?>
            <?php if( get_field( 'whitepaper' ) ) : ?>
                <ul class="aa_profile-aux-wpr">
                    <li class="aa_profile-aux title aa_profile-plr15 titleHeight">
                        <h4>Auxiliary</h4>
                    </li>
                </ul>
                <div class="aa_profile-aux-cta">
                <p>
                    <span>Whitepaper Download</span>
                    <a href="<?php echo site_url(); ?><?php the_field('whitepaper'); ?>"
                       class="aa_btn aa_border-green-primary"
                       download>Download Link</a>
                </p>
                </div><?php // .aa_profile-aux-cta ?>
            <?php endif; ?>
        </div><?php // .aa_24 ?>
    </div>
  </div><?php // .row ?>

  <?php // Secondary Row ?>
  <?php if ( get_field( 'description' ) ) : ?>
    <div class="row">
      <div class="">
          <?php // Secondary Section 1 - Bio/Description ?>
          <div class="col-sm-12 aa_acf-content-secondary aa_profile-plrz aa_s1">
              <ul class="aa_profile-bio">
                  <li class="aa_profile-bio title aa_profile-plr15">
                      <div class="container">
                          <h4 style="margin-left: 30px;">Description</h4>
                      </div>
                  </li>
                  <li class="aa_profile-bio">
                      <div class="container">
	                      <?php the_field('description'); ?><?php // wrapped with </p> ?>
                      </div>
                  </li>
              </ul><?php // .aa_profile-bio ?>
          </div><?php // .aa_s1 ?>
      </div>
    </div><?php // .row ?>
  <?php endif; ?>

</div><?php // .aa_profile-org ?>
