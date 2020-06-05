<?php
/*
 * Plugin Name: WP Reroute Email
 * Plugin URI: http://wordpress.org/extend/plugins/wp-reroute-email/
 * Description: This plugin intercepts all outgoing emails from a WordPress site and reroutes them to a predefined configurable email address.
 * Version: 1.3.8
 * Author: Sajjad Hossain
 * Author URI: http://www.sajjadhossain.com
 * License: GPLv2 or later
 * Text Domain: wp_reroute_email
 * Domain Path: /languages
 */

define('WP_REROUTE_EMAIL_DB_VER', 1003);

class WPRerouteEmail {

    private $plugin_name;

    /**
     * Constructor
     */
    public function __construct() {
        $this->add_actions();
        $this->add_filters();
    }

    /**
     * Adds actions
     */
    private function add_actions() {
        add_action('init', array($this, 'updateDB'));
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('phpmailer_init', array($this, 'modify_phpmailer_object'), 1000, 1);
        add_action('admin_enqueue_scripts', array($this, 'enqueueJS'));
        add_action('admin_notices', array($this, 'notice'));
    }

    /**
     * Adds filters
     */
    private function add_filters() {
        add_filter('plugin_action_links', array($this, 'add_settings_link'), 10, 2);
        add_filter('wp_mail', array($this, 'modify_mail_message'), 1000, 1);
    }

    public function init() {
        load_plugin_textdomain('wp_reroute_email', false, basename(dirname(__FILE__)) . '/languages');
    }

    /**
     * Add a submenu for settings page under Settings menu
     */
    public function add_admin_menu() {
        add_menu_page('WP Reroute Email', 'WP Reroute Email', 'manage_options', 'wp-reroute-email/settings.php');
    }

    /**
     * Enqueue JS file
     *
     * @param type $hook
     */
    public function enqueueJS($hook) {
        if ('wp-reroute-email/settings.php' == $hook || 'wp-reroute-email/db_log.php' == $hook) {
            wp_enqueue_script('jquery-template', plugins_url('js/jquery.tmpl.min.js', __FILE__), array('jquery'), '1.0.0', true);
            wp_enqueue_script('jquery-ui', plugins_url('js/jquery-ui-1.8.16.custom.min.js', __FILE__), array('jquery-template'), '1.8.16', true);
            wp_enqueue_script('jquery-switchbutton', plugins_url('js/jquery.switchbutton.min.js', __FILE__), array('jquery-ui'));
            wp_enqueue_script('wp-reroute-email-js', plugins_url('js/wp-reroute-email.js', __FILE__), array('jquery-switchbutton'));
            wp_register_style('jquery-switchbutton-css', plugins_url('js/ui.switchbutton.min.css', __FILE__), false, '1.0.0');
            wp_enqueue_style('jquery-switchbutton-css');
            wp_register_style('wp-reroute-email-css', plugins_url('css/wp-reroute-email-styles.css', __FILE__), false, '1.0.0');
            wp_enqueue_style('wp-reroute-email-css');
        }
    }

    /**
     * Unsets all recipient addresses from PHPMailer object and adds emails address to which all mails will be rerouted.
     *
     * @param object $phpmailer
     */
    public function modify_phpmailer_object(&$phpmailer) {
        $enable = get_option('wp_reroute_email_enable', 0);
        $email = get_option('wp_reroute_email_address', '');
        $enable_db_log = get_option('wp_reroute_email_enable_db_log', 0);

        if ($enable && $email) {
            if($enable_db_log){
                $this->save_to_db($phpmailer);
                
                $db_log_option = get_option('wp_reroute_email_db_log_option', 1);
                
                //Skip email sending
                if($db_log_option == 2){
                    $phpmailer = new DummyPHPMailer();
                    return;
                }
            }
            
            $phpmailer->ClearAllRecipients();

            $email_array = explode(',', $email);

            foreach ($email_array as $email) {
                $phpmailer->AddAddress(trim($email));
            }
        }
    }

    /**
     * Append given text with the mail message.
     *
     * @param array $mail_parts
     */
    public function modify_mail_message($mail_parts) {
        $enable = get_option('wp_reroute_email_enable', 0);

        if(!$enable){
            return $mail_parts;
        }
        
        $append_msg = get_option('wp_reroute_email_message_to_append', '');
        $append_recipient = get_option('wp_reroute_append_recipient', '');

        $is_html = !empty($mail_parts['message']) && strstr($mail_parts['message'], '</body>') !== FALSE;

        $recipients = '';

        if ($append_recipient) {
            if (is_array($mail_parts['to'])) {
                $recipients = implode(', ', $mail_parts['to']);
            }
            else {
                $recipients = $mail_parts['to'];
            }
        }

        if ($append_msg && $append_recipient) {
            if ($is_html) {
                $append_msg .= '<br><br><hr>' . $recipients;
                $mail_parts['message'] = str_replace('</body>', $append_msg . '</body>', $mail_parts['message']);
            }
            else {
                $mail_parts['message'] .= "\r\n\r\n$append_msg
                        \r\n\r\n
                        ====================================================\r\n
                        Sent To: $recipients";
            }
        }
        else if ($append_msg) {
            if ($is_html) {
                $mail_parts['message'] = str_replace('</body>', $append_msg . '</body>', $mail_parts['message']);
            }
            else {
                $mail_parts['message'] .= "\r\n\r\n$append_msg";
            }
        }
        else if ($append_recipient) {
            if ($is_html) {
                $mail_parts['message'] = str_replace('</body>', '<br><br><hr>' . $recipients . '</body>', $mail_parts['message']);
            }
            else {
                $mail_parts['message'] .= "\r\n\r\n
                        ====================================================\r\n
                        Sent To: $recipients";
            }
        }

        return $mail_parts;
    }

    /**
     * Add a settings link to the Plugins page
     *
     * @param array $links
     * @param string $file
     *
     * @return array
     */
    public function add_settings_link($links, $file) {

        if (is_null($this->plugin_name)) {
            $this->plugin_name = plugin_basename(__FILE__);
        }

        if ($file == $this->plugin_name) {
            $settings_link = '<a href="admin.php?page=wp-reroute-email/settings.php">' . __('Settings', 'wp_reroute_email') . '</a>';
            array_unshift($links, $settings_link);
        }

        return $links;
    }
    
    private function save_to_db($phpmailer){
        global $wpdb;
        $table_name = $wpdb->prefix . 'wpre_emails';
     
        $to = $phpmailer->getToAddresses();
        $cc = $phpmailer->getCcAddresses();
        $bcc = $phpmailer->getBccAddresses();
        $recipients_to = '';
        $recipients_cc = '';
        $recipients_bcc = '';

        if(!empty($to)){
            foreach($to as $t){
                $recipients_to .= $t[0] . ',';
            }
            
            $recipients_to = trim($recipients_to, ',');
        }
        
        if(!empty($cc)){
            foreach($cc as $c){
                $recipients_cc .= $c[0] . ',';
            }
            
            $recipients_cc = trim($recipients_cc, ',');
        }
        
        if(!empty($bcc)){
            foreach($bcc as $b){
                $recipients_bcc .= $b[0] . ',';
            }
            
            $recipients_bcc = trim($recipients_bcc, ',');
        }
        
        $attachments = $phpmailer->getattachments();
        
        $sql = "INSERT INTO $table_name (subject, message, recipients_to, recipients_cc, recipients_bcc, has_attachment, sent_on)
                VALUES('" . esc_sql($phpmailer->Subject) . "', 
                '" . esc_sql($phpmailer->Body) . "', 
                '" . esc_sql($recipients_to) . "', 
                '" . esc_sql($recipients_cc) . "', 
                '" . esc_sql($recipients_bcc) . "', 
                '" . (empty($attachments) ? 0 : 1) . "',
                '" . current_time('mysql', TRUE) . "')";
        
        $wpdb->query($sql);
    }
    
    public function notice(){
        if(get_option('wp_reroute_email_enable', 0)){
            if(get_option('wp_reroute_email_enable_db_log')){
                $extra = '';
                $db_log_option = get_option('wp_reroute_email_db_log_option');
                
                if($db_log_option == 1){
                    $extra = __('All emails will be stored in database after sending.', 'wp_reroute_email');
                }
                else{
                    $extra = __('Emails will only be stored in database and no email will be sent.', 'wp_reroute_email');
                }
            }
            else if(get_option('wp_reroute_email_address')){
                $extra = sprintf(__('All emails from the site will be sent to <strong>%1$s</strong>', 'wp_reroute_email'), get_option('wp_reroute_email_address'));
            }
            
            $admin_url = admin_url();
            echo '<div class="error"> <p>' 
                . sprintf(__('This site has %1$sWP Reroute Email%2$s enabled.', 'wp_reroute_email'), '<strong>', '</strong>')
                . ($extra ? ' ' . $extra . ' ' : '')
                . sprintf(__('To change settings go %1$shere%2$s.', 'wp_reroute_email'), '<a href="' . $admin_url . 'admin.php?page=wp-reroute-email%2Fsettings.php">', '</a>') 
                    . '</p></div>';
        }
    }

    /**
     * For updating database on version upgrade
     */
    public function updateDB(){
        $current_db_ver = get_option('wpremail_db_version', 1001);

        if($current_db_ver < WP_REROUTE_EMAIL_DB_VER){
            for($i = ($current_db_ver + 1); $i <= WP_REROUTE_EMAIL_DB_VER; $i++){
                $function_name = 'updateDB' . $i;
                $this->$function_name();
                update_option('wpremail_db_version', $i);
            }
        }
    }
    
    /**
     * DB update 1002
     */
    private function updateDB1002(){
        global $wpdb;
        $table_name = $wpdb->prefix . 'wpre_emails';
	$charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS `{$table_name}` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `subject` VARCHAR(255) NULL,
                `message` TEXT NULL,
                `recipients_to` TEXT NULL,
                `recipients_cc` TEXT NULL,
                `recipients_bcc` TEXT NULL,
                `has_attachment` TINYINT(1) NOT NULL DEFAULT '0',
                `sent_on` DATETIME NULL,
                PRIMARY KEY (`id`)) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );
    }
    
    /**
     * DB update 1003
     */
    private function updateDB1003(){
        global $wpdb;
        $table_name = $wpdb->prefix . 'wpre_emails';
	$charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS `{$table_name}` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `subject` VARCHAR(255) NULL,
                `message` TEXT NULL,
                `recipients_to` TEXT NULL,
                `recipients_cc` TEXT NULL,
                `recipients_bcc` TEXT NULL,
                `has_attachment` TINYINT(1) NOT NULL DEFAULT '0',
                `sent_on` DATETIME NULL,
                PRIMARY KEY (`id`)) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );
        
        $sql = "ALTER TABLE `{$table_name}` MODIFY COLUMN sent_on datetime NULL;";
        dbDelta( $sql );
    }
}

require_once ABSPATH . WPINC . '/class-phpmailer.php';

class DummyPHPMailer extends PHPMailer{
    public function send(){
        return TRUE;
    }
}

new WPRerouteEmail();
