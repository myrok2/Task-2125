<?php
/**
 * Template Name: Agile2016 Splash Page
 */
?>

<div class="aa_agile2016-splash">

    <div class="aa_splash-page-content">
      <div class="aa_splash-logo">
        <a class="header-logo" href="<?= esc_url( home_url( '/' ) ); ?>">
          <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/logo-white.svg"
            alt="<?php bloginfo( 'name' ); ?>">
        </a>
      </div>
      <div class="aa_splash-title">
        <h1>Agile2016</h1>
      </div>
      <div class="aa_splash-sub-title">
        <h4>Jul 25-29 <span>|</span> Hyatt Regency <span>|</span> Atlanta, GA</h4>
      </div>
      <div class="aa_splash-description">
        <p>Details and registration for Agile2016 are coming soon. Join our mailing list to get conference updates.</p>
      </div>
      <a href="#" class="aa_splash-btn aa_btn aa_border-yellow-alt" data-toggle="modal" data-target="#conferenceNewsletterSignUp">GET UPDATES</a>
    </div>

    <!-- Newsletter Signup Form -->
    <div class="modal fade" id="conferenceNewsletterSignUp" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document" id="conference-newsletter-signup-form">
        <div class="modal-content">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <i class="fa fa-times"></i>
          </button>
          <div class="modal-header header aa_conference-splash">
            <h3>Conference Updates<br>and More</h3>
            <p>Sign up to the Agile Alliance Newsletter to receive updates on Agile2016 along with other great events, news, and resources.</p>
          </div>
          <div class="content aa_conference-splash">
            <?php echo do_shortcode('[mc4wp_form id="1594"]'); ?>
          </div>
        </div>
      </div>
    </div>

</div>