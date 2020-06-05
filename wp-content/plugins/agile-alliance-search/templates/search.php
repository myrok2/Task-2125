<?php
use function aa\search\displayAASearch;
$search_term = filter_input(INPUT_GET, 's', FILTER_SANITIZE_STRING);
?>

<div class="aa-layout aa-layout--wide">
  <?php displayAASearch(['initial_query' => $search_term]); ?>
</div>

<script>
  // Set a global flag to indicate to app that this is the site search.
  window.isAASiteSearch = true;
</script>
