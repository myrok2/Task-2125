<?php
/**
  * Template Name: Membership Renewal Form
  */

  $renewal = $_GET['renewal'];
?>

<div class="gfield gfield_contains_required field_sublabel_below field_description_below"><label class="gfield_label isFocus">Auto Renew Membership<span class="gfield_required">*</span>
  </label><div class="ginput_container ginput_container_radio">
    <ul class="gfield_radio">
      <li><input name="renewal" value="yes" <?php if($renewal !== 'no'){ echo 'checked="checked"'; } ?> type="radio">
          <label class="isFocus">Yes</label>
      </li>
      <li><input name="renewal" value="no" <?php if($renewal === 'no'){ echo 'checked="checked"'; } ?> type="radio">
          <label class="isFocus">No</label>
      </li>
    </ul>
</div>

<?php

  switch(get_user_field("s2member_access_level")) {
    case 0: 
      wp_redirect('/membership', 301);
      break;
    case 1:
      $shortcode = $renewal !== 'no' ? 
                  '[s2Member-Pro-AuthNet-Form modify="1" level="1" ccaps="" desc="1 Year @ $100.00 / then $100 USD / Yearly (recurring charge, for ongoing access)" cc="USD" custom="' . $_SERVER['HTTP_HOST'] . '" ta="100.00" tp="1" tt="Y" ra="100" rp="1" rt="Y" rr="1" rrt="" accept="visa,mastercard,amex,discover" coupon="" accept_coupons="0" default_country_code="US" captcha="0" /]' :
                  '[s2Member-Pro-AuthNet-Form modify="1" level="1" ccaps="" desc="1 Year @ $100.00 / then $100 USD / One Time (for 1 year access, non-recurring)" cc="USD" custom="' . $_SERVER['HTTP_HOST'] . '" ta="100.00" tp="1" tt="Y" ra="100" rp="1" rt="Y" rr="0" rrt="" accept="visa,mastercard,amex,discover" coupon="" accept_coupons="0" default_country_code="US" captcha="0" /]';
      echo do_shortcode($shortcode);
      break;
    case 2: 
      // $shortcode = $renewal !== 'no' ?
      //              '[s2Member-Pro-AuthNet-Form modify="1" level="2" ccaps="" desc="1 Year @ $100.00 / then $100 USD / Yearly (recurring charge, for ongoing access)" cc="USD" ta="100.00" tp="1" tt="Y" ra="100" rp="1" rt="Y" rr="1" rrt="" accept="visa,mastercard,amex,discover" coupon="" accept_coupons="0" default_country_code="US" captcha="0" /]' :
      //              '[s2Member-Pro-AuthNet-Form modify="1" level="2" ccaps="" desc="1 Year @ $100.00 / then $100 USD / One Time (for 1 year access, non-recurring)" cc="USD" ta="100.00" tp="1" tt="Y" ra="100" rp="1" rt="Y" rr="0" rrt="" accept="visa,mastercard,amex,discover" coupon="" accept_coupons="0" default_country_code="US" captcha="0" /]';
      echo '[HERE GOES SOME MESSAGING ABOUT CORPORATE RENEWALS]';
      break;
  }

?>

<script>
  jQuery('input[name="renewal"]').on('change', function(e) {
    e.preventDefault();
    if(jQuery(this).val() === 'no') {
      window.location = window.location.href.split('?')[0] + '?renewal=no';
    } else {
      window.location = window.location.href.split('?')[0] + '?renewal=yes';
    }
  });
</script>