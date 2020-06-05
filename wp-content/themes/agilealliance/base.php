<?php

use Roots\Sage\Config;
use Roots\Sage\Wrapper;

?>
<!DOCTYPE html>
<html class="no-js" <?php language_attributes(); ?>>
<?php get_template_part( 'templates/head' ); ?>
<body <?php body_class(); ?>>

<?php if (isset($_ENV['PANTHEON_ENVIRONMENT']) && $_ENV['PANTHEON_ENVIRONMENT'] === 'live') : ?>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P7ZCQNX"
                    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
<?php endif; ?>

<!--[if IE]>
<div class="alert alert-warning">
	<?php _e('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'sage'); ?>
</div>
<![endif]-->
<!--[if lt IE 9]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
<![endif]-->

<?php
do_action( 'get_header' );

// Detect if page is using a template and also if the template slug contains "template-conference"
if ( is_page_template() && strpos( get_page_template_slug() , "template-conference" ) === 0 ) {

}else {
	get_template_part( 'templates/header' );
}

?>
<div class="wrap" role="document">
	<div class="content">
		<main class="main" role="main">
			<?php include Wrapper\template_path(); ?>
		</main>
	</div>
</div>
<?php
do_action( 'get_footer' );

// Detect if page is using a template and also if the template slug contains "template-conference"
if ( is_page_template() && strpos( get_page_template_slug() , "template-conference" ) === 0 ) {

}else {
	get_template_part( 'templates/footer' );
}

wp_footer();
?>
</body>
</html>
