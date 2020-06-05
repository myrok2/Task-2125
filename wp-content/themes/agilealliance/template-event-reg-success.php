<?php
/**
 * Template Name: Event Registration Success
 */

setlocale(LC_MONETARY, 'en_US');

$paid = filter_input(INPUT_GET, 'paid', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
$paid = money_format('%n', (!empty($paid) ? $paid : 0));

$due = filter_input(INPUT_GET, 'due', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
$due = money_format('%n', (!empty($due) ? $due : 0));

$is_new_user = filter_input(INPUT_GET, 'newUser', FILTER_VALIDATE_BOOLEAN);

$is_group = filter_input(INPUT_GET, 'group', FILTER_VALIDATE_BOOLEAN);

$groupRegCode = filter_input(INPUT_GET, 'groupRegCode', FILTER_SANITIZE_STRING);


?>

<style>
  .success-section:not(:last-of-type) {
    margin-bottom: 1em;
  }
  .aa_membership-success-amounts p {
    font-weight: bold !important;
  }
  .aa_membership-success-amounts {
    text-align: center;
  }
</style>

<div class="aa_membership-success">
  <div class="row">
    <div class="aa_membership-success-header">
      <div class="aa_membership-success-title">
        <h1>Congratulations!</h1>
      </div>
      <div class="container" style="text-align:initial;">
        <div class="success-section">
          <?php the_field('upper_message'); ?>
        </div>
        <div class="aa_membership-success-amounts success-section">
          <?php // Event information here? ?>
          <p>Total Amount Due: <?= $due ?></p>
          <p>Total Amount Paid: <?= $paid ?></p>
        </div>
        <?php if (array_key_exists('due', $_GET)) : ?>
          <div class="aa_membership-success-invoice success-section">
            <?php the_field('invoice_message'); ?>
          </div>
        <?php endif; ?>
        <?php if ($is_new_user) : ?>
          <div class="aa_membership-success-new-user success-section">
            <?php the_field('new_user_message'); ?>
          </div>
        <?php endif; ?>
        <div class="aa_membership-success-new-user success-section">
          <p>
            <?php
            if ($is_group) {
              the_field('group_registration_message');
              if (!empty($groupRegCode)) {
                echo "<p style='margin-top: 1em;text-align: center;'><a class='btn btn-primary aa_btn' href='/my-registrations/?groupRegCode=$groupRegCode'>Click here to begin registering additional attendees</a></p>";
              }
            } else {
              the_field('individual_registration_message');
            }
            ?>
          </p>
        </div>
        <div class="success-section">
          <?php the_field('lower_message'); ?>
        </div>
      </div>
    </div>

    <div class="aa_membership-success-content container">
      <div class="row">

        <div class="col-sm-6 col-md-3">
          <div class="aa_membership-success-card-wpr">
            <a href="/resources" class="card-link resources">
              <div class="card-header-img" style="background-image: url(<?php bloginfo( 'template_directory' ); ?>/assets/images/membership-success-link-img1.png)">
              </div>
              <div class="card-content">
                <h3>Explore Member <br>Resources</h3>
              </div>
            </a>
          </div>
        </div>

        <div class="col-sm-6 col-md-3">
          <div class="aa_membership-success-card-wpr">
            <a href="/events" class="card-link events">
              <div class="card-header-img" style="background-image: url(<?php bloginfo( 'template_directory' ); ?>/assets/images/membership-success-link-img2.png)">
              </div>
              <div class="card-content">
                <h3>Attend an <br>Event</h3>
              </div>
            </a>
          </div>
        </div>

        <div class="col-sm-6 col-md-3">
          <div class="aa_membership-success-card-wpr">
            <a href="/communities/" class="card-link community">
              <div class="card-header-img" style="background-image: url(<?php bloginfo( 'template_directory' ); ?>/assets/images/membership-success-link-img3.png)">
              </div>
              <div class="card-content">
                <h3>Submit a New <br>User Group</h3>
              </div>
            </a>
          </div>
        </div>

        <div class="col-sm-6 col-md-3">
          <div class="aa_membership-success-card-wpr">
            <a href="/membership/individual/profile" class="card-link general">
              <div class="card-header-img" style="background-image: url(<?php bloginfo( 'template_directory' ); ?>/assets/images/membership-success-link-img4.png)">
              </div>
              <div class="card-content">
                <h3>Complete Your <br>Public Profile</h3>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>
