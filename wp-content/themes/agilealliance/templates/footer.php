<?php // Allow comments to be displayed on pages if enabled
//RULE for 8049253
//current_user_can('mepr-active','membership: 123')
$s2memberAccessLevel = getRoleNumericalValue(getHighestRole());
// s2 member max was 2.
if ($s2memberAccessLevel > 2) {
  $s2memberAccessLevel = 2;
}
?>
<?php if (get_post_type() === 'page' && comments_open()) : ?>
  <div class="row">
    <hr class="section-border-hr">
  </div>
  <div class="container aa-disqus">
    <?php comments_template('/templates/comments.php'); ?>
  </div>
<?php endif; ?>

<footer class="content-info" role="contentinfo">
    <div class="footer-container">
        <div class="footer-top row-fluid">
            <div class="widget col-xs-12 col-sm-6 col-md-4 footer-widget-column">
                <?php dynamic_sidebar('sidebar-footer-1'); ?>
            </div>
            <div class="widget col-xs-12 col-sm-6 col-md-4 footer-widget-column">
                <?php dynamic_sidebar('sidebar-footer-2'); ?>
            </div>
            <div class="widget col-xs-12 col-sm-6 col-md-4 footer-widget-column">
                <?php dynamic_sidebar('sidebar-footer-3'); ?>
            </div>
            <div class="widget col-xs-12 col-sm-6 col-md-4 footer-widget-column">
                <?php dynamic_sidebar('sidebar-footer-4'); ?>
            </div>
            <div class="widget col-xs-12 col-sm-6 col-md-4 footer-widget-column">
                <?php dynamic_sidebar('sidebar-footer-5'); ?>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="footer-bottom row-fluid">
            <?php dynamic_sidebar('sidebar-left-footer'); ?>
            <?php dynamic_sidebar('sidebar-right-footer'); ?>
            <div class="clearfix"></div>
        </div>
    </div>
    <style>
        a.mepr-account-row-action {
            float: left;
            width: 125px;
        }
        
        @media only screen and (max-width: 766px) {
            a.mepr-account-row-action {
                float: right;
                width: auto;
            }
        }
        
    </style>
</footer>
