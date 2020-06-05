<?php

use Helpers\Organization as O;
use AgileAlliance\Invites\Invite as Invite;
use Paradigm\Concepts\Functional as F;

add_action('add_meta_boxes',  function () {

    if (!is_super_admin()) return false;

    add_meta_box(
        'bulk-invites',
        'Bulk Invites',
        function() {

            $organization_id = get_the_ID();
            $user_id = current(O\get_corporate_contact_by_organization($organization_id))->ID;

            $used_invites = Invite::get_used_invites_count(true);
            $max_memberships = Invite::get_max_membership($user_id);
            $max_memberships = (!is_numeric($max_memberships) && strcasecmp($max_memberships, 'unlimited') === 0) ? '&infin;' : $max_memberships;

            $invites_allowed = Invite::get_available_invites($user_id);
            $invites_allowed = is_numeric($invites_allowed) ? $invites_allowed : false;
            $max_reached = (is_numeric($invites_allowed) && $invites_allowed <= 0)
                && !(!is_numeric($max_memberships) && strcasecmp($max_memberships, 'unlimited') === 0);

            $error_data = get_option("bulk-invite-error_$organization_id", false);

            ?>
                <style>
                  .bulk-invite-input {
                      display: block;
                      width: 100%;
                      margin-bottom: 10px;
                  }
                  .exceeded .bulk-invite-input {
                      border: 2px solid red;
                  }
                  .invite-alert {
                      display: none;
                      font-weight: bold;
                      color: red;
                  }
                  .exceeded .invite-alert,
                  .invite-alert-perm {
                      display: block;
                  }
                </style>
                <p>Slots Used: <strong><?php echo $used_invites; ?>/<?php echo $max_memberships; ?></strong></p>
                <?php if (!$max_reached) : ?>
                    <p>Enter emails below, each on a separate line.</p>
                <?php else: ?>
                    <p>Maximum number of invites reached.</p>
                <?php endif; ?>
                <?php if ($error_data['error']): ?>
                    <p class="invite-alert invite-alert-perm"><?php echo $error_data['message']; ?></p>
                <?php endif; ?>
                <textarea <?php echo $max_reached ? 'disabled' : '' ; ?> name='bulk-invite-input' class='bulk-invite-input'><?php if ($error_data['error']) echo trim($error_data['data']); ?></textarea>
                <p class="invite-alert">Maximum number of invites exceeded.</p>
                <input <?php echo $max_reached ? 'disabled' : '' ; ?> name="save" type="Submit" class="button button-primary button-large" value="Process Invitations">
                <input type="button" class="button button-info button-large clear-invites" value="Clear">
                <script>
                    (function($){
                        var $invites = $('.bulk-invite-input');
                        $invites.on('change keyup', function() {
                            var $this = $(this);
                            var rows = <?php echo (int)$invites_allowed ?>;

                            var splitval = $this.val().split("\n").filter(function(val){ return val.trim() !== ''; });

                            if (rows && splitval.length > rows) {
                                $this.parent().addClass('exceeded');
                            } else {
                                $this.parent().removeClass('exceeded');
                            }
                            //$this.val(splitval.slice(0, rows).join('\n'));
                        }).change();

                        $('.clear-invites').on('click', function(){ $invites.val(''); });
                  })(jQuery);
                </script>
              <?php
        },
        'aa_organizations',
        'side',
        'default'
    );
});

add_action( 'save_post', function($post_id, $post) {

    $error_handler = function($post_id, $message, $data) {
        update_option("bulk-invite-error_$post_id", [
            'error' => true,
            'message' => $message,
            'data' => $data
        ]);
        return;
    };

    if (wp_is_post_revision($post_id)) {
        return;
    }

    if ('aa_organizations' != $post->post_type) {
        return;
    }

    // Clear previous errors
    delete_option("bulk-invite-error_$post_id");

    if (empty($_POST['bulk-invite-input'])) {
        return;
    }

    // Sanitize post data
    $raw_emails = filter_input(INPUT_POST, 'bulk-invite-input', FILTER_SANITIZE_STRING);

    $emails_array = Invite::explode_validate_emails($raw_emails);

    if (count($emails_array) === 0) {
        return $error_handler(
            $post_id,
            'No valid email addresses entered.',
            $raw_emails
        );
    }

    // Confirm the organization has sufficient invites
    $user_id = current(O\get_corporate_contact_by_organization($post_id))->ID;
    $invites_allowed = Invite::get_available_invites($user_id);

    if (empty($invites_allowed)) {
        return $error_handler(
            $post_id,
            'Failed to confirm available invites or one is not defined.',
            $raw_emails
        );
    }

    if (is_numeric($invites_allowed) && count($emails_array) > $invites_allowed) {
        return $error_handler(
            $post_id,
            'Insufficient invites available, please try again with fewer email addresses.',
            $raw_emails
        );
    }

    Invite::process_bulk_invites($emails_array, $post_id);

}, 10, 2 );

