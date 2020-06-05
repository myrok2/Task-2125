// Utility
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {

	var gilidPanel = {
		init: function( options, elem ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );
			self.containerWidth = self.$elem.width(); // get element width

			self.options = $.extend( {}, $.fn.gilidFn.options, options );

			self.display(); 
			self.open();
		},
		display: function(){
			var self = this;
			var inlineCss = {};
			inlineCss[self.options.position] = -self.containerWidth + 'px'; //push panel to negative left or right depends on width
			inlineCss['visibility'] = 'visible'; //override css visibility

			self.$elem.css(inlineCss);
		},
		open: function(){
			var self = this;
			var inlineCss = {};
			var openerCss = {};

			$('.gilidPanel-opener a, .open-gilidpanel, .gilidPanel-overlay').on('click',function(e){
				if(self.$elem.hasClass('opened')){
					inlineCss[self.options.position] =  -self.containerWidth + 'px'; //set animate container
					openerCss[self.options.position] =  '0px'; //set animate opener

					self.$elem.animate(inlineCss,self.options.animSpeed);
					$('div.gilidPanel-opener').animate(openerCss,self.options.animSpeed);

					//animate body if type = push
					if(self.options.type == "push"){
						$('body').animate(openerCss,self.options.animSpeed);
					}

					self.$elem.removeClass('opened'); //remove toggle class
					$('body').removeClass('gilidPanel-open');
					$('div.gilidPanel-opener').removeClass('gilidPanel-opener-opened');
				}else{
					inlineCss[self.options.position] =  '0px';
					openerCss[self.options.position] =  self.containerWidth + 'px';

					self.$elem.animate(
							inlineCss,
							self.options.animSpeed,
							self.options.easing
					);
					
					$('div.gilidPanel-opener').animate(
							openerCss,
							self.options.animSpeed,
							self.options.easing
						);

					//animate body if type = push
					if(self.options.type == "push"){
						$('body').animate(
							openerCss,
							self.options.animSpeed,
							self.options.easing
						);
					}

					self.$elem.addClass('opened'); //add toggle class
					$('body').addClass('gilidPanel-open'); //add toggle class
					$('div.gilidPanel-opener').addClass('gilidPanel-opener-opened');
				}
				e.preventDefault();
			});
		}
	};

	$.fn.gilidFn = function( options ) {
		return this.each(function() {
			var gilid = Object.create( gilidPanel );
			
			gilid.init( options, this );

			$.data( this, 'gilidFn', gilid );
		});
	};

	$.fn.gilidFn.options = {
		position : "left", //left or right
		type : "slide", //slide or push
		easing : "easeOutQuad",
		animSpeed : 350
	};

	//navigation menu widget
	$(".gilidPanel-wrap li.gldpnl-has-children").prepend("<span class='gldpnl-dropdown'>+</span>");
	$('.gldpnl-dropdown').on('click',function(){
		if( $(this).hasClass('opened') ){
			$(this).html('+');
			$(this).removeClass('opened');
		}else{
			$(this).html('-');
			$(this).addClass('opened');
		}

		$(this).closest('.gldpnl-has-children').find('.sub-menu').eq(0).slideToggle();
	});

})( jQuery, window, document );