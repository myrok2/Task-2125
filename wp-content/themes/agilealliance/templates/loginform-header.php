<?php
$logged_in_markup = '';

if (is_user_logged_in()) {
  $current_user = wp_get_current_user();
  $user_profile_url = site_url('/membership/edit-profile/');
  $avatar = get_avatar($current_user->ID, 90);
  $logged_in_markup = "
    <a href=\"$user_profile_url\">$avatar</a>
    <h3>Hey $current_user->user_firstname!</h3>
    <span>You are currently logged in.</span>
  ";
}

$options = array(
  "title" => "Login",
  "signup_url" => "",
  "login_redirect" => "%%previous%%",
  "profile_title" => "",
  "display_gravatar" => "0",
  "link_gravatar" => "0",
  "display_name" => "0",
  "logged_in_code" => $logged_in_markup,
  'logout_redirect' => '%%previous%%',
  "my_account_url" => "0",
  "my_profile_url" => "0"
);
  $args = array (
  "before_widget" => "<div class=\"member_login_widget\">",
  "after_widget" => "</div>",
  "before_title" => "<h3>",
  "after_title" => "</h3>"
);

  //TODO: Replace the login modal with a memberpress version
echo do_shortcode('<h3>Welcome [mepr-account-info field="full_name"]</h3>[mepr-login-form]');

//s2member_pro_login_widget($options, $args);</div>
