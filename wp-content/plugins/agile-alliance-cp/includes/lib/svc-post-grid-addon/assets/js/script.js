function svc_add_animation($this, animation) {
	$this.removeClass('animated '+animation).addClass('animated '+animation).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
		$this.css({
			'-webkit-animation':'none',
	   '-webkit-animation-name':'none',
			   'animation-name':'none',
					'animation':'none'
		});
		$this.removeClass('animated '+animation).removeAttr('svc-animation');
	});
}
function svc_imag_animation(){
	jQuery('[svc-animation]').each(function () {
		var animation_style = jQuery(this).attr('svc-animation');
		svc_add_animation(jQuery(this), animation_style);
	});
}
function svc_addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}