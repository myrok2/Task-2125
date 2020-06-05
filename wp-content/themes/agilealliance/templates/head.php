<?php
$menu_name = 'unified_navigation';
$locations = get_nav_menu_locations();
$menu_id = $locations[ $menu_name ] ;
$menu = wp_get_nav_menu_object($menu_id);

$tab_colors = get_field('tab_colors', $menu);
?>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-touch-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-touch-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-touch-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-touch-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-touch-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-touch-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-touch-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-touch-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-180x180.png">
	<link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
	<link rel="icon" type="image/png" href="/favicons/favicon-194x194.png" sizes="194x194">
	<link rel="icon" type="image/png" href="/favicons/favicon-96x96.png" sizes="96x96">
	<link rel="icon" type="image/png" href="/favicons/android-chrome-192x192.png" sizes="192x192">
	<link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
	<link rel="manifest" href="/favicons/manifest.json">
	<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#5bbad5">
	<meta name="apple-mobile-web-app-title" content="Agile Alliance">
	<meta name="application-name" content="Agile Alliance">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png">
	<meta name="theme-color" content="#ffffff">

  <?php if (isset($_ENV['PANTHEON_ENVIRONMENT']) && $_ENV['PANTHEON_ENVIRONMENT'] === 'live') : ?>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push(
        {'gtm.start': new Date().getTime(),event:'gtm.js'}
      );var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-P7ZCQNX');</script>
    <!-- End Google Tag Manager -->
  <?php endif; ?>

  <script>
    (function(d) {
      var config = {
          kitId: 'xiv4gcq',
          scriptTimeout: 3000,
          async: true
        },
        h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
    })(document);
  </script>

  <?php wp_head(); ?>
    <style>
    <?php foreach ($tab_colors as $index =>$tab_color): $i = $index + 1; ?>
        .primary-navigation > li:nth-child(<?= $i ?>).active > a {
          color: <?=  $tab_color['line_color'] ?>;
        }
        .primary-navigation > li:nth-child(<?= $i ?>):hover > a:after {
          border-bottom-color: <?=  $tab_color['line_color'] ?>;
        }
        .primary-navigation > li:nth-child(<?= $i ?>) > a:hover {
          color: <?=  $tab_color['line_color'] ?>;
        }
        .primary-navigation > li:nth-child(<?= $i ?>) > a .dropdown-indicator {
          background-color: <?=  $tab_color['line_color'] ?>;
        }
        .primary-navigation > li:nth-child(<?= $i ?>) > .dropdown-menu {
          border-top: 4px solid <?=  $tab_color['line_color'] ?>;
        }
    <?php endforeach; ?>
  </style>

  <?php if ( is_admin_bar_showing() ) { ?>
    <style>
      #navigation-banner {
        margin-top: 32px;
      }
      #global-login {
        top: 55px !important;
      }
      @media (max-width: 782px) {
        #navigation-banner {
          margin-top: 46px;
        }
      }
      @media (min-width: 0) and (max-width: 600px) {
        html {
          margin-top: 0 !important;
        }
        #navigation-banner {
          margin-top: 0px;
        }

      }
    </style>
  <?php } ?>

  <?php $social_sharable_post_types = array(
    'post',
    'aa_book',
    'aa_community_groups',
    'aa_event_session',
    'aa_experience_report',
    'aa_glossary',
    'aa_initiative',
    'aa_organizations',
    'aa_research_paper',
    'aa_story',
    'aa_video',
    'aa_podcast',
    'third-party-event'
  );
  // Pulls the _at_widget post meta from for the post to determine if it has manually been shut off on the item.
  $showAddThis = get_post_meta($post->ID, '_at_widget', true);
  ?>
  <!--  inverted the old logic to conditionally add the script -->
  <!--  instead hide the controls via CSS if it isn't allowedon the page.-->
  <?php if (!((in_array(get_post_type(), $social_sharable_post_types) || get_field('show_social_share_buttons'))
    && $showAddThis))  : ?>
  <!-- s2Member Replace - Need to replace check for hidden content for the sharethis enable/disable -->
    <!-- Go to www.addthis.com/dashboard to customize your tools -->
    <style>
      #at4-share {
        display: none;
      }
    </style>
  <?php endif; ?>

</head>
