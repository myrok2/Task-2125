;(function ( $, window, document, undefined ) {
	function Plugin (options) {
		var defaults = {
			position: "bottom right",
			content:' ',
			width:'225px',
			height:'70px',
			delay:3,
			startdelay:1,
			sticky:false,
			inEffect:'fadeIn',
			outEffect:'fadeOut',
			cssanimationIn: false,
        	cssanimationOut: false,
			theme:false,
			themeTemplate:null,
			closeOnClick:true,
			closeButton:false,
			clearAll:false,
			container:'',
			beforeStart:function(){},
			afterEnd:function(){},
			// Dont Change Below
			wrapper :'.amaran-wrapper'
		};
		this.config = $.extend( {}, defaults, options );
		this.init();
		this.config.beforeStart();
		this.createElements();
		this.close();
	}
	Plugin.prototype = {
		init: function () {
		},
		createElements:function(){




			// check for close button cookie
			var closeCookie = vcpn_getCookie('hide_pop_forever')

			if( closeCookie == 'yes'){
				return;
			}


			// check for number of times a popup can be shown

			var timesCookie = vcpn_getCookie('popup_times')

			var allowed_times = this.config.times

			if( allowed_times !=''){

				//if first time
				if( timesCookie == ''){
					document.cookie="popup_times=1; expires=Thu, 18 Dec 2020 12:00:00 GMT";
				}
				else{

					// if popup appeared set number of times.. leave
				if( timesCookie >= allowed_times )
				{
					return;
				}
				else{
					// else increment the value and add to cookie
					var inc = parseInt(timesCookie)+1
					document.cookie="popup_times="+inc+"; expires=Thu, 18 Dec 2020 12:00:00 GMT";
				}
			}

			}else{
				// delete the cookie
				document.cookie="popup_times=1; expires=Thu, 18 Dec 2008 12:00:00 GMT";
			}



			var wrapper = null;
			if(!$(this.config.wrapper).length){
				wrapper= $("<div>", {
					'class': this.config.wrapper.substr(1,this.config.wrapper.length)+' '+this.config.position
				}).appendTo('body');
			}else {
				if(!$(this.config.wrapper).hasClass(this.config.position)){
					wrapper = $("<div>",{
						'class': this.config.wrapper.substr(1,this.config.wrapper.length)+' '+this.config.position
					}).appendTo('body');
				}else{
					var cls = this.config.position.split(' '),
						wrapper = $(this.config.wrapper +'.'+cls[0]+'.'+cls[1]);
				}
			}
			var message = (typeof(this.config.content)=='object') ? (this.config.themeTemplate!=null) ? this.config.themeTemplate(this.config.content) : themes[this.config.theme.split(' ')[0]+'Theme'](this.config.content) : this.config.content;

			if( this.config.fullwidth){
				cnt_class='amaranfull';
			}else{
				cnt_class='';
			}
			var amaranObject={
				'style' :'width:'+this.config.width+';height:'+this.config.height+';',
				'class'	: (this.config.theme) ? cnt_class+' amaran '+this.config.theme : cnt_class+' amaran',
				'html'	: (this.config.closeButton) ? '<span class="amaran-close"><i class="fa fa-times-circle-o"></i></span>'+message : message
			};
			if(this.config.clearAll){ $('.amaran').remove(); }
			var element=$("<div>",
				amaranObject
			).appendTo(wrapper);
			this.animation(this.config.inEffect,element,'show');
			if(this.config.sticky!==true){this.hideDiv(element);}
		},
		getWidth:function(el){
			var newEl=el.clone().hide().appendTo('body'),
				// Getting margin value from element is pain except chrome so let it fly
				newElWidth=newEl.outerWidth()+newEl.outerWidth()/2;
				//Right way is newElWidth=newEl.outerWidth()+parseInt(el.css('margin'));
			newEl.remove();
			return newElWidth;
		},
		getInfo:function(element){
			var offset =element.offset(),
				wrapperOffset = $(this.config.wrapper).offset();
			return {
				t:offset.top,
				l:offset.left,
				h:element.height(),
				w:element.outerWidth(),
				wT:wrapperOffset.top,
				wL:wrapperOffset.left,
				wH:$(this.config.wrapper).outerHeight(),
				wW:$(this.config.wrapper).outerWidth(),
			};
		},
		getPosition:function(element,effect){
			var p = this.getInfo(element),
				parca = this.config.position.split(' ')[1],
			 	v = {
					slideTop:{
						start: 	{top:-(p.wT+p.wH+p.h*2)},
						move: 	{top:0},
						hide: 	{top:-(p.t+(p.h*2))},
						height: p.h
					},
					slideBottom:{
						start: 	{top:($(window).height()-p.wH+p.h*2)},
						move: 	{top:0},
						hide: 	{top:($(window).height()+(p.h*2))},
						height: p.h
					},
					slideLeft:{
						start: 	{left:(parca=='left') ? -p.w*1.5 : -$(window).width()},
						move: 	{left:0},
						hide: 	{left:(parca=='left') ? -p.w*1.5 : -$(window).width()},
						height: p.h
					},
					slideRight:{
						start: 	{left:(parca=='right') ? p.w*1.5 : $(window).width()},
						move: 	{left:0},
						hide: 	{left:(parca=='right') ? p.w*1.5 : $(window).width()},
						height: p.h
					},

				};
			return v[effect] ? v[effect] : 0;
		},
		 centerCalculate: function(wrapper, innerWrapper) {
        var topAmaranMargin, totalAmarans, totalAmaransHeight;
        totalAmarans = innerWrapper.find(".amaran").length;
        totalAmaransHeight = innerWrapper.height();
        topAmaranMargin = (wrapper.height() - totalAmaransHeight) / 2;
        innerWrapper.find(".amaran:first-child").animate({
          "margin-top": topAmaranMargin
        }, 200);
      },
		animation:function(effect,element,work){
			if (effect === "fadeIn" || effect === "fadeOut") {
          return this.fade(element, work);
        }
        if (effect === "show") {
          return this.cssanimate(element, work);
        }
        return this.slide(effect, element, work);
		},
		fade:function(element,work){
			 var bu;
        bu = this;
        if (work === "show") {
          if (this.config.cssanimationIn) {
            return element.addClass('animated ' + this.config.cssanimationIn).show();
          } else {
            return element.fadeIn();
          }
        } else {
          if (this.config.cssanimationOut) {
            element.addClass('animated ' + this.config.cssanimationOut);
            element.css({
              "min-height": 0,
              "height": element.outerHeight()
            });
            element.animate({
              opacity: 0
            }, function() {
              element.animate({
                height: 0
              }, function() {
                bu.removeIt(element);
              });
            });
            return;
          } else {
            element.css({
              "min-height": 0,
              "height": element.outerHeight()
            });
            element.animate({
              opacity: 0
            }, function() {
              element.animate({
                height: 0
              }, function() {
                bu.removeIt(element);
              });
            });
            return;
          }
        }
		},
		  removeIt: function(element) {
        var innerWrapper, wrapper;
        element.remove();
        wrapper = $(this.config.wrapper + "." + this.config.position.split(" ")[0] + "." + this.config.position.split(" ")[1]);
        innerWrapper = wrapper.find(".amaran-wrapper-inner");
        if (this.config.position.split(" ")[0] === "center") {
          this.centerCalculate(wrapper, innerWrapper);
        }
      },
		slide:function(effect,element,work){
			var position = this.getPosition(element,effect);
			if(work=='show'){
				var bu = this;
				 var startdelay = (bu.config.startdelay)*1000;
				element.delay(startdelay).show().css(position.start).animate(position.move);
			}else{
				var bu=this;
				element.animate(position.hide,function(){
					element.css({
						'min-height':0,
						'height':position.height
					},function(){
						element.html(' ');
					});
				}).animate({height:0},function(){
					element.remove();
					bu.config.afterEnd();
				});
			}
		},
		close:function()
		{
			   var bu;
        bu = this;
        $("[data-amaran-close]").on("click", function() {
          bu.animation(bu.config.outEffect, $(this).closest("div.amaran"), "hide");
        });
        if (!this.config.closeOnClick && this.config.closeButton) {
          bu.animation(bu.config.outEffect, $(this).parent("div.amaran"), "hide");
          console.log("Close False Button True");
          return;
        } else if (this.config.closeOnClick) {
          $(".amaran").on("click", function() {
            bu.animation(bu.config.outEffect, $(this), "hide");
          });
        }
		},
		hideDiv:function(element){
			var bu = this;
			 var outdelay = (bu.config.delay)*1000;
			setTimeout(function(){ bu.animation(bu.config.outEffect,element,'hide');}, outdelay);
		}
	};
	var themes={
		defaultTheme:function(data){

			var text = $('#hidden-content-'+data.container).html();

				var icon_class ='';
				var content_class='';

				var ic = $.trim(data.icon)

			return '<i class="ic '+data.icon+'"></i><p class="bold">'+data.message+'</p><p><span>'+data.size+'</span><span class="light">'+text+'</span></p>';
		},
		userTheme:function(data){
			return '<div class="ic"><img src="'+data.img+'" alt="" /></div><div class="info"><b>'+data.user+'</b>'+data.message+'</div>';
		},
		blurTheme:function(data){

			var text = $('#hidden-content-'+data.container).html()
			return '<h2>'+data.title+'</h2><div class="message">'+text+'</div>';
		},
		metroTheme:function(data){
			if($('.metroWrapper').length=='0'){
				$('.amaran-wrapper').addClass('metroWrapper').css('background',data.background);
			}
			var metroContent	='<div class="vcpn-content"><span class="metro-close"  onclick="jQuery.amaran.close()"><i class="fa fa-times-circle-o"></i></span>'+data.message+'<div class="metro-buttons">'+data.buttons+'</div></div>'
			return metroContent;
		},
		roundedTheme:function(data){
			return "<img src='"+data.img+"' alt='user'>";
		},
		readmoreTheme:function(data){
			var text = $('#hidden-content-'+data.container).html()
			return '<img src="'+data.img+'" alt="" class="readmore-user"><div class="title">'+data.title+'</div><div class="vcpn-content">'+text+'</div>';
		}
	};
	$.amaran = function ( options ) {
		var amaran=new Plugin(options);
		return amaran;
	};
	$.amaran.close=function(){
		$('.amaran-wrapper').remove();
		return false;
	};
})( jQuery, window, document );


function vcpn_getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

