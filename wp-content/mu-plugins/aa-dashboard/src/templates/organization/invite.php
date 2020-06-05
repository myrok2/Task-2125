<?php

use AgileAlliance\Invites\Invite as Invite;
use Helpers\User as U;
use Paradigm\Concepts\Functional as F;

/**
 * Only a member that is of this organization and has the capability of
 * 'aa_admin_organization' will be able to see the content
 */

if ( CAN_USER_ADMIN_THIS_ORG && CAN_USER_ADMIN_INVITE_TO_ORG ) :

	$invites = Invite::get_invites();
	$corporate_contact = wp_get_current_user();
	$user_id = $corporate_contact->ID;
	$corporate_contact_meta = U\singleized_meta(get_user_meta($user_id));
	$max_memberships   = Invite::get_max_membership($user_id);
	$available_invites = Invite::get_available_invites($user_id);

	/**
	 * Inivte action(s) $_POST logic
	 */

	if (!empty($_POST)) {

		$invite_id = $_POST['invite'];
		$invite_action = $_POST['invite-action'];
		$invite_email  = $_POST['invite-email'];
		$action = '';

		switch($invite_action) {
			case 'approve':
			case 'deny' :
				$action = 'request_decision_';
				break;
			case 'delete':
				$action = 'delete_invite_';
				break;
		}

		$verify_action = $action . $invite_id;

		$passed = wp_verify_nonce( $_POST['_wpnonce'], $verify_action );

		$is_action = function($action) {
			$invite_action = $_POST['invite-action'];
			return ! empty($invite_action) && $invite_action === $action;
		};

		if (! empty($passed)) {

			$headers = ['Content-Type: text/html; charset=UTF-8'];

			if ($is_action('approve')) {

				$org_name = get_the_title();

				$subject = $org_name
				           . ' has approved you request to join';

				$corporate_contact_name = $corporate_contact_meta['first_name']
				                          . ' '
				                          . $corporate_contact_meta['last_name'];

				$data = [
					'first_name' => get_field('first_name', $invite_id),
					'org_name'   => $org_name,
					'corp_contact_name' => $corporate_contact_name,
					'requestor_email' => $invite_email,
					'activation_link' => Invite::create_invite_api_uri( $invite_id )
				];

				$message = Invite::approved_invite_email_copy($data);

				Invite::update_invite_acf_fields( [
					[Invite::INVITE_STATUS_ACF_KEY, 'pending-activation', $invite_id]
				]);

				wp_mail($invite_email, $subject, $message, $headers);

			}

			if ($is_action('deny')) {

				$subject = 'Declined your request';

				$data = [
					'first_name' => get_field('first_name', $invite_id),
					'org_name'   => get_the_title()
				];

				$message = Invite::denied_invite_email_copy($data);

				$update_invite_status = Invite::update_invite_acf_fields( [
					[Invite::INVITE_STATUS_ACF_KEY, 'denied', $invite_id]
				] );

				if ($update_invite_status) {
					wp_mail($invite_email, $subject, $message, $headers);
					wp_trash_post($invite_id);
				}

			}

			if ($is_action('delete')) {

				if (update_field('status', 'deleted', $invite_id)) {
					wp_trash_post($invite_id);
				}

			}

		}

	}

	?>

	<style>
		.main {
			padding-bottom: 150px;
		}
	</style>

	<div class="container">

		<h1>Invite</h1>

		<!-- invite stats -->
		<div>
			<div>
				Memberships Tier:
			<span style="text-transform: capitalize">
				<?php echo $max_memberships; ?> Members
			</span>
			</div>
			<div>
				Available Slots:
			<span style="text-transform: capitalize">
				<?php echo  $available_invites;?>
			</span>
			</div>
		</div>

		<!-- send invites -->
		<?php if( is_numeric($available_invites) && $available_invites > 0
			|| strcasecmp($max_memberships, 'unlimited') === 0 ) : ?>
			<?php gravity_form('Organization Invite', false, false, false, false); ?>
		<?php endif; ?>

		<!-- invites sent -->
		<?php /*var_dump( json_decode(S2MEMBER_CURRENT_USER_FIELDS) );*/?>
		<?php if ( $invites->have_posts() !== false ) : ?>
			<style>
				#invite-list {
					background: #efefef;
					padding: 2px 30px;
					margin-bottom: 50px;
					border-radius: 5px;
				}
				.sort {
					padding: 8px 30px 0 0;
					border: none;
					display: inline-block;
					color: #666;
					text-decoration: none;
					background-color: transparent;
					height: 30px;
				}
				.sort:hover {
					text-decoration: none;
				}
				.sort:focus {
					outline:none;
				}
				.sort:after {
					display:inline-block;
					width: 0;
					height: 0;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-bottom: 5px solid transparent;
					content:"";
					position: relative;
					top:-10px;
					right:-5px;
				}
				.sort.asc:after {
					width: 0;
					height: 0;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-top: 5px solid #666;
					content:"";
					position: relative;
					top:4px;
					right:-5px;
				}
				.sort.desc:after {
					width: 0;
					height: 0;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-bottom: 5px solid #666;
					content:"";
					position: relative;
					top:-4px;
					right:-5px;
				}
			</style>
			<div id="invite-list">
				<h2> Invite(s) Sent</h2>

				<div style="position: relative; margin-bottom: 10px;">

					<label>
						Search for an Invite
						<input class="search" placeholder="Search" />
					</label>

					<div style="display: inline-block; position: absolute; right:0; top:0;">
						<a href="?action=members" class="aa_btn btn-primary">Members</a>
					</div>

				</div>

				<table class="table table-striped">
					<thead>
						<tr>
							<th>
								<button class="sort" data-sort="status">
									Status
								</button>
							</th>
							<th>
								<button class="sort" data-sort="recipient">
									Recipient
								</button>
							</th>
							<th><!-- heading--></th>
						</tr>
					</thead>
					<tbody class="list">
					<?php while( $invites->have_posts() ) : $invites->the_post(); ?>

						<?php $fields = get_fields(); ?>

						<?php if ($fields['status'] !== 'deleted'
						          && $fields['status'] !== 'denied') : ?>
							<tr>
								<td class="status"><?php echo $fields['status']?></td>
								<td class="recipient"><?php echo $fields['recipient']?></td>
								<td class="actions" style="text-align:right">
									<?php if ( strcasecmp($fields['status'], 'pending') === 0) :?>
										<form action="" method="POST">
											<button class="aa_btn aa_border-orange-primary" name="request-delete" value="delete">Delete</button>
											<input type="hidden" name="invite-action" value="">
											<input type="hidden" name="invite" value="<?php echo get_the_ID(); ?>">
											<?php echo wp_nonce_field('delete_invite_'.get_the_ID()); ?>
										</form>
									<?php endif; ?>
									<?php if ( strcasecmp( $fields['status'], 'pending-approval'  ) === 0) :?>
										<form action="" method="POST">
											<button class="aa_btn aa_border-green-primary"  name="request-decision" value="approve">
												Approve
											</button>
											<button class="aa_btn aa_border-orange-primary" name="request-decision" value="deny">
												Deny
											</button>
											<input type="hidden" name="invite-email" value="<?php echo $fields['recipient']; ?>">
											<input type="hidden" name="invite-action" value="">
											<input type="hidden" name="invite" value="<?php echo get_the_ID(); ?>">
											<?php echo wp_nonce_field('request_decision_'.get_the_ID()); ?>
										</form>
									<?php endif; ?>
								</td>
							</tr>
						<?php endif;?>
						<?php endwhile; ?>
					</tbody>
				</table>
				<ul class="pagination"></ul>
			</div>
			<script src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.2.0/list.min.js"></script>
			<script src="//cdnjs.cloudflare.com/ajax/libs/list.pagination.js/0.1.1/list.pagination.min.js"></script>
			<script>

				var inviteActionConfirmation = (function($) {
					var inviteActionName = 'invite-action';
					var inviteActionSelector = '[name="' + inviteActionName + '"]';
					var form = $('td.actions > form');
					var formButton = form.find('button');

					var generateConfirmationCopy = function(action) {
						return 'Are you sure you want to ' + action + ' this invite?';
					}

					formButton.on('click', function(event) {
						event.preventDefault();
						var self = $(this);
						var inviteActionInput = self.siblings(inviteActionSelector);
						var parentForm = self.parent();
						inviteActionInput.val(self.val());
						parentForm.trigger('submit');
					});

					form.on('submit', function() {
						var self = $(this);
						var formValues = self.serializeArray();
						var inviteAction = formValues
							.filter(function(obj) {
								return obj.name === inviteActionName;
							})
							.shift()
							.value;
						return confirm(generateConfirmationCopy(inviteAction));
					});

				})(jQuery);

				var options = {
					valueNames: [ 'status', 'recipient' ],
					page: 10,
					plugins: [ ListPagination({}) ]
				};
				var userList = new List('invite-list', options);

			</script>
			<?php wp_reset_postdata(); ?>
		<?php endif; ?>
	</div>

<?php endif; ?>