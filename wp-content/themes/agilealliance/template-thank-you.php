<?php
/**
 * Template Name: Thank You Page
 */
?>

<?php
function validate_post_exists( $id ) {
  return is_string( get_post_status( $id ) );
}
$cookie_name = "redirect_id";

//if(isset($_COOKIE[$cookie_name])) {
//  $value = $_COOKIE[$cookie_name];
//  if (validate_post_exists($value)) {
//    wp_redirect( get_permalink( $value ) );
//    die;
//  }
//} else {
//  echo '<h1>Cookies are not set!</h1>';
//}


// HACKY JS Way to do the redirect
echo "<script>
     function getCookie(cname) {
      var name = cname + '=';
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
     }
     var redirect_url = getCookie('redirect_url');
     if (redirect_url) {     
        window.location.replace(decodeURIComponent(redirect_url));
     }
     </script>";
?>

<?php while (have_posts()) : the_post(); ?>
  <?php //get_template_part('templates/page', 'header'); ?>
  <?php get_template_part('templates/content', 'page'); ?>
<?php endwhile; ?>
