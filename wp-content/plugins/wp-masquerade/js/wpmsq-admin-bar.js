'use strict';
jQuery(function($){
	var $wpmasqSelectParent = $('#wp-admin-bar-wpmsq-ab-link');
	var $wpmasqInput = $wpmasqSelectParent.find('[name="wpmsq-user"]');
	var $wpmasqSubmit = $wpmasqSelectParent.find('button');
	$wpmasqSubmit.on('click', function(event){
		event.preventDefault();
		var data = {
			action: 'masq_user',
			wponce: wpmsqAdminBar.masqNonce,
			identifier: $wpmasqInput.val()
		};
		$.post(wpmsqAdminBar.ajaxurl, data, function(response){
			console.info(response);
			if(response == '1'){
				location.reload();
			}
		});
	});
});