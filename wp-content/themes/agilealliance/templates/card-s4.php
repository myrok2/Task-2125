<?php

  $filter_class = '';
  foreach ($post_taxonomies as $taxonomy){
    $khj = get_the_terms( $post->id, $taxonomy );
    if (!empty( $khj )){
      foreach( $khj as $term_m ){
        $filter_class .= 'svc-grid-cat-'.$term_m->term_id.' ';
      }
    }
  }
  $page_id = get_the_ID();
  $post_type = get_post_type( $post->id );
  $resource_type = get_post_type_object( $post_type );
  $isProtected = false; //is_permitted_by_s2member();
  $s2memberAccessLevel = 0; // temp
  $post_link = $post->link;

  if ($post_type === 'aa_event_session') {

    $connected = new WP_Query( [
        'connected_type'      => 'event_to_event_session',
        'connected_items'     => $page_id,
        'connected_direction' => 'to',
        'nopaging'            => true,
    ] );

  }

  if ($post_type === 'event') {
    $cld_post_id = get_post_meta($post->id, 'carousel_link_designation', true);
    $cld_link = get_permalink($cld_post_id);
    $post_link = $cld_link;
  }

  // Include a page ID here to force/display resource card images on only that page
  $display_image_override = [
    69
  ];

  // Post types included in this array recieve special formatting currently specific only to Third Party Events
  $event_post_types = [
    'third-party-event'
  ];

  // Map CPT slug to desired archive page (useful if CPT doesn't have a traditional archive page)
  $archive_map = [
    'aa_event_session' => '/resources/event-sessions/',
    'post' => '/community/blog/'
  ];
  $archive_url = $archive_map[$post_type] ?: dirname(get_permalink( $post->id ));

  $card_classes = [
    'no-pad',
    $grid_columns_count_for_desktop,
    $grid_columns_count_for_tablet,
    $grid_columns_count_for_mobile,
    $filter_class,
    ($show_featured_image ? 'has-featured-image' : null)
  ];

  $lvl0_posts = explode(',', $GLOBALS['WS_PLUGIN__']['s2member']['o']['level0_posts']);
  $backcard_title   = 'Membership Content';
  $backcard_content = 'This premium resource requires you to be an Agile Alliance Member.';
  $uprade_path = (is_user_logged_in() && $s2memberAccessLevel === 0) ? '?rt=Individual-Membership&redirect_id=' . get_the_ID() : '?redirect_id=' . get_the_ID();
  $already_copy = 'Already a Member?';

//  if (in_array($page_id, $lvl0_posts)) {
//    $backcard_title   = 'Subscriber Content';
//    $backcard_content = 'This premium resource requires you to be an Agile Alliance Subscriber.';
//    $uprade_path = '?rt=Subscriber';
//    $already_copy = 'Already a Subscriber?';
//  }

  if ($post_type === 'aa_organizations') {
    $dmeta_data = 'yes'; // Hides the created date & post type stuff
    $logo_url = get_field('logo') ?: '/wp-content/themes/agilealliance/assets/images/resource_fallback-no-bg.png';
  }

?>

<div
  class="element-item <?php echo implode(' ', $card_classes) ;?>"
  svc-animation="<?php if($effect != ''){ echo $effect;}?>"
  sort="<?php echo $order_value;?>"
>
  <div class="article-wrap">
    <article class="grid-resource-item <?php echo $post_type; ?>">

      <div class="resource-item-wrap <?php echo (!$isProtected ? 'permitted' : 'pflip'); ?>">

        <div class="front">

          <?php if(!in_array($post_type, $event_post_types) && $show_featured_image): ?>
            <header class="hidden-xs">
              <?php if(!$isProtected) : ?>

                <?php // Card Heading (Image/Graphic)?>
                <?php if($img_id != ''){ ?>
                  <a href="<?php echo $post->link; ?>" <?php echo $lt;?>>
                    <?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
                  </a>
                <?php } else { ?>
                  <a href="<?php echo $post->link;?>" <?php echo $lt; ?> >
                    <img src="<?php bloginfo( 'template_directory' );
                    ?>/assets/images/thumb-fallback.png"
                    class="svc_post_image" alt="<?php the_title(); ?>"/>
                  </a>
                <?php } ?>

              <?php else: ?>
                <?php if($img_id != ''){  ?>
                  <div>
                    <?php // Cleanest way to implement the lock icon w/ overlay vs the css / font awesome route ?>
                    <img
                      src="<?php bloginfo( 'template_directory' ); ?>/assets/images/resource-restricted.png"
                      class="protected-resource-lock""
                    />
                    <?php echo wp_get_attachment_image( $img_id, $grid_thumb_size,false,array('class' => 'svc_post_image') );?>
                  </div>
                <?php } else { ?>
                  <div>
                    <?php // Cleanest way to implement the lock icon w/ overlay vs the css / font awesome route ?>
                    <img src="<?php bloginfo( 'template_directory' ); ?>/assets/images/resource-restricted.png"
                    class="protected-resource-lock""/>
                    <img
                      src="<?php bloginfo( 'template_directory' ); ?>/assets/images/thumb-fallback.png"
                      class="svc_post_image"
                      alt="<?php the_title(); ?>"/>
                  </div>
                <?php } ?>
              <?php endif; ?>
            </header>
          <?php endif; ?>

            <div class="resource-card-bottom">
              <section class="resource-item-title">

                <?php if(!$isProtected): ?>
                    <a href="<?php echo $post_link; ?>" <?php echo $lt;?> class="svc_title link-wrapper">
                      <?php if($post_type === 'aa_organizations'): ?>
                        <div class='resource-grid__organization-logo' style='background-image: url(<?php echo $logo_url; ?>)'></div>
                      <?php endif; ?>
                      <p class="org-title"><?php the_title_limit( 80, '...' ); ?></p>
                    </a>
                <?php else: ?>
                  <p class="svc_title"><?php the_title_limit( 80, '...' ); ?></p>
                <?php endif; ?>

                <div class="resource-item-author col-xs-12 no-pad grid-p2p">
                  <?php // This is where the connected P2P data goes ?>
                    <?php
                      switch ($post_type) {
                        case 'post':
                          $author = the_author_posts_link();
                          break;
                        case 'aa_community_groups':
                          $terms_as_text = get_the_term_list( $post->ID, 'community_group_locations', '', ', ', '' ) ;
                          echo strip_tags($terms_as_text);
                          break;
                        case 'aa_book':
                          echo do_shortcode( '[p2p_connected type=user_to_book_author mode=ul]' );
                          break;
                        case 'aa_experience_report':
                          echo do_shortcode( '[p2p_connected type=user_to_experience_report_author mode=ul]' );
                          break;
                        case 'aa_event_session':

                          if ( isset($connected) && ! empty($connected->posts) ) {

                            echo '<ul id="event_to_event_session_list">';

                            array_reduce( $connected->posts, function($carry, $item ) {

                              $anchor_html = '<li><a href="%s">%s</a></li>';
                              $cld_post_id = get_post_meta($item->ID, 'carousel_link_designation', true);
                              $cld_link = get_permalink($cld_post_id);
                              $cld_html = sprintf( $anchor_html, $cld_link, $item->post_title );

                              echo $cld_html;

                            });

                            echo '</ul>';
                          }

                          echo do_shortcode( '[p2p_connected type=user_to_event_session_presenter mode=ul]' );
                          break;
                        case 'aa_initiative':
                          echo do_shortcode( '[p2p_connected type=user_to_initiative_director mode=ul]' );
                          echo do_shortcode( '[p2p_connected type=user_to_initiative_chair mode=ul]' );
                          break;
                        case 'aa_video':
                          ?>
                            <div class="pull-right">
                              <?php
                              $terms_as_text = get_the_term_list( $post->ID, 'video_aud_level', '', ', ', '' ) ;
                              echo strip_tags($terms_as_text);
                              ?>
                            </div>
                            <div class=""><?php
                              echo do_shortcode( '[p2p_connected type=user_to_video_speaker mode=ul]' );
                              ?>
                            </div>
                          <?php
                          break;
                        case 'aa_podcast':
                          ?>
                          <div class=""><?php
                            echo do_shortcode( '[p2p_connected type=user_to_podcast_speaker mode=ul]' );
                            ?>
                          </div>
                          <?php
                          break;

                        case 'event' :
                          $fields = get_fields();
                          $output_format = '<div><span>%s</span></div>';
                          $output = [
                              sprintf($output_format, $fields['event_date_range']),
                              sprintf($output_format, $fields['carousel_location_display'])
                          ];
                          array_reduce( $output, function($c, $i) {
                            echo $i;
                          });

                          break;
                        default:
                          ?>
                            <?php if(in_array($post_type, $event_post_types)): ?>
                              <?php
                              $start_date = get_field('start_date');
                              $end_date = get_field('end_date');
                              $date_format = 'M j';
                              if (!empty($start_date) && !empty($end_date)) {

                                $sdate = DateTimeImmutable::createFromFormat('U', $start_date);
                                $edate = DateTimeImmutable::createFromFormat('U', $end_date);

                                $same_date = $start_date === $end_date;
                                $same_year = $sdate->format('Y') === $edate->format('Y');
                                $same_month = $same_year && $sdate->format('M') === $edate->format('M');

                                $start_format = $same_year ? $date_format : 'M j, Y';
                                $end_format = $same_month ? 'j' : $date_format;

                                $formatted =
                                  $same_date ? $sdate->format($date_format . ', Y') :
                                    $sdate->format($start_format) . ' - ' . $edate->format($end_format) . ', ' .  $edate->format('Y');

                                echo "<p>$formatted</p>";

                              } ?>
                              <?php if(get_field('location')){ echo '<p>' . get_field('location') . '</p>'; } ?>
                            <?php endif; ?>
                          <?php
                      }
                    ?>
                  </div>

              </section>

              <?php if($dmeta_data != 'yes'): ?>
                <section class="resource-item-cat-date">
                  <?php if($dcategory != 'yes'): ?>
                    <div class=" no-pad">
                       <div class="resource-item-type">
                        <?php if(!$isProtected) { ?>
                          <a href="<?php echo $archive_url ?>" class="<?php echo $post_type ?>"><?php echo
                          $resource_type->label; ?></a>
                        <?php }
                        else { ?>
                          <p><?php echo
                          $resource_type->label; ?></p>
                          <?php
                        } ?>
                      </div>
                    </div>
                  <?php endif; ?>
                </section>
              <?php endif; ?>

            </div>

          <?php if($dsocial !== 'no' && !$isProtected): ?>
            <footer>
              <div class="svc_social_share">
              <ul>
                <li><a href="https://twitter.com/intent/tweet?text=&url=<?php echo $post->link?>" target="_blank"><i class="fa fa-twitter"></i></a></li>
                <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $post->link?>" target="_blank"><i class="fa fa-facebook"></i></a></li>
                <li><a href="https://plusone.google.com/share?url=<?php echo $post->link?>" target="_blank"><i class="fa fa-google-plus"></i></a></li>
              </ul>
              </div>
            </footer>
          <?php endif; ?>

        </div>

        <?php if($isProtected): ?>
          <div class="back">
            <div class="rgrid-overlay">
              <div class="overlay-top">
                <span>
                  <h2>
                    <?php echo $backcard_title; ?>
                  </h2>
                </span>
              </div>
              <div class="overlay-bottom">
                <span>
                  <p>
                    <?php echo $backcard_content; ?>
                  </p>
                </span>
                <div class="overlay-signupin">
                  <a href="/membership/<?php echo $uprade_path; ?>" target="3">
                    <div class="signup-in-button">
                      <span class="btn-text">Sign Up</span>
                    </div>
                  </a>
                  <?php if(!is_user_logged_in()): ?>
                    <span class="sign-in">
                      <p class="hidden-md"><?php echo $already_copy; ?> <br /></p>
                      <p class="sign-in-mobile">
                        <a href="/wp-login.php" style="backface-visibility: hidden;">Sign In</a>
                      </p>
                    </span>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          </div>
        <?php endif; ?>
      </div>
    </article> <?php // grid-resource-item ?>
  </div><?php // article-wrap ?>
</div><?php // element-item ?>
