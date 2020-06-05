(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var mount = document.getElementById( 'email-message-template-tags' );
var tags = [];
var tagOpen = '[';
var tagClose = ']';

function updateAvailableEmailTags() {
	var fields = mc4wp.forms.editor.query('[name]');
	tags = [ '_ALL_' ];

	for( var i=0; i<fields.length; i++) {

		var tagName = fields[i].getAttribute('name').toUpperCase();

		// strip empty arrays []
		// add in semicolon for named array keys
		tagName = tagName
			.replace('[]','')
			.replace(/\[(\w+)\]/, ':$1');

		if( tags.indexOf( tagName ) < 0 ) {
			tags.push( tagName );
		}

	}

	mount.innerHTML = tags.map(function(tagName) {
		return '<input readonly style="background: transparent; border: 0;" onclick="this.select();" onfocus="this.select()" value="' + tagOpen + tagName + tagClose + '" />';
	}).join(' ');
}

window.addEventListener('load', function() {
	mc4wp.forms.editor.on('change', mc4wp.helpers.debounce(updateAvailableEmailTags, 1000 ) );
	updateAvailableEmailTags();
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbWFpbC1ub3RpZmljYXRpb25zL2Fzc2V0cy9icm93c2VyaWZ5L2FkbWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1vdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdlbWFpbC1tZXNzYWdlLXRlbXBsYXRlLXRhZ3MnICk7XG52YXIgdGFncyA9IFtdO1xudmFyIHRhZ09wZW4gPSAnWyc7XG52YXIgdGFnQ2xvc2UgPSAnXSc7XG5cbmZ1bmN0aW9uIHVwZGF0ZUF2YWlsYWJsZUVtYWlsVGFncygpIHtcblx0dmFyIGZpZWxkcyA9IG1jNHdwLmZvcm1zLmVkaXRvci5xdWVyeSgnW25hbWVdJyk7XG5cdHRhZ3MgPSBbICdfQUxMXycgXTtcblxuXHRmb3IoIHZhciBpPTA7IGk8ZmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHR2YXIgdGFnTmFtZSA9IGZpZWxkc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0Ly8gc3RyaXAgZW1wdHkgYXJyYXlzIFtdXG5cdFx0Ly8gYWRkIGluIHNlbWljb2xvbiBmb3IgbmFtZWQgYXJyYXkga2V5c1xuXHRcdHRhZ05hbWUgPSB0YWdOYW1lXG5cdFx0XHQucmVwbGFjZSgnW10nLCcnKVxuXHRcdFx0LnJlcGxhY2UoL1xcWyhcXHcrKVxcXS8sICc6JDEnKTtcblxuXHRcdGlmKCB0YWdzLmluZGV4T2YoIHRhZ05hbWUgKSA8IDAgKSB7XG5cdFx0XHR0YWdzLnB1c2goIHRhZ05hbWUgKTtcblx0XHR9XG5cblx0fVxuXG5cdG1vdW50LmlubmVySFRNTCA9IHRhZ3MubWFwKGZ1bmN0aW9uKHRhZ05hbWUpIHtcblx0XHRyZXR1cm4gJzxpbnB1dCByZWFkb25seSBzdHlsZT1cImJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IDA7XCIgb25jbGljaz1cInRoaXMuc2VsZWN0KCk7XCIgb25mb2N1cz1cInRoaXMuc2VsZWN0KClcIiB2YWx1ZT1cIicgKyB0YWdPcGVuICsgdGFnTmFtZSArIHRhZ0Nsb3NlICsgJ1wiIC8+Jztcblx0fSkuam9pbignICcpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuXHRtYzR3cC5mb3Jtcy5lZGl0b3Iub24oJ2NoYW5nZScsIG1jNHdwLmhlbHBlcnMuZGVib3VuY2UodXBkYXRlQXZhaWxhYmxlRW1haWxUYWdzLCAxMDAwICkgKTtcblx0dXBkYXRlQXZhaWxhYmxlRW1haWxUYWdzKCk7XG59KTsiXX0=
