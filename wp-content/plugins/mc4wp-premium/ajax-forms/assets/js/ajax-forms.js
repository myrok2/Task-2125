(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// TODO: Allow choosing loading animation (animated button / opacity)

var forms = window.mc4wp.forms;
var busy = false;
var config = mc4wp_ajax_vars || {};
var loadingCharacter = config.loading_character || '\u00B7';
var console = window.console || { log: function(msg) {} };
var generalErrorMessage = '<div class="mc4wp-alert mc4wp-error"><p>'+ config.error_text + '</p></div>';

forms.on('submit', function( form, event ) {

	// does this form have AJAX enabled?
	// @todo move to data attribute?
	if( form.element.getAttribute('class').indexOf('mc4wp-ajax') < 0 ) {
		return;
	}

	event.returnValue = false;
	event.preventDefault();

	submit(form);
	return false;
});

function submit( form ) {

	var loader = new Loader(form.element);

	function start() {

		// Clear possible errors from previous submit
		form.setResponse('');
		loader.start();
		fire();
	}

	function fire() {
		// prepare request
		busy = true;
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			// are we done?
			if (this.readyState == 4) {
				clean();

				if (this.status >= 200 && this.status < 400) {
					// Request success! :-)
					try {
						var response = JSON.parse(this.responseText);
					} catch(error) {
						console.log( 'MailChimp for WordPress: failed to parse AJAX response.\n\nError: "' + error + '"' );

						// Not good..
						form.setResponse(generalErrorMessage);
						return;
					}

					process(response);
				} else {
					// Error :(
					console.log(this.responseText);
				}
			}
		};
		request.open('POST', config.ajax_url, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(form.getSerializedData());
		request = null;
	}

	function process( response ) {

		forms.trigger('submitted', [form]);

		if( response.error ) {
			form.setResponse(response.error.message);
			forms.trigger('error', [form, response.error.errors]);
		} else {
			var data  = form.getData();

			// Show response message
			form.setResponse(response.data.message);

			if( response.data.hide_fields ) {
				form.element.querySelector('.mc4wp-form-fields').style.display = 'none';
			}

			if( response.data.redirect_to ) {
				window.location.href = response.data.redirect_to;
			}

			// finally, reset form element
			form.element.reset();

			// trigger events
			forms.trigger('success', [form, data]);
			forms.trigger( response.data.event, [form, data ]);
		}
	}

	function clean() {
		loader.stop();
		busy = false;
	}

	// let's do this!
	if( ! busy ) {
		start();
	}
}

function Loader(formElement) {

	var button, originalButton, loadingInterval;

	function start() {
		button = formElement.querySelector('input[type="submit"]');
		if( button ) {

			originalButton = button.cloneNode(true);

			// loading text
			var loadingText = button.getAttribute('data-loading-text');
			if( loadingText ) {
				button.value = loadingText;
				return;
			}

			// Show AJAX loader
			var styles = window.getComputedStyle( button );
			button.style.width = styles.width;
			button.value = loadingCharacter;
			loadingInterval = window.setInterval( function() {

				// count chars, start over at 5
				// @todo start over once at 60% of button width
				if( button.value.length >= 5 ) {
					button.value = loadingCharacter;
					return;
				}

				button.value += ' ' + loadingCharacter;
			}, 500 );
		} else {
			formElement.style.opacity = '0.5';
		}
	}

	function stop() {
		if( button ) {
			button.style.width = originalButton.style.width;
			button.value = originalButton.value;
			window.clearInterval(loadingInterval);
		} else {
			formElement.style.opacity = '';
		}

	}

	return {
		start: start,
		stop: stop
	}
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhamF4LWZvcm1zL2Fzc2V0cy9icm93c2VyaWZ5L2FqYXgtZm9ybXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETzogQWxsb3cgY2hvb3NpbmcgbG9hZGluZyBhbmltYXRpb24gKGFuaW1hdGVkIGJ1dHRvbiAvIG9wYWNpdHkpXG5cbnZhciBmb3JtcyA9IHdpbmRvdy5tYzR3cC5mb3JtcztcbnZhciBidXN5ID0gZmFsc2U7XG52YXIgY29uZmlnID0gbWM0d3BfYWpheF92YXJzIHx8IHt9O1xudmFyIGxvYWRpbmdDaGFyYWN0ZXIgPSBjb25maWcubG9hZGluZ19jaGFyYWN0ZXIgfHwgJ1xcdTAwQjcnO1xudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZSB8fCB7IGxvZzogZnVuY3Rpb24obXNnKSB7fSB9O1xudmFyIGdlbmVyYWxFcnJvck1lc3NhZ2UgPSAnPGRpdiBjbGFzcz1cIm1jNHdwLWFsZXJ0IG1jNHdwLWVycm9yXCI+PHA+JysgY29uZmlnLmVycm9yX3RleHQgKyAnPC9wPjwvZGl2Pic7XG5cbmZvcm1zLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiggZm9ybSwgZXZlbnQgKSB7XG5cblx0Ly8gZG9lcyB0aGlzIGZvcm0gaGF2ZSBBSkFYIGVuYWJsZWQ/XG5cdC8vIEB0b2RvIG1vdmUgdG8gZGF0YSBhdHRyaWJ1dGU/XG5cdGlmKCBmb3JtLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpLmluZGV4T2YoJ21jNHdwLWFqYXgnKSA8IDAgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0ZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRzdWJtaXQoZm9ybSk7XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuXG5mdW5jdGlvbiBzdWJtaXQoIGZvcm0gKSB7XG5cblx0dmFyIGxvYWRlciA9IG5ldyBMb2FkZXIoZm9ybS5lbGVtZW50KTtcblxuXHRmdW5jdGlvbiBzdGFydCgpIHtcblxuXHRcdC8vIENsZWFyIHBvc3NpYmxlIGVycm9ycyBmcm9tIHByZXZpb3VzIHN1Ym1pdFxuXHRcdGZvcm0uc2V0UmVzcG9uc2UoJycpO1xuXHRcdGxvYWRlci5zdGFydCgpO1xuXHRcdGZpcmUoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGZpcmUoKSB7XG5cdFx0Ly8gcHJlcGFyZSByZXF1ZXN0XG5cdFx0YnVzeSA9IHRydWU7XG5cdFx0dmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gYXJlIHdlIGRvbmU/XG5cdFx0XHRpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcblx0XHRcdFx0Y2xlYW4oKTtcblxuXHRcdFx0XHRpZiAodGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgNDAwKSB7XG5cdFx0XHRcdFx0Ly8gUmVxdWVzdCBzdWNjZXNzISA6LSlcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlVGV4dCk7XG5cdFx0XHRcdFx0fSBjYXRjaChlcnJvcikge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coICdNYWlsQ2hpbXAgZm9yIFdvcmRQcmVzczogZmFpbGVkIHRvIHBhcnNlIEFKQVggcmVzcG9uc2UuXFxuXFxuRXJyb3I6IFwiJyArIGVycm9yICsgJ1wiJyApO1xuXG5cdFx0XHRcdFx0XHQvLyBOb3QgZ29vZC4uXG5cdFx0XHRcdFx0XHRmb3JtLnNldFJlc3BvbnNlKGdlbmVyYWxFcnJvck1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHByb2Nlc3MocmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEVycm9yIDooXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5yZXNwb25zZVRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRyZXF1ZXN0Lm9wZW4oJ1BPU1QnLCBjb25maWcuYWpheF91cmwsIHRydWUpO1xuXHRcdHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuXHRcdHJlcXVlc3Quc2VuZChmb3JtLmdldFNlcmlhbGl6ZWREYXRhKCkpO1xuXHRcdHJlcXVlc3QgPSBudWxsO1xuXHR9XG5cblx0ZnVuY3Rpb24gcHJvY2VzcyggcmVzcG9uc2UgKSB7XG5cblx0XHRmb3Jtcy50cmlnZ2VyKCdzdWJtaXR0ZWQnLCBbZm9ybV0pO1xuXG5cdFx0aWYoIHJlc3BvbnNlLmVycm9yICkge1xuXHRcdFx0Zm9ybS5zZXRSZXNwb25zZShyZXNwb25zZS5lcnJvci5tZXNzYWdlKTtcblx0XHRcdGZvcm1zLnRyaWdnZXIoJ2Vycm9yJywgW2Zvcm0sIHJlc3BvbnNlLmVycm9yLmVycm9yc10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZGF0YSAgPSBmb3JtLmdldERhdGEoKTtcblxuXHRcdFx0Ly8gU2hvdyByZXNwb25zZSBtZXNzYWdlXG5cdFx0XHRmb3JtLnNldFJlc3BvbnNlKHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cblx0XHRcdGlmKCByZXNwb25zZS5kYXRhLmhpZGVfZmllbGRzICkge1xuXHRcdFx0XHRmb3JtLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1jNHdwLWZvcm0tZmllbGRzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdFx0aWYoIHJlc3BvbnNlLmRhdGEucmVkaXJlY3RfdG8gKSB7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzcG9uc2UuZGF0YS5yZWRpcmVjdF90bztcblx0XHRcdH1cblxuXHRcdFx0Ly8gZmluYWxseSwgcmVzZXQgZm9ybSBlbGVtZW50XG5cdFx0XHRmb3JtLmVsZW1lbnQucmVzZXQoKTtcblxuXHRcdFx0Ly8gdHJpZ2dlciBldmVudHNcblx0XHRcdGZvcm1zLnRyaWdnZXIoJ3N1Y2Nlc3MnLCBbZm9ybSwgZGF0YV0pO1xuXHRcdFx0Zm9ybXMudHJpZ2dlciggcmVzcG9uc2UuZGF0YS5ldmVudCwgW2Zvcm0sIGRhdGEgXSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY2xlYW4oKSB7XG5cdFx0bG9hZGVyLnN0b3AoKTtcblx0XHRidXN5ID0gZmFsc2U7XG5cdH1cblxuXHQvLyBsZXQncyBkbyB0aGlzIVxuXHRpZiggISBidXN5ICkge1xuXHRcdHN0YXJ0KCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gTG9hZGVyKGZvcm1FbGVtZW50KSB7XG5cblx0dmFyIGJ1dHRvbiwgb3JpZ2luYWxCdXR0b24sIGxvYWRpbmdJbnRlcnZhbDtcblxuXHRmdW5jdGlvbiBzdGFydCgpIHtcblx0XHRidXR0b24gPSBmb3JtRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic3VibWl0XCJdJyk7XG5cdFx0aWYoIGJ1dHRvbiApIHtcblxuXHRcdFx0b3JpZ2luYWxCdXR0b24gPSBidXR0b24uY2xvbmVOb2RlKHRydWUpO1xuXG5cdFx0XHQvLyBsb2FkaW5nIHRleHRcblx0XHRcdHZhciBsb2FkaW5nVGV4dCA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGluZy10ZXh0Jyk7XG5cdFx0XHRpZiggbG9hZGluZ1RleHQgKSB7XG5cdFx0XHRcdGJ1dHRvbi52YWx1ZSA9IGxvYWRpbmdUZXh0O1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNob3cgQUpBWCBsb2FkZXJcblx0XHRcdHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSggYnV0dG9uICk7XG5cdFx0XHRidXR0b24uc3R5bGUud2lkdGggPSBzdHlsZXMud2lkdGg7XG5cdFx0XHRidXR0b24udmFsdWUgPSBsb2FkaW5nQ2hhcmFjdGVyO1xuXHRcdFx0bG9hZGluZ0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHQvLyBjb3VudCBjaGFycywgc3RhcnQgb3ZlciBhdCA1XG5cdFx0XHRcdC8vIEB0b2RvIHN0YXJ0IG92ZXIgb25jZSBhdCA2MCUgb2YgYnV0dG9uIHdpZHRoXG5cdFx0XHRcdGlmKCBidXR0b24udmFsdWUubGVuZ3RoID49IDUgKSB7XG5cdFx0XHRcdFx0YnV0dG9uLnZhbHVlID0gbG9hZGluZ0NoYXJhY3Rlcjtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRidXR0b24udmFsdWUgKz0gJyAnICsgbG9hZGluZ0NoYXJhY3Rlcjtcblx0XHRcdH0sIDUwMCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3JtRWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gc3RvcCgpIHtcblx0XHRpZiggYnV0dG9uICkge1xuXHRcdFx0YnV0dG9uLnN0eWxlLndpZHRoID0gb3JpZ2luYWxCdXR0b24uc3R5bGUud2lkdGg7XG5cdFx0XHRidXR0b24udmFsdWUgPSBvcmlnaW5hbEJ1dHRvbi52YWx1ZTtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKGxvYWRpbmdJbnRlcnZhbCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvcm1FbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcblx0XHR9XG5cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdHN0b3A6IHN0b3Bcblx0fVxufVxuIl19
