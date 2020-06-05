
var vcpopup = {

	// vars
	ajaxurl				:	'',
	admin_url			:	'',
	post_id				:	0,
	nonce				:	'',
	l10n				:	{},
	text				:	{},


	// helper functions
	helpers				:	{
		uniqid			: 	null,
		sortable		:	null,
		create_field	:	null
	},


	// modules
	conditional_logic	:	null,
	location			:	null
};

(function($){
/*
	*  Setup Location Rules
	*
	*  @description:
	*  @since 3.5.1
	*  @created: 15/10/12
	*/

	$(document).ready(function(){
		vcpopup.location.init();

	//	acf.conditional_logic.init();

	});
/*
	*  location
	*
	*  {description}
	*
	*/

	vcpopup.location = {
		$el : null,
		init : function(){

			// vars
			var _this = this;


			// $el
			_this.$el = $('#vcpopup_location');


			// add rule
			_this.$el.on('click', '.location-add-rule', function(){

				_this.add_rule( $(this).closest('tr') );

				return false;

			});


			// remove rule
			_this.$el.on('click', '.location-remove-rule', function(){

				_this.remove_rule( $(this).closest('tr') );

				return false;

			});


			// add rule
			_this.$el.on('click', '.location-add-group', function(){

				_this.add_group();

				return false;

			});


			// change rule
			_this.$el.on('change', '.param select', function(){

				// vars
				var $tr = $(this).closest('tr'),
					rule_id = $tr.attr('data-id'),
					$group = $tr.closest('.location-group'),
					group_id = $group.attr('data-id'),
					ajax_data = {
						'action' : "vcpopup_render_location",
						 'nonce' : vcpopup.nonce,
						'rule_id' : rule_id,
						'group_id' : group_id,
						'value' : '',
						'param' : $(this).val()
					};


				// add loading gif
				var div = $('<div class="vcpopup-loading"></div>');
				$tr.find('td.value').html( div );


				// load location html
				$.ajax({
					url: vcpopup.ajaxurl,
					data: ajax_data,
					type: 'post',
					dataType: 'html',
					success: function(html){

						div.replaceWith(html);

					}
				});


			});

		},
		add_rule : function( $tr ){

			// vars
			var $tr2 = $tr.clone(),
				old_id = $tr2.attr('data-id'),
				new_id = vcpopup.helpers.uniqid();


			// update names
			$tr2.find('[name]').each(function(){

				$(this).attr('name', $(this).attr('name').replace( old_id, new_id ));
				$(this).attr('id', $(this).attr('id').replace( old_id, new_id ));

			});


			// update data-i
			$tr2.attr( 'data-id', new_id );


			// add tr
			$tr.after( $tr2 );


			return false;

		},
		remove_rule : function( $tr ){

			// vars
			var siblings = $tr.siblings('tr').length;


			if( siblings == 0 )
			{
				// remove group
				this.remove_group( $tr.closest('.location-group') );
			}
			else
			{
				// remove tr
				$tr.remove();
			}

		},
		add_group : function(){

			// vars
			var $group = this.$el.find('.location-group:last'),
				$group2 = $group.clone(),
				old_id = $group2.attr('data-id'),
				new_id = vcpopup.helpers.uniqid();


			// update names
			$group2.find('[name]').each(function(){
				var thisname = $(this).attr('name');
				if(thisname != 'vc_popup_show_cond'){
				$(this).attr('name', $(this).attr('name').replace( old_id, new_id ));
				$(this).attr('id', $(this).attr('id').replace( old_id, new_id ));
			}

			});


			// update data-i
			$group2.attr( 'data-id', new_id );


			// update h4
			$group2.find('h4').text( 'or' );


			// remove all tr's except the first one
			$group2.find('tr:not(:first)').remove();


			// add tr
			$group.after( $group2 );


		},
		remove_group : function( $group ){

			$group.remove();

		}
	};


	vcpopup.helpers.uniqid = function(prefix, more_entropy)
    {
    	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // +    revised by: Kankrelune (http://www.webfaktory.info/)
		  // %        note 1: Uses an internal counter (in php_js global) to avoid collision
		  // *     example 1: uniqid();
		  // *     returns 1: 'a30285b160c14'
		  // *     example 2: uniqid('foo');
		  // *     returns 2: 'fooa30285b1cd361'
		  // *     example 3: uniqid('bar', true);
		  // *     returns 3: 'bara20285b23dfd1.31879087'
		  if (typeof prefix == 'undefined') {
		    prefix = "";
		  }

		  var retId;
		  var formatSeed = function (seed, reqWidth) {
		    seed = parseInt(seed, 10).toString(16); // to hex str
		    if (reqWidth < seed.length) { // so long we split
		      return seed.slice(seed.length - reqWidth);
		    }
		    if (reqWidth > seed.length) { // so short we pad
		      return Array(1 + (reqWidth - seed.length)).join('0') + seed;
		    }
		    return seed;
		  };

		  // BEGIN REDUNDANT
		  if (!this.php_js) {
		    this.php_js = {};
		  }
		  // END REDUNDANT
		  if (!this.php_js.uniqidSeed) { // init seed with big random int
		    this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
		  }
		  this.php_js.uniqidSeed++;

		  retId = prefix; // start with prefix, add current milliseconds hex string
		  retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
		  retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
		  if (more_entropy) {
		    // for more entropy we add a float lower to 10
		    retId += (Math.random() * 10).toFixed(8).toString();
		  }

		  return retId;

    };

})(jQuery)

