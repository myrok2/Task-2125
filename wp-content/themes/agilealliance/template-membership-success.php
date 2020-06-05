<?php
/**
 * Template Name: Membership Success
 */

$success_content = __("Please visit your email inbox in order to set your password and log in!");

switch($_GET['level']) {

  case '1':

    $success_content = __("Please visit your email inbox in order to set your password and log in!");

        break;
  case '2':

    $success_content = __("You’ve successfully signed up as a Corporate Member
    of Agile Alliance. Please check your email inbox in order to set a password. You now have access to members-only content on the site.");

        break;
  case '2i' :
    $success_content = __("You have successfully signed up as a Corporate Member
     of the Agile Alliance. Please set your password. You can access and update your account immediately.
     Once your membership payment is complete, be sure to remember to invite
     employees to join as individual members at no additional cost.");
        break;
}

?>

<div class="aa_membership-success">
  <div class="row">

    <div class="aa_membership-success-header">
      <div class="aa_membership-success-title">
        <h1><span style="color: #287FD6;">Almost There!</span></h1>
      </div>
<div class="aa_membership-success-sub-title">
        <p><h3><span style="color: #000000;"><?php echo $success_content; ?></span><h/></p>
<p style="padding-bottom: 6em; padding-top: 2em;">Problems? Email Us: membership@agilealliance.org</p>
      </div>
    </div>
<div class="aa_membership-success-content container">
      <div class="row">



      </div>
    </div>

  </div>
</div>