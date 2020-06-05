(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Accordion = function(element) {
	'use strict';

	var accordions = [],
		accordionElements;

	var AccordionElement = function( element) {

		var heading,
			content;

		function init() {
			heading = element.querySelector('h2,h3,h4');
			content = element.querySelector('div');

			element.setAttribute('class','accordion');
			heading.setAttribute('class','accordion-heading');
			content.setAttribute('class','accordion-content');
			content.style.display = 'none';

			heading.onclick = toggle;
		}

		/**
		 * Open this accordion
		 */
		function open() {
			toggle(true);
		}

		/**
		 * Close this accordion
		 */
		function close() {
			toggle(false);
		}

		/**
		 * Toggle this accordion
		 *
		 * @param show
		 */
		function toggle(show) {

			if( typeof(show) !== "boolean" ) {
				show = ( content.offsetParent === null );
			}

			if( show ) {
				closeAll();
			}

			content.style.display = show ? 'block' : 'none';
			element.className = 'accordion ' + ( ( show ) ? 'expanded' : 'collapsed' );
		}

		/**
		 * Expose some methods
		 */
		return {
			'open': open,
			'close': close,
			'toggle': toggle,
			'init': init
		}

	};

	/**
	 * Close all accordions
	 */
	function closeAll() {
		for(var i=0; i<accordions.length; i++){
			accordions[i].close();
		}
	}

	/**
	 * Initialize the accordion functionality
	 */
	function init() {
		// add class to container
		element.className+= " accordion-container";

		// find accordion blocks
		accordionElements = element.children;

		// hide all content blocks
		for( var i=0; i < accordionElements.length; i++) {

			// only act on direct <div> children
			if( accordionElements[i].tagName.toUpperCase() !== 'DIV' ) {
				continue;
			}

			// create new accordion
			var accordion = new AccordionElement(accordionElements[i]);
			accordion.init();

			// add to list of accordions
			accordions.push(accordion);
		}

		// open first accordion
		accordions[0].open();
	}

	/**
	 * Expose some methods
	 */
	return {
		'init': init
	}


};

module.exports = Accordion;
},{}],2:[function(require,module,exports){
var FormPreview = function(context) {
	'use strict';

	var $context,
		$elements,
		Option = require('./_option.js'),
		$ = window.jQuery;

	// find all elements
	$context = $(context);

	// create option elements
	var options = createOptions();

	// attach events
	$(".mc4wp-option").on('input change', applyStyles);
	$('.color-field').wpColorPicker({
		change: applyStyles,
		clear: applyStyles
	});


	// initialize form preview
	function init() {
		var $form = $context.contents().find('.mc4wp-form');

		$elements = {
			form: $form,
			labels: $form.find('label'),
			fields: $form.find('input[type="text"], input[type="email"], input[type="url"], input[type="number"], input[type="date"], select, textarea'),
			choices: $form.find('input[type="radio"], input[type="checkbox"]'),
			buttons: $form.find('input[type="submit"], input[type="button"], button'),
			messages: $form.find('.mc4wp-alert'),
			css: $context.contents().find('#custom-css')
		};

		// apply custom styles to fields (focus)
		$elements.fields.focus(setFieldFocusStyles);
		$elements.fields.focusout(setDefaultFieldStyles);

		// apply custom styles to buttons (hover)
		$elements.buttons.hover(setButtonHoverStyles, setDefaultButtonStyles);

		// apply selected settings straight away
		applyStyles();
	}

	// create option elements from HTML elements
	function createOptions() {
		var optionElements = document.querySelectorAll('.mc4wp-option');
		var options = {};

		for( var i=0; i<optionElements.length; i++ ) {
			options[ optionElements[i].id ] = new Option( optionElements[i] );
		}

		return options;
	}

	function clearStyles() {
		$elements.form.removeAttr('style');
		$elements.labels.removeAttr('style');
		$elements.fields.removeAttr('style');
		$elements.buttons.removeAttr('style');
		$elements.choices.removeAttr('style');
		$elements.messages.removeAttr('style');
	}

	function applyStyles() {

		$elements.choices.css({
			'display': 'inline-block',
			'margin-right': '6px'
		});

		$elements.buttons.css({
			"text-align": "center",
			"cursor": "pointer",
			"padding": "6px 12px",
			"text-shadow": "none",
			"box-sizing": "border-box",
			"line-height": "normal",
			"vertical-align": "top"
		});

		// apply custom styles to form
		$elements.form.css({
			'max-width': options["form-width"].getValue(),
			'text-align': options["form-text-align"].getValue(),
			'font-size': options["form-font-size"].getPxValue(),
			"font-color": options["form-font-color"].getColorValue(),
			"background-color": options["form-background-color"].getColorValue(),
			"border-color": options["form-border-color"].getColorValue(),
			"border-width": options["form-border-width"].getPxValue(),
			"padding": options["form-padding"].getPxValue()
		});

		// responsive label width
		if( options["form-width"].getValue().length ) {
			$elements.form.css('width', '100%');
		}

		// set background image (if set, otherwise reset)
		if( options["form-background-image"].getValue().length > 0 ) {
			$elements.form.css('background-image', 'url("' + options["form-background-image"].getValue() + '")');
			$elements.form.css('background-repeat', options["form-background-repeat"].getValue() );
		} else {
			$elements.form.css('background-image', 'initial');
			$elements.form.css('background-repeat','');
		}

		if( options["form-border-width"].getValue() > 0 ) {
			$elements.form.css( 'border-style', 'solid' );
		}

		// apply custom styles to labels
		$elements.labels.css({
			"margin-bottom": "6px",
			"box-sizing": "border-box",
			"vertical-align": "top",
			"color": options["labels-font-color"].getColorValue(),
			"font-size": options["labels-font-size"].getPxValue(),
			"display": options["labels-display"].getValue(),
			"max-width": options["labels-width"].getValue()
		});

		// responsive label width
		if( options["labels-width"].getValue().length ) {
			$elements.labels.css('width', '100%');
		}

		// reset font style of <span> elements inside <label> elements
		$elements.labels.find('span').css('font-weight', 'normal' );

		// only set label text style if it's set
		var labelsFontStyle = options["labels-font-style"].getValue();
		if( labelsFontStyle.length > 0 ) {
			$elements.labels.css({
				"font-weight": (labelsFontStyle == 'bold' || labelsFontStyle == 'bolditalic') ? 'bold' : 'normal',
				"font-style": (labelsFontStyle == 'italic' || labelsFontStyle == 'bolditalic') ? 'italic' : 'normal'
			});
		}

		// apply custom styles to inputs
		$elements.fields.css({
			"padding": '6px 12px',
			"margin-bottom": "6px",
			"box-sizing": "border-box",
			"vertical-align": "top",
			"border-width": options["fields-border-width"].getPxValue(),
			"border-color": options["fields-border-color"].getColorValue(),
			"border-radius": options["fields-border-radius"].getPxValue(),
			"display": options["fields-display"].getValue(),
			"max-width": options["fields-width"].getValue(),
			"height": options["fields-height"].getPxValue()
		});

		// responsive field width
		if( options["fields-width"].getValue().length ) {
			$elements.fields.css('width', '100%');
		}

		// apply custom styles to buttons
		$elements.buttons.css({
			'border-width': options["buttons-border-width"].getPxValue(),
			'border-color': options["buttons-border-color"].getColorValue(),
			"border-radius": options["buttons-border-radius"].getPxValue(),
			'max-width': options["buttons-width"].getValue(),
			'height': options["buttons-height"].getPxValue(),
			'background-color': options["buttons-background-color"].getColorValue(),
			'color': options["buttons-font-color"].getColorValue(),
			'font-size': options["buttons-font-size"].getPxValue()
		});

		// responsive buttons width
		if( options["buttons-width"].getValue().length ) {
			$elements.buttons.css('width', '100%');
		}

		// add border style if border-width is set and bigger than 0
		if( options["buttons-border-width"].getValue() > 0 ) {
			$elements.buttons.css( 'border-style', 'solid' );
		}

		// add background reset if custom button background was set
		if( options["buttons-background-color"].getColorValue().length ) {
			$elements.buttons.css({
				"background-image": "none",
				"filter": "none"
			});

			// calculate hover color
			var hoverColor = lightenColor( options["buttons-background-color"].getColorValue(), -20 );
			options["buttons-hover-background-color"].setValue(hoverColor);
		} else {
			options["buttons-hover-background-color"].setValue('');
		}

		if( options["buttons-border-color"].getColorValue().length ) {
			var hoverColor = lightenColor( options["buttons-border-color"].getColorValue(), -20 );
			options["buttons-hover-border-color"].setValue(hoverColor);
		} else {
			options["buttons-hover-border-color"].setValue('');
		}

		// apply custom styles to messages
		$elements.messages.filter('.mc4wp-success').css({
			'color': options["messages-font-color-success"].getColorValue()
		});

		$elements.messages.filter('.mc4wp-error').css({
			'color': options["messages-font-color-error"].getColorValue()
		});

		// print custom css in container element
		$elements.css.html(options["manual-css"].getValue());
	}

	function setButtonHoverStyles() {
		// calculate darker color
		$elements.buttons.css('background-color', options["buttons-hover-background-color"].getColorValue() );
		$elements.buttons.css('border-color', options["buttons-hover-border-color"].getColorValue() );
	}

	function setDefaultButtonStyles() {
		$elements.buttons.css({
			'border-color': options["buttons-border-color"].getColorValue(),
			'background-color': options["buttons-background-color"].getColorValue()
		});
	}

	function setFieldFocusStyles() {
		if( options["fields-focus-outline-color"].getColorValue().length ) {
			$elements.fields.css('outline', '2px solid ' + options["fields-focus-outline-color"].getColorValue() );
		} else {
			setDefaultFieldStyles();
		}
	}

	function setDefaultFieldStyles() {
		$elements.fields.css('outline', '' );
	}

	function lightenColor(col, amt) {

		var usePound = false;

		if (col[0] == "#") {
			col = col.slice(1);
			usePound = true;
		}

		var num = parseInt(col,16);

		var r = (num >> 16) + amt;

		if (r > 255) r = 255;
		else if  (r < 0) r = 0;

		var b = ((num >> 8) & 0x00FF) + amt;

		if (b > 255) b = 255;
		else if  (b < 0) b = 0;

		var g = (num & 0x0000FF) + amt;

		if (g > 255) g = 255;
		else if (g < 0) g = 0;

		return (usePound?"#":"") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
	}

	return {
		init: init,
		applyStyles: applyStyles
	}

};


module.exports = FormPreview;
},{"./_option.js":3}],3:[function(require,module,exports){
var Option = function( element ) {

	var $ = window.jQuery;

	// find corresponding element
	this.element = element;
	this.$element = $(element);

	// helper methods
	this.getColorValue = function() {
		if( this.element.value.length > 0 ) {
			if( this.element.className.indexOf('wp-color-picker') !== -1) {
				return this.$element.wpColorPicker('color');
			} else {
				return this.element.value;
			}
		}

		return '';
	};

	this.getPxValue = function( fallbackValue ) {
		if( this.element.value.length > 0 ) {
			return parseInt( this.element.value ) + "px";
		}

		return fallbackValue || '';
	};

	this.getValue = function( fallbackValue ) {

		if( this.element.value.length > 0 ) {
			return this.element.value;
		}

		return fallbackValue || '';
	};

	this.clear = function() {
		this.element.value = '';
	};

	this.setValue = function(value) {
		this.element.value = value;
	};
};

module.exports = Option;
},{}],4:[function(require,module,exports){
'use strict';

var $ = window.jQuery;
var iframeElement = document.getElementById('mc4wp-css-preview');
var FormPreview = require('./_form-preview.js');
var preview = new FormPreview( iframeElement );
var $imageUploadTarget;
var original_send_to_editor = window.send_to_editor;
var Accordion = require('./_accordion.js'),
	accordion;

// init
$(iframeElement).load(preview.init);

// turn settings page into accordion
accordion = new Accordion(document.querySelector('.mc4wp-accordion'));
accordion.init();

// show generated CSS button
$(".mc4wp-show-css").click(function() {

	var $generatedCss = $("#mc4wp_generated_css");
	$generatedCss.toggle();

	if( $generatedCss.is(":visible")) {
		$(this).text("Hide generated CSS");
	} else {
		$(this).text("Show generated CSS");
	}
});

$(".mc4wp-form-select").change( function() {
	$(this).parents('form').submit();
});

// show thickbox when clicking on "upload-image" buttons
$(".upload-image").click( function() {
	$imageUploadTarget = $(this).siblings('input');
	tb_show('', 'media-upload.php?type=image&TB_iframe=true');
});

// attach handler to "send to editor" button
window.send_to_editor = function(html){
	if( $imageUploadTarget ) {
		var imgurl = $('img',html).attr('src');
		$imageUploadTarget.val(imgurl);
		tb_remove();
	} else {
		original_send_to_editor(html);
	}

	preview.applyStyles();
};
},{"./_accordion.js":1,"./_form-preview.js":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdHlsZXMtYnVpbGRlci9hc3NldHMvYnJvd3NlcmlmeS9fYWNjb3JkaW9uLmpzIiwic3R5bGVzLWJ1aWxkZXIvYXNzZXRzL2Jyb3dzZXJpZnkvX2Zvcm0tcHJldmlldy5qcyIsInN0eWxlcy1idWlsZGVyL2Fzc2V0cy9icm93c2VyaWZ5L19vcHRpb24uanMiLCJzdHlsZXMtYnVpbGRlci9hc3NldHMvYnJvd3NlcmlmeS9zdHlsZXMtYnVpbGRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEFjY29yZGlvbiA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBhY2NvcmRpb25zID0gW10sXG5cdFx0YWNjb3JkaW9uRWxlbWVudHM7XG5cblx0dmFyIEFjY29yZGlvbkVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbWVudCkge1xuXG5cdFx0dmFyIGhlYWRpbmcsXG5cdFx0XHRjb250ZW50O1xuXG5cdFx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdGhlYWRpbmcgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gyLGgzLGg0Jyk7XG5cdFx0XHRjb250ZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdkaXYnKTtcblxuXHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywnYWNjb3JkaW9uJyk7XG5cdFx0XHRoZWFkaW5nLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCdhY2NvcmRpb24taGVhZGluZycpO1xuXHRcdFx0Y29udGVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywnYWNjb3JkaW9uLWNvbnRlbnQnKTtcblx0XHRcdGNvbnRlbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0aGVhZGluZy5vbmNsaWNrID0gdG9nZ2xlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIE9wZW4gdGhpcyBhY2NvcmRpb25cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBvcGVuKCkge1xuXHRcdFx0dG9nZ2xlKHRydWUpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENsb3NlIHRoaXMgYWNjb3JkaW9uXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2xvc2UoKSB7XG5cdFx0XHR0b2dnbGUoZmFsc2UpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRvZ2dsZSB0aGlzIGFjY29yZGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNob3dcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB0b2dnbGUoc2hvdykge1xuXG5cdFx0XHRpZiggdHlwZW9mKHNob3cpICE9PSBcImJvb2xlYW5cIiApIHtcblx0XHRcdFx0c2hvdyA9ICggY29udGVudC5vZmZzZXRQYXJlbnQgPT09IG51bGwgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIHNob3cgKSB7XG5cdFx0XHRcdGNsb3NlQWxsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRlbnQuc3R5bGUuZGlzcGxheSA9IHNob3cgPyAnYmxvY2snIDogJ25vbmUnO1xuXHRcdFx0ZWxlbWVudC5jbGFzc05hbWUgPSAnYWNjb3JkaW9uICcgKyAoICggc2hvdyApID8gJ2V4cGFuZGVkJyA6ICdjb2xsYXBzZWQnICk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhwb3NlIHNvbWUgbWV0aG9kc1xuXHRcdCAqL1xuXHRcdHJldHVybiB7XG5cdFx0XHQnb3Blbic6IG9wZW4sXG5cdFx0XHQnY2xvc2UnOiBjbG9zZSxcblx0XHRcdCd0b2dnbGUnOiB0b2dnbGUsXG5cdFx0XHQnaW5pdCc6IGluaXRcblx0XHR9XG5cblx0fTtcblxuXHQvKipcblx0ICogQ2xvc2UgYWxsIGFjY29yZGlvbnNcblx0ICovXG5cdGZ1bmN0aW9uIGNsb3NlQWxsKCkge1xuXHRcdGZvcih2YXIgaT0wOyBpPGFjY29yZGlvbnMubGVuZ3RoOyBpKyspe1xuXHRcdFx0YWNjb3JkaW9uc1tpXS5jbG9zZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIHRoZSBhY2NvcmRpb24gZnVuY3Rpb25hbGl0eVxuXHQgKi9cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHQvLyBhZGQgY2xhc3MgdG8gY29udGFpbmVyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUrPSBcIiBhY2NvcmRpb24tY29udGFpbmVyXCI7XG5cblx0XHQvLyBmaW5kIGFjY29yZGlvbiBibG9ja3Ncblx0XHRhY2NvcmRpb25FbGVtZW50cyA9IGVsZW1lbnQuY2hpbGRyZW47XG5cblx0XHQvLyBoaWRlIGFsbCBjb250ZW50IGJsb2Nrc1xuXHRcdGZvciggdmFyIGk9MDsgaSA8IGFjY29yZGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdC8vIG9ubHkgYWN0IG9uIGRpcmVjdCA8ZGl2PiBjaGlsZHJlblxuXHRcdFx0aWYoIGFjY29yZGlvbkVsZW1lbnRzW2ldLnRhZ05hbWUudG9VcHBlckNhc2UoKSAhPT0gJ0RJVicgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjcmVhdGUgbmV3IGFjY29yZGlvblxuXHRcdFx0dmFyIGFjY29yZGlvbiA9IG5ldyBBY2NvcmRpb25FbGVtZW50KGFjY29yZGlvbkVsZW1lbnRzW2ldKTtcblx0XHRcdGFjY29yZGlvbi5pbml0KCk7XG5cblx0XHRcdC8vIGFkZCB0byBsaXN0IG9mIGFjY29yZGlvbnNcblx0XHRcdGFjY29yZGlvbnMucHVzaChhY2NvcmRpb24pO1xuXHRcdH1cblxuXHRcdC8vIG9wZW4gZmlyc3QgYWNjb3JkaW9uXG5cdFx0YWNjb3JkaW9uc1swXS5vcGVuKCk7XG5cdH1cblxuXHQvKipcblx0ICogRXhwb3NlIHNvbWUgbWV0aG9kc1xuXHQgKi9cblx0cmV0dXJuIHtcblx0XHQnaW5pdCc6IGluaXRcblx0fVxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQWNjb3JkaW9uOyIsInZhciBGb3JtUHJldmlldyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciAkY29udGV4dCxcblx0XHQkZWxlbWVudHMsXG5cdFx0T3B0aW9uID0gcmVxdWlyZSgnLi9fb3B0aW9uLmpzJyksXG5cdFx0JCA9IHdpbmRvdy5qUXVlcnk7XG5cblx0Ly8gZmluZCBhbGwgZWxlbWVudHNcblx0JGNvbnRleHQgPSAkKGNvbnRleHQpO1xuXG5cdC8vIGNyZWF0ZSBvcHRpb24gZWxlbWVudHNcblx0dmFyIG9wdGlvbnMgPSBjcmVhdGVPcHRpb25zKCk7XG5cblx0Ly8gYXR0YWNoIGV2ZW50c1xuXHQkKFwiLm1jNHdwLW9wdGlvblwiKS5vbignaW5wdXQgY2hhbmdlJywgYXBwbHlTdHlsZXMpO1xuXHQkKCcuY29sb3ItZmllbGQnKS53cENvbG9yUGlja2VyKHtcblx0XHRjaGFuZ2U6IGFwcGx5U3R5bGVzLFxuXHRcdGNsZWFyOiBhcHBseVN0eWxlc1xuXHR9KTtcblxuXG5cdC8vIGluaXRpYWxpemUgZm9ybSBwcmV2aWV3XG5cdGZ1bmN0aW9uIGluaXQoKSB7XG5cdFx0dmFyICRmb3JtID0gJGNvbnRleHQuY29udGVudHMoKS5maW5kKCcubWM0d3AtZm9ybScpO1xuXG5cdFx0JGVsZW1lbnRzID0ge1xuXHRcdFx0Zm9ybTogJGZvcm0sXG5cdFx0XHRsYWJlbHM6ICRmb3JtLmZpbmQoJ2xhYmVsJyksXG5cdFx0XHRmaWVsZHM6ICRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdLCBpbnB1dFt0eXBlPVwiZW1haWxcIl0sIGlucHV0W3R5cGU9XCJ1cmxcIl0sIGlucHV0W3R5cGU9XCJudW1iZXJcIl0sIGlucHV0W3R5cGU9XCJkYXRlXCJdLCBzZWxlY3QsIHRleHRhcmVhJyksXG5cdFx0XHRjaG9pY2VzOiAkZm9ybS5maW5kKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0sIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLFxuXHRcdFx0YnV0dG9uczogJGZvcm0uZmluZCgnaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSwgaW5wdXRbdHlwZT1cImJ1dHRvblwiXSwgYnV0dG9uJyksXG5cdFx0XHRtZXNzYWdlczogJGZvcm0uZmluZCgnLm1jNHdwLWFsZXJ0JyksXG5cdFx0XHRjc3M6ICRjb250ZXh0LmNvbnRlbnRzKCkuZmluZCgnI2N1c3RvbS1jc3MnKVxuXHRcdH07XG5cblx0XHQvLyBhcHBseSBjdXN0b20gc3R5bGVzIHRvIGZpZWxkcyAoZm9jdXMpXG5cdFx0JGVsZW1lbnRzLmZpZWxkcy5mb2N1cyhzZXRGaWVsZEZvY3VzU3R5bGVzKTtcblx0XHQkZWxlbWVudHMuZmllbGRzLmZvY3Vzb3V0KHNldERlZmF1bHRGaWVsZFN0eWxlcyk7XG5cblx0XHQvLyBhcHBseSBjdXN0b20gc3R5bGVzIHRvIGJ1dHRvbnMgKGhvdmVyKVxuXHRcdCRlbGVtZW50cy5idXR0b25zLmhvdmVyKHNldEJ1dHRvbkhvdmVyU3R5bGVzLCBzZXREZWZhdWx0QnV0dG9uU3R5bGVzKTtcblxuXHRcdC8vIGFwcGx5IHNlbGVjdGVkIHNldHRpbmdzIHN0cmFpZ2h0IGF3YXlcblx0XHRhcHBseVN0eWxlcygpO1xuXHR9XG5cblx0Ly8gY3JlYXRlIG9wdGlvbiBlbGVtZW50cyBmcm9tIEhUTUwgZWxlbWVudHNcblx0ZnVuY3Rpb24gY3JlYXRlT3B0aW9ucygpIHtcblx0XHR2YXIgb3B0aW9uRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWM0d3Atb3B0aW9uJyk7XG5cdFx0dmFyIG9wdGlvbnMgPSB7fTtcblxuXHRcdGZvciggdmFyIGk9MDsgaTxvcHRpb25FbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdG9wdGlvbnNbIG9wdGlvbkVsZW1lbnRzW2ldLmlkIF0gPSBuZXcgT3B0aW9uKCBvcHRpb25FbGVtZW50c1tpXSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2xlYXJTdHlsZXMoKSB7XG5cdFx0JGVsZW1lbnRzLmZvcm0ucmVtb3ZlQXR0cignc3R5bGUnKTtcblx0XHQkZWxlbWVudHMubGFiZWxzLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cdFx0JGVsZW1lbnRzLmZpZWxkcy5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXHRcdCRlbGVtZW50cy5idXR0b25zLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cdFx0JGVsZW1lbnRzLmNob2ljZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcblx0XHQkZWxlbWVudHMubWVzc2FnZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGFwcGx5U3R5bGVzKCkge1xuXG5cdFx0JGVsZW1lbnRzLmNob2ljZXMuY3NzKHtcblx0XHRcdCdkaXNwbGF5JzogJ2lubGluZS1ibG9jaycsXG5cdFx0XHQnbWFyZ2luLXJpZ2h0JzogJzZweCdcblx0XHR9KTtcblxuXHRcdCRlbGVtZW50cy5idXR0b25zLmNzcyh7XG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIixcblx0XHRcdFwiY3Vyc29yXCI6IFwicG9pbnRlclwiLFxuXHRcdFx0XCJwYWRkaW5nXCI6IFwiNnB4IDEycHhcIixcblx0XHRcdFwidGV4dC1zaGFkb3dcIjogXCJub25lXCIsXG5cdFx0XHRcImJveC1zaXppbmdcIjogXCJib3JkZXItYm94XCIsXG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IFwibm9ybWFsXCIsXG5cdFx0XHRcInZlcnRpY2FsLWFsaWduXCI6IFwidG9wXCJcblx0XHR9KTtcblxuXHRcdC8vIGFwcGx5IGN1c3RvbSBzdHlsZXMgdG8gZm9ybVxuXHRcdCRlbGVtZW50cy5mb3JtLmNzcyh7XG5cdFx0XHQnbWF4LXdpZHRoJzogb3B0aW9uc1tcImZvcm0td2lkdGhcIl0uZ2V0VmFsdWUoKSxcblx0XHRcdCd0ZXh0LWFsaWduJzogb3B0aW9uc1tcImZvcm0tdGV4dC1hbGlnblwiXS5nZXRWYWx1ZSgpLFxuXHRcdFx0J2ZvbnQtc2l6ZSc6IG9wdGlvbnNbXCJmb3JtLWZvbnQtc2l6ZVwiXS5nZXRQeFZhbHVlKCksXG5cdFx0XHRcImZvbnQtY29sb3JcIjogb3B0aW9uc1tcImZvcm0tZm9udC1jb2xvclwiXS5nZXRDb2xvclZhbHVlKCksXG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogb3B0aW9uc1tcImZvcm0tYmFja2dyb3VuZC1jb2xvclwiXS5nZXRDb2xvclZhbHVlKCksXG5cdFx0XHRcImJvcmRlci1jb2xvclwiOiBvcHRpb25zW1wiZm9ybS1ib3JkZXItY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpLFxuXHRcdFx0XCJib3JkZXItd2lkdGhcIjogb3B0aW9uc1tcImZvcm0tYm9yZGVyLXdpZHRoXCJdLmdldFB4VmFsdWUoKSxcblx0XHRcdFwicGFkZGluZ1wiOiBvcHRpb25zW1wiZm9ybS1wYWRkaW5nXCJdLmdldFB4VmFsdWUoKVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmVzcG9uc2l2ZSBsYWJlbCB3aWR0aFxuXHRcdGlmKCBvcHRpb25zW1wiZm9ybS13aWR0aFwiXS5nZXRWYWx1ZSgpLmxlbmd0aCApIHtcblx0XHRcdCRlbGVtZW50cy5mb3JtLmNzcygnd2lkdGgnLCAnMTAwJScpO1xuXHRcdH1cblxuXHRcdC8vIHNldCBiYWNrZ3JvdW5kIGltYWdlIChpZiBzZXQsIG90aGVyd2lzZSByZXNldClcblx0XHRpZiggb3B0aW9uc1tcImZvcm0tYmFja2dyb3VuZC1pbWFnZVwiXS5nZXRWYWx1ZSgpLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQkZWxlbWVudHMuZm9ybS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKFwiJyArIG9wdGlvbnNbXCJmb3JtLWJhY2tncm91bmQtaW1hZ2VcIl0uZ2V0VmFsdWUoKSArICdcIiknKTtcblx0XHRcdCRlbGVtZW50cy5mb3JtLmNzcygnYmFja2dyb3VuZC1yZXBlYXQnLCBvcHRpb25zW1wiZm9ybS1iYWNrZ3JvdW5kLXJlcGVhdFwiXS5nZXRWYWx1ZSgpICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRlbGVtZW50cy5mb3JtLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICdpbml0aWFsJyk7XG5cdFx0XHQkZWxlbWVudHMuZm9ybS5jc3MoJ2JhY2tncm91bmQtcmVwZWF0JywnJyk7XG5cdFx0fVxuXG5cdFx0aWYoIG9wdGlvbnNbXCJmb3JtLWJvcmRlci13aWR0aFwiXS5nZXRWYWx1ZSgpID4gMCApIHtcblx0XHRcdCRlbGVtZW50cy5mb3JtLmNzcyggJ2JvcmRlci1zdHlsZScsICdzb2xpZCcgKTtcblx0XHR9XG5cblx0XHQvLyBhcHBseSBjdXN0b20gc3R5bGVzIHRvIGxhYmVsc1xuXHRcdCRlbGVtZW50cy5sYWJlbHMuY3NzKHtcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBcIjZweFwiLFxuXHRcdFx0XCJib3gtc2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxuXHRcdFx0XCJ2ZXJ0aWNhbC1hbGlnblwiOiBcInRvcFwiLFxuXHRcdFx0XCJjb2xvclwiOiBvcHRpb25zW1wibGFiZWxzLWZvbnQtY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpLFxuXHRcdFx0XCJmb250LXNpemVcIjogb3B0aW9uc1tcImxhYmVscy1mb250LXNpemVcIl0uZ2V0UHhWYWx1ZSgpLFxuXHRcdFx0XCJkaXNwbGF5XCI6IG9wdGlvbnNbXCJsYWJlbHMtZGlzcGxheVwiXS5nZXRWYWx1ZSgpLFxuXHRcdFx0XCJtYXgtd2lkdGhcIjogb3B0aW9uc1tcImxhYmVscy13aWR0aFwiXS5nZXRWYWx1ZSgpXG5cdFx0fSk7XG5cblx0XHQvLyByZXNwb25zaXZlIGxhYmVsIHdpZHRoXG5cdFx0aWYoIG9wdGlvbnNbXCJsYWJlbHMtd2lkdGhcIl0uZ2V0VmFsdWUoKS5sZW5ndGggKSB7XG5cdFx0XHQkZWxlbWVudHMubGFiZWxzLmNzcygnd2lkdGgnLCAnMTAwJScpO1xuXHRcdH1cblxuXHRcdC8vIHJlc2V0IGZvbnQgc3R5bGUgb2YgPHNwYW4+IGVsZW1lbnRzIGluc2lkZSA8bGFiZWw+IGVsZW1lbnRzXG5cdFx0JGVsZW1lbnRzLmxhYmVscy5maW5kKCdzcGFuJykuY3NzKCdmb250LXdlaWdodCcsICdub3JtYWwnICk7XG5cblx0XHQvLyBvbmx5IHNldCBsYWJlbCB0ZXh0IHN0eWxlIGlmIGl0J3Mgc2V0XG5cdFx0dmFyIGxhYmVsc0ZvbnRTdHlsZSA9IG9wdGlvbnNbXCJsYWJlbHMtZm9udC1zdHlsZVwiXS5nZXRWYWx1ZSgpO1xuXHRcdGlmKCBsYWJlbHNGb250U3R5bGUubGVuZ3RoID4gMCApIHtcblx0XHRcdCRlbGVtZW50cy5sYWJlbHMuY3NzKHtcblx0XHRcdFx0XCJmb250LXdlaWdodFwiOiAobGFiZWxzRm9udFN0eWxlID09ICdib2xkJyB8fCBsYWJlbHNGb250U3R5bGUgPT0gJ2JvbGRpdGFsaWMnKSA/ICdib2xkJyA6ICdub3JtYWwnLFxuXHRcdFx0XHRcImZvbnQtc3R5bGVcIjogKGxhYmVsc0ZvbnRTdHlsZSA9PSAnaXRhbGljJyB8fCBsYWJlbHNGb250U3R5bGUgPT0gJ2JvbGRpdGFsaWMnKSA/ICdpdGFsaWMnIDogJ25vcm1hbCdcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIGFwcGx5IGN1c3RvbSBzdHlsZXMgdG8gaW5wdXRzXG5cdFx0JGVsZW1lbnRzLmZpZWxkcy5jc3Moe1xuXHRcdFx0XCJwYWRkaW5nXCI6ICc2cHggMTJweCcsXG5cdFx0XHRcIm1hcmdpbi1ib3R0b21cIjogXCI2cHhcIixcblx0XHRcdFwiYm94LXNpemluZ1wiOiBcImJvcmRlci1ib3hcIixcblx0XHRcdFwidmVydGljYWwtYWxpZ25cIjogXCJ0b3BcIixcblx0XHRcdFwiYm9yZGVyLXdpZHRoXCI6IG9wdGlvbnNbXCJmaWVsZHMtYm9yZGVyLXdpZHRoXCJdLmdldFB4VmFsdWUoKSxcblx0XHRcdFwiYm9yZGVyLWNvbG9yXCI6IG9wdGlvbnNbXCJmaWVsZHMtYm9yZGVyLWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKSxcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBvcHRpb25zW1wiZmllbGRzLWJvcmRlci1yYWRpdXNcIl0uZ2V0UHhWYWx1ZSgpLFxuXHRcdFx0XCJkaXNwbGF5XCI6IG9wdGlvbnNbXCJmaWVsZHMtZGlzcGxheVwiXS5nZXRWYWx1ZSgpLFxuXHRcdFx0XCJtYXgtd2lkdGhcIjogb3B0aW9uc1tcImZpZWxkcy13aWR0aFwiXS5nZXRWYWx1ZSgpLFxuXHRcdFx0XCJoZWlnaHRcIjogb3B0aW9uc1tcImZpZWxkcy1oZWlnaHRcIl0uZ2V0UHhWYWx1ZSgpXG5cdFx0fSk7XG5cblx0XHQvLyByZXNwb25zaXZlIGZpZWxkIHdpZHRoXG5cdFx0aWYoIG9wdGlvbnNbXCJmaWVsZHMtd2lkdGhcIl0uZ2V0VmFsdWUoKS5sZW5ndGggKSB7XG5cdFx0XHQkZWxlbWVudHMuZmllbGRzLmNzcygnd2lkdGgnLCAnMTAwJScpO1xuXHRcdH1cblxuXHRcdC8vIGFwcGx5IGN1c3RvbSBzdHlsZXMgdG8gYnV0dG9uc1xuXHRcdCRlbGVtZW50cy5idXR0b25zLmNzcyh7XG5cdFx0XHQnYm9yZGVyLXdpZHRoJzogb3B0aW9uc1tcImJ1dHRvbnMtYm9yZGVyLXdpZHRoXCJdLmdldFB4VmFsdWUoKSxcblx0XHRcdCdib3JkZXItY29sb3InOiBvcHRpb25zW1wiYnV0dG9ucy1ib3JkZXItY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IG9wdGlvbnNbXCJidXR0b25zLWJvcmRlci1yYWRpdXNcIl0uZ2V0UHhWYWx1ZSgpLFxuXHRcdFx0J21heC13aWR0aCc6IG9wdGlvbnNbXCJidXR0b25zLXdpZHRoXCJdLmdldFZhbHVlKCksXG5cdFx0XHQnaGVpZ2h0Jzogb3B0aW9uc1tcImJ1dHRvbnMtaGVpZ2h0XCJdLmdldFB4VmFsdWUoKSxcblx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogb3B0aW9uc1tcImJ1dHRvbnMtYmFja2dyb3VuZC1jb2xvclwiXS5nZXRDb2xvclZhbHVlKCksXG5cdFx0XHQnY29sb3InOiBvcHRpb25zW1wiYnV0dG9ucy1mb250LWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKSxcblx0XHRcdCdmb250LXNpemUnOiBvcHRpb25zW1wiYnV0dG9ucy1mb250LXNpemVcIl0uZ2V0UHhWYWx1ZSgpXG5cdFx0fSk7XG5cblx0XHQvLyByZXNwb25zaXZlIGJ1dHRvbnMgd2lkdGhcblx0XHRpZiggb3B0aW9uc1tcImJ1dHRvbnMtd2lkdGhcIl0uZ2V0VmFsdWUoKS5sZW5ndGggKSB7XG5cdFx0XHQkZWxlbWVudHMuYnV0dG9ucy5jc3MoJ3dpZHRoJywgJzEwMCUnKTtcblx0XHR9XG5cblx0XHQvLyBhZGQgYm9yZGVyIHN0eWxlIGlmIGJvcmRlci13aWR0aCBpcyBzZXQgYW5kIGJpZ2dlciB0aGFuIDBcblx0XHRpZiggb3B0aW9uc1tcImJ1dHRvbnMtYm9yZGVyLXdpZHRoXCJdLmdldFZhbHVlKCkgPiAwICkge1xuXHRcdFx0JGVsZW1lbnRzLmJ1dHRvbnMuY3NzKCAnYm9yZGVyLXN0eWxlJywgJ3NvbGlkJyApO1xuXHRcdH1cblxuXHRcdC8vIGFkZCBiYWNrZ3JvdW5kIHJlc2V0IGlmIGN1c3RvbSBidXR0b24gYmFja2dyb3VuZCB3YXMgc2V0XG5cdFx0aWYoIG9wdGlvbnNbXCJidXR0b25zLWJhY2tncm91bmQtY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpLmxlbmd0aCApIHtcblx0XHRcdCRlbGVtZW50cy5idXR0b25zLmNzcyh7XG5cdFx0XHRcdFwiYmFja2dyb3VuZC1pbWFnZVwiOiBcIm5vbmVcIixcblx0XHRcdFx0XCJmaWx0ZXJcIjogXCJub25lXCJcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBjYWxjdWxhdGUgaG92ZXIgY29sb3Jcblx0XHRcdHZhciBob3ZlckNvbG9yID0gbGlnaHRlbkNvbG9yKCBvcHRpb25zW1wiYnV0dG9ucy1iYWNrZ3JvdW5kLWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKSwgLTIwICk7XG5cdFx0XHRvcHRpb25zW1wiYnV0dG9ucy1ob3Zlci1iYWNrZ3JvdW5kLWNvbG9yXCJdLnNldFZhbHVlKGhvdmVyQ29sb3IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvcHRpb25zW1wiYnV0dG9ucy1ob3Zlci1iYWNrZ3JvdW5kLWNvbG9yXCJdLnNldFZhbHVlKCcnKTtcblx0XHR9XG5cblx0XHRpZiggb3B0aW9uc1tcImJ1dHRvbnMtYm9yZGVyLWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKS5sZW5ndGggKSB7XG5cdFx0XHR2YXIgaG92ZXJDb2xvciA9IGxpZ2h0ZW5Db2xvciggb3B0aW9uc1tcImJ1dHRvbnMtYm9yZGVyLWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKSwgLTIwICk7XG5cdFx0XHRvcHRpb25zW1wiYnV0dG9ucy1ob3Zlci1ib3JkZXItY29sb3JcIl0uc2V0VmFsdWUoaG92ZXJDb2xvcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdGlvbnNbXCJidXR0b25zLWhvdmVyLWJvcmRlci1jb2xvclwiXS5zZXRWYWx1ZSgnJyk7XG5cdFx0fVxuXG5cdFx0Ly8gYXBwbHkgY3VzdG9tIHN0eWxlcyB0byBtZXNzYWdlc1xuXHRcdCRlbGVtZW50cy5tZXNzYWdlcy5maWx0ZXIoJy5tYzR3cC1zdWNjZXNzJykuY3NzKHtcblx0XHRcdCdjb2xvcic6IG9wdGlvbnNbXCJtZXNzYWdlcy1mb250LWNvbG9yLXN1Y2Nlc3NcIl0uZ2V0Q29sb3JWYWx1ZSgpXG5cdFx0fSk7XG5cblx0XHQkZWxlbWVudHMubWVzc2FnZXMuZmlsdGVyKCcubWM0d3AtZXJyb3InKS5jc3Moe1xuXHRcdFx0J2NvbG9yJzogb3B0aW9uc1tcIm1lc3NhZ2VzLWZvbnQtY29sb3ItZXJyb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpXG5cdFx0fSk7XG5cblx0XHQvLyBwcmludCBjdXN0b20gY3NzIGluIGNvbnRhaW5lciBlbGVtZW50XG5cdFx0JGVsZW1lbnRzLmNzcy5odG1sKG9wdGlvbnNbXCJtYW51YWwtY3NzXCJdLmdldFZhbHVlKCkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2V0QnV0dG9uSG92ZXJTdHlsZXMoKSB7XG5cdFx0Ly8gY2FsY3VsYXRlIGRhcmtlciBjb2xvclxuXHRcdCRlbGVtZW50cy5idXR0b25zLmNzcygnYmFja2dyb3VuZC1jb2xvcicsIG9wdGlvbnNbXCJidXR0b25zLWhvdmVyLWJhY2tncm91bmQtY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpICk7XG5cdFx0JGVsZW1lbnRzLmJ1dHRvbnMuY3NzKCdib3JkZXItY29sb3InLCBvcHRpb25zW1wiYnV0dG9ucy1ob3Zlci1ib3JkZXItY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpICk7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXREZWZhdWx0QnV0dG9uU3R5bGVzKCkge1xuXHRcdCRlbGVtZW50cy5idXR0b25zLmNzcyh7XG5cdFx0XHQnYm9yZGVyLWNvbG9yJzogb3B0aW9uc1tcImJ1dHRvbnMtYm9yZGVyLWNvbG9yXCJdLmdldENvbG9yVmFsdWUoKSxcblx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogb3B0aW9uc1tcImJ1dHRvbnMtYmFja2dyb3VuZC1jb2xvclwiXS5nZXRDb2xvclZhbHVlKClcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNldEZpZWxkRm9jdXNTdHlsZXMoKSB7XG5cdFx0aWYoIG9wdGlvbnNbXCJmaWVsZHMtZm9jdXMtb3V0bGluZS1jb2xvclwiXS5nZXRDb2xvclZhbHVlKCkubGVuZ3RoICkge1xuXHRcdFx0JGVsZW1lbnRzLmZpZWxkcy5jc3MoJ291dGxpbmUnLCAnMnB4IHNvbGlkICcgKyBvcHRpb25zW1wiZmllbGRzLWZvY3VzLW91dGxpbmUtY29sb3JcIl0uZ2V0Q29sb3JWYWx1ZSgpICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNldERlZmF1bHRGaWVsZFN0eWxlcygpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHNldERlZmF1bHRGaWVsZFN0eWxlcygpIHtcblx0XHQkZWxlbWVudHMuZmllbGRzLmNzcygnb3V0bGluZScsICcnICk7XG5cdH1cblxuXHRmdW5jdGlvbiBsaWdodGVuQ29sb3IoY29sLCBhbXQpIHtcblxuXHRcdHZhciB1c2VQb3VuZCA9IGZhbHNlO1xuXG5cdFx0aWYgKGNvbFswXSA9PSBcIiNcIikge1xuXHRcdFx0Y29sID0gY29sLnNsaWNlKDEpO1xuXHRcdFx0dXNlUG91bmQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHZhciBudW0gPSBwYXJzZUludChjb2wsMTYpO1xuXG5cdFx0dmFyIHIgPSAobnVtID4+IDE2KSArIGFtdDtcblxuXHRcdGlmIChyID4gMjU1KSByID0gMjU1O1xuXHRcdGVsc2UgaWYgIChyIDwgMCkgciA9IDA7XG5cblx0XHR2YXIgYiA9ICgobnVtID4+IDgpICYgMHgwMEZGKSArIGFtdDtcblxuXHRcdGlmIChiID4gMjU1KSBiID0gMjU1O1xuXHRcdGVsc2UgaWYgIChiIDwgMCkgYiA9IDA7XG5cblx0XHR2YXIgZyA9IChudW0gJiAweDAwMDBGRikgKyBhbXQ7XG5cblx0XHRpZiAoZyA+IDI1NSkgZyA9IDI1NTtcblx0XHRlbHNlIGlmIChnIDwgMCkgZyA9IDA7XG5cblx0XHRyZXR1cm4gKHVzZVBvdW5kP1wiI1wiOlwiXCIpICsgU3RyaW5nKFwiMDAwMDAwXCIgKyAoZyB8IChiIDw8IDgpIHwgKHIgPDwgMTYpKS50b1N0cmluZygxNikpLnNsaWNlKC02KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0aW5pdDogaW5pdCxcblx0XHRhcHBseVN0eWxlczogYXBwbHlTdHlsZXNcblx0fVxuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybVByZXZpZXc7IiwidmFyIE9wdGlvbiA9IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXG5cdHZhciAkID0gd2luZG93LmpRdWVyeTtcblxuXHQvLyBmaW5kIGNvcnJlc3BvbmRpbmcgZWxlbWVudFxuXHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcblxuXHQvLyBoZWxwZXIgbWV0aG9kc1xuXHR0aGlzLmdldENvbG9yVmFsdWUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiggdGhpcy5lbGVtZW50LnZhbHVlLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRpZiggdGhpcy5lbGVtZW50LmNsYXNzTmFtZS5pbmRleE9mKCd3cC1jb2xvci1waWNrZXInKSAhPT0gLTEpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuJGVsZW1lbnQud3BDb2xvclBpY2tlcignY29sb3InKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmVsZW1lbnQudmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICcnO1xuXHR9O1xuXG5cdHRoaXMuZ2V0UHhWYWx1ZSA9IGZ1bmN0aW9uKCBmYWxsYmFja1ZhbHVlICkge1xuXHRcdGlmKCB0aGlzLmVsZW1lbnQudmFsdWUubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybiBwYXJzZUludCggdGhpcy5lbGVtZW50LnZhbHVlICkgKyBcInB4XCI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbGxiYWNrVmFsdWUgfHwgJyc7XG5cdH07XG5cblx0dGhpcy5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCBmYWxsYmFja1ZhbHVlICkge1xuXG5cdFx0aWYoIHRoaXMuZWxlbWVudC52YWx1ZS5sZW5ndGggPiAwICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWxlbWVudC52YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsbGJhY2tWYWx1ZSB8fCAnJztcblx0fTtcblxuXHR0aGlzLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lbGVtZW50LnZhbHVlID0gJyc7XG5cdH07XG5cblx0dGhpcy5zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWU7XG5cdH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gd2luZG93LmpRdWVyeTtcbnZhciBpZnJhbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21jNHdwLWNzcy1wcmV2aWV3Jyk7XG52YXIgRm9ybVByZXZpZXcgPSByZXF1aXJlKCcuL19mb3JtLXByZXZpZXcuanMnKTtcbnZhciBwcmV2aWV3ID0gbmV3IEZvcm1QcmV2aWV3KCBpZnJhbWVFbGVtZW50ICk7XG52YXIgJGltYWdlVXBsb2FkVGFyZ2V0O1xudmFyIG9yaWdpbmFsX3NlbmRfdG9fZWRpdG9yID0gd2luZG93LnNlbmRfdG9fZWRpdG9yO1xudmFyIEFjY29yZGlvbiA9IHJlcXVpcmUoJy4vX2FjY29yZGlvbi5qcycpLFxuXHRhY2NvcmRpb247XG5cbi8vIGluaXRcbiQoaWZyYW1lRWxlbWVudCkubG9hZChwcmV2aWV3LmluaXQpO1xuXG4vLyB0dXJuIHNldHRpbmdzIHBhZ2UgaW50byBhY2NvcmRpb25cbmFjY29yZGlvbiA9IG5ldyBBY2NvcmRpb24oZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1jNHdwLWFjY29yZGlvbicpKTtcbmFjY29yZGlvbi5pbml0KCk7XG5cbi8vIHNob3cgZ2VuZXJhdGVkIENTUyBidXR0b25cbiQoXCIubWM0d3Atc2hvdy1jc3NcIikuY2xpY2soZnVuY3Rpb24oKSB7XG5cblx0dmFyICRnZW5lcmF0ZWRDc3MgPSAkKFwiI21jNHdwX2dlbmVyYXRlZF9jc3NcIik7XG5cdCRnZW5lcmF0ZWRDc3MudG9nZ2xlKCk7XG5cblx0aWYoICRnZW5lcmF0ZWRDc3MuaXMoXCI6dmlzaWJsZVwiKSkge1xuXHRcdCQodGhpcykudGV4dChcIkhpZGUgZ2VuZXJhdGVkIENTU1wiKTtcblx0fSBlbHNlIHtcblx0XHQkKHRoaXMpLnRleHQoXCJTaG93IGdlbmVyYXRlZCBDU1NcIik7XG5cdH1cbn0pO1xuXG4kKFwiLm1jNHdwLWZvcm0tc2VsZWN0XCIpLmNoYW5nZSggZnVuY3Rpb24oKSB7XG5cdCQodGhpcykucGFyZW50cygnZm9ybScpLnN1Ym1pdCgpO1xufSk7XG5cbi8vIHNob3cgdGhpY2tib3ggd2hlbiBjbGlja2luZyBvbiBcInVwbG9hZC1pbWFnZVwiIGJ1dHRvbnNcbiQoXCIudXBsb2FkLWltYWdlXCIpLmNsaWNrKCBmdW5jdGlvbigpIHtcblx0JGltYWdlVXBsb2FkVGFyZ2V0ID0gJCh0aGlzKS5zaWJsaW5ncygnaW5wdXQnKTtcblx0dGJfc2hvdygnJywgJ21lZGlhLXVwbG9hZC5waHA/dHlwZT1pbWFnZSZUQl9pZnJhbWU9dHJ1ZScpO1xufSk7XG5cbi8vIGF0dGFjaCBoYW5kbGVyIHRvIFwic2VuZCB0byBlZGl0b3JcIiBidXR0b25cbndpbmRvdy5zZW5kX3RvX2VkaXRvciA9IGZ1bmN0aW9uKGh0bWwpe1xuXHRpZiggJGltYWdlVXBsb2FkVGFyZ2V0ICkge1xuXHRcdHZhciBpbWd1cmwgPSAkKCdpbWcnLGh0bWwpLmF0dHIoJ3NyYycpO1xuXHRcdCRpbWFnZVVwbG9hZFRhcmdldC52YWwoaW1ndXJsKTtcblx0XHR0Yl9yZW1vdmUoKTtcblx0fSBlbHNlIHtcblx0XHRvcmlnaW5hbF9zZW5kX3RvX2VkaXRvcihodG1sKTtcblx0fVxuXG5cdHByZXZpZXcuYXBwbHlTdHlsZXMoKTtcbn07Il19
