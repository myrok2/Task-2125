<time class="updated" datetime="<?= get_the_time('c'); ?>"><?= get_the_date(); ?></time>
<?php
$authors = get_users( array(
  'connected_type' => 'user_to_post',
  'connected_items' => $post
) );
$authors = array_map(function ($user) {
  $url = get_author_posts_url($user->ID);
  $display_name = $user->display_name;
  return "<a href = \"$url\" rel = \"author\" class=\"fn\">$display_name</a>";
  }, $authors);
  $url =  get_author_posts_url(get_the_author_meta('ID'));
  $display_name =get_the_author();
    array_unshift($authors,"<a href = \"$url\" rel = \"author\" class=\"fn\">$display_name</a>");
  $authors = implode(', ', $authors);
?>
<p class="byline author vcard"><?= __('by', 'sage'); ?>
    <?= $authors; ?>
</p>
