<?php

use Helpers\Organization as O;

$menu_params = array(
  'depth' => 3,
  'menu_class' => 'primary-navigation nav navbar-nav',
  'menu_id' => 'aa_unified-navigation',
	'theme_location' => 'unified_navigation',
	'walker' => (new wp_bootstrap_navwalker()),
);

$s2MemberLevel = 2;

?>

<header class="site-header" role="banner">
  <nav class="site-header__navbar">
    <div class="site-header__wrapper">

      <div class="navbar-header site-header__header">
        <?php if (is_user_logged_in()) : ?>
          <button type="button" class="site-header__account" data-toggle="modal" data-target="#loginModal">
            <span>Profile</span>
            <div class="site-header__touch-target site-header__touch-target--on-left site-header__touch-target--avatar">
              <?= get_avatar(get_current_user_id()) ?>
            </div>
          </button>
        <?php else: ?>
          <button type="button" class="site-header__account" data-toggle="modal" data-target="#loginModal">
            <span>Login</span>
            <div class="site-header__touch-target site-header__touch-target--on-left">
              <i class="fa fa-user"></i>
            </div>
          </button>
        <?php endif; ?>
        <a href="<?= esc_url( home_url( '/' ) ); ?>">
          <img src="https://www.agilealliance.org/wp-content/uploads/2018/06/Agile_Alliance_Logo_Color-png.png"
               alt="<?php bloginfo( 'name' ); ?>" class="site-header__logo">
        </a>
        <button type="button" class="site-header__menu-toggle collapsed" data-toggle="collapse" data-target="#primary-navigation" aria-expanded="false">
          <div class="site-header__menu-open">
            <span>Menu</span>
            <div class="site-header__touch-target site-header__touch-target--hamburger site-header__touch-target--on-right">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </div>
          </div>
          <div class="site-header__menu-close">
            <span>Close</span>
            <div class="site-header__touch-target site-header__touch-target--close site-header__touch-target--on-right">
              <i class="fa fa-times" aria-hidden="true"></i>
            </div>
          </div>
        </button>
      </div>

      <div class="js-hover-dropdown collapse navbar-collapse" id="primary-navigation">
        <form role="search" method="get" class="mobile-search-form" action="<?= esc_url(home_url('/')); ?>">
          <label class="sr-only"><?php _e('Search for:', 'sage'); ?></label>
          <div class="input-group">
            <input data-dwls-ignore type="text" value="<?= get_search_query(); ?>" name="s" class="form-control" placeholder="<?php _e('Search', 'sage'); ?>" required>
            <span class="input-group-btn">
              <button type="submit" class="btn btn-default">
                <span class="sr-only">Search</span>
                <i class="fa fa-search" aria-hidden="true"></i>
              </button>
            </span>
          </div>
        </form>
        <?php wp_nav_menu($menu_params); ?>
      </div>

      <div class="top-right-menu-wpr">
        <div class="top-right-menu">
          <div class="btn-trigger search-container"><?php // Search Icon / trigger ?>
            <a href="javascript:;" class="search-trigger js-search-trigger"><i class="fa fa-search search-trigger__open" aria-hidden="true"></i></a>
            <form role="search" method="get" class="search-form header-search-form" action="<?= esc_url(home_url('/')); ?>">
              <label class="sr-only"><?php _e('Search for:', 'sage'); ?></label>
              <div class="input-group">
                <input data-dwls-append=".top-right-menu" type="search" value="<?= get_search_query(); ?>" name="s" class="header-search-form__input search-field form-control js-header-search-input" placeholder="<?php _e('Search', 'sage'); ?>" required>
                <span class="input-group-btn">
								<button type="submit" class="header-search-form__submit btn btn-default">Go</button>
							</span>
              </div>
              <a href="javascript:;" class="search-trigger js-search-trigger"><i class="fa fa-times search-trigger__close" aria-hidden="true"></i></a>
            </form>
          </div>
          <a href="#" class="btn-trigger aa_login" data-toggle="modal" data-target="#loginModal" title="<?=(is_user_logged_in() ? 'Profile' : 'Login')?>">
            <svg viewBox="0 0 18 17">
              <path
                d="M15.145 12.25c-1.294-.647-.795-.152-2.383-.813-1.588-.661-1.964-.877-1.964-.877l-.014-1.515s.595-.453.78-1.887c.371.108.497-.437.517-.786.022-.336.22-1.386-.235-1.292.093-.7.166-1.334.133-1.669-.114-1.177-.923-2.405-2.967-2.495-1.737.09-2.865 1.319-2.979 2.496-.033.335.034.968.127 1.67-.454-.095-.259.956-.239 1.292.022.348.145.895.517.787.185 1.433.779 1.89.779 1.89l-.015 1.523s-.376.231-1.964.891c-1.588.662-1.09.137-2.383.783-2.044 1.022-2.044 3.833-2.044 3.833h16.378s0-2.811-2.044-3.833z"/>
            </svg>
            <span class="link-text"><?=(is_user_logged_in() ? 'Profile' : 'Login')?></span>
            <?php // Just in case we need to swap svg->fontawesome: <i class="fa fa-user"></i> ?>
          </a>
          <div class="language-selector-wpr" style="position: relative;">
            <div id="google_translate_element"></div><script type="text/javascript">
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({layout: google.translate.TranslateElement.FloatPosition.TOP_RIGHT, autoDisplay: false, gaTrack: true, gaId: 'UA-17319182-1'}, 'google_translate_element');
              }
            </script><script async type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
          </div>
        </div>
      </div>

    </div>
  </nav>
</header>

<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document" id="global-login">
    <div class="modal-content">
      <?php $userLoggedIn = is_user_logged_in() ? 'isLoggedIn' : 'isLoggedOut' ?>
      <div class="modal-body content <?php echo $userLoggedIn ?>">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <i class="fa fa-times"></i>
        </button>
        <?php get_template_part( 'templates/loginform', 'header' ) ?>
      </div>
      <div class="footer">
        <?php if ( is_user_logged_in() ) : ?>
          <a href="<?php echo esc_url( get_permalink( get_page( '157' ) ) ); ?>"
             class="btn aa_btn aa_global-signup">Profile</a>
          <?php if($s2MemberLevel === 2) : ?>
            <div style="margin-top: 20px;line-height: 1.5;">
              <a href="/membership/edit-profile/?action=subscriptions" class="btn aa_btn aa_global-signup">
                <?php echo ($s2MemberLevel === 0) ? 'Upgrade' : 'Renew' ?> Membership
              </a>
            </div>
          <?php endif; ?>
        <?php else : ?>
          <h3>Not a Member or Subscriber? </h3>
          <a href="/membership-pricing"
             class="btn aa_btn aa_global-signup">SIGN UP</a>
        <?php endif; ?>
        <div>
          <?php echo do_shortcode('[edit_organization_link]'); ?>
        </div>
      </div>
    </div>
  </div>
</div>
