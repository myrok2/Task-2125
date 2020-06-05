<?php
    if(!defined('ABSPATH')){
        exit();
    }
    
    $tab = filter_input(INPUT_GET, 'tab');
    
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $tab != 'test'){
        $enable = !empty($_POST['enable_reroute']) && sanitize_text_field($_POST['enable_reroute']) ? 1 : 0;
        $append_recipient = !empty($_POST['append_recipient']) && sanitize_text_field($_POST['append_recipient']) ? 1 : 0;
        $email = !empty($_POST['email_address']) ? sanitize_text_field($_POST['email_address']) : '';
        $append_msg = !empty($_POST['append_msg']) ? sanitize_text_field($_POST['append_msg']) : '';
        $enable_db_log = !empty($_POST['enable_db_log']) && sanitize_text_field($_POST['enable_db_log']) ? 1 : 0;
        $db_log_option = !empty($_POST['enable_db_log_option']) ? sanitize_text_field($_POST['enable_db_log_option']) : 1;

        $error = false;

        if($enable && !$email){
            print '<div id="message" class="error fade"><p>'. __('Enter at least one email address.', 'wp_reroute_email') . '</p></div>';
            $error = true;
        }

        if(!$error){
            update_option('wp_reroute_email_enable', $enable);
            update_option('wp_reroute_append_recipient', $append_recipient);
            update_option('wp_reroute_email_address', $email);
            update_option('wp_reroute_email_message_to_append', $append_msg);
            update_option('wp_reroute_email_enable_db_log', $enable_db_log);
            update_option('wp_reroute_email_db_log_option', $db_log_option);
            print '<div id="message" class="updated fade"><p>'. __('Settings saved.', 'wp_reroute_email') . '</p></div>';
        }
    }
    else{
        $enable = get_option('wp_reroute_email_enable', 0);
        $append_recipient = get_option('wp_reroute_append_recipient', 0);
        $email = get_option('wp_reroute_email_address', '');
        $append_msg = get_option('wp_reroute_email_message_to_append', '');
        $enable_db_log = get_option('wp_reroute_email_enable_db_log', 0);
        $db_log_option = get_option('wp_reroute_email_db_log_option', 1);
    }
?>
<div class="wrap">
    <div class="icon32" id="icon-options-general"><br></div>
    <h2>WP Reroute Email</h2>
    <h2 class="nav-tab-wrapper">
        <a href="?page=wp-reroute-email%2Fsettings.php" class="nav-tab <?php echo empty($tab) ? 'nav-tab-active' : ''; ?>"><?php _e('Settings', 'wp_reroute_email'); ?></a>
        <a href="?page=wp-reroute-email%2Fsettings.php&tab=log" class="nav-tab <?php echo $tab ==  'log' ? 'nav-tab-active' : ''; ?>"><?php _e('Logs', 'wp_reroute_email'); ?></a>
        <a href="?page=wp-reroute-email%2Fsettings.php&tab=test" class="nav-tab <?php echo $tab ==  'test' ? 'nav-tab-active' : ''; ?>"><?php _e('Test', 'wp_reroute_email'); ?></a>
        <?php if($tab == 'details'): ?>
        <a href="javascript:;" class="nav-tab <?php echo $tab ==  'details' ? 'nav-tab-active' : ''; ?>"><?php _e('Message Details', 'wp_reroute_email'); ?></a>
        <?php endif; ?>
    </h2>

    <?php if(empty($tab)): ?>
    <form action="" method="post">
        <table class="form-table">
            <tbody>
                <tr>
                    <th scope="row"><?php  _e('Enable rerouting', 'wp_reroute_email'); ?></th>
                    <td>
                        <input type="checkbox" <?php print $enable ? 'checked="checked"' : ''; ?> value="1" name="enable_reroute" id="enable_reroute">
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="settings-tables">
            <table class="form-table">
                <tbody>
                    <tr>
                        <th scope="row"><?php  _e('Email address', 'wp_reroute_email'); ?></th>
                        <td>
                            <input type="text" name="email_address" size="60" value="<?php print $email; ?>">
                            <br><span class="description"><?php  _e('Provide a comma-delimited list of email addresses to pass through.', 'wp_reroute_email'); ?></span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php  _e('Append text', 'wp_reroute_email'); ?></th>
                        <td>
                            <input type="text" name="append_msg" size="60" value="<?php print $append_msg; ?>">
                            <br><span class="description"><?php  _e('This text will be appended with the mail body. Leave it blank if you do not want to append anything.', 'wp_reroute_email'); ?></span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php  _e('Append recipient email addresses', 'wp_reroute_email'); ?></th>
                        <td>
                            <input type="checkbox" <?php print $append_recipient ? 'checked="checked"' : ''; ?> value="1" name="append_recipient" id="append_recipient">
                            <br><span class="description"><?php  _e('Enable this if you want to append recipient email addresses at the bottom of the email.', 'wp_reroute_email'); ?></span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php  _e('Log emails in DB', 'wp_reroute_email'); ?></th>
                        <td>
                            <input type="checkbox" <?php print $enable_db_log ? 'checked="checked"' : ''; ?> name="enable_db_log" id="enable_db_log" value="1">
                            <br><span class="description"><?php  _e('Enable this if you want to store a copy of the email in database. You may also skip email sending and store email only to database.', 'wp_reroute_email'); ?></span>
                            <div class="log-email-options">
                                <strong><?php  _e('Select an option', 'wp_reroute_email'); ?></strong><br>
                                <input type="radio" <?php print $db_log_option == 1 ? 'checked="checked"' : ''; ?> name="enable_db_log_option" id="enable_db_log_option_1" value="1"> <label for="enable_db_log_option_1"><?php  _e('Store a copy of email in database and send email', 'wp_reroute_email'); ?></label><br>
                                <input type="radio" <?php print $db_log_option == 2 ? 'checked="checked"' : ''; ?> name="enable_db_log_option" id="enable_db_log_option_2" value="2"> <label for="enable_db_log_option_2"><?php  _e('Store a copy of email in database and do not send email', 'wp_reroute_email'); ?></label>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="submit"><input type="submit" value="<?php  _e('Save Changes', 'wp_reroute_email'); ?>"></p>
    </form>
    <?php elseif($tab == 'log' || $tab == 'details'): ?>
    <?php require_once dirname(__FILE__) . '/db_log.php'; ?>
    <?php elseif($tab == 'test'): ?>
    <?php require_once dirname(__FILE__) . '/test.php'; ?>
    <?php endif;?>
</div>
