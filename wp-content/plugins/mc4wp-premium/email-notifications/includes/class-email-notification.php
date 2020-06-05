<?php

/**
 * Class MC4WP_Email_Notification
 *
 * @ignore
 * @access private
 */
class MC4WP_Email_Notification {

	/**
	 * @var mixed Recipients of the email notification
	 */
	public $recipients;

	/**
	 * @var string Message of the email
	 */
	public $message_body = '';

	/**
	 * @var string Email subject
	 */
	public $subject = '';

	/**
	 * @var MC4WP_Form Form this notification is set-up for
	 */
	public $form;

	/**
	 * @var string Content type of the email
	 */
	public $content_type = 'text/html';

	/**
	 * @param mixed $recipients
	 * @param string $subject
	 * @param string $message_body
	 * @param string $content_type
	 * @param MC4WP_Form $form
	 * @param array $data
	 * @param array $pretty_data
	 */
	public function __construct( $recipients, $subject, $message_body, $content_type, MC4WP_Form $form, $data, $pretty_data = array() ) {
		$this->recipients = $recipients;
		$this->subject = $subject;
		$this->content_type = $content_type;
		$this->message_body = $message_body;
		$this->form = $form;
		$this->data = $data;
		$this->pretty_data = $pretty_data;
	}

	/**
	 * Returns a readable & sanitized presentation of the value
	 *
	 * @param mixed $value
	 *
	 * @return string
	 */
	protected function readable_value( $value ) {

		if( is_array( $value ) ) {
			$value = join( ', ', $value );
		}

		// strip all HTML tags
		return strip_tags( $value );
	}

	/**
	 * @return array|string
	 */
	public function get_recipients() {

		// parse tags in receivers
		$recipients = $this->parse_tags( $this->recipients );

		/**
		 * Filters the recipients of the email notification for forms just before it is sent.
		 *
		 * @param string $recipients
		 */
		$recipients = (string) apply_filters( 'mc4wp_form_email_notification_recipients', $recipients );

		/**
		 * @deprecated 3.1
		 * @use `mc4wp_form_email_notification_recipients`
		 */
		$recipients = apply_filters( 'mc4wp_email_summary_receiver', $recipients, $this->form->ID, $this->form->data );

		return $recipients;
	}

	/**
	 * @return string
	 */
	public function get_subject() {

		// parse tags in subject
		$subject = $this->parse_tags( $this->subject );

		/**
		 * Filters the subject line of the email notification just before it is sent.
		 *
		 * @param string $subject
		 */
		$subject = (string) apply_filters( 'mc4wp_form_email_notification_subject', $subject );

		/**
		 * @deprecated 3.1
		 * @use `mc4wp_form_email_notification_subject`
		 */
		$subject = (string) apply_filters( 'mc4wp_email_summary_subject', $subject, $this->form->ID, $this->form->data );

		return $subject;
	}

	/**
	 * @return string
	 */
	private function replace_summary_tag() {
		$string = '';
		foreach( $this->pretty_data as $label => $value ) {
			$string .= sprintf( '%s: %s', $label, $this->readable_value( $value ) ) . "\r\n";
		}
		return $string;
	}

	/**
	 * @param string $key
	 * @param null $subkey
	 *
	 * @return string
	 */
	private function replace_field_tag( $key, $subkey = null ) {

		// return empty string if value not known
		if( ! isset( $this->data[ $key ] ) ) {
			return '';
		}

		$value = $this->data[ $key ];

		// do we need subkey?
		if( $subkey && is_array( $value ) ) {
			// uppercase array keys as mc4wp only uppercases top-level array keys
			$value = array_change_key_case( $value, CASE_UPPER );
			return isset( $value[ $subkey ] ) ? $this->readable_value( $value[ $subkey ] ) : '';
		}

		return $this->readable_value( $value );
	}

	/**
	 * @param array $matches
	 * @return string
	 */
	public function replace_tag( $matches ) {

		$key = strtoupper( $matches[1] );
		$subkey = isset( $matches[2] ) ? strtoupper( $matches[2] ) : null;

		// catch-all tag
		if( $key === '_ALL_' ) {
			return $this->replace_summary_tag();
		}

		// field tag
		return $this->replace_field_tag( $key, $subkey );
	}

	/**
	 * @param $string
	 *
	 * @return mixed
	 */
	private function parse_tags( $string ) {
		$string = preg_replace_callback( '/\[(\w+)(?:\:(\w+)){0,1}\]/', array( $this, 'replace_tag' ), $string );
		return $string;
	}

	/**
	 * @return string
	 */
	public function get_message() {

		// parse tags in message body
		$message = $this->parse_tags( $this->message_body );

		// add <br> tags when content type is set to HTML
		if( $this->content_type === 'text/html' ) {
			$message = nl2br( $message );
		}

		/**
		 * Filters the message body of the email notification for forms just before it is sent.
		 *
		 * @param string $message
		 */
		$message = (string) apply_filters( 'mc4wp_form_email_notification_message', $message );

		/**
		 * @deprecated 3.1
		 * @use `mc4wp_form_email_notification_message`
		 */
		$message = (string) apply_filters( 'mc4wp_email_summary_message', $message, $this->form->ID, $this->form->data );

		return $message;
	}

	/**
	 * Send email
	 *
	 * @return bool
	 */
	public function send() {
		return wp_mail(
			$this->get_recipients(),
			$this->get_subject(),
			$this->get_message(),
			'Content-Type: ' . $this->content_type
		);
	}

}