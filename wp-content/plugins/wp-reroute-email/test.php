<?php
    if(!defined('ABSPATH')){
        exit();
    }
    
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $tab == 'test'){
        $to = filter_input(INPUT_POST, 'to_email');
        $subject = filter_input(INPUT_POST, 'subject');
        $message = filter_input(INPUT_POST, 'message');
        
        if($to && $subject && $message){
            wp_mail($to, $subject, $message);
            print '<div id="message" class="updated fade"><p>'. __('Email sent.', 'wp_reroute_email') . '</p></div>';
        }
    }
?>    
<p><?php _e('You may test your settings by sending an email using this form.', 'wp_reroute_email');?></p>    
<form action="" method="POST">
    <table class="form-table">
        <tbody>
            <tr>
                <th scope="row"><?php  _e('To', 'wp_reroute_email'); ?></th>
                <td><input type="email" name="to_email" size="60" value="test@example.com"></td>
            </tr>
            <tr>
                <th scope="row"><?php  _e('Subject', 'wp_reroute_email'); ?></th>
                <td><input type="text" name="subject" size="60" value="WP Reroute Email Test Message"></td>
            </tr>
            <tr>
                <th scope="row"><?php  _e('Message', 'wp_reroute_email'); ?></th>
                <td><textarea name="message" rows="5" cols="70">This is a test message from WP Reroute Email.</textarea></td>
            </tr>
            <tr>
                <td colspan="2"><input type="submit" value=" <?php _e('Send', 'wp_reroute_email'); ?> "></td>
            </tr>
        </tbody>
    </table>
</form>