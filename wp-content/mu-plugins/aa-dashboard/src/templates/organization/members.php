<?php
	use Paradigm\Concepts\Functional as F;
	use Helpers\Organization as O;

	if ( CAN_USER_ADMIN_THIS_ORG ) :

		/**
		 * Delete member logic
		 */
		if(!empty($_POST)) {

			$post_id   = get_the_ID();
			$member_id = $_POST['which-member'];
			$passed    = wp_verify_nonce( $_POST['_wpnonce'], 'delete_member_' . $post_id );

			if ( $passed ) {

				$result = p2p_type( 'user_to_organization_member' )->disconnect( $member_id, $post_id );

				if ( ! empty( $result ) ) {

					$op = [
						'op'   => 'modify_user',
						'data' => [
							'user_id'                => $member_id,
							's2member_level'         => '0',
							's2member_auto_eot_time' => '',
							's2member_notes'         => 'Removed from organization: ' . get_the_title()
						]
					];

					$modify_user = c_ws_plugin__s2member_pro_remote_ops_in::modify_user( $op );

				}
			}
		}

		$render_delete_button = function($user_obj) {
			$html = '';
			if (! in_array('s2member_level2', $user_obj->roles)) {
				$html = '<button class="btn btn-danger">Delete</button>';
			}
			return $html;
		};

		$member_table_row = function($user_obj) use ($render_delete_button) {
			$html  = '<tr id="' . $user_obj->ID . '">';
			$html .= '<td class="first-name">' . $user_obj->first_name . '</td>';
			$html .= '<td class="last-name">' . $user_obj->last_name . '</td>';
			$html .= '<td class="email">' . $user_obj->user_email . '</td>';
			$html .= '<td class="registered-date">' . date('M/d/Y', strtotime($user_obj->user_registered)) . '</td>';
			$html .= '<td class="delete">' . $render_delete_button($user_obj) . '</td>';
			$html .= '</tr>';
			return $html;
		};

		$members = new F\ListMonad(O\get_organization_members_by('post', get_post())) ;
?>
		<style>
			.main {
				padding-bottom: 150px;
			}
		</style>

		<div class="container">

			<h1>Members</h1>

			<?php if (!empty($members->extract())) : ?>
				<style>
					#members-list {
						background: #efefef;
						padding: 30px;
						margin:50px auto;
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

				<div id="members-list">

					<div style="position: relative; margin-bottom: 10px;">
						
						<label>
							Search for a Member
							<input class="search" placeholder="Search" />
						</label>

						<div style="display: inline-block; position: absolute; right:0; top:0;">
							<a href="?action=invite" class="aa_btn btn-primary">Invites</a>
						</div>

					</div>

					<table class="table table-striped">
						<thead>
						<tr>
							<th>
								<button class="sort" data-sort="first-name">
									First Name
								</button>
							</th>
							<th>
								<button class="sort" data-sort="last-name">
									Last Name
								</button>
							</th>
							<th>
								<button class="sort" data-sort="email">
									Email
								</button>
							</th>
							<th>
								<button class="sort" data-sort="registered-date">
									Registered
								</button>
							</th>
							<th><!-- heading--></th>
						</tr>
						</thead>
						<tbody class="list">

						<?php
							$display_member_row = $members
								->bind(function($member) use ($member_table_row) {
									$member->first_name = get_user_meta($member->ID, 'first_name', true);
									$member->last_name  = get_user_meta($member->ID, 'last_name', true);
									echo $member_table_row($member);
								});
						?>
						</tbody>
					</table>
					<ul class="pagination"></ul>
				</div>

				<form id="delete-member" action="" method="post">
					<input type="hidden" name="which-member">
					<?php echo wp_nonce_field('delete_member_'.get_the_ID()); ?>
				</form>

				<script src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.2.0/list.min.js"></script>
				<script src="//cdnjs.cloudflare.com/ajax/libs/list.pagination.js/0.1.1/list.pagination.min.js"></script>
				<script>
					var options = {
						valueNames: [ 'first-name', 'last-name', 'email', 'registered-date' ],
						page: 10,
						plugins: [ ListPagination({}) ]
					};
					var userList = new List('members-list', options);
					var deleteInviteConfirmation = (function($) {
						var list = $('#members-list');
						var form = $('#delete-member');
						var memberInput = $('[name="which-member"]');
						list.on('click', 'td.delete > button', function() {
							var self = $(this);
							var memberInputValue = self.parent().parent().attr('id');
							memberInput.val(memberInputValue);
							form.submit();
						});
						form.on('submit', function() {
							return confirm('Are you sure you want to remove this member?');
						});
					})(jQuery);
				</script>
				<?php wp_reset_postdata(); ?>
			<?php endif; ?>
		</div>

<?php endif;
