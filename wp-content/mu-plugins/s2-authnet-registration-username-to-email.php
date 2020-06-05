<?php if( !defined('WPINC') ) // MUST have WordPress.
	exit('Do not access this file directly.');

/**
 * Main logic that uses sanitized email as the username during s2member authnet
 * registration and checkout process.
 *
 * @note if new gateway was introduced you would need to also hook into it, this
 * does not cover any other payment gateways introduced
 *
 * @see https://s2member.com/kb-article/using-the-e-mail-address-as-the-username/
 * @see https://www.s2member.com/codex/stable/s2member/authnet/package-filters/
 */

	add_action('init', function() {
		/** Free Account, e.g, subscriber */
		if ( ! empty($_POST['s2member_pro_authnet_registration']) ) {

			$_POST['s2member_pro_authnet_registration']['username'] =
				sanitize_user( $_POST['s2member_pro_authnet_registration']['email'], true );

		}
		/** Paid Accounts, e.g, individual member, & corporate membership */
		elseif ( ! empty($_POST['s2member_pro_authnet_checkout']) ) {

			$_POST['s2member_pro_authnet_checkout']['username'] =
				sanitize_user($_POST['s2member_pro_authnet_checkout']['email'], true);
		}

	});
