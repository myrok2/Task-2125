<?php
// https://codex.wordpress.org/Author_Templates

use Paradigm\Concepts\Functional as F;

global $wpdb;

$qv_author_name = get_query_var('author_name');
$qv_author = get_query_var('author');
$curauth = ($qv_author_name) ? get_user_by('id', $qv_author_name) : get_userdata($qv_author);

$post_type_labels = [
  'aa_book' => 'Books',
  'aa_event_session' => 'Event Sessions',
  'aa_experience_report' => 'Experience Reports',
  'aa_initiative' => 'Initiatives',
  'aa_research_paper' => 'Research Papers',
  'aa_video' => 'Videos',
  'aa_podcast' => 'Podcasts',
  'post' => 'Posts',
];

/*
 * Construct Author Bio and Contact Markup
 */
$author_id = get_user_field( 'id', $curauth );
$short_bio = get_user_field( 'short_bio', $curauth );
$full_bio = get_user_field( 'full_bio', $curauth );
$email = get_user_field( 'email', $curauth );
$full_name = get_user_field( 'full_name', $curauth );
$avatar = get_user_field('avatar', $curauth, array('size' => 150));
$mepr_bio = get_user_field( 'mepr_bio', $curauth );

$twitter_handle =  get_user_field('twitter_handle', $curauth);
if (!empty($twitter_handle)) {
  $twitter_handle_expl = explode('@', $twitter_handle);
  end($twitter_handle_expl);
  $twitter_handle_raw = current($twitter_handle_expl);
  if (!empty($twitter_handle_raw)) {
    $twitter_url = "https://twitter.com/$twitter_handle_raw";
  }
}

$social_icons = [
  'twitter'     => $twitter_url,
  'google-plus' => get_user_field('google-plus-url', $curauth),
  'linkedin'    => get_user_field('linkedin-url', $curauth),
  'facebook'    => get_user_field('facebook_url', $curauth),
  'pinterest'   => get_user_field('pinterest_url', $curauth)
];

$not_empty = function($var) {
  return !empty($var);
};

$is_url = function($var) {
  return filter_var($var, FILTER_VALIDATE_URL);
};

$social_filter = function($var) use ($not_empty, $is_url) {
  return $not_empty($var) && $is_url($var);
};

$get_social_icon_markup = function ($carry, $url, $slug) {
  $carry .= "<li class='aa_author_social-links__icon'>
              <a href=\"$url\" target=\"_blank\" class=\"navigation-trigger footer-link social $slug\">
                <i class=\"fa fa-$slug\"></i>
              </a>
            </li>";
  return $carry;
};

$social_markup = F\reduce(array_filter($social_icons, $social_filter), $get_social_icon_markup, '');

/*
 * Prepare authored content query
 * The logic below combines p2p content with authored posts to include everything in a single query
 */
$all_p2p_query = $wpdb->prepare("
    SELECT p2p_to
    FROM `{$wpdb->prefix}p2p`
    WHERE p2p_type IN (
      'user_to_book_author',
      'user_to_event_session_presenter',
      'user_to_experience_report_author',
      'user_to_initiative_director',
      'user_to_initiative_chair',
      'user_to_research_paper_author',
      'user_to_video_speaker',
      'user_to_podcast_speaker',
      'user_to_post'
    )
    AND p2p_from = %d
  ", $curauth->ID);

$p2p_content_post_ids = $wpdb->get_col($all_p2p_query);
$authored_posts = new WP_Query(array('fields' => 'ids', 'author' => $author_id, 'posts_per_page'   => -1));
$all_content_ids = array_merge($p2p_content_post_ids, $authored_posts->posts);
$args = array(
  'post_type' =>  'any',
  'post__in' => count($all_content_ids) > 0 ? $all_content_ids : array(0),
  'ignore_sticky_posts' => true,
  'posts_per_page'   => -1,
);
$author_content_query = new WP_Query( $args );
?>

<div id="content" class="narrowcolumn aa_author">
  <div class="row aa_author-overview-wpr">
    <div class="aa_author-overview">
      <div class="aa_author-info-wpr">
        <div><?php echo $avatar; ?></div>
        <div class="aa_author-info">
          <?php if (!empty($social_markup)): ?>
            <ul class="aa_author_social-links">
              <?php echo $social_markup; ?>
            </ul>
          <?php endif; ?>
          <h2><?php echo $full_name; ?></h2>
          <?php if (is_user_logged_in()): ?>
            <button class="btn btn-blue-dark aa_btn" data-toggle="modal" data-target="#contact-modal">Contact Me</button>
          <?php endif; ?>
        </div>
      </div>


      <?php if (trim($mepr_bio) != '') { ?>
        <p><?php echo $mepr_bio; ?></p>
      <?php } else { ?>
        <p>No bio currently available.</p>
      <?php } ?>
    </div>
  </div>

  <div class="row aa_author-card-wpr">
    <?php if ( $author_content_query->have_posts() ) : ?>
      <?php while ( $author_content_query->have_posts() ): ?>
        <?php $author_content_query->the_post(); ?>
        <div class="col-sm-4" style="padding: .5em;">
          <a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>">
            <div class="aa_author-card aa_cta-section">
              <p class="aa_author-card__meta">
                <?= $post_type_labels[get_post_type()]; ?>
                <?php if (get_post_type() === 'post'): ?>
                  <time class="updated" datetime="<?= get_the_time('c'); ?>">/ <?= get_the_date(); ?></time>
                <?php endif; ?>
              </p>
              <h3 class="entry-title">
                <?php the_title(); ?>
              </h3>
              <?php $cats = array_map(function($term) { return $term->name; }, get_the_category()); ?>
              <div class="fwh-category">
                <?php foreach($cats as $cat): ?>
                  <span class="aa_author-card__cat"><?= $cat ?></span>
                <?php endforeach; ?>
              </div>
            </div>
          </a>
        </div>
      <?php endwhile; ?>
      <?php wp_reset_postdata(); ?>
    <?php else: ?>
      <div>No content authored by this author.</div>
    <?php endif; ?>
  </div>
</div>

<?php if (is_user_logged_in()): ?>
  <div class="modal fade contact-modal" id="contact-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <i class="fa fa-times"></i>
          </button>
          <div class="modal-header header">
            <h2>Contact Form</h2>
          </div>
          <div class="content">
            <?php $author_bio_contact_form_id = AUTHOR_BIO_CONTACT_FORM_GFORM_ID; ?>
            <?= do_shortcode("[gravityform id=$author_bio_contact_form_id title=false description=false tabindex=-1]") ?>
          </div>
        </div>
      </div>
    </div>
  </div>
<?php endif; ?>

<?php if (filter_input(INPUT_GET, 'success', FILTER_VALIDATE_BOOLEAN)): ?>
  <div class="modal fade contact-modal success-modal in" id="success-modal" tabindex="-1" role="dialog" aria-hidden="false">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <i class="fa fa-times"></i>
          </button>
          <div class="modal-header header">
            <h2>Success!</h2>
          </div>
          <div class="content">
            <p>Thanks, we sent your message.</p>
            <button class="aa_btn btn btn-blue-dark" data-toggle="modal" data-target="#success-modal">CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script type="text/javascript">
    (function() {
      jQuery(function($) {
        var contactModal = jQuery('#contact-modal');
        if (!contactModal.find('form').find('.validation_error').length) {
          $('#success-modal').modal('show');
        }
      });
    })();
  </script>
<?php endif; ?>

<script type="text/javascript">
  jQuery(document).bind('gform_post_render', function(){
    var contactModal = jQuery('#contact-modal');
    if (contactModal.find('form').find('.validation_error').length) {
        contactModal.modal('show');
    }
  });
</script>
