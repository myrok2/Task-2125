( function( $ ) {
	'use strict';

	/**
	 * Defines the Hustle Object
	 *
	 * @type {{define, getModules, get, modules}}
	 */
	window.Hustle = ( function( $, doc, win ) {
		var _modules = {},
			_TemplateOptions = {
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
				escape: /\{\{([^\}]+?)\}\}(?!\})/g
			};

			let define = function( moduleName, module ) {
				var splits = moduleName.split( '.' );
				if ( splits.length ) { // if module_name has more than one object name, then add the module definition recursively
					let recursive = function( moduleName, modules ) {
						var arr = moduleName.split( '.' ),
							_moduleName = arr.splice( 0, 1 )[ 0 ],
							invoked;
						if ( ! _moduleName ) {
							return;
						}
						if ( ! arr.length ) {
							invoked = module.call( null, $, doc, win );
							modules[ _moduleName ] = _.isFunction( invoked ) ||
								'undefined' === typeof invoked ?
								invoked : _.extend( modules[ _moduleName ] || {}, invoked );
						} else {
							modules[ _moduleName ] = modules[ _moduleName ] || {};
						}
						if ( arr.length && _moduleName ) {
							recursive( arr.join( '.' ), modules[ _moduleName ]);
						}
					};
					recursive( moduleName, _modules );
				} else {
					let m = _modules[moduleName] || {};
					_modules[moduleName] = _.extend( m, module.call( null, $, doc, win ) );
				}
			},
			getModules = function() {
				return _modules;
			},
			get = function( moduleName ) {
				var module, recursive;
				if ( moduleName.split( '.' ).length ) { // recursively fetch the module
					module = false;
					recursive = function( moduleName, modules ) {
							var arr = moduleName.split( '.' ),
								_moduleName = arr.splice( 0, 1 )[ 0 ];
							module = modules[ _moduleName ];
							if ( arr.length ) {
								recursive( arr.join( '.' ), modules[ _moduleName ]);
							}
						};
					recursive( moduleName, _modules );
					return module;
				}
				return _modules[moduleName] || false;
			},
			Events = _.extend({}, Backbone.Events ),
			View = Backbone.View.extend({
				initialize: function() {
					if ( _.isFunction( this.initMix ) ) {
						this.initMix.apply( this, arguments );
					}
					if ( this.render ) {
						this.render = _.wrap( this.render, function( render ) {
							this.trigger( 'before_render' );
							render.call( this );
							Events.trigger( 'view.rendered', this );
							this.trigger( 'rendered' );
						});
					}
					if ( _.isFunction( this.init ) ) {
						this.init.apply( this, arguments );
					}
				}
			}),
			template = _.memoize( function( id ) {
				var compiled;
				return function( data ) {
					compiled = compiled || _.template( document.getElementById( id ).innerHTML, null, _TemplateOptions );
					return compiled( data ).replace( '/*<![CDATA[*/', '' ).replace( '/*]]>*/', '' );
				};
			}),
			createTemplate = _.memoize( function( str ) {
				var cache;
				return function( data ) {
					cache = cache || _.template( str, null, _TemplateOptions );
					return cache( data );
				};
			}),
			getTemplateOptions = function() {
				return $.extend(  true, {}, _TemplateOptions );
			},
			cookie = ( function() {

				// Get a cookie value.
				var get = function( name ) {
					var i, c, cookieName, value,
						ca = document.cookie.split( ';' ),
						caLength = ca.length;
					cookieName = name + '=';
					for ( i = 0; i < caLength; i += 1 ) {
						c = ca[i];
						while ( ' ' === c.charAt( 0 ) ) {
							c = c.substring( 1, c.length );
						}
						if ( 0 === c.indexOf( cookieName ) ) {
							let _val = c.substring( cookieName.length, c.length );
							return _val ? JSON.parse( _val ) : _val;
						}
					}
					return null;
				};

				// Saves the value into a cookie.
				var set = function( name, value, days ) {
					var date, expires;

					value = $.isArray( value ) || $.isPlainObject( value ) ? JSON.stringify( value ) : value;
					if ( ! isNaN( days ) ) {
						date = new Date();
						date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
						expires = '; expires=' + date.toGMTString();
					} else {
						expires = '';
					}
					document.cookie = name + '=' + value + expires + '; path=/';
				};
				return {
					set: set,
					get: get
				};
			}() ),
			consts = ( function() {
				return {
					ModuleShowCount: 'hustle_module_show_count-'
				};
			}() );

		return {
			define,
			getModules,
			get,
			Events,
			View,
			template,
			createTemplate,
			getTemplateOptions,
			cookie,
			consts
		};
	}( jQuery, document, window ) );

}( jQuery ) );

var  Optin = Optin || {};

Optin.View = {};
Optin.Models = {};
Optin.Events = {};

if ( 'undefined' !== typeof Backbone ) {
	_.extend( Optin.Events, Backbone.Events );
}

( function( $ ) {
	'use strict';
	Optin.NEVER_SEE_PREFIX = 'inc_optin_never_see_again-',
	Optin.COOKIE_PREFIX = 'inc_optin_long_hidden-';
	Optin.POPUP_COOKIE_PREFIX = 'inc_optin_popup_long_hidden-';
	Optin.SLIDE_IN_COOKIE_PREFIX = 'inc_optin_slide_in_long_hidden-';
	Optin.EMBEDDED_COOKIE_PREFIX = 'inc_optin_embedded_long_hidden-';

	Optin.globalMixin = function() {
		_.mixin({

			/**
			 * Logs to console
			 */
			//log: function() {
			//	console.log( arguments );
			//},

			/**
			 * Converts val to boolian
			 *
			 * @param val
			 * @returns {*}
			 */
			toBool: function( val ) {
				if ( _.isBoolean( val ) ) {
					return val;
				}
				if ( _.isString( val ) && -1 !== [ 'true', 'false', '1' ].indexOf( val.toLowerCase() ) ) {
					return 'true' === val.toLowerCase() || '1' === val.toLowerCase() ? true : false;
				}
				if ( _.isNumber( val ) ) {
					return ! ! val;
				}
				if ( _.isUndefined( val ) || _.isNull( val ) || _.isNaN( val ) ) {
					return false;
				}
				return val;
			},

			/**
			 * Checks if val is truthy
			 *
			 * @param val
			 * @returns {boolean}
			 */
			isTrue: function( val ) {
				if ( _.isUndefined( val ) || _.isNull( val ) || _.isNaN( val ) ) {
					return false;
				}
				if ( _.isNumber( val ) ) {
					return 0 !== val;
				}
				val = val.toString().toLowerCase();
				return -1 !== [ '1', 'true', 'on' ].indexOf( val );
			},
			isFalse: function( val ) {
				return ! _.isTrue( val );
			},
			controlBase: function( checked, current, attribute ) {
				attribute = _.isUndefined( attribute ) ? 'checked' : attribute;
				checked  = _.toBool( checked );
				current = _.isBoolean( checked ) ? _.isTrue( current ) : current;
				if ( _.isEqual( checked, current ) ) {
					return  attribute + '=' + attribute;
				}
				return '';
			},

			/**
			 * Returns checked=check if checked variable is equal to current state
			 *
			 *
			 * @param checked checked state
			 * @param current current state
			 * @returns {*}
			 */
			checked: function( checked, current ) {
				return _.controlBase( checked, current, 'checked' );
			},

			/**
			 * Adds selected attribute
			 *
			 * @param selected
			 * @param current
			 * @returns {*}
			 */
			selected: function( selected, current ) {
				return _.controlBase( selected, current, 'selected' );
			},

			/**
			 * Adds disabled attribute
			 *
			 * @param disabled
			 * @param current
			 * @returns {*}
			 */
			disabled: function( disabled, current ) {
				return _.controlBase( disabled, current, 'disabled' );
			},

			/**
			 * Returns css class based on the passed in condition
			 *
			 * @param conditon
			 * @param cls
			 * @param negating_cls
			 * @returns {*}
			 */
			class: function( conditon, cls, negatingCls ) {
				if ( _.isTrue( conditon ) ) {
					return cls;
				}
				return 'undefined' !== typeof negatingCls ? negatingCls : '';
			}

			/**
			 * Returns class attribute with relevant class name
			 *
			 * @param conditon
			 * @param cls
			 * @param negating_cls
			 * @returns {string}
			 */
			//add_class: function( conditon, cls, negatingCls ) { // eslint-disable-line camelcase
			//	return 'class={class}'.replace( '{class}',  _.class( conditon, cls, negatingCls ) );
			//},

			//toUpperCase: function( str ) {
			//	return  _.isString( str ) ? str.toUpperCase() : '';
			//}
		});

		//if ( ! _.findKey ) {
		//	_.mixin({
		//		findKey: function( obj, predicate, context ) {
		//			predicate = cb( predicate, context );
		//			let keys = _.keys( obj ),
        //                key;
		//			for ( let i = 0, length = keys.length; i < length; i++ ) {
		//				key = keys[i];
		//				if ( predicate( obj[ key ], key, obj ) ) {
		//					return key;
		//				}
		//			}
		//		}
		//	});
		//}
	};

	Optin.globalMixin();

	/**
	 * Recursive toJSON
	 *
	 * @returns {*}
	 */
	Backbone.Model.prototype.toJSON = function() {
		var json = _.clone( this.attributes );
		var attr;
		for ( attr in json ) {
			if (
				( json[ attr ] instanceof Backbone.Model ) ||
				( Backbone.Collection && json[attr] instanceof Backbone.Collection )
			) {
				json[ attr ] = json[ attr ].toJSON();
			}
		}
		return json;
	};

	Optin.template = _.memoize( function( id ) {
		var compiled,

			options = {
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
				escape: /\{\{([^\}]+?)\}\}(?!\})/g
			};

		return function( data ) {
			compiled = compiled || _.template( $( '#' + id ).html(), null, options );
			return compiled( data ).replace( '/*<![CDATA[*/', '' ).replace( '/*]]>*/', '' );
		};
	});

	/**
	 * Compatibility with other plugin/theme e.g. upfront
	 *
	 */
	Optin.templateCompat = _.memoize( function( id ) {
		var compiled;

		return function( data ) {
			compiled = compiled || _.template( $( '#' + id ).html() );
			return compiled( data ).replace( '/*<![CDATA[*/', '' ).replace( '/*]]>*/', '' );
		};
	});

	Optin.cookie = Hustle.cookie;

	Optin.Mixins = {
		_mixins: {},
		_servicesMixins: {},
		_desingMixins: {},
		_displayMixins: {},
		add: function( id, obj ) {
			this._mixins[id] = obj;
		},
		getMixins: function() {
			return this._mixins;
		},
		addServicesMixin: function( id, obj ) {
			this._servicesMixins[id] = obj;
		},
		getServicesMixins: function() {
			return this._servicesMixins;
		}
	};


}( jQuery ) );

( function( $ ) {
	'use strict';

	Hustle.Events.on( 'view.rendered', function( view ) {

		if ( view instanceof Backbone.View ) {

			const accessibleHide = ( $elements ) => {
					$elements.hide();
					$elements.prop( 'tabindex', '-1' );
					$elements.prop( 'hidden', true );
				},
				accessibleShow = ( $elements ) => {
					$elements.show();
					$elements.prop( 'tabindex', '0' );
					$elements.removeProp( 'hidden' );
				};

			// Init select
			view.$( 'select:not([multiple])' ).each( function() {
				SUI.suiSelect( this );
			});

			// Init select2
			view.$( '.sui-select:not(.hustle-select-ajax)' ).SUIselect2({
				dropdownCssClass: 'sui-select-dropdown'
			});

			// Init accordion
			view.$( '.sui-accordion' ).each( function() {
				SUI.suiAccordion( this );
			});

			// Init tabs
			SUI.suiTabs();
			SUI.tabs({
				callback: function( tab, panel ) {

					let wrapper          = tab.closest( '.sui-tabs' ),
						scheduleEveryday = 'schedule-everyday',
						scheduleSomedays = 'schedule-somedays',
						scheduleServer   = 'timezone-server',
						scheduleCustom   = 'timezone-custom'
						;

					if ( 'tab-' + scheduleEveryday === tab.attr( 'id' ) ) {
						wrapper.find( '#input-' + scheduleEveryday ).click();
					}

					if ( 'tab-' + scheduleSomedays === tab.attr( 'id' ) ) {
						wrapper.find( '#input-' + scheduleSomedays ).click();
					}

					if ( 'tab-' + scheduleServer === tab.attr( 'id' ) ) {
						wrapper.find( '#input-' + scheduleServer ).click();
					}

					if ( 'tab-' + scheduleCustom === tab.attr( 'id' ) ) {
						wrapper.find( '#input-' + scheduleCustom ).click();
					}
				}
			});

			// Init float input
			SUI.floatInput();

			/**
			 * Hides and shows the content of the settings using sui-side-tabs.
			 * For us, non-designers: sui-side-tabs are the "buttons" that work as labels for radio inputs.
			 * They may have related content that should be shown or hidden depending on the selected option.
			 * @since 4.0
			 */
			view.$( '.sui-side-tabs' ).each( function() {

				const $inputs = $( this ).find( '.sui-tabs-menu .sui-tab-item input' ),

					handleTabs = () => {

						// This holds the dependency name of the selected input.
						// It's used to avoid hiding a container that should be shown
						// when two or more tabs share the same container.
						let shownDep = '';

						$.each( $inputs, function() {
							const $input = $( this ),
								$label = $input.parent( 'label' ),
								dependencyName = $input.data( 'tab-menu' ),
								$tabContent =  $( `.sui-tabs-content [data-tab-content="${ dependencyName }"]` ),
								$tabDependent =  $( `[data-tab-dependent="${ dependencyName }"]` );

							if ( $input[0].checked ) {
								$label.addClass( 'active' );
								if ( dependencyName ) {
									shownDep = dependencyName;

									$tabContent.addClass( 'active' );
									accessibleShow( $tabDependent );
								}

							} else {
								$label.removeClass( 'active' );
								if ( dependencyName !== shownDep ) {
									$tabContent.removeClass( 'active' );
									accessibleHide( $tabDependent );
								}
							}

						});
					};

				// Do it on load.
				handleTabs();

				// And do it on change.
				$inputs.on( 'change', () => handleTabs() );
			});

			/**
			 * Hides and shows the container dependent on toggles
			 * on view load and on change.
			 * Used in wizards and global settings page.
			 * @since 4.0.3
			 */
			view.$( '.sui-toggle.hustle-toggle-with-container' ).each( function() {
				const $this = $( this ),
					$checkbox = $this.find( 'input[type=checkbox]' ),
					$containersOn = $( `[data-toggle-content="${ $this.data( 'toggle-on' ) }"]` ),
					$containersOff = $( `[data-toggle-content="${ $this.data( 'toggle-off' ) }"]` ),
					doToggle = () => {
						if ( $checkbox[0].checked ) {
							Module.Utils.accessibleShow( $containersOn );
							Module.Utils.accessibleHide( $containersOff );
						} else {
							Module.Utils.accessibleShow( $containersOff );
							Module.Utils.accessibleHide( $containersOn );
						}
					};

				// Do it on load.
				doToggle();

				// And do it on change.
				$checkbox.on( 'change', () => doToggle() );
			});

			view.$( 'select.hustle-select-with-container' ).each( function() {

				const $this = $( this ),
					$depContainer = $( `[data-field-content="${ this.name }"]` ),
					valuesOn = $this.data( 'content-on' ).split( ',' ),
					doToggle = () => {
						if ( valuesOn.includes( $this.val() ) ) {
							Module.Utils.accessibleShow( $depContainer );
						} else {
							Module.Utils.accessibleHide( $depContainer );
						}
					};

				// Do it on load.
				doToggle();

				// And do it on change.
				$this.on( 'change', () => doToggle() );
			});
		}
	});

	$( document ).ready( function() {
		if ( $( '#hustle-email-day' ).length ) {
			$( '#hustle-email-day' ).datepicker({
				beforeShow: function( input, inst ) {
					$( '#ui-datepicker-div' ).addClass( 'sui-calendar' );
				},
				'dateFormat': 'MM dd, yy'
			});
		}

		if ( $( '#hustle-email-time' ).length ) {

			$( '#hustle-email-time' ).timepicker({
				timeFormat: 'h:mm p',
				interval: '1',
				minTime: '0',
				maxTime: '11:59pm',
				defaultTime: null,
				startTime: '00:00',
				dynamic: false,
				dropdown: true,
				scrollbar: true,
				change: function() {
					$( '#hustle-email-time' ).trigger( 'change' );
				}
			});
		}

		// Dismisses the notice that shows up when the user is a member but doesn't have Hustle Pro installed
		$( '#hustle-notice-pro-is-available .notice-dismiss' ).on( 'click', function( e ) {

			var data = {
				action: 'hustle_dismiss_admin_notice',
				dismissedNotice: 'hustle_pro_is_available'
			};

			$.post( ajaxurl, data, function( response ) {

				});
			});

		// Makes the 'copy' button work.
		$( '.hustle-copy-shortcode-button' ).on( 'click', function( e ) {
			e.preventDefault();

			let $button = $( e.target ),
				shortcode = $button.data( 'shortcode' ),
				$inputWrapper = $button.closest( '.sui-with-button-inside' );

				if ( 'undefined' !== typeof shortcode ) {

					// Actions in listing pages.
					let $temp = $( '<input />' );
					$( 'body' ).append( $temp );
					$temp.val( shortcode ).select();
					document.execCommand( 'copy' );
					$temp.remove();
					Module.Notification.open( 'success', optinVars.messages.commons.shortcode_copied );

				} else if ( $inputWrapper.length ) {

					// Copy shortcode in wizard pages.
					let $inputWithCopy = $inputWrapper.find( 'input[type="text"]' );
					$inputWithCopy.select();
					document.execCommand( 'copy' );
				}
		});

		$( '#hustle-tracking-migration-notice .hustle-notice-dismiss' ).on( 'click', function( e ) {
			e.preventDefault();

			$( '#hustle-dismiss-modal-button' ).on( 'click', function( e ) {
				e.preventDefault();

				$.post(
					ajaxurl,
					{
						action: 'hustle_dismiss_notification',
						name: $( e.currentTarget ).data( 'name' ),
						'_ajax_nonce': $( e.currentTarget ).data( 'nonce' )
					}
				)
				.always( () => location.reload() );
			});

			SUI.dialogs['hustle-dialog--migrate-dismiss-confirmation'].show();
		});

		$( '#hustle-sendgrid-update-notice .notice-dismiss' ).on( 'click', function( e ) {
			e.preventDefault();

			const $container = $( e.currentTarget ).closest( '#hustle-sendgrid-update-notice' );

			$.post(
				ajaxurl,
				{
					action: 'hustle_dismiss_notification',
					name: $container.data( 'name' ),
					'_ajax_nonce': $container.data( 'nonce' )
				}
			);

		});

		$( '.hustle-notice .notice-dismiss, .hustle-notice .dismiss-notice' ).on( 'click', function( e ) {
			e.preventDefault();

			const $container = $( e.currentTarget ).closest( '.hustle-notice' );

			$.post(
				ajaxurl,
				{
					action: 'hustle_dismiss_notification',
					name: $container.data( 'name' ),
					_ajax_nonce: $container.data( 'nonce' ) // eslint-disable-line camelcase
				}
			)
			.always( () => location.reload() );
		});

		if ( $( '.sui-form-field input[type=number]' ).length ) {
			$( '.sui-form-field input[type=number]' ).on( 'keydown', function( e ) {
				if ( $( this )[0].hasAttribute( 'min' ) && 0 <= $( this ).attr( 'min' ) ) {
					let char = e.originalEvent.key.replace( /[^0-9^.^,]/, '' );
					if ( 0 === char.length && ! ( e.originalEvent.ctrlKey || e.originalEvent.metaKey ) ) {
						e.preventDefault();
					}
				}
			});
		}

		setTimeout( function() {
			if ( $( '.hustle-scroll-to' ).length ) {
				$( 'html, body' ).animate({
					scrollTop: $( '.hustle-scroll-to' ).offset().top
				}, 'slow' );
			}
		}, 100 );

		//table checkboxes
		$( '.hustle-check-all' ).on( 'click', function( e ) {
			let $this = $( e.target ),
				$list = $this.parents( '.sui-wrap' ).find( '.hustle-list' ),
				allChecked = $this.is( ':checked' );

			$list.find( '.hustle-listing-checkbox' ).prop( 'checked', allChecked );
			$( '.hustle-bulk-apply-button' ).prop( 'disabled', ! allChecked );
		});

		$( '.hustle-list .hustle-listing-checkbox' ).on( 'click', function( e ) {
			let $this = $( e.target ),
				$list = $this.parents( '.sui-wrap' ).find( '.hustle-list' ),
				allChecked = $this.is( ':checked' ) && ! $list.find( '.hustle-listing-checkbox:not(:checked)' ).length,
				count = $list.find( '.hustle-listing-checkbox:checked' ).length,
				disabled = 0 === count;

			$( '#hustle-check-all' ).prop( 'checked', allChecked );
			$( '.hustle-bulk-apply-button' ).prop( 'disabled', disabled );

			return;
		});

		$( '.hustle-bulk-apply-button' ).on( 'click', function( e ) {
			let $this = $( e.target ),
				value = $( 'select option:selected', $this.closest( '.hui-bulk-actions' ) ).val(),
				elements = $( '.hustle-list .hustle-listing-checkbox:checked' );

			if ( 0 === elements.length || 'undefined' === value ) {
				return false;
			}
			let ids = [];
			$.each( elements, function() {
				ids.push( $( this ).val() );
			});

			if ( 'delete-all' === value ) {
				let data = {
					ids: ids.join( ',' ),
					nonce: $this.siblings( '#hustle_nonce' ).val(),
					title: $this.data( 'title' ),
					description: $this.data( 'description' ),
					action: value
				};

				Module.deleteModal.open( data );
				return false;
			}
		});

	});

} ( jQuery ) );

Hustle.define( 'Modals.Migration', function( $ ) {

	'use strict';

	const migrationModalView = Backbone.View.extend({

		el: '#hustle-dialog--migrate',

		data: {},

		events: {
			'click #hustle-migrate-start': 'migrateStart',
			'click #hustle-create-new-module': 'createModule',
			'click .sui-box-selector': 'enableContinue',
			'click .hustle-dialog-migrate-skip': 'dismissModal',
			'click .sui-dialog-overlay': 'dismissModal'
		},

		initialize() {
			if ( ! this.$el.length ) {
				return;
			}

			let currentSlide = '',
				focusOnOpen = '';

			if ( 0 === this.$el.data( 'isFirst' ) ) {
				currentSlide = '#hustle-dialog--migrate-slide-2';
				focusOnOpen = 'hustle-migrate-start';

			} else {
				currentSlide = '#hustle-dialog--migrate-slide-1';
				focusOnOpen = 'hustle-migrate-get-started';

			}

			this.$( currentSlide ).addClass( 'sui-active sui-loaded' );

			setTimeout( () => SUI.openModal( 'hustle-dialog--migrate', focusOnOpen, $( '.sui-wrap' )[0], false ), 100 );

			this.$progressBar = this.$el.find( '.sui-progress .sui-progress-bar span' );
			this.$progressText = this.$el.find( '.sui-progress .sui-progress-text span' );
			this.$partialRows = this.$el.find( '#hustle-partial-rows' );
		},

		migrateStart( e ) {

			const me = this;

			const button      = $( e.target );
			const $container = this.$el,
				$dialog      = $container.find( '#hustle-dialog--migrate-slide-2' ),
				description  = $dialog.find( '#migrateDialog2Description' );

			// On load button
			button.addClass( 'sui-button-onload' );

			// Remove skip migration link
			$dialog.find( '.hustle-dialog-migrate-skip' ).remove();

			description.text( description.data( 'migrate-text' ) );

			Module.Utils.accessibleHide( $dialog.find( 'div[data-migrate-start]' ) );
			Module.Utils.accessibleHide( $dialog.find( 'div[data-migrate-failed]' ) );
			Module.Utils.accessibleShow( $dialog.find( 'div[data-migrate-progress]' ) );

			me.migrateTracking( e );

			button.removeClass( 'sui-button-onload' );

			e.preventDefault();

		},

		migrateComplete() {

			const slide       = this.$( '#hustle-dialog--migrate-slide-2' ),
				self = this;
			const title       = slide.find( '#migrateDialog2Title' );
			const description = slide.find( '#migrateDialog2Description' );

			this.$el.find( 'sui-button-onload' ).removeClass( 'sui-button-onload' );

			title.text( title.data( 'done-text' ) );
			description.text( description.data( 'done-text' ) );

			Module.Utils.accessibleHide( slide.find( 'div[data-migrate-progress]' ) );
			Module.Utils.accessibleShow( slide.find( 'div[data-migrate-done]' ) );

			this.$el.closest( '.sui-modal' ).on( 'click', ( e ) => self.closeDialog( e ) );

		},

		migrateFailed() {

			const slide = this.$el.find( '#hustle-dialog--migrate-slide-2' ),
				description = slide.find( '#dialogDescription' );

			description.text( '' );

			Module.Utils.accessibleHide( slide.find( 'div[data-migrate-start]' ) );
			Module.Utils.accessibleShow( slide.find( 'div[data-migrate-failed]' ) );
			Module.Utils.accessibleHide( slide.find( 'div[data-migrate-progress]' ) );
		},

		updateProgress( migratedRows, rowsPercentage, totalRows ) {

			if ( 'undefined' === typeof this.totalRows ) {
				this.totalRows = totalRows;
				this.$el.find( '#hustle-total-rows' ).text( totalRows );
			}

			this.$partialRows.text( migratedRows );

			const width = rowsPercentage + '%';
			this.$progressBar.css( 'width', width );

			if ( 100 >= rowsPercentage ) {
				this.$progressText.text( rowsPercentage + '%' );
			}
		},

		migrateTracking( e ) {
			e.preventDefault();

			let self = this,
				$button = $( e.currentTarget ),
				nonce = $button.data( 'nonce' ),
				data = {
					action: 'hustle_migrate_tracking',
					'_ajax_nonce': nonce
				};

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				dataType: 'json',
				data,
				success: function( res ) {
					if ( res.success ) {

						const migratedRows = res.data.migrated_rows,
							migratedPercentage = res.data.migrated_percentage,
							totalRows = res.data.total_entries || '0';

						if ( 'done' !== res.data.current_meta ) {

							self.updateProgress( migratedRows, migratedPercentage, totalRows );
							self.migrateTracking( e );

						} else {
							self.updateProgress( migratedRows, migratedPercentage, totalRows );

							// Set a small delay so the users can see the progress update in front before moving
							// forward and they don't think some rows were not migrated.
							setTimeout( () => self.migrateComplete(), 500 );
						}


					} else {
						self.migrateFailed();
					}
				},
				error: function( res ) {
					self.migrateFailed();
				}
			});
			return false;
		},

		createModule( e ) {

			const button = $( e.target ),
				$selection = this.$el.find( '.sui-box-selector input:checked' );


			if ( $selection.length ) {

				this.dismissModal();

				button.addClass( 'sui-button-onload' );

				const moduleType = $selection.val(),
					page = 'undefined' !== typeof optinVars.module_page[ moduleType ] ? optinVars.module_page[ moduleType ] : optinVars.module_page.popup;

				window.location = `?page=${page}&create-module=true`;

			} else {

				// Show an error message or something?
			}

			e.preventDefault();
		},

		closeDialog( e ) {

			SUI.closeModal();

			e.preventDefault();
			e.stopPropagation();

		},

		enableContinue() {
			this.$el.find( '#hustle-create-new-module' ).prop( 'disabled', false );
		},

		dismissModal( e ) {

			if ( e ) {
				e.preventDefault();
			}

			$.post(
				ajaxurl,
				{
					action: 'hustle_dismiss_notification',
					name: 'migrate_modal',
					'_ajax_nonce': this.$el.data( 'nonce' )
				}
			);
		}

	});

	new migrationModalView();
});

Hustle.define( 'Modals.ReviewConditions', function( $ ) {

	'use strict';

	const ReviewConditionsModalView = Backbone.View.extend({

		el: '#hustle-dialog--review_conditions',

		initialize() {
			if ( ! this.$el.length ) {
				return;
			}
			setTimeout( this.show, 100, this );
		},

		show( reviewConditions ) {
			if ( 'undefined' === typeof SUI || 'undefined' === typeof SUI.dialogs ) {
				setTimeout( reviewConditions.show, 100, reviewConditions );
				return;
			}
			if ( 'undefined' !== typeof SUI.dialogs[ reviewConditions.$el.prop( 'id' ) ]) {
				SUI.dialogs[ reviewConditions.$el.prop( 'id' ) ].show();
			}
		}

	});

	new ReviewConditionsModalView();

});

Hustle.define( 'Upgrade_Modal', function( $ ) {
	'use strict';
	return Backbone.View.extend({
		el: '#wph-upgrade-modal',
		opts: {},
		events: {
			'click .wpmudev-i_close': 'close'
		},
		initialize: function( options ) {
			this.opts = _.extend({}, this.opts, options );
		},
		close: function( e ) {
			e.preventDefault();
			e.stopPropagation();
			this.$el.removeClass( 'wpmudev-modal-active' );
		}
	});
});

Hustle.define( 'Modals.Welcome', function( $ ) {

	'use strict';

	const welcomeModalView = Backbone.View.extend({

		el: '#hustle-dialog--welcome',

		events: {
			'click #hustle-new-create-module': 'createModule',
			'click .sui-box-selector': 'enableContinue',
			'click #getStarted': 'dismissModal',
			'click .sui-onboard-skip': 'dismissModal',
			'click .sui-dialog-close': 'dismissModal'
		},

		initialize() {
			if ( ! this.$el.length ) {
				return;
			}
			setTimeout( this.show, 100, this );
		},

		show( welcome ) {
			if ( 'undefined' === typeof SUI ) {
				setTimeout( welcome.show, 100, welcome );
				return;
			}
			if ( 'undefined' === typeof SUI.dialogs ) {
				setTimeout( welcome.show, 100, welcome );
				return;
			}
			if ( 'undefined' !== typeof SUI.dialogs[ welcome.$el.prop( 'id' ) ]) {
				SUI.dialogs[ welcome.$el.prop( 'id' ) ].show();
			}
		},

		createModule( e ) {

			const button = $( e.target ),
				$selection = this.$el.find( '.sui-box-selector input:checked' );


			if ( $selection.length ) {

				button.addClass( 'sui-button-onload' );

				const moduleType = $selection.val(),
					page = 'undefined' !== typeof optinVars.module_page[ moduleType ] ? optinVars.module_page[ moduleType ] : optinVars.module_page.popup;

				window.location = `?page=${page}&create-module=true`;

			}

			e.preventDefault();

		},

		enableContinue() {
			this.$el.find( '#hustle-new-create-module' ).prop( 'disabled', false );
		},

		dismissModal( e ) {

			if ( e ) {
				e.preventDefault();
			}

			$.post(
				ajaxurl,
				{
					action: 'hustle_dismiss_notification',
					name: 'welcome_modal',
					'_ajax_nonce': this.$el.data( 'nonce' )
				}
			);
		}

	});

	new welcomeModalView();

});

Hustle.define( 'Featured_Image_Holder', function( $ ) {
	'use strict';

	return Backbone.View.extend({

		mediaFrame: false,
		el: '#wph-wizard-choose_image',
		options: {
			attribute: 'feature_image',
			multiple: false
		},

		initialize: function( options ) {

			this.options.title = optinVars.messages.media_uploader.select_or_upload;
			this.options.button_text = optinVars.messages.media_uploader.use_this_image; // eslint-disable-line camelcase

			this.options = _.extend({}, this.options, options );

			if ( ! this.model || ! this.options.attribute ) {
				throw new Error( 'Undefined model or attribute' );
			}
			this.targetDiv = options.targetDiv;
			$( document ).on( 'click', '.wpmudev-feature-image-browse', $.proxy( this.open, this ) );
			$( document ).on( 'click', '#wpmudev-feature-image-clear', $.proxy( this.clear, this ) );
			this.render();
		},

		render: function() {
			this.defineMediaFrame();
			return this;
		},

		// If no featured image is set, show the upload button. Display the selected image otherwise.
		showImagePreviewOrButton: function() {
			var featureImage = this.model.get( 'feature_image' );
			if ( '' === featureImage || 'undefined' === typeof featureImage ) {
				this.$el.removeClass( 'sui-has_file' );
			} else {
				this.$el.addClass( 'sui-has_file' );
			}
		},

		defineMediaFrame: function() {
			var self = this;
			this.mediaFrame = wp.media({
				title: self.options.title,
				button: {
					text: self.options.button_text
				},
				multiple: self.options.multiple
			}).on( 'select', function() {
				var media = self.mediaFrame.state().get( 'selection' ).first().toJSON();
                var featureImageSrc, featureImageThumbnail;
				if ( media && media.url ) {
					featureImageSrc = media.url;
					featureImageThumbnail = '';
					self.model.set( 'feature_image', featureImageSrc );
					if ( media.sizes && media.sizes.thumbnail && media.sizes.thumbnail.url ) {
						featureImageThumbnail = media.sizes.thumbnail.url;
					}
					self.$el.find( '.sui-upload-file span' ).text( featureImageSrc ).change();
					self.$el.find( '.sui-image-preview' ).css( 'background-image', 'url( ' + featureImageThumbnail + ' )' );

					self.showImagePreviewOrButton();
				}
			});
		},

		open: function( e ) {
			e.preventDefault();
			this.mediaFrame.open();
		},

		clear: function( e ) {
			e.preventDefault();
			this.model.set( 'feature_image', '' );
			this.$el.find( '.sui-upload-file span' ).text( '' ).change();
			this.$el.find( '.sui-image-preview' ).css( 'background-image', 'url()' );

			//this.model.set( 'feature_image', '', {silent: true} );
			this.showImagePreviewOrButton();
		}
	});

});

Hustle.define( 'Modals.Edit_Field', function( $ ) {

	'use strict';

	return Backbone.View.extend({

		el: '#hustle-dialog--edit-field',

		events: {
			'click .sui-dialog-overlay': 'closeModal',
			'click .hustle-discard-changes': 'closeModal',
			'change input[name="time_format"]': 'changeTimeFormat',
			'click #hustle-apply-changes': 'applyChanges',
			'blur input[name="name"]': 'trimName',
			'change input': 'fieldUpdated',
			'click input[type="radio"]': 'fieldUpdated',
			'change select': 'fieldUpdated',
			'change input[name="version"]': 'handleCaptchaSave'
		},

		initialize( options ) {
			this.field = options.field;
			this.changed = {};

			// Same as this.field, but with the values for the field's view. Won't be stored.
			this.fieldData = options.fieldData;
			this.model = options.model;
			this.render();
		},

		render() {
			this.renderHeader();
			this.renderLabels();
			this.renderSettings();
			this.renderStyling();
			this.handleCaptchaSave();

			//select the first tab
			this.$( '.hustle-data-pane' ).first().trigger( 'click' );
		},

		renderHeader() {
			this.$( '.sui-box-header .sui-tag' ).text( this.field.type );
		},

		renderLabels() {
			if ( -1 !== $.inArray( this.field.type, [ 'recaptcha', 'gdpr', 'submit' ]) ) {
				this.$( '#hustle-data-tab--labels' ).removeClass( 'hustle-data-pane' ).addClass( 'sui-hidden' );
				this.$( '#hustle-data-pane--labels' ).addClass( 'sui-hidden' );
				return;
			} else {
				this.$( '#hustle-data-tab--labels' ).removeClass( 'sui-hidden' ).addClass( 'hustle-data-pane' );

				this.$( '#hustle-data-pane--labels' ).removeClass( 'sui-hidden' );
			}

			// Check if a specific template for this field exists.
			let templateId = 'hustle-' + this.field.type + '-field-labels-tpl';

			// If a specific template doesn't exist, use the common template.
			if ( ! $( '#' + templateId ).length ) {
				templateId = 'hustle-common-field-labels-tpl';
			}

			const template = Optin.template( templateId );
			this.$( '#hustle-data-pane--labels' ).html( template( this.fieldData ) );
			Hustle.Events.trigger( 'view.rendered', this );

		},

		renderSettings() {

			if ( 'hidden' === this.field.type ) {
				this.$( '#hustle-data-tab--settings' ).removeClass( 'hustle-data-pane' ).addClass( 'sui-hidden' );
				this.$( '#hustle-data-pane--settings' ).addClass( 'sui-hidden' );

				Module.Utils.accessibleHide( this.$( '[data-tabs]' ) );
				return;
			} else {
				Module.Utils.accessibleShow( this.$( '[data-tabs]' ) );
			}

			this.$( '#hustle-data-tab--settings' ).removeClass( 'sui-hidden' ).addClass( 'hustle-data-pane' );
			this.$( '#hustle-data-pane--settings' ).removeClass( 'sui-hidden' );

			// Check if a specific template for this field exists.
			let templateId = 'hustle-' + this.field.type + '-field-settings-tpl';

			// If a specific template doesn't exist, use the common template.
			if ( ! $( '#' + templateId ).length ) {
				templateId = 'hustle-common-field-settings-tpl';
			}

			const template = Optin.template( templateId );
			this.$( '#hustle-data-pane--settings' ).html( template( this.fieldData ) );
			Hustle.Events.trigger( 'view.rendered', this );

			if ( 'gdpr' === this.field.type ) {

				// These only allow inline elements.
				const editorSettings = {
					tinymce: {
						wpautop: false,
						toolbar1: 'bold,italic,strikethrough,link',
						valid_elements: 'a[href|target=_blank],strong/b,i,u,s,em,del', // eslint-disable-line camelcase
						forced_root_block: '' // eslint-disable-line camelcase
					},
					quicktags: { buttons: 'strong,em,del,link' }
				};

				wp.editor.remove( 'gdpr_message' );
				wp.editor.initialize( 'gdpr_message', editorSettings );

			} else if ( 'recaptcha' === this.field.type ) {

				const editorSettings = {
					tinymce: { toolbar: [ 'bold italic link alignleft aligncenter alignright' ] },
					quicktags: true
				};
				wp.editor.remove( 'v3_recaptcha_badge_replacement' );
				wp.editor.initialize( 'v3_recaptcha_badge_replacement', editorSettings );

				wp.editor.remove( 'v2_invisible_badge_replacement' );
				wp.editor.initialize( 'v2_invisible_badge_replacement', editorSettings );
			}
		},

		renderStyling() {

			if ( 'hidden' === this.field.type ) {
				this.$( '#hustle-data-tab--styling' ).removeClass( 'hustle-data-pane' ).addClass( 'sui-hidden' );
				this.$( '#hustle-data-pane--styling' ).addClass( 'sui-hidden' );

				return;
			}

			this.$( '#hustle-data-tab--styling' ).removeClass( 'sui-hidden' ).addClass( 'hustle-data-pane' );
			this.$( '#hustle-data-pane--styling' ).removeClass( 'sui-hidden' );

			// Check if a specific template for this field exists.
			let templateId = 'hustle-' + this.field.type + '-field-styling-tpl';

			// If a specific template doesn't exist, use the common template.
			if ( ! $( '#' + templateId ).length ) {
				templateId = 'hustle-common-field-styling-tpl';
			}
			let template = Optin.template( templateId );
			this.$( '#hustle-data-pane--styling' ).html( template( this.fieldData ) );
		},

		fieldUpdated( e ) {
			let $this = $( e.target ),
				dataName = $this.attr( 'name' ),
				dataValue = $this.is( ':checkbox' ) ? $this.is( ':checked' ) : $this.val();

			this.changed[ dataName ] = dataValue;
		},

		closeModal() {
			this.undelegateEvents();
			this.stopListening();

			// Hide dialog
			SUI.dialogs[ 'hustle-dialog--edit-field' ].hide();
		},

		changeTimeFormat( e ) {
			let $this = $( e.target ),
				dataValue = $this.val();
			if ( '12' === dataValue ) {
				$( '#hustle-date-format' ).closest( '.sui-form-field' ).show();
				$( 'input[name="time_hours"]' ).prop( 'min', 1 ).prop( 'max', 12 );
			} else {
				$( '#hustle-date-format' ).closest( '.sui-form-field' ).hide();
				$( 'input[name="time_hours"]' ).prop( 'min', 0 ).prop( 'max', 23 );
			}
		},

		handleCaptchaSave( e ) {
			if ( 'recaptcha' !== this.field.type ) {
				return;
			}
			let avaiableCaptcha = $( '#available_recaptchas' ).val();
			if ( avaiableCaptcha ) {
				avaiableCaptcha = avaiableCaptcha.split( ',' );
				let version = $( 'input[name="version"]:checked' ).val();

				if ( -1 === _.indexOf( avaiableCaptcha, version ) ) {
					$( '#hustle-dialog--edit-field' ).find( '#hustle-apply-changes' ).attr( 'disabled', 'disabled' );
				} else {
					$( '#hustle-dialog--edit-field' ).find( '#hustle-apply-changes' ).attr( 'disabled', false );
				}
			} else {
				$( '#hustle-dialog--edit-field' ).find( '#hustle-apply-changes' ).attr( 'disabled', 'disabled' );
			}
		},

		/**
		 * Trim and replace spaces in field name.
		 * @since 4.0
		 * @param event e
		 */
		trimName( e ) {
			let $input = this.$( e.target ),
				newVal;

			newVal = $.trim( $input.val() ).replace( / /g, '_' );

			$input.val( newVal );
		},

		/**
		 * Add the saved settings to the model.
		 * @since 4.0
		 * @param event e
		 */
		applyChanges( e ) {

			// TODO: do validation
			// TODO: keep consistency with how stuff is saved in visibility conditions
			let self = this,
				$button = this.$( e.target ),
				formFields = Object.assign({}, this.model.get( 'form_elements' ) );

			// if gdpr message
			if ( 'gdpr' === this.field.type && 'undefined' !== typeof tinyMCE ) {

				// gdpr_message editor
				let gdprMessageEditor = tinyMCE.get( 'gdpr_message' ),
					$gdprMessageTextarea = this.$( 'textarea#gdpr_message' ),
					gdprMessage = ( 'true' === $gdprMessageTextarea.attr( 'aria-hidden' ) ) ? gdprMessageEditor.getContent() : $gdprMessageTextarea.val();

				formFields.gdpr.gdpr_message = gdprMessage; // eslint-disable-line camelcase
				this.model.set( 'form_elements', formFields );
				this.model.userHasChange();

			} else if ( 'recaptcha' === this.field.type && 'undefined' !== typeof tinyMCE ) {

				// v3 recaptcha badge editor.
				let v3messageEditor = tinyMCE.get( 'v3_recaptcha_badge_replacement' ),
					$v3messageTextarea = this.$( 'textarea#v3_recaptcha_badge_replacement' ),
					v3message = ( 'true' === $v3messageTextarea.attr( 'aria-hidden' ) ) ? v3messageEditor.getContent() : $v3messageTextarea.val();

				formFields.recaptcha.v3_recaptcha_badge_replacement = v3message; // eslint-disable-line camelcase

				// v2 invisible badge editor.
				let v2messageEditor = tinyMCE.get( 'v2_invisible_badge_replacement' ),
				$v2messageTextarea = this.$( 'textarea#v2_invisible_badge_replacement' ),
				v2message = ( 'true' === $v2messageTextarea.attr( 'aria-hidden' ) ) ? v2messageEditor.getContent() : $v2messageTextarea.val();

				formFields.recaptcha.v2_invisible_badge_replacement = v2message; // eslint-disable-line camelcase

				this.model.set( 'form_elements', formFields );
				this.model.userHasChange();

			}

			// If there were changes.
			if ( Object.keys( this.changed ).length ) {

				let oldField = _.extend({}, this.field );
				_.extend( this.field, this.changed );

				// Don't allow to override Email field created by default
				// and prevent field's names from being empty.
				if (
					( ( 'name' in this.changed ) && 'email' !== oldField.name && 'email' === this.field.name ) ||
					( 'name' in this.changed && ! this.field.name.trim().length )
				) {
					this.field.name = oldField.name;
					delete this.changed.name;
				}

				// "Name" is the unique identifier. If it changed, return and let the callback handle it.
				if ( ! ( 'name' in this.changed ) && 'email' !== oldField.name ) {

					// Update this field.
					formFields[ this.field.name ] = this.field;
					this.model.set( 'form_elements', formFields );
					this.model.userHasChange();

				} else if ( 'email' === oldField.name ) {
					this.field.name = 'email';
					delete this.changed.name;
				}

				this.trigger( 'field:updated', this.field, this.changed, oldField );
			}
			$button.addClass( 'sui-button-onload' );
			setTimeout( function() {
				self.closeModal();
				$button.removeClass( 'sui-button-onload' );
			}, 300 );
		}
	});
});

Hustle.define( 'Modals.EditSchedule', function( $ ) {

	'use strict';

	return Backbone.View.extend({

		el: '#hustle-schedule-dialog-content',

		dialogId: 'hustle-dialog--add-schedule',

		events: {
			'click #hustle-schedule-save': 'saveSchedule',
			'click .hustle-schedule-cancel': 'cancel',
			'click .hustle-schedule-delete': 'openDeleteModal',

			// Change events.
			'change .hustle-checkbox-with-dependencies input[type="checkbox"]': 'checkboxWithDependenciesChanged',
			'change select[name="custom_timezone"]': 'customTimezoneChanged'
		},

		initialize( opts ) {
			this.model = opts.model;
		},

		open() {
			const modalId = this.dialogId;
			const focusAfterClosed = 'hustle-schedule-focus';
			const focusWhenOpen = undefined;
			const hasOverlayMask = false;

			this.renderContent();

			$( '.hustle-datepicker-field' ).datepicker({

				beforeShow: function( input, inst ) {
					$( '#ui-datepicker-div' ).addClass( 'sui-calendar' );
				},
				'dateFormat': 'm/d/yy'
			});

			SUI.openModal(
				modalId,
				focusAfterClosed,
				focusWhenOpen,
				hasOverlayMask
			);
		},

		renderContent() {

			let template = Optin.template( 'hustle-schedule-dialog-content-tpl' ),
				$container = $( '#hustle-schedule-dialog-content' ),
				data = Object.assign({}, this.model.get( 'schedule' ) );

			data.is_schedule = this.model.get( 'is_schedule' ); // eslint-disable-line camelcase

			data.serverCurrentTime = this.getTimeToDisplay( 'server' );
			data.customCurrentTime = this.getTimeToDisplay( 'custom' );

			this.setElement( template( data ) );

			$container.html( this.$el );

			// Bind SUI elements again.
			Hustle.Events.trigger( 'view.rendered', this );

			// We hide/show some elements on change, so keep the view displaying what it should when re-rendering the modal.
			this.refreshViewOnRender( data );
		},

		refreshViewOnRender( data ) {

			// Hide/show dependent elements.
			this.$( '.hustle-checkbox-with-dependencies input' ).each( function() {
				$( this ).trigger( 'change' );
			});

			// Display the correct tab.
			if ( 'server' === data.time_to_use ) {
				$( '#tab-timezone-server' ).click();
			} else {
				$( '#tab-timezone-custom' ).click();
			}

			// Display the correct tab.
			if ( 'all' === data.active_days ) {
				$( '#tab-schedule-everyday' ).click();
			} else {
				$( '#tab-schedule-somedays' ).click();
			}

			// Comparing the model's value with the value selected in the "select" element.
			const timezoneSelectValue = this.$( 'select[name="custom_timezone"]' ).val(),
				timezoneModelValue = data.custom_timezone;

			// We're retrieving the timezone options from a wp function, so we can't
			// update its selected value on js render as we do with other selects.
			if ( timezoneModelValue !== timezoneSelectValue ) {
				this.$( 'select[name="custom_timezone"]' ).val( timezoneModelValue ).trigger( 'change' );
			}
		},

		getTimeToDisplay( source, timezone = false ) {

			const settings = this.model.get( 'schedule' );

			let utcOffset = false,
				currentTime = false;

			if ( 'server' === source ) {
				utcOffset = optinVars.time.wp_gmt_offset;

			} else {
				const customTimezone = timezone || settings.custom_timezone;

				if ( customTimezone.includes( 'UTC' ) ) {

					const selectedOffset = customTimezone.replace( 'UTC', '' );

					// There's a timezone with the value "UTC".
					utcOffset = selectedOffset.length ? parseFloat( selectedOffset ) : 0;

				} else {
					const endMoment = moment().tz( customTimezone );
					currentTime = endMoment.format( 'hh:mm a' );
				}
			}

			// Calculate the time with the manual offset.
			// Moment.js doesn't support manual offsets with decimals, so not using it here.
			if ( false === currentTime && false !== utcOffset ) {

				// This isn't the correct timestamp for the given offset.
				// We just want to display the time for reference.
				const timestamp = Date.now() + ( utcOffset * 3600 * 1000 ),
					endMoment = moment.utc( timestamp );

				currentTime = endMoment.format( 'hh:mm a' );
			}

			return currentTime;
		},

		saveSchedule( e ) {

			const $button = $( e.currentTarget ),
				data = this.processFormForSave();

			$button.addClass( 'sui-button-onload' );
			$button.prop( 'disabled', true );

			setTimeout( () => {
				$button.removeClass( 'sui-button-onload' );
				$button.prop( 'disabled', false );
			}, 500 );

			this.model.set( 'is_schedule', '1' );
			this.model.set( 'schedule', data );
			this.model.userHasChange();

			this.closeModal();

			this.trigger( 'schedule:updated' );

		},

		processFormForSave() {

			const $form = $( '#hustle-edit-schedule-form' );
			const data  = Module.Utils.serializeObject( $form );

			return data;

		},

		cancel() {
			this.renderContent();
			this.closeModal();
		},

		openDeleteModal( e ) {

			let dialogId = 'hustle-dialog--delete-schedule',
			template = Optin.template( 'hustle-delete-schedule-dialog-content-tpl' ),
			$this = $( e.currentTarget ),
			data = {
				id: $this.data( 'id' ),
				title: $this.data( 'title' ),
				description: $this.data( 'description' ),
				action: 'delete',
				actionClass: 'hustle-button-delete'
			},
			newFocusAfterClosed = 'hustle-schedule-notice',
			newFocusFirst       = undefined,
			hasOverlayMask      = true,
			content 			= template( data ),
			footer              = $( '#' + dialogId + ' #hustle-delete-schedule-dialog-content' ),
			deleteButton        = footer.find( 'button.hustle-delete-confirm' );

			// Add the templated content to the modal.
			if ( ! deleteButton.length ) {
				footer.append( content );
			}

			// Add the title to the modal.
			$( '#' + dialogId + ' #hustle-dialog--delete-schedule-title' ).html( data.title );
			$( '#' + dialogId + ' #hustle-dialog--delete-schedule-description' ).html( data.description );

			SUI.replaceModal( dialogId, newFocusAfterClosed, newFocusFirst, hasOverlayMask );

			$( '#hustle-delete-schedule-dialog-content' ).off( 'submit' ).on( 'submit', $.proxy( this.deactivateSchedule, this ) );

		},

		deactivateSchedule( e ) {

			e.preventDefault();

			this.closeModal();
			this.model.set( 'is_schedule', '0' );
			this.model.userHasChange();
			this.trigger( 'schedule:updated' );
		},

		checkboxWithDependenciesChanged( e ) {
			const $this = $( e.currentTarget ),
				disableWhenOn = $this.data( 'disable-on' ),
				hideWhenOn = $this.data( 'hide-on' );

			if ( disableWhenOn ) {
				const $dependencies = this.$( `[data-checkbox-content="${ disableWhenOn }"]` );

				if ( $this.is( ':checked' ) ) {
					$dependencies.addClass( 'sui-disabled' );
				} else {
					$dependencies.removeClass( 'sui-disabled' );
				}
			}

			if ( hideWhenOn ) {

				const $dependencies = this.$( `[data-checkbox-content="${ hideWhenOn }"]` );

				if ( $this.is( ':checked' ) ) {
					Module.Utils.accessibleHide( $dependencies );
				} else {
					Module.Utils.accessibleShow( $dependencies );
				}

			}
		},

		customTimezoneChanged( e ) {
			const value = $( e.currentTarget ).val(),
				timeContainer = this.$( '#hustle-custom-timezone-current-time' ),
				currentTime = this.getTimeToDisplay( 'custom', value );

			timeContainer.text( currentTime );
		},

		closeModal() {
			$( '.hustle-datepicker-field' ).datepicker( 'destroy' );
			SUI.closeModal();
		}
	});
});

Hustle.define( 'Modals.Optin_Fields', function( $ ) {
	'use strict';
	return Backbone.View.extend({

		el: '#hustle-dialog--optin-fields',

		events: {
			'click .sui-box-selector input': 'selectFields',
			'click .sui-dialog-overlay': 'closeModal',
			'click .hustle-cancel-insert-fields': 'closeModal',
			'click #hustle-insert-fields': 'insertFields'
		},

		initialize() {
			this.selectedFields = [];
		},

		selectFields( e ) {
			var $input = this.$( e.target ),
				value = $input.val(),
				$selectorLabel  = this.$el.find( 'label[for="' + $input.attr( 'id' ) + '"]' )
				;
			$selectorLabel.toggleClass( 'selected' );
			if ( $input.prop( 'checked' ) ) {
				this.selectedFields.push( value );
			} else {
				this.selectedFields = _.without( this.selectedFields, value );
			}
		},

		insertFields( e ) {
			var self = this,
				$button   = this.$( e.target )
				;
			$button.addClass( 'sui-button-onload' );
			this.trigger( 'fields:added', this.selectedFields );
			setTimeout( function() {
				$button.removeClass( 'sui-button-onload' );
				self.closeModal();
			}, 500 );
		},

		closeModal: function() {
			this.undelegateEvents();
			this.stopListening();
			let $selector = this.$el.find( '.sui-box-selector:not(.hustle-skip)' ),
				$input    = $selector.find( 'input' );

			// Hide dialog
			SUI.dialogs[ 'hustle-dialog--optin-fields' ].hide();

			// Uncheck options
			$selector.removeClass( 'selected' );
			$input.prop( 'checked', false );
			$input[0].checked = false;
		}

	});
});

Hustle.define( 'Modals.Visibility_Conditions', function( $ ) {
	'use strict';

	return Backbone.View.extend({

		el: '#hustle-dialog--visibility-options',

		selectedConditions: [],

		opts: {
			groupId: 0,
			conditions: []
		},

		events: {
			'click .sui-box-selector input': 'selectConditions',
			'click .hustle-cancel-conditions': 'cancelConditions',
			'click .sui-dialog-overlay': 'cancelConditions',
			'click #hustle-add-conditions': 'addConditions'
		},

		initialize: function( options ) {
			this.opts = _.extend({}, this.opts, options );
			this.selectedConditions = this.opts.conditions;

			this.$( '.hustle-visibility-condition-option' ).prop( 'checked', false ).prop( 'disabled', false );

			for ( let conditionId of this.selectedConditions ) {
				this.$( '#hustle-condition--' + conditionId ).prop( 'checked', true ).prop( 'disabled', true );
			}

		},

		selectConditions: function( e ) {

			let $input = this.$( e.target ),
				$selectorLabel  = this.$el.find( 'label[for="' + $input.attr( 'id' ) + '"]' ),
				value = $input.val()
				;

			$selectorLabel.toggleClass( 'selected' );

			if ( $input.prop( 'checked' ) ) {
				this.selectedConditions.push( value );
			} else {
				this.selectedConditions = _.without( this.selectedConditions, value );
			}
		},

		cancelConditions: function() {

			// Hide dialog
			SUI.dialogs[ 'hustle-dialog--visibility-options' ].hide();

		},

		addConditions: function( e ) {
			let me = this,
				$button   = this.$( e.target );
			$button.addClass( 'sui-button-onload' );

			this.trigger( 'conditions:added', { groupId: $button.data( 'group_id' ), conditions: this.selectedConditions });
			setTimeout( function() {

				// Hide dialog
				SUI.dialogs[ 'hustle-dialog--visibility-options' ].hide();
				$button.removeClass( 'sui-button-onload' );
				me.undelegateEvents();
			}, 500 );
		}

	});
});

( function( $ ) {
	'use strict';

	Optin.listingBase = Hustle.View.extend({

		el: '.sui-wrap',

		logShown: false,

		moduleType: '',

		singleModuleActionNonce: '',

		_events: {

			// Modals.
			'click .hustle-create-module': 'openCreateModal',
			'click .hustle-delete-module-button': 'openDeleteModal',
			'click .hustle-module-tracking-reset-button': 'openResetTrackingModal',
			'click .hustle-manage-tracking-button': 'openManageTrackingModal',
			'click .hustle-import-module-button': 'openImportModal',
			'click .hustle-upgrade-modal-button': 'openUpgradeModal',

			// Modules' actions.
			'click .hustle-single-module-button-action': 'handleSingleModuleAction',
			'click .hustle-preview-module-button': 'openPreview',

			// Bulk actions.
			'click form.sui-bulk-actions .hustle-bulk-apply-button': 'bulkActionCheck',
			'click #hustle-dialog--delete .hustle-delete': 'bulkActionSend',
			'click #hustle-bulk-action-reset-tracking-confirmation .hustle-delete': 'bulkActionSend',

			// Utilities.
			'click .sui-accordion-item-action .hustle-onload-icon-action': 'addLoadingIconToActionsButton'
		},

		initialize( opts ) {

			this.events = $.extend( true, {}, this.events, this._events );
			this.delegateEvents();

			this.moduleType = opts.moduleType;

			this.singleModuleActionNonce = optinVars.single_module_action_nonce;

			let newModuleModal = Hustle.get( 'Modals.New_Module' ),
				importModal = Hustle.get( 'Modals.ImportModule' );

			new newModuleModal({ moduleType: this.moduleType });
			this.ImportModal = new importModal();

			// Why this doesn't work when added in events
			$( '.sui-accordion-item-header' ).on( 'click', $.proxy( this.openTrackingChart, this ) );

			// Open the tracking chart when the class is present. Used when coming from 'view tracking' in Dashboard.
			if ( $( '.hustle-display-chart' ).length ) {
				this.openTrackingChart( $( '.hustle-display-chart' ) );
			}

			this.doActionsBasedOnUrl();
		},

		doActionsBasedOnUrl() {

			// Display the "Create module" dialog.
			if ( 'true' === Module.Utils.getUrlParam( 'create-module' ) ) {
				setTimeout( () => {
					$( '.hustle-create-module' ).trigger( 'click' );
				}, 100 );
			}

			// Display "Upgrade modal".
			if ( 'true' === Module.Utils.getUrlParam( 'requires-pro' ) ) {
				const self = this;
				setTimeout( () => self.openUpgradeModal(), 100 );
			}

			// Display notice based on URL parameters.
			if ( Module.Utils.getUrlParam( 'show-notice' ) ) {
				const status = 'success' === Module.Utils.getUrlParam( 'show-notice' ) ? 'success' : 'error',
					notice = Module.Utils.getUrlParam( 'notice' ),
					message = ( notice && 'undefined' !== optinVars.messages.commons[ notice ]) ? optinVars.messages.commons[ notice ] : Module.Utils.getUrlParam( 'notice-message' );

				if ( 'undefined' !== typeof message && message.length ) {
					Module.Notification.open( status, message );
				}
			}
		},

		handleSingleModuleAction( e ) {
			this.addLoadingIcon( e );
			Module.handleActions.initAction( e, 'listing', this );
		},

		/**
		 * initAction succcess callback for "toggle-status".
		 * @since 4.0.4
		 */
		actionToggleStatus( $this, data ) {

			const enabled = data.was_module_enabled;

			let item = $this.closest( '.sui-accordion-item' ),
				tag  = item.find( '.sui-accordion-item-title span.sui-tag' );

			if ( ! enabled ) {
				tag.text( tag.data( 'publish' ) );
				tag.addClass( 'sui-tag-blue' );
				tag.attr( 'data-status', 'published' );

			} else {
				tag.text( tag.data( 'draft' ) );
				tag.removeClass( 'sui-tag-blue' );
				tag.attr( 'data-status', 'draft' );
			}

			$this.find( 'span' ).toggleClass( 'sui-hidden' );

			// Update tracking data
			if ( item.hasClass( 'sui-accordion-item--open' ) ) {
				item.find( '.sui-accordion-open-indicator' ).trigger( 'click' ).trigger( 'click' );
			}
		},

		actionDisplayError( $this, data ) {

			const message = data.message,
				$dialog = $this.closest( '.sui-modal' ),
				$errorContainer = $dialog.find( '.sui-notice-error' ),
				$error = $errorContainer.find( 'p' );

			$error.html( message );
			Module.Utils.accessibleShow( $errorContainer, false );
		},

		openPreview( e ) {
			let $this = $( e.currentTarget ),
				id = $this.data( 'id' ),
				type = $this.data( 'type' );

			Module.preview.open( id, type );
		},

		openTrackingChart( e ) {

			let flexHeader = '';

			if ( e.target ) {

				if ( $( e.target ).closest( '.sui-accordion-item-action' ).length ) {
					return true;
				}

				e.preventDefault();
				e.stopPropagation();

				flexHeader = $( e.currentTarget );
			} else {
				flexHeader = e;
			}

			let self = this,
				flexItem   = flexHeader.parent(),
				flexChart  = flexItem.find( '.sui-chartjs-animated' )
				;

			if ( flexItem.hasClass( 'sui-accordion-item--disabled' ) ) {
				flexItem.removeClass( 'sui-accordion-item--open' );
			} else {
				if ( flexItem.hasClass( 'sui-accordion-item--open' ) ) {
					flexItem.removeClass( 'sui-accordion-item--open' );
				} else {
					flexItem.addClass( 'sui-accordion-item--open' );
				}
			}

			flexItem.find( '.sui-accordion-item-data' ).addClass( 'sui-onload' );
			flexChart.removeClass( 'sui-chartjs-loaded' );

			if ( flexItem.hasClass( 'sui-accordion-item--open' ) ) {
				let id = flexHeader.data( 'id' ),
					nonce = flexHeader.data( 'nonce' ),
					data = {
						id: id,
						'_ajax_nonce': nonce,
						action: 'hustle_tracking_data'
					};
				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: data,
					success: function( resp ) {
						if ( resp.success && resp.data ) {

							flexItem.find( '.sui-accordion-item-body' ).html( resp.data.html );

							Module.trackingChart.init( flexItem, resp.data.charts_data );

							flexChart  = flexItem.find( '.sui-chartjs-animated' );

							// Init tabs
							SUI.suiTabs();
						}
						flexItem.find( '.sui-accordion-item-data' ).removeClass( 'sui-onload' );
						flexChart.addClass( 'sui-chartjs-loaded' );
					},
					error: function( resp ) {
						flexItem.find( '.sui-accordion-item-data' ).removeClass( 'sui-onload' );
						flexChart.addClass( 'sui-chartjs-loaded' );
					}
				});

			}

		},

		getChecked: function( type ) {
			let query = '.sui-wrap .sui-accordion-item-title input[type=checkbox]';
			if ( 'checked' === type ) {
				query += ':checked';
			}
			return $( query );
		},

		bulkActionCheck: function( e ) {
			let $this = $( e.target ),
				value = $this.closest( '.hustle-bulk-actions-container' ).find( 'select[name="hustle_action"] option:selected' ).val(), //$( 'select option:selected', $this.closest( '.sui-box' ) ).val(),
				elements = this.getChecked( 'checked' );

			if ( 0 === elements.length || 'undefined' === value ) {
				return false;
			}

			if ( 'delete' === value ) {
				const data = {
					actionClass: 'hustle-delete',
					action: 'delete',
					title: $this.data( 'delete-title' ),
					description: $this.data( 'delete-description' )
				};
				Module.deleteModal.open( data );
				return false;

			} else if ( 'reset-tracking' === value ) {
				const data = {
					actionClass: 'hustle-delete',
					action: 'reset-tracking',
					title: $this.data( 'reset-title' ),
					description: $this.data( 'reset-description' )
				};

				Module.deleteModal.open( data );

				return false;
			}

			this.bulkActionSend( e, value );
		},

		bulkActionSend: function( e, action ) {
			e.preventDefault();

			this.addLoadingIcon( e );
			let button = $( '.sui-bulk-actions .hustle-bulk-apply-button' ),
				value = action ? action : $( e.target ).data( 'hustle-action' ),
				elements = this.getChecked( 'checked' );

			if ( 0 === elements.length ) {
				return false;
			}
			let ids = [];
			$.each( elements, function() {
				ids.push( $( this ).val() );
			});

			let data = {
				ids: ids,
				hustle: value,
				type: button.data( 'type' ),
				'_ajax_nonce': button.data( 'nonce' ),
				action: 'hustle_listing_bulk'
			};
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data,
				success: function( resp ) {
					if ( resp.success ) {
						location.reload();
					} else {
						SUI.dialogs['hustle-dialog--delete'].hide();

						//show error notice
					}
				}
			});
		},

		addLoadingIcon( e ) {
			const $button = $( e.currentTarget );
			if ( $button.hasClass( 'sui-button' ) ) {
				$button.addClass( 'sui-button-onload' );
			}
		},

		addLoadingIconToActionsButton( e ) {
			const $actionButton = $( e.currentTarget ),
				$mainButton = $actionButton.closest( '.sui-accordion-item-action' ).find( '.sui-dropdown-anchor' );

			$mainButton.addClass( 'sui-button-onload' );
		},

		// ===================================
		// Modals
		// ===================================

		openCreateModal( e ) {

			let page = '_page_hustle_sshare_listing';

			if ( false === $( e.currentTarget ).data( 'enabled' ) ) {
				this.openUpgradeModal();

			} else {

				if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
					SUI.openModal(
						'hustle-new-module--type',
						'hustle-create-new-module',
						'hustle-new-module--type-close',
						false
					);
				} else {
					SUI.openModal(
						'hustle-new-module--create',
						'hustle-create-new-module',
						'hustle-module-name',
						false
					);
				}

				// SUI.dialogs['hustle-dialog--add-new-module'].show();
			}
		},

		openUpgradeModal( e ) {

			if ( e ) {
				e.preventDefault();
				e.stopPropagation();
			}

			$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );

			if ( ! $( '#hustle-dialog--upgrade-to-pro' ).length ) {
				return;
			}

			SUI.dialogs['hustle-dialog--upgrade-to-pro'].show();

			return;
		},

		openDeleteModal( e ) {
			e.preventDefault();

			let $this = $( e.currentTarget ),
				data = {
					id: $this.data( 'id' ),
					nonce: $this.data( 'nonce' ),
					action: 'delete',
					title: $this.data( 'title' ),
					description: $this.data( 'description' ),
					actionClass: 'hustle-single-module-button-action'
				};

			Module.deleteModal.open( data );
		},

		openImportModal( e ) {

			const $this = $( e.currentTarget );

			if ( false === $this.data( 'enabled' ) ) {
				this.openUpgradeModal();

			} else {

				this.ImportModal.open( e );
			}
		},

		/**
		 * The "are you sure?" modal from before resetting the tracking data of modules.
		 * @since 4.0
		 */
		openResetTrackingModal( e ) {
			e.preventDefault();

			const $this = $( e.target ),
				data = {
					id: $this.data( 'module-id' ),
					nonce: this.singleModuleActionNonce,
					action: 'reset-tracking',
					title: $this.data( 'title' ),
					description: $this.data( 'description' ),
					actionClass: 'hustle-single-module-button-action'
				};

			Module.deleteModal.open( data );
		},

		openManageTrackingModal( e ) {
			const template = Optin.template( 'hustle-manage-tracking-form-tpl' ),
				$modal = $( '#hustle-dialog--manage-tracking' ),
				$button = $( e.currentTarget ),
				moduleId = $button.data( 'module-id' ),
				data = {

					//moduleID: $button.data( 'module-id' ),
					enabledTrackings: $button.data( 'tracking-types' ).split( ',' )
				};

			$modal.find( '#hustle-manage-tracking-form-container' ).html( template( data ) );
			$modal.find( '#hustle-button-toggle-tracking-types' ).data( 'module-id', moduleId );
			SUI.dialogs[ 'hustle-dialog--manage-tracking' ].show();
		}

	});
}( jQuery ) );

Hustle.define( 'Modals.New_Module', function( $ ) {

	'use strict';

	return Backbone.View.extend({
		el: '#hustle-new-module--dialog',
		data: {},
		events: {
			'click #hustle-select-mode': 'modeSelected',
			'keypress #module-mode-step': 'maybeModeSelected',
			'click #hustle-create-module': 'createModule',
			'keypress #module-name-step': 'maybeCreateModule',
			'click #hustle-new-module--create-back': 'goToModeStep',
			'change input[name="mode"]': 'modeChanged',
			'keydown input[name="name"]': 'nameChanged'
		},

		initialize( args ) {
			_.extend( this.data, args );
		},

		modeChanged( e ) {
			var $this = $( e.target ),
				value = $this.val();
			this.data.mode = value;
			this.$el.find( '#hustle-select-mode' ).prop( 'disabled', false );
		},

		nameChanged( e ) {
			setTimeout( () => {
				this.$( '.sui-error-message' ).hide();
				let $this = $( e.target ),
					value = $this.val();
				this.data.name = value;
				if ( 0 === value.trim().length ) {
					this.$( '#hustle-create-module' ).prop( 'disabled', true );
					this.$( '#error-empty-name' ).closest( '.sui-form-field' ).addClass( 'sui-form-field-error' );
					this.$( '#error-empty-name' ).show();
				} else {
					this.$( '#hustle-create-module' ).prop( 'disabled', false );
					this.$( '#error-empty-name' ).closest( '.sui-form-field' ).removeClass( 'sui-form-field-error' );
					this.$( '#error-empty-name' ).hide();
				}
			}, 300 );
		},

		modeSelected( e ) {

			const newModalId        = 'hustle-new-module--create',
				newFocusAfterClosed = 'hustle-create-new-module',
				newFocusFirst       = 'hustle-module-name',
				hasOverlayMask      = false
				;

			this.$el.find( 'input[name="mode"]:checked' ).trigger( 'change' );

			if ( 0 === Object.keys( this.data ).length ) {
				return;
			}

			SUI.replaceModal( newModalId, newFocusAfterClosed, newFocusFirst, hasOverlayMask );

			e.preventDefault();

		},

		maybeCreateModule( e ) {

			if ( 13 === e.which ) { // the enter key code
				e.preventDefault();
				this.$( '#hustle-create-module' ).click();
			}
		},

		maybeModeSelected( e ) {

			if ( 13 === e.which ) { // the enter key code
				e.preventDefault();
				this.$( '#hustle-select-mode' ).click();
			}
		},

		goToModeStep( e ) {

			const newModalId        = 'hustle-new-module--type',
				newFocusAfterClosed = 'hustle-create-new-module',
				newFocusFirst       = 'hustle-new-module--type-close',
				hasOverlayMask      = false
				;

			SUI.replaceModal( newModalId, newFocusAfterClosed, newFocusFirst, hasOverlayMask );

			e.preventDefault();

		},

		createModule( e ) {
			let $step = $( e.target ).closest( '#hustle-new-module--create' ),
				$errorSavingMessage = $step.find( '#error-saving-settings' ),
				$button = $step.find( '#hustle-create-module' ),
				nonce = $step.data( 'nonce' );

			if (
				( 'undefined' === typeof this.data.mode && 'social_sharing' !== this.data.moduleType ) ||
				'undefined' === typeof this.data.name || 0 === this.data.name.length
			) {
				$errorSavingMessage.show();
				$button.removeClass( 'sui-button-onload' );
				return;
			}

			$errorSavingMessage.hide();
			$button.addClass( 'sui-button-onload' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					data: {
						'module_name': this.data.name,
						'module_mode': this.data.mode,
						'module_type': this.data.moduleType
					},
					action: 'hustle_create_new_module',
					'_ajax_nonce': nonce
				}

			}).done( function( res ) {

				// Go to the wizard of this type of module on success, or listing page is limits were reached.
				if ( res && res.data && res.data.redirect_url ) {
					window.location.replace( res.data.redirect_url );
				} else {
					$errorSavingMessage.show();
					$button.removeClass( 'sui-button-onload' );
				}
			}).fail( function() {
				$errorSavingMessage.show();
				$button.removeClass( 'sui-button-onload' );
			});
		}

	});
});

Hustle.define( 'Modals.ImportModule', function( $ ) {
	'use strict';

	return Backbone.View.extend({
		el: '#hustle-dialog--import',

		events: {
			'change #hustle-import-file-input': 'selectUploadFile',
			'click .sui-upload-file': 'changeFile',
			'click .sui-upload-file button': 'resetUploadFile',
			'click .hustle-import-check-all-checkbox': 'checkAll',
			'change .hustle-module-meta-checkbox': 'uncheckAllOption'
		},

		initialize() {},

		open( e ) {

			const $this = $( e.currentTarget ),
				moduleId = $this.data( 'module-id' ),
				template = Optin.template( 'hustle-import-modal-options-tpl' ),
				$importDialog = $( '#hustle-dialog--import' ),
				$submitButton = $importDialog.find( '#hustle-import-module-submit-button' ),
				isNew = 'undefined' === typeof moduleId,
				templateData = {
					isNew,
					isOptin: 'optin' === $this.data( 'module-mode' ) // Always "false" when importing into a new module.
				};

			$importDialog.find( '#hustle-import-modal-options' ).html( template( templateData ) );

			if ( isNew ) {
				$submitButton.removeAttr( 'data-module-id' );

				// Bind the tabs again with their SUI actions.
				// Only the modal for importing a new module has tabs.
				SUI.tabs();

				$importDialog.find( '.sui-tab-item' ).on( 'click', function() {

					const $this = $( this ),
						$radio = $( '#' + $this.data( 'label-for' ) );

					$radio.click();
				});

			} else {
				$submitButton.attr( 'data-module-id', moduleId );
			}

			SUI.openModal( 'hustle-dialog--import', e.currentTarget, 'hustle-import-file-input', true );
		},

		selectUploadFile( e ) {

			e.preventDefault();

			let $this = $( e.target ),
				value = $this.val().replace( /C:\\fakepath\\/i, '' );

			//hide previous error
			Module.Utils.accessibleHide( $( '#hustle-dialog--import .sui-notice-error' ), false );

			if ( value ) {
				$( '.sui-upload-file span:first' ).text( value );
				$( '.sui-upload' ).addClass( 'sui-has_file' );
				$( '#hustle-import-module-submit-button' ).prop( 'disabled', false );
			} else {
				$( '.sui-upload' ).removeClass( 'sui-has_file' );
				$( '.sui-upload-file span:first' ).text( '' );
				$( '#hustle-import-module-submit-button' ).prop( 'disabled', true );
			}
		},

		resetUploadFile( e ) {
			e.stopPropagation();
			$( '#hustle-import-file-input' ).val( '' ).trigger( 'change' );
		},

		changeFile( e ) {
			$( '#hustle-import-file-input' ).trigger( 'click' );
		},

		checkAll( e ) {
			const $this = $( e.currentTarget ),
				value = $this.is( ':checked' ),
				$container = $this.closest( '.hui-inputs-list' ),
				$checkboxes = $container.find( 'input.hustle-module-meta-checkbox:not(.hustle-import-check-all-checkbox)' );

			$checkboxes.prop( 'checked', value );
		},

		uncheckAllOption( e ) {
			const $this = $( e.currentTarget ),
				$container = $this.closest( '.hui-inputs-list' ),
				$allCheckbox = $container.find( '.hustle-import-check-all-checkbox' ),
				isAllChecked = $allCheckbox.is( ':checked' );

			if ( ! isAllChecked ) {
				return;
			}

			$allCheckbox.prop( 'checked', false );
		}

	});
});

Hustle.define( 'Mixins.Model_Updater', function( $, doc, win ) {
	'use strict';
	return {

		initMix: function() {
			this.events = _.extend({}, this.events, this._events );
			this.delegateEvents();
		},

		_events: {
			'change textarea': '_updateText',
			'change input[type="text"]': '_updateText',
			'change input[type="url"]': '_updateText',
			'change input[type="hidden"]': '_updateText',
			'change input[type="number"]': '_updateText',
			'change input[type="checkbox"]': '_updateCheckbox',
			'change input[type=radio]': '_updateRadios',
			'change select': '_updateSelect'
		},

		_updateText: function( e ) {
			var $this = $( e.target ),
				attr = $this.data( 'attribute' ),
				model = this[ $this.data( 'model' ) || 'model' ],
				opts = _.isTrue( $this.data( 'silent' ) ) ? { silent: true } : {};
			if ( model && attr ) {
				e.stopPropagation();
				model.set.call( model, attr, e.target.value, opts );
			}
		},

		_updateCheckbox: function( e ) {
			var $this = $( e.target ),
				attr = $this.data( 'attribute' ),
				value = $this.val(),
				model = this[$this.data( 'model' ) || 'model'],
				opts = _.isTrue( $this.data( 'silent' ) ) ? { silent: true } : {};
			if ( model && attr ) {
				e.stopPropagation();

				// If the checkboxes values should behave as an array, instead of as an on/off toggle.
				if ( 'on' !== value ) {
					let current = model.get.call( model, attr );
					if ( $this.is( ':checked' ) ) {
						current.push( value );
					} else {
						current = _.without( current, value );
					}
					model.set.call( model, attr, current, opts );
				} else {
					model.set.call( model, attr, $this.is( ':checked' ) ? 1 : 0, opts );
				}
			}
		},

		_updateRadios: function( e ) {
			var $this = $( e.target ),
				attribute = $this.data( 'attribute' ),
				model = this[$this.data( 'model' ) || 'model'],
				opts = _.isTrue( $this.data( 'silent' ) ) ? {silent: true} : {};
			if ( model && attribute ) {
				e.stopPropagation();
				model.set.call( model, attribute, e.target.value, opts );
			}
		},

		_updateSelect: function( e ) {
			var $this = $( e.target ),
				attr = $this.data( 'attribute' ),
				model = this[$this.data( 'model' ) || 'model'],
				opts = _.isTrue( $this.data( 'silent' ) ) ? {silent: true} : {};
			if ( model && attr ) {
				e.stopPropagation();
				model.set.call( model, attr, $this.val(), opts );
			}
		}
	};
});

Hustle.define( 'Mixins.Module_Settings', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-wizard-behaviour',

		events: {},

		init( opts ) {

			const Model = opts.BaseModel.extend({
				defaults: {},
				initialize: function( data ) {
					_.extend( this, data );

					const Triggers = Hustle.get( 'Models.Trigger' );

					if ( ! ( this.get( 'triggers' ) instanceof Backbone.Model ) ) {
						this.set( 'triggers', new Triggers( this.triggers ), { silent: true });
					}
				}
			});

			this.model = new Model( optinVars.current.settings || {});
			this.moduleType = optinVars.current.data.module_type;

			const EditScheduleModalView = Hustle.get( 'Modals.EditSchedule' );
			this.editScheduleView = new EditScheduleModalView({
					model: this.model
				});

			this.listenTo( this.model, 'change', this.viewChanged );
			if ( 'embedded' !== this.moduleType ) {
				this.listenTo( this.model.get( 'triggers' ), 'change', this.viewChanged );
			}

			// Called just to trigger the "view.rendered" action.
			this.render();
		},

		render() {
			this.renderScheduleSection();
			this.editScheduleView.on( 'schedule:updated', $.proxy( this.renderScheduleSection, this ) );
		},

		renderScheduleSection() {

			let template = Optin.template( 'hustle-schedule-row-tpl' ),
				$container = $( '#hustle-schedule-row' ),
				scheduleSettings = this.model.get( 'schedule' ),
				hasFinished = false,
				data = Object.assign({}, scheduleSettings ),
				strings = {
					startDate: '',
					startTime: '',
					endDate: '',
					endTime: '',
					activeDays: '',
					activeTime: ''
				};

			data.is_schedule = this.model.get( 'is_schedule' ); // eslint-disable-line camelcase

			// Here we'll build the strings dependent on the selected settings. Skip if scheduling is disabled.
			if ( data.is_schedule ) {

				// Translated months and 'AM/PM' strings.
				const months = Object.assign({}, optinVars.current.schedule_strings.months ),
					meridiem = optinVars.current.schedule_strings.meridiem;

				// Schedule start string. Skip if disabled.
				if ( '0' === data.not_schedule_start ) {

					const stringDate = data.start_date.split( '/' ),
						month = months[ ( stringDate[0] - 1 ) ],
						ampm = meridiem[ data.start_meridiem_offset ];

					strings.startDate = `${ stringDate[1] } ${ month } ${ stringDate[2] }`;
					strings.startTime = `(${ data.start_hour }:${ data.start_minute } ${ ampm })`;

				}

				// Schedule end string. Skip if disabled.
				if ( '0' === data.not_schedule_end ) {

					const stringDate = data.end_date.split( '/' ),
						month = months[ ( stringDate[0] - 1 ) ],
						ampm = meridiem[ data.end_meridiem_offset ];

					strings.endDate = `${ stringDate[1] } ${ month } ${ stringDate[2] }`;
					strings.endTime = `(${ data.end_hour }:${ data.end_minute } ${ ampm })`;

					hasFinished = this.isScheduleFinished( data );
				}

				// Selected weekdays string. Skip if 'every day' is selected.
				if ( 'week_days' === data.active_days ) {

					const weekDays = optinVars.current.schedule_strings.week_days,
						days = data.week_days.map( day => weekDays[ day ].toUpperCase() );

					strings.activeDays = days.join( ', ' );
				}

				// Per day start and end string. Skip if 'during all day' is enabled.
				if ( '0' === data.is_active_all_day ) {

					const startAmpm = meridiem[ data.day_start_meridiem_offset ],
						endAmpm = meridiem[ data.day_end_meridiem_offset ],
						dayStart = `${ data.day_start_hour }:${ data.day_start_minute } ${ startAmpm }`,
						dayEnd = `${ data.day_end_hour }:${ data.day_end_minute } ${ endAmpm }`;

					strings.activeTime = dayStart + ' - ' + dayEnd;
				}
			}

			data.strings = strings;
			data.hasFinished = hasFinished;
			$container.html( template( data ) );

			$container.find( '.hustle-button-open-schedule-dialog' ).on( 'click', () => this.editScheduleView.open() );
		},

		isScheduleFinished( settings ) {

			const currentTime = new Date().getTime();

			let { time_to_use: timeToUse, end_date: date, end_hour: hour, end_minute: minute, end_meridiem_offset: ampm } = settings,
				dateString = `${ date } ${ hour }:${ minute } ${ ampm }`,
				endTimestamp = false,
				utcOffset = false;

			if ( 'server' === timeToUse ) {
				utcOffset = optinVars.time.wp_gmt_offset;

			} else {

				const customTimezone = settings.custom_timezone;

				// It's using a manual UTC offset.
				if ( customTimezone.includes( 'UTC' ) ) {

					const selectedOffset = customTimezone.replace( 'UTC', '' );

					// There's a timezone with the value "UTC".
					utcOffset = selectedOffset.length ? parseFloat( selectedOffset ) : 0;

				} else {
					const endMoment = moment.tz( dateString, 'MM/DD/YYYY hh:mm aa', customTimezone );
					endTimestamp = endMoment.format( 'x' );
				}
			}

			// Calculate the timestamp with the manual offset.
			if ( false === endTimestamp && false !== utcOffset ) {

				let offset = 60 * utcOffset,
					sign = 0 < offset ? '+' : '-',
					abs = Math.abs( offset ),
					formattedOffset = sprintf( '%s%02d:%02d', sign, abs / 60, abs % 60 );;

				const endMoment = moment.parseZone( dateString + ' ' + formattedOffset, 'MM/DD/YYYY hh:mm a Z' );
				endTimestamp = endMoment.format( 'x' );
			}

			// Check if the end time already passed.
			if ( currentTime > endTimestamp ) {
				return true;
			}
			return false;
		},

		viewChanged: function( model ) {

			var changed = model.changed;

			if ( 'on_scroll' in changed ) {
				let $scrolledContentDiv = this.$( '#hustle-on-scroll--scrolled-toggle-wrapper' ),
					$selectorContentDiv = this.$( '#hustle-on-scroll--selector-toggle-wrapper' );

				if ( $scrolledContentDiv.length || $selectorContentDiv.length ) {
					if ( 'scrolled' === changed.on_scroll ) {
						$scrolledContentDiv.removeClass( 'sui-hidden' );
						$selectorContentDiv.addClass( 'sui-hidden' );
					} else {
						$selectorContentDiv.removeClass( 'sui-hidden' );
						$scrolledContentDiv.addClass( 'sui-hidden' );
					}
				}
			}

			if ( 'on_submit' in changed ) {
				let $toggleDiv = this.$( '#hustle-on-submit-delay-wrapper' );
				if ( $toggleDiv.length ) {
					if ( 'nothing' !== changed.on_submit ) {
						$toggleDiv.removeClass( 'sui-hidden' );
					} else {
						$toggleDiv.addClass( 'sui-hidden' );
					}
				}

			}

		}

	});
});

Hustle.define( 'Mixins.Module_Content', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-wizard-content',

		events: {},

		init( opts ) {
			this.model = new opts.BaseModel( optinVars.current.content || {});
			this.moduleType  = optinVars.current.data.module_type;

			this.listenTo( this.model, 'change', this.modelUpdated );

			this.render();
		},

		render() {

			this.renderFeaturedImage();

			if ( 'true' ===  Module.Utils.getUrlParam( 'new' ) ) {
				Module.Notification.open( 'success', optinVars.messages.commons.module_created.replace( /{type_name}/g, optinVars.module_name[ this.moduleType ]), 10000 );
			}
		},

		renderFeaturedImage() {

			if ( ! this.$( '#wph-wizard-choose_image' ).length ) {
				return;
			}

			const MediaHolder = Hustle.get( 'Featured_Image_Holder' );
			this.mediaHolder = new MediaHolder({
				model: this.model,
				attribute: 'feature_image',
				moduleType: this.moduleType
			});
		},

		modelUpdated( model ) {
			let changed = model.changed;

			// Update module_name from the model when changed.
			if ( 'module_name' in changed ) {
				this.model.set( 'module_name', changed.module_name, { silent: true });
			}
			if ( 'feature_image' in changed ) {

				// Uploading a featured image makes the "Featured Image settings" show up in the "Appearance" tab.
				Hustle.Events.trigger( 'modules.view.feature_image_updated', changed );
			}
		}
	});
});

Hustle.define( 'Mixins.Module_Design', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-wizard-appearance',

		cssEditor: false,

		events: {
			'click .hustle-css-stylable': 'insertSelector',
			'click .hustle-reset-color-palette': 'resetPickers'
		},

		init( opts ) {

			this.model = new opts.BaseModel( optinVars.current.design || {});

			this.listenTo( this.model, 'change', this.viewChanged );

			// Update the Appearance tab view when "Feature image" is changed in the Content tab.
			Hustle.Events.off( 'modules.view.feature_image_updated' ).on( 'modules.view.feature_image_updated', $.proxy( this.ViewChangedContentTab, this ) );

			this.render();
		},

		render() {

			this.createPickers();
			this.addCreatePalettesLink();

			this.createEditor();
			this.cssChange();
		},

		// ============================================================
		// Color Pickers
		createPickers: function() {

			var self = this,
				$suiPickerInputs = this.$( '.sui-colorpicker-input' );

			$suiPickerInputs.wpColorPicker({

				change: function( event, ui ) {
					var $this = $( this );

					// Prevent the model from being marked as changed on load.
					if ( $this.val() !== ui.color.toCSS() ) {
						$this.val( ui.color.toCSS() ).trigger( 'change' );
					}
				},
				palettes: [
					'#333333',
					'#FFFFFF',
					'#17A8E3',
					'#E1F6FF',
					'#666666',
					'#AAAAAA',
					'#E6E6E6'
				]
			});

			if ( $suiPickerInputs.hasClass( 'wp-color-picker' ) ) {

				$suiPickerInputs.each( function() {

					var $suiPickerInput = $( this ),
						$suiPicker      = $suiPickerInput.closest( '.sui-colorpicker-wrap' ),
						$suiPickerColor = $suiPicker.find( '.sui-colorpicker-value span[role=button]' ),
						$suiPickerValue = $suiPicker.find( '.sui-colorpicker-value' ),
						$suiPickerClear = $suiPickerValue.find( 'button' ),
						$suiPickerType  = 'hex'
						;

					var $wpPicker       = $suiPickerInput.closest( '.wp-picker-container' ),
						$wpPickerButton = $wpPicker.find( '.wp-color-result' ),
						$wpPickerAlpha  = $wpPickerButton.find( '.color-alpha' ),
						$wpPickerClear  = $wpPicker.find( '.wp-picker-clear' )
						;

					// Check if alpha exists
					if ( true === $suiPickerInput.data( 'alpha' ) ) {

						$suiPickerType = 'rgba';

						// Listen to color change
						$suiPickerInput.bind( 'change', function() {

							// Change color preview
							$suiPickerColor.find( 'span' ).css({
								'background-color': $wpPickerAlpha.css( 'background' )
							});

							// Change color value
							$suiPickerValue.find( 'input' ).val( $suiPickerInput.val() );

						});

					} else {

						// Listen to color change
						$suiPickerInput.bind( 'change', function() {

							// Change color preview
							$suiPickerColor.find( 'span' ).css({
								'background-color': $wpPickerButton.css( 'background-color' )
							});

							// Change color value
							$suiPickerValue.find( 'input' ).val( $suiPickerInput.val() );

						});
					}

					// Add picker type class
					$suiPicker.find( '.sui-colorpicker' ).addClass( 'sui-colorpicker-' + $suiPickerType );

					// Open iris picker
					$suiPicker.find( '.sui-button, span[role=button]' ).on( 'click', function( e ) {

						$wpPickerButton.click();

						e.preventDefault();
						e.stopPropagation();

					});

					// Clear color value
					$suiPickerClear.on( 'click', function( e ) {

						let inputName = $suiPickerInput.data( 'attribute' ),
							selectedStyle = self.model.get( 'color_palette' ),
							resetValue = optinVars.palettes[ selectedStyle ][ inputName ];

						$wpPickerClear.click();
						$suiPickerValue.find( 'input' ).val( resetValue );
						$suiPickerInput.val( resetValue ).trigger( 'change' );
						$suiPickerColor.find( 'span' ).css({
							'background-color': resetValue
						});

						e.preventDefault();
						e.stopPropagation();

					});
				});
			}
		},

		updatePickers: function( selectedStyle ) {

			let self = this;

			if ( 'undefined' !== typeof optinVars.palettes[ selectedStyle ]) {

				let colors = optinVars.palettes[ selectedStyle ];

				// update color palettes
				_.each( colors, function( color, key ) {
					self.$( 'input[data-attribute="' + key + '"]' ).val( color ).trigger( 'change' );
				});
			}

			// TODO: else, display an error message.
		},

		resetPickers: function( e ) {
			let $el = $( e.target );
			$el.addClass( 'sui-button-onload' ).prop( 'disabled', true );

			let style = $( 'select[data-attribute="color_palette"]' ).val();
			this.updatePickers( style );

			setTimeout( function() {
				$el.removeClass( 'sui-button-onload' ).prop( 'disabled', false );
			}, 500 );
		},

		/**
		 * Add the "Create custom palette button" to the existing palettes dropdown.
		 * @since 4.0.3
		 */
		addCreatePalettesLink() {

			const $link = this.$( '#hustle-create-palette-link' ),
				$selectPaletteContainer = this.$( '.select-container.hui-select-palette .list-results' ),
				$selectButton = $selectPaletteContainer.find( '.hui-button' );

			if ( ! $selectButton.length ) {
				$selectPaletteContainer.append( $link );
			}

		},

		// ============================================================
		// CSS Editor
		createEditor: function() {

			this.cssEditor = ace.edit( 'hustle_custom_css' );

			this.cssEditor.getSession().setMode( 'ace/mode/css' );
			this.cssEditor.$blockScrolling = Infinity;
			this.cssEditor.setTheme( 'ace/theme/sui' );
			this.cssEditor.getSession().setUseWrapMode( true );
			this.cssEditor.getSession().setUseWorker( false );
			this.cssEditor.setShowPrintMargin( false );
			this.cssEditor.renderer.setShowGutter( true );
			this.cssEditor.setHighlightActiveLine( true );

		},

		updateCustomCss: function() {

			if ( this.cssEditor ) {
				this.model.set( 'custom_css', this.cssEditor.getValue() );
			}
		},

		cssChange: function() {
			var self = this;
			this.cssEditor.getSession().on( 'change', function() {
				self.model.userHasChange();
			});
		},

		insertSelector: function( e ) {

			var $el = $( e.target ),
				stylable = $el.data( 'stylable' ) + '{}';

			this.cssEditor.navigateFileEnd();
			this.cssEditor.insert( stylable );
			this.cssEditor.navigateLeft( 1 );
			this.cssEditor.focus();

			e.preventDefault();

		},

		// ============================================================
		// Adjust the view when model is updated
		viewChanged: function( model ) {

			let changed = model.changed;

			// Show or hide the positions available for each form layout.
			if ( 'form_layout' in changed ) {

				let $divSection  = this.$( '#hustle-feature-image-position-option' ),
					$targetAbove = this.$( '#hustle-feature-image-above-label' ),
					$targetBelow = this.$( '#hustle-feature-image-below-label' )
					;

				if ( $targetAbove.length || $targetBelow.length ) {

					if ( 'one' === changed.form_layout ) {
						$targetAbove.removeClass( 'sui-hidden' );
						$targetBelow.removeClass( 'sui-hidden' );

					} else {
						let $imgPosition = model.get( 'feature_image_position' );

						if ( 'left' !== $imgPosition && 'right' !== $imgPosition ) {
							$divSection.find( 'input' ).prop( 'checked', false );
							$divSection.find( '#hustle-feature-image-left' ).prop( 'checked', true );
							this.model.set( 'feature_image_position', 'left' );
							$divSection.find( '.sui-tab-item' ).removeClass( 'active' );
							$divSection.find( '#hustle-feature-image-left-label' ).addClass( 'active' );
						}

						$targetAbove.addClass( 'sui-hidden' );
						$targetBelow.addClass( 'sui-hidden' );

					}
				}
			}

			// Styles
			if ( 'color_palette' in changed ) {
				this.updatePickers( changed.color_palette );
			}

			if ( 'feature_image_horizontal' in changed ) {

				let $target = this.$( '#hustle-image-custom-position-horizontal' );

				if ( $target.length ) {

					if ( 'custom' !== changed.feature_image_horizontal ) {
						$target.prop( 'disabled', true );
					} else {
						$target.prop( 'disabled', false );
					}
				}
			} else if ( 'feature_image_vertical' in changed ) {

				let $target = this.$( '#hustle-image-custom-position-vertical' );

				if ( $target.length ) {

					if ( 'custom' !== changed.feature_image_vertical ) {
						$target.prop( 'disabled', true );
					} else {
						$target.prop( 'disabled', false );
					}
				}
			}
		},

		// Handle the changes on the Appearance tab due to Content tab changes
		ViewChangedContentTab( changed ) {

			if ( 'feature_image' in changed ) {

				let $divPlaceholder = this.$( '#hustle-appearance-feature-image-placeholder' ),
					$divSettings = this.$( '#hustle-appearance-feature-image-settings' )
					;

				if ( $divPlaceholder.length && $divSettings.length ) {

					if ( changed.feature_image ) {

						// Hide feature image settings.
						$divSettings.show();

						// Hide disabled message
						$divPlaceholder.hide();

					} else {

						// Hide feature image settings.
						$divSettings.hide();

						// Show disabled message.
						$divPlaceholder.show();

					}
				}
			}
		}
	});
});

Hustle.define( 'Mixins.Module_Display', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-wizard-display',

		events: {},

		init( opts ) {

			this.model = new opts.BaseModel( optinVars.current.display || {});
			this.moduleType  = optinVars.current.data.module_type;

			this.listenTo( this.model, 'change', this.viewChanged );

			// Called just to trigger the "view.rendered" action.
			this.render();
		},

		render() {},

		viewChanged( model ) {}

	});
});

Hustle.define( 'Mixins.Module_Emails', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-wizard-emails',

		events: {
			'click .hustle-optin-field--add': 'addFields',
			'click .hustle-optin-field--edit': 'editField',
			'click .sui-builder-field': 'maybeEditField',
			'click .hustle-optin-field--delete': 'deleteFieldOnClick',
			'click ul.list-results li': 'setFieldOption',
			'click .hustle-optin-field--copy': 'duplicateField'
		},

		init( opts ) {
			this.model = new opts.BaseModel( optinVars.current.emails || {});
			this.listenTo( this.model, 'change', this.viewChanged );

			this.render();
		},

		render() {
			let self = this,
				formElements = this.model.get( 'form_elements' );

			// Add the already stored form fields to the panel.
			for ( let fieldId in formElements ) {
				let field = formElements[ fieldId ];

				// Assign the defaults for the field, in case there's anything missing.
				formElements[ fieldId ] = _.extend({}, this.getFieldDefaults( field.type ), field );

				// Submit is already at the bottom of the panel. We don't want to add it again.
				if ( 'submit' === fieldId ) {
					continue;
				}
				self.addFieldToPanel( formElements[ fieldId ]);
			}

			// update form_elements for having default properties if they were lost for some reason
			this.model.set( 'form_elements', formElements, { silent: true });

			// Initiate the sortable functionality to sort form fields' order.
			let sortableContainer = this.$( '#hustle-form-fields-container' ).sortable({
				axis: 'y',
				containment: '.sui-box-builder'
			});

			sortableContainer.on( 'sortupdate', $.proxy( self.fieldsOrderChanged, self, sortableContainer ) );

			this.updateDynamicValueFields();

			return this;
		},

		//reset all field selects
		resetDynamicValueFieldsPlaceholders() {

			this.$( 'select.hustle-field-options' ).html( '' );

			if ( this.$( '.hustle-fields-placeholders-options' ).length ) {
				this.$( '.hustle-fields-placeholders-options' ).html( '' );
			}
		},

		//update all field selects
		updateDynamicValueFields() {
			let formElements = this.model.get( 'form_elements' );

			this.resetDynamicValueFieldsPlaceholders();

			for ( let fieldId in formElements ) {

				if ( 'submit' === fieldId || 'recaptcha' === fieldId || 'gdpr' === fieldId ) {
					continue;
				}

				this.addFieldToDynamicValueFields( formElements[ fieldId ]);
				this.$( 'select.hustle-field-options' ).trigger( 'sui:change' );

			}

			//set info notice for empty dynamic fields select
			this.$( 'div.select-list-container .list-results:empty' ).each( function() {
				let fieldType = $( this ).closest( '.select-container' ).find( 'select.hustle-field-options' ).data( 'type' );
				$( this ).html( '<li style="cursor: default; pointer-events: none;">' + optinVars.messages.form_fields.errors.no_fileds_info.replace( '{field_type}', fieldType ) + '</li>' );
			});

		},

		/**
		 * Assign the new field order to the model. Triggered when the fields are sorted.
		 * @since 4.0
		 * @param jQuery sortable object
		 */
		fieldsOrderChanged( sortable ) {

			let formElements = this.model.get( 'form_elements' ),
				newOrder = sortable.sortable( 'toArray', { attribute: 'data-field-id' }),
				orderedFields = {};

			for ( let id of newOrder ) {
				orderedFields[ id ] = formElements[ id ] ;
			}

			orderedFields = _.extend({}, orderedFields, formElements );

			this.model.set( 'form_elements', orderedFields );

		},

		/**
		 * Handle the changes in the view when the model is updated.
		 * @since 4.0
		 * @param emails_model model
		 */
		viewChanged( model ) {
			var changed = model.changed;

			// Show or hide the content dependent of auto_close_success_message.
			if ( 'auto_close_success_message' in changed ) {
				let $targetDiv = this.$( '#section-auto-close-success-message .sui-row' );

				if ( $targetDiv.length ) {
					if ( '1' === changed.auto_close_success_message ) {
						$targetDiv.removeClass( 'sui-hidden' );
					} else {
						$targetDiv.addClass( 'sui-hidden' );
					}
				}

			}

			if ( 'form_elements' in changed ) {
				this.updateDynamicValueFields();
			}

		},

		/**
		 * Open the "Add new fields" modal.
		 * @since 4.0
		 */
		addFields() {

			let OptinFieldsModalView = Hustle.get( 'Modals.Optin_Fields' ),
				newFieldModal = new OptinFieldsModalView();

			// Create the fields and append them to panel.
			newFieldModal.on( 'fields:added', $.proxy( this.addNewFields, this ) );

			// Show dialog
			SUI.dialogs['hustle-dialog--optin-fields'].show();

		},

		maybeEditField( e ) {
			let $ct = $( e.target );

			if ( ! $ct.closest( '.sui-dropdown' ).length ) {
				this.editField( e );
			}

		},

		/**
		 * Open the "edit field" modal.
		 * @since 4.0
		 * @param event e
		 */
		editField( e ) {

			let $button = $( e.target ),
				fieldId = $button.closest( '.sui-builder-field' ).data( 'field-id' ),
				existingFields = this.model.get( 'form_elements' ),
				field = existingFields[ fieldId ],
				fieldData = Object.assign({}, this.getFieldViewDefaults( field.type ), field ),
				EditFieldModalView = Hustle.get( 'Modals.Edit_Field' ),
				editModalView = new EditFieldModalView({
					field,
					fieldData,
					model: this.model
				});

			editModalView.on( 'field:updated', $.proxy( this.formFieldUpdated, this ) );

			// Show dialog
			SUI.dialogs['hustle-dialog--edit-field'].show();

		},

		/**
		 * Update the appearance of the form field row of the field that was updated.
		 * @since 4.0
		 * @param object updatedField Object with the properties of the updated field.
		 */
		formFieldUpdated( updatedField, changed, oldField ) {

			if ( ! Object.keys( changed ).length ) {
				return;
			}

			// Name is the unique identifier.
			// If it changed, update the existing fields removing the old one and creating a new one.
			if ( 'name' in changed ) {
				this.addNewFields( updatedField.type, updatedField, oldField.name );
				this.deleteField( oldField.name );
				return;
			}

			let $fieldRow = this.$( '#hustle-optin-field--' + updatedField.name );

			if ( 'required' in changed ) {

				let $requiredTag = $fieldRow.find( '.sui-error' ),
					isRequired = updatedField.required;

				// Show the "required" asterisk to this field's row.
				if ( _.isTrue( isRequired ) ) {
					$requiredTag.show();

				} else if (  _.isFalse( isRequired ) ) {

					// Hide the "required" asterisk to this field's row.
					$requiredTag.hide();
				}

			}

			if ( 'label' in changed ) {

				this.updateDynamicValueFields();

				let $labelWrapper = $fieldRow.find( '.hustle-field-label-text' );
				$labelWrapper.text( updatedField.label );
			}

		},

		deleteFieldOnClick( e ) {

			let $button = $( e.target ),
				fieldName = $button.closest( '.sui-builder-field' ).data( 'field-id' );

			this.deleteField( fieldName );
		},

		setFieldOption( e ) {
			let $li = $( e.target ),
				val = $li.find( 'span:eq(1)' ).text(),
				$input = $li.closest( '.sui-insert-variables' ).find( 'input[type="text"]' );

			$input.val( val ).trigger( 'change' );
		},

		deleteField( fieldName ) {

			let $fieldRow = this.$( '#hustle-optin-field--' + fieldName ),
				formElements = Object.assign({}, this.model.get( 'form_elements' ) );

			delete formElements[ fieldName ];

			this.model.set( 'form_elements', formElements );

			if ( -1 !== jQuery.inArray( fieldName, [ 'gdpr', 'recaptcha' ]) ) {
				$fieldRow.addClass( 'sui-hidden' );
				$( '#hustle-optin-insert-field--' + fieldName ).prop( 'disabled', false ).prop( 'checked', false );
			} else {
				$fieldRow.remove();
			}
		},

		duplicateField( e ) {

			let $button = $( e.target ),
				fieldId = $button.closest( '.sui-builder-field' ).data( 'field-id' ),
				formElements = Object.assign({}, this.model.get( 'form_elements' ) ),
				duplicatedField = Object.assign({}, formElements[ fieldId ]);

			// Remove 'name' because it should be an unique identifier. Will be added in 'add_new_fields'.
			delete duplicatedField.name;

			// Make the field deletable because it can't be deleted otherwise, and you'll have it stuck forevah.
			duplicatedField.can_delete = true; // eslint-disable-line camelcase

			this.addNewFields( duplicatedField.type, duplicatedField );
		},

		/**
		 * Used to add new fields.
		 * When using form_fields, make sure only 1 type of each field is added.
		 * In other words, use field.type as an unique identifier.
		 * @since 4.0
		 * @param array|string form_fields
		 * @param object form_fields_data
		 */
		addNewFields( formFields, formFieldsData, after = null ) {
			let self = this,
				existingFields = Object.assign({}, this.model.get( 'form_elements' ) );
			if ( Array.isArray( formFields ) ) {
				for ( let field of formFields ) {
					let fieldData = self.getFieldDefaults( field );
					if ( formFieldsData && field in formFieldsData ) {
						_.extend( fieldData, formFieldsData[ field ]);
					}
					self.addFieldToPanel( fieldData );
					existingFields[ fieldData.name ] = fieldData;
				}
			} else {
				let fieldData = self.getFieldDefaults( formFields );
				if ( formFieldsData ) {
					_.extend( fieldData, formFieldsData );
				}
				self.addFieldToPanel( fieldData, after );
				if ( null === after ) {
					existingFields[ fieldData.name ] = fieldData;
				} else {
					let reorderExistingFields = [];
					jQuery.each( existingFields, function( index, data ) {
						reorderExistingFields[ index ] = data;
						if ( index === after ) {
							reorderExistingFields[ fieldData.name ] = fieldData;
						}
					});
					existingFields = reorderExistingFields;
				}
			}
			this.model.set( 'form_elements', existingFields );
		},

		/**
		 * Add a field to the fields with dynamic values for the automated emails.
		 * The field object must have all its core prop assigned. The views prop are assigned here.
		 * @since 4.0
		 * @param object field
		 */
		addFieldToDynamicValueFields( field ) {
			let option = $( '<option/>', {
				value: field.name,
				'data-content': '{' + field.name + '}'
			}).text( field.label ),
				listOption = `<li><button value="{${field.name}}">${field.label}</button></li>`;

			this.$( 'select.hustle-field-options:not([data-type]), select.hustle-field-options[data-type="' + field.type + '"]' ).append( option );

			if ( this.$( '.hustle-fields-placeholders-options' ).length ) {
				this.$( '.hustle-fields-placeholders-options' ).append( listOption );
			}
		},

		/**
		 * Add a field to the fields pannel.
		 * The field object must have all its core prop assigned. The views prop are assigned here.
		 * @since 4.0
		 * @param object field
		 */
		addFieldToPanel( field, after = null ) {
			let template = Optin.template( 'hustle-form-field-row-tpl' ),
				$fieldsContainer = this.$( '#hustle-form-fields-container' );
			field = _.extend({}, this.getFieldViewDefaults( field.type ), field );
			if ( -1 !== jQuery.inArray( field.type, [ 'gdpr', 'recaptcha' ]) ) {
				this.$( '#hustle-optin-field--' + field.type ).removeClass( 'sui-hidden' );
				$( '#hustle-optin-insert-field--' + field.type ).prop( 'checked', true ).prop( 'disabled', true );
			} else {
				if ( null === after ) {
					$fieldsContainer.append( template( field ) );
				} else {
					let $el = this.$( '#hustle-optin-field--' + after );
					if ( 0 < $el.length ) {
						$el.after( template( field ) );
					} else {
						$fieldsContainer.append( template( field ) );
					}
				}
			}
		},

		getNewFieldId( fieldName ) {
			let existingFields = Object.assign({}, this.model.get( 'form_elements' ) ),
				fieldId = fieldName;
			while ( fieldId in existingFields && -1 === jQuery.inArray( fieldId, [ 'gdpr', 'recaptcha', 'submit' ]) ) {
				fieldId = fieldName + '-' + Math.floor( Math.random() * 99 );
			}
			return fieldId;
		},

		/**
		 * Retrieve the default settings for each field type.
		 * These are going to be stored.
		 * @since 4.0
		 * @param string field_type. The field type.
		 */
		getFieldDefaults( fieldType ) {
			let fieldId = this.getNewFieldId( fieldType ),
				defaults = {
					label: optinVars.messages.form_fields.label[fieldType + '_label'],
					required: 'false',
					'css_classes': '',
					type: fieldType,
					name: fieldId,
					'required_error_message': optinVars.messages.required_error_message.replace( '{field}', fieldType ),
					'validation_message': optinVars.messages.validation_message.replace( '{field}', fieldType ),
					placeholder: ''
				};

				switch ( fieldType ) {
					case 'timepicker':
						defaults.time_format = '12'; // eslint-disable-line camelcase
						defaults.time_hours = '9'; // eslint-disable-line camelcase
						defaults.time_minutes = '30'; // eslint-disable-line camelcase
						defaults.time_period = 'am'; // eslint-disable-line camelcase
						defaults.validation_message = optinVars.messages.time_validation_message; // eslint-disable-line camelcase
						defaults.required_error_message = optinVars.messages.is_required.replace( '{field}', defaults.label ); // eslint-disable-line camelcase
						defaults.validate = 'false';
						break;
					case 'datepicker':
						defaults.date_format = 'mm/dd/yy'; // eslint-disable-line camelcase
						defaults.validation_message = optinVars.messages.date_validation_message; // eslint-disable-line camelcase
						defaults.required_error_message = optinVars.messages.is_required.replace( '{field}', defaults.label ); // eslint-disable-line camelcase
						defaults.validate = 'false';
						break;
					case 'recaptcha':
						defaults.threshold = '0.5'; // eslint-disable-line camelcase
						defaults.version = 'v2_checkbox'; // eslint-disable-line camelcase
						defaults.recaptcha_type = 'compact'; // eslint-disable-line camelcase
						defaults.recaptcha_theme = 'light'; // eslint-disable-line camelcase
						defaults.v2_invisible_theme = 'light'; // eslint-disable-line camelcase
						defaults.recaptcha_language = 'automatic'; // eslint-disable-line camelcase
						defaults.v2_invisible_show_badge = '1'; // eslint-disable-line camelcase
						defaults.v2_invisible_badge_replacement = optinVars.messages.form_fields.recaptcha_badge_replacement; // eslint-disable-line camelcase
						defaults.v3_recaptcha_show_badge = '1'; // eslint-disable-line camelcase
						defaults.v3_recaptcha_badge_replacement = optinVars.messages.form_fields.recaptcha_badge_replacement; // eslint-disable-line camelcase
						defaults.validation_message = optinVars.messages.recaptcha_validation_message; // eslint-disable-line camelcase
						defaults.error_message = optinVars.messages.form_fields.recaptcha_error_message; // eslint-disable-line camelcase
						break;
					case 'gdpr':
						defaults.gdpr_message = optinVars.messages.form_fields.gdpr_message; // eslint-disable-line camelcase
						defaults.required = 'true';
						defaults.required_error_message = optinVars.messages.gdpr_required_error_message; // eslint-disable-line camelcase
						break;
					case 'email':
						defaults.validate = 'true';
						break;
					case 'url':
						defaults.required_error_message = optinVars.messages.url_required_error_message; // eslint-disable-line camelcase
						defaults.validate = 'true';
						break;
					case 'phone':
						defaults.validate = 'false';
						break;
					case 'hidden':
						defaults.default_value = ''; // eslint-disable-line camelcase
						defaults.custom_value = ''; // eslint-disable-line camelcase
						break;
					case 'number':
					case 'text':
						defaults.required_error_message = optinVars.messages.cant_empty; // eslint-disable-line camelcase
						break;
				}

			return defaults;

		},

		/**
		 * Retrieve the defaults for each field type's setting view.
		 * These settings are intended to display the proper content of each field
		 * in the wizard settings. These won't be stored.
		 * @since 4.0
		 * @param string field_type. The field type.
		 */
		getFieldViewDefaults( fieldType ) {

			let defaults = {
				required: 'false',
				validated: 'false',
				'placeholder_placeholder': optinVars.messages.form_fields.label.placeholder,
				'label_placeholder': '',
				'name_placeholder': '',
				icon: 'send',
				'css_classes': '',
				type: fieldType,
				name: fieldType,
				placeholder: optinVars.messages.form_fields.label[fieldType + '_placeholder'],
				'can_delete': true,
				fieldId: this.getNewFieldId( fieldType )
			};

			switch ( fieldType ) {
				case 'email':
					defaults.icon = 'mail';
					break;
				case 'name':
					defaults.icon = 'profile-male';
					break;
				case 'phone':
					defaults.icon = 'phone';
					break;
				case 'address':
					defaults.icon = 'pin';
					break;
				case 'url':
					defaults.icon = 'web-globe-world';
					break;
				case 'text':
					defaults.icon = 'style-type';
					break;
				case 'number':
					defaults.icon = 'element-number';
					break;
				case 'timepicker':
					defaults.icon = 'clock';
					break;
				case 'datepicker':
					defaults.icon = 'calendar';
					break;
				case 'recaptcha':
					defaults.icon = 'recaptcha';
					break;
				case 'gdpr':
					defaults.icon = 'gdpr';
					break;
				case 'hidden':
					defaults.icon = 'eye-hide';
					break;

			}

			return defaults;

		}
	});
});

Hustle.define( 'Module.IntegrationsView', function( $, doc, win ) {
	'use strict';

	const integrationsView = Hustle.View.extend( _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-box-section-integrations',

		events: {
			'click .connect-integration': 'connectIntegration',
			'keypress .connect-integration': 'preventEnterKeyFromDoingThings'
		},

		init( opts ) {
			this.model = new opts.BaseModel( optinVars.current.integrations_settings || {});
			this.moduleId = optinVars.current.data.module_id;
			this.listenTo( Hustle.Events, 'hustle:providers:reload', this.renderProvidersTables );
			this.render();
		},

		render() {
			let $notConnectedWrapper = this.$el.find( '#hustle-not-connected-providers-section' ),
				$connectedWrapper = this.$el.find( '#hustle-connected-providers-section' );

			if ( 0 < $notConnectedWrapper.length && 0 < $connectedWrapper.length ) {
				this.renderProvidersTables();
			}

		},

		renderProvidersTables() {

			var self = this,
				data = {}
			;

			// Add preloader
			this.$el.find( '.hustle-integrations-display' )
				.html(
					'<div class="sui-notice sui-notice-sm sui-notice-loading">' +
						'<p>' + optinVars.fetching_list + '</p>' +
					'</div>'
				);

			data.action      = 'hustle_provider_get_form_providers';
			data._ajax_nonce = optinVars.providers_action_nonce; // eslint-disable-line camelcase
			data.data = {
				moduleId: this.moduleId
			};

			const ajax = $.post({
				url: ajaxurl,
				type: 'post',
				data: data
			})
			.done( function( result ) {
				if ( result && result.success ) {
					const $activeIntegrationsInput = self.$el.find( '#hustle-integrations-active-integrations' ),
						$activeIntegrationsCount = self.$el.find( '#hustle-integrations-active-count' );

					self.$el.find( '#hustle-not-connected-providers-section' ).html( result.data.not_connected );
					self.$el.find( '#hustle-connected-providers-section' ).html( result.data.connected );

					// Prevent marking the model as changed on load.
					if ( $activeIntegrationsInput.val() !== result.data.list_connected ) {
						$activeIntegrationsInput.val( result.data.list_connected ).trigger( 'change' );
					}

					// Prevent marking the model as changed on load.
					if ( $activeIntegrationsCount.val() !== String( result.data.list_connected_total ) ) {
						$activeIntegrationsCount.val( result.data.list_connected_total ).trigger( 'change' );
					}
				}
			});

			// Remove preloader
			ajax.always( function() {
				self.$el.find( '.sui-box-body' ).removeClass( 'sui-block-content-center' );
				self.$el.find( '.sui-notice-loading' ).remove();
			});
		},

		// Prevent the enter key from opening integrations modals and breaking the page.
		preventEnterKeyFromDoingThings( e ) {
			if ( 13 === e.which ) { // the enter key code
				e.preventDefault();
				return;
			}
		},

		connectIntegration( e ) {
			Module.integrationsModal.open( e );
		}

	}) );

	return integrationsView;
});

Hustle.define( 'Mixins.Module_Visibility', function( $, doc, win ) {

	'use strict';

	return _.extend({}, Hustle.get( 'Mixins.Model_Updater' ), {

		el: '#hustle-conditions-group',

		events: {

			'click .hustle-add-new-visibility-group': 'addNewGroup',
			'click .hustle-choose-conditions': 'openConditionsModal',
			'click .hustle-remove-visibility-group': 'removeGroup',
			'change .visibility-group-filter-type': 'updateAttribute',

			'change .visibility-group-show-hide': 'updateAttribute',
			'change .visibility-group-apply-on': 'updateGroupApplyOn'
		},

		init( opts ) {

			const Model = opts.BaseModel.extend({
					defaults: { conditions: '' },
					initialize: function( data ) {

						_.extend( this, data );

						if ( ! ( this.get( 'conditions' ) instanceof Backbone.Model ) ) {

							/**
							 * Make sure conditions is not an array
							 */
							if ( _.isEmpty( this.get( 'conditions' ) ) && _.isArray( this.get( 'conditions' ) )  ) {
								this.conditions = {};
							}

							let hModel = Hustle.get( 'Model' );
							this.set( 'conditions', new hModel( this.conditions ), { silent: true });
						}
					}
				});

			this.model = new Model( optinVars.current.visibility || {});

			this.moduleType = optinVars.current.data.module_type;
			this.activeConditions = {};
			this.render();
			$( '#hustle-general-conditions' ).on( 'click',  $.proxy( this.switchConditions, this ) );
			$( '#hustle-wc-conditions' ).on( 'click',  $.proxy( this.switchConditions, this ) );
            this.groupId = '';
		},

		render() {

			let self = this,
				groups = this.model.get( 'conditions' ).toJSON();

			if ( ! $.isEmptyObject( groups ) ) {

				for ( let groupId in groups ) {

					let group = this.model.get( 'conditions.' + groupId );

					if ( ! ( group instanceof Backbone.Model ) ) {

						// Make sure it's not an array
						if ( _.isEmpty( group ) && _.isArray( group )  ) {
							group = {};
						}

						group = this.getConditionsGroupModel( group );

						self.model.set( 'conditions.' + groupId, group, { silent: true });
					}

					this.addGroupToPanel( group, 'render' );

				}

			} else {
				this.addNewGroup();
			}

		},

		afterRender() {
			this.bindRemoveConditions();
		},

		bindRemoveConditions() {

			// Remove condition
			$( '#hustle-conditions-group .hustle-remove-visibility-condition' ).off( 'click' ).on( 'click', $.proxy( this.removeCondition, this ) );

		},

		openConditionsModal( e ) {

			let self = this,
				$this = $( e.currentTarget ),
				groupId = $this.data( 'group-id' ),
				savedConditions = this.model.get( 'conditions.' + groupId ),
				groupConditions = 'undefined' !== typeof savedConditions ? Object.keys( savedConditions.toJSON() ) : [],
				VisibilityModalView = Hustle.get( 'Modals.Visibility_Conditions' ),
				visibilityModal = new VisibilityModalView({
					groupId: groupId,
					conditions: groupConditions
				});

			visibilityModal.on( 'conditions:added', $.proxy( self.addNewConditions, self ) );

			this.groupId = groupId;

			// Show dialog

			if ( 'done' !== $( 'html' ).data( 'show-was-bind' ) ) {
				SUI.dialogs['hustle-dialog--visibility-options'].on( 'show', function( dialogEl ) {
					$( '#hustle-add-conditions' ).data( 'group_id', self.groupId );
				});
				$( 'html' ).data( 'show-was-bind', 'done' );
			}
			SUI.dialogs['hustle-dialog--visibility-options'].show();

		},

		addNewConditions( args ) {

			let self = this,
				groupId = args.groupId,
				conditions = args.conditions,
				group = this.model.get( 'conditions.' + groupId );

			$.each( conditions, ( i, id ) => {
				if ( group.get( id ) ) {

					// If this condition is already set for this group, abort. Prevent duplicated conditions in a group.
					return true;
				}

				self.addConditionToPanel( id, {}, groupId, group, 'new' );
			});

			this.bindRemoveConditions();

			Hustle.Events.trigger( 'view.rendered', this );

		},

		addGroupToPanel( group, source ) {

			// Render this group container.
			let groupId = group.get( 'group_id' ),
				targetContainer = $( '#hustle-visibility-conditions-box' ),
				_template = Optin.template( 'hustle-visibility-group-box-tpl' ),

				html = _template( _.extend({}, {
					groupId,
					apply_on_floating: group.get( 'apply_on_floating' ), // eslint-disable-line camelcase
					apply_on_inline: group.get( 'apply_on_inline' ), // eslint-disable-line camelcase
					apply_on_widget: group.get( 'apply_on_widget' ), // eslint-disable-line camelcase
					apply_on_shortcode: group.get( 'apply_on_shortcode' ), // eslint-disable-line camelcase
					show_or_hide_conditions: group.get( 'show_or_hide_conditions' ), // eslint-disable-line camelcase
					filter_type: group.get( 'filter_type' ) // eslint-disable-line camelcase
				}) );

			$( html ).insertBefore( targetContainer.find( '.hustle-add-new-visibility-group' ) );

			this.activeConditions[ groupId ] = {};

			// Render each of this group's conditions.
			let self = this,
				conditions = group.toJSON();

			$.each( conditions, function( id, condition ) {

				if ( 'object' !== typeof condition ) {

					// If this property is not an actual condition, like "group_id", or "filter_type",
					// continue. Check the next property as this isn't the condition we want to render.
					return true;
				}

				self.addConditionToPanel( id, condition, groupId, group, source );

			});
		},

		addConditionToPanel( id, condition, groupId, group, source ) {

			if ( 'undefined' === typeof Optin.View.Conditions[ id ]) {
				return;
			}

			let $conditionsContainer = this.$( '#hustle-visibility-group-' + groupId + ' .sui-box-builder-body' ),
				thisCondition =  new Optin.View.Conditions[ id ]({
					type: this.moduleType,
					model: group,
					groupId: groupId,
					source
				});

			if ( ! thisCondition ) {
				return;
			}

			// If there aren't other conditions rendered within the group, empty it for adding new conditions.
			if ( ! $conditionsContainer.find( '.sui-builder-field' ).length ) {
				$conditionsContainer.find( '.sui-box-builder-message-block' ).hide();
				$conditionsContainer.find( '.sui-button-dashed' ).show();
			}

			if ( $.isEmptyObject( condition ) ) {
				group.set( id, thisCondition.getConfigs() );
			} else {
				group.set( id, condition );
			}
			this.activeConditions[ groupId ][ id ] = thisCondition;

			$( thisCondition.$el ).appendTo( $conditionsContainer.find( '.sui-builder-fields' ) );

			return thisCondition;
		},

		addNewGroup() {

			let group = this.getConditionsGroupModel(),
				groupId = group.get( 'group_id' );

			this.model.set( 'conditions.' + groupId, group );

			this.addGroupToPanel( group, 'new' );

			Hustle.Events.trigger( 'view.rendered', this );
		},

		switchConditions( e ) {
			e.preventDefault();

			let $this = $( e.currentTarget ),
				currentId = $this.prop( 'id' );

			if ( 'hustle-wc-conditions' === currentId ) {
				$( '#hustle-dialog--visibility-options .general_condition' ).hide();
				$( '#hustle-dialog--visibility-options .wc_condition' ).show();
			} else {
				$( '#hustle-dialog--visibility-options .wc_condition' ).hide();
				$( '#hustle-dialog--visibility-options .general_condition' ).show();
			}
		},

		removeGroup( e ) {

			let groupId = $( e.currentTarget ).data( 'group-id' ),
				$groupContainer = this.$( '#hustle-visibility-group-' + groupId );

			// Remove the group from the model.
			delete this.activeConditions[ groupId ];
			this.model.get( 'conditions' ).unset( groupId );

			// Remove the group container from the page.
			$groupContainer.remove();

			// If the last group was removed, add a new group so the page is not empty.
			if ( ! Object.keys( this.activeConditions ).length ) {
				this.addNewGroup();
			}

		},

		removeCondition( e ) {

			let $this = $( e.currentTarget ),
				conditionId =  $this.data( 'condition-id' ),
				groupId = $this.data( 'group-id' ),
				$conditionsContainer = this.$( '#hustle-visibility-group-' + groupId + ' .sui-box-builder-body' ),
				thisCondition = this.activeConditions[ groupId ][ conditionId ];

			thisCondition.remove();

			delete this.activeConditions[ groupId ][ conditionId ];

			this.model.get( 'conditions.' + groupId ).unset( conditionId );

			if ( ! $conditionsContainer.find( '.sui-builder-field' ).length ) {
				$conditionsContainer.find( '.sui-box-builder-message-block' ).show();
			}

			this.bindRemoveConditions();
		},

		updateAttribute( e ) {

			e.stopPropagation();

			let $this = $( e.target ),
				groupId = $this.data( 'group-id' ),
				attribute = $this.data( 'attribute' ),
				value = $this.val(),
				group = this.model.get( 'conditions.' + groupId );

			group.set( attribute, value );

		},

		updateGroupApplyOn( e ) {

			e.stopPropagation();

			let $this = $( e.target ),
				groupId = $this.data( 'group-id' ),
				attribute = $this.data( 'property' ),
				value = $this.is( ':checked' ),
				group = this.model.get( 'conditions.' + groupId );

			if ( 'embedded' === this.moduleType && -1 !== $.inArray( attribute, [ 'apply_on_inline', 'apply_on_widget', 'apply_on_shortcode' ]) ||
				'social_sharing' === this.moduleType && -1 !== $.inArray( attribute, [ 'apply_on_floating', 'apply_on_inline', 'apply_on_widget', 'apply_on_shortcode' ])
			) {
				group.set( attribute, value );
			}

		},

		getConditionsGroupModel( group ) {

			if ( ! group ) {

				let groupId = ( new Date().getTime() ).toString( 16 );

				if ( 'undefined' !== typeof this.model.get( 'conditions.' + groupId ) ) {

					// TODO: create another group_id while the group id exists.
				}

				group = {
					group_id: groupId, // eslint-disable-line camelcase
					show_or_hide_conditions: 'show', // eslint-disable-line camelcase
					filter_type: 'all' // eslint-disable-line camelcase
				};

				if ( 'embedded' === this.moduleType ) {
					group.apply_on_inline = true; // eslint-disable-line camelcase
					group.apply_on_widget = true; // eslint-disable-line camelcase
					group.apply_on_shortcode = false; // eslint-disable-line camelcase
				} else if ( 'social_sharing' === this.moduleType ) {
					group.apply_on_floating = true; // eslint-disable-line camelcase
					group.apply_on_inline = true; // eslint-disable-line camelcase
					group.apply_on_widget = true; // eslint-disable-line camelcase
					group.apply_on_shortcode = false; // eslint-disable-line camelcase
				}

			} else if ( 'embedded' === this.moduleType && ( ! group.apply_on_inline || ! group.apply_on_widget  || ! group.apply_on_shortcode ) ) {

				if ( ! group.apply_on_inline ) {
					group.apply_on_inline = true; // eslint-disable-line camelcase
				}
				if ( ! group.apply_on_widget ) {
					group.apply_on_widget = true; // eslint-disable-line camelcase
				}
				if ( ! group.apply_on_shortcode ) {
					group.apply_on_shortcode = false; // eslint-disable-line camelcase
				}

			} else if ( 'social_sharing' === this.moduleType && ( ! group.apply_on_floating || ! group.apply_on_inline  || ! group.apply_on_widget || ! group.apply_on_shortcode ) ) {

				if ( ! group.apply_on_floating ) {
					group.apply_on_floating = true; // eslint-disable-line camelcase
				}
				if ( ! group.apply_on_inline ) {
					group.apply_on_inline = true; // eslint-disable-line camelcase
				}
				if ( ! group.apply_on_widget ) {
					group.apply_on_widget = true; // eslint-disable-line camelcase
				}
				if ( ! group.apply_on_shortcode ) {
					group.apply_on_shortcode = false; // eslint-disable-line camelcase
				}

			}

			let hModel = Hustle.get( 'Model' ),
				groupModel = new hModel( group );

			return groupModel;
		}

	});
});

Hustle.define( 'Mixins.Wizard_View', function( $, doc, win ) {

	'use strict';

	return {

		moduleType: '',

		el: '.sui-wrap',

		events: {
			'click .sui-sidenav .sui-vertical-tab a': 'sidenav',
			'click a.hustle-go-to-tab': 'sidenav',
			'click a.notify-error-tab': 'sidenav',
			'click .hustle-action-save': 'saveChanges',
			'click .wpmudev-button-navigation': 'doButtonNavigation',
			'change #hustle-module-name': 'updateModuleName',
			'click #hustle-preview-module': 'previewModule',
			'blur input.sui-form-control': 'removeErrorMessage'
		},

		// ============================================================
		// Initialize Wizard
		init( opts ) {

			this.setTabsViews( opts );

			Hustle.Events.off( 'modules.view.switch_status', $.proxy( this.switchStatusTo, this ) );
			Hustle.Events.on( 'modules.view.switch_status', $.proxy( this.switchStatusTo, this ) );

			$( win ).off( 'popstate', $.proxy( this.updateTabOnPopstate, this ) );
			$( win ).on( 'popstate', $.proxy( this.updateTabOnPopstate, this ) );

			$( document ).off( 'tinymce-editor-init', $.proxy( this.tinymceReady, this ) );
			$( document ).on( 'tinymce-editor-init', $.proxy( this.tinymceReady, this ) );

			if ( 'undefined' !== typeof this._events ) {
				this.events = $.extend( true, {}, this.events, this._events );
				this.delegateEvents();
			}

			this.renderTabs();

			return this;

		},

		/**
		 * Assign the tabs views to the object.
		 * Overridden by social share.
		 * @param object opts
		 */
		setTabsViews( opts ) {

			this.contentView    = opts.contentView;
			this.emailsView     = opts.emailsView;
			this.designView     = opts.designView;
			this.integrationsView = opts.integrationsView;
			this.visibilityView = opts.visibilityView;
			this.settingsView   = opts.settingsView;
			this.moduleType = this.model.get( 'module_type' );

			if ( 'embedded' === this.moduleType ) {
				this.displayView  = opts.displayView;
			}
		},

		// ============================================================
		// Render content

		/**
		 * Render the tabs.
		 * Overridden by social share.
		 */
		renderTabs() {

			// Content view
			this.contentView.delegateEvents();

			// Emails view
			this.emailsView.delegateEvents();

			// Integrations view
			this.integrationsView.delegateEvents();

			// Appearance view
			this.designView.delegateEvents();

			// Display Options View
			if ( 'embedded' === this.moduleType ) {
				this.displayView.delegateEvents();
			}

			// Visibility view
			this.visibilityView.delegateEvents();
			this.visibilityView.afterRender();

			// Behavior view
			this.settingsView.delegateEvents();
		},

		// ============================================================
		// Side Navigation
		sidenav( e ) {
			e.preventDefault();

			let tabName = $( e.target ).data( 'tab' );

			if ( tabName ) {
				this.goToTab( tabName, true );
			}
		},

		goToTab( tabName, updateHistory ) {

			let $tab 	 = this.$el.find( 'a[data-tab="' + tabName + '"]' ),
				$sidenav = $tab.closest( '.sui-vertical-tabs' ),
				$tabs    = $sidenav.find( '.sui-vertical-tab a' ),
				$content = this.$el.find( '.sui-box[data-tab]' ),
				$current = this.$el.find( '.sui-box[data-tab="' + tabName + '"]' );

			if ( updateHistory ) {

				// The module id must be defined at this point.
				// If it's not, the user should be redirected to the listing page to properly create a module before reaching this.
				let state = { tabName },
				moduleId = this.model.get( 'module_id' );

				history.pushState( state, 'Hustle ' + this.moduleType + ' wizard', 'admin.php?page=' + optinVars.current.wizard_page + '&id=' + moduleId + '&section=' + tabName  );
			}

			$tabs.removeClass( 'current' );
			$content.hide();

			$tab.addClass( 'current' );
			$current.show();

			$( '.sui-wrap-hustle' )[0].scrollIntoView();
		},

		// Keep the sync of the shown tab and the URL when going "back" with the browser.
		updateTabOnPopstate( e ) {
			var state = e.originalEvent.state;

			if ( state ) {
				this.goToTab( state.tabName );
			}
		},

		// Go to he "next" and "previous" tab when using the buttons at the bottom of the wizard.
		doButtonNavigation( e ) {
			e.preventDefault();
			let $button = $( e.target ),
				direction = 'prev' === $button.data( 'direction' ) ? 'prev' : 'next',
				nextTabName = this.getNextOrPrevTabName( direction );

			this.goToTab( nextTabName, true );

		},

		// Get the name of the previous or next tab.
		getNextOrPrevTabName( direction ) {
			var current = $( '#hustle-module-wizard-view .sui-sidenav ul li a.current' ),
				tab = current.data( 'tab' );

			if ( 'prev' === direction ) {
				tab = current.parent().prev().find( 'a' ).data( 'tab' );
			} else {
				tab = current.parent().next().find( 'a' ).data( 'tab' );
			}

			return tab;
		},

		// ============================================================
		// TinyMCE

		// Mark the wizard as "unsaved" when the tinymce editors had a change.
		tinymceReady( e, editor ) {
			const self = this;
			editor.on( 'change', () => {
				if ( ! Module.hasChanges ) {
					self.contentView.model.userHasChange();
				}
			});
			$( 'textarea#' + editor.id ).on( 'change', () => {
				if ( ! Module.hasChanges ) {
					self.contentView.model.userHasChange();
				}
			});
		},

		setContentFromTinymce( keepSilent = false ) {

			if ( 'undefined' !== typeof tinyMCE ) {

				// main_content editor
				let mainContentEditor = tinyMCE.get( 'main_content' ),
					$mainContentTextarea = this.$( 'textarea#main_content' ),
					mainContent = ( 'true' === $mainContentTextarea.attr( 'aria-hidden' ) ) ? mainContentEditor.getContent() : $mainContentTextarea.val();

				this.contentView.model.set( 'main_content', mainContent, {
					silent: keepSilent
				});

				// success_message editor
				let successMessageEditor = tinyMCE.get( 'success_message' ),
					$successMessageTextarea = this.$( 'textarea#success_message' ),
					successMessage = ( 'true' === $successMessageTextarea.attr( 'aria-hidden' ) ) ? successMessageEditor.getContent() : $successMessageTextarea.val();

				this.emailsView.model.set( 'success_message', successMessage, {
					silent: keepSilent
				});

				// email_body editor
				let emailBodyEditor = tinyMCE.get( 'email_body' ),
					$emailBodyTextarea = this.$( 'textarea#email_body' ),
					emailBody = ( 'true' === $successMessageTextarea.attr( 'aria-hidden' ) ) ? emailBodyEditor.getContent() : $emailBodyTextarea.val();

				this.emailsView.model.set( 'email_body', emailBody, {
					silent: keepSilent
				});

			}
		},

		// ============================================================
		// Sanitize Data
		sanitizeData() {

			// Call to action
			var ctaUrl = this.contentView.model.get( 'cta_url' );

			if ( ! /^(f|ht)tps?:\/\//i.test( ctaUrl ) ) {
				ctaUrl = 'https://' + ctaUrl;
				this.contentView.model.set( 'cta_url', ctaUrl, { silent: true });
			}

			// Custom CSS
			this.designView.updateCustomCss();

		},

		validate() {

			this.setContentFromTinymce( true );
			this.sanitizeData();

			// Preparig the data
			let me       = this,
				$this    = this.$el.find( '#hustle-module-wizard-view' ),
				id       = ( ! $this.data( 'id' ) ) ? '-1' : $this.data( 'id' ),
				nonce    = $this.data( 'nonce' ),
				module   = this.model.toJSON(),
				data 	 = {
					action: 'hustle_validate_module',
					'_ajax_nonce': nonce,
					id,
					module
				};

			_.extend( data, this.getDataToSave() );

			// ajax save here
			return $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function( result ) {

					if ( true === result.success ) {

						// TODO: handle errors. Such as when nonces expire when you leave the window opend for long.

						// The changes were already saved.
						Module.hasChanges = false;

						// Change the "Pending changes" label to "Saved".
						me.switchStatusTo( 'saved' );
					} else {
						let errors = result.data,
							errorMessage = '';

						if ( 'undefined' !== typeof errors.data.icon_error ) {
							_.each( errors.data.icon_error, function( error ) {
								$( '#hustle-platform-' + error ).find( '.sui-error-message' ).show();
								$( '#hustle-platform-' + error + ' .hustle-social-url-field' ).addClass( 'sui-form-field-error' );
								$( '#hustle-platform-' + error ).not( '.sui-accordion-item--open' ).find( '.sui-accordion-open-indicator' ).click();
							});

							errorMessage = '<a href="#" data-tab="services" class="notify-error-tab"> Services </a>';
						}

						if ( 'undefined' !== typeof errors.data.selector_error ) {
							_.each( errors.data.selector_error, function( error ) {
								$( 'input[name="' + error + '_css_selector"]' ).siblings( '.sui-error-message' ).show();

								$( 'input[name="' + error + '_css_selector"]' ).parent( '.sui-form-field' ).addClass( 'sui-form-field-error' );
							});

							if ( ! _.isEmpty( errorMessage ) ) {
								errorMessage = errorMessage + ' and ';
							}

							errorMessage = errorMessage + '<a href="#" data-tab="display" class="notify-error-tab"> Display Options </a>';
						}

						errorMessage =  optinVars.messages.sshare_module_error.replace( '{page}', errorMessage );

						Module.Notification.open( 'error', errorMessage, 1000000000 );
					}
				}
			});
		},

		// ============================================================
		// Save changes
		save() {

			this.setContentFromTinymce( true );
			this.sanitizeData();

			// Preparig the data
			let me       = this,
				$this    = this.$el.find( '#hustle-module-wizard-view' ),
				id       = ( ! $this.data( 'id' ) ) ? '-1' : $this.data( 'id' ),
				nonce    = $this.data( 'nonce' ),
				module   = this.model.toJSON();

			let data = {
					action: 'hustle_save_module',
					'_ajax_nonce': nonce,
					id,
					module
				};

			_.extend( data, this.getDataToSave() );

			// ajax save here
			return $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function( result ) {

					if ( true === result.success ) {

						// TODO: handle errors. Such as when nonces expire when you leave the window opend for long.

						// The changes were already saved.
						Module.hasChanges = false;

						// Change the "Pending changes" label to "Saved".
						me.switchStatusTo( 'saved' );
					} else {
						let errors = result.data,
							errorMessage = '';

						if ( 'undefined' !== typeof errors.data.icon_error ) {
							_.each( errors.data.icon_error, function( error ) {
								$( '#hustle-platform-' + error ).find( '.sui-error-message' ).show();
								$( '#hustle-platform-' + error + ' .hustle-social-url-field' ).addClass( 'sui-form-field-error' );
								$( '#hustle-platform-' + error ).not( '.sui-accordion-item--open' ).find( '.sui-accordion-open-indicator' ).click();
							});

							errorMessage = '<a href="#" data-tab="services" class="notify-error-tab"> Services </a>';
						}

						if ( 'undefined' !== typeof errors.data.selector_error ) {
							_.each( errors.data.selector_error, function( error ) {
								$( 'input[name="' + error + '_css_selector"]' ).siblings( '.sui-error-message' ).show();

								$( 'input[name="' + error + '_css_selector"]' ).parent( '.sui-form-field' ).addClass( 'sui-form-field-error' );
							});

							if ( ! _.isEmpty( errorMessage ) ) {
								errorMessage = errorMessage + ' and ';
							}

							errorMessage = errorMessage + '<a href="#" data-tab="display" class="notify-error-tab"> Display Options </a>';
						}

						errorMessage =  optinVars.messages.sshare_module_error.replace( '{page}', errorMessage );

						Module.Notification.open( 'error', errorMessage, 10000 );
					}
				}
			});
		},

		getDataToSave() {

			const data = {
				content: this.contentView.model.toJSON(),
				emails: this.emailsView.model.toJSON(),
				design: this.designView.model.toJSON(),
				integrations_settings: this.integrationsView.model.toJSON(), // eslint-disable-line camelcase
				visibility: this.visibilityView.model.toJSON(),
				settings: this.settingsView.model.toJSON()
			};

			if ( 'embedded' === this.moduleType ) {
				data.display = this.displayView.model.toJSON();
			}

			return data;

		},

		saveChanges( e ) {

			let me             = this,
				currentActive = this.model.get( 'active' ),
				setActiveTo  = 'undefined' !== typeof $( e.currentTarget ).data( 'active' ) ? String( $( e.currentTarget ).data( 'active' ) ) : false,
				updateActive  = false,
				validation    = false
				;

			if ( false !== setActiveTo ) {
				if ( '0' === setActiveTo ) {
					me.disableButtonsOnSave( 'draft' );
				} else {
					me.disableButtonsOnSave( 'publish' );
				}
			}

			const validate = this.validate();
			validate.done( function( resp ) {

				if ( resp.success ) {
					if ( false !== setActiveTo && resp.success ) {
						validation = true;

						if ( '0' !== setActiveTo  && setActiveTo !== currentActive ) {
							me.publishingFlow( 'loading' );
						}
						if ( setActiveTo !== currentActive ) {
							updateActive = true;
							me.model.set( 'active', setActiveTo, {
								silent: true
							});
						}
					}

					const save = me.save();
					if ( save && validation ) {
						save.done( function( resp ) {

							if ( 'string' === typeof resp  ) {
								resp = JSON.parse( resp );
							}

							if ( resp.success ) {

								if ( updateActive ) {
									me.updateViewOnActiveChange();
								}
							}

							if ( '0' !== setActiveTo && setActiveTo !== currentActive ) {

								if ( resp.success ) {

									if ( updateActive ) {

										setTimeout( function() {
											me.publishingFlow( 'ready' );
										}, 500 );
									}
								}
							}
						}).always( function() {
							me.enableSaveButtons();
						});

					} else {

						// If saving did not work, remove loading icon.
						me.enableSaveButtons();

					}
				} else {

					// Change the "Pending changes" label to "Saved".
					me.switchStatusTo( 'unsaved' );

					// If saving did not work, remove loading icon.
					me.enableSaveButtons();
				}
			});

			e.preventDefault();

		},

		// ============================================================
		// Update the view elements

		/**
		 * Update this module's name if the new value is not empty.
		 * @param event e
		 */
		updateModuleName( e ) {

			let $input = $( e.target ),
				moduleName = $input.val();

			if ( moduleName.length ) {
				this.$( '#hustle-module-name-wrapper' ).removeClass( 'sui-form-field-error' );
				this.$( '#hustle-module-name-error' ).hide();
				this.model.set( 'module_name', moduleName );
			} else {
				this.$( '#hustle-module-name-wrapper' ).addClass( 'sui-form-field-error' );
				this.$( '#hustle-module-name-error' ).show();
			}
		},

		// Disable the save buttons.
		disableButtonsOnSave( type ) {

			if ( 'draft' === type ) {
				this.$( '#hustle-draft-button' ).addClass( 'sui-button-onload' );

			} else if ( 'publish' === type ) {
				this.$( '.hustle-publish-button' ).addClass( 'sui-button-onload' );
			}

			this.$( '.hustle-action-save' ).prop( 'disabled', true );
			this.$( '.wpmudev-button-navigation' ).prop( 'disabled', true );
		},

		// Enable the save buttons.
		enableSaveButtons() {
			this.$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
			this.$( '.hustle-action-save' ).prop( 'disabled', false );
			this.$( '.wpmudev-button-navigation' ).prop( 'disabled', false );
		},

		// Change the 'saved'/'unsaved' label.
		switchStatusTo( switchTo ) {

			if ( 'saved' === switchTo ) {
				this.$el.find( '#hustle-unsaved-changes-status' ).addClass( 'sui-hidden' );
				this.$el.find( '#hustle-saved-changes-status' ).removeClass( 'sui-hidden' );
			} else {
				this.$el.find( '#hustle-unsaved-changes-status' ).removeClass( 'sui-hidden' );
				this.$el.find( '#hustle-saved-changes-status' ).addClass( 'sui-hidden' );
			}
		},

		// Change the 'Draft'/'Published' module status label, and update the save buttons for each case.
		updateViewOnActiveChange() {

			var active = this.model.get( 'active' ),
				newStatus = '1' === active ? optinVars.messages.commons.published : optinVars.messages.commons.draft, // eslint-disable-line camelcase
				draftButtonText = '1' === active ? optinVars.messages.commons.unpublish : optinVars.messages.commons.save_draft, // eslint-disable-line camelcase
				publishButtonText = '1' === active ? optinVars.messages.commons.save_changes : optinVars.messages.commons.publish; // eslint-disable-line camelcase

			// Update the module status tag. The one that says if the module is Published or a Draft.
			this.$el.find( '.sui-status-module .sui-tag' ).text( newStatus );

			// Update the text within the Draft button.
			this.$el.find( '#hustle-draft-button .button-text' ).text( draftButtonText );

			// Update the text within the Publish button.
			this.$el.find( '.hustle-publish-button .button-text' ).text( publishButtonText );
		},

		// Publishing flow dialog.
		publishingFlow( flowStatus ) {

			const getDialog = $( '#hustle-dialog--publish-flow' );
			const getContent = getDialog.find( '.sui-dialog-content > .sui-box' );
			const getIcon = getDialog.find( '#dialogIcon' );
			const getTitle = getDialog.find( '#dialogTitle' );
			const getDesc = getDialog.find( '#dialogDescription' );
			const getClose = getDialog.find( '.sui-dialog-close' );
			const getMask = getDialog.find( '.sui-dialog-overlay' );

			function resetPublishReady() {

				getIcon.removeClass( 'sui-icon-' + getContent.data( 'loading-icon' ) );
				getIcon.addClass( 'sui-icon-' + getContent.data( 'ready-icon' ) );

				if ( 'loader' === getContent.attr( 'data-loading-icon' ) ) {
					getIcon.removeClass( 'sui-loading' );
				}

				getTitle.text( getContent.data( 'ready-title' ) );
				getDesc.text( getContent.data( 'ready-desc' ) );

				getClose.show();

			}

			function resetPublishLoading() {

				getIcon.removeClass( 'sui-icon-' + getContent.data( 'ready-icon' ) );
				getIcon.addClass( 'sui-icon-' + getContent.data( 'loading-icon' ) );

				if ( 'loader' === getContent.attr( 'data-loading-icon' ) ) {
					getIcon.addClass( 'sui-loading' );
				}

				getTitle.text( getContent.data( 'loading-title' ) );
				getDesc.text( getContent.data( 'loading-desc' ) );

				getClose.hide();
			}

			function closeDialog() {

				SUI.dialogs['hustle-dialog--publish-flow'].hide();

				setTimeout( function() {
					resetPublishLoading();
				}, 500 );
			}

			if ( 'loading' === flowStatus ) {
				resetPublishLoading();
				SUI.dialogs['hustle-dialog--publish-flow'].show();
			}

			if ( 'ready' === flowStatus ) {

				resetPublishReady();

				// Focus ready title
				// This will help screen readers know when module has been published
				getTitle.focus();

				// Close dialog when clicking on mask
				getMask.on( 'click', function() {
					closeDialog();
				});

				// Close dialog when clicking on close button
				getClose.on( 'click', function() {
					closeDialog();
				});

			}
		},

		//remove error message
		removeErrorMessage( e ) {
			if ( e.target.value ) {
				let parent = $( e.target ).parent( '.sui-form-field' );
				parent.removeClass( 'sui-form-field-error' );
				parent.find( '.sui-error-message' ).hide();
			}
		},

		// ============================================================
		// Previewing

		previewModule( e ) {

			e.preventDefault();

			this.setContentFromTinymce( true );
			this.sanitizeData();

			let $button = $( e.currentTarget ),
				id = this.model.get( 'module_id' ),
				type = this.model.get( 'module_type' ),
				previewData = _.extend({}, this.model.toJSON(), this.getDataToSave() );

			$button.addClass( 'sui-button-onload' );

			Module.preview.open( id, type, previewData );
		}
	};

});

( function( $ ) {

	'use strict';

	var ConditionBase;

	Optin.View.Conditions = Optin.View.Conditions || {};

	ConditionBase = Hustle.View.extend({

		conditionId: '',

		className: 'sui-builder-field sui-accordion-item sui-accordion-item--open',

		_template: Optin.template( 'hustle-visibility-rule-tpl' ),

		template: false,

		_defaults: {
			typeName: '',
			conditionName: ''
		},

		_events: {
			'change input': 'changeInput',
			'change textarea': 'changeInput',
			'change select': 'changeInput'
		},

		init: function( opts ) {

			this.undelegateEvents();
			this.$el.removeData().unbind();

			this.type = opts.type;
			this.groupId = opts.groupId;
			this.filter_type = opts.filter_type; // eslint-disable-line camelcase
			this.id = this.conditionId;

			this.template =  ( 'undefined' !== typeof this.cpt ) ? Optin.template( 'hustle-visibility-rule-tpl--post_type' ) : Optin.template( 'hustle-visibility-rule-tpl--' + this.conditionId );

			/**
			 * Defines typeName and conditionName based on type and id so that it can be used in the template later on
			 *
			 * @type {Object}
			 * @private
			 */
			this._defaults = {
				typeName: optinVars.messages.settings[ this.type ] ? optinVars.messages.settings[ this.type ] : this.type,
				conditionName: optinVars.messages.conditions[ this.conditionId ] ? optinVars.messages.conditions[ this.conditionId ] : this.conditionId,
				groupId: this.groupId,
				id: this.conditionId,
				source: opts.source
			};

			this.data = this.getData();

			this.render();
			this.events = $.extend( true, {}, this.events, this._events );
			this.delegateEvents();
			if ( this.onInit && _.isFunction( this.onInit ) ) {
				this.onInit.apply( this, arguments );
			}
			return this;
		},

		getData: function() {
			return _.extend({}, this._defaults, this.defaults(), this.model.get( this.conditionId ), { type: this.type });
		},

		getTitle: function() {
			return this.title.replace( '{type_name}', this.data.typeName );
		},

		getBody: function() {
			return 'function' === typeof this.body ? this.body.apply( this, arguments ) : this.body.replace( '{type_name}', this.data.typeName );
		},

		getHeader: function() {
			return this.header;
		},

		countLines: function( value ) {

			// trim trailing return char if exists
			let text = value.replace( /\s+$/g, '' );
			let split = text.split( '\n' );
			return split.length;
		},

		render: function() {

			this.setProperties();

			let html = this._template( _.extend({}, {
					title: this.getTitle(),
					body: this.getBody(),
					header: this.getHeader()
				},
				this._defaults,
				{ type: this.type }
			) );

			this.$el.html( '' );
			this.$el.html( html );

			$( '.wph-conditions--box .wph-conditions--item:not(:last-child)' )
				.removeClass( 'wph-conditions--open' )
				.addClass( 'wph-conditions--closed' );
			$( '.wph-conditions--box .wph-conditions--item:not(:last-child) section' ).hide();

			if ( this.rendered && 'function' === typeof this.rendered ) {
				this.rendered.apply( this, arguments );
			};
			return this;
		},

		/**
		 * Updates attribute value into the condition hash
		 *
		 * @param attribute
		 * @param val
		 */
		updateAttribute: function( attribute, val ) {
			this.data = this.model.get( this.conditionId );
			this.data[ attribute ] = val;
			this.model.set( this.conditionId, this.data );

			// TODO: instead of triggering manually, clone the retrieved object so
			// backbone recognizes the change.
			this.model.trigger( 'change' );

		},
		getAttribute: function( attribute ) {
			var data = this.model.get( this.conditionId  );
			return data && data[ attribute ] ? data[ attribute ] : false;
		},
		refreshLabel: function() {
			var html =  this.getHeader();
			this.$el.find( '.wph-condition--preview' ).html( '' );
			this.$el.find( '.sui-accordion-item-header .sui-tag' ).html( html );
		},

		/**
		 * Triggered on input change
		 *
		 * @param e
		 * @returns {*}
		 */
		changeInput: function( e ) {

			//stop handler in /assets/js/admin/mixins/model-updater.js

			var updated,
				el = e.target,
				attribute = el.getAttribute( 'data-attribute' ),
				$el = $( el ),
				val = $el.is( '.sui-select' ) ? $el.val() : e.target.value;

			e.stopImmediatePropagation();

			if ( $el.is( ':checkbox' ) ) {
				val = $el.is( ':checked' );
			}

			// skip for input search
			if ( $el.is( '.select2-search__field' ) ) {
				return false;
			}

			updated = this.updateAttribute( attribute, val );

			this.refreshLabel();
			return updated;
		},

		/**
		 * Returns configs of condition
		 *
		 * @returns bool true
		 */
		getConfigs: function() {
			return this.defaults() || true;
		}
	});

	let reenableScroll = function( e ) {

		/**
		 * reenable scrolling for the container
		 * select2 disables scrolling after select so we reenable it
		 */
		$( '.wph-conditions--items' ).data( 'select2ScrollPosition', {});
	},
	ToggleButtonTogglerMixin = {
		events: {
			'change input[type="radio"]': 'setCurrentLi'
		},
		setCurrentLi: function( e ) {
			var $this = $( e.target ),
				$li = $this.closest( 'li' );

			$li.siblings().removeClass( 'current' );
			$li.toggleClass( 'current',  $this.is( ':checked' ) );
		}
	};

	/**
	 * Posts
	 */
	Optin.View.Conditions.posts = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, {
		conditionId: 'posts',
		setProperties() {
			this.title = optinVars.messages.conditions.posts;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				posts: []
			};
		},
		onInit: function() {

			//this.listenTo( this.model, 'change', this.render );
		},
		getHeader: function() {
			if ( this.getAttribute( 'posts' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'posts' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
				tags: 'true',
				width: '100%',
				dropdownCssClass: 'sui-select-dropdown',
				ajax: {
					url: ajaxurl,
					delay: 250, // wait 250 milliseconds before triggering the request
					dataType: 'json',
					type: 'POST',
					data: function( params ) {
						var query = {
							action: 'get_new_condition_ids',
							search: params.term,
							postType: 'post'
						};

						return query;
					},
					processResults: function( data ) {
						return {
							results: data.data
						};
					},
					cache: true
				},
				createTag: function() {
					return false;
				}
			})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );

		}
	}) );

	/**
	 * Pages
	 */
	Optin.View.Conditions.pages = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, {
		conditionId: 'pages',
		setProperties() {
			this.title = optinVars.messages.conditions.pages;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				pages: []
			};
		},
		onInit: function() {

			//this.listenTo( this.model, 'change', this.render );
		},
		getHeader: function() {
			if ( this.getAttribute( 'pages' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'pages' ).length );
			} else {
				return ( 'only' === this.getAttribute( 'filter_type' ) ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
					tags: 'true',
					width: '100%',
					dropdownCssClass: 'sui-select-dropdown',
					ajax: {
						url: ajaxurl,
						delay: 250, // wait 250 milliseconds before triggering the request
						dataType: 'json',
						type: 'POST',
						data: function( params ) {
							var query = {
								action: 'get_new_condition_ids',
								search: params.term,
								postType: 'page'
							};

							return query;
						},
						processResults: function( data ) {
							return {
								results: data.data
							};
						},
						cache: true
					},
					createTag: function() {
						return false;
					}
				})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );

		}
	}) );

	/**
	 * Custom Post Types
	 */
	if ( optinVars.post_types ) {
		_.each( optinVars.post_types, function( cptDetails, cpt ) {
			Optin.View.Conditions[ cptDetails.name ] = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, {
				conditionId: cptDetails.name,
				cpt: true,

				setProperties() {
					this.title = cptDetails.label;
				},
				defaults: function() {
					return {
						'filter_type': 'except', // except | only
						'selected_cpts': [],
						postType: cpt,
						postTypeLabel: cptDetails.label
					};
				},
				getHeader: function() {
					if ( this.getAttribute( 'selected_cpts' ).length ) {
						return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'selected_cpts' ).length  );
					} else {
						return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
					}
				},
				body: function() {
					return this.template( this.getData() );
				},
				rendered: function() {
					this.$( '.hustle-select-ajax' ).SUIselect2({
						tags: 'true',
						width: '100%',
						dropdownCssClass: 'sui-select-dropdown',
						ajax: {
							url: ajaxurl,
							delay: 250, // wait 250 milliseconds before triggering the request
							dataType: 'json',
							type: 'POST',
							data: function( params ) {
								var query = {
									action: 'get_new_condition_ids',
									search: params.term,
									postType: cpt
								};

								return query;
							},
							processResults: function( data ) {
								return {
									results: data.data
								};
							},
							cache: true
						},
						createTag: function() {
							return false;
						}
					})
					.on( 'select2:selecting', reenableScroll )
					.on( 'select2:unselecting', reenableScroll );
				}
			}) );
		});
	}

	/**
	 * Categories
	 */
	Optin.View.Conditions.categories = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, {
		conditionId: 'categories',
		setProperties() {
			this.title = optinVars.messages.conditions.categories;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				categories: []
			};
		},
		onInit: function() {

			//this.listenTo( this.model, 'change', this.render );
		},
		getHeader: function() {
			if ( this.getAttribute( 'categories' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'categories' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
					tags: 'true',
					width: '100%',
					dropdownCssClass: 'sui-select-dropdown',
					ajax: {
						url: ajaxurl,
						delay: 250, // wait 250 milliseconds before triggering the request
						dataType: 'json',
						type: 'POST',
						data: function( params ) {
							var query = {
								action: 'get_new_condition_ids',
								search: params.term,
								postType: 'category'
							};

							return query;
						},
						processResults: function( data ) {
							return {
								results: data.data
							};
						},
						cache: true
					},
					createTag: function() {
						return false;
					}
			})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );
		}
	}) );

	/**
	 * Tags
	 */
	Optin.View.Conditions.tags = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, {
		conditionId: 'tags',
		setProperties() {
			this.title = optinVars.messages.conditions.tags;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				tags: []
			};
		},
		onInit: function() {

			//this.listenTo( this.model, 'change', this.render );
		},
		getHeader: function() {
			if ( this.getAttribute( 'tags' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'tags' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
					width: '100%',
					tags: 'true',
					dropdownCssClass: 'sui-select-dropdown',
					ajax: {
						url: ajaxurl,
						delay: 250, // wait 250 milliseconds before triggering the request
						dataType: 'json',
						type: 'POST',
						data: function( params ) {
							var query = {
								action: 'get_new_condition_ids',
								search: params.term,
								postType: 'tag'
							};

							return query;
						},
						processResults: function( data ) {
							return {
								results: data.data
							};
						},
						cache: true
					},
					createTag: function() {
						return false;
					}
			})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );
		}
	}) );

	/**
	 * Visitor logged in / not logged in
	 */
	Optin.View.Conditions.visitor_logged_in_status = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'visitor_logged_in_status',
		setProperties() {
			this.title = optinVars.messages.conditions.visitor_logged_in;
		},
		defaults: function() {
			return {
				'show_to': 'logged_in'
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'show_to' ).length && 'logged_out' === this.getAttribute( 'show_to' ) ) {
				return optinVars.messages.condition_labels.logged_out;
			} else {
				return optinVars.messages.condition_labels.logged_in;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * Amount of times the module has been shown to the same visitor
	 */
	Optin.View.Conditions.shown_less_than = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'shown_less_than',
		setProperties() {
			this.title = optinVars.messages.conditions.shown_less_than;
		},
		defaults: function() {
			return {
				'less_or_more': 'less_than',
				'less_than': ''
			};
		},
		getHeader: function() {
			if ( 0 < this.getAttribute( 'less_than' ) ) {
				if ( 'less_than' === this.getAttribute( 'less_or_more' ) ) {
					return ( optinVars.messages.condition_labels.number_views ).replace( '{number}',  this.getAttribute( 'less_than' ) );
				} else {
					return ( optinVars.messages.condition_labels.number_views_more ).replace( '{number}',  this.getAttribute( 'less_than' ) );
				}
			} else {
				return optinVars.messages.condition_labels.any;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * Visitor is on mobile / desktop
	 */
	Optin.View.Conditions.visitor_device = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'visitor_device',
		setProperties() {
			this.title = optinVars.messages.conditions.only_on_mobile;
		},
		defaults: function() {
			return {
				'filter_type': 'mobile' // mobile | not_mobile
			};
		},
		getHeader: function() {
			if ( 'not_mobile' === this.getAttribute( 'filter_type' ) ) {
				return optinVars.messages.condition_labels.desktop_only;
			} else {
				return optinVars.messages.condition_labels.mobile_only;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * From referrer
	 */
	Optin.View.Conditions.from_referrer = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'from_referrer',
		disable: [ 'from_referrer' ],
		setProperties() {
			this.title = optinVars.messages.conditions.from_specific_ref;
		},
		defaults: function() {
			return {
				'filter_type': 'true', // true | false
				refs: ''
			};
		},
		getHeader: function() {
			let length = 0;
			if ( this.getAttribute( 'refs' ).length ) {
				length = this.countLines( this.getAttribute( 'refs' ) );
			}
			if ( length ) {
				return ( 'false' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.except_these : optinVars.messages.condition_labels.only_these ).replace( '{number}', length );
			} else {
				return 'false' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.any : optinVars.messages.condition_labels.none;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * Source of arrival
	 */
	Optin.View.Conditions.source_of_arrival = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'source_of_arrival',
		setProperties() {
			this.title = optinVars.messages.conditions.from_search_engine;
		},
		defaults: function() {
			return {
				'source_direct': 'false', // true | false
				'source_external': 'false', // true | false
				'source_internal': 'false', // true | false
				'source_not_search': 'false', // true | false
				'source_search': 'false' // true | false
			};
		},
		getHeader: function() {
			let conditions = 0,
				direct = _.isTrue( this.getAttribute( 'source_direct' ) ) && ++conditions,
				external = _.isTrue( this.getAttribute( 'source_external' ) ) && ++conditions,
				internal = _.isTrue( this.getAttribute( 'source_internal' ) ) && ++conditions,
				search = _.isTrue( this.getAttribute( 'source_search' ) ) && ++conditions,
				notSearch = _.isTrue( this.getAttribute( 'source_not_search' ) ) && ++conditions	;

			if ( search && notSearch || direct && internal && external ) {
				return optinVars.messages.condition_labels.any;
			} else if ( conditions ) {
				return ( optinVars.messages.condition_labels.any_conditions ).replace( '{number}', conditions );
			} else {
				return optinVars.messages.condition_labels.any;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * On/not on specific url
	 */
	Optin.View.Conditions.on_url = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'on_url',
		setProperties() {
			this.title = optinVars.messages.conditions.on_specific_url;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				urls: ''
			};
		},
		getHeader: function() {
			let length = 0;
			if ( this.getAttribute( 'urls' ).length ) {
				length = this.countLines( this.getAttribute( 'urls' ) );
			}
			if ( length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * On/not on specific browser
	 */
	Optin.View.Conditions.on_browser = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'on_browser',
		setProperties() {
			this.title = optinVars.messages.conditions.on_specific_browser;
		},
		defaults: function() {
			return {
				browsers: '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'browsers' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'browsers' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'browsers' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * Visitor commented or not
	 */
	Optin.View.Conditions.visitor_commented = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'visitor_commented',
		setProperties() {
			this.title = optinVars.messages.conditions.visitor_has_never_commented;
		},
		defaults: function() {
			return {
				'filter_type': 'true' // true | false
			};
		},
		getHeader: function() {
			return 'false' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.false : optinVars.messages.condition_labels.true;
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * User has role
	 */
	Optin.View.Conditions.user_roles = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'user_roles',
		setProperties() {
			this.title = optinVars.messages.conditions.on_specific_roles;
		},
		defaults: function() {
			return {
				roles: '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'roles' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'roles' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'roles' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * Page templates
	 */
	Optin.View.Conditions.page_templates = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'page_templates',
		setProperties() {
			this.title = optinVars.messages.conditions.on_specific_templates;
		},
		defaults: function() {
			return {
				templates: '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'templates' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'templates' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'templates' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * Show modules based on user registration time
	 */
	Optin.View.Conditions.user_registration = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'user_registration',
		setProperties() {
			this.title = optinVars.messages.conditions.user_registration;
		},
		defaults: function() {
			return {
				'from_date': 0,
				'to_date': 0
			};
		},
		getHeader: function() {
			let from, upTo;

			from = 0 < this.getAttribute( 'from_date' ) ?
				( optinVars.messages.condition_labels.reg_date ).replace( '{number}',  this.getAttribute( 'from_date' ) ) :
				optinVars.messages.condition_labels.immediately;

			upTo = 0 < this.getAttribute( 'to_date' ) ?
				( optinVars.messages.condition_labels.reg_date ).replace( '{number}',  this.getAttribute( 'to_date' ) ) :
				optinVars.messages.condition_labels.forever;

			return from + ' - ' + upTo;
		},
		body: function() {
			return this.template( this.getData() );
		}
	});

	/**
	 * Visitor country
	 */
	Optin.View.Conditions.visitor_country = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'visitor_country',
		setProperties() {
			this.title = optinVars.messages.conditions.not_in_a_country;
		},
		defaults: function() {
			return {
				countries: '',
				'filter_type': 'except' // only | except
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'countries' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'countries' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'countries' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * Static Pages
	 */
	Optin.View.Conditions.wp_conditions = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'wp_conditions',
		setProperties() {
			this.title = optinVars.messages.conditions.wp_conditions;
		},
		defaults: function() {
			return {
				'wp_conditions': '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'wp_conditions' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'wp_conditions' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'wp_conditions' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * Archive Pages
	 */
	Optin.View.Conditions.archive_pages = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'archive_pages',
		setProperties() {
			this.title = optinVars.messages.conditions.archive_pages;
		},
		defaults: function() {
			return {
				'archive_pages': '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'archive_pages' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'archive_pages' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'archive_pages' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});


/**********************************************************************************************************************************************************/
/*********************************** WooCommerce Conditions ***********************************************************************************************/
/**********************************************************************************************************************************************************/

	/**
	 * All WooCommerce Pages
	 */
	Optin.View.Conditions.wc_pages = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, { // eslint-disable-line camelcase
		conditionId: 'wc_pages',
		setProperties() {
			this.title = optinVars.messages.conditions.wc_pages;
		},
		defaults: function() {
			return {
				'filter_type': 'all' // all | none
			};
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-tag' ).remove();
		}
	}) );

	/**
	 * WooCommerce Categories
	 */
	Optin.View.Conditions.wc_categories = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, { // eslint-disable-line camelcase
		conditionId: 'wc_categories',
		setProperties() {
			this.title = optinVars.messages.conditions.wc_categories;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				wc_categories: [] // eslint-disable-line camelcase
			};
		},
		onInit: function() {
		},
		getHeader: function() {
			if ( this.getAttribute( 'wc_categories' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'wc_categories' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
					tags: 'true',
					width: '100%',
					dropdownCssClass: 'sui-select-dropdown',
					ajax: {
						url: ajaxurl,
						delay: 250, // wait 250 milliseconds before triggering the request
						dataType: 'json',
						type: 'POST',
						data: function( params ) {
							var query = {
								action: 'get_new_condition_ids',
								search: params.term,
								postType: 'wc_category'
							};

							return query;
						},
						processResults: function( data ) {
							return {
								results: data.data
							};
						},
						cache: true
					},
					createTag: function() {
						return false;
					}
			})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );
		}
	}) );

	/**
	 * WooCommerce Tags
	 */
	Optin.View.Conditions.wc_tags = ConditionBase.extend( _.extend({}, ToggleButtonTogglerMixin, { // eslint-disable-line camelcase
		conditionId: 'wc_tags',
		setProperties() {
			this.title = optinVars.messages.conditions.wc_tags;
		},
		defaults: function() {
			return {
				'filter_type': 'except', // except | only
				wc_tags: [] // eslint-disable-line camelcase
			};
		},
		onInit: function() {
		},
		getHeader: function() {
			if ( this.getAttribute( 'wc_tags' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}',  this.getAttribute( 'wc_tags' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.hustle-select-ajax' ).SUIselect2({
					tags: 'true',
					width: '100%',
					dropdownCssClass: 'sui-select-dropdown',
					ajax: {
						url: ajaxurl,
						delay: 250, // wait 250 milliseconds before triggering the request
						dataType: 'json',
						type: 'POST',
						data: function( params ) {
							var query = {
								action: 'get_new_condition_ids',
								search: params.term,
								postType: 'wc_tag'
							};

							return query;
						},
						processResults: function( data ) {
							return {
								results: data.data
							};
						},
						cache: true
					},
					createTag: function() {
						return false;
					}
			})
			.on( 'select2:selecting', reenableScroll )
			.on( 'select2:unselecting', reenableScroll );
		}
	}) );

	/**
	 * WooCommerce Archive Pages
	 */
	Optin.View.Conditions.wc_archive_pages = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'wc_archive_pages',
		setProperties() {
			this.title = optinVars.messages.conditions.wc_archive_pages;
		},
		defaults: function() {
			return {
				'wc_archive_pages': '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'wc_archive_pages' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'wc_archive_pages' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'wc_archive_pages' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	/**
	 * WooCommerce Static Pages
	 */
	Optin.View.Conditions.wc_static_pages = ConditionBase.extend({ // eslint-disable-line camelcase
		conditionId: 'wc_static_pages',
		setProperties() {
			this.title = optinVars.messages.conditions.wc_static_pages;
		},
		defaults: function() {
			return {
				'wc_static_pages': '',
				'filter_type': 'except' // except | only
			};
		},
		getHeader: function() {
			if ( this.getAttribute( 'wc_static_pages' ).length ) {
				return ( 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.only_these : optinVars.messages.condition_labels.except_these ).replace( '{number}', this.getAttribute( 'wc_static_pages' ).length );
			} else {
				return 'only' === this.getAttribute( 'filter_type' ) ? optinVars.messages.condition_labels.none : optinVars.messages.condition_labels.all;
			}
		},
		body: function() {
			return this.template( this.getData() );
		},
		rendered: function() {
			this.$( '.sui-select' )
				.val( this.getAttribute( 'wc_static_pages' ) )
				.SUIselect2()
				.on( 'select2:selecting', reenableScroll )
				.on( 'select2:unselecting', reenableScroll );
		}
	});

	$( document ).trigger( 'hustleAddViewConditions', [ ConditionBase ]);

}( jQuery ) );

Hustle.define( 'Settings.Palettes', function( $ ) {
	'use strict';

	return Backbone.View.extend({
		el: '#palettes-box',

		events: {
			'click .hustle-create-palette': 'openCreatePaletteModal',
			'click .hustle-delete-button': 'openDeletePaletteModal',
			'click .hustle-button-delete': 'delettePalette'
		},

		initialize() {
			const PaletteModal = Hustle.get( 'Settings.Palettes_Modal' );
			this.paletteModal = new PaletteModal();
		},

		openCreatePaletteModal( e ) {
			this.paletteModal.open( e );
		},

		openDeletePaletteModal( e ) {
			e.preventDefault();

			let $this = $( e.currentTarget ),
				data = {
					id: $this.data( 'id' ),
					title: $this.data( 'title' ),
					description: $this.data( 'description' ),
					action: 'delete',
					nonce: $this.data( 'nonce' ),
					actionClass: 'hustle-button-delete'
				};

			Module.deleteModal.open( data );

			// This element is outside the view and only added after opening the modal.
			$( '.hustle-button-delete' ).on( 'click', $.proxy( this.delettePalette, this ) );
		},

		/**
		 * Handle the color palettes 'delete' action.
		 * @since 4.0.3
		 * @param {Object} e
		 */
		delettePalette( e ) {
			e.preventDefault();

			const $this = $( e.currentTarget ),
				relatedFormId = $this.data( 'form-id' ),
				actionData = $this.data(),
				$form = $( '#' + relatedFormId ),
				data = new FormData( $form[0]);

			// TODO: remove when "hustle_action" field name is changed to "hustleAction"
			$.each( actionData, ( name, value ) => data.append( name, value ) );

			data.append( '_ajax_nonce', optinVars.settings_palettes_action_nonce );
			data.append( 'action', 'hustle_handle_palette_actions' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data,
				contentType: false,
				processData: false
			})
			.done( res => {

				if ( res.data.url ) {
					location.replace( res.data.url );

				} else if ( res.data.notification ) {
					Module.Notification.open( res.data.notification.status, res.data.notification.message, res.data.notification.delay );
				}

				// Don't remove the 'loading' icon when redirecting/reloading.
				if ( ! res.data.url ) {
					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				}
			})
			.error( () => {
				Module.Notification.open( 'error', optinVars.messages.commons.generic_ajax_error );
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
			});
		}


	});
});

Hustle.define( 'Settings.Data_Settings', function( $ ) {
	'use strict';
	return Backbone.View.extend({
		el: '#data-box',

		events: {
			'click #hustle-dialog-open--reset-data-settings': 'dataDialog',
			'click .sui-dialog-content #hustle-reset-settings': 'settingsReset'
		},

		// ============================================================
		// DIALOG: Reset Settings
		// Open dialog
		dataDialog: function( e ) {

			var $button = this.$( e.target ),
				$dialog = $( '#hustle-dialog--reset-data-settings' ),
				$title  = $dialog.find( '#dialogTitle' ),
				$info   = $dialog.find( '#dialogDescription' )
				;

			$title.text( $button.data( 'dialog-title' ) );
			$info.text( $button.data( 'dialog-info' ) );

			SUI.dialogs['hustle-dialog--reset-data-settings'].show();

			e.preventDefault();

		},

		// Confirm and close
		settingsReset: function( e ) {
			var $this    = this.$( e.target ),
				$dialog  = $this.closest( '.sui-dialog' ),
				$buttons = $dialog.find( 'button, .sui-button' );

			$buttons.prop( 'disabled', true );
			$this.addClass( 'sui-button-onload' );
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'hustle_reset_settings',
					_ajax_nonce: $this.data( 'nonce' ) // eslint-disable-line camelcase
				},
				success: function() {
					$( '#' + $this.data( 'notice' ) ).show();
					SUI.dialogs[ $dialog.attr( 'id' ) ].hide();
					$this.removeClass( 'sui-button-onload' );
					$buttons.prop( 'disabled', false );
					Module.Notification.open( 'success', optinVars.messages.settings_was_reset );
					window.setTimeout( () => location.reload( true ), 2000 );
				},
				error: function() {
					SUI.dialogs[ $dialog.attr( 'id' ) ].hide();
					$this.removeClass( 'sui-button-onload' );
					$buttons.prop( 'disabled', false );
					Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
				}
			});
		}
	});

});

Hustle.define( 'Settings.Palettes_Modal', function( $ ) {

	'use strict';

	return Backbone.View.extend({

		el: '#hustle-dialog--edit-palette',

		events: {
			'click .hustle-button-action': 'handleAction',
			'click .hustle-cancel-palette': 'closeCreatePaletteModal',
			'change #hustle-palette-module-type': 'updateModulesOptions'
		},

		initialize() {},

		open( e ) {

			const slug = $( e.currentTarget ).data( 'slug' );

			if ( 'undefined' !== typeof slug ) {

				// When editing a palette.
				this.handleAction( e );
			} else {

				// When creating a new palette.

				// Update the modules' options when opening.
				this.$( '#hustle-palette-module-type' ).trigger( 'change' );

				SUI.openModal( 'hustle-dialog--edit-palette', e.currentTarget, 'hustle-palette-name', false );
			}
		},

		/**
		 * Handle the color palettes 'save' action.
		 * @since 4.0.3
		 * @param {Object} e
		 */
		handleAction( e ) {
			e.preventDefault();

			const self = this,
				$this = $( e.currentTarget ),
				relatedFormId = $this.data( 'form-id' ),
				actionData = $this.data();

			$this.addClass( 'sui-button-onload' );
			Module.Utils.accessibleHide( this.$( '.sui-error-message' ) );

			let data = new FormData(),
				errors = false ;


			// Grab the form's data if the action has a related form.
			if ( 'undefined' !== typeof relatedFormId ) {
				const $form = $( '#' + relatedFormId );

				if ( $form.length ) {
					data = new FormData( $form[0]);
					$form.find( '.hustle-required-field' ).each( ( i, el ) => {
						const $field = $( el );

							if ( ! $field.val().trim().length ) {
								const errorMessage = $field.data( 'error-message' ),
									$errorMessage = $field.siblings( '.sui-error-message' );

								$errorMessage.html( errorMessage );
								Module.Utils.accessibleShow( $errorMessage );
								errors = true;
							}
					});
				}
			}

			// Don't do the request if there are missing required fields.
			if ( errors ) {
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				return;
			}

			$.each( actionData, ( name, value ) => data.append( name, value ) );

			data.append( '_ajax_nonce', optinVars.settings_palettes_action_nonce );
			data.append( 'action', 'hustle_handle_palette_actions' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data,
				contentType: false,
				processData: false
			})
			.done( res => {

				// If there's a defined callback, call it.
				if ( res.data.callback && 'function' === typeof self[ res.data.callback ]) {

					// This calls the "action{ hustle action }" functions from this view.
					// For example: actionToggleStatus();
					self[ res.data.callback ]( res.data, res.success, e );

				} else if ( res.data.url ) {
					location.replace( res.data.url );

				} else if ( res.data.notification ) {

					Module.Notification.open( res.data.notification.status, res.data.notification.message, res.data.notification.delay );
				}

				// Don't remove the 'loading' icon when redirecting/reloading.
				if ( ! res.data.url ) {
					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				}
			})
			.error( res => {
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
			});
		},

		actionOpenEditPalette( data, success, e ) {

			this.actionGoToSecondStep( data );
			SUI.openModal( 'hustle-dialog--edit-palette', e.currentTarget, 'hustle-palette-name', false );

			if ( data.palette_data.name ) {
				$( '#hustle-dialog--edit-palette' ).find( '#hustle-palette-name' ).val( data.palette_data.name );
			}
		},

		actionGoToSecondStep( data ) {

			const stepOne     = this.$( '#hustle-edit-palette-first-step' ),
				stepTwo     = this.$( '#hustle-edit-palette-second-step' ),
				btnAction   = this.$( '.hustle-button-action' ),
				paletteData = data.palette_data,
				template    = Optin.template( 'hustle-dialog--edit-palette-tpl' );

			// Hide first step
			Module.Utils.accessibleHide( stepOne, true );

			// Print and show second step
			stepTwo.html( template( paletteData ) );
			this.initiateSecondStepElements();

			Module.Utils.accessibleShow( stepTwo, true );
			stepTwo.focus();

			// Set new step
			btnAction.data( 'step', 3 );
			btnAction.addClass( 'sui-button-blue' );
			Module.Utils.accessibleHide( btnAction.find( '#hustle-step-button-text' ) );
			Module.Utils.accessibleShow( btnAction.find( '#hustle-finish-button-text' ) );

		},

		initiateSecondStepElements() {

			// Accordions.
			this.$( '.sui-accordion' ).each( function() {
				SUI.suiAccordion( this );
			});

			// Init tabs
			SUI.suiTabs();
			SUI.tabs();

			// Color pickers.
			this.createPickers();
		},

		closeCreatePaletteModal() {

			const self    = this,
				stepOne   = this.$( '#hustle-edit-palette-first-step' ),
				stepTwo   = this.$( '#hustle-edit-palette-second-step' ),
				btnAction = this.$( '.hustle-button-action' );

			// Hide modal
			SUI.closeModal();

			setTimeout( function() {

				// Hide error messages
				Module.Utils.accessibleHide( self.$( '.sui-error-message' ) );

				// Hide second step
				Module.Utils.accessibleHide( stepTwo, true );
				stepTwo.html( '' );

				// Show first step
				Module.Utils.accessibleShow( stepOne, true );

				// Reset action button
				btnAction.removeClass( 'sui-button-blue' );
				btnAction.data( 'step', 2 );
				Module.Utils.accessibleShow( btnAction.find( '#hustle-step-button-text' ) );
				Module.Utils.accessibleHide( btnAction.find( '#hustle-finish-button-text' ) );

			}, 500 );

		},

		// ============================================================
		// Color Pickers

		// TODO: Copied from wizards. Re-use instead of copy-pasting
		createPickers: function() {

			var self = this,
				$suiPickerInputs = this.$( '.sui-colorpicker-input' );

			$suiPickerInputs.wpColorPicker({

				change: function( event, ui ) {
					var $this = $( this );

					// Prevent the model from being marked as changed on load.
					if ( $this.val() !== ui.color.toCSS() ) {
						$this.val( ui.color.toCSS() ).trigger( 'change' );
					}
				},
				palettes: [
					'#333333',
					'#FFFFFF',
					'#17A8E3',
					'#E1F6FF',
					'#666666',
					'#AAAAAA',
					'#E6E6E6'
				]
			});

			if ( $suiPickerInputs.hasClass( 'wp-color-picker' ) ) {

				$suiPickerInputs.each( function() {

					var $suiPickerInput = $( this ),
						$suiPicker      = $suiPickerInput.closest( '.sui-colorpicker-wrap' ),
						$suiPickerColor = $suiPicker.find( '.sui-colorpicker-value span[role=button]' ),
						$suiPickerValue = $suiPicker.find( '.sui-colorpicker-value' ),
						$suiPickerClear = $suiPickerValue.find( 'button' ),
						$suiPickerType  = 'hex'
						;

					var $wpPicker       = $suiPickerInput.closest( '.wp-picker-container' ),
						$wpPickerButton = $wpPicker.find( '.wp-color-result' ),
						$wpPickerAlpha  = $wpPickerButton.find( '.color-alpha' ),
						$wpPickerClear  = $wpPicker.find( '.wp-picker-clear' )
						;

					// Check if alpha exists
					if ( true === $suiPickerInput.data( 'alpha' ) ) {

						$suiPickerType = 'rgba';

						// Listen to color change
						$suiPickerInput.bind( 'change', function() {

							// Change color preview
							$suiPickerColor.find( 'span' ).css({
								'background-color': $wpPickerAlpha.css( 'background' )
							});

							// Change color value
							$suiPickerValue.find( 'input' ).val( $suiPickerInput.val() );

						});

					} else {

						// Listen to color change
						$suiPickerInput.bind( 'change', function() {

							// Change color preview
							$suiPickerColor.find( 'span' ).css({
								'background-color': $wpPickerButton.css( 'background-color' )
							});

							// Change color value
							$suiPickerValue.find( 'input' ).val( $suiPickerInput.val() );

						});
					}

					// Add picker type class
					$suiPicker.find( '.sui-colorpicker' ).addClass( 'sui-colorpicker-' + $suiPickerType );

					// Open iris picker
					$suiPicker.find( '.sui-button, span[role=button]' ).on( 'click', function( e ) {

						$wpPickerButton.click();

						e.preventDefault();
						e.stopPropagation();

					});

					// Clear color value
					$suiPickerClear.on( 'click', function( e ) {

						let inputName = $suiPickerInput.data( 'attribute' ),
							selectedStyle = $( '#hustle-palette-module-fallback' ).val(),
							resetValue = optinVars.palettes[ selectedStyle ][ inputName ];

						$wpPickerClear.click();
						$suiPickerValue.find( 'input' ).val( resetValue );
						$suiPickerInput.val( resetValue ).trigger( 'change' );
						$suiPickerColor.find( 'span' ).css({
							'background-color': resetValue
						});

						e.preventDefault();
						e.stopPropagation();

					});
				});
			}
		},

		updateModulesOptions( e ) {

			const $this = $( e.currentTarget ),
				moduleType = $this.val(),
				$modulesOptionsSelect = this.$( '#hustle-palette-module-name' );

			let html = '';

			$.each( optinVars.current[ moduleType ], ( id, name ) => {
				html += `<option value="${ id }">${ name }</option>`;
			});

			$modulesOptionsSelect.html( html );

			this.$( '.sui-select:not(.hustle-select-ajax)' ).SUIselect2({
				dropdownCssClass: 'sui-select-dropdown'
			});
		}

	});
});

Hustle.define( 'Settings.Permissions_View', function( $ ) {
	'use strict';

	return Backbone.View.extend({

		el: '#permissions-box',

		initialize: function() {
			$( function() {

				//Delete the remove ability for Administrator option in select2
				function blockingAdminRemove() {
					$( '.select2-selection__rendered li:first-child .select2-selection__choice__remove' ).off( 'click' ).text( '' ).on( 'click', function( e ) {
						e.stopImmediatePropagation();
						e.preventDefault();
					});
				}
				$( 'select' ).on( 'change.select2', function( e ) {
					blockingAdminRemove();
				});
				blockingAdminRemove();
			});
		}
	});
});

Hustle.define( 'Settings.Privacy_Settings', function( $ ) {
	'use strict';
	return Backbone.View.extend({
		el: '#privacy-box',

		events: {
			'click #hustle-dialog-open--delete-ips': 'openDeleteIpsDialog'
		},

		initialize: function() {
			$( '#hustle-delete-ips-submit' ).on( 'click', this.handleIpDeletion );
		},

		// ============================================================
		// DIALOG: Delete All IPs
		// Open dialog
		openDeleteIpsDialog( e ) {
			SUI.dialogs['hustle-dialog--delete-ips'].show();
			e.preventDefault();
		},

		handleIpDeletion( e ) {
			e.preventDefault();

			const $this = $( e.currentTarget ),
				$dialog  = $this.closest( '.sui-dialog' ),
				$form = $( '#' + $this.data( 'formId' ) ),
				data = new FormData( $form[0]);

			data.append( 'action', 'hustle_remove_ips' );
			data.append( '_ajax_nonce', $this.data( 'nonce' ) );

			$this.addClass( 'sui-button-onload' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data,
				contentType: false,
				processData: false,
				success: function( res ) {

					Module.Notification.open( 'success', res.data.message );
					SUI.dialogs[ $dialog.attr( 'id' ) ].hide();
					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				},
				error: function() {
					SUI.dialogs[ $dialog.attr( 'id' ) ].hide();
					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
					Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
				}
			});
		}

	});

});

Hustle.define( 'Settings.reCaptcha_Settings', function( $ ) {
	'use strict';
	return Backbone.View.extend({
		el: '#recaptcha-box',
		data: {},

		initialize() {
			this.maybeRenderRecaptchas();
		},

		maybeRenderRecaptchas() {

			const self = this,
				versions = [ 'v2_checkbox', 'v2_invisible', 'v3_recaptcha' ];

			let scriptAdded = false;

			for ( let version of versions ) {

				const $previewContainer = this.$( `#hustle-modal-recaptcha-${ version }-0` ),
					sitekey = this.$( `input[name="${ version }_site_key"]` ).val().trim(),
					secretkey = this.$( `input[name="${ version }_secret_key"]` ).val().trim();

				if ( sitekey && secretkey ) {

					$previewContainer.data( 'sitekey', sitekey );

					if ( ! scriptAdded ) {

						$.ajax({
							url: ajaxurl,
							type: 'POST',
							data: {
								action: 'hustle_load_recaptcha_preview'
							}
						}).done( result => {
							if ( result.success ) {
								scriptAdded = true;
								self.$( '#hustle-recaptcha-script-container' ).html( result.data );
								setTimeout( () => HUI.maybeRenderRecaptcha( $previewContainer.closest( '.sui-form-field' ) ), 1000 );
							}
						});

					} else {
						HUI.maybeRenderRecaptcha( $previewContainer.closest( '.sui-form-field' ) );
					}

					this.$( `.hustle-recaptcha-${ version }-preview-notice` ).hide();
					$previewContainer.show();

				} else {
					this.$( `.hustle-recaptcha-${ version }-preview-notice` ).show();
					$previewContainer.hide();
				}
			}
		}
	});

});

Hustle.define( 'Settings.Top_Metrics_View', function( $, doc, win ) {
	'use strict';

	return Backbone.View.extend({
		el: '#top-metrics-box',

		events: {
			'click .sui-checkbox input': 'maybeDisableInputs'
		},

		initialize: function() {
			this.maybeDisableInputs();
		},

		maybeDisableInputs: function() {
			var $allchecked = this.$el.find( 'input:checked' ),
				$unchecked  = this.$el.find( 'input:not(:checked)' ),
				$button  	= this.$el.find( 'button[type="submit"]' ),
				$buttonTip  = $button.parent(),
				$design     = $unchecked.next( 'span' );
			if ( 3 <= $allchecked.length ) {
				$unchecked.prop( 'disabled', true );
				$design.addClass( 'sui-tooltip' );
				$design.css( 'opacity', '1' );
				$button.prop( 'disabled', false );
				$buttonTip.removeClass( 'sui-tooltip' );
			} else {
				$button.prop( 'disabled', true );
				$unchecked.prop( 'disabled', false );
				$design.removeClass( 'sui-tooltip' );
				$design.css( 'opacity', '' );
				$buttonTip.addClass( 'sui-tooltip' );
			}
		}
	});
});

( function( $, doc ) {
	'use strict';

	$( document ).on( 'click', '.wpoi-listing-wrap header.can-open .toggle, .wpoi-listing-wrap header.can-open .toggle-label', function( e ) {
		e.stopPropagation();
	});


	$( '.accordion header .optin-delete-optin, .accordion header .edit-optin, .wpoi-optin-details tr .button-edit' ).hide().css({
		transition: 'none'
	});

	$( document ).on({
		mouseenter: function() {
			var $this = $( this );
			$this.find( '.optin-delete-optin, .edit-optin' ).stop().fadeIn( 'fast' );
		},
		mouseleave: function() {
			var $this = $( this );
			$this.find( '.toggle-checkbox' ).removeProp( 'disabled' );
			$this.find( '.edit-optin' ).removeProp( 'disabled' );
			$this.removeClass( 'disabled' );
			$this.find( '.optin-delete-optin, .edit-optin, .delete-optin-confirmation' ).stop().fadeOut( 'fast' );
		}
	}, '.accordion header' );

	$( document ).on({
		mouseenter: function() {
			var $this = $( this );
			$this.find( '.button-edit' ).stop().fadeIn( 'fast' );
		},
		mouseleave: function() {
			var $this = $( this );
			$this.find( '.button-edit' ).stop().fadeOut( 'fast' );
		}
	}, '.wpoi-optin-details tr' );

	$( document ).on( 'click', '.wpoi-tabs-menu a', function( event ) {
		var tab = $( this ).attr( 'tab' );
		event.preventDefault();
		Optin.router.navigate( tab, true );
	});

	$( document ).on( 'click', '.edit-optin', function( event ) {
		event.stopPropagation();
		event.preventDefault();
		window.location.href = $( this ).attr( 'href' );
	});

	$( document ).on( 'click', '.wpoi-type-edit-button', function( event ) {
		var optinId = $( this ).data( 'id' );
		var optinType = $( this ).data( 'type' );
		event.preventDefault();
		window.location.href = 'admin.php?page=inc_optin&optin=' + optinId + '#display/' + optinType;
	});

	/**
	 * Make 'for' attribute work on tags that don't support 'for' by default
	 *
	 */
	$( document ).on( 'click', '*[for]', function( e ) {
		var $this = $( this ),
			_for = $this.attr( 'for' ),
			$for = $( '#' + _for );

		if ( $this.is( 'label' ) || ! $for.length ) {
			return;
		}

		$for.trigger( 'change' );
		$for.trigger( 'click' );
	});

	$( '#wpoi-complete-message' ).fadeIn();

	$( document ).on( 'click', '#wpoi-complete-message .next-button button', function( e ) {
		$( '#wpoi-complete-message' ).fadeOut();
	});

	$( document ).on( 'click', '.wpoi-listing-page .wpoi-listing-wrap header.can-open', function( e ) {
		$( this ).find( '.open' ).trigger( 'click' );
	});

	/**
	 * On click of arrow of any optin in the listing page
	 *
	 */
	$( document ).on( 'click', '.wpoi-listing-page .wpoi-listing-wrap .can-open .open', function( e ) {
		var $this = $( this ),
			$panel = $this.closest( '.wpoi-listing-wrap' ),
			$section = $panel.find( 'section' ),
			$others = $( '.wpoi-listing-wrap' ).not( $panel ),
			$otherSections = $( '.wpoi-listing-wrap section' ).not( $section );
		e.stopPropagation();

		$otherSections.slideUp( 300, function() {
			$otherSections.removeClass( 'open' );
		});
		$others.find( '.dev-icon' ).removeClass( 'dev-icon-caret_up' ).addClass( 'dev-icon-caret_down' );

		$section.slideToggle( 300, function() {
			$panel.toggleClass( 'open' );
			$panel.find( '.dev-icon' ).toggleClass( 'dev-icon-caret_up dev-icon-caret_down' );
		});

	});

	Optin.decorateNumberInputs = function( elem ) {
		var $items =  elem && elem.$el ? elem.$el.find( '.wph-input--number input' ) : $( '.wph-input--number input' ),
			tpl = Hustle.createTemplate( '<div class="wph-nbr--nav"><div class="wph-nbr--button wph-nbr--up {{disabled}}">+</div><div class="wph-nbr--button wph-nbr--down {{disabled}}">-</div></div>' )
		;
		$items.each( function() {
			var $this = $( this ),
				disabledClass = $this.is( ':disabled' ) ? 'disabled' : '';

			// Add + and - buttons only if it's not already added
			if ( ! $this.siblings( '.wph-nbr--nav' ).length ) {
				$this.after( tpl({ disabled: disabledClass }) );
			}

		});

	};

	Hustle.Events.on( 'view.rendered', Optin.decorateNumberInputs );

	// Listen to number input + and - click events
	( function() {
		$( document ).on( 'click', '.wph-nbr--up:not(.disabled)', function( e ) {
			var $this = $( this ),
				$wrap = $this.closest( '.wph-input--number' ),
				$input = $wrap.find( 'input' ),
				oldValue = parseFloat( $input.val() ),
				min = $input.attr( 'min' ),
				max = $input.attr( 'max' ),
				newVal;

			if ( oldValue >= max ) {
				newVal = oldValue;
			} else {
				newVal = oldValue + 1;
			}

			if ( newVal !== oldValue ) {
				$input.val( newVal ).trigger( 'change' );
			}
		});

		$( document ).on( 'click', '.wph-nbr--down:not(.disabled)', function( e ) {
			var $this = $( this ),
				$wrap = $this.closest( '.wph-input--number' ),
				$input = $wrap.find( 'input' ),
				oldValue = parseFloat( $input.val() ),
				min = $input.attr( 'min' ),
				max = $input.attr( 'max' ),
				newVal;


			if ( oldValue <= min ) {
				newVal = oldValue;
			} else {
				newVal = oldValue - 1;
			}

			if ( newVal !== oldValue ) {
				$input.val( newVal ).trigger( 'change' );
			}
		});
	}() );

	// Sticky eye icon
	( function() {
		function stickyRelocate() {
			var windowTop = $( window ).scrollTop();
			var divTop = $( '.wph-sticky--anchor' );

			if ( ! divTop.length ) {
				return;
			}

			divTop = divTop.offset().top;
			if ( windowTop > divTop ) {
				$( '.wph-preview--eye' ).addClass( 'wph-sticky--element' );
				$( '.wph-sticky--anchor' ).height( $( '.wph-preview--eye' ).outerHeight() );
			} else {
				$( '.wph-preview--eye' ).removeClass( 'wph-sticky--element' );
				$( '.wph-sticky--anchor' ).height( 0 );
			}
		}
		$( function() {
			$( window ).scroll( stickyRelocate );
			stickyRelocate();
		});
	}() );

}( jQuery, document ) );

Hustle.define( 'Integration_Modal_Handler', function( $ ) {
	'use strict';

	return Backbone.View.extend({

		events: {
			'click .hustle-provider-connect': 'connectAddOn',
			'click .hustle-provider-disconnect': 'disconnectAddOn',
			'click .hustle-provider-next': 'submitNextStep',
			'click .hustle-provider-back': 'goPrevStep',
			'click .hustle-refresh-email-lists': 'refreshLists',
			'click .hustle-provider-form-disconnect': 'disconnectAddOnForm',
			'click .hustle-provider-clear-radio-options': 'clearRadioOptions',
			'keypress .sui-dialog-content': 'preventEnterKeyFromDoingThings',
			'change select#group': 'showInterests'
		},

		preventEnterKeyFromDoingThings( e ) {
			if ( 13 === e.which ) { // the enter key code
				e.preventDefault();

				if ( this.$( '.hustle-provider-connect' ).length ) {
					this.$( '.hustle-provider-connect' ).trigger( 'click' );

				} else if ( this.$( '.hustle-provider-next' ).length ) {
					this.$( '.hustle-provider-next' ).trigger( 'click' );
				}
			}
		},

		initialize: function( options ) {

			this.slug      = options.slug;
			this.nonce     = options.nonce;
			this.action    = options.action;
			// eslint-disable-next-line camelcase
			this.moduleId = options.moduleId;
			// eslint-disable-next-line camelcase
			this.multi_id  = options.multiId;
			this.globalMultiId = options.globalMultiId;
			this.step = 0;
			// eslint-disable-next-line camelcase
			this.next_step = false;
			// eslint-disable-next-line camelcase
			this.prev_step = false;

			return this.render();
		},

		render: function() {

			const data = {};

			data.action = this.action;
			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = {};
			data.data.slug = this.slug;
			data.data.step = this.step;
			// eslint-disable-next-line camelcase
			data.data.current_step = this.step;
			if ( this.moduleId ) {
				// eslint-disable-next-line camelcase
				data.data.module_id = this.moduleId;
			}
			if ( this.multi_id ) {
				// eslint-disable-next-line camelcase
				data.data.multi_id = this.multi_id;
			}
			if ( this.globalMultiId ) {
				// eslint-disable-next-line camelcase
				data.data.global_multi_id = this.globalMultiId;
			}

			this.request( data, false, true );
		},

		applyLoader: function( $element ) {
			$element.find( '.sui-button:not(.disable-loader)' ).addClass( 'sui-button-onload' );
		},

		resetLoader: function( $element ) {
			$element.find( '.sui-button' ).removeClass( 'sui-button-onload' );
		},

		request: function( data, close, loader ) {

			let self = this;

			if ( loader ) {
				this.$el
					.find( '.sui-box-body' )
					.addClass( 'sui-block-content-center' )
					.html(

						// TODO: translate "loading content".
						'<p class="sui-loading-dialog" aria-label="Loading content"><i class="sui-icon-loader sui-loading" aria-hidden="true"></i></p>'
					);
				this.$el.find( '.sui-box-footer' ).html( '' );
				this.$el.find( '.integration-header' ).html( '' );
			}

			this.applyLoader( this.$el );

			this.ajax = $
			.post({
				url: ajaxurl,
				type: 'post',
				data: data
			})
			.done( function( result ) {
				if ( result && result.success ) {

					// Render popup body
					self.renderBody( result );

					// Render popup footer
					self.renderFooter( result );

					// Shorten result data
					const resultData = result.data.data;

					self.onRender( resultData );

					self.resetLoader( self.$el );

					// Handle close modal
					if ( close || ( ! _.isUndefined( resultData.is_close ) && resultData.is_close ) ) {
						self.close( self );
					}

					// Add closing event
					self.$el.find( '.hustle-provider-close' ).on( 'click', function() {
						self.close( self );
					});

					// Handle notifications
					if (
						! _.isUndefined( resultData.notification ) &&
						! _.isUndefined( resultData.notification.type ) &&
						! _.isUndefined( resultData.notification.text )
					) {
						const custom = Module.Notification;
						custom.open(
							resultData.notification.type,
							resultData.notification.text
						);
					}

					// Show Mailchimp interests is Group is already choosen
					if ( 'mailchimp' === self.slug ) {
						let group = self.$el.find( '#group' );
						if ( group.length ) {
							group.trigger( 'change' );
						}
					}
				}

			});

			// Remove the preloader
			this.ajax.always( function() {
				self.$el.find( '.sui-box-body' ).removeClass( 'sui-block-content-center' );
				self.$el.find( '.sui-loading-dialog' ).remove();
			});
		},

		renderBody: function( result ) {

			this.$el.find( '.sui-box-body' ).html( result.data.data.html );

			// append header to integration-header
			let integrationHeader = this.$el.find( '.sui-box-body .integration-header' ).remove();

			if ( 0 < integrationHeader.length ) {
				this.$el.find( '.integration-header' ).html( integrationHeader.html() );
			}

			// Hide empty content
			if ( ! $.trim( this.$el.find( '.sui-box-body' ).html() ).length ) {
				this.$el.find( '.sui-box-body' ).addClass( 'sui-hidden' );
				this.$el.find( '.sui-box-footer' ).css( 'padding-top', '' );

			} else {

				const children = this.$el.find( '.sui-box-body' ).children();
				let hideBody = true;

				$.each( children, ( i, child ) => {

					if ( ! $( child ).is( ':hidden' ) ) {
						hideBody = false;
					}
				});

				// Hide the content only when all children are hidden.
				if ( hideBody ) {
					this.$el.find( '.sui-box-body' ).addClass( 'sui-hidden' );
					this.$el.find( '.sui-box-footer' ).css( 'padding-top', '' );

				} else {

					// Load SUI select
					this.$el.find( '.sui-box-body select' ).each( function() {
						SUI.suiSelect( this );
					});

					// FIX: Prevent extra spacing.
					if ( this.$el.find( '.sui-box-body .sui-notice' ).next().is( 'input[type="hidden"]' ) ) {
						this.$el.find( '.sui-box-body .sui-notice' ).css({
							'margin-bottom': '0'
						});
					}
				}

			}
		},

		renderFooter: function( result ) {

			var self = this,
				buttons = result.data.data.buttons,
				body = self.$el.find( '.sui-box-body' ),
				footer = self.$el.find( '.sui-box-footer' )
				;

			// Clear footer from previous buttons
			self.$el.find( '.sui-box-footer' )
				.removeClass( 'sui-hidden' )
				.removeClass( 'sui-hidden-important' )
				.removeClass( 'sui-box-footer-center' )
				.removeClass( 'sui-box-footer-right' )
				.html( '' )
				;

			// Append buttons
			_.each( buttons, function( button ) {

				self.$el.find( '.sui-box-footer' )
					.append( button.markup )
					;
			});

			if ( 0 === footer.find( '.sui-button' ).length ) {
				footer.addClass( 'sui-hidden-important' );
			} else {

				if ( body.find( '.hustle-installation-error' ).length ) {
					footer.addClass( 'sui-hidden-important' );
				}

				// FIX: Align buttons to center.
				if ( footer.find( '.sui-button' ).hasClass( 'sui-button-center' ) ) {
					footer.addClass( 'sui-box-footer-center' );

				// FIX: Align buttons to right.
				} else if ( footer.find( '.sui-button' ).hasClass( 'sui-button-right' ) ) {

					if ( ! footer.find( '.sui-button' ).hasClass( 'sui-button-left' ) ) {
						footer.addClass( 'sui-box-footer-right' );
					}
				}
			}
		},

		onRender: function( result ) {
			var self = this;

			this.delegateEvents();

			// Update current step
			if ( ! _.isUndefined( result.opt_in_provider_current_step ) ) {
				this.step = +result.opt_in_provider_current_step;
			}

			// Update has next step
			if ( ! _.isUndefined( result.opt_in_provider_has_next_step ) ) {
				// eslint-disable-next-line camelcase
				this.next_step = result.opt_in_provider_has_next_step;
			}

			// Update has prev step
			if ( ! _.isUndefined( result.opt_in_provider_has_prev_step ) ) {
				// eslint-disable-next-line camelcase
				this.prev_step = result.opt_in_provider_has_prev_step;
			}

			self.$el.find( 'select' ).each( function() {
				SUI.suiSelect( this );
			});

			self.$el.find( '.sui-select' ).SUIselect2({
				dropdownCssClass: 'sui-select-dropdown'
			});
		},

		refreshLists: function( e ) {
			e.preventDefault();
			e.stopPropagation();

			let $this = $( e.currentTarget ),
				id = this.moduleId,
				slug = this.slug,
				type = $( '#form_id' ).length ? 'forms' : 'lists',
				nonce = this.nonce;

			$this.addClass( 'sui-button-onload' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'hustle_refresh_email_lists',
					id: id,
					slug: slug,
					type: type,
					_ajax_nonce: nonce // eslint-disable-line camelcase
				}
			})
			.done( function( result ) {
				if ( result.success ) {
					if ( 'undefined' !== typeof result.data.select ) {
						let select = $this.siblings( 'select' );
						select.next().remove();
						select.remove();
						$this.before( result.data.select );
						$this.siblings( '.sui-select' ).SUIselect2({
							dropdownCssClass: 'sui-select-dropdown'
						});
					}
				}
			})
			.error( function( res ) {

				// TODO: handle errors
				console.log( res );
			})
			.always( function() {
				$this.removeClass( 'sui-button-onload' );
			});

		},

		submitNextStep: function( e ) {
			let data = {},
				form = this.$el.find( 'form' ),
				params = {
					slug: this.slug,
					step: this.getStep(),
					// eslint-disable-next-line camelcase
					current_step: this.step
				},
				formData = form.serialize();

			if ( this.moduleId ) {
				// eslint-disable-next-line camelcase
				params.module_id = this.moduleId;
			}

			formData = formData + '&' + $.param( params );
			data.action = this.action;
			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = formData;

			this.request( data, false, false );

		},

		goPrevStep: function( e ) {
			let data     = {},
				params   = {
					'slug': this.slug,
					'step': this.getPrevStep(),
					'current_step': this.step
				}
			;

			if ( this.moduleId ) {
				// eslint-disable-next-line camelcase
				params.module_id = this.moduleId;
			}
			if ( this.multi_id ) {
				// eslint-disable-next-line camelcase
				params.multi_id = this.multi_id;
			}

			data.action = this.action;
			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = params;

			this.request( data, false, false );
		},

		getStep: function() {
			if ( this.next_step ) {
				return this.step + 1;
			}

			return this.step;
		},

		getPrevStep: function() {
			if ( this.prev_step ) {
				return this.step - 1;
			}

			return this.step;
		},

		connectAddOn: function() {
			const data = {},
				form = this.$el.find( 'form' ),
				params = {
					slug: this.slug,
					step: this.getStep(),
					// eslint-disable-next-line camelcase
					current_step: this.step
				};

			let formData = form.serialize();

			if ( this.moduleId ) {
				// eslint-disable-next-line camelcase
				params.module_id = this.moduleId;
			}
			if ( this.multi_id ) {
				// eslint-disable-next-line camelcase
				params.multi_id = this.multi_id;
			}

			formData = formData + '&' + $.param( params );
			data.action = this.action;
			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = formData;

			this.request( data, false, false );
		},

		disconnectAddOn: function( e ) {
			var self  = this,
				img   = this.$el.find( '.sui-dialog-image img' ).attr( 'src' ),
				title = this.$el.find( '#dialogTitle2' ).html();
			const data = {},
			isActiveData = {};

			var modules = {},
			warningFlag = $( 'hustle-dialog--remove-active-warning' ).val();

			data.action = 'hustle_provider_deactivate';
			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = {};
			data.data.slug = this.slug;
			data.data.img  = img;
			data.data.title = title;


			if ( this.globalMultiId ) {
				// eslint-disable-next-line camelcase
				data.data.global_multi_id = this.globalMultiId;
			}

			isActiveData.action = 'hustle_provider_is_on_module';
			// eslint-disable-next-line camelcase
			isActiveData._ajax_nonce = this.nonce;
			isActiveData.data = {};
			isActiveData.data.slug = this.slug;
			isActiveData.data.globalMultiId = this.globalMultiId;

			this.$el.find( '.sui-button:not(.disable-loader)' ).addClass( 'sui-button-onload' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: isActiveData,
				success: function( resp ) {
					if ( true === resp.success ) {
						modules = resp;
					}
				},
				complete: function() {
					if ( true === modules.success ) {
						Module.integrationsActiveRemove.open( modules.data, data, self );
					} else {
						self.request( data, true, false );
					}
				}
			});

		},

		disconnectAddOnForm: function( e ) {
			var self = this;

			const data = {};

			let active 		 	= $( '#hustle-integrations-active-count' ).val(),
			activeIntegration 	= $( '#hustle-integrations-active-integrations' ).val();
			data.action 		= 'hustle_provider_form_deactivate';

			// eslint-disable-next-line camelcase
			data._ajax_nonce = this.nonce;
			data.data = {};
			data.data.slug = this.slug;

			// eslint-disable-next-line camelcase
			data.data.module_id = this.moduleId;

			if ( this.multi_id ) {
				// eslint-disable-next-line camelcase
				data.data.multi_id = this.multi_id;
			}

			if ( 1 == active && activeIntegration === this.slug && 'local_list' !== this.slug ) {
				Module.integrationsAllRemove.open( data, self );
			} else if ( 1 == active && 'local_list' === this.slug ) {
				Module.Notification.open( 'error', optinVars.messages.integraiton_required );
			} else {
				this.request( data, true, false );
			}
		},

		close: function( self ) {

			// Kill AJAX hearbeat
			self.ajax.abort();

			// Remove the view
			self.remove();

			// Reset body scrollbar
			$( 'body' ).css( 'overflow', 'auto' );

			// Refrest add-on list
			Hustle.Events.trigger( 'hustle:providers:reload' );
		},

		clearRadioOptions: function() {
			this.$( 'input[type=radio]', this.$el ).removeAttr( 'checked' );
		},

		//show interests for mailchimp
		showInterests: function( e ) {
			let self = this,
				$this = $( e.currentTarget ),
				nonce = $this.data( 'nonce' ),
				group = $this.val(),
				data = {},
				form = self.$el.find( 'form' ),
				params = {
					slug: self.slug,
					group: group,
					'module_id': self.moduleId
				},
				formData = form.serialize();

			formData = formData + '&' + $.param( params );
			data.action = 'hustle_mailchimp_get_group_interests';
			// eslint-disable-next-line camelcase
			data._ajax_nonce = nonce;
			data.data = formData;

			self.applyLoader( self.$el );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data
			})
			.done( function( result ) {
				if ( result.success ) {
					form.find( '.sui-form-field' ).slice( 1 ).remove();
					form.find( '.sui-form-field:first-child' ).after( result.data );

					self.$el.find( '.sui-select' ).SUIselect2({
						dropdownCssClass: 'sui-select-dropdown'
					});
				}
			})
			.error( function( res ) {

				// TODO: handle errors
				console.log( res );
			})
			.always( function() {
				self.resetLoader( self.$el );
			});
		}

	});

});

var Module = window.Module || {};

Hustle.define( 'Model', function( $ ) {
	'use strict';

	return Backbone.Model.extend({

		initialize: function() {
			this.on( 'change', this.userHasChange, this );
			Backbone.Model.prototype.initialize.apply( this, arguments );
		},

		userHasChange: function() {

			Module.hasChanges = true;

			// Add the "unsaved" status tag to the module screen.
			Hustle.Events.trigger( 'modules.view.switch_status', 'unsaved' );
		}
	});
});

Hustle.define( 'Models.M', function() {
	'use strict';
	return Hustle.get( 'Model' ).extend({
			toJSON: function() {
				var json = _.clone( this.attributes );
                var attr;
				for ( attr in json ) {
					if ( ( json[ attr ] instanceof Backbone.Model ) || ( json[ attr ] instanceof Backbone.Collection ) ) {
						json[ attr ] = json[ attr ].toJSON();
					}
				}
				return json;
			},
			set: function( key, val, options ) {
                var parent, child, parentModel;

				if ( 'string' === typeof key && -1 !== key.indexOf( '.' ) ) {
					parent = key.split( '.' )[ 0 ];
					child = key.split( '.' )[ 1 ];
					parentModel = this.get( parent );

					if ( parentModel && parentModel instanceof Backbone.Model ) {
						parentModel.set( child, val, options );
						this.trigger( 'change:' + key, key, val, options );
						this.trigger( 'change:' + parent, key, val, options );
					}

				} else {
					Backbone.Model.prototype.set.call( this, key, val, options );
				}
			},
			get: function( key ) {
                var parent, child;
				if ( 'string' === typeof key && -1 !== key.indexOf( '.' ) ) {
					parent = key.split( '.' )[ 0 ];
					child = key.split( '.' )[ 1 ];
					return this.get( parent ).get( child );
				} else {
					return Backbone.Model.prototype.get.call( this, key );
				}
			}
		});
});

Hustle.define( 'Models.Trigger', function() {
	'use strict';
	return  Hustle.get( 'Model' ).extend({
		defaults: {
			trigger: 'time', // time | scroll | click | exit_intent | adblock
			'on_time_delay': 0,
			'on_time_unit': 'seconds',
			'on_scroll': 'scrolled', // scrolled | selector
			'on_scroll_page_percent': '20',
			'on_scroll_css_selector': '',
			'enable_on_click_element': '1',
			'on_click_element': '',
			'enable_on_click_shortcode': '1',
			'on_exit_intent': '1',
			'on_exit_intent_per_session': '1',
			'on_exit_intent_delayed': '0',
			'on_exit_intent_delayed_time': 5,
			'on_exit_intent_delayed_unit': 'seconds',
			'on_adblock': '0'
		}
	});
});

Module.Model  = Hustle.get( 'Models.M' ).extend({
	defaults: {
		'module_name': '',
		moduleType: 'popup',
		active: '0'
	}
});

( function( $ ) {

	'use strict';

	var Module = window.Module || {};

	/**
	 * Render a notification at the top of the page.
	 * Used in the global settings page when saving, for example.
	 * @since 4.0
	 */
	Module.Notification = {

		initialize: function() {

			if ( ! $( '#hustle-notification' ).length ) {

				$( '<div role="alert" id="hustle-notification" class="sui-notice-top sui-notice-' + this.type + ' sui-can-dismiss">' +
					'<div class="sui-notice-content">' +
						'<p>' + this.text + '</p>' +
					'</div>' +
					'<span class="sui-notice-dismiss" aria-hidden="true">' +
						'<a role="button" href="#" aria-label="' + optinVars.messages.commons.dismiss + '" class="sui-icon-check"></a>' +
					'</span>' +
				'</div>' )
				.removeAttr( 'hidden' )
				.appendTo( $( 'main.sui-wrap' ) )
				.slideDown()
				;

				/**
				 * !!! TO IMPROVE:
				 *
				 * Uncomment code below and replace MODULE_ID with
				 * imported module ID to focus it.
				 *
				 * We also need to run this on window load.
				 */
				// $( '.sui-accordion-item-header[data-id="' + MODULE_ID + '"]' ).closest( '.sui-accordion-item' ).focus();

			} else {
				$( '#hustle-notification' ).remove();
				this.initialize();
			}
		},

		open: function( type, text, closeTime ) {

			var self = this;

			if ( _.isUndefined( closeTime ) ) {
				closeTime = 4000;
			}

			if ( 'undefined' !== typeof ( self.closeTimeout ) ) {
				window.clearTimeout( self.closeTimeout );
				delete self.closeTimeout;
				self.close();
			}

			this.type = type || 'notice';
			this.text = text;

			this.initialize();

			const $popup = $( '#hustle-notification' );

			$popup.removeClass( 'sui-hidden' );
			$popup.removeProp( 'hidden' );

			$( '.sui-notice-dismiss a' ).click( function( e ) {
				e.preventDefault();

				self.close();

				return false;
			});

			if ( closeTime ) {

				this.closeTimeout = setTimeout( function() {
					self.close();
				}, closeTime );
			}
		},

		close: function() {

			var $popup = $( '#hustle-notification' );

			$popup.addClass( 'sui-hidden' );
			$popup.prop( 'hidden', true );
			$popup.stop().slideUp( 'slow' );
		}
	};

	/**
	 * Render the modal used for editing the itnegrations' settings.
	 * @since 4.0
	 */
	Module.integrationsModal = {

		$popup: {},

		_deferred: {},

		open( e ) {

			var self = this;
			var $target = $( e.target );

			// Remove popup
			$( '#hustle-integration-popup' ).remove();

			if ( ! $target.hasClass( 'connect-integration' ) ) {
				$target = $target.closest( '.connect-integration' );
			}

			let closeClick = () => {
				self.close();
				return false;
			};

			let nonce = $target.data( 'nonce' ),
				slug = $target.data( 'slug' ),
				title =  $target.data( 'title' ),
				image = $target.data( 'image' ),
				action = $target.data( 'action' ),
				moduleId = $target.data( 'module_id' ),
				multiId = $target.data( 'multi_id' ),
				globalMultiId = $target.data( 'global_multi_id' )
				;

			let tpl = Optin.template( 'hustle-integration-dialog-tpl' );

			$( 'main.sui-wrap' ).append( tpl({
				image: image,
				title: title
			}) );

			this.$popup = $( '#hustle-integration-dialog' );

			let settingsView = Hustle.get( 'Integration_Modal_Handler' ),
				view = new settingsView({
				slug: slug,
				nonce: nonce,
				action: action,
				moduleId: moduleId,
				multiId: multiId,
				globalMultiId,
				el: this.$popup
			});

			view.on( 'modal:closed', () => self.close() );

			this.$popup.find( '.hustle-popup-action' ).remove();

			// Add closing event
			this.$popup.find( '.sui-dialog-close' ).on( 'click', closeClick );
			this.$popup.find( '.sui-dialog-overlay' ).on( 'click', closeClick );
			this.$popup.on( 'click', '.hustle-popup-cancel', closeClick );
			this.$popup.find( '.sui-dialog-overlay' ).on( 'click', function() {
				$( this ).parent( '#hustle-integration-dialog' ).find( '.sui-dialog-close' ).trigger( 'click' );
			});

			// Open
			this.$popup.find( '.sui-dialog-overlay' ).removeClass( 'sui-fade-out' ).addClass( 'sui-fade-in' );
			this.$popup.find( '.sui-dialog-content' ).removeClass( 'sui-bounce-out' ).addClass( 'sui-bounce-in' );

			this.$popup.removeAttr( 'aria-hidden' );

			// hide body scrollbar
			$( 'body' ).css( 'overflow', 'hidden' );

			this._deferred = new $.Deferred();

			// Make sui-tabs changeable
			this.$popup.on( 'click', '.sui-tab-item', function( e ) {
				let $this = $( e.currentTarget ),
					$items = $this.closest( '.sui-side-tabs' ).find( '.sui-tab-item' );

				$items.removeClass( 'active' );
				$this.addClass( 'active' );
			});

			return this._deferred.promise();

		},

		close( result ) {

			var $popup = $( '#hustle-integration-popup' );

			$popup.find( '.sui-dialog-overlay' ).removeClass( 'sui-fade-in' ).addClass( 'sui-fade-out' );
			$popup.find( '.sui-dialog-content' ).removeClass( 'sui-bounce-in' ).addClass( 'sui-bounce-out' );

			// reset body scrollbar
			$( 'body' ).css( 'overflow', 'auto' );

			setTimeout( function() {
				$popup.attr( 'aria-hidden', 'true' );
			}, 300 );

			this._deferred.resolve( this.$popup, result );
		}
	};

	/**
	 * Render the modal used when removing the only left integration.
	 * @since 4.0.1
	 */
	Module.integrationsAllRemove = {

		$popup: {},

		_deferred: {},

		/**
		 * @since 4.0.2
		 * @param ModuleID
		 */
		open( data, referrer ) {

			var self = this;

			let dialogId = $( '#hustle-dialog--final-delete' );

			let closeClick = () => {
				self.close();
				return false;
			};

			let insertLocal = ( data ) => {
				self.insertLocalList( data );
				return false;
			};

			let deleteInt = ( data, referrer ) => {
				self.deleteIntegration( data, referrer );
				return false;
			};

			// Add closing event
			dialogId.find( '.sui-dialog-close' ).on( 'click', closeClick );
			dialogId.find( '.sui-dialog-overlay' ).on( 'click', closeClick );
			dialogId.find( '#hustle-delete-final-button-cancel' ).on( 'click', closeClick );

			$( '#hustle-delete-final-button' ).off( 'click' ).on( 'click', function( e ) {
				$( '#hustle-delete-final-button' ).addClass( 'sui-button-onload' );
				deleteInt( data, referrer );
				insertLocal( data );
				closeClick();
			});

			$( '#hustle-integration-dialog' ).addClass( 'sui-fade-out' ).hide();
			$( '#hustle-delete-final-button' ).removeAttr( 'disabled' );

			SUI.dialogs[ 'hustle-dialog--final-delete' ].show();
		},

		close() {

			var $popup = $( '#hustle-dialog--final-delete' );

			$popup.find( '.sui-dialog-overlay' ).removeClass( 'sui-fade-in' ).addClass( 'sui-fade-out' );
			$popup.find( '.sui-dialog-content' ).removeClass( 'sui-bounce-in' ).addClass( 'sui-bounce-out' );
			$( '#hustle-delete-final-button' ).removeClass( 'sui-button-onload' );
			$( '#hustle-integration-dialog' ).remove();

			// reset body scrollbar
			$( 'body' ).css( 'overflow', 'auto' );
			$( '#hustle-delete-final-button' ).attr( 'disabled' );

			setTimeout( function() {
				$popup.attr( 'aria-hidden', 'true' );
			}, 300 );

			SUI.dialogs[ 'hustle-dialog--final-delete' ].hide();
		},

		confirmDelete( data, referrer ) {
			this.deleteIntegration( data, referrer );
			this.insertLocal( data );
			this.close();
		},
		deleteIntegration( data, referrer ) {
			referrer.request( data, true, false );
		},

		insertLocalList( data ) {
			let ajaxData = {
				id: data.data.module_id,
				'_ajax_nonce': data._ajax_nonce,
				action: 'hustle_provider_insert_local_list'
			};
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: ajaxData,
				success: function( resp ) {
					if ( resp.success ) {
						Hustle.Events.trigger( 'hustle:providers:reload' );
					} else {
						if ( 'undefined' === typeof SUI.dialogs[ 'hustle-dialog--final-delete' ]) {
							Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
							return;
						}
						SUI.dialogs[ 'hustle-dialog--final-delete' ].hide();
					}
				},
				error: function() {
					Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
					SUI.dialogs[ 'hustle-dialog--final-delete' ].hide();
				}
			});
		}
	};

	/**
	 * Render the modal used when removing the only left integration.
	 * @since 4.0.1
	 */
	Module.integrationsActiveRemove = {

		$popup: {},

		_deferred: {},

		/**
		 * @since 4.0.2
		 * @param ModuleID
		 */
		open( data, disconnect, referrer ) {

			var self = this;

			let dialogId = $( '#hustle-dialog--remove-active' );

			let closeClick = () => {
				self.close();
				return false;
			};

			let goBack = () => {
				self.back( referrer );
				return false;
			};

			let removeIntegration = ( data, referrer, modules ) => {
				self.removeIntegration( data, referrer, modules );
				closeClick();
			};

			let tpl 	= Optin.template( 'hustle-modules-active-integration-tpl' ),
				tplImg  = Optin.template( 'hustle-modules-active-integration-img-tpl' ),
				tplHead = Optin.template( 'hustle-modules-active-integration-header-tpl' ),
				tplDesc = Optin.template( 'hustle-modules-active-integration-desc-tpl' );

			//remove previous html
			$( '#hustle-dialog--remove-active tbody' ).html( '' );
			$( '#hustle-dialog--remove-active .sui-dialog-image' ).html( '' );
			$( '#hustle-dialog--remove-active #sui-box-modal-header' ).html( '' );
			$( '#hustle-dialog--remove-active #sui-box-modal-content' ).html( '' );

			$( '#hustle-dialog--remove-active .sui-dialog-image' ).append( tplImg({
				image: disconnect.data.img,
				title: disconnect.data.slug
			}) );

			$( '#hustle-dialog--remove-active #sui-box-modal-header' ).append( tplHead({
				title: disconnect.data.title.replace( /Connect|Configure/gi, ' ' )
			}) );

			$( '#hustle-dialog--remove-active #sui-box-modal-content' ).append( tplDesc({
				title: disconnect.data.title.replace( /Connect|Configure/gi, ' ' )
			}) );

			$.each( data, function( id, meta ) {

				$( '#hustle-dialog--remove-active tbody' ).append( tpl({
					name: meta.name,
					type: meta.type,
					editUrl: meta.edit_url
				}) );
			});

			// Add closing event
			dialogId.find( '.sui-dialog-close' ).on( 'click', closeClick );
			dialogId.find( '.sui-dialog-overlay' ).on( 'click', closeClick );
			dialogId.find( '#hustle-remove-active-button-cancel' ).on( 'click', closeClick );
			dialogId.find( '.hustle-remove-active-integration-back' ).on( 'click', function() {
				goBack();
			});

			$( '#hustle-remove-active-button' ).off( 'click' ).on( 'click', function( event ) {
				$( this ).addClass( 'sui-button-onload' );
				removeIntegration( disconnect, referrer, data );
			});

			$( '#hustle-integration-dialog' ).addClass( 'sui-fade-out' ).hide();

			SUI.dialogs[ 'hustle-dialog--remove-active' ].show();
		},

		close() {

			var $popup = $( '#hustle-dialog--remove-active' );

			$popup.find( '.sui-dialog-overlay' ).removeClass( 'sui-fade-in' ).addClass( 'sui-fade-out' );
			$popup.find( '.sui-dialog-content' ).removeClass( 'sui-bounce-in' ).addClass( 'sui-bounce-out' );
			$( '#hustle-delete-final-button' ).removeClass( 'sui-button-onload' );
			$( '#hustle-integration-dialog' ).remove();

			// reset body scrollbar
			$( 'body' ).css( 'overflow', 'auto' );

			setTimeout( function() {
				$popup.attr( 'aria-hidden', 'true' );
			}, 300 );

			SUI.dialogs[ 'hustle-dialog--remove-active' ].hide();
		},
		back( slug ) {
			var self = this;
			self.close();

			//integrations that doesn't support global multi id.
			if ( 'hubspot' === slug.slug || 'constantcontact' === slug.slug ) {
				$( 'button[data-slug="' + slug.slug + '"]' ).trigger( 'click' );
			} else {
				$( 'button[data-global_multi_id="' + slug.globalMultiId + '"]' ).trigger( 'click' );
			}
		},

		removeIntegration( data, referrer, modules ) {
			var self = this;
			$.each( modules, function( id, meta ) {
				if ( data.data.slug === meta.active.active_integrations ) {
					self.insertLocalList( data, id );
				}
			});

			referrer.request( data, true, false );
			$( '#hustle-remove-active-button' ).removeClass( 'sui-button-onload' );
		},

		insertLocalList( data, id ) {
			let ajaxData = {
				id: id,
				'_ajax_nonce': data._ajax_nonce,
				action: 'hustle_provider_insert_local_list'
			};
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: ajaxData,
				success: function( resp ) {
					if ( false === resp.success ) {
						Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
						return;
					}
				},
				error: function() {
					Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
				}
			});
		}
	};

	/**
	 * The provider migration model
	 * @since 4.0.3
	 */
	Module.ProviderMigration = {

		$popup: {},

		_deferred: {},

		/**
		 * @since 4.0.3
		 * @param object slug of provider.
		 */
		open( slug ) {

			let	dialogId = $( '#hustle-dialog-migrate--' + slug ),
				closeClick = () => {
					self.close( dialogId, slug );
					return false;
				};

			dialogId.find( '.sui-dialog-close' ).on( 'click', closeClick );
			dialogId.find( '.sui-dialog-overlay' ).on( 'click', closeClick );
			setTimeout( () =>  SUI.dialogs[ 'hustle-dialog-migrate--' + slug ].show(), 300 );
		},
		close( dialogId, slug ) {

			dialogId.find( '.sui-dialog-overlay' ).removeClass( 'sui-fade-in' ).addClass( 'sui-fade-out' );
			dialogId.find( '.sui-dialog-content' ).removeClass( 'sui-bounce-in' ).addClass( 'sui-bounce-out' );

			// reset body scrollbar
			$( 'body' ).css( 'overflow', 'auto' );

			setTimeout( () =>  dialogId.attr( 'aria-hidden', 'true' ), 300 );

			SUI.dialogs[ 'hustle-dialog-migrate--' + slug ].hide();
		}
	};

	/**
	 * The "are you sure?" modal from when deleting modules or entries.
	 * @since 4.0
	 */
	Module.deleteModal = {

		/**
		 * @since 4.0
		 * @param object data - must contain 'title', 'description', 'nonce', 'action', and 'id' that's being deleted.
		 */
		open( data, show = true ) {
			let dialogId = 'hustle-dialog--delete',
				template = Optin.template( 'hustle-dialog--delete-tpl' ),
				content = template( data );

			// Add the templated content to the modal.
			$( '#' + dialogId + ' #hustle-delete-dialog-content' ).html( content );

			// Add the title to the modal.
			$( '#' + dialogId + ' #hustle-dialog-title' ).html( data.title );

			if ( 'undefined' === typeof SUI.dialogs[ dialogId ]) {
				Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
				return false;
			}

			$( '#' + dialogId + ' .hustle-delete-confirm' ).on( 'click', function( e ) {
				let $button = $( e.currentTarget );
				$button.addClass( 'sui-button-onload' );
			});

			SUI.dialogs[ dialogId ].create();

			if ( show ) {
				SUI.dialogs[ dialogId ].show();
			}
		}
	};

	/**
	 * Open the module's preview.
	 * Shows the module if it's slide-in or pop-up.
	 * Open a modal containing the module if it's embedded or social sharing. This should be already rendered in the page.
	 * @since 4.0
	 */
	Module.preview = {

		open( id, type, previewData = false ) {
			const me = this,
				isInline = ( 'embedded' === type || 'social_sharing' === type );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'hustle_preview_module',
					id,
					previewData
				}
			})
			.then( function( res ) {

				if ( res.success ) {

					let $previewContainer = '';

					// Fill a regular div if they're not inline modules.
					if ( ! isInline ) {
						$previewContainer = $( '#module-preview-container' );

						// If it doesn't exist already, add it.
						if ( ! $previewContainer.length ) {
							$( 'main.sui-wrap' ).append( '<div id="module-preview-container"></div>' );
							$previewContainer = $( '#module-preview-container' );
						}

					} else { // Use the preview modal for inline modules.
						$previewContainer = $( '#hustle-dialog--preview .sui-box-body' );

					}

					$previewContainer.html( res.data.html );
					const $module = $previewContainer.find( '.hustle-ui' );

					HUI.maybeRenderRecaptcha( $module );

					// Load select2 if this module has select fields.
					if ( $module.find( '.hustle-select2' ).length ) {
						HUI.select2();
					}

					// If there's a timepicker.
					if ( $module.find( '.hustle-time' ).length ) {
						HUI.timepicker( '.hustle-time' );
					}

					// If there's a datepicker.
					if ( $module.find( '.hustle-date' ).length ) {
						const { days_and_months: strings } = optinVars.messages;
						HUI.datepicker( '.hustle-date', strings.days_full, strings.days_short, strings.days_min, strings.months_full, strings.months_short );
					}

					HUI.nonSharingSimulation( $module );
					HUI.inputFilled();

					if ( res.data.style ) {
						$previewContainer.append( res.data.style );
					}

					if ( res.data.script ) {
						$previewContainer.append( res.data.script );
					}

				}

				return {
					id,
					data: res.data.module
				};
			},
			function( res ) {

				// TODO: handle errors
				console.log( res );
			})
			.then( function({ id, data }) {

				// If no ID, abort.
				if ( ! id ) {
					return;
				}

				// Display the preview modal for inline modules.
				if ( isInline ) {
					SUI.dialogs['hustle-dialog--preview'].show();

				}

				// Display the module.
				me.showModule( id, data );

			})
			.always( function() {
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
			});
		},

		showModule( id, data ) {

			const el = '.hustle_module_id_' + id;

			if ( 'popup' === data.module_type ) {
				const autohideDelay = '0' === String( $( el ).data( 'close-delay' ) ) ? false : $( el ).data( 'close-delay' );
				HUI.popupLoad( el, autohideDelay );

			} else if ( 'slidein' === data.module_type ) {
				const autohideDelay = '0' === String( $( el ).data( 'close-delay' ) ) ? false : $( el ).data( 'close-delay' );
				HUI.slideinLayouts( el );
				HUI.slideinLoad( el, autohideDelay );

				$( window ).on( 'resize', function() {
					HUI.slideinLayouts( el );
				});

			} else {
				HUI.inlineResize( el );
				HUI.inlineLoad( el );
			}

		}
	};

	/**
	 * Renders the module's charts in the listing pages.
	 * It also handles the view when the 'conversions type' select changes.
	 * @since 4.0.4
	 */
	Module.trackingChart = {

		chartsData: {},
		theCharts: {},

		init( $container, chartsData ) {

			$container.find( 'select.hustle-conversion-type' ).each( ( i, el ) => {
				SUI.suiSelect( el );
				$( el ).on( 'change.select2', ( e ) => this.conversionTypeChanged( e, $container ) );
			});

			this.chartsData = chartsData;
			Object.values( chartsData ).forEach( chart => this.updateChart( chart ) );
		},

		conversionTypeChanged( e, $container ) {
			const $select = $( e.currentTarget ),
				conversionType = $select.val(),
				moduleSubType = $select.data( 'moduleType' ),
				subTypeChart = this.chartsData[ moduleSubType ],
				$conversionsCount = $container.find( `.hustle-tracking-${ moduleSubType }-conversions-count` ),
				$conversionsRate = $container.find( `.hustle-tracking-${ moduleSubType }-conversions-rate` );

			// Update the number for the conversions count and conversion rate at the top of the chart.
			$conversionsCount.text( subTypeChart[ conversionType ].conversions_count );
			$conversionsRate.text( subTypeChart[ conversionType ].conversion_rate + '%' );

			this.updateChart( subTypeChart, conversionType, false );
		},

		updateChart( chart, conversionType = 'all', render = true ) {

			let views = chart.views,
				submissions = chart[ conversionType ].conversions,

			datasets = [
				{
					label: 'Submissions',
					data: submissions,
					backgroundColor: [
						'#E1F6FF'
					],
					borderColor: [
						'#17A8E3'
					],
					borderWidth: 2,
					pointRadius: 0,
					pointHitRadius: 20,
					pointHoverRadius: 5,
					pointHoverBorderColor: '#17A8E3',
					pointHoverBackgroundColor: '#17A8E3'
				},
				{
					label: 'Views',
					data: views,
					backgroundColor: [
						'#F8F8F8'
					],
					borderColor: [
						'#DDDDDD'
					],
					borderWidth: 2,
					pointRadius: 0,
					pointHitRadius: 20,
					pointHoverRadius: 5,
					pointHoverBorderColor: '#DDDDDD',
					pointHoverBackgroundColor: '#DDDDDD'
				}
			];

			// The chart was already created. Update it.
			if ( 'undefined' !== typeof this.theCharts[ chart.id ]) {

				// The container has been re-rendered, so render the chart again.
				if ( render ) {
					this.theCharts[ chart.id ].destroy();
					this.createNewChart( chart, datasets );

				} else {

					// Just update the chart otherwise.
					this.theCharts[ chart.id ].data.datasets = datasets;
					this.theCharts[ chart.id ].update();
				}

			} else {
				this.createNewChart( chart, datasets );
			}
		},

		createNewChart( chart, datasets ) {
			let yAxesHeight = ( Math.max( ...chart.views ) + 2 );
			const chartContainer = document.getElementById( chart.id );

			if ( Math.max( ...chart.views ) < Math.max( ...chart.conversions ) ) {
				yAxesHeight = ( Math.max( ...chart.conversions ) + 2 );
			}

			if ( ! chartContainer ) {
				return;
			}

			const days = chart.days,
				chartData = {
					labels: days,
					datasets
				};

			let chartOptions = {
				maintainAspectRatio: false,
				legend: {
					display: false
				},
				scales: {
					xAxes: [
						{
							display: false,
							gridLines: {
								color: 'rgba(0, 0, 0, 0)'
							}
						}
					],
					yAxes: [
						{
							display: false,
							gridLines: {
								color: 'rgba(0, 0, 0, 0)'
							},
							ticks: {
								beginAtZero: false,
								min: 0,
								max: yAxesHeight,
								stepSize: 1
							}
						}
					]
				},
				elements: {
					line: {
						tension: 0
					},
					point: {
						radius: 0.5
					}
				},
				tooltips: {
					custom: function( tooltip ) {

						if ( ! tooltip ) {
							return;
						}

						// Disable displaying the color box
						tooltip.displayColors = false;
					},
					callbacks: {
						title: function( tooltipItem, data ) {
							if ( 0 === tooltipItem[0].datasetIndex ) {
								return optinVars.labels.submissions.replace( '%d', tooltipItem[0].yLabel );// + ' Submissions';
							} else if ( 1 === tooltipItem[0].datasetIndex ) {
								return optinVars.labels.views.replace( '%d', tooltipItem[0].yLabel ); //+ ' Views';
							}
						},
						label: function( tooltipItem, data ) {
							return tooltipItem.xLabel;
						},

						// Set label text color
						labelTextColor: function( tooltipItem, chart ) {
							return '#AAAAAA';
						}
					}
				}
			};

			this.theCharts[ chart.id ] = new Chart( chartContainer, {
				type: 'line',
				fill: 'start',
				data: chartData,
				options: chartOptions
			});
		}
	};

	/**
	 * Key var to listen user changes before triggering
	 * navigate away message.
	 **/
	Module.hasChanges = false;

	// Unused
	/*Module.user_change = function() {
		Module.hasChanges = true;
	};*/

	window.onbeforeunload = function() {

		if ( Module.hasChanges ) {
			return optinVars.messages.dont_navigate_away;
		}
	};

	$( '.highlight_input_text' ).focus( function() {
		$( this ).select();
	});

}( jQuery ) );

( function( $ ) {
	'use strict';

	var Module = window.Module || {};

	Module.Utils = {

		/*
		 * Return URL param value
		 */
		getUrlParam: function( param ) {
			var pageUrl = window.location.search.substring( 1 ),
				urlParams = pageUrl.split( '&' ),
				paramName, i;

			for ( i = 0; i < urlParams.length; i++ ) {
				paramName = urlParams[i].split( '=' );
				if ( paramName[0] === param ) {
					return paramName[1];
				}
			}

			return false;
		},

		accessibleHide( $elements, isFocusable = false, extraToUpdate = false ) {
			$elements.hide();
			$elements.attr( 'aria-hidden', true );
			$elements.prop( 'hidden', true );
			if ( isFocusable ) {
				$elements.prop( 'tabindex', '-1' );
			}
			if ( extraToUpdate ) {
				if ( 'undefined' !== typeof extraToUpdate.name ) {
					if ( 'undefined' !== typeof extraToUpdate.value ) {
						$elements.attr( extraToUpdate.name, extraToUpdate.value );
					} else {
						$elements.removeAttr( extraToUpdate.name );
					}
				}
			}
		},

		accessibleShow( $elements, isFocusable = false, extraToUpdate = false ) {
			$elements.show();
			$elements.removeAttr( 'aria-hidden' );
			$elements.removeClass( 'sui-hidden' );
			$elements.removeProp( 'hidden' );
			if ( isFocusable ) {
				$elements.attr( 'tabindex', '0' );
			}
			if ( extraToUpdate ) {
				if ( 'undefined' !== typeof extraToUpdate.name ) {
					if ( 'undefined' !== typeof extraToUpdate.value ) {
						$elements.attr( extraToUpdate.name, extraToUpdate.value );
					} else {
						$elements.removeAttr( extraToUpdate.name );
					}
				}
			}
		},

		serializeObject( $form ) {

			let object = {},
				array = $form.serializeArray();
			$.each( array, function() {
				if ( undefined !== object[ this.name ]) {
					if ( ! object[this.name].push ) {
						object[this.name] = [ object[ this.name ] ];
					}
					object[ this.name ].push( this.value || '' );
				} else {
					object[ this.name ] = this.value || '';
				}
			});

			$form.find( 'input[type="checkbox"]:not(:checked)' ).each( function() {

				if ( undefined === object[ this.name ]) {
					object[ this.name ] = '0';
				} else if ( '0' === object[ this.name ]) {
					object[ this.name ] = [];
				} else if ( ! $.isArray( object[ this.name ]) ) {
					object[ this.name ] = [ object[ this.name ] ];
				}
			});

			return object;
		}

	};

	/**
	 * One callback to rule them all.
	 * Receives the events from single module actions.
	 * Call another callback or does an action (eg. a redirect) according to the ajax request response.
	 * Used in module listing pages and dashboard.
	 * @since 4.0.3
	 */
	Module.handleActions = {

		context: '',

		/**
		 * Function to initiate the action.
		 * @since 4.0.3
		 * @param {Object} e
		 * @param {String} context Where it's called from. dashboard|listing
		 */
		initAction( e, context, referrer ) {

			e.preventDefault();

			this.context = context;

			const self = this,
				$this = $( e.currentTarget ),
				relatedFormId = $this.data( 'form-id' ),
				actionData = $this.data();

			let data = new FormData();

			// Grab the form's data if the action has a related form.
			if ( 'undefined' !== typeof relatedFormId ) {
				const $form = $( '#' + relatedFormId );

				if ( $form.length ) {
					data = new FormData( $form[0]);
				}
			}

			$.each( actionData, ( name, value ) => data.append( name, value ) );

			data.append( 'context', this.context );
			data.append( '_ajax_nonce', optinVars.single_module_action_nonce );
			data.append( 'action', 'hustle_module_handle_single_action' );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data,
				contentType: false,
				processData: false
			})
			.done( res => {

				// If there's a defined callback, call it.
				if ( res.data.callback && 'function' === typeof self[ res.data.callback ]) {

					// This calls the "action{ hustle action }" functions from this view.
					// For example: actionToggleStatus();
					self[ res.data.callback ]( $this, res.data, res.success );

				} else if ( res.data.callback && 'function' === typeof referrer[ res.data.callback ]) {
					referrer[ res.data.callback ]( $this, res.data, res.success );

				} else if ( res.data.url ) {
					location.replace( res.data.url );

				} else if ( res.data.notification ) {

					Module.Notification.open( res.data.notification.status, res.data.notification.message, res.data.notification.delay );
				}

				// Don't remove the 'loading' icon when redirecting/reloading.
				if ( ! res.data.url ) {
					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				}
			})
			.error( res => {
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
			});
		},

		/**
		 * initAction succcess callback for "toggle-tracking".
		 * @since 4.0.3
		 */
		actionToggleTracking( $this, data ) {

			if ( ! data.is_embed_or_sshare ) {

				const enabled = data.was_enabled ? 1 : 0,
					item = $this.parents( '.sui-accordion-item' );

				$this.data( 'enabled', 1 - enabled );
				$this.find( 'span' ).toggleClass( 'sui-hidden' );

				// update tracking data
				if ( item.hasClass( 'sui-accordion-item--open' ) ) {
					item.find( '.sui-accordion-open-indicator' ).trigger( 'click' ).trigger( 'click' );
				}

			} else {

				let $button = $( '.hustle-manage-tracking-button[data-module-id="' + $this.data( 'module-id' ) + '"]' ),
					item = $button.parents( '.sui-accordion-item' );

				SUI.dialogs[ 'hustle-dialog--manage-tracking' ].hide();

				$button.data( 'tracking-types', data.enabled_types );

				// update tracking data
				if ( item.hasClass( 'sui-accordion-item--open' ) ) {
					item.find( '.sui-accordion-open-indicator' ).trigger( 'click' ).trigger( 'click' );
				}
			}

			Module.Notification.open( 'success', data.message, 10000 );
		}

	};

}( jQuery ) );

Hustle.define( 'SShare.Content_View', function( $, doc, win ) {

	'use strict';

	return Hustle.View.extend(

		_.extend({}, Hustle.get( 'Mixins.Module_Content' ), {

			el: '#hustle-wizard-content',

			activePlatforms: [],

			events: {

				'change select.hustle-select-field-variables': 'addPlaceholderToField',
				'click ul.wpmudev-tabs-menu li label': 'toggleCheckbox',

				// Open Add Platforms popup
				'click .hustle-choose-platforms': 'openPlatformsModal'
			},
			render() {
				const me = this,
					data = this.model.toJSON();

				if ( 'undefined' !== typeof data.social_icons && data.social_icons ) {
					for ( let platform in data.social_icons ) {
						me.addPlatformToPanel( platform, data.social_icons[ platform ]);
					}
				}

				// Initiate the sortable functionality to sort form platforms' order.
				let sortableContainer = this.$( '#hustle-social-services' ).sortable({
					axis: 'y',
					containment: '.sui-box-builder'
				});

				sortableContainer.on( 'sortupdate', $.proxy( me.platformsOrderChanged, me, sortableContainer ) );

				//add all platforms to Add Platforms popup
				for ( let platform in optinVars.social_platforms ) {
					me.addPlatformToDialog( platform );
				}

				this.bindRemoveService();

				if ( 'true' ===  Module.Utils.getUrlParam( 'new' )  ) {
					Module.Notification.open( 'success', optinVars.messages.commons.module_created.replace( /{type_name}/g, optinVars.module_name[ this.moduleType ]), 10000 );
				}
			},

			bindRemoveService() {

				// Delete Social Service
				$( '#hustle-wizard-content .hustle-remove-social-service' ).off( 'click' ).on( 'click', $.proxy( this.removeService, this ) );
			},

			openPlatformsModal( e ) {

				let self = this,
					savedPlatforms = this.model.get( 'social_icons' ),
					platforms = 'undefined' !== typeof savedPlatforms ? Object.keys( savedPlatforms ) : [],
					PlatformsModalView = Hustle.get( 'Modals.Services_Platforms' ),
					platformsModal = new PlatformsModalView( platforms );

				platformsModal.on( 'platforms:added', $.proxy( self.addNewPlatforms, self ) );

				// Show dialog
				SUI.dialogs['hustle-dialog--add-platforms'].show();
			},

			addNewPlatforms( platforms ) {

				if ( ! this.model.get( 'social_icons' ) ) {
					this.model.set( 'social_icons', {});
				}

				let self = this,
					savedPlatforms = _.extend({}, this.model.get( 'social_icons' ) );

				$.each( platforms, ( i, platform ) => {
					if ( savedPlatforms && platform in savedPlatforms ) {

						//If this platform is already set, abort. Prevent duplicated platforms.
						return true;
					}
					self.addPlatformToPanel( platform, {});
					let data = this.getPlatformDefaults( platform );
					savedPlatforms[ platform ] = data;
				});

				this.bindRemoveService();

				this.model.set( 'social_icons', savedPlatforms );

				Hustle.Events.trigger( 'view.rendered', this );

			},

			addPlatformToPanel( platform, data ) {

				let template = Optin.template( 'hustle-platform-row-tpl' ),
					$platformsContainer = this.$( '#hustle-social-services' );

				data = _.extend({}, this.getPlatformViewDefaults( platform ), data );

				this.activePlatforms.push( platform );

				$platformsContainer.append( template( data ) );

			},

			addPlatformToDialog( platform ) {

				let template = Optin.template( 'hustle-add-platform-li-tpl' ),
					$container = $( '#hustle_add_platforms_container' ),
					data = this.getPlatformViewDefaults( platform );
				$container.append( template( data ) );
			},

			getPlatformDefaults( platform ) {
				let label = platform in optinVars.social_platforms ? optinVars.social_platforms[ platform ] : platform,
					defaults = {
						platform: platform,
						label,
						type: 'click',
						counter: '0',
						link: ''
					};

				if ( 'email' === platform ) {
					defaults.title = '{post_title}';
					defaults.message = optinVars.social_platforms_data.email_message_default;
				}

				return defaults;
			},

			getPlatformViewDefaults( platform ) {

				let data = this.model.toJSON(),
					counterEnabled = 'undefined' === typeof data.counter_enabled ? 'true' : data.counter_enabled,
					changedStyles = { 'fivehundredpx': '500px' },
					hasEndpoint = -1 !== optinVars.social_platforms_with_endpoints.indexOf( platform ),
					hasCounter = -1 !== optinVars.social_platforms_with_api.indexOf( platform );

				let platformStyle = platform in changedStyles ? changedStyles[ platform ] : platform,

					viewDefaults = _.extend({}, this.getPlatformDefaults( platform ), {
						'platform_style': platformStyle,
						'counter_enabled': counterEnabled,
						hasEndpoint,
						hasCounter
					});

				return viewDefaults;
			},

			/**
			 * Assign the new platfom order to the model. Triggered when the platforms are sorted.
			 * @since 4.0
			 * @param jQuery sortable object
			 */
			platformsOrderChanged( sortable ) {
				let platforms = this.model.get( 'social_icons' ),
					newOrder = sortable.sortable( 'toArray', { attribute: 'data-platform' }),
					orderedPlatforms = {};

				for ( let id of newOrder ) {
					orderedPlatforms[ id ] = platforms[ id ] ;
				}

				this.model.set( 'social_icons', orderedPlatforms );

				this.model.trigger( 'change', this.model );

			},

			removeService( e ) {

				let $this = $( e.currentTarget ),
					platform =  $this.data( 'platform' ),
					socialIcons = this.model.get( 'social_icons' ),
					$platformContainer = this.$( '#hustle-platform-' + platform );

				// Remove the platform container from the page.
				$platformContainer.remove();

				this.activePlatforms = _.without( this.activePlatforms, platform );

				delete socialIcons[ platform ];

				this.model.trigger( 'change', this.model );

				e.stopPropagation();
			},

			modelUpdated( e ) {
				var changed = e.changed,
					socialIcons,
					key = 'undefined' !== typeof Object.keys( changed )[0] ? Object.keys( changed )[0] : '';

				// for service_type
				if ( 'service_type' in changed ) {
					this.serviceTypeUpdated( changed.service_type );
				}

				// for click_counter
				if ( 'click_counter' in changed ) {
					this.clickCounterUpdated( changed.click_counter );
				} else if ( -1 !== key.indexOf( '_counter' ) ) {
					let platform = key.slice( 0, -8 );
					socialIcons = this.model.get( 'social_icons' );
					if ( platform in socialIcons ) {
						socialIcons[ platform ].counter = parseInt( changed[ key ]);
					}
					this.model.unset( key, {silent: true});
				}

				if ( -1 !== key.indexOf( '_link' ) ) {
					let platform = key.slice( 0, -5 );
					socialIcons = this.model.get( 'social_icons' );
					if ( platform in socialIcons ) {
						socialIcons[ platform ].link = changed[ key ];
					}
					this.model.unset( key, {silent: true});
				}

				if ( -1 !== key.indexOf( '_type' ) ) {
					let platform = key.slice( 0, -5 );
					socialIcons = this.model.get( 'social_icons' );
					if ( platform in socialIcons ) {
						socialIcons[ platform ].type = 'native' === changed[ key ] ? 'native' : 'click';
					}
					this.model.unset( key, {silent: true});
				}

				if ( 'email_title' in changed ) {
					let platform = 'email';
					socialIcons = this.model.get( 'social_icons' );
					if ( platform in socialIcons ) {
						socialIcons[ platform ].title = changed[ key ];
					}
					this.model.unset( key, {silent: true});
				}

				if ( 'email_message' in changed ) {
					let platform = 'email';
					socialIcons = this.model.get( 'social_icons' );
					if ( platform in socialIcons ) {
						socialIcons[ platform ].message = changed[ key ];
					}
					this.model.unset( key, {silent: true});
				}

			},

			serviceTypeUpdated: function( val ) {
				var $counterOptions = this.$( '#wpmudev-sshare-counter-options' ),
					$nativeOptions = $( '.wph-wizard-services-icons-native' ),
					$customOptions = $( '.wph-wizard-services-icons-custom' );

				if ( 'native' === val ) {
					$counterOptions.removeClass( 'wpmudev-hidden' );
					$customOptions.addClass( 'wpmudev-hidden' );
					$nativeOptions.removeClass( 'wpmudev-hidden' );
				} else {
					$counterOptions.addClass( 'wpmudev-hidden' );
					$nativeOptions.addClass( 'wpmudev-hidden' );
					$customOptions.removeClass( 'wpmudev-hidden' );
				}
			},

			clickCounterUpdated: function( val ) {

				var $counterNotice = $( '#wpmudev-sshare-counter-options .hustle-twitter-notice' );
				if ( 'native' === val ) {
					$counterNotice.removeClass( 'wpmudev-hidden' );
				} else {
					if ( ! $counterNotice.hasClass( 'wpmudev-hidden' ) ) {
						$counterNotice.addClass( 'wpmudev-hidden' );
					}
				}
				$( '#wph-wizard-services-icons-native .wpmudev-social-item' ).each( function() {
					var $checkbox = $( this ).find( '.toggle-checkbox' ),
						isChecked = $checkbox.is( ':checked' ),
						$inputCounter = $( this ).find( 'input.wpmudev-input_number' );

					if ( 'none' !== val && isChecked ) {
						$inputCounter.removeClass( 'wpmudev-hidden' );
					} else {
						if ( ! $inputCounter.hasClass( 'wpmudev-hidden' ) ) {
							$inputCounter.addClass( 'wpmudev-hidden' );
						}
					}
				});

				$( '#wph-wizard-services-icons-native #wpmudev-counter-title>strong' ).removeClass( 'wpmudev-hidden' );
				if ( 'none' === val ) {
					$( '#wph-wizard-services-icons-native #wpmudev-counter-title>strong:first-child' ).addClass( 'wpmudev-hidden' );
				} else {
					$( '#wph-wizard-services-icons-native #wpmudev-counter-title>strong:nth-child(2)' ).addClass( 'wpmudev-hidden' );
				}
			},

			toggleCheckbox: function( e ) {
				var $this = this.$( e.target ),
					$li = $this.closest( 'li' ),
					$input = $li.find( 'input' ),
					prop = $input.data( 'attribute' );

				e.preventDefault();
				e.stopPropagation();

				if ( $li.hasClass( 'current' ) ) {
					return;
				}

				$li.addClass( 'current' );
				$li.siblings().removeClass( 'current' );
				this.model.set( prop, $input.val() );

			},

			setSocialIcons: function() {
				var services = this.model.toJSON();
				services = this.getSocialIconsData( services );
				this.model.set( 'social_icons', services.social_icons, { silent: true });
			},

			getSocialIconsData: function( services ) {

				var $socialContainers = $( '#wph-wizard-services-icons-' + services['service_type'] + ' .wpmudev-social-item' ),
					socialIcons = {};

				$socialContainers.each( function() {
					var $sc = $( this ),
						$toggleInput = $sc.find( 'input.toggle-checkbox' ),
						icon = $toggleInput.data( 'id' ),
						$counter = $sc.find( 'input.wpmudev-input_number' ),
						$link = $sc.find( 'input.wpmudev-input_text' );

						// check if counter have negative values
						if ( $counter.length ) {
							let counterVal = parseInt( $counter.val() );
							if ( 0 > counterVal ) {
								$counter.val( 0 );
							}
						}

						if ( $toggleInput.is( ':checked' ) ) {
							socialIcons[icon] = {
								'enabled': true,
								'counter': ( $counter.length ) ? $counter.val() : '0',
								'link': ( $link.length ) ? $link.val() : ''
							};
						}

				});

				if ( $socialContainers.length ) {
					services['social_icons'] = socialIcons;
				}

				return services;
			},

			addPlaceholderToField( e ) {

				const $select = $( e.currentTarget ),
					selectedPlaceholder = $select.val(),
					targetInputName = $select.data( 'field' ),
					$input = $( `[name="${ targetInputName }"]` ),
					val = $input.val() + selectedPlaceholder;

				$input.val( val ).trigger( 'change' );
			}
		}
	) );

});

Hustle.define( 'SShare.Design_View', function( $, doc, win ) {
	'use strict';
	return Hustle.View.extend(

		_.extend({}, Hustle.get( 'Mixins.Model_Updater' ), Hustle.get( 'Mixins.Module_Design' ), {

			//beforeRender() {

			//	// Update the Appearance tab view when the display types are changed in the Display tab.
			//	Hustle.Events.off( 'modules.view.displayTypeUpdated' ).on( 'modules.view.displayTypeUpdated', $.proxy( this.viewChangedDisplayTab, this ) );
			//},

			render: function() {

				//if ( this.targetContainer.length ) {
					this.createPickers();

				//}

				Hustle.Events.off( 'modules.view.displayTypeUpdated' ).on( 'modules.view.displayTypeUpdated', $.proxy( this.viewChangedDisplayTab, this ) );

				// Trigger preview when this tab is shown.
				$( 'a[data-tab="appearance"]' ).on( 'click', $.proxy( this.updatePreview, this ) );
				$( '.sui-box[data-tab="display"] .sui-button[data-direction="next"' ).on( 'click', $.proxy( this.updatePreview, this ) );
				$( '.sui-box[data-tab="visibility"] .sui-button[data-direction="prev"' ).on( 'click', $.proxy( this.updatePreview, this ) );

				this.updatePreview();
			},

			updatePreview: function() {
				$( '#hui-preview-social-shares-floating' ).trigger( 'hustle_update_prewiev' );
			},

			// Adjust the view when model is updated
			viewChanged: function( model ) {

				let changed = model.changed;

				if ( 'flat' === model.get( 'icon_style' ) ) {
					$( '#hustle-floating-icons-custom-background' ).addClass( 'sui-hidden' );
					$( '#hustle-widget-icons-custom-background' ).addClass( 'sui-hidden' );
				} else {
					$( '#hustle-floating-icons-custom-background' ).removeClass( 'sui-hidden' );
					$( '#hustle-widget-icons-custom-background' ).removeClass( 'sui-hidden' );
				}

				if ( 'outline' === model.get( 'icon_style' ) ) {

					// Replace "icon background" text with "icon border"
					$( '#hustle-floating-icons-custom-background .sui-label' ).text( 'Icon border' );
					$( '#hustle-widget-icons-custom-background .sui-label' ).text( 'Icon border' );

					// Hide counter border color
					$( '#hustle-floating-counter-border' ).addClass( 'sui-hidden' );
					$( '#hustle-widget-counter-border' ).addClass( 'sui-hidden' );
				} else {

					// Replace "icon border" text with "icon background"
					$( '#hustle-floating-icons-custom-background .sui-label' ).text( 'Icon background' );
					$( '#hustle-widget-icons-custom-background .sui-label' ).text( 'Icon background' );

					// Show counter border color
					$( '#hustle-floating-counter-border' ).removeClass( 'sui-hidden' );
					$( '#hustle-widget-counter-border' ).removeClass( 'sui-hidden' );
				}

				this.updatePreview();

			},

			viewChangedDisplayTab( model ) {

				const inline = model.get( 'inline_enabled' ),
					widget = model.get( 'widget_enabled' ),
					shortcode = model.get( 'shortcode_enabled' ),
					floatDesktop = model.get( 'float_desktop_enabled' ),
					floatMobile = model.get( 'float_mobile_enabled' ),
					isWidgetEnabled = ( _.intersection([ 1, '1', 'true' ], [ inline, widget, shortcode ]) ).length,
					isFloatingEnabled = ( _.intersection([ 1, '1', 'true' ], [ floatMobile, floatDesktop ]) ).length;

				// TODO: we should be using this.$( '...' ) here instead.
				if ( isFloatingEnabled ) {
					$( '#hustle-appearance-floating-icons-row' ).show();
					$( '#hustle-appearance-floating-icons-placeholder' ).hide();

				} else {
					$( '#hustle-appearance-floating-icons-row' ).hide();
					$( '#hustle-appearance-floating-icons-placeholder' ).show();
				}

				if ( isWidgetEnabled ) {
					$( '#hustle-appearance-widget-icons-row' ).show();
					$( '#hustle-appearance-widget-icons-placeholder' ).hide();
				} else {
					$( '#hustle-appearance-widget-icons-row' ).hide();
					$( '#hustle-appearance-widget-icons-placeholder' ).show();
				}

				if ( ! isWidgetEnabled && ! isFloatingEnabled ) {
					$( '#hustle-appearance-icons-style' ).hide();
					$( '#hustle-appearance-empty-message' ).show();
					$( '#hustle-appearance-floating-icons-placeholder' ).hide();
					$( '#hustle-appearance-widget-icons-placeholder' ).hide();
				} else {
					$( '#hustle-appearance-icons-style' ).show();
					$( '#hustle-appearance-empty-message' ).hide();
				}
			}

		})
	);
});

Hustle.define( 'SShare.Display_View', function( $ ) {
	'use strict';

	return Hustle.View.extend(
		_.extend({}, Hustle.get( 'Mixins.Module_Display' ), {

			viewChanged( changed ) {

				if ( ( _.intersection([ 'float_desktop_enabled', 'float_mobile_enabled', 'inline_enabled', 'widget_enabled', 'shortcode_enabled' ], Object.keys( changed ) ) ).length ) {

					// Show/hide some settings in the Appearance tab.
					Hustle.Events.trigger( 'modules.view.displayTypeUpdated', this.model );

				} else if ( 'float_desktop_position' in changed ) {

					if ( 'right' === changed.float_desktop_position ) {
						this.$( '#hustle-float_desktop-left-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-right-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-offset-x-wrapper' ).removeClass( 'sui-hidden' );

					} else if ( 'left' === changed.float_desktop_position ) {
						this.$( '#hustle-float_desktop-left-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-right-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-offset-x-wrapper' ).removeClass( 'sui-hidden' );

					} else {
						this.$( '#hustle-float_desktop-offset-x-wrapper' ).addClass( 'sui-hidden' );
					}

				} else if ( 'float_desktop_position_y' in changed ) {

					if ( 'bottom' === changed.float_desktop_position_y ) {
						this.$( '#hustle-float_desktop-top-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-bottom-offset-label' ).removeClass( 'sui-hidden' );

					} else {
						this.$( '#hustle-float_desktop-top-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_desktop-bottom-offset-label' ).addClass( 'sui-hidden' );
					}

				} else if ( 'float_mobile_position' in changed ) {

					if ( 'right' === changed.float_mobile_position ) {
						this.$( '#hustle-float_mobile-left-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-right-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-offset-x-wrapper' ).removeClass( 'sui-hidden' );

					} else if ( 'left' === changed.float_mobile_position ) {
						this.$( '#hustle-float_mobile-left-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-right-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-offset-x-wrapper' ).removeClass( 'sui-hidden' );

					} else {
						this.$( '#hustle-float_mobile-offset-x-wrapper' ).addClass( 'sui-hidden' );
					}

				} else if ( 'float_mobile_position_y' in changed ) {

					if ( 'bottom' === changed.float_mobile_position_y ) {
						this.$( '#hustle-float_mobile-top-offset-label' ).addClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-bottom-offset-label' ).removeClass( 'sui-hidden' );

					} else {
						this.$( '#hustle-float_mobile-top-offset-label' ).removeClass( 'sui-hidden' );
						this.$( '#hustle-float_mobile-bottom-offset-label' ).addClass( 'sui-hidden' );
					}

				}
			}
		})
	);
});

Hustle.define( 'Modals.Services_Platforms', function( $ ) {
	'use strict';

	return Backbone.View.extend({

		el: '#hustle-dialog--add-platforms',

		selectedPlatforms: [],

		events: {
			'click .sui-box-selector input': 'selectPlatforms',
			'click .hustle-cancel-platforms': 'cancelPlatforms',
			'click .sui-dialog-overlay': 'cancelPlatforms',

			//Add platforms
			'click #hustle-add-platforms': 'addPlatforms'
		},

		initialize: function( platforms ) {
			this.selectedPlatforms = platforms;

			this.$( '.hustle-add-platforms-option' ).prop( 'checked', false ).prop( 'disabled', false );

			for ( let platform of this.selectedPlatforms ) {
				this.$( '#hustle-social--' + platform ).prop( 'checked', true ).prop( 'disabled', true );
			}
		},

		selectPlatforms: function( e ) {

			let $input = this.$( e.target ),
				$selectorLabel  = this.$el.find( 'label[for="' + $input.attr( 'id' ) + '"]' ),
				value = $input.val()
				;

			$selectorLabel.toggleClass( 'selected' );

			if ( $input.prop( 'checked' ) ) {
				this.selectedPlatforms.push( value );
			} else {
				this.selectedPlatforms = _.without( this.selectedPlatforms, value );
			}
		},

		checkPlatforms: function() {
			for ( let platform of this.selectedPlatforms ) {
				if ( ! this.$( '#hustle-social--' + platform ).prop( 'checked' ) ) {
					this.selectedPlatforms = _.without( this.selectedPlatforms, platform );
				}
			}
		},

		cancelPlatforms: function() {

			// Hide dialog
			SUI.dialogs[ 'hustle-dialog--add-platforms' ].hide();

		},

		addPlatforms: function( e ) {
			let $button   = this.$( e.target );
			$button.addClass( 'sui-button-onload' );
			this.checkPlatforms();
			this.trigger( 'platforms:added', this.selectedPlatforms );
			setTimeout( function() {

				// Hide dialog
				SUI.dialogs[ 'hustle-dialog--add-platforms' ].hide();
				$button.removeClass( 'sui-button-onload' );
			}, 500 );
		}

	});
});

Hustle.define( 'SShare.View', function( $ ) {

	'use strict';
	return Hustle.View.extend(
		_.extend({}, Hustle.get( 'Mixins.Wizard_View' ), {

			_events: {
				'hustle_update_prewiev #hui-preview-social-shares-floating': 'updatePreview'
			},

			updatePreview( e ) {
				var previewData = _.extend({}, this.model.toJSON(), this.getDataToSave() );

				$.ajax({
					type: 'POST',
					url: ajaxurl,
					dataType: 'json',
					data: {
						action: 'hustle_preview_module',
						id: this.model.get( 'module_id' ),
						previewData: previewData
					},
					success: function( res ) {
						if ( res.success ) {
							const $floatingContainer = $( '#hui-preview-social-shares-floating' ),
								$widgetContainer = $( '#hui-preview-social-shares-widget' );
							$floatingContainer.html( res.data.floatingHtml );
							$widgetContainer.html( res.data.widgetHtml );

							if ( res.data.style ) {
								$floatingContainer.append( res.data.style );
							}

							$( '.hustle-share-icon' ).on( 'click', ( e ) => e.preventDefault() );
						}
					}
				});
			},

			/**
			 * Overriding.
			 * @param object opts
			 */
			setTabsViews( opts ) {
				this.contentView = opts.contentView;
				this.displayView = opts.displayView;
				this.designView = opts.designView;
				this.visibilityView = opts.visibilityView;
			},

			/**
			 * Overriding.
			 */
			renderTabs() {

				// Services
				this.contentView.delegateEvents();

				// Appearance view
				this.designView.delegateEvents();

				// Display Options View
				this.displayView.targetContainer.html( '' );
				this.displayView.render();
				this.displayView.delegateEvents();
				this.displayView.targetContainer.append( this.displayView.$el );
				this.displayView.afterRender();

				// Visibility view.
				this.visibilityView.delegateEvents();
				this.visibilityView.afterRender();
			},

			/**
			 * Overriding.
			 */
			sanitizeData() {},

			/**
			 * Overriding.
			 */
			getDataToSave() {
				return {
					content: this.contentView.model.toJSON(),
					display: this.displayView.model.toJSON(),
					design: this.designView.model.toJSON(),
					visibility: this.visibilityView.model.toJSON()
				};
			}
		})
	);
});

( function() {

	'use strict';

	/**
	 * Listing Page
	 */
	( function() {

		let page = '_page_hustle_popup_listing';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		new Optin.listingBase({ moduleType: optinVars.current.module_type });

	}() );

	/**
	 * Edit or New page
	 */
	( function() {

		let page = '_page_hustle_popup';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		let View             = Hustle.View.extend( Hustle.get( 'Mixins.Wizard_View' ) ),
			ViewContent		 = Hustle.View.extend( Hustle.get( 'Mixins.Module_Content' ) ),
			ViewEmails       = Hustle.View.extend( Hustle.get( 'Mixins.Module_Emails' ) ),
			ViewDesign       = Hustle.View.extend( Hustle.get( 'Mixins.Module_Design' ) ),
			ViewVisibility   = Hustle.View.extend( Hustle.get( 'Mixins.Module_Visibility' ) ),
			ViewSettings     = Hustle.View.extend( Hustle.get( 'Mixins.Module_Settings' ) ),
			ViewIntegrations = Hustle.get( 'Module.IntegrationsView' ),

			ModelView           = Module.Model,
			BaseModel = Hustle.get( 'Models.M' );

		return new View({
			model: new ModelView( optinVars.current.data || {}),
			contentView: new ViewContent({ BaseModel }),
			emailsView: new ViewEmails({ BaseModel }),
			designView: new ViewDesign({ BaseModel }),
			integrationsView: new ViewIntegrations({ BaseModel }),
			visibilityView: new ViewVisibility({ BaseModel }),
			settingsView: new ViewSettings({ BaseModel })
		});

	}() );

}() );

( function() {

	'use strict';

	/**
	 * Listing Page
	 */
	( function() {

		let page = '_page_hustle_slidein_listing';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		new Optin.listingBase({ moduleType: optinVars.current.module_type });

	}() );

	/**
	 * Edit or New page
	 */
	( function() {

		let page = '_page_hustle_slidein';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		let View             = Hustle.View.extend( Hustle.get( 'Mixins.Wizard_View' ) ),
			ViewContent      = Hustle.View.extend( Hustle.get( 'Mixins.Module_Content' ) ),
			ViewEmails       = Hustle.View.extend( Hustle.get( 'Mixins.Module_Emails' ) ),
			ViewDesign       = Hustle.View.extend( Hustle.get( 'Mixins.Module_Design' ) ),
			ViewVisibility   = Hustle.View.extend( Hustle.get( 'Mixins.Module_Visibility' ) ),
			ViewSettings    = Hustle.View.extend( Hustle.get( 'Mixins.Module_Settings' ) ),
			ViewIntegrations = Hustle.get( 'Module.IntegrationsView' ),

			ModelView = Module.Model,
			BaseModel = Hustle.get( 'Models.M' );

		return new View({
			model: new ModelView( optinVars.current.data || {}),
			contentView: new ViewContent({ BaseModel }),
			emailsView: new ViewEmails({ BaseModel }),
			designView: new ViewDesign({ BaseModel }),
			integrationsView: new ViewIntegrations({ BaseModel }),
			visibilityView: new ViewVisibility({ BaseModel }),
			settingsView: new ViewSettings({ BaseModel })
		});

	}() );
}() );

( function() {

	'use strict';

	// Listings Page
	( function() {
		let page = '_page_hustle_embedded_listing';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		new Optin.listingBase({ moduleType: optinVars.current.module_type });

	}() );

	// Wizard Page
	( function() {

		let page = '_page_hustle_embedded';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		let view				= Hustle.View.extend( Hustle.get( 'Mixins.Wizard_View' ) ),
			ViewContent			= Hustle.View.extend( Hustle.get( 'Mixins.Module_Content' ) ),
			ViewEmails 			= Hustle.View.extend( Hustle.get( 'Mixins.Module_Emails' ) ),
			ViewDesign			= Hustle.View.extend( Hustle.get( 'Mixins.Module_Design' ) ),
			ViewDisplay 		= Hustle.View.extend( Hustle.get( 'Mixins.Module_Display' ) ),
			ViewVisibility		= Hustle.View.extend( Hustle.get( 'Mixins.Module_Visibility' ) ),
			ViewSettings		= Hustle.View.extend( Hustle.get( 'Mixins.Module_Settings' ) ),
			ViewIntegrations 	= Hustle.get( 'Module.IntegrationsView' ),

			viewModel = Module.Model,
			BaseModel = Hustle.get( 'Models.M' );

		return new view({
			model: new viewModel( optinVars.current.data || {}),
			contentView: new ViewContent({ BaseModel }),
			emailsView: new ViewEmails({ BaseModel }),
			designView: new ViewDesign({ BaseModel }),
			integrationsView: new ViewIntegrations({ BaseModel }),
			displayView: new ViewDisplay({ BaseModel }),
			visibilityView: new ViewVisibility({ BaseModel }),
			settingsView: new ViewSettings({ BaseModel })
		});

	}() );

}() );

( function() {

	'use strict';

	/**
	 * Listing Page.
	 */
	( function() {

		let page = '_page_hustle_sshare_listing';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		new Optin.listingBase({ moduleType: optinVars.current.module_type });

	}() );


	/**
	 * Wizard page.
	 */
	( function() {

		let page = '_page_hustle_sshare';
		if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
			return;
		}

		const view = Hustle.get( 'SShare.View' ),
			ViewContent = Hustle.get( 'SShare.Content_View' ),
			ViewDisplay = Hustle.get( 'SShare.Display_View' ),
			ViewDesign = Hustle.get( 'SShare.Design_View' ),
			ViewVisibility = Hustle.View.extend( Hustle.get( 'Mixins.Module_Visibility' ) ),

			viewModel = Module.Model,
			BaseModel = Hustle.get( 'Models.M' );

		return new view({
			model: new viewModel( optinVars.current.data || {}),
			contentView: new ViewContent({ BaseModel }),
			displayView: new ViewDisplay({ BaseModel }),
			designView: new ViewDesign({ BaseModel }),
			visibilityView: new ViewVisibility({ BaseModel })
		});
	}() );
}() );


Hustle.define( 'Dashboard.View', function( $, doc, win ) {
	'use strict';

	if ( 'toplevel_page_hustle' !== pagenow ) { // eslint-disable-line camelcase
		return;
	}

	const dashboardView = Backbone.View.extend({

		el: '.sui-wrap',

		events: {
			'click .hustle-preview-module-button': 'openPreview',
			'click .hustle-delete-module-button': 'openDeleteModal',
			'click .hustle-free-version-create': 'showUpgradeModal',
			'click .sui-dropdown .hustle-onload-icon-action': 'addLoadingIconToActionsButton',

			// Modules' actions.
			'click .hustle-single-module-button-action': 'handleSingleModuleAction'
		},

		initialize( opts ) {

			if ( $( '#hustle-dialog--welcome' ).length ) {
				this.openWelcomeDialog();
			}

			if ( $( '#hustle-dialog--migrate' ).length ) {
				this.openMigrateDialog();
			}

			this.doActionsBasedOnUrl();
		},

		doActionsBasedOnUrl() {

			// Display notice based on URL parameters.
			if ( Module.Utils.getUrlParam( 'show-notice' ) ) {
				const status = 'success' === Module.Utils.getUrlParam( 'show-notice' ) ? 'success' : 'error',
					notice = Module.Utils.getUrlParam( 'notice' ),
					message = ( notice && 'undefined' !== optinVars.messages.commons[ notice ]) ? optinVars.messages.commons[ notice ] : Module.Utils.getUrlParam( 'notice-message' );

				if ( 'undefined' !== typeof message && message.length ) {
					Module.Notification.open( status, message );
				}
			}
		},

		openPreview( e ) {
			let $this = $( e.currentTarget ),
				id = $this.data( 'id' ),
				type = $this.data( 'type' );

			Module.preview.open( id, type );
		},

		showUpgradeModal( e ) {
			if ( 'undefined' !== typeof e ) {
				e.preventDefault();
			}

			let $upgradeModal = $( '#wph-upgrade-modal' );
			$upgradeModal.addClass( 'wpmudev-modal-active' );
		},

		/**
		 * @since 4.0
		 */
		openDeleteModal( e ) {
			e.preventDefault();
			let $this = $( e.currentTarget ),
				data = {
					id: $this.data( 'id' ),
					nonce: $this.data( 'nonce' ),
					action: 'delete',
					title: $this.data( 'title' ),
					description: $this.data( 'description' )
				};

			Module.deleteModal.open( data );
		},

		addLoadingIconToActionsButton( e ) {
			const $actionButton = $( e.currentTarget ),
				$mainButton = $actionButton.closest( '.sui-dropdown' ).find( '.sui-dropdown-anchor' );

			$mainButton.addClass( 'sui-button-onload' );
		},

		openWelcomeDialog() {
			Hustle.get( 'Modals.Welcome' );
		},

		openMigrateDialog() {
			Hustle.get( 'Modals.Migration' );
		},

		handleSingleModuleAction( e ) {
			Module.handleActions.initAction( e, 'dashboard', this );
		},

		/**
		 * initAction succcess callback for "toggle-status".
		 * @since 4.0.4
		 */
		actionToggleStatus( $this, data ) {

			const enabled = data.was_module_enabled;

			$this.find( 'span' ).toggleClass( 'sui-hidden' );

			let tooltip = $this.parents( 'td.hui-status' ).find( 'span.sui-tooltip' );
			tooltip.removeClass( 'sui-draft sui-published' );

			if ( enabled ) {
				tooltip.addClass( 'sui-draft' ).attr( 'data-tooltip', optinVars.messages.commons.draft ); // eslint-disable-line camelcase
			} else {
				tooltip.addClass( 'sui-published' ).attr( 'data-tooltip', optinVars.messages.commons.published ); // eslint-disable-line camelcase
			}

		}

	});

	new dashboardView();
});

Hustle.define( 'Integrations.View', function( $, doc, win ) {
	'use strict';

	let page = '_page_hustle_integrations';
	if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
		return;
	}

	const integrationsView = Backbone.View.extend({

		el: '.sui-wrap',

		events: {
			'click .connect-integration': 'connectIntegration',
			'keypress .connect-integration': 'preventEnterKeyFromDoingThings'
		},

		initialize() {

			this.stopListening( Hustle.Events, 'hustle:providers:reload', this.renderProvidersTables );
			this.listenTo( Hustle.Events, 'hustle:providers:reload', this.renderProvidersTables );

			this.render();
		},

		render() {
			var $notConnectedWrapper = this.$el.find( '#hustle-not-connected-providers-section' ),
				$connectedWrapper = this.$el.find( '#hustle-connected-providers-section' );

			if ( 0 < $notConnectedWrapper.length && 0 < $connectedWrapper.length ) {
				this.renderProvidersTables();
			}

			if ( optinVars.integration_redirect ) {
				this.handleIntegrationRedirect();
			}
		},

		renderProvidersTables() {

			var self = this,
				data = {}
			;

			this.$el.find( '.hustle-integrations-display' ).html(
				'<div class="sui-notice sui-notice-sm sui-notice-loading">' +
					'<p>' + optinVars.fetching_list + '</p>' +
				'</div>'
			);

			data.action      = 'hustle_provider_get_providers';
			data._ajax_nonce = optinVars.providers_action_nonce; // eslint-disable-line camelcase
			data.data = {};

			const ajax = $.post({
				url: ajaxurl,
				type: 'post',
				data: data
			})
			.done( function( result ) {
				if ( result && result.success ) {
					self.$el.find( '#hustle-not-connected-providers-section' ).html( result.data.not_connected );
					self.$el.find( '#hustle-connected-providers-section' ).html( result.data.connected );
				}
			});

			//remove the preloader
			ajax.always( function() {
				self.$el.find( '.sui-notice-loading' ).remove();
			});
		},

		// Prevent the enter key from opening integrations modals and breaking the page.
		preventEnterKeyFromDoingThings( e ) {
			if ( 13 === e.which ) { // the enter key code
				e.preventDefault();
				return;
			}
		},

		connectIntegration( e ) {
			Module.integrationsModal.open( e );
		},

		handleIntegrationRedirect() {

			const data 		= optinVars.integration_redirect;
			const migrate 	= optinVars.integrations_migrate;
			window.history.pushState({}, document.title, optinVars.integrations_url );
			if ( 'notification' === data.action ) {

				const status = 'success' === data.status ? 'success' : 'error',
					delay = data.delay ? data.delay : 10000;

				Module.Notification.open( status, data.message, delay );

			}

			if ( migrate.hasOwnProperty( 'provider_modal' ) && 'constantcontact' === migrate.provider_modal ) {
				Module.ProviderMigration.open( migrate.provider_modal );
			}

			if ( migrate.hasOwnProperty( 'migration_notificaiton' ) ) {
				const status = 'success' === migrate.migration_notificaiton.status ? 'success' : 'error',
					delay  =  migrate.migration_notificaiton.delay ?  migrate.migration_notificaiton.delay : 10000;
				Module.Notification.open( status,  migrate.migration_notificaiton.message, delay );
			}
		}

	});

	new integrationsView();
});

Hustle.define( 'Entries.View', function( $ ) {
	'use strict';

	let page = '_page_hustle_entries';
	if ( page !== pagenow.substr( pagenow.length - page.length ) ) {
		return;
	}

	const entriesView = Backbone.View.extend({

		el: '.sui-wrap',

		events: {
			'click .sui-pagination-wrap .hustle-open-inline-filter': 'openFilterInline',
			'click .sui-pagination-wrap .hustle-open-dialog-filter': 'openFilterModal',
			'click #hustle-dialog--filter-entries .hustle-dialog-close': 'closeFilterModal',
			'click .hustle-delete-entry-button': 'openDeleteModal',
			'click .sui-active-filter-remove': 'removeFilter',
			'click .hustle-entries-clear-filter': 'clearFilter'
		},

		initialize( opts ) {

			var entriesDatePickerRange = {},
				entriesAlert = $( '.hui-entries-alert' );

			if ( 'undefined' !== typeof window.hustle_entries_datepicker_ranges ) {
				entriesDatePickerRange = window.hustle_entries_datepicker_ranges;
			}

			$( 'input.hustle-entries-filter-date' ).daterangepicker({
				autoUpdateInput: false,
				autoApply: true,
				alwaysShowCalendars: true,
				ranges: entriesDatePickerRange,
				locale: optinVars.daterangepicker
			});

			$( 'input.hustle-entries-filter-date' ).on( 'apply.daterangepicker', function( ev, picker ) {
				$( this ).val( picker.startDate.format( 'MM/DD/YYYY' ) + ' - ' + picker.endDate.format( 'MM/DD/YYYY' ) );
			});

			if ( entriesAlert.length ) {

				// Assign correct colspan.
				entriesAlert.attr( 'colspan', entriesAlert.closest( '.sui-table' ).find( '> thead tr th' ).length );

				// Show message.
				entriesAlert.find( 'i' ).hide();
				entriesAlert.find( 'span' ).removeClass( 'sui-screen-reader-text' );
			}
		},

		openFilterInline( e ) {

			var $this    = this.$( e.target ),
				$wrapper = $this.closest( '.sui-pagination-wrap' ),
				$button  = $wrapper.find( '.sui-button-icon' ),
				$filters = $this.closest( '.hui-actions-bar' ).next( '.sui-pagination-filter' )
				;

			$button.toggleClass( 'sui-active' );
			$filters.toggleClass( 'sui-open' );

			e.preventDefault();
			e.stopPropagation();

		},

		openFilterModal( e ) {

			// Show dialog
			// SUI.dialogs['hustle-dialog--filter-entries'].show();

			// Change animation on the show event
			SUI.dialogs['hustle-dialog--filter-entries'].show().on( 'show', function( dialogEl, event ) {
				var content = dialogEl.getElementsByClassName( 'sui-dialog-content' );
				content[0].className = 'sui-dialog-content sui-fade-in';
			});

			e.preventDefault();

		},

		closeFilterModal( e ) {

			// Hide dialog
			SUI.dialogs['hustle-dialog--filter-entries'].hide();

			// Change animation on the hide event
			SUI.dialogs['hustle-dialog--filter-entries'].on( 'hide', function( dialogEl, event ) {
				var content = dialogEl.getElementsByClassName( 'sui-dialog-content' );
				content[0].className = 'sui-dialog-content sui-fade-out';
			});

			e.preventDefault();

		},

		removeFilter( e ) {
			let $this    = this.$( e.target ),
				possibleFilters = [ 'order_by', 'search_email', 'date_range' ],
				currentFilter = $this.data( 'filter' ),
				re = new RegExp( '&' + currentFilter + '=[^&]*', 'i' );

			if ( -1 !== possibleFilters.indexOf( currentFilter ) ) {
				location.href = location.href.replace( re, '' );
			}
		},

		openDeleteModal( e ) {
			e.preventDefault();

			let $this = $( e.target ),
				data = {
					id: $this.data( 'id' ),
					nonce: $this.data( 'nonce' ),
					action: 'delete',
					title: $this.data( 'title' ),
					description: $this.data( 'description' ),
					actionClass: ''
				};

			Module.deleteModal.open( data );
		},

		clearFilter( e ) {

			e.preventDefault();

			this.$( 'input[name=search_email]' ).val( '' );
			this.$( 'input[name=date_range]' ).val( '' );
		}

	});

	new entriesView();
});

Hustle.define( 'ProviderNotice.View', function( $, doc, win ) {
	'use strict';

	const providerNotice = Backbone.View.extend({

		el: '.hustle-provider-notice',
		cookieKey: '',
		events: {
			'click .dismiss-provider-migration-notice': 'HideProviderNotice'
		},

		initialize() {
			this.cookieKey = 'provider_migration_notice_';

			if ( $( '.hustle-provider-notice' ).length ) {
				this.showProviderNotice();
			}
		},

		HideProviderNotice( e ) {
			Optin.cookie.set( this.cookieKey + $( e.currentTarget ).data( 'name' ), 1, 7 );
			location.reload();
		},

		showProviderNotice() {
			let provider = $( '.hustle-provider-notice' ).data( 'name' ),
			notice = Optin.cookie.get( this.cookieKey + provider );
			if ( 1 !== notice ) {
				$( '#hustle_migration_notice__' + provider ).show();
			}
		}

	});

	new providerNotice();
});

Hustle.define( 'Settings.View', function( $, doc, win ) {

	'use strict';

	if ( 'hustle_page_hustle_settings' !== pagenow ) {
		return;
	}

	const viewSettings = Backbone.View.extend({

		el: '.sui-wrap',

		events: {
			'click .sui-sidenav .sui-vertical-tab a': 'sidenav',
			'click .sui-pagination-wrap > button': 'pagination',
			'click #hustle-dialog-open--reset-settings': 'resetDialog',

			// Save settings.
			'click .hustle-settings-save': 'handleSave'
		},

		initialize: function( opts ) {

			let me = this,

				recaptchaView = Hustle.get( 'Settings.reCaptcha_Settings' ),
				topMetricsView = Hustle.get( 'Settings.Top_Metrics_View' ),
				privacySettings = Hustle.get( 'Settings.Privacy_Settings' ),
				permissionsView = Hustle.get( 'Settings.Permissions_View' ),
				dataSettings = Hustle.get( 'Settings.Data_Settings' ),
				palettesView = Hustle.get( 'Settings.Palettes' );

				this.recaptchaView = new recaptchaView();
				new topMetricsView();
				new privacySettings();
				new permissionsView();
				new dataSettings();
				new palettesView();

			$( win ).off( 'popstate', $.proxy( me.tabUpdate, me ) );
			$( win ).on( 'popstate', $.proxy( me.tabUpdate, me ) );

			Hustle.Events.trigger( 'view.rendered', this );

		},

		sidenav: function( e ) {

			var tabName = $( e.target ).data( 'tab' );

			if ( tabName ) {
				this.tabJump( tabName, true );
			}

			e.preventDefault();
		},

		tabUpdate: function( e ) {

			var state = e.originalEvent.state;

			if ( state ) {
				this.tabJump( state.tabSelected );
			}
		},

		tabJump: function( tabName, updateHistory ) {

			var $tab 	 = this.$el.find( 'a[data-tab="' + tabName + '"]' ),
				$sidenav = $tab.closest( '.sui-vertical-tabs' ),
				$tabs    = $sidenav.find( '.sui-vertical-tab' ),
				$content = this.$el.find( '.sui-box[data-tab]' ),
				$current = this.$el.find( '.sui-box[data-tab="' + tabName + '"]' );

			if ( updateHistory ) {
				history.pushState(
					{ tabSelected: tabName },
					'Hustle Settings',
					'admin.php?page=hustle_settings&section=' + tabName
				);
			}

			$tabs.removeClass( 'current' );
			$content.hide();

			$tab.parent().addClass( 'current' );
			$current.show();
		},

		pagination: function( e ) {

			var $this    = this.$( e.target ),
				$wrapper = $this.closest( '.sui-pagination-wrap' ),
				$button  = $wrapper.find( '.sui-button-icon' ),
				$filters = $wrapper.next( '.sui-pagination-filter' )
				;

			$button.toggleClass( 'sui-active' );
			$filters.toggleClass( 'sui-open' );

			e.preventDefault();
			e.stopPropagation();

		},

		//sidetabs: function( e ) {

		//	var $this      = this.$( e.target ),
		//		$label     = $this.parent( 'label' ),
		//		$data      = $this.data( 'tab-menu' ),
		//		$wrapper   = $this.closest( '.sui-side-tabs' ),
		//		$alllabels = $wrapper.find( '.sui-tabs-menu .sui-tab-item' ),
		//		$allinputs = $alllabels.find( 'input' )
		//		;

		//	$alllabels.removeClass( 'active' );
		//	$allinputs.removeAttr( 'checked' );
		//	$wrapper.find( '.sui-tabs-content > div' ).removeClass( 'active' );

		//	$label.addClass( 'active' );
		//	$this.attr( 'checked', 'checked' );

		//	if ( $wrapper.find( '.sui-tabs-content div[data-tab-content="' + $data + '"]' ).length ) {
		//		$wrapper.find( '.sui-tabs-content div[data-tab-content="' + $data + '"]' ).addClass( 'active' );
		//	}
		//},

		// ============================================================
		// Handle saving actions
		handleSave( e ) {
			e.preventDefault();

			const self = this,
				$this = $( e.currentTarget ),
				relatedFormId = $this.data( 'form-id' ),
				actionData = $this.data();

			let data = new FormData();
			tinyMCE.triggerSave();

			// Grab the form's data if the action has a related form.
			if ( 'undefined' !== typeof relatedFormId ) {
				const $form = $( '#' + relatedFormId );

				if ( $form.length ) {
					data = new FormData( $form[0]);

					// Add unchecked checkboxes.
					$.each( $form.find( 'input[type=checkbox]' ), function() {
						const $this = $( this );
						if ( ! $this.is( ':checked' ) ) {
							data.append( $this.attr( 'name' ), '0' );
						}
					});
				}

			}

			$.each( actionData, ( name, value ) => data.append( name, value ) );

			data.append( '_ajax_nonce', optinVars.current.save_settings_nonce );
			data.append( 'action', 'hustle_save_settings' );

			// Handle the button behavior.
			$this.addClass( 'sui-button-onload' );
			$this.prop( 'disabled', true );

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: data,
				contentType: false,
				processData: false
			})
			.done( res => {

				// If the response returned actionable data.
				if ( res.data ) {

					// If there's a defined callback, call it.
					if ( res.data.callback && 'undefined' !== self[ res.data.callback ]) {

						// This calls the "action{ hustle action }" functions from this view.
						// For example: actionToggleStatus();
						self[ res.data.callback ]( $this, res.data, res.success );
					}

					if ( res.data.url ) {
						if ( true === res.data.url ) {
							location.reload();
						} else {
							location.replace( res.data.url );
						}

					} else if ( res.data.notification ) {

						Module.Notification.open( res.data.notification.status, res.data.notification.message, res.data.notification.delay );
					}

					// Don't remove the 'loading' icon when redirecting/reloading.
					if ( ! res.data.url ) {
						$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
						$this.prop( 'disabled', false );
					}

				} else {

					// Use default actions otherwise.
					if ( res.success ) {
						Module.Notification.open( 'success', optinVars.messages.settings_saved );
					} else {
						Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
					}

					$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
					$this.prop( 'disabled', false );
				}
			})
			.error( res => {
				$( '.sui-button-onload' ).removeClass( 'sui-button-onload' );
				$this.prop( 'disabled', false );
				Module.Notification.open( 'error', optinVars.messages.something_went_wrong );
			});
		},

		/**
		 * Callback action for when saving reCaptchas.
		 * @since 4.1.0
		 */
		actionSaveRecaptcha() {
			this.recaptchaView.maybeRenderRecaptchas();
		},

		// ============================================================
		// DIALOG
		// Open dialog
		resetDialog: function( e ) {

			var $button = this.$( e.target ),
				$dialog = $( '#hustle-dialog--reset-settings' ),
				$title  = $dialog.find( '#dialogTitle' ),
				$info   = $dialog.find( '#dialogDescription' );

			$title.text( $button.data( 'dialog-title' ) );
			$info.text( $button.data( 'dialog-info' ) );

			SUI.dialogs['hustle-dialog--reset-settings'].show();

			e.preventDefault();

		}
	});

	new viewSettings();

});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh1c3RsZS5qcyIsInV0aWxzLmpzIiwiY29tbW9ucy5qcyIsIm1vZGFsLW1pZ3JhdGlvbi5qcyIsIm1vZGFsLXJldmlldy1jb25kaXRpb25zLmpzIiwibW9kYWwtdXBncmFkZS5qcyIsIm1vZGFsLXdlbGNvbWUuanMiLCJmZWF0dXJlZC1pbWFnZS5qcyIsIm1vZGFsLWVkaXQtZmllbGQuanMiLCJtb2RhbC1lZGl0LXNjaGVkdWxlLmpzIiwibW9kYWwtb3B0aW4tZmllbGRzLmpzIiwibW9kYWwtdmlzaWJpbGl0eS1jb25kaXRvbnMuanMiLCJsaXN0aW5nLWJhc2UuanMiLCJtb2RhbC1hZGQtbmV3LW1vZHVsZS5qcyIsIm1vZGFsLWltcG9ydC1tb2R1bGUuanMiLCJtb2RlbC11cGRhdGVyLmpzIiwibW9kdWxlLWJlaGF2aW91ci5qcyIsIm1vZHVsZS1jb250ZW50LmpzIiwibW9kdWxlLWRlc2lnbi5qcyIsIm1vZHVsZS1kaXNwbGF5LmpzIiwibW9kdWxlLWVtYWlscy5qcyIsIm1vZHVsZS1pbnRlZ3JhdGlvbnMuanMiLCJtb2R1bGUtdmlzaWJpbGl0eS5qcyIsIm1vZHVsZS13aXphcmQtdmlldy5qcyIsImNvbmRpdGlvbnMuanMiLCJjb2xvci1wYWxldHRlcy12aWV3LmpzIiwiZGF0YS12aWV3LmpzIiwibW9kYWwtZWRpdC1jb2xvci1wYWxldHRlLmpzIiwicGVybWlzc2lvbnMtdmlldy5qcyIsInByaXZhY3ktc2V0dGluZ3MuanMiLCJyZWNhcHRjaGEtc2V0dGluZ3MuanMiLCJ0b3AtbWV0cmljcy12aWV3LmpzIiwicHVyZS1qcXVlcnkuanMiLCJpbnRlZ3JhdGlvbi1tb2RhbC1oYW5kbGVyLmpzIiwibW9kZWxzLmpzIiwidmlld3MuanMiLCJhZG1pbl91dGlscy5qcyIsImNvbnRlbnQtdmlldy5qcyIsImRlc2lnbi12aWV3LmpzIiwiZGlzcGxheS12aWV3LmpzIiwibW9kYWwtc2VydmljZXMtcGxhdGZvcm1zLmpzIiwidmlldy5qcyIsInBvcHVwLmpzIiwic2xpZGVpbi5qcyIsImVtYmVkZGVkLmpzIiwic3NoYXJlLmpzIiwiZGFzaGJvYXJkLmpzIiwiaW50ZWdyYXRpb25zLmpzIiwiZW50cmllcy5qcyIsInByb3ZpZGVyLW5vdGljZS5qcyIsInNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeGhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbllBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdHFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2cENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbmxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzkzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFkbWluLmRlYnVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBIdXN0bGUgT2JqZWN0XG5cdCAqXG5cdCAqIEB0eXBlIHt7ZGVmaW5lLCBnZXRNb2R1bGVzLCBnZXQsIG1vZHVsZXN9fVxuXHQgKi9cblx0d2luZG93Lkh1c3RsZSA9ICggZnVuY3Rpb24oICQsIGRvYywgd2luICkge1xuXHRcdHZhciBfbW9kdWxlcyA9IHt9LFxuXHRcdFx0X1RlbXBsYXRlT3B0aW9ucyA9IHtcblx0XHRcdFx0ZXZhbHVhdGU6IC88IyhbXFxzXFxTXSs/KSM+L2csXG5cdFx0XHRcdGludGVycG9sYXRlOiAvXFx7XFx7XFx7KFtcXHNcXFNdKz8pXFx9XFx9XFx9L2csXG5cdFx0XHRcdGVzY2FwZTogL1xce1xceyhbXlxcfV0rPylcXH1cXH0oPyFcXH0pL2dcblx0XHRcdH07XG5cblx0XHRcdGxldCBkZWZpbmUgPSBmdW5jdGlvbiggbW9kdWxlTmFtZSwgbW9kdWxlICkge1xuXHRcdFx0XHR2YXIgc3BsaXRzID0gbW9kdWxlTmFtZS5zcGxpdCggJy4nICk7XG5cdFx0XHRcdGlmICggc3BsaXRzLmxlbmd0aCApIHsgLy8gaWYgbW9kdWxlX25hbWUgaGFzIG1vcmUgdGhhbiBvbmUgb2JqZWN0IG5hbWUsIHRoZW4gYWRkIHRoZSBtb2R1bGUgZGVmaW5pdGlvbiByZWN1cnNpdmVseVxuXHRcdFx0XHRcdGxldCByZWN1cnNpdmUgPSBmdW5jdGlvbiggbW9kdWxlTmFtZSwgbW9kdWxlcyApIHtcblx0XHRcdFx0XHRcdHZhciBhcnIgPSBtb2R1bGVOYW1lLnNwbGl0KCAnLicgKSxcblx0XHRcdFx0XHRcdFx0X21vZHVsZU5hbWUgPSBhcnIuc3BsaWNlKCAwLCAxIClbIDAgXSxcblx0XHRcdFx0XHRcdFx0aW52b2tlZDtcblx0XHRcdFx0XHRcdGlmICggISBfbW9kdWxlTmFtZSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCAhIGFyci5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGludm9rZWQgPSBtb2R1bGUuY2FsbCggbnVsbCwgJCwgZG9jLCB3aW4gKTtcblx0XHRcdFx0XHRcdFx0bW9kdWxlc1sgX21vZHVsZU5hbWUgXSA9IF8uaXNGdW5jdGlvbiggaW52b2tlZCApIHx8XG5cdFx0XHRcdFx0XHRcdFx0J3VuZGVmaW5lZCcgPT09IHR5cGVvZiBpbnZva2VkID9cblx0XHRcdFx0XHRcdFx0XHRpbnZva2VkIDogXy5leHRlbmQoIG1vZHVsZXNbIF9tb2R1bGVOYW1lIF0gfHwge30sIGludm9rZWQgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG1vZHVsZXNbIF9tb2R1bGVOYW1lIF0gPSBtb2R1bGVzWyBfbW9kdWxlTmFtZSBdIHx8IHt9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCBhcnIubGVuZ3RoICYmIF9tb2R1bGVOYW1lICkge1xuXHRcdFx0XHRcdFx0XHRyZWN1cnNpdmUoIGFyci5qb2luKCAnLicgKSwgbW9kdWxlc1sgX21vZHVsZU5hbWUgXSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZWN1cnNpdmUoIG1vZHVsZU5hbWUsIF9tb2R1bGVzICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGV0IG0gPSBfbW9kdWxlc1ttb2R1bGVOYW1lXSB8fCB7fTtcblx0XHRcdFx0XHRfbW9kdWxlc1ttb2R1bGVOYW1lXSA9IF8uZXh0ZW5kKCBtLCBtb2R1bGUuY2FsbCggbnVsbCwgJCwgZG9jLCB3aW4gKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0TW9kdWxlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gX21vZHVsZXM7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0ID0gZnVuY3Rpb24oIG1vZHVsZU5hbWUgKSB7XG5cdFx0XHRcdHZhciBtb2R1bGUsIHJlY3Vyc2l2ZTtcblx0XHRcdFx0aWYgKCBtb2R1bGVOYW1lLnNwbGl0KCAnLicgKS5sZW5ndGggKSB7IC8vIHJlY3Vyc2l2ZWx5IGZldGNoIHRoZSBtb2R1bGVcblx0XHRcdFx0XHRtb2R1bGUgPSBmYWxzZTtcblx0XHRcdFx0XHRyZWN1cnNpdmUgPSBmdW5jdGlvbiggbW9kdWxlTmFtZSwgbW9kdWxlcyApIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFyciA9IG1vZHVsZU5hbWUuc3BsaXQoICcuJyApLFxuXHRcdFx0XHRcdFx0XHRcdF9tb2R1bGVOYW1lID0gYXJyLnNwbGljZSggMCwgMSApWyAwIF07XG5cdFx0XHRcdFx0XHRcdG1vZHVsZSA9IG1vZHVsZXNbIF9tb2R1bGVOYW1lIF07XG5cdFx0XHRcdFx0XHRcdGlmICggYXJyLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0XHRyZWN1cnNpdmUoIGFyci5qb2luKCAnLicgKSwgbW9kdWxlc1sgX21vZHVsZU5hbWUgXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmVjdXJzaXZlKCBtb2R1bGVOYW1lLCBfbW9kdWxlcyApO1xuXHRcdFx0XHRcdHJldHVybiBtb2R1bGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIF9tb2R1bGVzW21vZHVsZU5hbWVdIHx8IGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdEV2ZW50cyA9IF8uZXh0ZW5kKHt9LCBCYWNrYm9uZS5FdmVudHMgKSxcblx0XHRcdFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdFx0XHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggXy5pc0Z1bmN0aW9uKCB0aGlzLmluaXRNaXggKSApIHtcblx0XHRcdFx0XHRcdHRoaXMuaW5pdE1peC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICggdGhpcy5yZW5kZXIgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbmRlciA9IF8ud3JhcCggdGhpcy5yZW5kZXIsIGZ1bmN0aW9uKCByZW5kZXIgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJpZ2dlciggJ2JlZm9yZV9yZW5kZXInICk7XG5cdFx0XHRcdFx0XHRcdHJlbmRlci5jYWxsKCB0aGlzICk7XG5cdFx0XHRcdFx0XHRcdEV2ZW50cy50cmlnZ2VyKCAndmlldy5yZW5kZXJlZCcsIHRoaXMgKTtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCAncmVuZGVyZWQnICk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCBfLmlzRnVuY3Rpb24oIHRoaXMuaW5pdCApICkge1xuXHRcdFx0XHRcdFx0dGhpcy5pbml0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pLFxuXHRcdFx0dGVtcGxhdGUgPSBfLm1lbW9pemUoIGZ1bmN0aW9uKCBpZCApIHtcblx0XHRcdFx0dmFyIGNvbXBpbGVkO1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0Y29tcGlsZWQgPSBjb21waWxlZCB8fCBfLnRlbXBsYXRlKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaWQgKS5pbm5lckhUTUwsIG51bGwsIF9UZW1wbGF0ZU9wdGlvbnMgKTtcblx0XHRcdFx0XHRyZXR1cm4gY29tcGlsZWQoIGRhdGEgKS5yZXBsYWNlKCAnLyo8IVtDREFUQVsqLycsICcnICkucmVwbGFjZSggJy8qXV0+Ki8nLCAnJyApO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSksXG5cdFx0XHRjcmVhdGVUZW1wbGF0ZSA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIHN0ciApIHtcblx0XHRcdFx0dmFyIGNhY2hlO1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0Y2FjaGUgPSBjYWNoZSB8fCBfLnRlbXBsYXRlKCBzdHIsIG51bGwsIF9UZW1wbGF0ZU9wdGlvbnMgKTtcblx0XHRcdFx0XHRyZXR1cm4gY2FjaGUoIGRhdGEgKTtcblx0XHRcdFx0fTtcblx0XHRcdH0pLFxuXHRcdFx0Z2V0VGVtcGxhdGVPcHRpb25zID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAkLmV4dGVuZCggIHRydWUsIHt9LCBfVGVtcGxhdGVPcHRpb25zICk7XG5cdFx0XHR9LFxuXHRcdFx0Y29va2llID0gKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHQvLyBHZXQgYSBjb29raWUgdmFsdWUuXG5cdFx0XHRcdHZhciBnZXQgPSBmdW5jdGlvbiggbmFtZSApIHtcblx0XHRcdFx0XHR2YXIgaSwgYywgY29va2llTmFtZSwgdmFsdWUsXG5cdFx0XHRcdFx0XHRjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCggJzsnICksXG5cdFx0XHRcdFx0XHRjYUxlbmd0aCA9IGNhLmxlbmd0aDtcblx0XHRcdFx0XHRjb29raWVOYW1lID0gbmFtZSArICc9Jztcblx0XHRcdFx0XHRmb3IgKCBpID0gMDsgaSA8IGNhTGVuZ3RoOyBpICs9IDEgKSB7XG5cdFx0XHRcdFx0XHRjID0gY2FbaV07XG5cdFx0XHRcdFx0XHR3aGlsZSAoICcgJyA9PT0gYy5jaGFyQXQoIDAgKSApIHtcblx0XHRcdFx0XHRcdFx0YyA9IGMuc3Vic3RyaW5nKCAxLCBjLmxlbmd0aCApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCAwID09PSBjLmluZGV4T2YoIGNvb2tpZU5hbWUgKSApIHtcblx0XHRcdFx0XHRcdFx0bGV0IF92YWwgPSBjLnN1YnN0cmluZyggY29va2llTmFtZS5sZW5ndGgsIGMubGVuZ3RoICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBfdmFsID8gSlNPTi5wYXJzZSggX3ZhbCApIDogX3ZhbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gU2F2ZXMgdGhlIHZhbHVlIGludG8gYSBjb29raWUuXG5cdFx0XHRcdHZhciBzZXQgPSBmdW5jdGlvbiggbmFtZSwgdmFsdWUsIGRheXMgKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGUsIGV4cGlyZXM7XG5cblx0XHRcdFx0XHR2YWx1ZSA9ICQuaXNBcnJheSggdmFsdWUgKSB8fCAkLmlzUGxhaW5PYmplY3QoIHZhbHVlICkgPyBKU09OLnN0cmluZ2lmeSggdmFsdWUgKSA6IHZhbHVlO1xuXHRcdFx0XHRcdGlmICggISBpc05hTiggZGF5cyApICkge1xuXHRcdFx0XHRcdFx0ZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0XHRkYXRlLnNldFRpbWUoIGRhdGUuZ2V0VGltZSgpICsgKCBkYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCApICk7XG5cdFx0XHRcdFx0XHRleHBpcmVzID0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b0dNVFN0cmluZygpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRleHBpcmVzID0gJyc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyAnPScgKyB2YWx1ZSArIGV4cGlyZXMgKyAnOyBwYXRoPS8nO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHNldDogc2V0LFxuXHRcdFx0XHRcdGdldDogZ2V0XG5cdFx0XHRcdH07XG5cdFx0XHR9KCkgKSxcblx0XHRcdGNvbnN0cyA9ICggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0TW9kdWxlU2hvd0NvdW50OiAnaHVzdGxlX21vZHVsZV9zaG93X2NvdW50LSdcblx0XHRcdFx0fTtcblx0XHRcdH0oKSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlZmluZSxcblx0XHRcdGdldE1vZHVsZXMsXG5cdFx0XHRnZXQsXG5cdFx0XHRFdmVudHMsXG5cdFx0XHRWaWV3LFxuXHRcdFx0dGVtcGxhdGUsXG5cdFx0XHRjcmVhdGVUZW1wbGF0ZSxcblx0XHRcdGdldFRlbXBsYXRlT3B0aW9ucyxcblx0XHRcdGNvb2tpZSxcblx0XHRcdGNvbnN0c1xuXHRcdH07XG5cdH0oIGpRdWVyeSwgZG9jdW1lbnQsIHdpbmRvdyApICk7XG5cbn0oIGpRdWVyeSApICk7XG4iLCJ2YXIgIE9wdGluID0gT3B0aW4gfHwge307XG5cbk9wdGluLlZpZXcgPSB7fTtcbk9wdGluLk1vZGVscyA9IHt9O1xuT3B0aW4uRXZlbnRzID0ge307XG5cbmlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBCYWNrYm9uZSApIHtcblx0Xy5leHRlbmQoIE9wdGluLkV2ZW50cywgQmFja2JvbmUuRXZlbnRzICk7XG59XG5cbiggZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0T3B0aW4uTkVWRVJfU0VFX1BSRUZJWCA9ICdpbmNfb3B0aW5fbmV2ZXJfc2VlX2FnYWluLScsXG5cdE9wdGluLkNPT0tJRV9QUkVGSVggPSAnaW5jX29wdGluX2xvbmdfaGlkZGVuLSc7XG5cdE9wdGluLlBPUFVQX0NPT0tJRV9QUkVGSVggPSAnaW5jX29wdGluX3BvcHVwX2xvbmdfaGlkZGVuLSc7XG5cdE9wdGluLlNMSURFX0lOX0NPT0tJRV9QUkVGSVggPSAnaW5jX29wdGluX3NsaWRlX2luX2xvbmdfaGlkZGVuLSc7XG5cdE9wdGluLkVNQkVEREVEX0NPT0tJRV9QUkVGSVggPSAnaW5jX29wdGluX2VtYmVkZGVkX2xvbmdfaGlkZGVuLSc7XG5cblx0T3B0aW4uZ2xvYmFsTWl4aW4gPSBmdW5jdGlvbigpIHtcblx0XHRfLm1peGluKHtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBMb2dzIHRvIGNvbnNvbGVcblx0XHRcdCAqL1xuXHRcdFx0Ly9sb2c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9cdGNvbnNvbGUubG9nKCBhcmd1bWVudHMgKTtcblx0XHRcdC8vfSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDb252ZXJ0cyB2YWwgdG8gYm9vbGlhblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSB2YWxcblx0XHRcdCAqIEByZXR1cm5zIHsqfVxuXHRcdFx0ICovXG5cdFx0XHR0b0Jvb2w6IGZ1bmN0aW9uKCB2YWwgKSB7XG5cdFx0XHRcdGlmICggXy5pc0Jvb2xlYW4oIHZhbCApICkge1xuXHRcdFx0XHRcdHJldHVybiB2YWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBfLmlzU3RyaW5nKCB2YWwgKSAmJiAtMSAhPT0gWyAndHJ1ZScsICdmYWxzZScsICcxJyBdLmluZGV4T2YoIHZhbC50b0xvd2VyQ2FzZSgpICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuICd0cnVlJyA9PT0gdmFsLnRvTG93ZXJDYXNlKCkgfHwgJzEnID09PSB2YWwudG9Mb3dlckNhc2UoKSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIF8uaXNOdW1iZXIoIHZhbCApICkge1xuXHRcdFx0XHRcdHJldHVybiAhICEgdmFsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggXy5pc1VuZGVmaW5lZCggdmFsICkgfHwgXy5pc051bGwoIHZhbCApIHx8IF8uaXNOYU4oIHZhbCApICkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVja3MgaWYgdmFsIGlzIHRydXRoeVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSB2YWxcblx0XHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHRpc1RydWU6IGZ1bmN0aW9uKCB2YWwgKSB7XG5cdFx0XHRcdGlmICggXy5pc1VuZGVmaW5lZCggdmFsICkgfHwgXy5pc051bGwoIHZhbCApIHx8IF8uaXNOYU4oIHZhbCApICkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIF8uaXNOdW1iZXIoIHZhbCApICkge1xuXHRcdFx0XHRcdHJldHVybiAwICE9PSB2YWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFsID0gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0cmV0dXJuIC0xICE9PSBbICcxJywgJ3RydWUnLCAnb24nIF0uaW5kZXhPZiggdmFsICk7XG5cdFx0XHR9LFxuXHRcdFx0aXNGYWxzZTogZnVuY3Rpb24oIHZhbCApIHtcblx0XHRcdFx0cmV0dXJuICEgXy5pc1RydWUoIHZhbCApO1xuXHRcdFx0fSxcblx0XHRcdGNvbnRyb2xCYXNlOiBmdW5jdGlvbiggY2hlY2tlZCwgY3VycmVudCwgYXR0cmlidXRlICkge1xuXHRcdFx0XHRhdHRyaWJ1dGUgPSBfLmlzVW5kZWZpbmVkKCBhdHRyaWJ1dGUgKSA/ICdjaGVja2VkJyA6IGF0dHJpYnV0ZTtcblx0XHRcdFx0Y2hlY2tlZCAgPSBfLnRvQm9vbCggY2hlY2tlZCApO1xuXHRcdFx0XHRjdXJyZW50ID0gXy5pc0Jvb2xlYW4oIGNoZWNrZWQgKSA/IF8uaXNUcnVlKCBjdXJyZW50ICkgOiBjdXJyZW50O1xuXHRcdFx0XHRpZiAoIF8uaXNFcXVhbCggY2hlY2tlZCwgY3VycmVudCApICkge1xuXHRcdFx0XHRcdHJldHVybiAgYXR0cmlidXRlICsgJz0nICsgYXR0cmlidXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmV0dXJucyBjaGVja2VkPWNoZWNrIGlmIGNoZWNrZWQgdmFyaWFibGUgaXMgZXF1YWwgdG8gY3VycmVudCBzdGF0ZVxuXHRcdFx0ICpcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gY2hlY2tlZCBjaGVja2VkIHN0YXRlXG5cdFx0XHQgKiBAcGFyYW0gY3VycmVudCBjdXJyZW50IHN0YXRlXG5cdFx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHRcdCAqL1xuXHRcdFx0Y2hlY2tlZDogZnVuY3Rpb24oIGNoZWNrZWQsIGN1cnJlbnQgKSB7XG5cdFx0XHRcdHJldHVybiBfLmNvbnRyb2xCYXNlKCBjaGVja2VkLCBjdXJyZW50LCAnY2hlY2tlZCcgKTtcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQWRkcyBzZWxlY3RlZCBhdHRyaWJ1dGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gc2VsZWN0ZWRcblx0XHRcdCAqIEBwYXJhbSBjdXJyZW50XG5cdFx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHRcdCAqL1xuXHRcdFx0c2VsZWN0ZWQ6IGZ1bmN0aW9uKCBzZWxlY3RlZCwgY3VycmVudCApIHtcblx0XHRcdFx0cmV0dXJuIF8uY29udHJvbEJhc2UoIHNlbGVjdGVkLCBjdXJyZW50LCAnc2VsZWN0ZWQnICk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFkZHMgZGlzYWJsZWQgYXR0cmlidXRlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRpc2FibGVkXG5cdFx0XHQgKiBAcGFyYW0gY3VycmVudFxuXHRcdFx0ICogQHJldHVybnMgeyp9XG5cdFx0XHQgKi9cblx0XHRcdGRpc2FibGVkOiBmdW5jdGlvbiggZGlzYWJsZWQsIGN1cnJlbnQgKSB7XG5cdFx0XHRcdHJldHVybiBfLmNvbnRyb2xCYXNlKCBkaXNhYmxlZCwgY3VycmVudCwgJ2Rpc2FibGVkJyApO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXR1cm5zIGNzcyBjbGFzcyBiYXNlZCBvbiB0aGUgcGFzc2VkIGluIGNvbmRpdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBjb25kaXRvblxuXHRcdFx0ICogQHBhcmFtIGNsc1xuXHRcdFx0ICogQHBhcmFtIG5lZ2F0aW5nX2Nsc1xuXHRcdFx0ICogQHJldHVybnMgeyp9XG5cdFx0XHQgKi9cblx0XHRcdGNsYXNzOiBmdW5jdGlvbiggY29uZGl0b24sIGNscywgbmVnYXRpbmdDbHMgKSB7XG5cdFx0XHRcdGlmICggXy5pc1RydWUoIGNvbmRpdG9uICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNscztcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBuZWdhdGluZ0NscyA/IG5lZ2F0aW5nQ2xzIDogJyc7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmV0dXJucyBjbGFzcyBhdHRyaWJ1dGUgd2l0aCByZWxldmFudCBjbGFzcyBuYW1lXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGNvbmRpdG9uXG5cdFx0XHQgKiBAcGFyYW0gY2xzXG5cdFx0XHQgKiBAcGFyYW0gbmVnYXRpbmdfY2xzXG5cdFx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdFx0ICovXG5cdFx0XHQvL2FkZF9jbGFzczogZnVuY3Rpb24oIGNvbmRpdG9uLCBjbHMsIG5lZ2F0aW5nQ2xzICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0Ly9cdHJldHVybiAnY2xhc3M9e2NsYXNzfScucmVwbGFjZSggJ3tjbGFzc30nLCAgXy5jbGFzcyggY29uZGl0b24sIGNscywgbmVnYXRpbmdDbHMgKSApO1xuXHRcdFx0Ly99LFxuXG5cdFx0XHQvL3RvVXBwZXJDYXNlOiBmdW5jdGlvbiggc3RyICkge1xuXHRcdFx0Ly9cdHJldHVybiAgXy5pc1N0cmluZyggc3RyICkgPyBzdHIudG9VcHBlckNhc2UoKSA6ICcnO1xuXHRcdFx0Ly99XG5cdFx0fSk7XG5cblx0XHQvL2lmICggISBfLmZpbmRLZXkgKSB7XG5cdFx0Ly9cdF8ubWl4aW4oe1xuXHRcdC8vXHRcdGZpbmRLZXk6IGZ1bmN0aW9uKCBvYmosIHByZWRpY2F0ZSwgY29udGV4dCApIHtcblx0XHQvL1x0XHRcdHByZWRpY2F0ZSA9IGNiKCBwcmVkaWNhdGUsIGNvbnRleHQgKTtcblx0XHQvL1x0XHRcdGxldCBrZXlzID0gXy5rZXlzKCBvYmogKSxcbiAgICAgICAgLy8gICAgICAgICAgICAgICAga2V5O1xuXHRcdC8vXHRcdFx0Zm9yICggbGV0IGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuXHRcdC8vXHRcdFx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdC8vXHRcdFx0XHRpZiAoIHByZWRpY2F0ZSggb2JqWyBrZXkgXSwga2V5LCBvYmogKSApIHtcblx0XHQvL1x0XHRcdFx0XHRyZXR1cm4ga2V5O1xuXHRcdC8vXHRcdFx0XHR9XG5cdFx0Ly9cdFx0XHR9XG5cdFx0Ly9cdFx0fVxuXHRcdC8vXHR9KTtcblx0XHQvL31cblx0fTtcblxuXHRPcHRpbi5nbG9iYWxNaXhpbigpO1xuXG5cdC8qKlxuXHQgKiBSZWN1cnNpdmUgdG9KU09OXG5cdCAqXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0QmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBqc29uID0gXy5jbG9uZSggdGhpcy5hdHRyaWJ1dGVzICk7XG5cdFx0dmFyIGF0dHI7XG5cdFx0Zm9yICggYXR0ciBpbiBqc29uICkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoIGpzb25bIGF0dHIgXSBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsICkgfHxcblx0XHRcdFx0KCBCYWNrYm9uZS5Db2xsZWN0aW9uICYmIGpzb25bYXR0cl0gaW5zdGFuY2VvZiBCYWNrYm9uZS5Db2xsZWN0aW9uIClcblx0XHRcdCkge1xuXHRcdFx0XHRqc29uWyBhdHRyIF0gPSBqc29uWyBhdHRyIF0udG9KU09OKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBqc29uO1xuXHR9O1xuXG5cdE9wdGluLnRlbXBsYXRlID0gXy5tZW1vaXplKCBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIGNvbXBpbGVkLFxuXG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHRldmFsdWF0ZTogLzwjKFtcXHNcXFNdKz8pIz4vZyxcblx0XHRcdFx0aW50ZXJwb2xhdGU6IC9cXHtcXHtcXHsoW1xcc1xcU10rPylcXH1cXH1cXH0vZyxcblx0XHRcdFx0ZXNjYXBlOiAvXFx7XFx7KFteXFx9XSs/KVxcfVxcfSg/IVxcfSkvZ1xuXHRcdFx0fTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdGNvbXBpbGVkID0gY29tcGlsZWQgfHwgXy50ZW1wbGF0ZSggJCggJyMnICsgaWQgKS5odG1sKCksIG51bGwsIG9wdGlvbnMgKTtcblx0XHRcdHJldHVybiBjb21waWxlZCggZGF0YSApLnJlcGxhY2UoICcvKjwhW0NEQVRBWyovJywgJycgKS5yZXBsYWNlKCAnLypdXT4qLycsICcnICk7XG5cdFx0fTtcblx0fSk7XG5cblx0LyoqXG5cdCAqIENvbXBhdGliaWxpdHkgd2l0aCBvdGhlciBwbHVnaW4vdGhlbWUgZS5nLiB1cGZyb250XG5cdCAqXG5cdCAqL1xuXHRPcHRpbi50ZW1wbGF0ZUNvbXBhdCA9IF8ubWVtb2l6ZSggZnVuY3Rpb24oIGlkICkge1xuXHRcdHZhciBjb21waWxlZDtcblxuXHRcdHJldHVybiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdGNvbXBpbGVkID0gY29tcGlsZWQgfHwgXy50ZW1wbGF0ZSggJCggJyMnICsgaWQgKS5odG1sKCkgKTtcblx0XHRcdHJldHVybiBjb21waWxlZCggZGF0YSApLnJlcGxhY2UoICcvKjwhW0NEQVRBWyovJywgJycgKS5yZXBsYWNlKCAnLypdXT4qLycsICcnICk7XG5cdFx0fTtcblx0fSk7XG5cblx0T3B0aW4uY29va2llID0gSHVzdGxlLmNvb2tpZTtcblxuXHRPcHRpbi5NaXhpbnMgPSB7XG5cdFx0X21peGluczoge30sXG5cdFx0X3NlcnZpY2VzTWl4aW5zOiB7fSxcblx0XHRfZGVzaW5nTWl4aW5zOiB7fSxcblx0XHRfZGlzcGxheU1peGluczoge30sXG5cdFx0YWRkOiBmdW5jdGlvbiggaWQsIG9iaiApIHtcblx0XHRcdHRoaXMuX21peGluc1tpZF0gPSBvYmo7XG5cdFx0fSxcblx0XHRnZXRNaXhpbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX21peGlucztcblx0XHR9LFxuXHRcdGFkZFNlcnZpY2VzTWl4aW46IGZ1bmN0aW9uKCBpZCwgb2JqICkge1xuXHRcdFx0dGhpcy5fc2VydmljZXNNaXhpbnNbaWRdID0gb2JqO1xuXHRcdH0sXG5cdFx0Z2V0U2VydmljZXNNaXhpbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3NlcnZpY2VzTWl4aW5zO1xuXHRcdH1cblx0fTtcblxuXG59KCBqUXVlcnkgKSApO1xuIiwiKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdEh1c3RsZS5FdmVudHMub24oICd2aWV3LnJlbmRlcmVkJywgZnVuY3Rpb24oIHZpZXcgKSB7XG5cblx0XHRpZiAoIHZpZXcgaW5zdGFuY2VvZiBCYWNrYm9uZS5WaWV3ICkge1xuXG5cdFx0XHRjb25zdCBhY2Nlc3NpYmxlSGlkZSA9ICggJGVsZW1lbnRzICkgPT4ge1xuXHRcdFx0XHRcdCRlbGVtZW50cy5oaWRlKCk7XG5cdFx0XHRcdFx0JGVsZW1lbnRzLnByb3AoICd0YWJpbmRleCcsICctMScgKTtcblx0XHRcdFx0XHQkZWxlbWVudHMucHJvcCggJ2hpZGRlbicsIHRydWUgKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0YWNjZXNzaWJsZVNob3cgPSAoICRlbGVtZW50cyApID0+IHtcblx0XHRcdFx0XHQkZWxlbWVudHMuc2hvdygpO1xuXHRcdFx0XHRcdCRlbGVtZW50cy5wcm9wKCAndGFiaW5kZXgnLCAnMCcgKTtcblx0XHRcdFx0XHQkZWxlbWVudHMucmVtb3ZlUHJvcCggJ2hpZGRlbicgKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0Ly8gSW5pdCBzZWxlY3Rcblx0XHRcdHZpZXcuJCggJ3NlbGVjdDpub3QoW211bHRpcGxlXSknICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFNVSS5zdWlTZWxlY3QoIHRoaXMgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBJbml0IHNlbGVjdDJcblx0XHRcdHZpZXcuJCggJy5zdWktc2VsZWN0Om5vdCguaHVzdGxlLXNlbGVjdC1hamF4KScgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0ZHJvcGRvd25Dc3NDbGFzczogJ3N1aS1zZWxlY3QtZHJvcGRvd24nXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gSW5pdCBhY2NvcmRpb25cblx0XHRcdHZpZXcuJCggJy5zdWktYWNjb3JkaW9uJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRTVUkuc3VpQWNjb3JkaW9uKCB0aGlzICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gSW5pdCB0YWJzXG5cdFx0XHRTVUkuc3VpVGFicygpO1xuXHRcdFx0U1VJLnRhYnMoe1xuXHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24oIHRhYiwgcGFuZWwgKSB7XG5cblx0XHRcdFx0XHRsZXQgd3JhcHBlciAgICAgICAgICA9IHRhYi5jbG9zZXN0KCAnLnN1aS10YWJzJyApLFxuXHRcdFx0XHRcdFx0c2NoZWR1bGVFdmVyeWRheSA9ICdzY2hlZHVsZS1ldmVyeWRheScsXG5cdFx0XHRcdFx0XHRzY2hlZHVsZVNvbWVkYXlzID0gJ3NjaGVkdWxlLXNvbWVkYXlzJyxcblx0XHRcdFx0XHRcdHNjaGVkdWxlU2VydmVyICAgPSAndGltZXpvbmUtc2VydmVyJyxcblx0XHRcdFx0XHRcdHNjaGVkdWxlQ3VzdG9tICAgPSAndGltZXpvbmUtY3VzdG9tJ1xuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0aWYgKCAndGFiLScgKyBzY2hlZHVsZUV2ZXJ5ZGF5ID09PSB0YWIuYXR0ciggJ2lkJyApICkge1xuXHRcdFx0XHRcdFx0d3JhcHBlci5maW5kKCAnI2lucHV0LScgKyBzY2hlZHVsZUV2ZXJ5ZGF5ICkuY2xpY2soKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICd0YWItJyArIHNjaGVkdWxlU29tZWRheXMgPT09IHRhYi5hdHRyKCAnaWQnICkgKSB7XG5cdFx0XHRcdFx0XHR3cmFwcGVyLmZpbmQoICcjaW5wdXQtJyArIHNjaGVkdWxlU29tZWRheXMgKS5jbGljaygpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggJ3RhYi0nICsgc2NoZWR1bGVTZXJ2ZXIgPT09IHRhYi5hdHRyKCAnaWQnICkgKSB7XG5cdFx0XHRcdFx0XHR3cmFwcGVyLmZpbmQoICcjaW5wdXQtJyArIHNjaGVkdWxlU2VydmVyICkuY2xpY2soKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICd0YWItJyArIHNjaGVkdWxlQ3VzdG9tID09PSB0YWIuYXR0ciggJ2lkJyApICkge1xuXHRcdFx0XHRcdFx0d3JhcHBlci5maW5kKCAnI2lucHV0LScgKyBzY2hlZHVsZUN1c3RvbSApLmNsaWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gSW5pdCBmbG9hdCBpbnB1dFxuXHRcdFx0U1VJLmZsb2F0SW5wdXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIaWRlcyBhbmQgc2hvd3MgdGhlIGNvbnRlbnQgb2YgdGhlIHNldHRpbmdzIHVzaW5nIHN1aS1zaWRlLXRhYnMuXG5cdFx0XHQgKiBGb3IgdXMsIG5vbi1kZXNpZ25lcnM6IHN1aS1zaWRlLXRhYnMgYXJlIHRoZSBcImJ1dHRvbnNcIiB0aGF0IHdvcmsgYXMgbGFiZWxzIGZvciByYWRpbyBpbnB1dHMuXG5cdFx0XHQgKiBUaGV5IG1heSBoYXZlIHJlbGF0ZWQgY29udGVudCB0aGF0IHNob3VsZCBiZSBzaG93biBvciBoaWRkZW4gZGVwZW5kaW5nIG9uIHRoZSBzZWxlY3RlZCBvcHRpb24uXG5cdFx0XHQgKiBAc2luY2UgNC4wXG5cdFx0XHQgKi9cblx0XHRcdHZpZXcuJCggJy5zdWktc2lkZS10YWJzJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdGNvbnN0ICRpbnB1dHMgPSAkKCB0aGlzICkuZmluZCggJy5zdWktdGFicy1tZW51IC5zdWktdGFiLWl0ZW0gaW5wdXQnICksXG5cblx0XHRcdFx0XHRoYW5kbGVUYWJzID0gKCkgPT4ge1xuXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGhvbGRzIHRoZSBkZXBlbmRlbmN5IG5hbWUgb2YgdGhlIHNlbGVjdGVkIGlucHV0LlxuXHRcdFx0XHRcdFx0Ly8gSXQncyB1c2VkIHRvIGF2b2lkIGhpZGluZyBhIGNvbnRhaW5lciB0aGF0IHNob3VsZCBiZSBzaG93blxuXHRcdFx0XHRcdFx0Ly8gd2hlbiB0d28gb3IgbW9yZSB0YWJzIHNoYXJlIHRoZSBzYW1lIGNvbnRhaW5lci5cblx0XHRcdFx0XHRcdGxldCBzaG93bkRlcCA9ICcnO1xuXG5cdFx0XHRcdFx0XHQkLmVhY2goICRpbnB1dHMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkaW5wdXQgPSAkKCB0aGlzICksXG5cdFx0XHRcdFx0XHRcdFx0JGxhYmVsID0gJGlucHV0LnBhcmVudCggJ2xhYmVsJyApLFxuXHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3lOYW1lID0gJGlucHV0LmRhdGEoICd0YWItbWVudScgKSxcblx0XHRcdFx0XHRcdFx0XHQkdGFiQ29udGVudCA9ICAkKCBgLnN1aS10YWJzLWNvbnRlbnQgW2RhdGEtdGFiLWNvbnRlbnQ9XCIkeyBkZXBlbmRlbmN5TmFtZSB9XCJdYCApLFxuXHRcdFx0XHRcdFx0XHRcdCR0YWJEZXBlbmRlbnQgPSAgJCggYFtkYXRhLXRhYi1kZXBlbmRlbnQ9XCIkeyBkZXBlbmRlbmN5TmFtZSB9XCJdYCApO1xuXG5cdFx0XHRcdFx0XHRcdGlmICggJGlucHV0WzBdLmNoZWNrZWQgKSB7XG5cdFx0XHRcdFx0XHRcdFx0JGxhYmVsLmFkZENsYXNzKCAnYWN0aXZlJyApO1xuXHRcdFx0XHRcdFx0XHRcdGlmICggZGVwZW5kZW5jeU5hbWUgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzaG93bkRlcCA9IGRlcGVuZGVuY3lOYW1lO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHQkdGFiQ29udGVudC5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcblx0XHRcdFx0XHRcdFx0XHRcdGFjY2Vzc2libGVTaG93KCAkdGFiRGVwZW5kZW50ICk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0JGxhYmVsLnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApO1xuXHRcdFx0XHRcdFx0XHRcdGlmICggZGVwZW5kZW5jeU5hbWUgIT09IHNob3duRGVwICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0JHRhYkNvbnRlbnQucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRhY2Nlc3NpYmxlSGlkZSggJHRhYkRlcGVuZGVudCApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vIERvIGl0IG9uIGxvYWQuXG5cdFx0XHRcdGhhbmRsZVRhYnMoKTtcblxuXHRcdFx0XHQvLyBBbmQgZG8gaXQgb24gY2hhbmdlLlxuXHRcdFx0XHQkaW5wdXRzLm9uKCAnY2hhbmdlJywgKCkgPT4gaGFuZGxlVGFicygpICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIaWRlcyBhbmQgc2hvd3MgdGhlIGNvbnRhaW5lciBkZXBlbmRlbnQgb24gdG9nZ2xlc1xuXHRcdFx0ICogb24gdmlldyBsb2FkIGFuZCBvbiBjaGFuZ2UuXG5cdFx0XHQgKiBVc2VkIGluIHdpemFyZHMgYW5kIGdsb2JhbCBzZXR0aW5ncyBwYWdlLlxuXHRcdFx0ICogQHNpbmNlIDQuMC4zXG5cdFx0XHQgKi9cblx0XHRcdHZpZXcuJCggJy5zdWktdG9nZ2xlLmh1c3RsZS10b2dnbGUtd2l0aC1jb250YWluZXInICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnN0ICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0XHRcdCRjaGVja2JveCA9ICR0aGlzLmZpbmQoICdpbnB1dFt0eXBlPWNoZWNrYm94XScgKSxcblx0XHRcdFx0XHQkY29udGFpbmVyc09uID0gJCggYFtkYXRhLXRvZ2dsZS1jb250ZW50PVwiJHsgJHRoaXMuZGF0YSggJ3RvZ2dsZS1vbicgKSB9XCJdYCApLFxuXHRcdFx0XHRcdCRjb250YWluZXJzT2ZmID0gJCggYFtkYXRhLXRvZ2dsZS1jb250ZW50PVwiJHsgJHRoaXMuZGF0YSggJ3RvZ2dsZS1vZmYnICkgfVwiXWAgKSxcblx0XHRcdFx0XHRkb1RvZ2dsZSA9ICgpID0+IHtcblx0XHRcdFx0XHRcdGlmICggJGNoZWNrYm94WzBdLmNoZWNrZWQgKSB7XG5cdFx0XHRcdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggJGNvbnRhaW5lcnNPbiApO1xuXHRcdFx0XHRcdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZUhpZGUoICRjb250YWluZXJzT2ZmICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coICRjb250YWluZXJzT2ZmICk7XG5cdFx0XHRcdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlSGlkZSggJGNvbnRhaW5lcnNPbiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gRG8gaXQgb24gbG9hZC5cblx0XHRcdFx0ZG9Ub2dnbGUoKTtcblxuXHRcdFx0XHQvLyBBbmQgZG8gaXQgb24gY2hhbmdlLlxuXHRcdFx0XHQkY2hlY2tib3gub24oICdjaGFuZ2UnLCAoKSA9PiBkb1RvZ2dsZSgpICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmlldy4kKCAnc2VsZWN0Lmh1c3RsZS1zZWxlY3Qtd2l0aC1jb250YWluZXInICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0Y29uc3QgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRcdFx0JGRlcENvbnRhaW5lciA9ICQoIGBbZGF0YS1maWVsZC1jb250ZW50PVwiJHsgdGhpcy5uYW1lIH1cIl1gICksXG5cdFx0XHRcdFx0dmFsdWVzT24gPSAkdGhpcy5kYXRhKCAnY29udGVudC1vbicgKS5zcGxpdCggJywnICksXG5cdFx0XHRcdFx0ZG9Ub2dnbGUgPSAoKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoIHZhbHVlc09uLmluY2x1ZGVzKCAkdGhpcy52YWwoKSApICkge1xuXHRcdFx0XHRcdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coICRkZXBDb250YWluZXIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlSGlkZSggJGRlcENvbnRhaW5lciApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gRG8gaXQgb24gbG9hZC5cblx0XHRcdFx0ZG9Ub2dnbGUoKTtcblxuXHRcdFx0XHQvLyBBbmQgZG8gaXQgb24gY2hhbmdlLlxuXHRcdFx0XHQkdGhpcy5vbiggJ2NoYW5nZScsICgpID0+IGRvVG9nZ2xlKCkgKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cblx0JCggZG9jdW1lbnQgKS5yZWFkeSggZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAkKCAnI2h1c3RsZS1lbWFpbC1kYXknICkubGVuZ3RoICkge1xuXHRcdFx0JCggJyNodXN0bGUtZW1haWwtZGF5JyApLmRhdGVwaWNrZXIoe1xuXHRcdFx0XHRiZWZvcmVTaG93OiBmdW5jdGlvbiggaW5wdXQsIGluc3QgKSB7XG5cdFx0XHRcdFx0JCggJyN1aS1kYXRlcGlja2VyLWRpdicgKS5hZGRDbGFzcyggJ3N1aS1jYWxlbmRhcicgKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0J2RhdGVGb3JtYXQnOiAnTU0gZGQsIHl5J1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCAkKCAnI2h1c3RsZS1lbWFpbC10aW1lJyApLmxlbmd0aCApIHtcblxuXHRcdFx0JCggJyNodXN0bGUtZW1haWwtdGltZScgKS50aW1lcGlja2VyKHtcblx0XHRcdFx0dGltZUZvcm1hdDogJ2g6bW0gcCcsXG5cdFx0XHRcdGludGVydmFsOiAnMScsXG5cdFx0XHRcdG1pblRpbWU6ICcwJyxcblx0XHRcdFx0bWF4VGltZTogJzExOjU5cG0nLFxuXHRcdFx0XHRkZWZhdWx0VGltZTogbnVsbCxcblx0XHRcdFx0c3RhcnRUaW1lOiAnMDA6MDAnLFxuXHRcdFx0XHRkeW5hbWljOiBmYWxzZSxcblx0XHRcdFx0ZHJvcGRvd246IHRydWUsXG5cdFx0XHRcdHNjcm9sbGJhcjogdHJ1ZSxcblx0XHRcdFx0Y2hhbmdlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1lbWFpbC10aW1lJyApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIERpc21pc3NlcyB0aGUgbm90aWNlIHRoYXQgc2hvd3MgdXAgd2hlbiB0aGUgdXNlciBpcyBhIG1lbWJlciBidXQgZG9lc24ndCBoYXZlIEh1c3RsZSBQcm8gaW5zdGFsbGVkXG5cdFx0JCggJyNodXN0bGUtbm90aWNlLXByby1pcy1hdmFpbGFibGUgLm5vdGljZS1kaXNtaXNzJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRcdGFjdGlvbjogJ2h1c3RsZV9kaXNtaXNzX2FkbWluX25vdGljZScsXG5cdFx0XHRcdGRpc21pc3NlZE5vdGljZTogJ2h1c3RsZV9wcm9faXNfYXZhaWxhYmxlJ1xuXHRcdFx0fTtcblxuXHRcdFx0JC5wb3N0KCBhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdC8vIE1ha2VzIHRoZSAnY29weScgYnV0dG9uIHdvcmsuXG5cdFx0JCggJy5odXN0bGUtY29weS1zaG9ydGNvZGUtYnV0dG9uJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0ICRidXR0b24gPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRzaG9ydGNvZGUgPSAkYnV0dG9uLmRhdGEoICdzaG9ydGNvZGUnICksXG5cdFx0XHRcdCRpbnB1dFdyYXBwZXIgPSAkYnV0dG9uLmNsb3Nlc3QoICcuc3VpLXdpdGgtYnV0dG9uLWluc2lkZScgKTtcblxuXHRcdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2Ygc2hvcnRjb2RlICkge1xuXG5cdFx0XHRcdFx0Ly8gQWN0aW9ucyBpbiBsaXN0aW5nIHBhZ2VzLlxuXHRcdFx0XHRcdGxldCAkdGVtcCA9ICQoICc8aW5wdXQgLz4nICk7XG5cdFx0XHRcdFx0JCggJ2JvZHknICkuYXBwZW5kKCAkdGVtcCApO1xuXHRcdFx0XHRcdCR0ZW1wLnZhbCggc2hvcnRjb2RlICkuc2VsZWN0KCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoICdjb3B5JyApO1xuXHRcdFx0XHRcdCR0ZW1wLnJlbW92ZSgpO1xuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ3N1Y2Nlc3MnLCBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy5zaG9ydGNvZGVfY29waWVkICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggJGlucHV0V3JhcHBlci5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHQvLyBDb3B5IHNob3J0Y29kZSBpbiB3aXphcmQgcGFnZXMuXG5cdFx0XHRcdFx0bGV0ICRpbnB1dFdpdGhDb3B5ID0gJGlucHV0V3JhcHBlci5maW5kKCAnaW5wdXRbdHlwZT1cInRleHRcIl0nICk7XG5cdFx0XHRcdFx0JGlucHV0V2l0aENvcHkuc2VsZWN0KCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoICdjb3B5JyApO1xuXHRcdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkKCAnI2h1c3RsZS10cmFja2luZy1taWdyYXRpb24tbm90aWNlIC5odXN0bGUtbm90aWNlLWRpc21pc3MnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1kaXNtaXNzLW1vZGFsLWJ1dHRvbicgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHQkLnBvc3QoXG5cdFx0XHRcdFx0YWpheHVybCxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfZGlzbWlzc19ub3RpZmljYXRpb24nLFxuXHRcdFx0XHRcdFx0bmFtZTogJCggZS5jdXJyZW50VGFyZ2V0ICkuZGF0YSggJ25hbWUnICksXG5cdFx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiAkKCBlLmN1cnJlbnRUYXJnZXQgKS5kYXRhKCAnbm9uY2UnIClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdFx0LmFsd2F5cyggKCkgPT4gbG9jYXRpb24ucmVsb2FkKCkgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tbWlncmF0ZS1kaXNtaXNzLWNvbmZpcm1hdGlvbiddLnNob3coKTtcblx0XHR9KTtcblxuXHRcdCQoICcjaHVzdGxlLXNlbmRncmlkLXVwZGF0ZS1ub3RpY2UgLm5vdGljZS1kaXNtaXNzJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Y29uc3QgJGNvbnRhaW5lciA9ICQoIGUuY3VycmVudFRhcmdldCApLmNsb3Nlc3QoICcjaHVzdGxlLXNlbmRncmlkLXVwZGF0ZS1ub3RpY2UnICk7XG5cblx0XHRcdCQucG9zdChcblx0XHRcdFx0YWpheHVybCxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFjdGlvbjogJ2h1c3RsZV9kaXNtaXNzX25vdGlmaWNhdGlvbicsXG5cdFx0XHRcdFx0bmFtZTogJGNvbnRhaW5lci5kYXRhKCAnbmFtZScgKSxcblx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiAkY29udGFpbmVyLmRhdGEoICdub25jZScgKVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXG5cdFx0fSk7XG5cblx0XHQkKCAnLmh1c3RsZS1ub3RpY2UgLm5vdGljZS1kaXNtaXNzLCAuaHVzdGxlLW5vdGljZSAuZGlzbWlzcy1ub3RpY2UnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRjb25zdCAkY29udGFpbmVyID0gJCggZS5jdXJyZW50VGFyZ2V0ICkuY2xvc2VzdCggJy5odXN0bGUtbm90aWNlJyApO1xuXG5cdFx0XHQkLnBvc3QoXG5cdFx0XHRcdGFqYXh1cmwsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfZGlzbWlzc19ub3RpZmljYXRpb24nLFxuXHRcdFx0XHRcdG5hbWU6ICRjb250YWluZXIuZGF0YSggJ25hbWUnICksXG5cdFx0XHRcdFx0X2FqYXhfbm9uY2U6ICRjb250YWluZXIuZGF0YSggJ25vbmNlJyApIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdH1cblx0XHRcdClcblx0XHRcdC5hbHdheXMoICgpID0+IGxvY2F0aW9uLnJlbG9hZCgpICk7XG5cdFx0fSk7XG5cblx0XHRpZiAoICQoICcuc3VpLWZvcm0tZmllbGQgaW5wdXRbdHlwZT1udW1iZXJdJyApLmxlbmd0aCApIHtcblx0XHRcdCQoICcuc3VpLWZvcm0tZmllbGQgaW5wdXRbdHlwZT1udW1iZXJdJyApLm9uKCAna2V5ZG93bicsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRpZiAoICQoIHRoaXMgKVswXS5oYXNBdHRyaWJ1dGUoICdtaW4nICkgJiYgMCA8PSAkKCB0aGlzICkuYXR0ciggJ21pbicgKSApIHtcblx0XHRcdFx0XHRsZXQgY2hhciA9IGUub3JpZ2luYWxFdmVudC5rZXkucmVwbGFjZSggL1teMC05Xi5eLF0vLCAnJyApO1xuXHRcdFx0XHRcdGlmICggMCA9PT0gY2hhci5sZW5ndGggJiYgISAoIGUub3JpZ2luYWxFdmVudC5jdHJsS2V5IHx8IGUub3JpZ2luYWxFdmVudC5tZXRhS2V5ICkgKSB7XG5cdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggJCggJy5odXN0bGUtc2Nyb2xsLXRvJyApLmxlbmd0aCApIHtcblx0XHRcdFx0JCggJ2h0bWwsIGJvZHknICkuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0c2Nyb2xsVG9wOiAkKCAnLmh1c3RsZS1zY3JvbGwtdG8nICkub2Zmc2V0KCkudG9wXG5cdFx0XHRcdH0sICdzbG93JyApO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCApO1xuXG5cdFx0Ly90YWJsZSBjaGVja2JveGVzXG5cdFx0JCggJy5odXN0bGUtY2hlY2stYWxsJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdCRsaXN0ID0gJHRoaXMucGFyZW50cyggJy5zdWktd3JhcCcgKS5maW5kKCAnLmh1c3RsZS1saXN0JyApLFxuXHRcdFx0XHRhbGxDaGVja2VkID0gJHRoaXMuaXMoICc6Y2hlY2tlZCcgKTtcblxuXHRcdFx0JGxpc3QuZmluZCggJy5odXN0bGUtbGlzdGluZy1jaGVja2JveCcgKS5wcm9wKCAnY2hlY2tlZCcsIGFsbENoZWNrZWQgKTtcblx0XHRcdCQoICcuaHVzdGxlLWJ1bGstYXBwbHktYnV0dG9uJyApLnByb3AoICdkaXNhYmxlZCcsICEgYWxsQ2hlY2tlZCApO1xuXHRcdH0pO1xuXG5cdFx0JCggJy5odXN0bGUtbGlzdCAuaHVzdGxlLWxpc3RpbmctY2hlY2tib3gnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0bGV0ICR0aGlzID0gJCggZS50YXJnZXQgKSxcblx0XHRcdFx0JGxpc3QgPSAkdGhpcy5wYXJlbnRzKCAnLnN1aS13cmFwJyApLmZpbmQoICcuaHVzdGxlLWxpc3QnICksXG5cdFx0XHRcdGFsbENoZWNrZWQgPSAkdGhpcy5pcyggJzpjaGVja2VkJyApICYmICEgJGxpc3QuZmluZCggJy5odXN0bGUtbGlzdGluZy1jaGVja2JveDpub3QoOmNoZWNrZWQpJyApLmxlbmd0aCxcblx0XHRcdFx0Y291bnQgPSAkbGlzdC5maW5kKCAnLmh1c3RsZS1saXN0aW5nLWNoZWNrYm94OmNoZWNrZWQnICkubGVuZ3RoLFxuXHRcdFx0XHRkaXNhYmxlZCA9IDAgPT09IGNvdW50O1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1jaGVjay1hbGwnICkucHJvcCggJ2NoZWNrZWQnLCBhbGxDaGVja2VkICk7XG5cdFx0XHQkKCAnLmh1c3RsZS1idWxrLWFwcGx5LWJ1dHRvbicgKS5wcm9wKCAnZGlzYWJsZWQnLCBkaXNhYmxlZCApO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fSk7XG5cblx0XHQkKCAnLmh1c3RsZS1idWxrLWFwcGx5LWJ1dHRvbicgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRsZXQgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHR2YWx1ZSA9ICQoICdzZWxlY3Qgb3B0aW9uOnNlbGVjdGVkJywgJHRoaXMuY2xvc2VzdCggJy5odWktYnVsay1hY3Rpb25zJyApICkudmFsKCksXG5cdFx0XHRcdGVsZW1lbnRzID0gJCggJy5odXN0bGUtbGlzdCAuaHVzdGxlLWxpc3RpbmctY2hlY2tib3g6Y2hlY2tlZCcgKTtcblxuXHRcdFx0aWYgKCAwID09PSBlbGVtZW50cy5sZW5ndGggfHwgJ3VuZGVmaW5lZCcgPT09IHZhbHVlICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRsZXQgaWRzID0gW107XG5cdFx0XHQkLmVhY2goIGVsZW1lbnRzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWRzLnB1c2goICQoIHRoaXMgKS52YWwoKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICggJ2RlbGV0ZS1hbGwnID09PSB2YWx1ZSApIHtcblx0XHRcdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRcdFx0aWRzOiBpZHMuam9pbiggJywnICksXG5cdFx0XHRcdFx0bm9uY2U6ICR0aGlzLnNpYmxpbmdzKCAnI2h1c3RsZV9ub25jZScgKS52YWwoKSxcblx0XHRcdFx0XHR0aXRsZTogJHRoaXMuZGF0YSggJ3RpdGxlJyApLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiAkdGhpcy5kYXRhKCAnZGVzY3JpcHRpb24nICksXG5cdFx0XHRcdFx0YWN0aW9uOiB2YWx1ZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdE1vZHVsZS5kZWxldGVNb2RhbC5vcGVuKCBkYXRhICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9KTtcblxufSAoIGpRdWVyeSApICk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTW9kYWxzLk1pZ3JhdGlvbicsIGZ1bmN0aW9uKCAkICkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRjb25zdCBtaWdyYXRpb25Nb2RhbFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlJyxcblxuXHRcdGRhdGE6IHt9LFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1taWdyYXRlLXN0YXJ0JzogJ21pZ3JhdGVTdGFydCcsXG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1jcmVhdGUtbmV3LW1vZHVsZSc6ICdjcmVhdGVNb2R1bGUnLFxuXHRcdFx0J2NsaWNrIC5zdWktYm94LXNlbGVjdG9yJzogJ2VuYWJsZUNvbnRpbnVlJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLWRpYWxvZy1taWdyYXRlLXNraXAnOiAnZGlzbWlzc01vZGFsJyxcblx0XHRcdCdjbGljayAuc3VpLWRpYWxvZy1vdmVybGF5JzogJ2Rpc21pc3NNb2RhbCdcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSgpIHtcblx0XHRcdGlmICggISB0aGlzLiRlbC5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGN1cnJlbnRTbGlkZSA9ICcnLFxuXHRcdFx0XHRmb2N1c09uT3BlbiA9ICcnO1xuXG5cdFx0XHRpZiAoIDAgPT09IHRoaXMuJGVsLmRhdGEoICdpc0ZpcnN0JyApICkge1xuXHRcdFx0XHRjdXJyZW50U2xpZGUgPSAnI2h1c3RsZS1kaWFsb2ctLW1pZ3JhdGUtc2xpZGUtMic7XG5cdFx0XHRcdGZvY3VzT25PcGVuID0gJ2h1c3RsZS1taWdyYXRlLXN0YXJ0JztcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VycmVudFNsaWRlID0gJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlLXNsaWRlLTEnO1xuXHRcdFx0XHRmb2N1c09uT3BlbiA9ICdodXN0bGUtbWlncmF0ZS1nZXQtc3RhcnRlZCc7XG5cblx0XHRcdH1cblxuXHRcdFx0dGhpcy4kKCBjdXJyZW50U2xpZGUgKS5hZGRDbGFzcyggJ3N1aS1hY3RpdmUgc3VpLWxvYWRlZCcgKTtcblxuXHRcdFx0c2V0VGltZW91dCggKCkgPT4gU1VJLm9wZW5Nb2RhbCggJ2h1c3RsZS1kaWFsb2ctLW1pZ3JhdGUnLCBmb2N1c09uT3BlbiwgJCggJy5zdWktd3JhcCcgKVswXSwgZmFsc2UgKSwgMTAwICk7XG5cblx0XHRcdHRoaXMuJHByb2dyZXNzQmFyID0gdGhpcy4kZWwuZmluZCggJy5zdWktcHJvZ3Jlc3MgLnN1aS1wcm9ncmVzcy1iYXIgc3BhbicgKTtcblx0XHRcdHRoaXMuJHByb2dyZXNzVGV4dCA9IHRoaXMuJGVsLmZpbmQoICcuc3VpLXByb2dyZXNzIC5zdWktcHJvZ3Jlc3MtdGV4dCBzcGFuJyApO1xuXHRcdFx0dGhpcy4kcGFydGlhbFJvd3MgPSB0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1wYXJ0aWFsLXJvd3MnICk7XG5cdFx0fSxcblxuXHRcdG1pZ3JhdGVTdGFydCggZSApIHtcblxuXHRcdFx0Y29uc3QgbWUgPSB0aGlzO1xuXG5cdFx0XHRjb25zdCBidXR0b24gICAgICA9ICQoIGUudGFyZ2V0ICk7XG5cdFx0XHRjb25zdCAkY29udGFpbmVyID0gdGhpcy4kZWwsXG5cdFx0XHRcdCRkaWFsb2cgICAgICA9ICRjb250YWluZXIuZmluZCggJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlLXNsaWRlLTInICksXG5cdFx0XHRcdGRlc2NyaXB0aW9uICA9ICRkaWFsb2cuZmluZCggJyNtaWdyYXRlRGlhbG9nMkRlc2NyaXB0aW9uJyApO1xuXG5cdFx0XHQvLyBPbiBsb2FkIGJ1dHRvblxuXHRcdFx0YnV0dG9uLmFkZENsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cblx0XHRcdC8vIFJlbW92ZSBza2lwIG1pZ3JhdGlvbiBsaW5rXG5cdFx0XHQkZGlhbG9nLmZpbmQoICcuaHVzdGxlLWRpYWxvZy1taWdyYXRlLXNraXAnICkucmVtb3ZlKCk7XG5cblx0XHRcdGRlc2NyaXB0aW9uLnRleHQoIGRlc2NyaXB0aW9uLmRhdGEoICdtaWdyYXRlLXRleHQnICkgKTtcblxuXHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCAkZGlhbG9nLmZpbmQoICdkaXZbZGF0YS1taWdyYXRlLXN0YXJ0XScgKSApO1xuXHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCAkZGlhbG9nLmZpbmQoICdkaXZbZGF0YS1taWdyYXRlLWZhaWxlZF0nICkgKTtcblx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggJGRpYWxvZy5maW5kKCAnZGl2W2RhdGEtbWlncmF0ZS1wcm9ncmVzc10nICkgKTtcblxuXHRcdFx0bWUubWlncmF0ZVRyYWNraW5nKCBlICk7XG5cblx0XHRcdGJ1dHRvbi5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR9LFxuXG5cdFx0bWlncmF0ZUNvbXBsZXRlKCkge1xuXG5cdFx0XHRjb25zdCBzbGlkZSAgICAgICA9IHRoaXMuJCggJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlLXNsaWRlLTInICksXG5cdFx0XHRcdHNlbGYgPSB0aGlzO1xuXHRcdFx0Y29uc3QgdGl0bGUgICAgICAgPSBzbGlkZS5maW5kKCAnI21pZ3JhdGVEaWFsb2cyVGl0bGUnICk7XG5cdFx0XHRjb25zdCBkZXNjcmlwdGlvbiA9IHNsaWRlLmZpbmQoICcjbWlncmF0ZURpYWxvZzJEZXNjcmlwdGlvbicgKTtcblxuXHRcdFx0dGhpcy4kZWwuZmluZCggJ3N1aS1idXR0b24tb25sb2FkJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cblx0XHRcdHRpdGxlLnRleHQoIHRpdGxlLmRhdGEoICdkb25lLXRleHQnICkgKTtcblx0XHRcdGRlc2NyaXB0aW9uLnRleHQoIGRlc2NyaXB0aW9uLmRhdGEoICdkb25lLXRleHQnICkgKTtcblxuXHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCBzbGlkZS5maW5kKCAnZGl2W2RhdGEtbWlncmF0ZS1wcm9ncmVzc10nICkgKTtcblx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggc2xpZGUuZmluZCggJ2RpdltkYXRhLW1pZ3JhdGUtZG9uZV0nICkgKTtcblxuXHRcdFx0dGhpcy4kZWwuY2xvc2VzdCggJy5zdWktbW9kYWwnICkub24oICdjbGljaycsICggZSApID0+IHNlbGYuY2xvc2VEaWFsb2coIGUgKSApO1xuXG5cdFx0fSxcblxuXHRcdG1pZ3JhdGVGYWlsZWQoKSB7XG5cblx0XHRcdGNvbnN0IHNsaWRlID0gdGhpcy4kZWwuZmluZCggJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlLXNsaWRlLTInICksXG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gc2xpZGUuZmluZCggJyNkaWFsb2dEZXNjcmlwdGlvbicgKTtcblxuXHRcdFx0ZGVzY3JpcHRpb24udGV4dCggJycgKTtcblxuXHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCBzbGlkZS5maW5kKCAnZGl2W2RhdGEtbWlncmF0ZS1zdGFydF0nICkgKTtcblx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggc2xpZGUuZmluZCggJ2RpdltkYXRhLW1pZ3JhdGUtZmFpbGVkXScgKSApO1xuXHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCBzbGlkZS5maW5kKCAnZGl2W2RhdGEtbWlncmF0ZS1wcm9ncmVzc10nICkgKTtcblx0XHR9LFxuXG5cdFx0dXBkYXRlUHJvZ3Jlc3MoIG1pZ3JhdGVkUm93cywgcm93c1BlcmNlbnRhZ2UsIHRvdGFsUm93cyApIHtcblxuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMudG90YWxSb3dzICkge1xuXHRcdFx0XHR0aGlzLnRvdGFsUm93cyA9IHRvdGFsUm93cztcblx0XHRcdFx0dGhpcy4kZWwuZmluZCggJyNodXN0bGUtdG90YWwtcm93cycgKS50ZXh0KCB0b3RhbFJvd3MgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy4kcGFydGlhbFJvd3MudGV4dCggbWlncmF0ZWRSb3dzICk7XG5cblx0XHRcdGNvbnN0IHdpZHRoID0gcm93c1BlcmNlbnRhZ2UgKyAnJSc7XG5cdFx0XHR0aGlzLiRwcm9ncmVzc0Jhci5jc3MoICd3aWR0aCcsIHdpZHRoICk7XG5cblx0XHRcdGlmICggMTAwID49IHJvd3NQZXJjZW50YWdlICkge1xuXHRcdFx0XHR0aGlzLiRwcm9ncmVzc1RleHQudGV4dCggcm93c1BlcmNlbnRhZ2UgKyAnJScgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bWlncmF0ZVRyYWNraW5nKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdCRidXR0b24gPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0bm9uY2UgPSAkYnV0dG9uLmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0ZGF0YSA9IHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfbWlncmF0ZV90cmFja2luZycsXG5cdFx0XHRcdFx0J19hamF4X25vbmNlJzogbm9uY2Vcblx0XHRcdFx0fTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRcdGRhdGEsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCByZXMgKSB7XG5cdFx0XHRcdFx0aWYgKCByZXMuc3VjY2VzcyApIHtcblxuXHRcdFx0XHRcdFx0Y29uc3QgbWlncmF0ZWRSb3dzID0gcmVzLmRhdGEubWlncmF0ZWRfcm93cyxcblx0XHRcdFx0XHRcdFx0bWlncmF0ZWRQZXJjZW50YWdlID0gcmVzLmRhdGEubWlncmF0ZWRfcGVyY2VudGFnZSxcblx0XHRcdFx0XHRcdFx0dG90YWxSb3dzID0gcmVzLmRhdGEudG90YWxfZW50cmllcyB8fCAnMCc7XG5cblx0XHRcdFx0XHRcdGlmICggJ2RvbmUnICE9PSByZXMuZGF0YS5jdXJyZW50X21ldGEgKSB7XG5cblx0XHRcdFx0XHRcdFx0c2VsZi51cGRhdGVQcm9ncmVzcyggbWlncmF0ZWRSb3dzLCBtaWdyYXRlZFBlcmNlbnRhZ2UsIHRvdGFsUm93cyApO1xuXHRcdFx0XHRcdFx0XHRzZWxmLm1pZ3JhdGVUcmFja2luZyggZSApO1xuXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZVByb2dyZXNzKCBtaWdyYXRlZFJvd3MsIG1pZ3JhdGVkUGVyY2VudGFnZSwgdG90YWxSb3dzICk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gU2V0IGEgc21hbGwgZGVsYXkgc28gdGhlIHVzZXJzIGNhbiBzZWUgdGhlIHByb2dyZXNzIHVwZGF0ZSBpbiBmcm9udCBiZWZvcmUgbW92aW5nXG5cdFx0XHRcdFx0XHRcdC8vIGZvcndhcmQgYW5kIHRoZXkgZG9uJ3QgdGhpbmsgc29tZSByb3dzIHdlcmUgbm90IG1pZ3JhdGVkLlxuXHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCAoKSA9PiBzZWxmLm1pZ3JhdGVDb21wbGV0ZSgpLCA1MDAgKTtcblx0XHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNlbGYubWlncmF0ZUZhaWxlZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCByZXMgKSB7XG5cdFx0XHRcdFx0c2VsZi5taWdyYXRlRmFpbGVkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cblx0XHRjcmVhdGVNb2R1bGUoIGUgKSB7XG5cblx0XHRcdGNvbnN0IGJ1dHRvbiA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdCRzZWxlY3Rpb24gPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtc2VsZWN0b3IgaW5wdXQ6Y2hlY2tlZCcgKTtcblxuXG5cdFx0XHRpZiAoICRzZWxlY3Rpb24ubGVuZ3RoICkge1xuXG5cdFx0XHRcdHRoaXMuZGlzbWlzc01vZGFsKCk7XG5cblx0XHRcdFx0YnV0dG9uLmFkZENsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cblx0XHRcdFx0Y29uc3QgbW9kdWxlVHlwZSA9ICRzZWxlY3Rpb24udmFsKCksXG5cdFx0XHRcdFx0cGFnZSA9ICd1bmRlZmluZWQnICE9PSB0eXBlb2Ygb3B0aW5WYXJzLm1vZHVsZV9wYWdlWyBtb2R1bGVUeXBlIF0gPyBvcHRpblZhcnMubW9kdWxlX3BhZ2VbIG1vZHVsZVR5cGUgXSA6IG9wdGluVmFycy5tb2R1bGVfcGFnZS5wb3B1cDtcblxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBgP3BhZ2U9JHtwYWdlfSZjcmVhdGUtbW9kdWxlPXRydWVgO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFNob3cgYW4gZXJyb3IgbWVzc2FnZSBvciBzb21ldGhpbmc/XG5cdFx0XHR9XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9LFxuXG5cdFx0Y2xvc2VEaWFsb2coIGUgKSB7XG5cblx0XHRcdFNVSS5jbG9zZU1vZGFsKCk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR9LFxuXG5cdFx0ZW5hYmxlQ29udGludWUoKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1jcmVhdGUtbmV3LW1vZHVsZScgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdH0sXG5cblx0XHRkaXNtaXNzTW9kYWwoIGUgKSB7XG5cblx0XHRcdGlmICggZSApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHQkLnBvc3QoXG5cdFx0XHRcdGFqYXh1cmwsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfZGlzbWlzc19ub3RpZmljYXRpb24nLFxuXHRcdFx0XHRcdG5hbWU6ICdtaWdyYXRlX21vZGFsJyxcblx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiB0aGlzLiRlbC5kYXRhKCAnbm9uY2UnIClcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cblx0fSk7XG5cblx0bmV3IG1pZ3JhdGlvbk1vZGFsVmlldygpO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTW9kYWxzLlJldmlld0NvbmRpdGlvbnMnLCBmdW5jdGlvbiggJCApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Y29uc3QgUmV2aWV3Q29uZGl0aW9uc01vZGFsVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI2h1c3RsZS1kaWFsb2ctLXJldmlld19jb25kaXRpb25zJyxcblxuXHRcdGluaXRpYWxpemUoKSB7XG5cdFx0XHRpZiAoICEgdGhpcy4kZWwubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZXRUaW1lb3V0KCB0aGlzLnNob3csIDEwMCwgdGhpcyApO1xuXHRcdH0sXG5cblx0XHRzaG93KCByZXZpZXdDb25kaXRpb25zICkge1xuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIFNVSSB8fCAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIFNVSS5kaWFsb2dzICkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCByZXZpZXdDb25kaXRpb25zLnNob3csIDEwMCwgcmV2aWV3Q29uZGl0aW9ucyApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgU1VJLmRpYWxvZ3NbIHJldmlld0NvbmRpdGlvbnMuJGVsLnByb3AoICdpZCcgKSBdKSB7XG5cdFx0XHRcdFNVSS5kaWFsb2dzWyByZXZpZXdDb25kaXRpb25zLiRlbC5wcm9wKCAnaWQnICkgXS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdG5ldyBSZXZpZXdDb25kaXRpb25zTW9kYWxWaWV3KCk7XG5cbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ1VwZ3JhZGVfTW9kYWwnLCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXHRyZXR1cm4gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHRcdGVsOiAnI3dwaC11cGdyYWRlLW1vZGFsJyxcblx0XHRvcHRzOiB7fSxcblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAud3BtdWRldi1pX2Nsb3NlJzogJ2Nsb3NlJ1xuXHRcdH0sXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLm9wdHMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRzLCBvcHRpb25zICk7XG5cdFx0fSxcblx0XHRjbG9zZTogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICd3cG11ZGV2LW1vZGFsLWFjdGl2ZScgKTtcblx0XHR9XG5cdH0pO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTW9kYWxzLldlbGNvbWUnLCBmdW5jdGlvbiggJCApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0Y29uc3Qgd2VsY29tZU1vZGFsVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI2h1c3RsZS1kaWFsb2ctLXdlbGNvbWUnLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1uZXctY3JlYXRlLW1vZHVsZSc6ICdjcmVhdGVNb2R1bGUnLFxuXHRcdFx0J2NsaWNrIC5zdWktYm94LXNlbGVjdG9yJzogJ2VuYWJsZUNvbnRpbnVlJyxcblx0XHRcdCdjbGljayAjZ2V0U3RhcnRlZCc6ICdkaXNtaXNzTW9kYWwnLFxuXHRcdFx0J2NsaWNrIC5zdWktb25ib2FyZC1za2lwJzogJ2Rpc21pc3NNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLnN1aS1kaWFsb2ctY2xvc2UnOiAnZGlzbWlzc01vZGFsJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplKCkge1xuXHRcdFx0aWYgKCAhIHRoaXMuJGVsLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c2V0VGltZW91dCggdGhpcy5zaG93LCAxMDAsIHRoaXMgKTtcblx0XHR9LFxuXG5cdFx0c2hvdyggd2VsY29tZSApIHtcblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBTVUkgKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoIHdlbGNvbWUuc2hvdywgMTAwLCB3ZWxjb21lICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBTVUkuZGlhbG9ncyApIHtcblx0XHRcdFx0c2V0VGltZW91dCggd2VsY29tZS5zaG93LCAxMDAsIHdlbGNvbWUgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIFNVSS5kaWFsb2dzWyB3ZWxjb21lLiRlbC5wcm9wKCAnaWQnICkgXSkge1xuXHRcdFx0XHRTVUkuZGlhbG9nc1sgd2VsY29tZS4kZWwucHJvcCggJ2lkJyApIF0uc2hvdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjcmVhdGVNb2R1bGUoIGUgKSB7XG5cblx0XHRcdGNvbnN0IGJ1dHRvbiA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdCRzZWxlY3Rpb24gPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtc2VsZWN0b3IgaW5wdXQ6Y2hlY2tlZCcgKTtcblxuXG5cdFx0XHRpZiAoICRzZWxlY3Rpb24ubGVuZ3RoICkge1xuXG5cdFx0XHRcdGJ1dHRvbi5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHRcdGNvbnN0IG1vZHVsZVR5cGUgPSAkc2VsZWN0aW9uLnZhbCgpLFxuXHRcdFx0XHRcdHBhZ2UgPSAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG9wdGluVmFycy5tb2R1bGVfcGFnZVsgbW9kdWxlVHlwZSBdID8gb3B0aW5WYXJzLm1vZHVsZV9wYWdlWyBtb2R1bGVUeXBlIF0gOiBvcHRpblZhcnMubW9kdWxlX3BhZ2UucG9wdXA7XG5cblx0XHRcdFx0d2luZG93LmxvY2F0aW9uID0gYD9wYWdlPSR7cGFnZX0mY3JlYXRlLW1vZHVsZT10cnVlYDtcblxuXHRcdFx0fVxuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR9LFxuXG5cdFx0ZW5hYmxlQ29udGludWUoKSB7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1uZXctY3JlYXRlLW1vZHVsZScgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdH0sXG5cblx0XHRkaXNtaXNzTW9kYWwoIGUgKSB7XG5cblx0XHRcdGlmICggZSApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHQkLnBvc3QoXG5cdFx0XHRcdGFqYXh1cmwsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfZGlzbWlzc19ub3RpZmljYXRpb24nLFxuXHRcdFx0XHRcdG5hbWU6ICd3ZWxjb21lX21vZGFsJyxcblx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiB0aGlzLiRlbC5kYXRhKCAnbm9uY2UnIClcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cblx0fSk7XG5cblx0bmV3IHdlbGNvbWVNb2RhbFZpZXcoKTtcblxufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnRmVhdHVyZWRfSW1hZ2VfSG9sZGVyJywgZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRyZXR1cm4gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdFx0bWVkaWFGcmFtZTogZmFsc2UsXG5cdFx0ZWw6ICcjd3BoLXdpemFyZC1jaG9vc2VfaW1hZ2UnLFxuXHRcdG9wdGlvbnM6IHtcblx0XHRcdGF0dHJpYnV0ZTogJ2ZlYXR1cmVfaW1hZ2UnLFxuXHRcdFx0bXVsdGlwbGU6IGZhbHNlXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0XHR0aGlzLm9wdGlvbnMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMubWVkaWFfdXBsb2FkZXIuc2VsZWN0X29yX3VwbG9hZDtcblx0XHRcdHRoaXMub3B0aW9ucy5idXR0b25fdGV4dCA9IG9wdGluVmFycy5tZXNzYWdlcy5tZWRpYV91cGxvYWRlci51c2VfdGhpc19pbWFnZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcblxuXHRcdFx0dGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuXG5cdFx0XHRpZiAoICEgdGhpcy5tb2RlbCB8fCAhIHRoaXMub3B0aW9ucy5hdHRyaWJ1dGUgKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggJ1VuZGVmaW5lZCBtb2RlbCBvciBhdHRyaWJ1dGUnICk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRhcmdldERpdiA9IG9wdGlvbnMudGFyZ2V0RGl2O1xuXHRcdFx0JCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy53cG11ZGV2LWZlYXR1cmUtaW1hZ2UtYnJvd3NlJywgJC5wcm94eSggdGhpcy5vcGVuLCB0aGlzICkgKTtcblx0XHRcdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcjd3BtdWRldi1mZWF0dXJlLWltYWdlLWNsZWFyJywgJC5wcm94eSggdGhpcy5jbGVhciwgdGhpcyApICk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0sXG5cblx0XHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5kZWZpbmVNZWRpYUZyYW1lKCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0Ly8gSWYgbm8gZmVhdHVyZWQgaW1hZ2UgaXMgc2V0LCBzaG93IHRoZSB1cGxvYWQgYnV0dG9uLiBEaXNwbGF5IHRoZSBzZWxlY3RlZCBpbWFnZSBvdGhlcndpc2UuXG5cdFx0c2hvd0ltYWdlUHJldmlld09yQnV0dG9uOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBmZWF0dXJlSW1hZ2UgPSB0aGlzLm1vZGVsLmdldCggJ2ZlYXR1cmVfaW1hZ2UnICk7XG5cdFx0XHRpZiAoICcnID09PSBmZWF0dXJlSW1hZ2UgfHwgJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBmZWF0dXJlSW1hZ2UgKSB7XG5cdFx0XHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCAnc3VpLWhhc19maWxlJyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzdWktaGFzX2ZpbGUnICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRlZmluZU1lZGlhRnJhbWU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dGhpcy5tZWRpYUZyYW1lID0gd3AubWVkaWEoe1xuXHRcdFx0XHR0aXRsZTogc2VsZi5vcHRpb25zLnRpdGxlLFxuXHRcdFx0XHRidXR0b246IHtcblx0XHRcdFx0XHR0ZXh0OiBzZWxmLm9wdGlvbnMuYnV0dG9uX3RleHRcblx0XHRcdFx0fSxcblx0XHRcdFx0bXVsdGlwbGU6IHNlbGYub3B0aW9ucy5tdWx0aXBsZVxuXHRcdFx0fSkub24oICdzZWxlY3QnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG1lZGlhID0gc2VsZi5tZWRpYUZyYW1lLnN0YXRlKCkuZ2V0KCAnc2VsZWN0aW9uJyApLmZpcnN0KCkudG9KU09OKCk7XG4gICAgICAgICAgICAgICAgdmFyIGZlYXR1cmVJbWFnZVNyYywgZmVhdHVyZUltYWdlVGh1bWJuYWlsO1xuXHRcdFx0XHRpZiAoIG1lZGlhICYmIG1lZGlhLnVybCApIHtcblx0XHRcdFx0XHRmZWF0dXJlSW1hZ2VTcmMgPSBtZWRpYS51cmw7XG5cdFx0XHRcdFx0ZmVhdHVyZUltYWdlVGh1bWJuYWlsID0gJyc7XG5cdFx0XHRcdFx0c2VsZi5tb2RlbC5zZXQoICdmZWF0dXJlX2ltYWdlJywgZmVhdHVyZUltYWdlU3JjICk7XG5cdFx0XHRcdFx0aWYgKCBtZWRpYS5zaXplcyAmJiBtZWRpYS5zaXplcy50aHVtYm5haWwgJiYgbWVkaWEuc2l6ZXMudGh1bWJuYWlsLnVybCApIHtcblx0XHRcdFx0XHRcdGZlYXR1cmVJbWFnZVRodW1ibmFpbCA9IG1lZGlhLnNpemVzLnRodW1ibmFpbC51cmw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLXVwbG9hZC1maWxlIHNwYW4nICkudGV4dCggZmVhdHVyZUltYWdlU3JjICkuY2hhbmdlKCk7XG5cdFx0XHRcdFx0c2VsZi4kZWwuZmluZCggJy5zdWktaW1hZ2UtcHJldmlldycgKS5jc3MoICdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCggJyArIGZlYXR1cmVJbWFnZVRodW1ibmFpbCArICcgKScgKTtcblxuXHRcdFx0XHRcdHNlbGYuc2hvd0ltYWdlUHJldmlld09yQnV0dG9uKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRvcGVuOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMubWVkaWFGcmFtZS5vcGVuKCk7XG5cdFx0fSxcblxuXHRcdGNsZWFyOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnZmVhdHVyZV9pbWFnZScsICcnICk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnLnN1aS11cGxvYWQtZmlsZSBzcGFuJyApLnRleHQoICcnICkuY2hhbmdlKCk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnLnN1aS1pbWFnZS1wcmV2aWV3JyApLmNzcyggJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCknICk7XG5cblx0XHRcdC8vdGhpcy5tb2RlbC5zZXQoICdmZWF0dXJlX2ltYWdlJywgJycsIHtzaWxlbnQ6IHRydWV9ICk7XG5cdFx0XHR0aGlzLnNob3dJbWFnZVByZXZpZXdPckJ1dHRvbigpO1xuXHRcdH1cblx0fSk7XG5cbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ01vZGFscy5FZGl0X0ZpZWxkJywgZnVuY3Rpb24oICQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJyNodXN0bGUtZGlhbG9nLS1lZGl0LWZpZWxkJyxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5zdWktZGlhbG9nLW92ZXJsYXknOiAnY2xvc2VNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1kaXNjYXJkLWNoYW5nZXMnOiAnY2xvc2VNb2RhbCcsXG5cdFx0XHQnY2hhbmdlIGlucHV0W25hbWU9XCJ0aW1lX2Zvcm1hdFwiXSc6ICdjaGFuZ2VUaW1lRm9ybWF0Jyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWFwcGx5LWNoYW5nZXMnOiAnYXBwbHlDaGFuZ2VzJyxcblx0XHRcdCdibHVyIGlucHV0W25hbWU9XCJuYW1lXCJdJzogJ3RyaW1OYW1lJyxcblx0XHRcdCdjaGFuZ2UgaW5wdXQnOiAnZmllbGRVcGRhdGVkJyxcblx0XHRcdCdjbGljayBpbnB1dFt0eXBlPVwicmFkaW9cIl0nOiAnZmllbGRVcGRhdGVkJyxcblx0XHRcdCdjaGFuZ2Ugc2VsZWN0JzogJ2ZpZWxkVXBkYXRlZCcsXG5cdFx0XHQnY2hhbmdlIGlucHV0W25hbWU9XCJ2ZXJzaW9uXCJdJzogJ2hhbmRsZUNhcHRjaGFTYXZlJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplKCBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5maWVsZCA9IG9wdGlvbnMuZmllbGQ7XG5cdFx0XHR0aGlzLmNoYW5nZWQgPSB7fTtcblxuXHRcdFx0Ly8gU2FtZSBhcyB0aGlzLmZpZWxkLCBidXQgd2l0aCB0aGUgdmFsdWVzIGZvciB0aGUgZmllbGQncyB2aWV3LiBXb24ndCBiZSBzdG9yZWQuXG5cdFx0XHR0aGlzLmZpZWxkRGF0YSA9IG9wdGlvbnMuZmllbGREYXRhO1xuXHRcdFx0dGhpcy5tb2RlbCA9IG9wdGlvbnMubW9kZWw7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0sXG5cblx0XHRyZW5kZXIoKSB7XG5cdFx0XHR0aGlzLnJlbmRlckhlYWRlcigpO1xuXHRcdFx0dGhpcy5yZW5kZXJMYWJlbHMoKTtcblx0XHRcdHRoaXMucmVuZGVyU2V0dGluZ3MoKTtcblx0XHRcdHRoaXMucmVuZGVyU3R5bGluZygpO1xuXHRcdFx0dGhpcy5oYW5kbGVDYXB0Y2hhU2F2ZSgpO1xuXG5cdFx0XHQvL3NlbGVjdCB0aGUgZmlyc3QgdGFiXG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLWRhdGEtcGFuZScgKS5maXJzdCgpLnRyaWdnZXIoICdjbGljaycgKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVySGVhZGVyKCkge1xuXHRcdFx0dGhpcy4kKCAnLnN1aS1ib3gtaGVhZGVyIC5zdWktdGFnJyApLnRleHQoIHRoaXMuZmllbGQudHlwZSApO1xuXHRcdH0sXG5cblx0XHRyZW5kZXJMYWJlbHMoKSB7XG5cdFx0XHRpZiAoIC0xICE9PSAkLmluQXJyYXkoIHRoaXMuZmllbGQudHlwZSwgWyAncmVjYXB0Y2hhJywgJ2dkcHInLCAnc3VibWl0JyBdKSApIHtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1kYXRhLXRhYi0tbGFiZWxzJyApLnJlbW92ZUNsYXNzKCAnaHVzdGxlLWRhdGEtcGFuZScgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZGF0YS1wYW5lLS1sYWJlbHMnICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtdGFiLS1sYWJlbHMnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApLmFkZENsYXNzKCAnaHVzdGxlLWRhdGEtcGFuZScgKTtcblxuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tbGFiZWxzJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgaWYgYSBzcGVjaWZpYyB0ZW1wbGF0ZSBmb3IgdGhpcyBmaWVsZCBleGlzdHMuXG5cdFx0XHRsZXQgdGVtcGxhdGVJZCA9ICdodXN0bGUtJyArIHRoaXMuZmllbGQudHlwZSArICctZmllbGQtbGFiZWxzLXRwbCc7XG5cblx0XHRcdC8vIElmIGEgc3BlY2lmaWMgdGVtcGxhdGUgZG9lc24ndCBleGlzdCwgdXNlIHRoZSBjb21tb24gdGVtcGxhdGUuXG5cdFx0XHRpZiAoICEgJCggJyMnICsgdGVtcGxhdGVJZCApLmxlbmd0aCApIHtcblx0XHRcdFx0dGVtcGxhdGVJZCA9ICdodXN0bGUtY29tbW9uLWZpZWxkLWxhYmVscy10cGwnO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCB0ZW1wbGF0ZUlkICk7XG5cdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tbGFiZWxzJyApLmh0bWwoIHRlbXBsYXRlKCB0aGlzLmZpZWxkRGF0YSApICk7XG5cdFx0XHRIdXN0bGUuRXZlbnRzLnRyaWdnZXIoICd2aWV3LnJlbmRlcmVkJywgdGhpcyApO1xuXG5cdFx0fSxcblxuXHRcdHJlbmRlclNldHRpbmdzKCkge1xuXG5cdFx0XHRpZiAoICdoaWRkZW4nID09PSB0aGlzLmZpZWxkLnR5cGUgKSB7XG5cdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZGF0YS10YWItLXNldHRpbmdzJyApLnJlbW92ZUNsYXNzKCAnaHVzdGxlLWRhdGEtcGFuZScgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZGF0YS1wYW5lLS1zZXR0aW5ncycgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCB0aGlzLiQoICdbZGF0YS10YWJzXScgKSApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coIHRoaXMuJCggJ1tkYXRhLXRhYnNdJyApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuJCggJyNodXN0bGUtZGF0YS10YWItLXNldHRpbmdzJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKS5hZGRDbGFzcyggJ2h1c3RsZS1kYXRhLXBhbmUnICk7XG5cdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tc2V0dGluZ3MnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHQvLyBDaGVjayBpZiBhIHNwZWNpZmljIHRlbXBsYXRlIGZvciB0aGlzIGZpZWxkIGV4aXN0cy5cblx0XHRcdGxldCB0ZW1wbGF0ZUlkID0gJ2h1c3RsZS0nICsgdGhpcy5maWVsZC50eXBlICsgJy1maWVsZC1zZXR0aW5ncy10cGwnO1xuXG5cdFx0XHQvLyBJZiBhIHNwZWNpZmljIHRlbXBsYXRlIGRvZXNuJ3QgZXhpc3QsIHVzZSB0aGUgY29tbW9uIHRlbXBsYXRlLlxuXHRcdFx0aWYgKCAhICQoICcjJyArIHRlbXBsYXRlSWQgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRlbXBsYXRlSWQgPSAnaHVzdGxlLWNvbW1vbi1maWVsZC1zZXR0aW5ncy10cGwnO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCB0ZW1wbGF0ZUlkICk7XG5cdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tc2V0dGluZ3MnICkuaHRtbCggdGVtcGxhdGUoIHRoaXMuZmllbGREYXRhICkgKTtcblx0XHRcdEh1c3RsZS5FdmVudHMudHJpZ2dlciggJ3ZpZXcucmVuZGVyZWQnLCB0aGlzICk7XG5cblx0XHRcdGlmICggJ2dkcHInID09PSB0aGlzLmZpZWxkLnR5cGUgKSB7XG5cblx0XHRcdFx0Ly8gVGhlc2Ugb25seSBhbGxvdyBpbmxpbmUgZWxlbWVudHMuXG5cdFx0XHRcdGNvbnN0IGVkaXRvclNldHRpbmdzID0ge1xuXHRcdFx0XHRcdHRpbnltY2U6IHtcblx0XHRcdFx0XHRcdHdwYXV0b3A6IGZhbHNlLFxuXHRcdFx0XHRcdFx0dG9vbGJhcjE6ICdib2xkLGl0YWxpYyxzdHJpa2V0aHJvdWdoLGxpbmsnLFxuXHRcdFx0XHRcdFx0dmFsaWRfZWxlbWVudHM6ICdhW2hyZWZ8dGFyZ2V0PV9ibGFua10sc3Ryb25nL2IsaSx1LHMsZW0sZGVsJywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGZvcmNlZF9yb290X2Jsb2NrOiAnJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cXVpY2t0YWdzOiB7IGJ1dHRvbnM6ICdzdHJvbmcsZW0sZGVsLGxpbmsnIH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHR3cC5lZGl0b3IucmVtb3ZlKCAnZ2Rwcl9tZXNzYWdlJyApO1xuXHRcdFx0XHR3cC5lZGl0b3IuaW5pdGlhbGl6ZSggJ2dkcHJfbWVzc2FnZScsIGVkaXRvclNldHRpbmdzICk7XG5cblx0XHRcdH0gZWxzZSBpZiAoICdyZWNhcHRjaGEnID09PSB0aGlzLmZpZWxkLnR5cGUgKSB7XG5cblx0XHRcdFx0Y29uc3QgZWRpdG9yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0dGlueW1jZTogeyB0b29sYmFyOiBbICdib2xkIGl0YWxpYyBsaW5rIGFsaWdubGVmdCBhbGlnbmNlbnRlciBhbGlnbnJpZ2h0JyBdIH0sXG5cdFx0XHRcdFx0cXVpY2t0YWdzOiB0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHRcdHdwLmVkaXRvci5yZW1vdmUoICd2M19yZWNhcHRjaGFfYmFkZ2VfcmVwbGFjZW1lbnQnICk7XG5cdFx0XHRcdHdwLmVkaXRvci5pbml0aWFsaXplKCAndjNfcmVjYXB0Y2hhX2JhZGdlX3JlcGxhY2VtZW50JywgZWRpdG9yU2V0dGluZ3MgKTtcblxuXHRcdFx0XHR3cC5lZGl0b3IucmVtb3ZlKCAndjJfaW52aXNpYmxlX2JhZGdlX3JlcGxhY2VtZW50JyApO1xuXHRcdFx0XHR3cC5lZGl0b3IuaW5pdGlhbGl6ZSggJ3YyX2ludmlzaWJsZV9iYWRnZV9yZXBsYWNlbWVudCcsIGVkaXRvclNldHRpbmdzICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJlbmRlclN0eWxpbmcoKSB7XG5cblx0XHRcdGlmICggJ2hpZGRlbicgPT09IHRoaXMuZmllbGQudHlwZSApIHtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1kYXRhLXRhYi0tc3R5bGluZycgKS5yZW1vdmVDbGFzcyggJ2h1c3RsZS1kYXRhLXBhbmUnICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tc3R5bGluZycgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtdGFiLS1zdHlsaW5nJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKS5hZGRDbGFzcyggJ2h1c3RsZS1kYXRhLXBhbmUnICk7XG5cdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRhdGEtcGFuZS0tc3R5bGluZycgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdC8vIENoZWNrIGlmIGEgc3BlY2lmaWMgdGVtcGxhdGUgZm9yIHRoaXMgZmllbGQgZXhpc3RzLlxuXHRcdFx0bGV0IHRlbXBsYXRlSWQgPSAnaHVzdGxlLScgKyB0aGlzLmZpZWxkLnR5cGUgKyAnLWZpZWxkLXN0eWxpbmctdHBsJztcblxuXHRcdFx0Ly8gSWYgYSBzcGVjaWZpYyB0ZW1wbGF0ZSBkb2Vzbid0IGV4aXN0LCB1c2UgdGhlIGNvbW1vbiB0ZW1wbGF0ZS5cblx0XHRcdGlmICggISAkKCAnIycgKyB0ZW1wbGF0ZUlkICkubGVuZ3RoICkge1xuXHRcdFx0XHR0ZW1wbGF0ZUlkID0gJ2h1c3RsZS1jb21tb24tZmllbGQtc3R5bGluZy10cGwnO1xuXHRcdFx0fVxuXHRcdFx0bGV0IHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoIHRlbXBsYXRlSWQgKTtcblx0XHRcdHRoaXMuJCggJyNodXN0bGUtZGF0YS1wYW5lLS1zdHlsaW5nJyApLmh0bWwoIHRlbXBsYXRlKCB0aGlzLmZpZWxkRGF0YSApICk7XG5cdFx0fSxcblxuXHRcdGZpZWxkVXBkYXRlZCggZSApIHtcblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGRhdGFOYW1lID0gJHRoaXMuYXR0ciggJ25hbWUnICksXG5cdFx0XHRcdGRhdGFWYWx1ZSA9ICR0aGlzLmlzKCAnOmNoZWNrYm94JyApID8gJHRoaXMuaXMoICc6Y2hlY2tlZCcgKSA6ICR0aGlzLnZhbCgpO1xuXG5cdFx0XHR0aGlzLmNoYW5nZWRbIGRhdGFOYW1lIF0gPSBkYXRhVmFsdWU7XG5cdFx0fSxcblxuXHRcdGNsb3NlTW9kYWwoKSB7XG5cdFx0XHR0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcblx0XHRcdHRoaXMuc3RvcExpc3RlbmluZygpO1xuXG5cdFx0XHQvLyBIaWRlIGRpYWxvZ1xuXHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1lZGl0LWZpZWxkJyBdLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0Y2hhbmdlVGltZUZvcm1hdCggZSApIHtcblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGRhdGFWYWx1ZSA9ICR0aGlzLnZhbCgpO1xuXHRcdFx0aWYgKCAnMTInID09PSBkYXRhVmFsdWUgKSB7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRhdGUtZm9ybWF0JyApLmNsb3Nlc3QoICcuc3VpLWZvcm0tZmllbGQnICkuc2hvdygpO1xuXHRcdFx0XHQkKCAnaW5wdXRbbmFtZT1cInRpbWVfaG91cnNcIl0nICkucHJvcCggJ21pbicsIDEgKS5wcm9wKCAnbWF4JywgMTIgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRhdGUtZm9ybWF0JyApLmNsb3Nlc3QoICcuc3VpLWZvcm0tZmllbGQnICkuaGlkZSgpO1xuXHRcdFx0XHQkKCAnaW5wdXRbbmFtZT1cInRpbWVfaG91cnNcIl0nICkucHJvcCggJ21pbicsIDAgKS5wcm9wKCAnbWF4JywgMjMgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aGFuZGxlQ2FwdGNoYVNhdmUoIGUgKSB7XG5cdFx0XHRpZiAoICdyZWNhcHRjaGEnICE9PSB0aGlzLmZpZWxkLnR5cGUgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBhdmFpYWJsZUNhcHRjaGEgPSAkKCAnI2F2YWlsYWJsZV9yZWNhcHRjaGFzJyApLnZhbCgpO1xuXHRcdFx0aWYgKCBhdmFpYWJsZUNhcHRjaGEgKSB7XG5cdFx0XHRcdGF2YWlhYmxlQ2FwdGNoYSA9IGF2YWlhYmxlQ2FwdGNoYS5zcGxpdCggJywnICk7XG5cdFx0XHRcdGxldCB2ZXJzaW9uID0gJCggJ2lucHV0W25hbWU9XCJ2ZXJzaW9uXCJdOmNoZWNrZWQnICkudmFsKCk7XG5cblx0XHRcdFx0aWYgKCAtMSA9PT0gXy5pbmRleE9mKCBhdmFpYWJsZUNhcHRjaGEsIHZlcnNpb24gKSApIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLWVkaXQtZmllbGQnICkuZmluZCggJyNodXN0bGUtYXBwbHktY2hhbmdlcycgKS5hdHRyKCAnZGlzYWJsZWQnLCAnZGlzYWJsZWQnICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCggJyNodXN0bGUtZGlhbG9nLS1lZGl0LWZpZWxkJyApLmZpbmQoICcjaHVzdGxlLWFwcGx5LWNoYW5nZXMnICkuYXR0ciggJ2Rpc2FibGVkJywgZmFsc2UgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCggJyNodXN0bGUtZGlhbG9nLS1lZGl0LWZpZWxkJyApLmZpbmQoICcjaHVzdGxlLWFwcGx5LWNoYW5nZXMnICkuYXR0ciggJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBUcmltIGFuZCByZXBsYWNlIHNwYWNlcyBpbiBmaWVsZCBuYW1lLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gZXZlbnQgZVxuXHRcdCAqL1xuXHRcdHRyaW1OYW1lKCBlICkge1xuXHRcdFx0bGV0ICRpbnB1dCA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHRcdFx0bmV3VmFsO1xuXG5cdFx0XHRuZXdWYWwgPSAkLnRyaW0oICRpbnB1dC52YWwoKSApLnJlcGxhY2UoIC8gL2csICdfJyApO1xuXG5cdFx0XHQkaW5wdXQudmFsKCBuZXdWYWwgKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQWRkIHRoZSBzYXZlZCBzZXR0aW5ncyB0byB0aGUgbW9kZWwuXG5cdFx0ICogQHNpbmNlIDQuMFxuXHRcdCAqIEBwYXJhbSBldmVudCBlXG5cdFx0ICovXG5cdFx0YXBwbHlDaGFuZ2VzKCBlICkge1xuXG5cdFx0XHQvLyBUT0RPOiBkbyB2YWxpZGF0aW9uXG5cdFx0XHQvLyBUT0RPOiBrZWVwIGNvbnNpc3RlbmN5IHdpdGggaG93IHN0dWZmIGlzIHNhdmVkIGluIHZpc2liaWxpdHkgY29uZGl0aW9uc1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHQkYnV0dG9uID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHRmb3JtRmllbGRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tb2RlbC5nZXQoICdmb3JtX2VsZW1lbnRzJyApICk7XG5cblx0XHRcdC8vIGlmIGdkcHIgbWVzc2FnZVxuXHRcdFx0aWYgKCAnZ2RwcicgPT09IHRoaXMuZmllbGQudHlwZSAmJiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRpbnlNQ0UgKSB7XG5cblx0XHRcdFx0Ly8gZ2Rwcl9tZXNzYWdlIGVkaXRvclxuXHRcdFx0XHRsZXQgZ2Rwck1lc3NhZ2VFZGl0b3IgPSB0aW55TUNFLmdldCggJ2dkcHJfbWVzc2FnZScgKSxcblx0XHRcdFx0XHQkZ2Rwck1lc3NhZ2VUZXh0YXJlYSA9IHRoaXMuJCggJ3RleHRhcmVhI2dkcHJfbWVzc2FnZScgKSxcblx0XHRcdFx0XHRnZHByTWVzc2FnZSA9ICggJ3RydWUnID09PSAkZ2Rwck1lc3NhZ2VUZXh0YXJlYS5hdHRyKCAnYXJpYS1oaWRkZW4nICkgKSA/IGdkcHJNZXNzYWdlRWRpdG9yLmdldENvbnRlbnQoKSA6ICRnZHByTWVzc2FnZVRleHRhcmVhLnZhbCgpO1xuXG5cdFx0XHRcdGZvcm1GaWVsZHMuZ2Rwci5nZHByX21lc3NhZ2UgPSBnZHByTWVzc2FnZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0dGhpcy5tb2RlbC5zZXQoICdmb3JtX2VsZW1lbnRzJywgZm9ybUZpZWxkcyApO1xuXHRcdFx0XHR0aGlzLm1vZGVsLnVzZXJIYXNDaGFuZ2UoKTtcblxuXHRcdFx0fSBlbHNlIGlmICggJ3JlY2FwdGNoYScgPT09IHRoaXMuZmllbGQudHlwZSAmJiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRpbnlNQ0UgKSB7XG5cblx0XHRcdFx0Ly8gdjMgcmVjYXB0Y2hhIGJhZGdlIGVkaXRvci5cblx0XHRcdFx0bGV0IHYzbWVzc2FnZUVkaXRvciA9IHRpbnlNQ0UuZ2V0KCAndjNfcmVjYXB0Y2hhX2JhZGdlX3JlcGxhY2VtZW50JyApLFxuXHRcdFx0XHRcdCR2M21lc3NhZ2VUZXh0YXJlYSA9IHRoaXMuJCggJ3RleHRhcmVhI3YzX3JlY2FwdGNoYV9iYWRnZV9yZXBsYWNlbWVudCcgKSxcblx0XHRcdFx0XHR2M21lc3NhZ2UgPSAoICd0cnVlJyA9PT0gJHYzbWVzc2FnZVRleHRhcmVhLmF0dHIoICdhcmlhLWhpZGRlbicgKSApID8gdjNtZXNzYWdlRWRpdG9yLmdldENvbnRlbnQoKSA6ICR2M21lc3NhZ2VUZXh0YXJlYS52YWwoKTtcblxuXHRcdFx0XHRmb3JtRmllbGRzLnJlY2FwdGNoYS52M19yZWNhcHRjaGFfYmFkZ2VfcmVwbGFjZW1lbnQgPSB2M21lc3NhZ2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cblx0XHRcdFx0Ly8gdjIgaW52aXNpYmxlIGJhZGdlIGVkaXRvci5cblx0XHRcdFx0bGV0IHYybWVzc2FnZUVkaXRvciA9IHRpbnlNQ0UuZ2V0KCAndjJfaW52aXNpYmxlX2JhZGdlX3JlcGxhY2VtZW50JyApLFxuXHRcdFx0XHQkdjJtZXNzYWdlVGV4dGFyZWEgPSB0aGlzLiQoICd0ZXh0YXJlYSN2Ml9pbnZpc2libGVfYmFkZ2VfcmVwbGFjZW1lbnQnICksXG5cdFx0XHRcdHYybWVzc2FnZSA9ICggJ3RydWUnID09PSAkdjJtZXNzYWdlVGV4dGFyZWEuYXR0ciggJ2FyaWEtaGlkZGVuJyApICkgPyB2Mm1lc3NhZ2VFZGl0b3IuZ2V0Q29udGVudCgpIDogJHYybWVzc2FnZVRleHRhcmVhLnZhbCgpO1xuXG5cdFx0XHRcdGZvcm1GaWVsZHMucmVjYXB0Y2hhLnYyX2ludmlzaWJsZV9iYWRnZV9yZXBsYWNlbWVudCA9IHYybWVzc2FnZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcblxuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ2Zvcm1fZWxlbWVudHMnLCBmb3JtRmllbGRzICk7XG5cdFx0XHRcdHRoaXMubW9kZWwudXNlckhhc0NoYW5nZSgpO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIHdlcmUgY2hhbmdlcy5cblx0XHRcdGlmICggT2JqZWN0LmtleXMoIHRoaXMuY2hhbmdlZCApLmxlbmd0aCApIHtcblxuXHRcdFx0XHRsZXQgb2xkRmllbGQgPSBfLmV4dGVuZCh7fSwgdGhpcy5maWVsZCApO1xuXHRcdFx0XHRfLmV4dGVuZCggdGhpcy5maWVsZCwgdGhpcy5jaGFuZ2VkICk7XG5cblx0XHRcdFx0Ly8gRG9uJ3QgYWxsb3cgdG8gb3ZlcnJpZGUgRW1haWwgZmllbGQgY3JlYXRlZCBieSBkZWZhdWx0XG5cdFx0XHRcdC8vIGFuZCBwcmV2ZW50IGZpZWxkJ3MgbmFtZXMgZnJvbSBiZWluZyBlbXB0eS5cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdCggKCAnbmFtZScgaW4gdGhpcy5jaGFuZ2VkICkgJiYgJ2VtYWlsJyAhPT0gb2xkRmllbGQubmFtZSAmJiAnZW1haWwnID09PSB0aGlzLmZpZWxkLm5hbWUgKSB8fFxuXHRcdFx0XHRcdCggJ25hbWUnIGluIHRoaXMuY2hhbmdlZCAmJiAhIHRoaXMuZmllbGQubmFtZS50cmltKCkubGVuZ3RoIClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dGhpcy5maWVsZC5uYW1lID0gb2xkRmllbGQubmFtZTtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy5jaGFuZ2VkLm5hbWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBcIk5hbWVcIiBpcyB0aGUgdW5pcXVlIGlkZW50aWZpZXIuIElmIGl0IGNoYW5nZWQsIHJldHVybiBhbmQgbGV0IHRoZSBjYWxsYmFjayBoYW5kbGUgaXQuXG5cdFx0XHRcdGlmICggISAoICduYW1lJyBpbiB0aGlzLmNoYW5nZWQgKSAmJiAnZW1haWwnICE9PSBvbGRGaWVsZC5uYW1lICkge1xuXG5cdFx0XHRcdFx0Ly8gVXBkYXRlIHRoaXMgZmllbGQuXG5cdFx0XHRcdFx0Zm9ybUZpZWxkc1sgdGhpcy5maWVsZC5uYW1lIF0gPSB0aGlzLmZpZWxkO1xuXHRcdFx0XHRcdHRoaXMubW9kZWwuc2V0KCAnZm9ybV9lbGVtZW50cycsIGZvcm1GaWVsZHMgKTtcblx0XHRcdFx0XHR0aGlzLm1vZGVsLnVzZXJIYXNDaGFuZ2UoKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCAnZW1haWwnID09PSBvbGRGaWVsZC5uYW1lICkge1xuXHRcdFx0XHRcdHRoaXMuZmllbGQubmFtZSA9ICdlbWFpbCc7XG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMuY2hhbmdlZC5uYW1lO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy50cmlnZ2VyKCAnZmllbGQ6dXBkYXRlZCcsIHRoaXMuZmllbGQsIHRoaXMuY2hhbmdlZCwgb2xkRmllbGQgKTtcblx0XHRcdH1cblx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmNsb3NlTW9kYWwoKTtcblx0XHRcdFx0JGJ1dHRvbi5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0fSwgMzAwICk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ01vZGFscy5FZGl0U2NoZWR1bGUnLCBmdW5jdGlvbiggJCApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI2h1c3RsZS1zY2hlZHVsZS1kaWFsb2ctY29udGVudCcsXG5cblx0XHRkaWFsb2dJZDogJ2h1c3RsZS1kaWFsb2ctLWFkZC1zY2hlZHVsZScsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAjaHVzdGxlLXNjaGVkdWxlLXNhdmUnOiAnc2F2ZVNjaGVkdWxlJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXNjaGVkdWxlLWNhbmNlbCc6ICdjYW5jZWwnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtc2NoZWR1bGUtZGVsZXRlJzogJ29wZW5EZWxldGVNb2RhbCcsXG5cblx0XHRcdC8vIENoYW5nZSBldmVudHMuXG5cdFx0XHQnY2hhbmdlIC5odXN0bGUtY2hlY2tib3gtd2l0aC1kZXBlbmRlbmNpZXMgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJzogJ2NoZWNrYm94V2l0aERlcGVuZGVuY2llc0NoYW5nZWQnLFxuXHRcdFx0J2NoYW5nZSBzZWxlY3RbbmFtZT1cImN1c3RvbV90aW1lem9uZVwiXSc6ICdjdXN0b21UaW1lem9uZUNoYW5nZWQnXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemUoIG9wdHMgKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gb3B0cy5tb2RlbDtcblx0XHR9LFxuXG5cdFx0b3BlbigpIHtcblx0XHRcdGNvbnN0IG1vZGFsSWQgPSB0aGlzLmRpYWxvZ0lkO1xuXHRcdFx0Y29uc3QgZm9jdXNBZnRlckNsb3NlZCA9ICdodXN0bGUtc2NoZWR1bGUtZm9jdXMnO1xuXHRcdFx0Y29uc3QgZm9jdXNXaGVuT3BlbiA9IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IGhhc092ZXJsYXlNYXNrID0gZmFsc2U7XG5cblx0XHRcdHRoaXMucmVuZGVyQ29udGVudCgpO1xuXG5cdFx0XHQkKCAnLmh1c3RsZS1kYXRlcGlja2VyLWZpZWxkJyApLmRhdGVwaWNrZXIoe1xuXG5cdFx0XHRcdGJlZm9yZVNob3c6IGZ1bmN0aW9uKCBpbnB1dCwgaW5zdCApIHtcblx0XHRcdFx0XHQkKCAnI3VpLWRhdGVwaWNrZXItZGl2JyApLmFkZENsYXNzKCAnc3VpLWNhbGVuZGFyJyApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQnZGF0ZUZvcm1hdCc6ICdtL2QveXknXG5cdFx0XHR9KTtcblxuXHRcdFx0U1VJLm9wZW5Nb2RhbChcblx0XHRcdFx0bW9kYWxJZCxcblx0XHRcdFx0Zm9jdXNBZnRlckNsb3NlZCxcblx0XHRcdFx0Zm9jdXNXaGVuT3Blbixcblx0XHRcdFx0aGFzT3ZlcmxheU1hc2tcblx0XHRcdCk7XG5cdFx0fSxcblxuXHRcdHJlbmRlckNvbnRlbnQoKSB7XG5cblx0XHRcdGxldCB0ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLXNjaGVkdWxlLWRpYWxvZy1jb250ZW50LXRwbCcgKSxcblx0XHRcdFx0JGNvbnRhaW5lciA9ICQoICcjaHVzdGxlLXNjaGVkdWxlLWRpYWxvZy1jb250ZW50JyApLFxuXHRcdFx0XHRkYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tb2RlbC5nZXQoICdzY2hlZHVsZScgKSApO1xuXG5cdFx0XHRkYXRhLmlzX3NjaGVkdWxlID0gdGhpcy5tb2RlbC5nZXQoICdpc19zY2hlZHVsZScgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcblxuXHRcdFx0ZGF0YS5zZXJ2ZXJDdXJyZW50VGltZSA9IHRoaXMuZ2V0VGltZVRvRGlzcGxheSggJ3NlcnZlcicgKTtcblx0XHRcdGRhdGEuY3VzdG9tQ3VycmVudFRpbWUgPSB0aGlzLmdldFRpbWVUb0Rpc3BsYXkoICdjdXN0b20nICk7XG5cblx0XHRcdHRoaXMuc2V0RWxlbWVudCggdGVtcGxhdGUoIGRhdGEgKSApO1xuXG5cdFx0XHQkY29udGFpbmVyLmh0bWwoIHRoaXMuJGVsICk7XG5cblx0XHRcdC8vIEJpbmQgU1VJIGVsZW1lbnRzIGFnYWluLlxuXHRcdFx0SHVzdGxlLkV2ZW50cy50cmlnZ2VyKCAndmlldy5yZW5kZXJlZCcsIHRoaXMgKTtcblxuXHRcdFx0Ly8gV2UgaGlkZS9zaG93IHNvbWUgZWxlbWVudHMgb24gY2hhbmdlLCBzbyBrZWVwIHRoZSB2aWV3IGRpc3BsYXlpbmcgd2hhdCBpdCBzaG91bGQgd2hlbiByZS1yZW5kZXJpbmcgdGhlIG1vZGFsLlxuXHRcdFx0dGhpcy5yZWZyZXNoVmlld09uUmVuZGVyKCBkYXRhICk7XG5cdFx0fSxcblxuXHRcdHJlZnJlc2hWaWV3T25SZW5kZXIoIGRhdGEgKSB7XG5cblx0XHRcdC8vIEhpZGUvc2hvdyBkZXBlbmRlbnQgZWxlbWVudHMuXG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLWNoZWNrYm94LXdpdGgtZGVwZW5kZW5jaWVzIGlucHV0JyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBEaXNwbGF5IHRoZSBjb3JyZWN0IHRhYi5cblx0XHRcdGlmICggJ3NlcnZlcicgPT09IGRhdGEudGltZV90b191c2UgKSB7XG5cdFx0XHRcdCQoICcjdGFiLXRpbWV6b25lLXNlcnZlcicgKS5jbGljaygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCggJyN0YWItdGltZXpvbmUtY3VzdG9tJyApLmNsaWNrKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIERpc3BsYXkgdGhlIGNvcnJlY3QgdGFiLlxuXHRcdFx0aWYgKCAnYWxsJyA9PT0gZGF0YS5hY3RpdmVfZGF5cyApIHtcblx0XHRcdFx0JCggJyN0YWItc2NoZWR1bGUtZXZlcnlkYXknICkuY2xpY2soKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoICcjdGFiLXNjaGVkdWxlLXNvbWVkYXlzJyApLmNsaWNrKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbXBhcmluZyB0aGUgbW9kZWwncyB2YWx1ZSB3aXRoIHRoZSB2YWx1ZSBzZWxlY3RlZCBpbiB0aGUgXCJzZWxlY3RcIiBlbGVtZW50LlxuXHRcdFx0Y29uc3QgdGltZXpvbmVTZWxlY3RWYWx1ZSA9IHRoaXMuJCggJ3NlbGVjdFtuYW1lPVwiY3VzdG9tX3RpbWV6b25lXCJdJyApLnZhbCgpLFxuXHRcdFx0XHR0aW1lem9uZU1vZGVsVmFsdWUgPSBkYXRhLmN1c3RvbV90aW1lem9uZTtcblxuXHRcdFx0Ly8gV2UncmUgcmV0cmlldmluZyB0aGUgdGltZXpvbmUgb3B0aW9ucyBmcm9tIGEgd3AgZnVuY3Rpb24sIHNvIHdlIGNhbid0XG5cdFx0XHQvLyB1cGRhdGUgaXRzIHNlbGVjdGVkIHZhbHVlIG9uIGpzIHJlbmRlciBhcyB3ZSBkbyB3aXRoIG90aGVyIHNlbGVjdHMuXG5cdFx0XHRpZiAoIHRpbWV6b25lTW9kZWxWYWx1ZSAhPT0gdGltZXpvbmVTZWxlY3RWYWx1ZSApIHtcblx0XHRcdFx0dGhpcy4kKCAnc2VsZWN0W25hbWU9XCJjdXN0b21fdGltZXpvbmVcIl0nICkudmFsKCB0aW1lem9uZU1vZGVsVmFsdWUgKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRUaW1lVG9EaXNwbGF5KCBzb3VyY2UsIHRpbWV6b25lID0gZmFsc2UgKSB7XG5cblx0XHRcdGNvbnN0IHNldHRpbmdzID0gdGhpcy5tb2RlbC5nZXQoICdzY2hlZHVsZScgKTtcblxuXHRcdFx0bGV0IHV0Y09mZnNldCA9IGZhbHNlLFxuXHRcdFx0XHRjdXJyZW50VGltZSA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoICdzZXJ2ZXInID09PSBzb3VyY2UgKSB7XG5cdFx0XHRcdHV0Y09mZnNldCA9IG9wdGluVmFycy50aW1lLndwX2dtdF9vZmZzZXQ7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGN1c3RvbVRpbWV6b25lID0gdGltZXpvbmUgfHwgc2V0dGluZ3MuY3VzdG9tX3RpbWV6b25lO1xuXG5cdFx0XHRcdGlmICggY3VzdG9tVGltZXpvbmUuaW5jbHVkZXMoICdVVEMnICkgKSB7XG5cblx0XHRcdFx0XHRjb25zdCBzZWxlY3RlZE9mZnNldCA9IGN1c3RvbVRpbWV6b25lLnJlcGxhY2UoICdVVEMnLCAnJyApO1xuXG5cdFx0XHRcdFx0Ly8gVGhlcmUncyBhIHRpbWV6b25lIHdpdGggdGhlIHZhbHVlIFwiVVRDXCIuXG5cdFx0XHRcdFx0dXRjT2Zmc2V0ID0gc2VsZWN0ZWRPZmZzZXQubGVuZ3RoID8gcGFyc2VGbG9hdCggc2VsZWN0ZWRPZmZzZXQgKSA6IDA7XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBlbmRNb21lbnQgPSBtb21lbnQoKS50eiggY3VzdG9tVGltZXpvbmUgKTtcblx0XHRcdFx0XHRjdXJyZW50VGltZSA9IGVuZE1vbWVudC5mb3JtYXQoICdoaDptbSBhJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhbGN1bGF0ZSB0aGUgdGltZSB3aXRoIHRoZSBtYW51YWwgb2Zmc2V0LlxuXHRcdFx0Ly8gTW9tZW50LmpzIGRvZXNuJ3Qgc3VwcG9ydCBtYW51YWwgb2Zmc2V0cyB3aXRoIGRlY2ltYWxzLCBzbyBub3QgdXNpbmcgaXQgaGVyZS5cblx0XHRcdGlmICggZmFsc2UgPT09IGN1cnJlbnRUaW1lICYmIGZhbHNlICE9PSB1dGNPZmZzZXQgKSB7XG5cblx0XHRcdFx0Ly8gVGhpcyBpc24ndCB0aGUgY29ycmVjdCB0aW1lc3RhbXAgZm9yIHRoZSBnaXZlbiBvZmZzZXQuXG5cdFx0XHRcdC8vIFdlIGp1c3Qgd2FudCB0byBkaXNwbGF5IHRoZSB0aW1lIGZvciByZWZlcmVuY2UuXG5cdFx0XHRcdGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkgKyAoIHV0Y09mZnNldCAqIDM2MDAgKiAxMDAwICksXG5cdFx0XHRcdFx0ZW5kTW9tZW50ID0gbW9tZW50LnV0YyggdGltZXN0YW1wICk7XG5cblx0XHRcdFx0Y3VycmVudFRpbWUgPSBlbmRNb21lbnQuZm9ybWF0KCAnaGg6bW0gYScgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGN1cnJlbnRUaW1lO1xuXHRcdH0sXG5cblx0XHRzYXZlU2NoZWR1bGUoIGUgKSB7XG5cblx0XHRcdGNvbnN0ICRidXR0b24gPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0ZGF0YSA9IHRoaXMucHJvY2Vzc0Zvcm1Gb3JTYXZlKCk7XG5cblx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdCRidXR0b24ucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCAoKSA9PiB7XG5cdFx0XHRcdCRidXR0b24ucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0JGJ1dHRvbi5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0fSwgNTAwICk7XG5cblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnaXNfc2NoZWR1bGUnLCAnMScgKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnc2NoZWR1bGUnLCBkYXRhICk7XG5cdFx0XHR0aGlzLm1vZGVsLnVzZXJIYXNDaGFuZ2UoKTtcblxuXHRcdFx0dGhpcy5jbG9zZU1vZGFsKCk7XG5cblx0XHRcdHRoaXMudHJpZ2dlciggJ3NjaGVkdWxlOnVwZGF0ZWQnICk7XG5cblx0XHR9LFxuXG5cdFx0cHJvY2Vzc0Zvcm1Gb3JTYXZlKCkge1xuXG5cdFx0XHRjb25zdCAkZm9ybSA9ICQoICcjaHVzdGxlLWVkaXQtc2NoZWR1bGUtZm9ybScgKTtcblx0XHRcdGNvbnN0IGRhdGEgID0gTW9kdWxlLlV0aWxzLnNlcmlhbGl6ZU9iamVjdCggJGZvcm0gKTtcblxuXHRcdFx0cmV0dXJuIGRhdGE7XG5cblx0XHR9LFxuXG5cdFx0Y2FuY2VsKCkge1xuXHRcdFx0dGhpcy5yZW5kZXJDb250ZW50KCk7XG5cdFx0XHR0aGlzLmNsb3NlTW9kYWwoKTtcblx0XHR9LFxuXG5cdFx0b3BlbkRlbGV0ZU1vZGFsKCBlICkge1xuXG5cdFx0XHRsZXQgZGlhbG9nSWQgPSAnaHVzdGxlLWRpYWxvZy0tZGVsZXRlLXNjaGVkdWxlJyxcblx0XHRcdHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtZGVsZXRlLXNjaGVkdWxlLWRpYWxvZy1jb250ZW50LXRwbCcgKSxcblx0XHRcdCR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRpZDogJHRoaXMuZGF0YSggJ2lkJyApLFxuXHRcdFx0XHR0aXRsZTogJHRoaXMuZGF0YSggJ3RpdGxlJyApLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogJHRoaXMuZGF0YSggJ2Rlc2NyaXB0aW9uJyApLFxuXHRcdFx0XHRhY3Rpb246ICdkZWxldGUnLFxuXHRcdFx0XHRhY3Rpb25DbGFzczogJ2h1c3RsZS1idXR0b24tZGVsZXRlJ1xuXHRcdFx0fSxcblx0XHRcdG5ld0ZvY3VzQWZ0ZXJDbG9zZWQgPSAnaHVzdGxlLXNjaGVkdWxlLW5vdGljZScsXG5cdFx0XHRuZXdGb2N1c0ZpcnN0ICAgICAgID0gdW5kZWZpbmVkLFxuXHRcdFx0aGFzT3ZlcmxheU1hc2sgICAgICA9IHRydWUsXG5cdFx0XHRjb250ZW50IFx0XHRcdD0gdGVtcGxhdGUoIGRhdGEgKSxcblx0XHRcdGZvb3RlciAgICAgICAgICAgICAgPSAkKCAnIycgKyBkaWFsb2dJZCArICcgI2h1c3RsZS1kZWxldGUtc2NoZWR1bGUtZGlhbG9nLWNvbnRlbnQnICksXG5cdFx0XHRkZWxldGVCdXR0b24gICAgICAgID0gZm9vdGVyLmZpbmQoICdidXR0b24uaHVzdGxlLWRlbGV0ZS1jb25maXJtJyApO1xuXG5cdFx0XHQvLyBBZGQgdGhlIHRlbXBsYXRlZCBjb250ZW50IHRvIHRoZSBtb2RhbC5cblx0XHRcdGlmICggISBkZWxldGVCdXR0b24ubGVuZ3RoICkge1xuXHRcdFx0XHRmb290ZXIuYXBwZW5kKCBjb250ZW50ICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCB0aGUgdGl0bGUgdG8gdGhlIG1vZGFsLlxuXHRcdFx0JCggJyMnICsgZGlhbG9nSWQgKyAnICNodXN0bGUtZGlhbG9nLS1kZWxldGUtc2NoZWR1bGUtdGl0bGUnICkuaHRtbCggZGF0YS50aXRsZSApO1xuXHRcdFx0JCggJyMnICsgZGlhbG9nSWQgKyAnICNodXN0bGUtZGlhbG9nLS1kZWxldGUtc2NoZWR1bGUtZGVzY3JpcHRpb24nICkuaHRtbCggZGF0YS5kZXNjcmlwdGlvbiApO1xuXG5cdFx0XHRTVUkucmVwbGFjZU1vZGFsKCBkaWFsb2dJZCwgbmV3Rm9jdXNBZnRlckNsb3NlZCwgbmV3Rm9jdXNGaXJzdCwgaGFzT3ZlcmxheU1hc2sgKTtcblxuXHRcdFx0JCggJyNodXN0bGUtZGVsZXRlLXNjaGVkdWxlLWRpYWxvZy1jb250ZW50JyApLm9mZiggJ3N1Ym1pdCcgKS5vbiggJ3N1Ym1pdCcsICQucHJveHkoIHRoaXMuZGVhY3RpdmF0ZVNjaGVkdWxlLCB0aGlzICkgKTtcblxuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlU2NoZWR1bGUoIGUgKSB7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dGhpcy5jbG9zZU1vZGFsKCk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2lzX3NjaGVkdWxlJywgJzAnICk7XG5cdFx0XHR0aGlzLm1vZGVsLnVzZXJIYXNDaGFuZ2UoKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ3NjaGVkdWxlOnVwZGF0ZWQnICk7XG5cdFx0fSxcblxuXHRcdGNoZWNrYm94V2l0aERlcGVuZGVuY2llc0NoYW5nZWQoIGUgKSB7XG5cdFx0XHRjb25zdCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRkaXNhYmxlV2hlbk9uID0gJHRoaXMuZGF0YSggJ2Rpc2FibGUtb24nICksXG5cdFx0XHRcdGhpZGVXaGVuT24gPSAkdGhpcy5kYXRhKCAnaGlkZS1vbicgKTtcblxuXHRcdFx0aWYgKCBkaXNhYmxlV2hlbk9uICkge1xuXHRcdFx0XHRjb25zdCAkZGVwZW5kZW5jaWVzID0gdGhpcy4kKCBgW2RhdGEtY2hlY2tib3gtY29udGVudD1cIiR7IGRpc2FibGVXaGVuT24gfVwiXWAgKTtcblxuXHRcdFx0XHRpZiAoICR0aGlzLmlzKCAnOmNoZWNrZWQnICkgKSB7XG5cdFx0XHRcdFx0JGRlcGVuZGVuY2llcy5hZGRDbGFzcyggJ3N1aS1kaXNhYmxlZCcgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkZGVwZW5kZW5jaWVzLnJlbW92ZUNsYXNzKCAnc3VpLWRpc2FibGVkJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggaGlkZVdoZW5PbiApIHtcblxuXHRcdFx0XHRjb25zdCAkZGVwZW5kZW5jaWVzID0gdGhpcy4kKCBgW2RhdGEtY2hlY2tib3gtY29udGVudD1cIiR7IGhpZGVXaGVuT24gfVwiXWAgKTtcblxuXHRcdFx0XHRpZiAoICR0aGlzLmlzKCAnOmNoZWNrZWQnICkgKSB7XG5cdFx0XHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCAkZGVwZW5kZW5jaWVzICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVTaG93KCAkZGVwZW5kZW5jaWVzICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjdXN0b21UaW1lem9uZUNoYW5nZWQoIGUgKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9ICQoIGUuY3VycmVudFRhcmdldCApLnZhbCgpLFxuXHRcdFx0XHR0aW1lQ29udGFpbmVyID0gdGhpcy4kKCAnI2h1c3RsZS1jdXN0b20tdGltZXpvbmUtY3VycmVudC10aW1lJyApLFxuXHRcdFx0XHRjdXJyZW50VGltZSA9IHRoaXMuZ2V0VGltZVRvRGlzcGxheSggJ2N1c3RvbScsIHZhbHVlICk7XG5cblx0XHRcdHRpbWVDb250YWluZXIudGV4dCggY3VycmVudFRpbWUgKTtcblx0XHR9LFxuXG5cdFx0Y2xvc2VNb2RhbCgpIHtcblx0XHRcdCQoICcuaHVzdGxlLWRhdGVwaWNrZXItZmllbGQnICkuZGF0ZXBpY2tlciggJ2Rlc3Ryb3knICk7XG5cdFx0XHRTVUkuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNb2RhbHMuT3B0aW5fRmllbGRzJywgZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI2h1c3RsZS1kaWFsb2ctLW9wdGluLWZpZWxkcycsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuc3VpLWJveC1zZWxlY3RvciBpbnB1dCc6ICdzZWxlY3RGaWVsZHMnLFxuXHRcdFx0J2NsaWNrIC5zdWktZGlhbG9nLW92ZXJsYXknOiAnY2xvc2VNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jYW5jZWwtaW5zZXJ0LWZpZWxkcyc6ICdjbG9zZU1vZGFsJyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWluc2VydC1maWVsZHMnOiAnaW5zZXJ0RmllbGRzJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplKCkge1xuXHRcdFx0dGhpcy5zZWxlY3RlZEZpZWxkcyA9IFtdO1xuXHRcdH0sXG5cblx0XHRzZWxlY3RGaWVsZHMoIGUgKSB7XG5cdFx0XHR2YXIgJGlucHV0ID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHR2YWx1ZSA9ICRpbnB1dC52YWwoKSxcblx0XHRcdFx0JHNlbGVjdG9yTGFiZWwgID0gdGhpcy4kZWwuZmluZCggJ2xhYmVsW2Zvcj1cIicgKyAkaW5wdXQuYXR0ciggJ2lkJyApICsgJ1wiXScgKVxuXHRcdFx0XHQ7XG5cdFx0XHQkc2VsZWN0b3JMYWJlbC50b2dnbGVDbGFzcyggJ3NlbGVjdGVkJyApO1xuXHRcdFx0aWYgKCAkaW5wdXQucHJvcCggJ2NoZWNrZWQnICkgKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRGaWVsZHMucHVzaCggdmFsdWUgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRGaWVsZHMgPSBfLndpdGhvdXQoIHRoaXMuc2VsZWN0ZWRGaWVsZHMsIHZhbHVlICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGluc2VydEZpZWxkcyggZSApIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0JGJ1dHRvbiAgID0gdGhpcy4kKCBlLnRhcmdldCApXG5cdFx0XHRcdDtcblx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ2ZpZWxkczphZGRlZCcsIHRoaXMuc2VsZWN0ZWRGaWVsZHMgKTtcblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkYnV0dG9uLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHRcdHNlbGYuY2xvc2VNb2RhbCgpO1xuXHRcdFx0fSwgNTAwICk7XG5cdFx0fSxcblxuXHRcdGNsb3NlTW9kYWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XG5cdFx0XHR0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblx0XHRcdGxldCAkc2VsZWN0b3IgPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtc2VsZWN0b3I6bm90KC5odXN0bGUtc2tpcCknICksXG5cdFx0XHRcdCRpbnB1dCAgICA9ICRzZWxlY3Rvci5maW5kKCAnaW5wdXQnICk7XG5cblx0XHRcdC8vIEhpZGUgZGlhbG9nXG5cdFx0XHRTVUkuZGlhbG9nc1sgJ2h1c3RsZS1kaWFsb2ctLW9wdGluLWZpZWxkcycgXS5oaWRlKCk7XG5cblx0XHRcdC8vIFVuY2hlY2sgb3B0aW9uc1xuXHRcdFx0JHNlbGVjdG9yLnJlbW92ZUNsYXNzKCAnc2VsZWN0ZWQnICk7XG5cdFx0XHQkaW5wdXQucHJvcCggJ2NoZWNrZWQnLCBmYWxzZSApO1xuXHRcdFx0JGlucHV0WzBdLmNoZWNrZWQgPSBmYWxzZTtcblx0XHR9XG5cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNb2RhbHMuVmlzaWJpbGl0eV9Db25kaXRpb25zJywgZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRyZXR1cm4gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdFx0ZWw6ICcjaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zJyxcblxuXHRcdHNlbGVjdGVkQ29uZGl0aW9uczogW10sXG5cblx0XHRvcHRzOiB7XG5cdFx0XHRncm91cElkOiAwLFxuXHRcdFx0Y29uZGl0aW9uczogW11cblx0XHR9LFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLnN1aS1ib3gtc2VsZWN0b3IgaW5wdXQnOiAnc2VsZWN0Q29uZGl0aW9ucycsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jYW5jZWwtY29uZGl0aW9ucyc6ICdjYW5jZWxDb25kaXRpb25zJyxcblx0XHRcdCdjbGljayAuc3VpLWRpYWxvZy1vdmVybGF5JzogJ2NhbmNlbENvbmRpdGlvbnMnLFxuXHRcdFx0J2NsaWNrICNodXN0bGUtYWRkLWNvbmRpdGlvbnMnOiAnYWRkQ29uZGl0aW9ucydcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLm9wdHMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRzLCBvcHRpb25zICk7XG5cdFx0XHR0aGlzLnNlbGVjdGVkQ29uZGl0aW9ucyA9IHRoaXMub3B0cy5jb25kaXRpb25zO1xuXG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLXZpc2liaWxpdHktY29uZGl0aW9uLW9wdGlvbicgKS5wcm9wKCAnY2hlY2tlZCcsIGZhbHNlICkucHJvcCggJ2Rpc2FibGVkJywgZmFsc2UgKTtcblxuXHRcdFx0Zm9yICggbGV0IGNvbmRpdGlvbklkIG9mIHRoaXMuc2VsZWN0ZWRDb25kaXRpb25zICkge1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWNvbmRpdGlvbi0tJyArIGNvbmRpdGlvbklkICkucHJvcCggJ2NoZWNrZWQnLCB0cnVlICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHNlbGVjdENvbmRpdGlvbnM6IGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHRsZXQgJGlucHV0ID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHQkc2VsZWN0b3JMYWJlbCAgPSB0aGlzLiRlbC5maW5kKCAnbGFiZWxbZm9yPVwiJyArICRpbnB1dC5hdHRyKCAnaWQnICkgKyAnXCJdJyApLFxuXHRcdFx0XHR2YWx1ZSA9ICRpbnB1dC52YWwoKVxuXHRcdFx0XHQ7XG5cblx0XHRcdCRzZWxlY3RvckxhYmVsLnRvZ2dsZUNsYXNzKCAnc2VsZWN0ZWQnICk7XG5cblx0XHRcdGlmICggJGlucHV0LnByb3AoICdjaGVja2VkJyApICkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkQ29uZGl0aW9ucy5wdXNoKCB2YWx1ZSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZENvbmRpdGlvbnMgPSBfLndpdGhvdXQoIHRoaXMuc2VsZWN0ZWRDb25kaXRpb25zLCB2YWx1ZSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjYW5jZWxDb25kaXRpb25zOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gSGlkZSBkaWFsb2dcblx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zJyBdLmhpZGUoKTtcblxuXHRcdH0sXG5cblx0XHRhZGRDb25kaXRpb25zOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGxldCBtZSA9IHRoaXMsXG5cdFx0XHRcdCRidXR0b24gICA9IHRoaXMuJCggZS50YXJnZXQgKTtcblx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblxuXHRcdFx0dGhpcy50cmlnZ2VyKCAnY29uZGl0aW9uczphZGRlZCcsIHsgZ3JvdXBJZDogJGJ1dHRvbi5kYXRhKCAnZ3JvdXBfaWQnICksIGNvbmRpdGlvbnM6IHRoaXMuc2VsZWN0ZWRDb25kaXRpb25zIH0pO1xuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0Ly8gSGlkZSBkaWFsb2dcblx0XHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS12aXNpYmlsaXR5LW9wdGlvbnMnIF0uaGlkZSgpO1xuXHRcdFx0XHQkYnV0dG9uLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHRcdG1lLnVuZGVsZWdhdGVFdmVudHMoKTtcblx0XHRcdH0sIDUwMCApO1xuXHRcdH1cblxuXHR9KTtcbn0pO1xuIiwiKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdE9wdGluLmxpc3RpbmdCYXNlID0gSHVzdGxlLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnLnN1aS13cmFwJyxcblxuXHRcdGxvZ1Nob3duOiBmYWxzZSxcblxuXHRcdG1vZHVsZVR5cGU6ICcnLFxuXG5cdFx0c2luZ2xlTW9kdWxlQWN0aW9uTm9uY2U6ICcnLFxuXG5cdFx0X2V2ZW50czoge1xuXG5cdFx0XHQvLyBNb2RhbHMuXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jcmVhdGUtbW9kdWxlJzogJ29wZW5DcmVhdGVNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1kZWxldGUtbW9kdWxlLWJ1dHRvbic6ICdvcGVuRGVsZXRlTW9kYWwnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtbW9kdWxlLXRyYWNraW5nLXJlc2V0LWJ1dHRvbic6ICdvcGVuUmVzZXRUcmFja2luZ01vZGFsJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLW1hbmFnZS10cmFja2luZy1idXR0b24nOiAnb3Blbk1hbmFnZVRyYWNraW5nTW9kYWwnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtaW1wb3J0LW1vZHVsZS1idXR0b24nOiAnb3BlbkltcG9ydE1vZGFsJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXVwZ3JhZGUtbW9kYWwtYnV0dG9uJzogJ29wZW5VcGdyYWRlTW9kYWwnLFxuXG5cdFx0XHQvLyBNb2R1bGVzJyBhY3Rpb25zLlxuXHRcdFx0J2NsaWNrIC5odXN0bGUtc2luZ2xlLW1vZHVsZS1idXR0b24tYWN0aW9uJzogJ2hhbmRsZVNpbmdsZU1vZHVsZUFjdGlvbicsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1wcmV2aWV3LW1vZHVsZS1idXR0b24nOiAnb3BlblByZXZpZXcnLFxuXG5cdFx0XHQvLyBCdWxrIGFjdGlvbnMuXG5cdFx0XHQnY2xpY2sgZm9ybS5zdWktYnVsay1hY3Rpb25zIC5odXN0bGUtYnVsay1hcHBseS1idXR0b24nOiAnYnVsa0FjdGlvbkNoZWNrJyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWRpYWxvZy0tZGVsZXRlIC5odXN0bGUtZGVsZXRlJzogJ2J1bGtBY3Rpb25TZW5kJyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWJ1bGstYWN0aW9uLXJlc2V0LXRyYWNraW5nLWNvbmZpcm1hdGlvbiAuaHVzdGxlLWRlbGV0ZSc6ICdidWxrQWN0aW9uU2VuZCcsXG5cblx0XHRcdC8vIFV0aWxpdGllcy5cblx0XHRcdCdjbGljayAuc3VpLWFjY29yZGlvbi1pdGVtLWFjdGlvbiAuaHVzdGxlLW9ubG9hZC1pY29uLWFjdGlvbic6ICdhZGRMb2FkaW5nSWNvblRvQWN0aW9uc0J1dHRvbidcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSggb3B0cyApIHtcblxuXHRcdFx0dGhpcy5ldmVudHMgPSAkLmV4dGVuZCggdHJ1ZSwge30sIHRoaXMuZXZlbnRzLCB0aGlzLl9ldmVudHMgKTtcblx0XHRcdHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcblxuXHRcdFx0dGhpcy5tb2R1bGVUeXBlID0gb3B0cy5tb2R1bGVUeXBlO1xuXG5cdFx0XHR0aGlzLnNpbmdsZU1vZHVsZUFjdGlvbk5vbmNlID0gb3B0aW5WYXJzLnNpbmdsZV9tb2R1bGVfYWN0aW9uX25vbmNlO1xuXG5cdFx0XHRsZXQgbmV3TW9kdWxlTW9kYWwgPSBIdXN0bGUuZ2V0KCAnTW9kYWxzLk5ld19Nb2R1bGUnICksXG5cdFx0XHRcdGltcG9ydE1vZGFsID0gSHVzdGxlLmdldCggJ01vZGFscy5JbXBvcnRNb2R1bGUnICk7XG5cblx0XHRcdG5ldyBuZXdNb2R1bGVNb2RhbCh7IG1vZHVsZVR5cGU6IHRoaXMubW9kdWxlVHlwZSB9KTtcblx0XHRcdHRoaXMuSW1wb3J0TW9kYWwgPSBuZXcgaW1wb3J0TW9kYWwoKTtcblxuXHRcdFx0Ly8gV2h5IHRoaXMgZG9lc24ndCB3b3JrIHdoZW4gYWRkZWQgaW4gZXZlbnRzXG5cdFx0XHQkKCAnLnN1aS1hY2NvcmRpb24taXRlbS1oZWFkZXInICkub24oICdjbGljaycsICQucHJveHkoIHRoaXMub3BlblRyYWNraW5nQ2hhcnQsIHRoaXMgKSApO1xuXG5cdFx0XHQvLyBPcGVuIHRoZSB0cmFja2luZyBjaGFydCB3aGVuIHRoZSBjbGFzcyBpcyBwcmVzZW50LiBVc2VkIHdoZW4gY29taW5nIGZyb20gJ3ZpZXcgdHJhY2tpbmcnIGluIERhc2hib2FyZC5cblx0XHRcdGlmICggJCggJy5odXN0bGUtZGlzcGxheS1jaGFydCcgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRoaXMub3BlblRyYWNraW5nQ2hhcnQoICQoICcuaHVzdGxlLWRpc3BsYXktY2hhcnQnICkgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kb0FjdGlvbnNCYXNlZE9uVXJsKCk7XG5cdFx0fSxcblxuXHRcdGRvQWN0aW9uc0Jhc2VkT25VcmwoKSB7XG5cblx0XHRcdC8vIERpc3BsYXkgdGhlIFwiQ3JlYXRlIG1vZHVsZVwiIGRpYWxvZy5cblx0XHRcdGlmICggJ3RydWUnID09PSBNb2R1bGUuVXRpbHMuZ2V0VXJsUGFyYW0oICdjcmVhdGUtbW9kdWxlJyApICkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCAoKSA9PiB7XG5cdFx0XHRcdFx0JCggJy5odXN0bGUtY3JlYXRlLW1vZHVsZScgKS50cmlnZ2VyKCAnY2xpY2snICk7XG5cdFx0XHRcdH0sIDEwMCApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEaXNwbGF5IFwiVXBncmFkZSBtb2RhbFwiLlxuXHRcdFx0aWYgKCAndHJ1ZScgPT09IE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ3JlcXVpcmVzLXBybycgKSApIHtcblx0XHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdHNldFRpbWVvdXQoICgpID0+IHNlbGYub3BlblVwZ3JhZGVNb2RhbCgpLCAxMDAgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2UgYmFzZWQgb24gVVJMIHBhcmFtZXRlcnMuXG5cdFx0XHRpZiAoIE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ3Nob3ctbm90aWNlJyApICkge1xuXHRcdFx0XHRjb25zdCBzdGF0dXMgPSAnc3VjY2VzcycgPT09IE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ3Nob3ctbm90aWNlJyApID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyxcblx0XHRcdFx0XHRub3RpY2UgPSBNb2R1bGUuVXRpbHMuZ2V0VXJsUGFyYW0oICdub3RpY2UnICksXG5cdFx0XHRcdFx0bWVzc2FnZSA9ICggbm90aWNlICYmICd1bmRlZmluZWQnICE9PSBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9uc1sgbm90aWNlIF0pID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnNbIG5vdGljZSBdIDogTW9kdWxlLlV0aWxzLmdldFVybFBhcmFtKCAnbm90aWNlLW1lc3NhZ2UnICk7XG5cblx0XHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1lc3NhZ2UgJiYgbWVzc2FnZS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCBzdGF0dXMsIG1lc3NhZ2UgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRoYW5kbGVTaW5nbGVNb2R1bGVBY3Rpb24oIGUgKSB7XG5cdFx0XHR0aGlzLmFkZExvYWRpbmdJY29uKCBlICk7XG5cdFx0XHRNb2R1bGUuaGFuZGxlQWN0aW9ucy5pbml0QWN0aW9uKCBlLCAnbGlzdGluZycsIHRoaXMgKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogaW5pdEFjdGlvbiBzdWNjY2VzcyBjYWxsYmFjayBmb3IgXCJ0b2dnbGUtc3RhdHVzXCIuXG5cdFx0ICogQHNpbmNlIDQuMC40XG5cdFx0ICovXG5cdFx0YWN0aW9uVG9nZ2xlU3RhdHVzKCAkdGhpcywgZGF0YSApIHtcblxuXHRcdFx0Y29uc3QgZW5hYmxlZCA9IGRhdGEud2FzX21vZHVsZV9lbmFibGVkO1xuXG5cdFx0XHRsZXQgaXRlbSA9ICR0aGlzLmNsb3Nlc3QoICcuc3VpLWFjY29yZGlvbi1pdGVtJyApLFxuXHRcdFx0XHR0YWcgID0gaXRlbS5maW5kKCAnLnN1aS1hY2NvcmRpb24taXRlbS10aXRsZSBzcGFuLnN1aS10YWcnICk7XG5cblx0XHRcdGlmICggISBlbmFibGVkICkge1xuXHRcdFx0XHR0YWcudGV4dCggdGFnLmRhdGEoICdwdWJsaXNoJyApICk7XG5cdFx0XHRcdHRhZy5hZGRDbGFzcyggJ3N1aS10YWctYmx1ZScgKTtcblx0XHRcdFx0dGFnLmF0dHIoICdkYXRhLXN0YXR1cycsICdwdWJsaXNoZWQnICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhZy50ZXh0KCB0YWcuZGF0YSggJ2RyYWZ0JyApICk7XG5cdFx0XHRcdHRhZy5yZW1vdmVDbGFzcyggJ3N1aS10YWctYmx1ZScgKTtcblx0XHRcdFx0dGFnLmF0dHIoICdkYXRhLXN0YXR1cycsICdkcmFmdCcgKTtcblx0XHRcdH1cblxuXHRcdFx0JHRoaXMuZmluZCggJ3NwYW4nICkudG9nZ2xlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHQvLyBVcGRhdGUgdHJhY2tpbmcgZGF0YVxuXHRcdFx0aWYgKCBpdGVtLmhhc0NsYXNzKCAnc3VpLWFjY29yZGlvbi1pdGVtLS1vcGVuJyApICkge1xuXHRcdFx0XHRpdGVtLmZpbmQoICcuc3VpLWFjY29yZGlvbi1vcGVuLWluZGljYXRvcicgKS50cmlnZ2VyKCAnY2xpY2snICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRhY3Rpb25EaXNwbGF5RXJyb3IoICR0aGlzLCBkYXRhICkge1xuXG5cdFx0XHRjb25zdCBtZXNzYWdlID0gZGF0YS5tZXNzYWdlLFxuXHRcdFx0XHQkZGlhbG9nID0gJHRoaXMuY2xvc2VzdCggJy5zdWktbW9kYWwnICksXG5cdFx0XHRcdCRlcnJvckNvbnRhaW5lciA9ICRkaWFsb2cuZmluZCggJy5zdWktbm90aWNlLWVycm9yJyApLFxuXHRcdFx0XHQkZXJyb3IgPSAkZXJyb3JDb250YWluZXIuZmluZCggJ3AnICk7XG5cblx0XHRcdCRlcnJvci5odG1sKCBtZXNzYWdlICk7XG5cdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coICRlcnJvckNvbnRhaW5lciwgZmFsc2UgKTtcblx0XHR9LFxuXG5cdFx0b3BlblByZXZpZXcoIGUgKSB7XG5cdFx0XHRsZXQgJHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0aWQgPSAkdGhpcy5kYXRhKCAnaWQnICksXG5cdFx0XHRcdHR5cGUgPSAkdGhpcy5kYXRhKCAndHlwZScgKTtcblxuXHRcdFx0TW9kdWxlLnByZXZpZXcub3BlbiggaWQsIHR5cGUgKTtcblx0XHR9LFxuXG5cdFx0b3BlblRyYWNraW5nQ2hhcnQoIGUgKSB7XG5cblx0XHRcdGxldCBmbGV4SGVhZGVyID0gJyc7XG5cblx0XHRcdGlmICggZS50YXJnZXQgKSB7XG5cblx0XHRcdFx0aWYgKCAkKCBlLnRhcmdldCApLmNsb3Nlc3QoICcuc3VpLWFjY29yZGlvbi1pdGVtLWFjdGlvbicgKS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0ZmxleEhlYWRlciA9ICQoIGUuY3VycmVudFRhcmdldCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZmxleEhlYWRlciA9IGU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBzZWxmID0gdGhpcyxcblx0XHRcdFx0ZmxleEl0ZW0gICA9IGZsZXhIZWFkZXIucGFyZW50KCksXG5cdFx0XHRcdGZsZXhDaGFydCAgPSBmbGV4SXRlbS5maW5kKCAnLnN1aS1jaGFydGpzLWFuaW1hdGVkJyApXG5cdFx0XHRcdDtcblxuXHRcdFx0aWYgKCBmbGV4SXRlbS5oYXNDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tZGlzYWJsZWQnICkgKSB7XG5cdFx0XHRcdGZsZXhJdGVtLnJlbW92ZUNsYXNzKCAnc3VpLWFjY29yZGlvbi1pdGVtLS1vcGVuJyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCBmbGV4SXRlbS5oYXNDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKSApIHtcblx0XHRcdFx0XHRmbGV4SXRlbS5yZW1vdmVDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmbGV4SXRlbS5hZGRDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmbGV4SXRlbS5maW5kKCAnLnN1aS1hY2NvcmRpb24taXRlbS1kYXRhJyApLmFkZENsYXNzKCAnc3VpLW9ubG9hZCcgKTtcblx0XHRcdGZsZXhDaGFydC5yZW1vdmVDbGFzcyggJ3N1aS1jaGFydGpzLWxvYWRlZCcgKTtcblxuXHRcdFx0aWYgKCBmbGV4SXRlbS5oYXNDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKSApIHtcblx0XHRcdFx0bGV0IGlkID0gZmxleEhlYWRlci5kYXRhKCAnaWQnICksXG5cdFx0XHRcdFx0bm9uY2UgPSBmbGV4SGVhZGVyLmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdFx0aWQ6IGlkLFxuXHRcdFx0XHRcdFx0J19hamF4X25vbmNlJzogbm9uY2UsXG5cdFx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfdHJhY2tpbmdfZGF0YSdcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzcCApIHtcblx0XHRcdFx0XHRcdGlmICggcmVzcC5zdWNjZXNzICYmIHJlc3AuZGF0YSApIHtcblxuXHRcdFx0XHRcdFx0XHRmbGV4SXRlbS5maW5kKCAnLnN1aS1hY2NvcmRpb24taXRlbS1ib2R5JyApLmh0bWwoIHJlc3AuZGF0YS5odG1sICk7XG5cblx0XHRcdFx0XHRcdFx0TW9kdWxlLnRyYWNraW5nQ2hhcnQuaW5pdCggZmxleEl0ZW0sIHJlc3AuZGF0YS5jaGFydHNfZGF0YSApO1xuXG5cdFx0XHRcdFx0XHRcdGZsZXhDaGFydCAgPSBmbGV4SXRlbS5maW5kKCAnLnN1aS1jaGFydGpzLWFuaW1hdGVkJyApO1xuXG5cdFx0XHRcdFx0XHRcdC8vIEluaXQgdGFic1xuXHRcdFx0XHRcdFx0XHRTVUkuc3VpVGFicygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZmxleEl0ZW0uZmluZCggJy5zdWktYWNjb3JkaW9uLWl0ZW0tZGF0YScgKS5yZW1vdmVDbGFzcyggJ3N1aS1vbmxvYWQnICk7XG5cdFx0XHRcdFx0XHRmbGV4Q2hhcnQuYWRkQ2xhc3MoICdzdWktY2hhcnRqcy1sb2FkZWQnICk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oIHJlc3AgKSB7XG5cdFx0XHRcdFx0XHRmbGV4SXRlbS5maW5kKCAnLnN1aS1hY2NvcmRpb24taXRlbS1kYXRhJyApLnJlbW92ZUNsYXNzKCAnc3VpLW9ubG9hZCcgKTtcblx0XHRcdFx0XHRcdGZsZXhDaGFydC5hZGRDbGFzcyggJ3N1aS1jaGFydGpzLWxvYWRlZCcgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0Z2V0Q2hlY2tlZDogZnVuY3Rpb24oIHR5cGUgKSB7XG5cdFx0XHRsZXQgcXVlcnkgPSAnLnN1aS13cmFwIC5zdWktYWNjb3JkaW9uLWl0ZW0tdGl0bGUgaW5wdXRbdHlwZT1jaGVja2JveF0nO1xuXHRcdFx0aWYgKCAnY2hlY2tlZCcgPT09IHR5cGUgKSB7XG5cdFx0XHRcdHF1ZXJ5ICs9ICc6Y2hlY2tlZCc7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJCggcXVlcnkgKTtcblx0XHR9LFxuXG5cdFx0YnVsa0FjdGlvbkNoZWNrOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdHZhbHVlID0gJHRoaXMuY2xvc2VzdCggJy5odXN0bGUtYnVsay1hY3Rpb25zLWNvbnRhaW5lcicgKS5maW5kKCAnc2VsZWN0W25hbWU9XCJodXN0bGVfYWN0aW9uXCJdIG9wdGlvbjpzZWxlY3RlZCcgKS52YWwoKSwgLy8kKCAnc2VsZWN0IG9wdGlvbjpzZWxlY3RlZCcsICR0aGlzLmNsb3Nlc3QoICcuc3VpLWJveCcgKSApLnZhbCgpLFxuXHRcdFx0XHRlbGVtZW50cyA9IHRoaXMuZ2V0Q2hlY2tlZCggJ2NoZWNrZWQnICk7XG5cblx0XHRcdGlmICggMCA9PT0gZWxlbWVudHMubGVuZ3RoIHx8ICd1bmRlZmluZWQnID09PSB2YWx1ZSApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdkZWxldGUnID09PSB2YWx1ZSApIHtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IHtcblx0XHRcdFx0XHRhY3Rpb25DbGFzczogJ2h1c3RsZS1kZWxldGUnLFxuXHRcdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZScsXG5cdFx0XHRcdFx0dGl0bGU6ICR0aGlzLmRhdGEoICdkZWxldGUtdGl0bGUnICksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246ICR0aGlzLmRhdGEoICdkZWxldGUtZGVzY3JpcHRpb24nIClcblx0XHRcdFx0fTtcblx0XHRcdFx0TW9kdWxlLmRlbGV0ZU1vZGFsLm9wZW4oIGRhdGEgKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCAncmVzZXQtdHJhY2tpbmcnID09PSB2YWx1ZSApIHtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IHtcblx0XHRcdFx0XHRhY3Rpb25DbGFzczogJ2h1c3RsZS1kZWxldGUnLFxuXHRcdFx0XHRcdGFjdGlvbjogJ3Jlc2V0LXRyYWNraW5nJyxcblx0XHRcdFx0XHR0aXRsZTogJHRoaXMuZGF0YSggJ3Jlc2V0LXRpdGxlJyApLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiAkdGhpcy5kYXRhKCAncmVzZXQtZGVzY3JpcHRpb24nIClcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRNb2R1bGUuZGVsZXRlTW9kYWwub3BlbiggZGF0YSApO1xuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5idWxrQWN0aW9uU2VuZCggZSwgdmFsdWUgKTtcblx0XHR9LFxuXG5cdFx0YnVsa0FjdGlvblNlbmQ6IGZ1bmN0aW9uKCBlLCBhY3Rpb24gKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHRoaXMuYWRkTG9hZGluZ0ljb24oIGUgKTtcblx0XHRcdGxldCBidXR0b24gPSAkKCAnLnN1aS1idWxrLWFjdGlvbnMgLmh1c3RsZS1idWxrLWFwcGx5LWJ1dHRvbicgKSxcblx0XHRcdFx0dmFsdWUgPSBhY3Rpb24gPyBhY3Rpb24gOiAkKCBlLnRhcmdldCApLmRhdGEoICdodXN0bGUtYWN0aW9uJyApLFxuXHRcdFx0XHRlbGVtZW50cyA9IHRoaXMuZ2V0Q2hlY2tlZCggJ2NoZWNrZWQnICk7XG5cblx0XHRcdGlmICggMCA9PT0gZWxlbWVudHMubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRsZXQgaWRzID0gW107XG5cdFx0XHQkLmVhY2goIGVsZW1lbnRzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWRzLnB1c2goICQoIHRoaXMgKS52YWwoKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBkYXRhID0ge1xuXHRcdFx0XHRpZHM6IGlkcyxcblx0XHRcdFx0aHVzdGxlOiB2YWx1ZSxcblx0XHRcdFx0dHlwZTogYnV0dG9uLmRhdGEoICd0eXBlJyApLFxuXHRcdFx0XHQnX2FqYXhfbm9uY2UnOiBidXR0b24uZGF0YSggJ25vbmNlJyApLFxuXHRcdFx0XHRhY3Rpb246ICdodXN0bGVfbGlzdGluZ19idWxrJ1xuXHRcdFx0fTtcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzcCApIHtcblx0XHRcdFx0XHRpZiAoIHJlc3Auc3VjY2VzcyApIHtcblx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tZGVsZXRlJ10uaGlkZSgpO1xuXG5cdFx0XHRcdFx0XHQvL3Nob3cgZXJyb3Igbm90aWNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0YWRkTG9hZGluZ0ljb24oIGUgKSB7XG5cdFx0XHRjb25zdCAkYnV0dG9uID0gJCggZS5jdXJyZW50VGFyZ2V0ICk7XG5cdFx0XHRpZiAoICRidXR0b24uaGFzQ2xhc3MoICdzdWktYnV0dG9uJyApICkge1xuXHRcdFx0XHQkYnV0dG9uLmFkZENsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGFkZExvYWRpbmdJY29uVG9BY3Rpb25zQnV0dG9uKCBlICkge1xuXHRcdFx0Y29uc3QgJGFjdGlvbkJ1dHRvbiA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHQkbWFpbkJ1dHRvbiA9ICRhY3Rpb25CdXR0b24uY2xvc2VzdCggJy5zdWktYWNjb3JkaW9uLWl0ZW0tYWN0aW9uJyApLmZpbmQoICcuc3VpLWRyb3Bkb3duLWFuY2hvcicgKTtcblxuXHRcdFx0JG1haW5CdXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBNb2RhbHNcblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdFx0b3BlbkNyZWF0ZU1vZGFsKCBlICkge1xuXG5cdFx0XHRsZXQgcGFnZSA9ICdfcGFnZV9odXN0bGVfc3NoYXJlX2xpc3RpbmcnO1xuXG5cdFx0XHRpZiAoIGZhbHNlID09PSAkKCBlLmN1cnJlbnRUYXJnZXQgKS5kYXRhKCAnZW5hYmxlZCcgKSApIHtcblx0XHRcdFx0dGhpcy5vcGVuVXBncmFkZU1vZGFsKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYgKCBwYWdlICE9PSBwYWdlbm93LnN1YnN0ciggcGFnZW5vdy5sZW5ndGggLSBwYWdlLmxlbmd0aCApICkge1xuXHRcdFx0XHRcdFNVSS5vcGVuTW9kYWwoXG5cdFx0XHRcdFx0XHQnaHVzdGxlLW5ldy1tb2R1bGUtLXR5cGUnLFxuXHRcdFx0XHRcdFx0J2h1c3RsZS1jcmVhdGUtbmV3LW1vZHVsZScsXG5cdFx0XHRcdFx0XHQnaHVzdGxlLW5ldy1tb2R1bGUtLXR5cGUtY2xvc2UnLFxuXHRcdFx0XHRcdFx0ZmFsc2Vcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFNVSS5vcGVuTW9kYWwoXG5cdFx0XHRcdFx0XHQnaHVzdGxlLW5ldy1tb2R1bGUtLWNyZWF0ZScsXG5cdFx0XHRcdFx0XHQnaHVzdGxlLWNyZWF0ZS1uZXctbW9kdWxlJyxcblx0XHRcdFx0XHRcdCdodXN0bGUtbW9kdWxlLW5hbWUnLFxuXHRcdFx0XHRcdFx0ZmFsc2Vcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLWFkZC1uZXctbW9kdWxlJ10uc2hvdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvcGVuVXBncmFkZU1vZGFsKCBlICkge1xuXG5cdFx0XHRpZiAoIGUgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdH1cblxuXHRcdFx0JCggJy5zdWktYnV0dG9uLW9ubG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHRpZiAoICEgJCggJyNodXN0bGUtZGlhbG9nLS11cGdyYWRlLXRvLXBybycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLXVwZ3JhZGUtdG8tcHJvJ10uc2hvdygpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fSxcblxuXHRcdG9wZW5EZWxldGVNb2RhbCggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGRhdGEgPSB7XG5cdFx0XHRcdFx0aWQ6ICR0aGlzLmRhdGEoICdpZCcgKSxcblx0XHRcdFx0XHRub25jZTogJHRoaXMuZGF0YSggJ25vbmNlJyApLFxuXHRcdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZScsXG5cdFx0XHRcdFx0dGl0bGU6ICR0aGlzLmRhdGEoICd0aXRsZScgKSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogJHRoaXMuZGF0YSggJ2Rlc2NyaXB0aW9uJyApLFxuXHRcdFx0XHRcdGFjdGlvbkNsYXNzOiAnaHVzdGxlLXNpbmdsZS1tb2R1bGUtYnV0dG9uLWFjdGlvbidcblx0XHRcdFx0fTtcblxuXHRcdFx0TW9kdWxlLmRlbGV0ZU1vZGFsLm9wZW4oIGRhdGEgKTtcblx0XHR9LFxuXG5cdFx0b3BlbkltcG9ydE1vZGFsKCBlICkge1xuXG5cdFx0XHRjb25zdCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApO1xuXG5cdFx0XHRpZiAoIGZhbHNlID09PSAkdGhpcy5kYXRhKCAnZW5hYmxlZCcgKSApIHtcblx0XHRcdFx0dGhpcy5vcGVuVXBncmFkZU1vZGFsKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy5JbXBvcnRNb2RhbC5vcGVuKCBlICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBcImFyZSB5b3Ugc3VyZT9cIiBtb2RhbCBmcm9tIGJlZm9yZSByZXNldHRpbmcgdGhlIHRyYWNraW5nIGRhdGEgb2YgbW9kdWxlcy5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICovXG5cdFx0b3BlblJlc2V0VHJhY2tpbmdNb2RhbCggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Y29uc3QgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdGlkOiAkdGhpcy5kYXRhKCAnbW9kdWxlLWlkJyApLFxuXHRcdFx0XHRcdG5vbmNlOiB0aGlzLnNpbmdsZU1vZHVsZUFjdGlvbk5vbmNlLFxuXHRcdFx0XHRcdGFjdGlvbjogJ3Jlc2V0LXRyYWNraW5nJyxcblx0XHRcdFx0XHR0aXRsZTogJHRoaXMuZGF0YSggJ3RpdGxlJyApLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiAkdGhpcy5kYXRhKCAnZGVzY3JpcHRpb24nICksXG5cdFx0XHRcdFx0YWN0aW9uQ2xhc3M6ICdodXN0bGUtc2luZ2xlLW1vZHVsZS1idXR0b24tYWN0aW9uJ1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRNb2R1bGUuZGVsZXRlTW9kYWwub3BlbiggZGF0YSApO1xuXHRcdH0sXG5cblx0XHRvcGVuTWFuYWdlVHJhY2tpbmdNb2RhbCggZSApIHtcblx0XHRcdGNvbnN0IHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtbWFuYWdlLXRyYWNraW5nLWZvcm0tdHBsJyApLFxuXHRcdFx0XHQkbW9kYWwgPSAkKCAnI2h1c3RsZS1kaWFsb2ctLW1hbmFnZS10cmFja2luZycgKSxcblx0XHRcdFx0JGJ1dHRvbiA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRtb2R1bGVJZCA9ICRidXR0b24uZGF0YSggJ21vZHVsZS1pZCcgKSxcblx0XHRcdFx0ZGF0YSA9IHtcblxuXHRcdFx0XHRcdC8vbW9kdWxlSUQ6ICRidXR0b24uZGF0YSggJ21vZHVsZS1pZCcgKSxcblx0XHRcdFx0XHRlbmFibGVkVHJhY2tpbmdzOiAkYnV0dG9uLmRhdGEoICd0cmFja2luZy10eXBlcycgKS5zcGxpdCggJywnIClcblx0XHRcdFx0fTtcblxuXHRcdFx0JG1vZGFsLmZpbmQoICcjaHVzdGxlLW1hbmFnZS10cmFja2luZy1mb3JtLWNvbnRhaW5lcicgKS5odG1sKCB0ZW1wbGF0ZSggZGF0YSApICk7XG5cdFx0XHQkbW9kYWwuZmluZCggJyNodXN0bGUtYnV0dG9uLXRvZ2dsZS10cmFja2luZy10eXBlcycgKS5kYXRhKCAnbW9kdWxlLWlkJywgbW9kdWxlSWQgKTtcblx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tbWFuYWdlLXRyYWNraW5nJyBdLnNob3coKTtcblx0XHR9XG5cblx0fSk7XG59KCBqUXVlcnkgKSApO1xuIiwiSHVzdGxlLmRlZmluZSggJ01vZGFscy5OZXdfTW9kdWxlJywgZnVuY3Rpb24oICQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjaHVzdGxlLW5ldy1tb2R1bGUtLWRpYWxvZycsXG5cdFx0ZGF0YToge30sXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1zZWxlY3QtbW9kZSc6ICdtb2RlU2VsZWN0ZWQnLFxuXHRcdFx0J2tleXByZXNzICNtb2R1bGUtbW9kZS1zdGVwJzogJ21heWJlTW9kZVNlbGVjdGVkJyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWNyZWF0ZS1tb2R1bGUnOiAnY3JlYXRlTW9kdWxlJyxcblx0XHRcdCdrZXlwcmVzcyAjbW9kdWxlLW5hbWUtc3RlcCc6ICdtYXliZUNyZWF0ZU1vZHVsZScsXG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1uZXctbW9kdWxlLS1jcmVhdGUtYmFjayc6ICdnb1RvTW9kZVN0ZXAnLFxuXHRcdFx0J2NoYW5nZSBpbnB1dFtuYW1lPVwibW9kZVwiXSc6ICdtb2RlQ2hhbmdlZCcsXG5cdFx0XHQna2V5ZG93biBpbnB1dFtuYW1lPVwibmFtZVwiXSc6ICduYW1lQ2hhbmdlZCdcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSggYXJncyApIHtcblx0XHRcdF8uZXh0ZW5kKCB0aGlzLmRhdGEsIGFyZ3MgKTtcblx0XHR9LFxuXG5cdFx0bW9kZUNoYW5nZWQoIGUgKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHR2YWx1ZSA9ICR0aGlzLnZhbCgpO1xuXHRcdFx0dGhpcy5kYXRhLm1vZGUgPSB2YWx1ZTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoICcjaHVzdGxlLXNlbGVjdC1tb2RlJyApLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0fSxcblxuXHRcdG5hbWVDaGFuZ2VkKCBlICkge1xuXHRcdFx0c2V0VGltZW91dCggKCkgPT4ge1xuXHRcdFx0XHR0aGlzLiQoICcuc3VpLWVycm9yLW1lc3NhZ2UnICkuaGlkZSgpO1xuXHRcdFx0XHRsZXQgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRcdHZhbHVlID0gJHRoaXMudmFsKCk7XG5cdFx0XHRcdHRoaXMuZGF0YS5uYW1lID0gdmFsdWU7XG5cdFx0XHRcdGlmICggMCA9PT0gdmFsdWUudHJpbSgpLmxlbmd0aCApIHtcblx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWNyZWF0ZS1tb2R1bGUnICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXHRcdFx0XHRcdHRoaXMuJCggJyNlcnJvci1lbXB0eS1uYW1lJyApLmNsb3Nlc3QoICcuc3VpLWZvcm0tZmllbGQnICkuYWRkQ2xhc3MoICdzdWktZm9ybS1maWVsZC1lcnJvcicgKTtcblx0XHRcdFx0XHR0aGlzLiQoICcjZXJyb3ItZW1wdHktbmFtZScgKS5zaG93KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1jcmVhdGUtbW9kdWxlJyApLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHRcdFx0dGhpcy4kKCAnI2Vycm9yLWVtcHR5LW5hbWUnICkuY2xvc2VzdCggJy5zdWktZm9ybS1maWVsZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1mb3JtLWZpZWxkLWVycm9yJyApO1xuXHRcdFx0XHRcdHRoaXMuJCggJyNlcnJvci1lbXB0eS1uYW1lJyApLmhpZGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMzAwICk7XG5cdFx0fSxcblxuXHRcdG1vZGVTZWxlY3RlZCggZSApIHtcblxuXHRcdFx0Y29uc3QgbmV3TW9kYWxJZCAgICAgICAgPSAnaHVzdGxlLW5ldy1tb2R1bGUtLWNyZWF0ZScsXG5cdFx0XHRcdG5ld0ZvY3VzQWZ0ZXJDbG9zZWQgPSAnaHVzdGxlLWNyZWF0ZS1uZXctbW9kdWxlJyxcblx0XHRcdFx0bmV3Rm9jdXNGaXJzdCAgICAgICA9ICdodXN0bGUtbW9kdWxlLW5hbWUnLFxuXHRcdFx0XHRoYXNPdmVybGF5TWFzayAgICAgID0gZmFsc2Vcblx0XHRcdFx0O1xuXG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnaW5wdXRbbmFtZT1cIm1vZGVcIl06Y2hlY2tlZCcgKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXG5cdFx0XHRpZiAoIDAgPT09IE9iamVjdC5rZXlzKCB0aGlzLmRhdGEgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0U1VJLnJlcGxhY2VNb2RhbCggbmV3TW9kYWxJZCwgbmV3Rm9jdXNBZnRlckNsb3NlZCwgbmV3Rm9jdXNGaXJzdCwgaGFzT3ZlcmxheU1hc2sgKTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0fSxcblxuXHRcdG1heWJlQ3JlYXRlTW9kdWxlKCBlICkge1xuXG5cdFx0XHRpZiAoIDEzID09PSBlLndoaWNoICkgeyAvLyB0aGUgZW50ZXIga2V5IGNvZGVcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWNyZWF0ZS1tb2R1bGUnICkuY2xpY2soKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bWF5YmVNb2RlU2VsZWN0ZWQoIGUgKSB7XG5cblx0XHRcdGlmICggMTMgPT09IGUud2hpY2ggKSB7IC8vIHRoZSBlbnRlciBrZXkgY29kZVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtc2VsZWN0LW1vZGUnICkuY2xpY2soKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z29Ub01vZGVTdGVwKCBlICkge1xuXG5cdFx0XHRjb25zdCBuZXdNb2RhbElkICAgICAgICA9ICdodXN0bGUtbmV3LW1vZHVsZS0tdHlwZScsXG5cdFx0XHRcdG5ld0ZvY3VzQWZ0ZXJDbG9zZWQgPSAnaHVzdGxlLWNyZWF0ZS1uZXctbW9kdWxlJyxcblx0XHRcdFx0bmV3Rm9jdXNGaXJzdCAgICAgICA9ICdodXN0bGUtbmV3LW1vZHVsZS0tdHlwZS1jbG9zZScsXG5cdFx0XHRcdGhhc092ZXJsYXlNYXNrICAgICAgPSBmYWxzZVxuXHRcdFx0XHQ7XG5cblx0XHRcdFNVSS5yZXBsYWNlTW9kYWwoIG5ld01vZGFsSWQsIG5ld0ZvY3VzQWZ0ZXJDbG9zZWQsIG5ld0ZvY3VzRmlyc3QsIGhhc092ZXJsYXlNYXNrICk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdH0sXG5cblx0XHRjcmVhdGVNb2R1bGUoIGUgKSB7XG5cdFx0XHRsZXQgJHN0ZXAgPSAkKCBlLnRhcmdldCApLmNsb3Nlc3QoICcjaHVzdGxlLW5ldy1tb2R1bGUtLWNyZWF0ZScgKSxcblx0XHRcdFx0JGVycm9yU2F2aW5nTWVzc2FnZSA9ICRzdGVwLmZpbmQoICcjZXJyb3Itc2F2aW5nLXNldHRpbmdzJyApLFxuXHRcdFx0XHQkYnV0dG9uID0gJHN0ZXAuZmluZCggJyNodXN0bGUtY3JlYXRlLW1vZHVsZScgKSxcblx0XHRcdFx0bm9uY2UgPSAkc3RlcC5kYXRhKCAnbm9uY2UnICk7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0KCAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMuZGF0YS5tb2RlICYmICdzb2NpYWxfc2hhcmluZycgIT09IHRoaXMuZGF0YS5tb2R1bGVUeXBlICkgfHxcblx0XHRcdFx0J3VuZGVmaW5lZCcgPT09IHR5cGVvZiB0aGlzLmRhdGEubmFtZSB8fCAwID09PSB0aGlzLmRhdGEubmFtZS5sZW5ndGhcblx0XHRcdCkge1xuXHRcdFx0XHQkZXJyb3JTYXZpbmdNZXNzYWdlLnNob3coKTtcblx0XHRcdFx0JGJ1dHRvbi5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdCRlcnJvclNhdmluZ01lc3NhZ2UuaGlkZSgpO1xuXHRcdFx0JGJ1dHRvbi5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdCdtb2R1bGVfbmFtZSc6IHRoaXMuZGF0YS5uYW1lLFxuXHRcdFx0XHRcdFx0J21vZHVsZV9tb2RlJzogdGhpcy5kYXRhLm1vZGUsXG5cdFx0XHRcdFx0XHQnbW9kdWxlX3R5cGUnOiB0aGlzLmRhdGEubW9kdWxlVHlwZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YWN0aW9uOiAnaHVzdGxlX2NyZWF0ZV9uZXdfbW9kdWxlJyxcblx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiBub25jZVxuXHRcdFx0XHR9XG5cblx0XHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXMgKSB7XG5cblx0XHRcdFx0Ly8gR28gdG8gdGhlIHdpemFyZCBvZiB0aGlzIHR5cGUgb2YgbW9kdWxlIG9uIHN1Y2Nlc3MsIG9yIGxpc3RpbmcgcGFnZSBpcyBsaW1pdHMgd2VyZSByZWFjaGVkLlxuXHRcdFx0XHRpZiAoIHJlcyAmJiByZXMuZGF0YSAmJiByZXMuZGF0YS5yZWRpcmVjdF91cmwgKSB7XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnJlcGxhY2UoIHJlcy5kYXRhLnJlZGlyZWN0X3VybCApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRlcnJvclNhdmluZ01lc3NhZ2Uuc2hvdygpO1xuXHRcdFx0XHRcdCRidXR0b24ucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkuZmFpbCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRlcnJvclNhdmluZ01lc3NhZ2Uuc2hvdygpO1xuXHRcdFx0XHQkYnV0dG9uLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNb2RhbHMuSW1wb3J0TW9kdWxlJywgZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRyZXR1cm4gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHRcdGVsOiAnI2h1c3RsZS1kaWFsb2ctLWltcG9ydCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjaGFuZ2UgI2h1c3RsZS1pbXBvcnQtZmlsZS1pbnB1dCc6ICdzZWxlY3RVcGxvYWRGaWxlJyxcblx0XHRcdCdjbGljayAuc3VpLXVwbG9hZC1maWxlJzogJ2NoYW5nZUZpbGUnLFxuXHRcdFx0J2NsaWNrIC5zdWktdXBsb2FkLWZpbGUgYnV0dG9uJzogJ3Jlc2V0VXBsb2FkRmlsZScsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1pbXBvcnQtY2hlY2stYWxsLWNoZWNrYm94JzogJ2NoZWNrQWxsJyxcblx0XHRcdCdjaGFuZ2UgLmh1c3RsZS1tb2R1bGUtbWV0YS1jaGVja2JveCc6ICd1bmNoZWNrQWxsT3B0aW9uJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplKCkge30sXG5cblx0XHRvcGVuKCBlICkge1xuXG5cdFx0XHRjb25zdCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRtb2R1bGVJZCA9ICR0aGlzLmRhdGEoICdtb2R1bGUtaWQnICksXG5cdFx0XHRcdHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtaW1wb3J0LW1vZGFsLW9wdGlvbnMtdHBsJyApLFxuXHRcdFx0XHQkaW1wb3J0RGlhbG9nID0gJCggJyNodXN0bGUtZGlhbG9nLS1pbXBvcnQnICksXG5cdFx0XHRcdCRzdWJtaXRCdXR0b24gPSAkaW1wb3J0RGlhbG9nLmZpbmQoICcjaHVzdGxlLWltcG9ydC1tb2R1bGUtc3VibWl0LWJ1dHRvbicgKSxcblx0XHRcdFx0aXNOZXcgPSAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIG1vZHVsZUlkLFxuXHRcdFx0XHR0ZW1wbGF0ZURhdGEgPSB7XG5cdFx0XHRcdFx0aXNOZXcsXG5cdFx0XHRcdFx0aXNPcHRpbjogJ29wdGluJyA9PT0gJHRoaXMuZGF0YSggJ21vZHVsZS1tb2RlJyApIC8vIEFsd2F5cyBcImZhbHNlXCIgd2hlbiBpbXBvcnRpbmcgaW50byBhIG5ldyBtb2R1bGUuXG5cdFx0XHRcdH07XG5cblx0XHRcdCRpbXBvcnREaWFsb2cuZmluZCggJyNodXN0bGUtaW1wb3J0LW1vZGFsLW9wdGlvbnMnICkuaHRtbCggdGVtcGxhdGUoIHRlbXBsYXRlRGF0YSApICk7XG5cblx0XHRcdGlmICggaXNOZXcgKSB7XG5cdFx0XHRcdCRzdWJtaXRCdXR0b24ucmVtb3ZlQXR0ciggJ2RhdGEtbW9kdWxlLWlkJyApO1xuXG5cdFx0XHRcdC8vIEJpbmQgdGhlIHRhYnMgYWdhaW4gd2l0aCB0aGVpciBTVUkgYWN0aW9ucy5cblx0XHRcdFx0Ly8gT25seSB0aGUgbW9kYWwgZm9yIGltcG9ydGluZyBhIG5ldyBtb2R1bGUgaGFzIHRhYnMuXG5cdFx0XHRcdFNVSS50YWJzKCk7XG5cblx0XHRcdFx0JGltcG9ydERpYWxvZy5maW5kKCAnLnN1aS10YWItaXRlbScgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHRjb25zdCAkdGhpcyA9ICQoIHRoaXMgKSxcblx0XHRcdFx0XHRcdCRyYWRpbyA9ICQoICcjJyArICR0aGlzLmRhdGEoICdsYWJlbC1mb3InICkgKTtcblxuXHRcdFx0XHRcdCRyYWRpby5jbGljaygpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHN1Ym1pdEJ1dHRvbi5hdHRyKCAnZGF0YS1tb2R1bGUtaWQnLCBtb2R1bGVJZCApO1xuXHRcdFx0fVxuXG5cdFx0XHRTVUkub3Blbk1vZGFsKCAnaHVzdGxlLWRpYWxvZy0taW1wb3J0JywgZS5jdXJyZW50VGFyZ2V0LCAnaHVzdGxlLWltcG9ydC1maWxlLWlucHV0JywgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRzZWxlY3RVcGxvYWRGaWxlKCBlICkge1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdHZhbHVlID0gJHRoaXMudmFsKCkucmVwbGFjZSggL0M6XFxcXGZha2VwYXRoXFxcXC9pLCAnJyApO1xuXG5cdFx0XHQvL2hpZGUgcHJldmlvdXMgZXJyb3Jcblx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlSGlkZSggJCggJyNodXN0bGUtZGlhbG9nLS1pbXBvcnQgLnN1aS1ub3RpY2UtZXJyb3InICksIGZhbHNlICk7XG5cblx0XHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHRcdCQoICcuc3VpLXVwbG9hZC1maWxlIHNwYW46Zmlyc3QnICkudGV4dCggdmFsdWUgKTtcblx0XHRcdFx0JCggJy5zdWktdXBsb2FkJyApLmFkZENsYXNzKCAnc3VpLWhhc19maWxlJyApO1xuXHRcdFx0XHQkKCAnI2h1c3RsZS1pbXBvcnQtbW9kdWxlLXN1Ym1pdC1idXR0b24nICkucHJvcCggJ2Rpc2FibGVkJywgZmFsc2UgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoICcuc3VpLXVwbG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1oYXNfZmlsZScgKTtcblx0XHRcdFx0JCggJy5zdWktdXBsb2FkLWZpbGUgc3BhbjpmaXJzdCcgKS50ZXh0KCAnJyApO1xuXHRcdFx0XHQkKCAnI2h1c3RsZS1pbXBvcnQtbW9kdWxlLXN1Ym1pdC1idXR0b24nICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRyZXNldFVwbG9hZEZpbGUoIGUgKSB7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0JCggJyNodXN0bGUtaW1wb3J0LWZpbGUtaW5wdXQnICkudmFsKCAnJyApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0fSxcblxuXHRcdGNoYW5nZUZpbGUoIGUgKSB7XG5cdFx0XHQkKCAnI2h1c3RsZS1pbXBvcnQtZmlsZS1pbnB1dCcgKS50cmlnZ2VyKCAnY2xpY2snICk7XG5cdFx0fSxcblxuXHRcdGNoZWNrQWxsKCBlICkge1xuXHRcdFx0Y29uc3QgJHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0dmFsdWUgPSAkdGhpcy5pcyggJzpjaGVja2VkJyApLFxuXHRcdFx0XHQkY29udGFpbmVyID0gJHRoaXMuY2xvc2VzdCggJy5odWktaW5wdXRzLWxpc3QnICksXG5cdFx0XHRcdCRjaGVja2JveGVzID0gJGNvbnRhaW5lci5maW5kKCAnaW5wdXQuaHVzdGxlLW1vZHVsZS1tZXRhLWNoZWNrYm94Om5vdCguaHVzdGxlLWltcG9ydC1jaGVjay1hbGwtY2hlY2tib3gpJyApO1xuXG5cdFx0XHQkY2hlY2tib3hlcy5wcm9wKCAnY2hlY2tlZCcsIHZhbHVlICk7XG5cdFx0fSxcblxuXHRcdHVuY2hlY2tBbGxPcHRpb24oIGUgKSB7XG5cdFx0XHRjb25zdCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHQkY29udGFpbmVyID0gJHRoaXMuY2xvc2VzdCggJy5odWktaW5wdXRzLWxpc3QnICksXG5cdFx0XHRcdCRhbGxDaGVja2JveCA9ICRjb250YWluZXIuZmluZCggJy5odXN0bGUtaW1wb3J0LWNoZWNrLWFsbC1jaGVja2JveCcgKSxcblx0XHRcdFx0aXNBbGxDaGVja2VkID0gJGFsbENoZWNrYm94LmlzKCAnOmNoZWNrZWQnICk7XG5cblx0XHRcdGlmICggISBpc0FsbENoZWNrZWQgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0JGFsbENoZWNrYm94LnByb3AoICdjaGVja2VkJywgZmFsc2UgKTtcblx0XHR9XG5cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNaXhpbnMuTW9kZWxfVXBkYXRlcicsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblx0J3VzZSBzdHJpY3QnO1xuXHRyZXR1cm4ge1xuXG5cdFx0aW5pdE1peDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV2ZW50cyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmV2ZW50cywgdGhpcy5fZXZlbnRzICk7XG5cdFx0XHR0aGlzLmRlbGVnYXRlRXZlbnRzKCk7XG5cdFx0fSxcblxuXHRcdF9ldmVudHM6IHtcblx0XHRcdCdjaGFuZ2UgdGV4dGFyZWEnOiAnX3VwZGF0ZVRleHQnLFxuXHRcdFx0J2NoYW5nZSBpbnB1dFt0eXBlPVwidGV4dFwiXSc6ICdfdXBkYXRlVGV4dCcsXG5cdFx0XHQnY2hhbmdlIGlucHV0W3R5cGU9XCJ1cmxcIl0nOiAnX3VwZGF0ZVRleHQnLFxuXHRcdFx0J2NoYW5nZSBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdJzogJ191cGRhdGVUZXh0Jyxcblx0XHRcdCdjaGFuZ2UgaW5wdXRbdHlwZT1cIm51bWJlclwiXSc6ICdfdXBkYXRlVGV4dCcsXG5cdFx0XHQnY2hhbmdlIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXSc6ICdfdXBkYXRlQ2hlY2tib3gnLFxuXHRcdFx0J2NoYW5nZSBpbnB1dFt0eXBlPXJhZGlvXSc6ICdfdXBkYXRlUmFkaW9zJyxcblx0XHRcdCdjaGFuZ2Ugc2VsZWN0JzogJ191cGRhdGVTZWxlY3QnXG5cdFx0fSxcblxuXHRcdF91cGRhdGVUZXh0OiBmdW5jdGlvbiggZSApIHtcblx0XHRcdHZhciAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGF0dHIgPSAkdGhpcy5kYXRhKCAnYXR0cmlidXRlJyApLFxuXHRcdFx0XHRtb2RlbCA9IHRoaXNbICR0aGlzLmRhdGEoICdtb2RlbCcgKSB8fCAnbW9kZWwnIF0sXG5cdFx0XHRcdG9wdHMgPSBfLmlzVHJ1ZSggJHRoaXMuZGF0YSggJ3NpbGVudCcgKSApID8geyBzaWxlbnQ6IHRydWUgfSA6IHt9O1xuXHRcdFx0aWYgKCBtb2RlbCAmJiBhdHRyICkge1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRtb2RlbC5zZXQuY2FsbCggbW9kZWwsIGF0dHIsIGUudGFyZ2V0LnZhbHVlLCBvcHRzICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdF91cGRhdGVDaGVja2JveDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRhdHRyID0gJHRoaXMuZGF0YSggJ2F0dHJpYnV0ZScgKSxcblx0XHRcdFx0dmFsdWUgPSAkdGhpcy52YWwoKSxcblx0XHRcdFx0bW9kZWwgPSB0aGlzWyR0aGlzLmRhdGEoICdtb2RlbCcgKSB8fCAnbW9kZWwnXSxcblx0XHRcdFx0b3B0cyA9IF8uaXNUcnVlKCAkdGhpcy5kYXRhKCAnc2lsZW50JyApICkgPyB7IHNpbGVudDogdHJ1ZSB9IDoge307XG5cdFx0XHRpZiAoIG1vZGVsICYmIGF0dHIgKSB7XG5cdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIGNoZWNrYm94ZXMgdmFsdWVzIHNob3VsZCBiZWhhdmUgYXMgYW4gYXJyYXksIGluc3RlYWQgb2YgYXMgYW4gb24vb2ZmIHRvZ2dsZS5cblx0XHRcdFx0aWYgKCAnb24nICE9PSB2YWx1ZSApIHtcblx0XHRcdFx0XHRsZXQgY3VycmVudCA9IG1vZGVsLmdldC5jYWxsKCBtb2RlbCwgYXR0ciApO1xuXHRcdFx0XHRcdGlmICggJHRoaXMuaXMoICc6Y2hlY2tlZCcgKSApIHtcblx0XHRcdFx0XHRcdGN1cnJlbnQucHVzaCggdmFsdWUgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y3VycmVudCA9IF8ud2l0aG91dCggY3VycmVudCwgdmFsdWUgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bW9kZWwuc2V0LmNhbGwoIG1vZGVsLCBhdHRyLCBjdXJyZW50LCBvcHRzICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bW9kZWwuc2V0LmNhbGwoIG1vZGVsLCBhdHRyLCAkdGhpcy5pcyggJzpjaGVja2VkJyApID8gMSA6IDAsIG9wdHMgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfdXBkYXRlUmFkaW9zOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdHZhciAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGF0dHJpYnV0ZSA9ICR0aGlzLmRhdGEoICdhdHRyaWJ1dGUnICksXG5cdFx0XHRcdG1vZGVsID0gdGhpc1skdGhpcy5kYXRhKCAnbW9kZWwnICkgfHwgJ21vZGVsJ10sXG5cdFx0XHRcdG9wdHMgPSBfLmlzVHJ1ZSggJHRoaXMuZGF0YSggJ3NpbGVudCcgKSApID8ge3NpbGVudDogdHJ1ZX0gOiB7fTtcblx0XHRcdGlmICggbW9kZWwgJiYgYXR0cmlidXRlICkge1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRtb2RlbC5zZXQuY2FsbCggbW9kZWwsIGF0dHJpYnV0ZSwgZS50YXJnZXQudmFsdWUsIG9wdHMgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X3VwZGF0ZVNlbGVjdDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRhdHRyID0gJHRoaXMuZGF0YSggJ2F0dHJpYnV0ZScgKSxcblx0XHRcdFx0bW9kZWwgPSB0aGlzWyR0aGlzLmRhdGEoICdtb2RlbCcgKSB8fCAnbW9kZWwnXSxcblx0XHRcdFx0b3B0cyA9IF8uaXNUcnVlKCAkdGhpcy5kYXRhKCAnc2lsZW50JyApICkgPyB7c2lsZW50OiB0cnVlfSA6IHt9O1xuXHRcdFx0aWYgKCBtb2RlbCAmJiBhdHRyICkge1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRtb2RlbC5zZXQuY2FsbCggbW9kZWwsIGF0dHIsICR0aGlzLnZhbCgpLCBvcHRzICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTWl4aW5zLk1vZHVsZV9TZXR0aW5ncycsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS13aXphcmQtYmVoYXZpb3VyJyxcblxuXHRcdGV2ZW50czoge30sXG5cblx0XHRpbml0KCBvcHRzICkge1xuXG5cdFx0XHRjb25zdCBNb2RlbCA9IG9wdHMuQmFzZU1vZGVsLmV4dGVuZCh7XG5cdFx0XHRcdGRlZmF1bHRzOiB7fSxcblx0XHRcdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0Xy5leHRlbmQoIHRoaXMsIGRhdGEgKTtcblxuXHRcdFx0XHRcdGNvbnN0IFRyaWdnZXJzID0gSHVzdGxlLmdldCggJ01vZGVscy5UcmlnZ2VyJyApO1xuXG5cdFx0XHRcdFx0aWYgKCAhICggdGhpcy5nZXQoICd0cmlnZ2VycycgKSBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldCggJ3RyaWdnZXJzJywgbmV3IFRyaWdnZXJzKCB0aGlzLnRyaWdnZXJzICksIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubW9kZWwgPSBuZXcgTW9kZWwoIG9wdGluVmFycy5jdXJyZW50LnNldHRpbmdzIHx8IHt9KTtcblx0XHRcdHRoaXMubW9kdWxlVHlwZSA9IG9wdGluVmFycy5jdXJyZW50LmRhdGEubW9kdWxlX3R5cGU7XG5cblx0XHRcdGNvbnN0IEVkaXRTY2hlZHVsZU1vZGFsVmlldyA9IEh1c3RsZS5nZXQoICdNb2RhbHMuRWRpdFNjaGVkdWxlJyApO1xuXHRcdFx0dGhpcy5lZGl0U2NoZWR1bGVWaWV3ID0gbmV3IEVkaXRTY2hlZHVsZU1vZGFsVmlldyh7XG5cdFx0XHRcdFx0bW9kZWw6IHRoaXMubW9kZWxcblx0XHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLnZpZXdDaGFuZ2VkICk7XG5cdFx0XHRpZiAoICdlbWJlZGRlZCcgIT09IHRoaXMubW9kdWxlVHlwZSApIHtcblx0XHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbC5nZXQoICd0cmlnZ2VycycgKSwgJ2NoYW5nZScsIHRoaXMudmlld0NoYW5nZWQgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2FsbGVkIGp1c3QgdG8gdHJpZ2dlciB0aGUgXCJ2aWV3LnJlbmRlcmVkXCIgYWN0aW9uLlxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyKCkge1xuXHRcdFx0dGhpcy5yZW5kZXJTY2hlZHVsZVNlY3Rpb24oKTtcblx0XHRcdHRoaXMuZWRpdFNjaGVkdWxlVmlldy5vbiggJ3NjaGVkdWxlOnVwZGF0ZWQnLCAkLnByb3h5KCB0aGlzLnJlbmRlclNjaGVkdWxlU2VjdGlvbiwgdGhpcyApICk7XG5cdFx0fSxcblxuXHRcdHJlbmRlclNjaGVkdWxlU2VjdGlvbigpIHtcblxuXHRcdFx0bGV0IHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtc2NoZWR1bGUtcm93LXRwbCcgKSxcblx0XHRcdFx0JGNvbnRhaW5lciA9ICQoICcjaHVzdGxlLXNjaGVkdWxlLXJvdycgKSxcblx0XHRcdFx0c2NoZWR1bGVTZXR0aW5ncyA9IHRoaXMubW9kZWwuZ2V0KCAnc2NoZWR1bGUnICksXG5cdFx0XHRcdGhhc0ZpbmlzaGVkID0gZmFsc2UsXG5cdFx0XHRcdGRhdGEgPSBPYmplY3QuYXNzaWduKHt9LCBzY2hlZHVsZVNldHRpbmdzICksXG5cdFx0XHRcdHN0cmluZ3MgPSB7XG5cdFx0XHRcdFx0c3RhcnREYXRlOiAnJyxcblx0XHRcdFx0XHRzdGFydFRpbWU6ICcnLFxuXHRcdFx0XHRcdGVuZERhdGU6ICcnLFxuXHRcdFx0XHRcdGVuZFRpbWU6ICcnLFxuXHRcdFx0XHRcdGFjdGl2ZURheXM6ICcnLFxuXHRcdFx0XHRcdGFjdGl2ZVRpbWU6ICcnXG5cdFx0XHRcdH07XG5cblx0XHRcdGRhdGEuaXNfc2NoZWR1bGUgPSB0aGlzLm1vZGVsLmdldCggJ2lzX3NjaGVkdWxlJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXG5cdFx0XHQvLyBIZXJlIHdlJ2xsIGJ1aWxkIHRoZSBzdHJpbmdzIGRlcGVuZGVudCBvbiB0aGUgc2VsZWN0ZWQgc2V0dGluZ3MuIFNraXAgaWYgc2NoZWR1bGluZyBpcyBkaXNhYmxlZC5cblx0XHRcdGlmICggZGF0YS5pc19zY2hlZHVsZSApIHtcblxuXHRcdFx0XHQvLyBUcmFuc2xhdGVkIG1vbnRocyBhbmQgJ0FNL1BNJyBzdHJpbmdzLlxuXHRcdFx0XHRjb25zdCBtb250aHMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpblZhcnMuY3VycmVudC5zY2hlZHVsZV9zdHJpbmdzLm1vbnRocyApLFxuXHRcdFx0XHRcdG1lcmlkaWVtID0gb3B0aW5WYXJzLmN1cnJlbnQuc2NoZWR1bGVfc3RyaW5ncy5tZXJpZGllbTtcblxuXHRcdFx0XHQvLyBTY2hlZHVsZSBzdGFydCBzdHJpbmcuIFNraXAgaWYgZGlzYWJsZWQuXG5cdFx0XHRcdGlmICggJzAnID09PSBkYXRhLm5vdF9zY2hlZHVsZV9zdGFydCApIHtcblxuXHRcdFx0XHRcdGNvbnN0IHN0cmluZ0RhdGUgPSBkYXRhLnN0YXJ0X2RhdGUuc3BsaXQoICcvJyApLFxuXHRcdFx0XHRcdFx0bW9udGggPSBtb250aHNbICggc3RyaW5nRGF0ZVswXSAtIDEgKSBdLFxuXHRcdFx0XHRcdFx0YW1wbSA9IG1lcmlkaWVtWyBkYXRhLnN0YXJ0X21lcmlkaWVtX29mZnNldCBdO1xuXG5cdFx0XHRcdFx0c3RyaW5ncy5zdGFydERhdGUgPSBgJHsgc3RyaW5nRGF0ZVsxXSB9ICR7IG1vbnRoIH0gJHsgc3RyaW5nRGF0ZVsyXSB9YDtcblx0XHRcdFx0XHRzdHJpbmdzLnN0YXJ0VGltZSA9IGAoJHsgZGF0YS5zdGFydF9ob3VyIH06JHsgZGF0YS5zdGFydF9taW51dGUgfSAkeyBhbXBtIH0pYDtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2NoZWR1bGUgZW5kIHN0cmluZy4gU2tpcCBpZiBkaXNhYmxlZC5cblx0XHRcdFx0aWYgKCAnMCcgPT09IGRhdGEubm90X3NjaGVkdWxlX2VuZCApIHtcblxuXHRcdFx0XHRcdGNvbnN0IHN0cmluZ0RhdGUgPSBkYXRhLmVuZF9kYXRlLnNwbGl0KCAnLycgKSxcblx0XHRcdFx0XHRcdG1vbnRoID0gbW9udGhzWyAoIHN0cmluZ0RhdGVbMF0gLSAxICkgXSxcblx0XHRcdFx0XHRcdGFtcG0gPSBtZXJpZGllbVsgZGF0YS5lbmRfbWVyaWRpZW1fb2Zmc2V0IF07XG5cblx0XHRcdFx0XHRzdHJpbmdzLmVuZERhdGUgPSBgJHsgc3RyaW5nRGF0ZVsxXSB9ICR7IG1vbnRoIH0gJHsgc3RyaW5nRGF0ZVsyXSB9YDtcblx0XHRcdFx0XHRzdHJpbmdzLmVuZFRpbWUgPSBgKCR7IGRhdGEuZW5kX2hvdXIgfTokeyBkYXRhLmVuZF9taW51dGUgfSAkeyBhbXBtIH0pYDtcblxuXHRcdFx0XHRcdGhhc0ZpbmlzaGVkID0gdGhpcy5pc1NjaGVkdWxlRmluaXNoZWQoIGRhdGEgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNlbGVjdGVkIHdlZWtkYXlzIHN0cmluZy4gU2tpcCBpZiAnZXZlcnkgZGF5JyBpcyBzZWxlY3RlZC5cblx0XHRcdFx0aWYgKCAnd2Vla19kYXlzJyA9PT0gZGF0YS5hY3RpdmVfZGF5cyApIHtcblxuXHRcdFx0XHRcdGNvbnN0IHdlZWtEYXlzID0gb3B0aW5WYXJzLmN1cnJlbnQuc2NoZWR1bGVfc3RyaW5ncy53ZWVrX2RheXMsXG5cdFx0XHRcdFx0XHRkYXlzID0gZGF0YS53ZWVrX2RheXMubWFwKCBkYXkgPT4gd2Vla0RheXNbIGRheSBdLnRvVXBwZXJDYXNlKCkgKTtcblxuXHRcdFx0XHRcdHN0cmluZ3MuYWN0aXZlRGF5cyA9IGRheXMuam9pbiggJywgJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUGVyIGRheSBzdGFydCBhbmQgZW5kIHN0cmluZy4gU2tpcCBpZiAnZHVyaW5nIGFsbCBkYXknIGlzIGVuYWJsZWQuXG5cdFx0XHRcdGlmICggJzAnID09PSBkYXRhLmlzX2FjdGl2ZV9hbGxfZGF5ICkge1xuXG5cdFx0XHRcdFx0Y29uc3Qgc3RhcnRBbXBtID0gbWVyaWRpZW1bIGRhdGEuZGF5X3N0YXJ0X21lcmlkaWVtX29mZnNldCBdLFxuXHRcdFx0XHRcdFx0ZW5kQW1wbSA9IG1lcmlkaWVtWyBkYXRhLmRheV9lbmRfbWVyaWRpZW1fb2Zmc2V0IF0sXG5cdFx0XHRcdFx0XHRkYXlTdGFydCA9IGAkeyBkYXRhLmRheV9zdGFydF9ob3VyIH06JHsgZGF0YS5kYXlfc3RhcnRfbWludXRlIH0gJHsgc3RhcnRBbXBtIH1gLFxuXHRcdFx0XHRcdFx0ZGF5RW5kID0gYCR7IGRhdGEuZGF5X2VuZF9ob3VyIH06JHsgZGF0YS5kYXlfZW5kX21pbnV0ZSB9ICR7IGVuZEFtcG0gfWA7XG5cblx0XHRcdFx0XHRzdHJpbmdzLmFjdGl2ZVRpbWUgPSBkYXlTdGFydCArICcgLSAnICsgZGF5RW5kO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEuc3RyaW5ncyA9IHN0cmluZ3M7XG5cdFx0XHRkYXRhLmhhc0ZpbmlzaGVkID0gaGFzRmluaXNoZWQ7XG5cdFx0XHQkY29udGFpbmVyLmh0bWwoIHRlbXBsYXRlKCBkYXRhICkgKTtcblxuXHRcdFx0JGNvbnRhaW5lci5maW5kKCAnLmh1c3RsZS1idXR0b24tb3Blbi1zY2hlZHVsZS1kaWFsb2cnICkub24oICdjbGljaycsICgpID0+IHRoaXMuZWRpdFNjaGVkdWxlVmlldy5vcGVuKCkgKTtcblx0XHR9LFxuXG5cdFx0aXNTY2hlZHVsZUZpbmlzaGVkKCBzZXR0aW5ncyApIHtcblxuXHRcdFx0Y29uc3QgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXHRcdFx0bGV0IHsgdGltZV90b191c2U6IHRpbWVUb1VzZSwgZW5kX2RhdGU6IGRhdGUsIGVuZF9ob3VyOiBob3VyLCBlbmRfbWludXRlOiBtaW51dGUsIGVuZF9tZXJpZGllbV9vZmZzZXQ6IGFtcG0gfSA9IHNldHRpbmdzLFxuXHRcdFx0XHRkYXRlU3RyaW5nID0gYCR7IGRhdGUgfSAkeyBob3VyIH06JHsgbWludXRlIH0gJHsgYW1wbSB9YCxcblx0XHRcdFx0ZW5kVGltZXN0YW1wID0gZmFsc2UsXG5cdFx0XHRcdHV0Y09mZnNldCA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoICdzZXJ2ZXInID09PSB0aW1lVG9Vc2UgKSB7XG5cdFx0XHRcdHV0Y09mZnNldCA9IG9wdGluVmFycy50aW1lLndwX2dtdF9vZmZzZXQ7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Y29uc3QgY3VzdG9tVGltZXpvbmUgPSBzZXR0aW5ncy5jdXN0b21fdGltZXpvbmU7XG5cblx0XHRcdFx0Ly8gSXQncyB1c2luZyBhIG1hbnVhbCBVVEMgb2Zmc2V0LlxuXHRcdFx0XHRpZiAoIGN1c3RvbVRpbWV6b25lLmluY2x1ZGVzKCAnVVRDJyApICkge1xuXG5cdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWRPZmZzZXQgPSBjdXN0b21UaW1lem9uZS5yZXBsYWNlKCAnVVRDJywgJycgKTtcblxuXHRcdFx0XHRcdC8vIFRoZXJlJ3MgYSB0aW1lem9uZSB3aXRoIHRoZSB2YWx1ZSBcIlVUQ1wiLlxuXHRcdFx0XHRcdHV0Y09mZnNldCA9IHNlbGVjdGVkT2Zmc2V0Lmxlbmd0aCA/IHBhcnNlRmxvYXQoIHNlbGVjdGVkT2Zmc2V0ICkgOiAwO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgZW5kTW9tZW50ID0gbW9tZW50LnR6KCBkYXRlU3RyaW5nLCAnTU0vREQvWVlZWSBoaDptbSBhYScsIGN1c3RvbVRpbWV6b25lICk7XG5cdFx0XHRcdFx0ZW5kVGltZXN0YW1wID0gZW5kTW9tZW50LmZvcm1hdCggJ3gnICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIHRoZSB0aW1lc3RhbXAgd2l0aCB0aGUgbWFudWFsIG9mZnNldC5cblx0XHRcdGlmICggZmFsc2UgPT09IGVuZFRpbWVzdGFtcCAmJiBmYWxzZSAhPT0gdXRjT2Zmc2V0ICkge1xuXG5cdFx0XHRcdGxldCBvZmZzZXQgPSA2MCAqIHV0Y09mZnNldCxcblx0XHRcdFx0XHRzaWduID0gMCA8IG9mZnNldCA/ICcrJyA6ICctJyxcblx0XHRcdFx0XHRhYnMgPSBNYXRoLmFicyggb2Zmc2V0ICksXG5cdFx0XHRcdFx0Zm9ybWF0dGVkT2Zmc2V0ID0gc3ByaW50ZiggJyVzJTAyZDolMDJkJywgc2lnbiwgYWJzIC8gNjAsIGFicyAlIDYwICk7O1xuXG5cdFx0XHRcdGNvbnN0IGVuZE1vbWVudCA9IG1vbWVudC5wYXJzZVpvbmUoIGRhdGVTdHJpbmcgKyAnICcgKyBmb3JtYXR0ZWRPZmZzZXQsICdNTS9ERC9ZWVlZIGhoOm1tIGEgWicgKTtcblx0XHRcdFx0ZW5kVGltZXN0YW1wID0gZW5kTW9tZW50LmZvcm1hdCggJ3gnICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENoZWNrIGlmIHRoZSBlbmQgdGltZSBhbHJlYWR5IHBhc3NlZC5cblx0XHRcdGlmICggY3VycmVudFRpbWUgPiBlbmRUaW1lc3RhbXAgKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cblx0XHR2aWV3Q2hhbmdlZDogZnVuY3Rpb24oIG1vZGVsICkge1xuXG5cdFx0XHR2YXIgY2hhbmdlZCA9IG1vZGVsLmNoYW5nZWQ7XG5cblx0XHRcdGlmICggJ29uX3Njcm9sbCcgaW4gY2hhbmdlZCApIHtcblx0XHRcdFx0bGV0ICRzY3JvbGxlZENvbnRlbnREaXYgPSB0aGlzLiQoICcjaHVzdGxlLW9uLXNjcm9sbC0tc2Nyb2xsZWQtdG9nZ2xlLXdyYXBwZXInICksXG5cdFx0XHRcdFx0JHNlbGVjdG9yQ29udGVudERpdiA9IHRoaXMuJCggJyNodXN0bGUtb24tc2Nyb2xsLS1zZWxlY3Rvci10b2dnbGUtd3JhcHBlcicgKTtcblxuXHRcdFx0XHRpZiAoICRzY3JvbGxlZENvbnRlbnREaXYubGVuZ3RoIHx8ICRzZWxlY3RvckNvbnRlbnREaXYubGVuZ3RoICkge1xuXHRcdFx0XHRcdGlmICggJ3Njcm9sbGVkJyA9PT0gY2hhbmdlZC5vbl9zY3JvbGwgKSB7XG5cdFx0XHRcdFx0XHQkc2Nyb2xsZWRDb250ZW50RGl2LnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdCRzZWxlY3RvckNvbnRlbnREaXYuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkc2VsZWN0b3JDb250ZW50RGl2LnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdCRzY3JvbGxlZENvbnRlbnREaXYuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdvbl9zdWJtaXQnIGluIGNoYW5nZWQgKSB7XG5cdFx0XHRcdGxldCAkdG9nZ2xlRGl2ID0gdGhpcy4kKCAnI2h1c3RsZS1vbi1zdWJtaXQtZGVsYXktd3JhcHBlcicgKTtcblx0XHRcdFx0aWYgKCAkdG9nZ2xlRGl2Lmxlbmd0aCApIHtcblx0XHRcdFx0XHRpZiAoICdub3RoaW5nJyAhPT0gY2hhbmdlZC5vbl9zdWJtaXQgKSB7XG5cdFx0XHRcdFx0XHQkdG9nZ2xlRGl2LnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JHRvZ2dsZURpdi5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9KTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ01peGlucy5Nb2R1bGVfQ29udGVudCcsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS13aXphcmQtY29udGVudCcsXG5cblx0XHRldmVudHM6IHt9LFxuXG5cdFx0aW5pdCggb3B0cyApIHtcblx0XHRcdHRoaXMubW9kZWwgPSBuZXcgb3B0cy5CYXNlTW9kZWwoIG9wdGluVmFycy5jdXJyZW50LmNvbnRlbnQgfHwge30pO1xuXHRcdFx0dGhpcy5tb2R1bGVUeXBlICA9IG9wdGluVmFycy5jdXJyZW50LmRhdGEubW9kdWxlX3R5cGU7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLm1vZGVsVXBkYXRlZCApO1xuXG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0sXG5cblx0XHRyZW5kZXIoKSB7XG5cblx0XHRcdHRoaXMucmVuZGVyRmVhdHVyZWRJbWFnZSgpO1xuXG5cdFx0XHRpZiAoICd0cnVlJyA9PT0gIE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ25ldycgKSApIHtcblx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnc3VjY2VzcycsIG9wdGluVmFycy5tZXNzYWdlcy5jb21tb25zLm1vZHVsZV9jcmVhdGVkLnJlcGxhY2UoIC97dHlwZV9uYW1lfS9nLCBvcHRpblZhcnMubW9kdWxlX25hbWVbIHRoaXMubW9kdWxlVHlwZSBdKSwgMTAwMDAgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cmVuZGVyRmVhdHVyZWRJbWFnZSgpIHtcblxuXHRcdFx0aWYgKCAhIHRoaXMuJCggJyN3cGgtd2l6YXJkLWNob29zZV9pbWFnZScgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgTWVkaWFIb2xkZXIgPSBIdXN0bGUuZ2V0KCAnRmVhdHVyZWRfSW1hZ2VfSG9sZGVyJyApO1xuXHRcdFx0dGhpcy5tZWRpYUhvbGRlciA9IG5ldyBNZWRpYUhvbGRlcih7XG5cdFx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsLFxuXHRcdFx0XHRhdHRyaWJ1dGU6ICdmZWF0dXJlX2ltYWdlJyxcblx0XHRcdFx0bW9kdWxlVHlwZTogdGhpcy5tb2R1bGVUeXBlXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0bW9kZWxVcGRhdGVkKCBtb2RlbCApIHtcblx0XHRcdGxldCBjaGFuZ2VkID0gbW9kZWwuY2hhbmdlZDtcblxuXHRcdFx0Ly8gVXBkYXRlIG1vZHVsZV9uYW1lIGZyb20gdGhlIG1vZGVsIHdoZW4gY2hhbmdlZC5cblx0XHRcdGlmICggJ21vZHVsZV9uYW1lJyBpbiBjaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ21vZHVsZV9uYW1lJywgY2hhbmdlZC5tb2R1bGVfbmFtZSwgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoICdmZWF0dXJlX2ltYWdlJyBpbiBjaGFuZ2VkICkge1xuXG5cdFx0XHRcdC8vIFVwbG9hZGluZyBhIGZlYXR1cmVkIGltYWdlIG1ha2VzIHRoZSBcIkZlYXR1cmVkIEltYWdlIHNldHRpbmdzXCIgc2hvdyB1cCBpbiB0aGUgXCJBcHBlYXJhbmNlXCIgdGFiLlxuXHRcdFx0XHRIdXN0bGUuRXZlbnRzLnRyaWdnZXIoICdtb2R1bGVzLnZpZXcuZmVhdHVyZV9pbWFnZV91cGRhdGVkJywgY2hhbmdlZCApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNaXhpbnMuTW9kdWxlX0Rlc2lnbicsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS13aXphcmQtYXBwZWFyYW5jZScsXG5cblx0XHRjc3NFZGl0b3I6IGZhbHNlLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jc3Mtc3R5bGFibGUnOiAnaW5zZXJ0U2VsZWN0b3InLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtcmVzZXQtY29sb3ItcGFsZXR0ZSc6ICdyZXNldFBpY2tlcnMnXG5cdFx0fSxcblxuXHRcdGluaXQoIG9wdHMgKSB7XG5cblx0XHRcdHRoaXMubW9kZWwgPSBuZXcgb3B0cy5CYXNlTW9kZWwoIG9wdGluVmFycy5jdXJyZW50LmRlc2lnbiB8fCB7fSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLnZpZXdDaGFuZ2VkICk7XG5cblx0XHRcdC8vIFVwZGF0ZSB0aGUgQXBwZWFyYW5jZSB0YWIgdmlldyB3aGVuIFwiRmVhdHVyZSBpbWFnZVwiIGlzIGNoYW5nZWQgaW4gdGhlIENvbnRlbnQgdGFiLlxuXHRcdFx0SHVzdGxlLkV2ZW50cy5vZmYoICdtb2R1bGVzLnZpZXcuZmVhdHVyZV9pbWFnZV91cGRhdGVkJyApLm9uKCAnbW9kdWxlcy52aWV3LmZlYXR1cmVfaW1hZ2VfdXBkYXRlZCcsICQucHJveHkoIHRoaXMuVmlld0NoYW5nZWRDb250ZW50VGFiLCB0aGlzICkgKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyKCkge1xuXG5cdFx0XHR0aGlzLmNyZWF0ZVBpY2tlcnMoKTtcblx0XHRcdHRoaXMuYWRkQ3JlYXRlUGFsZXR0ZXNMaW5rKCk7XG5cblx0XHRcdHRoaXMuY3JlYXRlRWRpdG9yKCk7XG5cdFx0XHR0aGlzLmNzc0NoYW5nZSgpO1xuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBDb2xvciBQaWNrZXJzXG5cdFx0Y3JlYXRlUGlja2VyczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0JHN1aVBpY2tlcklucHV0cyA9IHRoaXMuJCggJy5zdWktY29sb3JwaWNrZXItaW5wdXQnICk7XG5cblx0XHRcdCRzdWlQaWNrZXJJbnB1dHMud3BDb2xvclBpY2tlcih7XG5cblx0XHRcdFx0Y2hhbmdlOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0XHRcdHZhciAkdGhpcyA9ICQoIHRoaXMgKTtcblxuXHRcdFx0XHRcdC8vIFByZXZlbnQgdGhlIG1vZGVsIGZyb20gYmVpbmcgbWFya2VkIGFzIGNoYW5nZWQgb24gbG9hZC5cblx0XHRcdFx0XHRpZiAoICR0aGlzLnZhbCgpICE9PSB1aS5jb2xvci50b0NTUygpICkge1xuXHRcdFx0XHRcdFx0JHRoaXMudmFsKCB1aS5jb2xvci50b0NTUygpICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhbGV0dGVzOiBbXG5cdFx0XHRcdFx0JyMzMzMzMzMnLFxuXHRcdFx0XHRcdCcjRkZGRkZGJyxcblx0XHRcdFx0XHQnIzE3QThFMycsXG5cdFx0XHRcdFx0JyNFMUY2RkYnLFxuXHRcdFx0XHRcdCcjNjY2NjY2Jyxcblx0XHRcdFx0XHQnI0FBQUFBQScsXG5cdFx0XHRcdFx0JyNFNkU2RTYnXG5cdFx0XHRcdF1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoICRzdWlQaWNrZXJJbnB1dHMuaGFzQ2xhc3MoICd3cC1jb2xvci1waWNrZXInICkgKSB7XG5cblx0XHRcdFx0JHN1aVBpY2tlcklucHV0cy5lYWNoKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdHZhciAkc3VpUGlja2VySW5wdXQgPSAkKCB0aGlzICksXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyICAgICAgPSAkc3VpUGlja2VySW5wdXQuY2xvc2VzdCggJy5zdWktY29sb3JwaWNrZXItd3JhcCcgKSxcblx0XHRcdFx0XHRcdCRzdWlQaWNrZXJDb2xvciA9ICRzdWlQaWNrZXIuZmluZCggJy5zdWktY29sb3JwaWNrZXItdmFsdWUgc3Bhbltyb2xlPWJ1dHRvbl0nICksXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyVmFsdWUgPSAkc3VpUGlja2VyLmZpbmQoICcuc3VpLWNvbG9ycGlja2VyLXZhbHVlJyApLFxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlckNsZWFyID0gJHN1aVBpY2tlclZhbHVlLmZpbmQoICdidXR0b24nICksXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyVHlwZSAgPSAnaGV4J1xuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0dmFyICR3cFBpY2tlciAgICAgICA9ICRzdWlQaWNrZXJJbnB1dC5jbG9zZXN0KCAnLndwLXBpY2tlci1jb250YWluZXInICksXG5cdFx0XHRcdFx0XHQkd3BQaWNrZXJCdXR0b24gPSAkd3BQaWNrZXIuZmluZCggJy53cC1jb2xvci1yZXN1bHQnICksXG5cdFx0XHRcdFx0XHQkd3BQaWNrZXJBbHBoYSAgPSAkd3BQaWNrZXJCdXR0b24uZmluZCggJy5jb2xvci1hbHBoYScgKSxcblx0XHRcdFx0XHRcdCR3cFBpY2tlckNsZWFyICA9ICR3cFBpY2tlci5maW5kKCAnLndwLXBpY2tlci1jbGVhcicgKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgYWxwaGEgZXhpc3RzXG5cdFx0XHRcdFx0aWYgKCB0cnVlID09PSAkc3VpUGlja2VySW5wdXQuZGF0YSggJ2FscGhhJyApICkge1xuXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyVHlwZSA9ICdyZ2JhJztcblxuXHRcdFx0XHRcdFx0Ly8gTGlzdGVuIHRvIGNvbG9yIGNoYW5nZVxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlcklucHV0LmJpbmQoICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBDaGFuZ2UgY29sb3IgcHJldmlld1xuXHRcdFx0XHRcdFx0XHQkc3VpUGlja2VyQ29sb3IuZmluZCggJ3NwYW4nICkuY3NzKHtcblx0XHRcdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICR3cFBpY2tlckFscGhhLmNzcyggJ2JhY2tncm91bmQnIClcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ2hhbmdlIGNvbG9yIHZhbHVlXG5cdFx0XHRcdFx0XHRcdCRzdWlQaWNrZXJWYWx1ZS5maW5kKCAnaW5wdXQnICkudmFsKCAkc3VpUGlja2VySW5wdXQudmFsKCkgKTtcblxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHQvLyBMaXN0ZW4gdG8gY29sb3IgY2hhbmdlXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VySW5wdXQuYmluZCggJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIENoYW5nZSBjb2xvciBwcmV2aWV3XG5cdFx0XHRcdFx0XHRcdCRzdWlQaWNrZXJDb2xvci5maW5kKCAnc3BhbicgKS5jc3Moe1xuXHRcdFx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogJHdwUGlja2VyQnV0dG9uLmNzcyggJ2JhY2tncm91bmQtY29sb3InIClcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ2hhbmdlIGNvbG9yIHZhbHVlXG5cdFx0XHRcdFx0XHRcdCRzdWlQaWNrZXJWYWx1ZS5maW5kKCAnaW5wdXQnICkudmFsKCAkc3VpUGlja2VySW5wdXQudmFsKCkgKTtcblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQWRkIHBpY2tlciB0eXBlIGNsYXNzXG5cdFx0XHRcdFx0JHN1aVBpY2tlci5maW5kKCAnLnN1aS1jb2xvcnBpY2tlcicgKS5hZGRDbGFzcyggJ3N1aS1jb2xvcnBpY2tlci0nICsgJHN1aVBpY2tlclR5cGUgKTtcblxuXHRcdFx0XHRcdC8vIE9wZW4gaXJpcyBwaWNrZXJcblx0XHRcdFx0XHQkc3VpUGlja2VyLmZpbmQoICcuc3VpLWJ1dHRvbiwgc3Bhbltyb2xlPWJ1dHRvbl0nICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHRcdFx0XHQkd3BQaWNrZXJCdXR0b24uY2xpY2soKTtcblxuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly8gQ2xlYXIgY29sb3IgdmFsdWVcblx0XHRcdFx0XHQkc3VpUGlja2VyQ2xlYXIub24oICdjbGljaycsIGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHRcdFx0XHRsZXQgaW5wdXROYW1lID0gJHN1aVBpY2tlcklucHV0LmRhdGEoICdhdHRyaWJ1dGUnICksXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkU3R5bGUgPSBzZWxmLm1vZGVsLmdldCggJ2NvbG9yX3BhbGV0dGUnICksXG5cdFx0XHRcdFx0XHRcdHJlc2V0VmFsdWUgPSBvcHRpblZhcnMucGFsZXR0ZXNbIHNlbGVjdGVkU3R5bGUgXVsgaW5wdXROYW1lIF07XG5cblx0XHRcdFx0XHRcdCR3cFBpY2tlckNsZWFyLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyVmFsdWUuZmluZCggJ2lucHV0JyApLnZhbCggcmVzZXRWYWx1ZSApO1xuXHRcdFx0XHRcdFx0JHN1aVBpY2tlcklucHV0LnZhbCggcmVzZXRWYWx1ZSApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyQ29sb3IuZmluZCggJ3NwYW4nICkuY3NzKHtcblx0XHRcdFx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiByZXNldFZhbHVlXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dXBkYXRlUGlja2VyczogZnVuY3Rpb24oIHNlbGVjdGVkU3R5bGUgKSB7XG5cblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG9wdGluVmFycy5wYWxldHRlc1sgc2VsZWN0ZWRTdHlsZSBdKSB7XG5cblx0XHRcdFx0bGV0IGNvbG9ycyA9IG9wdGluVmFycy5wYWxldHRlc1sgc2VsZWN0ZWRTdHlsZSBdO1xuXG5cdFx0XHRcdC8vIHVwZGF0ZSBjb2xvciBwYWxldHRlc1xuXHRcdFx0XHRfLmVhY2goIGNvbG9ycywgZnVuY3Rpb24oIGNvbG9yLCBrZXkgKSB7XG5cdFx0XHRcdFx0c2VsZi4kKCAnaW5wdXRbZGF0YS1hdHRyaWJ1dGU9XCInICsga2V5ICsgJ1wiXScgKS52YWwoIGNvbG9yICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRPRE86IGVsc2UsIGRpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZS5cblx0XHR9LFxuXG5cdFx0cmVzZXRQaWNrZXJzOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGxldCAkZWwgPSAkKCBlLnRhcmdldCApO1xuXHRcdFx0JGVsLmFkZENsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG5cdFx0XHRsZXQgc3R5bGUgPSAkKCAnc2VsZWN0W2RhdGEtYXR0cmlidXRlPVwiY29sb3JfcGFsZXR0ZVwiXScgKS52YWwoKTtcblx0XHRcdHRoaXMudXBkYXRlUGlja2Vycyggc3R5bGUgKTtcblxuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRlbC5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHR9LCA1MDAgKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQWRkIHRoZSBcIkNyZWF0ZSBjdXN0b20gcGFsZXR0ZSBidXR0b25cIiB0byB0aGUgZXhpc3RpbmcgcGFsZXR0ZXMgZHJvcGRvd24uXG5cdFx0ICogQHNpbmNlIDQuMC4zXG5cdFx0ICovXG5cdFx0YWRkQ3JlYXRlUGFsZXR0ZXNMaW5rKCkge1xuXG5cdFx0XHRjb25zdCAkbGluayA9IHRoaXMuJCggJyNodXN0bGUtY3JlYXRlLXBhbGV0dGUtbGluaycgKSxcblx0XHRcdFx0JHNlbGVjdFBhbGV0dGVDb250YWluZXIgPSB0aGlzLiQoICcuc2VsZWN0LWNvbnRhaW5lci5odWktc2VsZWN0LXBhbGV0dGUgLmxpc3QtcmVzdWx0cycgKSxcblx0XHRcdFx0JHNlbGVjdEJ1dHRvbiA9ICRzZWxlY3RQYWxldHRlQ29udGFpbmVyLmZpbmQoICcuaHVpLWJ1dHRvbicgKTtcblxuXHRcdFx0aWYgKCAhICRzZWxlY3RCdXR0b24ubGVuZ3RoICkge1xuXHRcdFx0XHQkc2VsZWN0UGFsZXR0ZUNvbnRhaW5lci5hcHBlbmQoICRsaW5rICk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0Ly8gQ1NTIEVkaXRvclxuXHRcdGNyZWF0ZUVkaXRvcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuY3NzRWRpdG9yID0gYWNlLmVkaXQoICdodXN0bGVfY3VzdG9tX2NzcycgKTtcblxuXHRcdFx0dGhpcy5jc3NFZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoICdhY2UvbW9kZS9jc3MnICk7XG5cdFx0XHR0aGlzLmNzc0VkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLnNldFRoZW1lKCAnYWNlL3RoZW1lL3N1aScgKTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLmdldFNlc3Npb24oKS5zZXRVc2VXcmFwTW9kZSggdHJ1ZSApO1xuXHRcdFx0dGhpcy5jc3NFZGl0b3IuZ2V0U2Vzc2lvbigpLnNldFVzZVdvcmtlciggZmFsc2UgKTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLnNldFNob3dQcmludE1hcmdpbiggZmFsc2UgKTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLnJlbmRlcmVyLnNldFNob3dHdXR0ZXIoIHRydWUgKTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLnNldEhpZ2hsaWdodEFjdGl2ZUxpbmUoIHRydWUgKTtcblxuXHRcdH0sXG5cblx0XHR1cGRhdGVDdXN0b21Dc3M6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZiAoIHRoaXMuY3NzRWRpdG9yICkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ2N1c3RvbV9jc3MnLCB0aGlzLmNzc0VkaXRvci5nZXRWYWx1ZSgpICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNzc0NoYW5nZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR0aGlzLmNzc0VkaXRvci5nZXRTZXNzaW9uKCkub24oICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5tb2RlbC51c2VySGFzQ2hhbmdlKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0aW5zZXJ0U2VsZWN0b3I6IGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHR2YXIgJGVsID0gJCggZS50YXJnZXQgKSxcblx0XHRcdFx0c3R5bGFibGUgPSAkZWwuZGF0YSggJ3N0eWxhYmxlJyApICsgJ3t9JztcblxuXHRcdFx0dGhpcy5jc3NFZGl0b3IubmF2aWdhdGVGaWxlRW5kKCk7XG5cdFx0XHR0aGlzLmNzc0VkaXRvci5pbnNlcnQoIHN0eWxhYmxlICk7XG5cdFx0XHR0aGlzLmNzc0VkaXRvci5uYXZpZ2F0ZUxlZnQoIDEgKTtcblx0XHRcdHRoaXMuY3NzRWRpdG9yLmZvY3VzKCk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBBZGp1c3QgdGhlIHZpZXcgd2hlbiBtb2RlbCBpcyB1cGRhdGVkXG5cdFx0dmlld0NoYW5nZWQ6IGZ1bmN0aW9uKCBtb2RlbCApIHtcblxuXHRcdFx0bGV0IGNoYW5nZWQgPSBtb2RlbC5jaGFuZ2VkO1xuXG5cdFx0XHQvLyBTaG93IG9yIGhpZGUgdGhlIHBvc2l0aW9ucyBhdmFpbGFibGUgZm9yIGVhY2ggZm9ybSBsYXlvdXQuXG5cdFx0XHRpZiAoICdmb3JtX2xheW91dCcgaW4gY2hhbmdlZCApIHtcblxuXHRcdFx0XHRsZXQgJGRpdlNlY3Rpb24gID0gdGhpcy4kKCAnI2h1c3RsZS1mZWF0dXJlLWltYWdlLXBvc2l0aW9uLW9wdGlvbicgKSxcblx0XHRcdFx0XHQkdGFyZ2V0QWJvdmUgPSB0aGlzLiQoICcjaHVzdGxlLWZlYXR1cmUtaW1hZ2UtYWJvdmUtbGFiZWwnICksXG5cdFx0XHRcdFx0JHRhcmdldEJlbG93ID0gdGhpcy4kKCAnI2h1c3RsZS1mZWF0dXJlLWltYWdlLWJlbG93LWxhYmVsJyApXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdGlmICggJHRhcmdldEFib3ZlLmxlbmd0aCB8fCAkdGFyZ2V0QmVsb3cubGVuZ3RoICkge1xuXG5cdFx0XHRcdFx0aWYgKCAnb25lJyA9PT0gY2hhbmdlZC5mb3JtX2xheW91dCApIHtcblx0XHRcdFx0XHRcdCR0YXJnZXRBYm92ZS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0XHQkdGFyZ2V0QmVsb3cucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldCAkaW1nUG9zaXRpb24gPSBtb2RlbC5nZXQoICdmZWF0dXJlX2ltYWdlX3Bvc2l0aW9uJyApO1xuXG5cdFx0XHRcdFx0XHRpZiAoICdsZWZ0JyAhPT0gJGltZ1Bvc2l0aW9uICYmICdyaWdodCcgIT09ICRpbWdQb3NpdGlvbiApIHtcblx0XHRcdFx0XHRcdFx0JGRpdlNlY3Rpb24uZmluZCggJ2lucHV0JyApLnByb3AoICdjaGVja2VkJywgZmFsc2UgKTtcblx0XHRcdFx0XHRcdFx0JGRpdlNlY3Rpb24uZmluZCggJyNodXN0bGUtZmVhdHVyZS1pbWFnZS1sZWZ0JyApLnByb3AoICdjaGVja2VkJywgdHJ1ZSApO1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ2ZlYXR1cmVfaW1hZ2VfcG9zaXRpb24nLCAnbGVmdCcgKTtcblx0XHRcdFx0XHRcdFx0JGRpdlNlY3Rpb24uZmluZCggJy5zdWktdGFiLWl0ZW0nICkucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHRcdFx0XHRcdCRkaXZTZWN0aW9uLmZpbmQoICcjaHVzdGxlLWZlYXR1cmUtaW1hZ2UtbGVmdC1sYWJlbCcgKS5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0JHRhcmdldEFib3ZlLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdCR0YXJnZXRCZWxvdy5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gU3R5bGVzXG5cdFx0XHRpZiAoICdjb2xvcl9wYWxldHRlJyBpbiBjaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZVBpY2tlcnMoIGNoYW5nZWQuY29sb3JfcGFsZXR0ZSApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdmZWF0dXJlX2ltYWdlX2hvcml6b250YWwnIGluIGNoYW5nZWQgKSB7XG5cblx0XHRcdFx0bGV0ICR0YXJnZXQgPSB0aGlzLiQoICcjaHVzdGxlLWltYWdlLWN1c3RvbS1wb3NpdGlvbi1ob3Jpem9udGFsJyApO1xuXG5cdFx0XHRcdGlmICggJHRhcmdldC5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHRpZiAoICdjdXN0b20nICE9PSBjaGFuZ2VkLmZlYXR1cmVfaW1hZ2VfaG9yaXpvbnRhbCApIHtcblx0XHRcdFx0XHRcdCR0YXJnZXQucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkdGFyZ2V0LnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCAnZmVhdHVyZV9pbWFnZV92ZXJ0aWNhbCcgaW4gY2hhbmdlZCApIHtcblxuXHRcdFx0XHRsZXQgJHRhcmdldCA9IHRoaXMuJCggJyNodXN0bGUtaW1hZ2UtY3VzdG9tLXBvc2l0aW9uLXZlcnRpY2FsJyApO1xuXG5cdFx0XHRcdGlmICggJHRhcmdldC5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHRpZiAoICdjdXN0b20nICE9PSBjaGFuZ2VkLmZlYXR1cmVfaW1hZ2VfdmVydGljYWwgKSB7XG5cdFx0XHRcdFx0XHQkdGFyZ2V0LnByb3AoICdkaXNhYmxlZCcsIHRydWUgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JHRhcmdldC5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBIYW5kbGUgdGhlIGNoYW5nZXMgb24gdGhlIEFwcGVhcmFuY2UgdGFiIGR1ZSB0byBDb250ZW50IHRhYiBjaGFuZ2VzXG5cdFx0Vmlld0NoYW5nZWRDb250ZW50VGFiKCBjaGFuZ2VkICkge1xuXG5cdFx0XHRpZiAoICdmZWF0dXJlX2ltYWdlJyBpbiBjaGFuZ2VkICkge1xuXG5cdFx0XHRcdGxldCAkZGl2UGxhY2Vob2xkZXIgPSB0aGlzLiQoICcjaHVzdGxlLWFwcGVhcmFuY2UtZmVhdHVyZS1pbWFnZS1wbGFjZWhvbGRlcicgKSxcblx0XHRcdFx0XHQkZGl2U2V0dGluZ3MgPSB0aGlzLiQoICcjaHVzdGxlLWFwcGVhcmFuY2UtZmVhdHVyZS1pbWFnZS1zZXR0aW5ncycgKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRpZiAoICRkaXZQbGFjZWhvbGRlci5sZW5ndGggJiYgJGRpdlNldHRpbmdzLmxlbmd0aCApIHtcblxuXHRcdFx0XHRcdGlmICggY2hhbmdlZC5mZWF0dXJlX2ltYWdlICkge1xuXG5cdFx0XHRcdFx0XHQvLyBIaWRlIGZlYXR1cmUgaW1hZ2Ugc2V0dGluZ3MuXG5cdFx0XHRcdFx0XHQkZGl2U2V0dGluZ3Muc2hvdygpO1xuXG5cdFx0XHRcdFx0XHQvLyBIaWRlIGRpc2FibGVkIG1lc3NhZ2Vcblx0XHRcdFx0XHRcdCRkaXZQbGFjZWhvbGRlci5oaWRlKCk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHQvLyBIaWRlIGZlYXR1cmUgaW1hZ2Ugc2V0dGluZ3MuXG5cdFx0XHRcdFx0XHQkZGl2U2V0dGluZ3MuaGlkZSgpO1xuXG5cdFx0XHRcdFx0XHQvLyBTaG93IGRpc2FibGVkIG1lc3NhZ2UuXG5cdFx0XHRcdFx0XHQkZGl2UGxhY2Vob2xkZXIuc2hvdygpO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ01peGlucy5Nb2R1bGVfRGlzcGxheScsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS13aXphcmQtZGlzcGxheScsXG5cblx0XHRldmVudHM6IHt9LFxuXG5cdFx0aW5pdCggb3B0cyApIHtcblxuXHRcdFx0dGhpcy5tb2RlbCA9IG5ldyBvcHRzLkJhc2VNb2RlbCggb3B0aW5WYXJzLmN1cnJlbnQuZGlzcGxheSB8fCB7fSk7XG5cdFx0XHR0aGlzLm1vZHVsZVR5cGUgID0gb3B0aW5WYXJzLmN1cnJlbnQuZGF0YS5tb2R1bGVfdHlwZTtcblxuXHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMudmlld0NoYW5nZWQgKTtcblxuXHRcdFx0Ly8gQ2FsbGVkIGp1c3QgdG8gdHJpZ2dlciB0aGUgXCJ2aWV3LnJlbmRlcmVkXCIgYWN0aW9uLlxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyKCkge30sXG5cblx0XHR2aWV3Q2hhbmdlZCggbW9kZWwgKSB7fVxuXG5cdH0pO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTWl4aW5zLk1vZHVsZV9FbWFpbHMnLCBmdW5jdGlvbiggJCwgZG9jLCB3aW4gKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBfLmV4dGVuZCh7fSwgSHVzdGxlLmdldCggJ01peGlucy5Nb2RlbF9VcGRhdGVyJyApLCB7XG5cblx0XHRlbDogJyNodXN0bGUtd2l6YXJkLWVtYWlscycsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuaHVzdGxlLW9wdGluLWZpZWxkLS1hZGQnOiAnYWRkRmllbGRzJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLW9wdGluLWZpZWxkLS1lZGl0JzogJ2VkaXRGaWVsZCcsXG5cdFx0XHQnY2xpY2sgLnN1aS1idWlsZGVyLWZpZWxkJzogJ21heWJlRWRpdEZpZWxkJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLW9wdGluLWZpZWxkLS1kZWxldGUnOiAnZGVsZXRlRmllbGRPbkNsaWNrJyxcblx0XHRcdCdjbGljayB1bC5saXN0LXJlc3VsdHMgbGknOiAnc2V0RmllbGRPcHRpb24nLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtb3B0aW4tZmllbGQtLWNvcHknOiAnZHVwbGljYXRlRmllbGQnXG5cdFx0fSxcblxuXHRcdGluaXQoIG9wdHMgKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gbmV3IG9wdHMuQmFzZU1vZGVsKCBvcHRpblZhcnMuY3VycmVudC5lbWFpbHMgfHwge30pO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMudmlld0NoYW5nZWQgKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyKCkge1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRmb3JtRWxlbWVudHMgPSB0aGlzLm1vZGVsLmdldCggJ2Zvcm1fZWxlbWVudHMnICk7XG5cblx0XHRcdC8vIEFkZCB0aGUgYWxyZWFkeSBzdG9yZWQgZm9ybSBmaWVsZHMgdG8gdGhlIHBhbmVsLlxuXHRcdFx0Zm9yICggbGV0IGZpZWxkSWQgaW4gZm9ybUVsZW1lbnRzICkge1xuXHRcdFx0XHRsZXQgZmllbGQgPSBmb3JtRWxlbWVudHNbIGZpZWxkSWQgXTtcblxuXHRcdFx0XHQvLyBBc3NpZ24gdGhlIGRlZmF1bHRzIGZvciB0aGUgZmllbGQsIGluIGNhc2UgdGhlcmUncyBhbnl0aGluZyBtaXNzaW5nLlxuXHRcdFx0XHRmb3JtRWxlbWVudHNbIGZpZWxkSWQgXSA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldEZpZWxkRGVmYXVsdHMoIGZpZWxkLnR5cGUgKSwgZmllbGQgKTtcblxuXHRcdFx0XHQvLyBTdWJtaXQgaXMgYWxyZWFkeSBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYW5lbC4gV2UgZG9uJ3Qgd2FudCB0byBhZGQgaXQgYWdhaW4uXG5cdFx0XHRcdGlmICggJ3N1Ym1pdCcgPT09IGZpZWxkSWQgKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5hZGRGaWVsZFRvUGFuZWwoIGZvcm1FbGVtZW50c1sgZmllbGRJZCBdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdXBkYXRlIGZvcm1fZWxlbWVudHMgZm9yIGhhdmluZyBkZWZhdWx0IHByb3BlcnRpZXMgaWYgdGhleSB3ZXJlIGxvc3QgZm9yIHNvbWUgcmVhc29uXG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2Zvcm1fZWxlbWVudHMnLCBmb3JtRWxlbWVudHMsIHsgc2lsZW50OiB0cnVlIH0pO1xuXG5cdFx0XHQvLyBJbml0aWF0ZSB0aGUgc29ydGFibGUgZnVuY3Rpb25hbGl0eSB0byBzb3J0IGZvcm0gZmllbGRzJyBvcmRlci5cblx0XHRcdGxldCBzb3J0YWJsZUNvbnRhaW5lciA9IHRoaXMuJCggJyNodXN0bGUtZm9ybS1maWVsZHMtY29udGFpbmVyJyApLnNvcnRhYmxlKHtcblx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRjb250YWlubWVudDogJy5zdWktYm94LWJ1aWxkZXInXG5cdFx0XHR9KTtcblxuXHRcdFx0c29ydGFibGVDb250YWluZXIub24oICdzb3J0dXBkYXRlJywgJC5wcm94eSggc2VsZi5maWVsZHNPcmRlckNoYW5nZWQsIHNlbGYsIHNvcnRhYmxlQ29udGFpbmVyICkgKTtcblxuXHRcdFx0dGhpcy51cGRhdGVEeW5hbWljVmFsdWVGaWVsZHMoKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdC8vcmVzZXQgYWxsIGZpZWxkIHNlbGVjdHNcblx0XHRyZXNldER5bmFtaWNWYWx1ZUZpZWxkc1BsYWNlaG9sZGVycygpIHtcblxuXHRcdFx0dGhpcy4kKCAnc2VsZWN0Lmh1c3RsZS1maWVsZC1vcHRpb25zJyApLmh0bWwoICcnICk7XG5cblx0XHRcdGlmICggdGhpcy4kKCAnLmh1c3RsZS1maWVsZHMtcGxhY2Vob2xkZXJzLW9wdGlvbnMnICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aGlzLiQoICcuaHVzdGxlLWZpZWxkcy1wbGFjZWhvbGRlcnMtb3B0aW9ucycgKS5odG1sKCAnJyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL3VwZGF0ZSBhbGwgZmllbGQgc2VsZWN0c1xuXHRcdHVwZGF0ZUR5bmFtaWNWYWx1ZUZpZWxkcygpIHtcblx0XHRcdGxldCBmb3JtRWxlbWVudHMgPSB0aGlzLm1vZGVsLmdldCggJ2Zvcm1fZWxlbWVudHMnICk7XG5cblx0XHRcdHRoaXMucmVzZXREeW5hbWljVmFsdWVGaWVsZHNQbGFjZWhvbGRlcnMoKTtcblxuXHRcdFx0Zm9yICggbGV0IGZpZWxkSWQgaW4gZm9ybUVsZW1lbnRzICkge1xuXG5cdFx0XHRcdGlmICggJ3N1Ym1pdCcgPT09IGZpZWxkSWQgfHwgJ3JlY2FwdGNoYScgPT09IGZpZWxkSWQgfHwgJ2dkcHInID09PSBmaWVsZElkICkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5hZGRGaWVsZFRvRHluYW1pY1ZhbHVlRmllbGRzKCBmb3JtRWxlbWVudHNbIGZpZWxkSWQgXSk7XG5cdFx0XHRcdHRoaXMuJCggJ3NlbGVjdC5odXN0bGUtZmllbGQtb3B0aW9ucycgKS50cmlnZ2VyKCAnc3VpOmNoYW5nZScgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHQvL3NldCBpbmZvIG5vdGljZSBmb3IgZW1wdHkgZHluYW1pYyBmaWVsZHMgc2VsZWN0XG5cdFx0XHR0aGlzLiQoICdkaXYuc2VsZWN0LWxpc3QtY29udGFpbmVyIC5saXN0LXJlc3VsdHM6ZW1wdHknICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGxldCBmaWVsZFR5cGUgPSAkKCB0aGlzICkuY2xvc2VzdCggJy5zZWxlY3QtY29udGFpbmVyJyApLmZpbmQoICdzZWxlY3QuaHVzdGxlLWZpZWxkLW9wdGlvbnMnICkuZGF0YSggJ3R5cGUnICk7XG5cdFx0XHRcdCQoIHRoaXMgKS5odG1sKCAnPGxpIHN0eWxlPVwiY3Vyc29yOiBkZWZhdWx0OyBwb2ludGVyLWV2ZW50czogbm9uZTtcIj4nICsgb3B0aW5WYXJzLm1lc3NhZ2VzLmZvcm1fZmllbGRzLmVycm9ycy5ub19maWxlZHNfaW5mby5yZXBsYWNlKCAne2ZpZWxkX3R5cGV9JywgZmllbGRUeXBlICkgKyAnPC9saT4nICk7XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBBc3NpZ24gdGhlIG5ldyBmaWVsZCBvcmRlciB0byB0aGUgbW9kZWwuIFRyaWdnZXJlZCB3aGVuIHRoZSBmaWVsZHMgYXJlIHNvcnRlZC5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICogQHBhcmFtIGpRdWVyeSBzb3J0YWJsZSBvYmplY3Rcblx0XHQgKi9cblx0XHRmaWVsZHNPcmRlckNoYW5nZWQoIHNvcnRhYmxlICkge1xuXG5cdFx0XHRsZXQgZm9ybUVsZW1lbnRzID0gdGhpcy5tb2RlbC5nZXQoICdmb3JtX2VsZW1lbnRzJyApLFxuXHRcdFx0XHRuZXdPcmRlciA9IHNvcnRhYmxlLnNvcnRhYmxlKCAndG9BcnJheScsIHsgYXR0cmlidXRlOiAnZGF0YS1maWVsZC1pZCcgfSksXG5cdFx0XHRcdG9yZGVyZWRGaWVsZHMgPSB7fTtcblxuXHRcdFx0Zm9yICggbGV0IGlkIG9mIG5ld09yZGVyICkge1xuXHRcdFx0XHRvcmRlcmVkRmllbGRzWyBpZCBdID0gZm9ybUVsZW1lbnRzWyBpZCBdIDtcblx0XHRcdH1cblxuXHRcdFx0b3JkZXJlZEZpZWxkcyA9IF8uZXh0ZW5kKHt9LCBvcmRlcmVkRmllbGRzLCBmb3JtRWxlbWVudHMgKTtcblxuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICdmb3JtX2VsZW1lbnRzJywgb3JkZXJlZEZpZWxkcyApO1xuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEhhbmRsZSB0aGUgY2hhbmdlcyBpbiB0aGUgdmlldyB3aGVuIHRoZSBtb2RlbCBpcyB1cGRhdGVkLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gZW1haWxzX21vZGVsIG1vZGVsXG5cdFx0ICovXG5cdFx0dmlld0NoYW5nZWQoIG1vZGVsICkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSBtb2RlbC5jaGFuZ2VkO1xuXG5cdFx0XHQvLyBTaG93IG9yIGhpZGUgdGhlIGNvbnRlbnQgZGVwZW5kZW50IG9mIGF1dG9fY2xvc2Vfc3VjY2Vzc19tZXNzYWdlLlxuXHRcdFx0aWYgKCAnYXV0b19jbG9zZV9zdWNjZXNzX21lc3NhZ2UnIGluIGNoYW5nZWQgKSB7XG5cdFx0XHRcdGxldCAkdGFyZ2V0RGl2ID0gdGhpcy4kKCAnI3NlY3Rpb24tYXV0by1jbG9zZS1zdWNjZXNzLW1lc3NhZ2UgLnN1aS1yb3cnICk7XG5cblx0XHRcdFx0aWYgKCAkdGFyZ2V0RGl2Lmxlbmd0aCApIHtcblx0XHRcdFx0XHRpZiAoICcxJyA9PT0gY2hhbmdlZC5hdXRvX2Nsb3NlX3N1Y2Nlc3NfbWVzc2FnZSApIHtcblx0XHRcdFx0XHRcdCR0YXJnZXREaXYucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkdGFyZ2V0RGl2LmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdmb3JtX2VsZW1lbnRzJyBpbiBjaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZUR5bmFtaWNWYWx1ZUZpZWxkcygpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIE9wZW4gdGhlIFwiQWRkIG5ldyBmaWVsZHNcIiBtb2RhbC5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICovXG5cdFx0YWRkRmllbGRzKCkge1xuXG5cdFx0XHRsZXQgT3B0aW5GaWVsZHNNb2RhbFZpZXcgPSBIdXN0bGUuZ2V0KCAnTW9kYWxzLk9wdGluX0ZpZWxkcycgKSxcblx0XHRcdFx0bmV3RmllbGRNb2RhbCA9IG5ldyBPcHRpbkZpZWxkc01vZGFsVmlldygpO1xuXG5cdFx0XHQvLyBDcmVhdGUgdGhlIGZpZWxkcyBhbmQgYXBwZW5kIHRoZW0gdG8gcGFuZWwuXG5cdFx0XHRuZXdGaWVsZE1vZGFsLm9uKCAnZmllbGRzOmFkZGVkJywgJC5wcm94eSggdGhpcy5hZGROZXdGaWVsZHMsIHRoaXMgKSApO1xuXG5cdFx0XHQvLyBTaG93IGRpYWxvZ1xuXHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLW9wdGluLWZpZWxkcyddLnNob3coKTtcblxuXHRcdH0sXG5cblx0XHRtYXliZUVkaXRGaWVsZCggZSApIHtcblx0XHRcdGxldCAkY3QgPSAkKCBlLnRhcmdldCApO1xuXG5cdFx0XHRpZiAoICEgJGN0LmNsb3Nlc3QoICcuc3VpLWRyb3Bkb3duJyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy5lZGl0RmllbGQoIGUgKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBPcGVuIHRoZSBcImVkaXQgZmllbGRcIiBtb2RhbC5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICogQHBhcmFtIGV2ZW50IGVcblx0XHQgKi9cblx0XHRlZGl0RmllbGQoIGUgKSB7XG5cblx0XHRcdGxldCAkYnV0dG9uID0gJCggZS50YXJnZXQgKSxcblx0XHRcdFx0ZmllbGRJZCA9ICRidXR0b24uY2xvc2VzdCggJy5zdWktYnVpbGRlci1maWVsZCcgKS5kYXRhKCAnZmllbGQtaWQnICksXG5cdFx0XHRcdGV4aXN0aW5nRmllbGRzID0gdGhpcy5tb2RlbC5nZXQoICdmb3JtX2VsZW1lbnRzJyApLFxuXHRcdFx0XHRmaWVsZCA9IGV4aXN0aW5nRmllbGRzWyBmaWVsZElkIF0sXG5cdFx0XHRcdGZpZWxkRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmllbGRWaWV3RGVmYXVsdHMoIGZpZWxkLnR5cGUgKSwgZmllbGQgKSxcblx0XHRcdFx0RWRpdEZpZWxkTW9kYWxWaWV3ID0gSHVzdGxlLmdldCggJ01vZGFscy5FZGl0X0ZpZWxkJyApLFxuXHRcdFx0XHRlZGl0TW9kYWxWaWV3ID0gbmV3IEVkaXRGaWVsZE1vZGFsVmlldyh7XG5cdFx0XHRcdFx0ZmllbGQsXG5cdFx0XHRcdFx0ZmllbGREYXRhLFxuXHRcdFx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRlZGl0TW9kYWxWaWV3Lm9uKCAnZmllbGQ6dXBkYXRlZCcsICQucHJveHkoIHRoaXMuZm9ybUZpZWxkVXBkYXRlZCwgdGhpcyApICk7XG5cblx0XHRcdC8vIFNob3cgZGlhbG9nXG5cdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tZWRpdC1maWVsZCddLnNob3coKTtcblxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIGZvcm0gZmllbGQgcm93IG9mIHRoZSBmaWVsZCB0aGF0IHdhcyB1cGRhdGVkLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gb2JqZWN0IHVwZGF0ZWRGaWVsZCBPYmplY3Qgd2l0aCB0aGUgcHJvcGVydGllcyBvZiB0aGUgdXBkYXRlZCBmaWVsZC5cblx0XHQgKi9cblx0XHRmb3JtRmllbGRVcGRhdGVkKCB1cGRhdGVkRmllbGQsIGNoYW5nZWQsIG9sZEZpZWxkICkge1xuXG5cdFx0XHRpZiAoICEgT2JqZWN0LmtleXMoIGNoYW5nZWQgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTmFtZSBpcyB0aGUgdW5pcXVlIGlkZW50aWZpZXIuXG5cdFx0XHQvLyBJZiBpdCBjaGFuZ2VkLCB1cGRhdGUgdGhlIGV4aXN0aW5nIGZpZWxkcyByZW1vdmluZyB0aGUgb2xkIG9uZSBhbmQgY3JlYXRpbmcgYSBuZXcgb25lLlxuXHRcdFx0aWYgKCAnbmFtZScgaW4gY2hhbmdlZCApIHtcblx0XHRcdFx0dGhpcy5hZGROZXdGaWVsZHMoIHVwZGF0ZWRGaWVsZC50eXBlLCB1cGRhdGVkRmllbGQsIG9sZEZpZWxkLm5hbWUgKTtcblx0XHRcdFx0dGhpcy5kZWxldGVGaWVsZCggb2xkRmllbGQubmFtZSApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCAkZmllbGRSb3cgPSB0aGlzLiQoICcjaHVzdGxlLW9wdGluLWZpZWxkLS0nICsgdXBkYXRlZEZpZWxkLm5hbWUgKTtcblxuXHRcdFx0aWYgKCAncmVxdWlyZWQnIGluIGNoYW5nZWQgKSB7XG5cblx0XHRcdFx0bGV0ICRyZXF1aXJlZFRhZyA9ICRmaWVsZFJvdy5maW5kKCAnLnN1aS1lcnJvcicgKSxcblx0XHRcdFx0XHRpc1JlcXVpcmVkID0gdXBkYXRlZEZpZWxkLnJlcXVpcmVkO1xuXG5cdFx0XHRcdC8vIFNob3cgdGhlIFwicmVxdWlyZWRcIiBhc3RlcmlzayB0byB0aGlzIGZpZWxkJ3Mgcm93LlxuXHRcdFx0XHRpZiAoIF8uaXNUcnVlKCBpc1JlcXVpcmVkICkgKSB7XG5cdFx0XHRcdFx0JHJlcXVpcmVkVGFnLnNob3coKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCAgXy5pc0ZhbHNlKCBpc1JlcXVpcmVkICkgKSB7XG5cblx0XHRcdFx0XHQvLyBIaWRlIHRoZSBcInJlcXVpcmVkXCIgYXN0ZXJpc2sgdG8gdGhpcyBmaWVsZCdzIHJvdy5cblx0XHRcdFx0XHQkcmVxdWlyZWRUYWcuaGlkZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCAnbGFiZWwnIGluIGNoYW5nZWQgKSB7XG5cblx0XHRcdFx0dGhpcy51cGRhdGVEeW5hbWljVmFsdWVGaWVsZHMoKTtcblxuXHRcdFx0XHRsZXQgJGxhYmVsV3JhcHBlciA9ICRmaWVsZFJvdy5maW5kKCAnLmh1c3RsZS1maWVsZC1sYWJlbC10ZXh0JyApO1xuXHRcdFx0XHQkbGFiZWxXcmFwcGVyLnRleHQoIHVwZGF0ZWRGaWVsZC5sYWJlbCApO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGRlbGV0ZUZpZWxkT25DbGljayggZSApIHtcblxuXHRcdFx0bGV0ICRidXR0b24gPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRmaWVsZE5hbWUgPSAkYnV0dG9uLmNsb3Nlc3QoICcuc3VpLWJ1aWxkZXItZmllbGQnICkuZGF0YSggJ2ZpZWxkLWlkJyApO1xuXG5cdFx0XHR0aGlzLmRlbGV0ZUZpZWxkKCBmaWVsZE5hbWUgKTtcblx0XHR9LFxuXG5cdFx0c2V0RmllbGRPcHRpb24oIGUgKSB7XG5cdFx0XHRsZXQgJGxpID0gJCggZS50YXJnZXQgKSxcblx0XHRcdFx0dmFsID0gJGxpLmZpbmQoICdzcGFuOmVxKDEpJyApLnRleHQoKSxcblx0XHRcdFx0JGlucHV0ID0gJGxpLmNsb3Nlc3QoICcuc3VpLWluc2VydC12YXJpYWJsZXMnICkuZmluZCggJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJyApO1xuXG5cdFx0XHQkaW5wdXQudmFsKCB2YWwgKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXHRcdH0sXG5cblx0XHRkZWxldGVGaWVsZCggZmllbGROYW1lICkge1xuXG5cdFx0XHRsZXQgJGZpZWxkUm93ID0gdGhpcy4kKCAnI2h1c3RsZS1vcHRpbi1maWVsZC0tJyArIGZpZWxkTmFtZSApLFxuXHRcdFx0XHRmb3JtRWxlbWVudHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1vZGVsLmdldCggJ2Zvcm1fZWxlbWVudHMnICkgKTtcblxuXHRcdFx0ZGVsZXRlIGZvcm1FbGVtZW50c1sgZmllbGROYW1lIF07XG5cblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnZm9ybV9lbGVtZW50cycsIGZvcm1FbGVtZW50cyApO1xuXG5cdFx0XHRpZiAoIC0xICE9PSBqUXVlcnkuaW5BcnJheSggZmllbGROYW1lLCBbICdnZHByJywgJ3JlY2FwdGNoYScgXSkgKSB7XG5cdFx0XHRcdCRmaWVsZFJvdy5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdCQoICcjaHVzdGxlLW9wdGluLWluc2VydC1maWVsZC0tJyArIGZpZWxkTmFtZSApLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICkucHJvcCggJ2NoZWNrZWQnLCBmYWxzZSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JGZpZWxkUm93LnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkdXBsaWNhdGVGaWVsZCggZSApIHtcblxuXHRcdFx0bGV0ICRidXR0b24gPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRmaWVsZElkID0gJGJ1dHRvbi5jbG9zZXN0KCAnLnN1aS1idWlsZGVyLWZpZWxkJyApLmRhdGEoICdmaWVsZC1pZCcgKSxcblx0XHRcdFx0Zm9ybUVsZW1lbnRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tb2RlbC5nZXQoICdmb3JtX2VsZW1lbnRzJyApICksXG5cdFx0XHRcdGR1cGxpY2F0ZWRGaWVsZCA9IE9iamVjdC5hc3NpZ24oe30sIGZvcm1FbGVtZW50c1sgZmllbGRJZCBdKTtcblxuXHRcdFx0Ly8gUmVtb3ZlICduYW1lJyBiZWNhdXNlIGl0IHNob3VsZCBiZSBhbiB1bmlxdWUgaWRlbnRpZmllci4gV2lsbCBiZSBhZGRlZCBpbiAnYWRkX25ld19maWVsZHMnLlxuXHRcdFx0ZGVsZXRlIGR1cGxpY2F0ZWRGaWVsZC5uYW1lO1xuXG5cdFx0XHQvLyBNYWtlIHRoZSBmaWVsZCBkZWxldGFibGUgYmVjYXVzZSBpdCBjYW4ndCBiZSBkZWxldGVkIG90aGVyd2lzZSwgYW5kIHlvdSdsbCBoYXZlIGl0IHN0dWNrIGZvcmV2YWguXG5cdFx0XHRkdXBsaWNhdGVkRmllbGQuY2FuX2RlbGV0ZSA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cblx0XHRcdHRoaXMuYWRkTmV3RmllbGRzKCBkdXBsaWNhdGVkRmllbGQudHlwZSwgZHVwbGljYXRlZEZpZWxkICk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWRkIG5ldyBmaWVsZHMuXG5cdFx0ICogV2hlbiB1c2luZyBmb3JtX2ZpZWxkcywgbWFrZSBzdXJlIG9ubHkgMSB0eXBlIG9mIGVhY2ggZmllbGQgaXMgYWRkZWQuXG5cdFx0ICogSW4gb3RoZXIgd29yZHMsIHVzZSBmaWVsZC50eXBlIGFzIGFuIHVuaXF1ZSBpZGVudGlmaWVyLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gYXJyYXl8c3RyaW5nIGZvcm1fZmllbGRzXG5cdFx0ICogQHBhcmFtIG9iamVjdCBmb3JtX2ZpZWxkc19kYXRhXG5cdFx0ICovXG5cdFx0YWRkTmV3RmllbGRzKCBmb3JtRmllbGRzLCBmb3JtRmllbGRzRGF0YSwgYWZ0ZXIgPSBudWxsICkge1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRleGlzdGluZ0ZpZWxkcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubW9kZWwuZ2V0KCAnZm9ybV9lbGVtZW50cycgKSApO1xuXHRcdFx0aWYgKCBBcnJheS5pc0FycmF5KCBmb3JtRmllbGRzICkgKSB7XG5cdFx0XHRcdGZvciAoIGxldCBmaWVsZCBvZiBmb3JtRmllbGRzICkge1xuXHRcdFx0XHRcdGxldCBmaWVsZERhdGEgPSBzZWxmLmdldEZpZWxkRGVmYXVsdHMoIGZpZWxkICk7XG5cdFx0XHRcdFx0aWYgKCBmb3JtRmllbGRzRGF0YSAmJiBmaWVsZCBpbiBmb3JtRmllbGRzRGF0YSApIHtcblx0XHRcdFx0XHRcdF8uZXh0ZW5kKCBmaWVsZERhdGEsIGZvcm1GaWVsZHNEYXRhWyBmaWVsZCBdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c2VsZi5hZGRGaWVsZFRvUGFuZWwoIGZpZWxkRGF0YSApO1xuXHRcdFx0XHRcdGV4aXN0aW5nRmllbGRzWyBmaWVsZERhdGEubmFtZSBdID0gZmllbGREYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgZmllbGREYXRhID0gc2VsZi5nZXRGaWVsZERlZmF1bHRzKCBmb3JtRmllbGRzICk7XG5cdFx0XHRcdGlmICggZm9ybUZpZWxkc0RhdGEgKSB7XG5cdFx0XHRcdFx0Xy5leHRlbmQoIGZpZWxkRGF0YSwgZm9ybUZpZWxkc0RhdGEgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWxmLmFkZEZpZWxkVG9QYW5lbCggZmllbGREYXRhLCBhZnRlciApO1xuXHRcdFx0XHRpZiAoIG51bGwgPT09IGFmdGVyICkge1xuXHRcdFx0XHRcdGV4aXN0aW5nRmllbGRzWyBmaWVsZERhdGEubmFtZSBdID0gZmllbGREYXRhO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCByZW9yZGVyRXhpc3RpbmdGaWVsZHMgPSBbXTtcblx0XHRcdFx0XHRqUXVlcnkuZWFjaCggZXhpc3RpbmdGaWVsZHMsIGZ1bmN0aW9uKCBpbmRleCwgZGF0YSApIHtcblx0XHRcdFx0XHRcdHJlb3JkZXJFeGlzdGluZ0ZpZWxkc1sgaW5kZXggXSA9IGRhdGE7XG5cdFx0XHRcdFx0XHRpZiAoIGluZGV4ID09PSBhZnRlciApIHtcblx0XHRcdFx0XHRcdFx0cmVvcmRlckV4aXN0aW5nRmllbGRzWyBmaWVsZERhdGEubmFtZSBdID0gZmllbGREYXRhO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGV4aXN0aW5nRmllbGRzID0gcmVvcmRlckV4aXN0aW5nRmllbGRzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2Zvcm1fZWxlbWVudHMnLCBleGlzdGluZ0ZpZWxkcyApO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBBZGQgYSBmaWVsZCB0byB0aGUgZmllbGRzIHdpdGggZHluYW1pYyB2YWx1ZXMgZm9yIHRoZSBhdXRvbWF0ZWQgZW1haWxzLlxuXHRcdCAqIFRoZSBmaWVsZCBvYmplY3QgbXVzdCBoYXZlIGFsbCBpdHMgY29yZSBwcm9wIGFzc2lnbmVkLiBUaGUgdmlld3MgcHJvcCBhcmUgYXNzaWduZWQgaGVyZS5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICogQHBhcmFtIG9iamVjdCBmaWVsZFxuXHRcdCAqL1xuXHRcdGFkZEZpZWxkVG9EeW5hbWljVmFsdWVGaWVsZHMoIGZpZWxkICkge1xuXHRcdFx0bGV0IG9wdGlvbiA9ICQoICc8b3B0aW9uLz4nLCB7XG5cdFx0XHRcdHZhbHVlOiBmaWVsZC5uYW1lLFxuXHRcdFx0XHQnZGF0YS1jb250ZW50JzogJ3snICsgZmllbGQubmFtZSArICd9J1xuXHRcdFx0fSkudGV4dCggZmllbGQubGFiZWwgKSxcblx0XHRcdFx0bGlzdE9wdGlvbiA9IGA8bGk+PGJ1dHRvbiB2YWx1ZT1cInske2ZpZWxkLm5hbWV9fVwiPiR7ZmllbGQubGFiZWx9PC9idXR0b24+PC9saT5gO1xuXG5cdFx0XHR0aGlzLiQoICdzZWxlY3QuaHVzdGxlLWZpZWxkLW9wdGlvbnM6bm90KFtkYXRhLXR5cGVdKSwgc2VsZWN0Lmh1c3RsZS1maWVsZC1vcHRpb25zW2RhdGEtdHlwZT1cIicgKyBmaWVsZC50eXBlICsgJ1wiXScgKS5hcHBlbmQoIG9wdGlvbiApO1xuXG5cdFx0XHRpZiAoIHRoaXMuJCggJy5odXN0bGUtZmllbGRzLXBsYWNlaG9sZGVycy1vcHRpb25zJyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1maWVsZHMtcGxhY2Vob2xkZXJzLW9wdGlvbnMnICkuYXBwZW5kKCBsaXN0T3B0aW9uICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEFkZCBhIGZpZWxkIHRvIHRoZSBmaWVsZHMgcGFubmVsLlxuXHRcdCAqIFRoZSBmaWVsZCBvYmplY3QgbXVzdCBoYXZlIGFsbCBpdHMgY29yZSBwcm9wIGFzc2lnbmVkLiBUaGUgdmlld3MgcHJvcCBhcmUgYXNzaWduZWQgaGVyZS5cblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICogQHBhcmFtIG9iamVjdCBmaWVsZFxuXHRcdCAqL1xuXHRcdGFkZEZpZWxkVG9QYW5lbCggZmllbGQsIGFmdGVyID0gbnVsbCApIHtcblx0XHRcdGxldCB0ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLWZvcm0tZmllbGQtcm93LXRwbCcgKSxcblx0XHRcdFx0JGZpZWxkc0NvbnRhaW5lciA9IHRoaXMuJCggJyNodXN0bGUtZm9ybS1maWVsZHMtY29udGFpbmVyJyApO1xuXHRcdFx0ZmllbGQgPSBfLmV4dGVuZCh7fSwgdGhpcy5nZXRGaWVsZFZpZXdEZWZhdWx0cyggZmllbGQudHlwZSApLCBmaWVsZCApO1xuXHRcdFx0aWYgKCAtMSAhPT0galF1ZXJ5LmluQXJyYXkoIGZpZWxkLnR5cGUsIFsgJ2dkcHInLCAncmVjYXB0Y2hhJyBdKSApIHtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1vcHRpbi1maWVsZC0tJyArIGZpZWxkLnR5cGUgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdCQoICcjaHVzdGxlLW9wdGluLWluc2VydC1maWVsZC0tJyArIGZpZWxkLnR5cGUgKS5wcm9wKCAnY2hlY2tlZCcsIHRydWUgKS5wcm9wKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIG51bGwgPT09IGFmdGVyICkge1xuXHRcdFx0XHRcdCRmaWVsZHNDb250YWluZXIuYXBwZW5kKCB0ZW1wbGF0ZSggZmllbGQgKSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCAkZWwgPSB0aGlzLiQoICcjaHVzdGxlLW9wdGluLWZpZWxkLS0nICsgYWZ0ZXIgKTtcblx0XHRcdFx0XHRpZiAoIDAgPCAkZWwubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0JGVsLmFmdGVyKCB0ZW1wbGF0ZSggZmllbGQgKSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkZmllbGRzQ29udGFpbmVyLmFwcGVuZCggdGVtcGxhdGUoIGZpZWxkICkgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Z2V0TmV3RmllbGRJZCggZmllbGROYW1lICkge1xuXHRcdFx0bGV0IGV4aXN0aW5nRmllbGRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tb2RlbC5nZXQoICdmb3JtX2VsZW1lbnRzJyApICksXG5cdFx0XHRcdGZpZWxkSWQgPSBmaWVsZE5hbWU7XG5cdFx0XHR3aGlsZSAoIGZpZWxkSWQgaW4gZXhpc3RpbmdGaWVsZHMgJiYgLTEgPT09IGpRdWVyeS5pbkFycmF5KCBmaWVsZElkLCBbICdnZHByJywgJ3JlY2FwdGNoYScsICdzdWJtaXQnIF0pICkge1xuXHRcdFx0XHRmaWVsZElkID0gZmllbGROYW1lICsgJy0nICsgTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIDk5ICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmllbGRJZDtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogUmV0cmlldmUgdGhlIGRlZmF1bHQgc2V0dGluZ3MgZm9yIGVhY2ggZmllbGQgdHlwZS5cblx0XHQgKiBUaGVzZSBhcmUgZ29pbmcgdG8gYmUgc3RvcmVkLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gc3RyaW5nIGZpZWxkX3R5cGUuIFRoZSBmaWVsZCB0eXBlLlxuXHRcdCAqL1xuXHRcdGdldEZpZWxkRGVmYXVsdHMoIGZpZWxkVHlwZSApIHtcblx0XHRcdGxldCBmaWVsZElkID0gdGhpcy5nZXROZXdGaWVsZElkKCBmaWVsZFR5cGUgKSxcblx0XHRcdFx0ZGVmYXVsdHMgPSB7XG5cdFx0XHRcdFx0bGFiZWw6IG9wdGluVmFycy5tZXNzYWdlcy5mb3JtX2ZpZWxkcy5sYWJlbFtmaWVsZFR5cGUgKyAnX2xhYmVsJ10sXG5cdFx0XHRcdFx0cmVxdWlyZWQ6ICdmYWxzZScsXG5cdFx0XHRcdFx0J2Nzc19jbGFzc2VzJzogJycsXG5cdFx0XHRcdFx0dHlwZTogZmllbGRUeXBlLFxuXHRcdFx0XHRcdG5hbWU6IGZpZWxkSWQsXG5cdFx0XHRcdFx0J3JlcXVpcmVkX2Vycm9yX21lc3NhZ2UnOiBvcHRpblZhcnMubWVzc2FnZXMucmVxdWlyZWRfZXJyb3JfbWVzc2FnZS5yZXBsYWNlKCAne2ZpZWxkfScsIGZpZWxkVHlwZSApLFxuXHRcdFx0XHRcdCd2YWxpZGF0aW9uX21lc3NhZ2UnOiBvcHRpblZhcnMubWVzc2FnZXMudmFsaWRhdGlvbl9tZXNzYWdlLnJlcGxhY2UoICd7ZmllbGR9JywgZmllbGRUeXBlICksXG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI6ICcnXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c3dpdGNoICggZmllbGRUeXBlICkge1xuXHRcdFx0XHRcdGNhc2UgJ3RpbWVwaWNrZXInOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudGltZV9mb3JtYXQgPSAnMTInOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudGltZV9ob3VycyA9ICc5JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnRpbWVfbWludXRlcyA9ICczMCc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy50aW1lX3BlcmlvZCA9ICdhbSc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy52YWxpZGF0aW9uX21lc3NhZ2UgPSBvcHRpblZhcnMubWVzc2FnZXMudGltZV92YWxpZGF0aW9uX21lc3NhZ2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy5yZXF1aXJlZF9lcnJvcl9tZXNzYWdlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmlzX3JlcXVpcmVkLnJlcGxhY2UoICd7ZmllbGR9JywgZGVmYXVsdHMubGFiZWwgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnZhbGlkYXRlID0gJ2ZhbHNlJztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ2RhdGVwaWNrZXInOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMuZGF0ZV9mb3JtYXQgPSAnbW0vZGQveXknOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudmFsaWRhdGlvbl9tZXNzYWdlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmRhdGVfdmFsaWRhdGlvbl9tZXNzYWdlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMucmVxdWlyZWRfZXJyb3JfbWVzc2FnZSA9IG9wdGluVmFycy5tZXNzYWdlcy5pc19yZXF1aXJlZC5yZXBsYWNlKCAne2ZpZWxkfScsIGRlZmF1bHRzLmxhYmVsICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy52YWxpZGF0ZSA9ICdmYWxzZSc7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdyZWNhcHRjaGEnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudGhyZXNob2xkID0gJzAuNSc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy52ZXJzaW9uID0gJ3YyX2NoZWNrYm94JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnJlY2FwdGNoYV90eXBlID0gJ2NvbXBhY3QnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMucmVjYXB0Y2hhX3RoZW1lID0gJ2xpZ2h0JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnYyX2ludmlzaWJsZV90aGVtZSA9ICdsaWdodCc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRkZWZhdWx0cy5yZWNhcHRjaGFfbGFuZ3VhZ2UgPSAnYXV0b21hdGljJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnYyX2ludmlzaWJsZV9zaG93X2JhZGdlID0gJzEnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudjJfaW52aXNpYmxlX2JhZGdlX3JlcGxhY2VtZW50ID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmZvcm1fZmllbGRzLnJlY2FwdGNoYV9iYWRnZV9yZXBsYWNlbWVudDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnYzX3JlY2FwdGNoYV9zaG93X2JhZGdlID0gJzEnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudjNfcmVjYXB0Y2hhX2JhZGdlX3JlcGxhY2VtZW50ID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmZvcm1fZmllbGRzLnJlY2FwdGNoYV9iYWRnZV9yZXBsYWNlbWVudDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnZhbGlkYXRpb25fbWVzc2FnZSA9IG9wdGluVmFycy5tZXNzYWdlcy5yZWNhcHRjaGFfdmFsaWRhdGlvbl9tZXNzYWdlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMuZXJyb3JfbWVzc2FnZSA9IG9wdGluVmFycy5tZXNzYWdlcy5mb3JtX2ZpZWxkcy5yZWNhcHRjaGFfZXJyb3JfbWVzc2FnZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ2dkcHInOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMuZ2Rwcl9tZXNzYWdlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmZvcm1fZmllbGRzLmdkcHJfbWVzc2FnZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRcdGRlZmF1bHRzLnJlcXVpcmVkID0gJ3RydWUnO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdHMucmVxdWlyZWRfZXJyb3JfbWVzc2FnZSA9IG9wdGluVmFycy5tZXNzYWdlcy5nZHByX3JlcXVpcmVkX2Vycm9yX21lc3NhZ2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdlbWFpbCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0cy52YWxpZGF0ZSA9ICd0cnVlJztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ3VybCc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0cy5yZXF1aXJlZF9lcnJvcl9tZXNzYWdlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLnVybF9yZXF1aXJlZF9lcnJvcl9tZXNzYWdlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMudmFsaWRhdGUgPSAndHJ1ZSc7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdwaG9uZSc6XG5cdFx0XHRcdFx0XHRkZWZhdWx0cy52YWxpZGF0ZSA9ICdmYWxzZSc7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdoaWRkZW4nOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMuZGVmYXVsdF92YWx1ZSA9ICcnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMuY3VzdG9tX3ZhbHVlID0gJyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRcdFx0ZGVmYXVsdHMucmVxdWlyZWRfZXJyb3JfbWVzc2FnZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jYW50X2VtcHR5OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGRlZmF1bHRzO1xuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJldHJpZXZlIHRoZSBkZWZhdWx0cyBmb3IgZWFjaCBmaWVsZCB0eXBlJ3Mgc2V0dGluZyB2aWV3LlxuXHRcdCAqIFRoZXNlIHNldHRpbmdzIGFyZSBpbnRlbmRlZCB0byBkaXNwbGF5IHRoZSBwcm9wZXIgY29udGVudCBvZiBlYWNoIGZpZWxkXG5cdFx0ICogaW4gdGhlIHdpemFyZCBzZXR0aW5ncy4gVGhlc2Ugd29uJ3QgYmUgc3RvcmVkLlxuXHRcdCAqIEBzaW5jZSA0LjBcblx0XHQgKiBAcGFyYW0gc3RyaW5nIGZpZWxkX3R5cGUuIFRoZSBmaWVsZCB0eXBlLlxuXHRcdCAqL1xuXHRcdGdldEZpZWxkVmlld0RlZmF1bHRzKCBmaWVsZFR5cGUgKSB7XG5cblx0XHRcdGxldCBkZWZhdWx0cyA9IHtcblx0XHRcdFx0cmVxdWlyZWQ6ICdmYWxzZScsXG5cdFx0XHRcdHZhbGlkYXRlZDogJ2ZhbHNlJyxcblx0XHRcdFx0J3BsYWNlaG9sZGVyX3BsYWNlaG9sZGVyJzogb3B0aW5WYXJzLm1lc3NhZ2VzLmZvcm1fZmllbGRzLmxhYmVsLnBsYWNlaG9sZGVyLFxuXHRcdFx0XHQnbGFiZWxfcGxhY2Vob2xkZXInOiAnJyxcblx0XHRcdFx0J25hbWVfcGxhY2Vob2xkZXInOiAnJyxcblx0XHRcdFx0aWNvbjogJ3NlbmQnLFxuXHRcdFx0XHQnY3NzX2NsYXNzZXMnOiAnJyxcblx0XHRcdFx0dHlwZTogZmllbGRUeXBlLFxuXHRcdFx0XHRuYW1lOiBmaWVsZFR5cGUsXG5cdFx0XHRcdHBsYWNlaG9sZGVyOiBvcHRpblZhcnMubWVzc2FnZXMuZm9ybV9maWVsZHMubGFiZWxbZmllbGRUeXBlICsgJ19wbGFjZWhvbGRlciddLFxuXHRcdFx0XHQnY2FuX2RlbGV0ZSc6IHRydWUsXG5cdFx0XHRcdGZpZWxkSWQ6IHRoaXMuZ2V0TmV3RmllbGRJZCggZmllbGRUeXBlIClcblx0XHRcdH07XG5cblx0XHRcdHN3aXRjaCAoIGZpZWxkVHlwZSApIHtcblx0XHRcdFx0Y2FzZSAnZW1haWwnOlxuXHRcdFx0XHRcdGRlZmF1bHRzLmljb24gPSAnbWFpbCc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ25hbWUnOlxuXHRcdFx0XHRcdGRlZmF1bHRzLmljb24gPSAncHJvZmlsZS1tYWxlJztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAncGhvbmUnOlxuXHRcdFx0XHRcdGRlZmF1bHRzLmljb24gPSAncGhvbmUnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdhZGRyZXNzJzpcblx0XHRcdFx0XHRkZWZhdWx0cy5pY29uID0gJ3Bpbic7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ3VybCc6XG5cdFx0XHRcdFx0ZGVmYXVsdHMuaWNvbiA9ICd3ZWItZ2xvYmUtd29ybGQnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdFx0XHRkZWZhdWx0cy5pY29uID0gJ3N0eWxlLXR5cGUnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdGRlZmF1bHRzLmljb24gPSAnZWxlbWVudC1udW1iZXInO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICd0aW1lcGlja2VyJzpcblx0XHRcdFx0XHRkZWZhdWx0cy5pY29uID0gJ2Nsb2NrJztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnZGF0ZXBpY2tlcic6XG5cdFx0XHRcdFx0ZGVmYXVsdHMuaWNvbiA9ICdjYWxlbmRhcic7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ3JlY2FwdGNoYSc6XG5cdFx0XHRcdFx0ZGVmYXVsdHMuaWNvbiA9ICdyZWNhcHRjaGEnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdnZHByJzpcblx0XHRcdFx0XHRkZWZhdWx0cy5pY29uID0gJ2dkcHInO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdoaWRkZW4nOlxuXHRcdFx0XHRcdGRlZmF1bHRzLmljb24gPSAnZXllLWhpZGUnO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkZWZhdWx0cztcblxuXHRcdH1cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdNb2R1bGUuSW50ZWdyYXRpb25zVmlldycsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGNvbnN0IGludGVncmF0aW9uc1ZpZXcgPSBIdXN0bGUuVmlldy5leHRlbmQoIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS1ib3gtc2VjdGlvbi1pbnRlZ3JhdGlvbnMnLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLmNvbm5lY3QtaW50ZWdyYXRpb24nOiAnY29ubmVjdEludGVncmF0aW9uJyxcblx0XHRcdCdrZXlwcmVzcyAuY29ubmVjdC1pbnRlZ3JhdGlvbic6ICdwcmV2ZW50RW50ZXJLZXlGcm9tRG9pbmdUaGluZ3MnXG5cdFx0fSxcblxuXHRcdGluaXQoIG9wdHMgKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gbmV3IG9wdHMuQmFzZU1vZGVsKCBvcHRpblZhcnMuY3VycmVudC5pbnRlZ3JhdGlvbnNfc2V0dGluZ3MgfHwge30pO1xuXHRcdFx0dGhpcy5tb2R1bGVJZCA9IG9wdGluVmFycy5jdXJyZW50LmRhdGEubW9kdWxlX2lkO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggSHVzdGxlLkV2ZW50cywgJ2h1c3RsZTpwcm92aWRlcnM6cmVsb2FkJywgdGhpcy5yZW5kZXJQcm92aWRlcnNUYWJsZXMgKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSxcblxuXHRcdHJlbmRlcigpIHtcblx0XHRcdGxldCAkbm90Q29ubmVjdGVkV3JhcHBlciA9IHRoaXMuJGVsLmZpbmQoICcjaHVzdGxlLW5vdC1jb25uZWN0ZWQtcHJvdmlkZXJzLXNlY3Rpb24nICksXG5cdFx0XHRcdCRjb25uZWN0ZWRXcmFwcGVyID0gdGhpcy4kZWwuZmluZCggJyNodXN0bGUtY29ubmVjdGVkLXByb3ZpZGVycy1zZWN0aW9uJyApO1xuXG5cdFx0XHRpZiAoIDAgPCAkbm90Q29ubmVjdGVkV3JhcHBlci5sZW5ndGggJiYgMCA8ICRjb25uZWN0ZWRXcmFwcGVyLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy5yZW5kZXJQcm92aWRlcnNUYWJsZXMoKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRyZW5kZXJQcm92aWRlcnNUYWJsZXMoKSB7XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0ZGF0YSA9IHt9XG5cdFx0XHQ7XG5cblx0XHRcdC8vIEFkZCBwcmVsb2FkZXJcblx0XHRcdHRoaXMuJGVsLmZpbmQoICcuaHVzdGxlLWludGVncmF0aW9ucy1kaXNwbGF5JyApXG5cdFx0XHRcdC5odG1sKFxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwic3VpLW5vdGljZSBzdWktbm90aWNlLXNtIHN1aS1ub3RpY2UtbG9hZGluZ1wiPicgK1xuXHRcdFx0XHRcdFx0JzxwPicgKyBvcHRpblZhcnMuZmV0Y2hpbmdfbGlzdCArICc8L3A+JyArXG5cdFx0XHRcdFx0JzwvZGl2Pidcblx0XHRcdFx0KTtcblxuXHRcdFx0ZGF0YS5hY3Rpb24gICAgICA9ICdodXN0bGVfcHJvdmlkZXJfZ2V0X2Zvcm1fcHJvdmlkZXJzJztcblx0XHRcdGRhdGEuX2FqYXhfbm9uY2UgPSBvcHRpblZhcnMucHJvdmlkZXJzX2FjdGlvbl9ub25jZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGRhdGEuZGF0YSA9IHtcblx0XHRcdFx0bW9kdWxlSWQ6IHRoaXMubW9kdWxlSWRcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IGFqYXggPSAkLnBvc3Qoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdwb3N0Jyxcblx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKCBmdW5jdGlvbiggcmVzdWx0ICkge1xuXHRcdFx0XHRpZiAoIHJlc3VsdCAmJiByZXN1bHQuc3VjY2VzcyApIHtcblx0XHRcdFx0XHRjb25zdCAkYWN0aXZlSW50ZWdyYXRpb25zSW5wdXQgPSBzZWxmLiRlbC5maW5kKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbnMtYWN0aXZlLWludGVncmF0aW9ucycgKSxcblx0XHRcdFx0XHRcdCRhY3RpdmVJbnRlZ3JhdGlvbnNDb3VudCA9IHNlbGYuJGVsLmZpbmQoICcjaHVzdGxlLWludGVncmF0aW9ucy1hY3RpdmUtY291bnQnICk7XG5cblx0XHRcdFx0XHRzZWxmLiRlbC5maW5kKCAnI2h1c3RsZS1ub3QtY29ubmVjdGVkLXByb3ZpZGVycy1zZWN0aW9uJyApLmh0bWwoIHJlc3VsdC5kYXRhLm5vdF9jb25uZWN0ZWQgKTtcblx0XHRcdFx0XHRzZWxmLiRlbC5maW5kKCAnI2h1c3RsZS1jb25uZWN0ZWQtcHJvdmlkZXJzLXNlY3Rpb24nICkuaHRtbCggcmVzdWx0LmRhdGEuY29ubmVjdGVkICk7XG5cblx0XHRcdFx0XHQvLyBQcmV2ZW50IG1hcmtpbmcgdGhlIG1vZGVsIGFzIGNoYW5nZWQgb24gbG9hZC5cblx0XHRcdFx0XHRpZiAoICRhY3RpdmVJbnRlZ3JhdGlvbnNJbnB1dC52YWwoKSAhPT0gcmVzdWx0LmRhdGEubGlzdF9jb25uZWN0ZWQgKSB7XG5cdFx0XHRcdFx0XHQkYWN0aXZlSW50ZWdyYXRpb25zSW5wdXQudmFsKCByZXN1bHQuZGF0YS5saXN0X2Nvbm5lY3RlZCApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gUHJldmVudCBtYXJraW5nIHRoZSBtb2RlbCBhcyBjaGFuZ2VkIG9uIGxvYWQuXG5cdFx0XHRcdFx0aWYgKCAkYWN0aXZlSW50ZWdyYXRpb25zQ291bnQudmFsKCkgIT09IFN0cmluZyggcmVzdWx0LmRhdGEubGlzdF9jb25uZWN0ZWRfdG90YWwgKSApIHtcblx0XHRcdFx0XHRcdCRhY3RpdmVJbnRlZ3JhdGlvbnNDb3VudC52YWwoIHJlc3VsdC5kYXRhLmxpc3RfY29ubmVjdGVkX3RvdGFsICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBSZW1vdmUgcHJlbG9hZGVyXG5cdFx0XHRhamF4LmFsd2F5cyggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLWJveC1ib2R5JyApLnJlbW92ZUNsYXNzKCAnc3VpLWJsb2NrLWNvbnRlbnQtY2VudGVyJyApO1xuXHRcdFx0XHRzZWxmLiRlbC5maW5kKCAnLnN1aS1ub3RpY2UtbG9hZGluZycgKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLyBQcmV2ZW50IHRoZSBlbnRlciBrZXkgZnJvbSBvcGVuaW5nIGludGVncmF0aW9ucyBtb2RhbHMgYW5kIGJyZWFraW5nIHRoZSBwYWdlLlxuXHRcdHByZXZlbnRFbnRlcktleUZyb21Eb2luZ1RoaW5ncyggZSApIHtcblx0XHRcdGlmICggMTMgPT09IGUud2hpY2ggKSB7IC8vIHRoZSBlbnRlciBrZXkgY29kZVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y29ubmVjdEludGVncmF0aW9uKCBlICkge1xuXHRcdFx0TW9kdWxlLmludGVncmF0aW9uc01vZGFsLm9wZW4oIGUgKTtcblx0XHR9XG5cblx0fSkgKTtcblxuXHRyZXR1cm4gaW50ZWdyYXRpb25zVmlldztcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ01peGlucy5Nb2R1bGVfVmlzaWJpbGl0eScsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZGVsX1VwZGF0ZXInICksIHtcblxuXHRcdGVsOiAnI2h1c3RsZS1jb25kaXRpb25zLWdyb3VwJyxcblxuXHRcdGV2ZW50czoge1xuXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1hZGQtbmV3LXZpc2liaWxpdHktZ3JvdXAnOiAnYWRkTmV3R3JvdXAnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtY2hvb3NlLWNvbmRpdGlvbnMnOiAnb3BlbkNvbmRpdGlvbnNNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1yZW1vdmUtdmlzaWJpbGl0eS1ncm91cCc6ICdyZW1vdmVHcm91cCcsXG5cdFx0XHQnY2hhbmdlIC52aXNpYmlsaXR5LWdyb3VwLWZpbHRlci10eXBlJzogJ3VwZGF0ZUF0dHJpYnV0ZScsXG5cblx0XHRcdCdjaGFuZ2UgLnZpc2liaWxpdHktZ3JvdXAtc2hvdy1oaWRlJzogJ3VwZGF0ZUF0dHJpYnV0ZScsXG5cdFx0XHQnY2hhbmdlIC52aXNpYmlsaXR5LWdyb3VwLWFwcGx5LW9uJzogJ3VwZGF0ZUdyb3VwQXBwbHlPbidcblx0XHR9LFxuXG5cdFx0aW5pdCggb3B0cyApIHtcblxuXHRcdFx0Y29uc3QgTW9kZWwgPSBvcHRzLkJhc2VNb2RlbC5leHRlbmQoe1xuXHRcdFx0XHRcdGRlZmF1bHRzOiB7IGNvbmRpdGlvbnM6ICcnIH0sXG5cdFx0XHRcdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cblx0XHRcdFx0XHRcdF8uZXh0ZW5kKCB0aGlzLCBkYXRhICk7XG5cblx0XHRcdFx0XHRcdGlmICggISAoIHRoaXMuZ2V0KCAnY29uZGl0aW9ucycgKSBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsICkgKSB7XG5cblx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdCAqIE1ha2Ugc3VyZSBjb25kaXRpb25zIGlzIG5vdCBhbiBhcnJheVxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0aWYgKCBfLmlzRW1wdHkoIHRoaXMuZ2V0KCAnY29uZGl0aW9ucycgKSApICYmIF8uaXNBcnJheSggdGhpcy5nZXQoICdjb25kaXRpb25zJyApICkgICkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuY29uZGl0aW9ucyA9IHt9O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bGV0IGhNb2RlbCA9IEh1c3RsZS5nZXQoICdNb2RlbCcgKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZXQoICdjb25kaXRpb25zJywgbmV3IGhNb2RlbCggdGhpcy5jb25kaXRpb25zICksIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubW9kZWwgPSBuZXcgTW9kZWwoIG9wdGluVmFycy5jdXJyZW50LnZpc2liaWxpdHkgfHwge30pO1xuXG5cdFx0XHR0aGlzLm1vZHVsZVR5cGUgPSBvcHRpblZhcnMuY3VycmVudC5kYXRhLm1vZHVsZV90eXBlO1xuXHRcdFx0dGhpcy5hY3RpdmVDb25kaXRpb25zID0ge307XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdFx0JCggJyNodXN0bGUtZ2VuZXJhbC1jb25kaXRpb25zJyApLm9uKCAnY2xpY2snLCAgJC5wcm94eSggdGhpcy5zd2l0Y2hDb25kaXRpb25zLCB0aGlzICkgKTtcblx0XHRcdCQoICcjaHVzdGxlLXdjLWNvbmRpdGlvbnMnICkub24oICdjbGljaycsICAkLnByb3h5KCB0aGlzLnN3aXRjaENvbmRpdGlvbnMsIHRoaXMgKSApO1xuICAgICAgICAgICAgdGhpcy5ncm91cElkID0gJyc7XG5cdFx0fSxcblxuXHRcdHJlbmRlcigpIHtcblxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRncm91cHMgPSB0aGlzLm1vZGVsLmdldCggJ2NvbmRpdGlvbnMnICkudG9KU09OKCk7XG5cblx0XHRcdGlmICggISAkLmlzRW1wdHlPYmplY3QoIGdyb3VwcyApICkge1xuXG5cdFx0XHRcdGZvciAoIGxldCBncm91cElkIGluIGdyb3VwcyApIHtcblxuXHRcdFx0XHRcdGxldCBncm91cCA9IHRoaXMubW9kZWwuZ2V0KCAnY29uZGl0aW9ucy4nICsgZ3JvdXBJZCApO1xuXG5cdFx0XHRcdFx0aWYgKCAhICggZ3JvdXAgaW5zdGFuY2VvZiBCYWNrYm9uZS5Nb2RlbCApICkge1xuXG5cdFx0XHRcdFx0XHQvLyBNYWtlIHN1cmUgaXQncyBub3QgYW4gYXJyYXlcblx0XHRcdFx0XHRcdGlmICggXy5pc0VtcHR5KCBncm91cCApICYmIF8uaXNBcnJheSggZ3JvdXAgKSAgKSB7XG5cdFx0XHRcdFx0XHRcdGdyb3VwID0ge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGdyb3VwID0gdGhpcy5nZXRDb25kaXRpb25zR3JvdXBNb2RlbCggZ3JvdXAgKTtcblxuXHRcdFx0XHRcdFx0c2VsZi5tb2RlbC5zZXQoICdjb25kaXRpb25zLicgKyBncm91cElkLCBncm91cCwgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5hZGRHcm91cFRvUGFuZWwoIGdyb3VwLCAncmVuZGVyJyApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5hZGROZXdHcm91cCgpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGFmdGVyUmVuZGVyKCkge1xuXHRcdFx0dGhpcy5iaW5kUmVtb3ZlQ29uZGl0aW9ucygpO1xuXHRcdH0sXG5cblx0XHRiaW5kUmVtb3ZlQ29uZGl0aW9ucygpIHtcblxuXHRcdFx0Ly8gUmVtb3ZlIGNvbmRpdGlvblxuXHRcdFx0JCggJyNodXN0bGUtY29uZGl0aW9ucy1ncm91cCAuaHVzdGxlLXJlbW92ZS12aXNpYmlsaXR5LWNvbmRpdGlvbicgKS5vZmYoICdjbGljaycgKS5vbiggJ2NsaWNrJywgJC5wcm94eSggdGhpcy5yZW1vdmVDb25kaXRpb24sIHRoaXMgKSApO1xuXG5cdFx0fSxcblxuXHRcdG9wZW5Db25kaXRpb25zTW9kYWwoIGUgKSB7XG5cblx0XHRcdGxldCBzZWxmID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0Z3JvdXBJZCA9ICR0aGlzLmRhdGEoICdncm91cC1pZCcgKSxcblx0XHRcdFx0c2F2ZWRDb25kaXRpb25zID0gdGhpcy5tb2RlbC5nZXQoICdjb25kaXRpb25zLicgKyBncm91cElkICksXG5cdFx0XHRcdGdyb3VwQ29uZGl0aW9ucyA9ICd1bmRlZmluZWQnICE9PSB0eXBlb2Ygc2F2ZWRDb25kaXRpb25zID8gT2JqZWN0LmtleXMoIHNhdmVkQ29uZGl0aW9ucy50b0pTT04oKSApIDogW10sXG5cdFx0XHRcdFZpc2liaWxpdHlNb2RhbFZpZXcgPSBIdXN0bGUuZ2V0KCAnTW9kYWxzLlZpc2liaWxpdHlfQ29uZGl0aW9ucycgKSxcblx0XHRcdFx0dmlzaWJpbGl0eU1vZGFsID0gbmV3IFZpc2liaWxpdHlNb2RhbFZpZXcoe1xuXHRcdFx0XHRcdGdyb3VwSWQ6IGdyb3VwSWQsXG5cdFx0XHRcdFx0Y29uZGl0aW9uczogZ3JvdXBDb25kaXRpb25zXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR2aXNpYmlsaXR5TW9kYWwub24oICdjb25kaXRpb25zOmFkZGVkJywgJC5wcm94eSggc2VsZi5hZGROZXdDb25kaXRpb25zLCBzZWxmICkgKTtcblxuXHRcdFx0dGhpcy5ncm91cElkID0gZ3JvdXBJZDtcblxuXHRcdFx0Ly8gU2hvdyBkaWFsb2dcblxuXHRcdFx0aWYgKCAnZG9uZScgIT09ICQoICdodG1sJyApLmRhdGEoICdzaG93LXdhcy1iaW5kJyApICkge1xuXHRcdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zJ10ub24oICdzaG93JywgZnVuY3Rpb24oIGRpYWxvZ0VsICkge1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWFkZC1jb25kaXRpb25zJyApLmRhdGEoICdncm91cF9pZCcsIHNlbGYuZ3JvdXBJZCApO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JCggJ2h0bWwnICkuZGF0YSggJ3Nob3ctd2FzLWJpbmQnLCAnZG9uZScgKTtcblx0XHRcdH1cblx0XHRcdFNVSS5kaWFsb2dzWydodXN0bGUtZGlhbG9nLS12aXNpYmlsaXR5LW9wdGlvbnMnXS5zaG93KCk7XG5cblx0XHR9LFxuXG5cdFx0YWRkTmV3Q29uZGl0aW9ucyggYXJncyApIHtcblxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRncm91cElkID0gYXJncy5ncm91cElkLFxuXHRcdFx0XHRjb25kaXRpb25zID0gYXJncy5jb25kaXRpb25zLFxuXHRcdFx0XHRncm91cCA9IHRoaXMubW9kZWwuZ2V0KCAnY29uZGl0aW9ucy4nICsgZ3JvdXBJZCApO1xuXG5cdFx0XHQkLmVhY2goIGNvbmRpdGlvbnMsICggaSwgaWQgKSA9PiB7XG5cdFx0XHRcdGlmICggZ3JvdXAuZ2V0KCBpZCApICkge1xuXG5cdFx0XHRcdFx0Ly8gSWYgdGhpcyBjb25kaXRpb24gaXMgYWxyZWFkeSBzZXQgZm9yIHRoaXMgZ3JvdXAsIGFib3J0LiBQcmV2ZW50IGR1cGxpY2F0ZWQgY29uZGl0aW9ucyBpbiBhIGdyb3VwLlxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VsZi5hZGRDb25kaXRpb25Ub1BhbmVsKCBpZCwge30sIGdyb3VwSWQsIGdyb3VwLCAnbmV3JyApO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuYmluZFJlbW92ZUNvbmRpdGlvbnMoKTtcblxuXHRcdFx0SHVzdGxlLkV2ZW50cy50cmlnZ2VyKCAndmlldy5yZW5kZXJlZCcsIHRoaXMgKTtcblxuXHRcdH0sXG5cblx0XHRhZGRHcm91cFRvUGFuZWwoIGdyb3VwLCBzb3VyY2UgKSB7XG5cblx0XHRcdC8vIFJlbmRlciB0aGlzIGdyb3VwIGNvbnRhaW5lci5cblx0XHRcdGxldCBncm91cElkID0gZ3JvdXAuZ2V0KCAnZ3JvdXBfaWQnICksXG5cdFx0XHRcdHRhcmdldENvbnRhaW5lciA9ICQoICcjaHVzdGxlLXZpc2liaWxpdHktY29uZGl0aW9ucy1ib3gnICksXG5cdFx0XHRcdF90ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLXZpc2liaWxpdHktZ3JvdXAtYm94LXRwbCcgKSxcblxuXHRcdFx0XHRodG1sID0gX3RlbXBsYXRlKCBfLmV4dGVuZCh7fSwge1xuXHRcdFx0XHRcdGdyb3VwSWQsXG5cdFx0XHRcdFx0YXBwbHlfb25fZmxvYXRpbmc6IGdyb3VwLmdldCggJ2FwcGx5X29uX2Zsb2F0aW5nJyApLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGFwcGx5X29uX2lubGluZTogZ3JvdXAuZ2V0KCAnYXBwbHlfb25faW5saW5lJyApLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGFwcGx5X29uX3dpZGdldDogZ3JvdXAuZ2V0KCAnYXBwbHlfb25fd2lkZ2V0JyApLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGFwcGx5X29uX3Nob3J0Y29kZTogZ3JvdXAuZ2V0KCAnYXBwbHlfb25fc2hvcnRjb2RlJyApLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdHNob3dfb3JfaGlkZV9jb25kaXRpb25zOiBncm91cC5nZXQoICdzaG93X29yX2hpZGVfY29uZGl0aW9ucycgKSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRmaWx0ZXJfdHlwZTogZ3JvdXAuZ2V0KCAnZmlsdGVyX3R5cGUnICkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0fSkgKTtcblxuXHRcdFx0JCggaHRtbCApLmluc2VydEJlZm9yZSggdGFyZ2V0Q29udGFpbmVyLmZpbmQoICcuaHVzdGxlLWFkZC1uZXctdmlzaWJpbGl0eS1ncm91cCcgKSApO1xuXG5cdFx0XHR0aGlzLmFjdGl2ZUNvbmRpdGlvbnNbIGdyb3VwSWQgXSA9IHt9O1xuXG5cdFx0XHQvLyBSZW5kZXIgZWFjaCBvZiB0aGlzIGdyb3VwJ3MgY29uZGl0aW9ucy5cblx0XHRcdGxldCBzZWxmID0gdGhpcyxcblx0XHRcdFx0Y29uZGl0aW9ucyA9IGdyb3VwLnRvSlNPTigpO1xuXG5cdFx0XHQkLmVhY2goIGNvbmRpdGlvbnMsIGZ1bmN0aW9uKCBpZCwgY29uZGl0aW9uICkge1xuXG5cdFx0XHRcdGlmICggJ29iamVjdCcgIT09IHR5cGVvZiBjb25kaXRpb24gKSB7XG5cblx0XHRcdFx0XHQvLyBJZiB0aGlzIHByb3BlcnR5IGlzIG5vdCBhbiBhY3R1YWwgY29uZGl0aW9uLCBsaWtlIFwiZ3JvdXBfaWRcIiwgb3IgXCJmaWx0ZXJfdHlwZVwiLFxuXHRcdFx0XHRcdC8vIGNvbnRpbnVlLiBDaGVjayB0aGUgbmV4dCBwcm9wZXJ0eSBhcyB0aGlzIGlzbid0IHRoZSBjb25kaXRpb24gd2Ugd2FudCB0byByZW5kZXIuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzZWxmLmFkZENvbmRpdGlvblRvUGFuZWwoIGlkLCBjb25kaXRpb24sIGdyb3VwSWQsIGdyb3VwLCBzb3VyY2UgKTtcblxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGFkZENvbmRpdGlvblRvUGFuZWwoIGlkLCBjb25kaXRpb24sIGdyb3VwSWQsIGdyb3VwLCBzb3VyY2UgKSB7XG5cblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBPcHRpbi5WaWV3LkNvbmRpdGlvbnNbIGlkIF0pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgJGNvbmRpdGlvbnNDb250YWluZXIgPSB0aGlzLiQoICcjaHVzdGxlLXZpc2liaWxpdHktZ3JvdXAtJyArIGdyb3VwSWQgKyAnIC5zdWktYm94LWJ1aWxkZXItYm9keScgKSxcblx0XHRcdFx0dGhpc0NvbmRpdGlvbiA9ICBuZXcgT3B0aW4uVmlldy5Db25kaXRpb25zWyBpZCBdKHtcblx0XHRcdFx0XHR0eXBlOiB0aGlzLm1vZHVsZVR5cGUsXG5cdFx0XHRcdFx0bW9kZWw6IGdyb3VwLFxuXHRcdFx0XHRcdGdyb3VwSWQ6IGdyb3VwSWQsXG5cdFx0XHRcdFx0c291cmNlXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoICEgdGhpc0NvbmRpdGlvbiApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGVyZSBhcmVuJ3Qgb3RoZXIgY29uZGl0aW9ucyByZW5kZXJlZCB3aXRoaW4gdGhlIGdyb3VwLCBlbXB0eSBpdCBmb3IgYWRkaW5nIG5ldyBjb25kaXRpb25zLlxuXHRcdFx0aWYgKCAhICRjb25kaXRpb25zQ29udGFpbmVyLmZpbmQoICcuc3VpLWJ1aWxkZXItZmllbGQnICkubGVuZ3RoICkge1xuXHRcdFx0XHQkY29uZGl0aW9uc0NvbnRhaW5lci5maW5kKCAnLnN1aS1ib3gtYnVpbGRlci1tZXNzYWdlLWJsb2NrJyApLmhpZGUoKTtcblx0XHRcdFx0JGNvbmRpdGlvbnNDb250YWluZXIuZmluZCggJy5zdWktYnV0dG9uLWRhc2hlZCcgKS5zaG93KCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggJC5pc0VtcHR5T2JqZWN0KCBjb25kaXRpb24gKSApIHtcblx0XHRcdFx0Z3JvdXAuc2V0KCBpZCwgdGhpc0NvbmRpdGlvbi5nZXRDb25maWdzKCkgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdyb3VwLnNldCggaWQsIGNvbmRpdGlvbiApO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5hY3RpdmVDb25kaXRpb25zWyBncm91cElkIF1bIGlkIF0gPSB0aGlzQ29uZGl0aW9uO1xuXG5cdFx0XHQkKCB0aGlzQ29uZGl0aW9uLiRlbCApLmFwcGVuZFRvKCAkY29uZGl0aW9uc0NvbnRhaW5lci5maW5kKCAnLnN1aS1idWlsZGVyLWZpZWxkcycgKSApO1xuXG5cdFx0XHRyZXR1cm4gdGhpc0NvbmRpdGlvbjtcblx0XHR9LFxuXG5cdFx0YWRkTmV3R3JvdXAoKSB7XG5cblx0XHRcdGxldCBncm91cCA9IHRoaXMuZ2V0Q29uZGl0aW9uc0dyb3VwTW9kZWwoKSxcblx0XHRcdFx0Z3JvdXBJZCA9IGdyb3VwLmdldCggJ2dyb3VwX2lkJyApO1xuXG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2NvbmRpdGlvbnMuJyArIGdyb3VwSWQsIGdyb3VwICk7XG5cblx0XHRcdHRoaXMuYWRkR3JvdXBUb1BhbmVsKCBncm91cCwgJ25ldycgKTtcblxuXHRcdFx0SHVzdGxlLkV2ZW50cy50cmlnZ2VyKCAndmlldy5yZW5kZXJlZCcsIHRoaXMgKTtcblx0XHR9LFxuXG5cdFx0c3dpdGNoQ29uZGl0aW9ucyggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGN1cnJlbnRJZCA9ICR0aGlzLnByb3AoICdpZCcgKTtcblxuXHRcdFx0aWYgKCAnaHVzdGxlLXdjLWNvbmRpdGlvbnMnID09PSBjdXJyZW50SWQgKSB7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zIC5nZW5lcmFsX2NvbmRpdGlvbicgKS5oaWRlKCk7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zIC53Y19jb25kaXRpb24nICkuc2hvdygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCggJyNodXN0bGUtZGlhbG9nLS12aXNpYmlsaXR5LW9wdGlvbnMgLndjX2NvbmRpdGlvbicgKS5oaWRlKCk7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRpYWxvZy0tdmlzaWJpbGl0eS1vcHRpb25zIC5nZW5lcmFsX2NvbmRpdGlvbicgKS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJlbW92ZUdyb3VwKCBlICkge1xuXG5cdFx0XHRsZXQgZ3JvdXBJZCA9ICQoIGUuY3VycmVudFRhcmdldCApLmRhdGEoICdncm91cC1pZCcgKSxcblx0XHRcdFx0JGdyb3VwQ29udGFpbmVyID0gdGhpcy4kKCAnI2h1c3RsZS12aXNpYmlsaXR5LWdyb3VwLScgKyBncm91cElkICk7XG5cblx0XHRcdC8vIFJlbW92ZSB0aGUgZ3JvdXAgZnJvbSB0aGUgbW9kZWwuXG5cdFx0XHRkZWxldGUgdGhpcy5hY3RpdmVDb25kaXRpb25zWyBncm91cElkIF07XG5cdFx0XHR0aGlzLm1vZGVsLmdldCggJ2NvbmRpdGlvbnMnICkudW5zZXQoIGdyb3VwSWQgKTtcblxuXHRcdFx0Ly8gUmVtb3ZlIHRoZSBncm91cCBjb250YWluZXIgZnJvbSB0aGUgcGFnZS5cblx0XHRcdCRncm91cENvbnRhaW5lci5yZW1vdmUoKTtcblxuXHRcdFx0Ly8gSWYgdGhlIGxhc3QgZ3JvdXAgd2FzIHJlbW92ZWQsIGFkZCBhIG5ldyBncm91cCBzbyB0aGUgcGFnZSBpcyBub3QgZW1wdHkuXG5cdFx0XHRpZiAoICEgT2JqZWN0LmtleXMoIHRoaXMuYWN0aXZlQ29uZGl0aW9ucyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy5hZGROZXdHcm91cCgpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHJlbW92ZUNvbmRpdGlvbiggZSApIHtcblxuXHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGNvbmRpdGlvbklkID0gICR0aGlzLmRhdGEoICdjb25kaXRpb24taWQnICksXG5cdFx0XHRcdGdyb3VwSWQgPSAkdGhpcy5kYXRhKCAnZ3JvdXAtaWQnICksXG5cdFx0XHRcdCRjb25kaXRpb25zQ29udGFpbmVyID0gdGhpcy4kKCAnI2h1c3RsZS12aXNpYmlsaXR5LWdyb3VwLScgKyBncm91cElkICsgJyAuc3VpLWJveC1idWlsZGVyLWJvZHknICksXG5cdFx0XHRcdHRoaXNDb25kaXRpb24gPSB0aGlzLmFjdGl2ZUNvbmRpdGlvbnNbIGdyb3VwSWQgXVsgY29uZGl0aW9uSWQgXTtcblxuXHRcdFx0dGhpc0NvbmRpdGlvbi5yZW1vdmUoKTtcblxuXHRcdFx0ZGVsZXRlIHRoaXMuYWN0aXZlQ29uZGl0aW9uc1sgZ3JvdXBJZCBdWyBjb25kaXRpb25JZCBdO1xuXG5cdFx0XHR0aGlzLm1vZGVsLmdldCggJ2NvbmRpdGlvbnMuJyArIGdyb3VwSWQgKS51bnNldCggY29uZGl0aW9uSWQgKTtcblxuXHRcdFx0aWYgKCAhICRjb25kaXRpb25zQ29udGFpbmVyLmZpbmQoICcuc3VpLWJ1aWxkZXItZmllbGQnICkubGVuZ3RoICkge1xuXHRcdFx0XHQkY29uZGl0aW9uc0NvbnRhaW5lci5maW5kKCAnLnN1aS1ib3gtYnVpbGRlci1tZXNzYWdlLWJsb2NrJyApLnNob3coKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5iaW5kUmVtb3ZlQ29uZGl0aW9ucygpO1xuXHRcdH0sXG5cblx0XHR1cGRhdGVBdHRyaWJ1dGUoIGUgKSB7XG5cblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdGxldCAkdGhpcyA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGdyb3VwSWQgPSAkdGhpcy5kYXRhKCAnZ3JvdXAtaWQnICksXG5cdFx0XHRcdGF0dHJpYnV0ZSA9ICR0aGlzLmRhdGEoICdhdHRyaWJ1dGUnICksXG5cdFx0XHRcdHZhbHVlID0gJHRoaXMudmFsKCksXG5cdFx0XHRcdGdyb3VwID0gdGhpcy5tb2RlbC5nZXQoICdjb25kaXRpb25zLicgKyBncm91cElkICk7XG5cblx0XHRcdGdyb3VwLnNldCggYXR0cmlidXRlLCB2YWx1ZSApO1xuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZUdyb3VwQXBwbHlPbiggZSApIHtcblxuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0bGV0ICR0aGlzID0gJCggZS50YXJnZXQgKSxcblx0XHRcdFx0Z3JvdXBJZCA9ICR0aGlzLmRhdGEoICdncm91cC1pZCcgKSxcblx0XHRcdFx0YXR0cmlidXRlID0gJHRoaXMuZGF0YSggJ3Byb3BlcnR5JyApLFxuXHRcdFx0XHR2YWx1ZSA9ICR0aGlzLmlzKCAnOmNoZWNrZWQnICksXG5cdFx0XHRcdGdyb3VwID0gdGhpcy5tb2RlbC5nZXQoICdjb25kaXRpb25zLicgKyBncm91cElkICk7XG5cblx0XHRcdGlmICggJ2VtYmVkZGVkJyA9PT0gdGhpcy5tb2R1bGVUeXBlICYmIC0xICE9PSAkLmluQXJyYXkoIGF0dHJpYnV0ZSwgWyAnYXBwbHlfb25faW5saW5lJywgJ2FwcGx5X29uX3dpZGdldCcsICdhcHBseV9vbl9zaG9ydGNvZGUnIF0pIHx8XG5cdFx0XHRcdCdzb2NpYWxfc2hhcmluZycgPT09IHRoaXMubW9kdWxlVHlwZSAmJiAtMSAhPT0gJC5pbkFycmF5KCBhdHRyaWJ1dGUsIFsgJ2FwcGx5X29uX2Zsb2F0aW5nJywgJ2FwcGx5X29uX2lubGluZScsICdhcHBseV9vbl93aWRnZXQnLCAnYXBwbHlfb25fc2hvcnRjb2RlJyBdKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGdyb3VwLnNldCggYXR0cmlidXRlLCB2YWx1ZSApO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGdldENvbmRpdGlvbnNHcm91cE1vZGVsKCBncm91cCApIHtcblxuXHRcdFx0aWYgKCAhIGdyb3VwICkge1xuXG5cdFx0XHRcdGxldCBncm91cElkID0gKCBuZXcgRGF0ZSgpLmdldFRpbWUoKSApLnRvU3RyaW5nKCAxNiApO1xuXG5cdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLm1vZGVsLmdldCggJ2NvbmRpdGlvbnMuJyArIGdyb3VwSWQgKSApIHtcblxuXHRcdFx0XHRcdC8vIFRPRE86IGNyZWF0ZSBhbm90aGVyIGdyb3VwX2lkIHdoaWxlIHRoZSBncm91cCBpZCBleGlzdHMuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRncm91cCA9IHtcblx0XHRcdFx0XHRncm91cF9pZDogZ3JvdXBJZCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRzaG93X29yX2hpZGVfY29uZGl0aW9uczogJ3Nob3cnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGZpbHRlcl90eXBlOiAnYWxsJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmICggJ2VtYmVkZGVkJyA9PT0gdGhpcy5tb2R1bGVUeXBlICkge1xuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX2lubGluZSA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0Z3JvdXAuYXBwbHlfb25fd2lkZ2V0ID0gdHJ1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRncm91cC5hcHBseV9vbl9zaG9ydGNvZGUgPSBmYWxzZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0fSBlbHNlIGlmICggJ3NvY2lhbF9zaGFyaW5nJyA9PT0gdGhpcy5tb2R1bGVUeXBlICkge1xuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX2Zsb2F0aW5nID0gdHJ1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0XHRncm91cC5hcHBseV9vbl9pbmxpbmUgPSB0cnVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX3dpZGdldCA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0Z3JvdXAuYXBwbHlfb25fc2hvcnRjb2RlID0gZmFsc2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmICggJ2VtYmVkZGVkJyA9PT0gdGhpcy5tb2R1bGVUeXBlICYmICggISBncm91cC5hcHBseV9vbl9pbmxpbmUgfHwgISBncm91cC5hcHBseV9vbl93aWRnZXQgIHx8ICEgZ3JvdXAuYXBwbHlfb25fc2hvcnRjb2RlICkgKSB7XG5cblx0XHRcdFx0aWYgKCAhIGdyb3VwLmFwcGx5X29uX2lubGluZSApIHtcblx0XHRcdFx0XHRncm91cC5hcHBseV9vbl9pbmxpbmUgPSB0cnVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggISBncm91cC5hcHBseV9vbl93aWRnZXQgKSB7XG5cdFx0XHRcdFx0Z3JvdXAuYXBwbHlfb25fd2lkZ2V0ID0gdHJ1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoICEgZ3JvdXAuYXBwbHlfb25fc2hvcnRjb2RlICkge1xuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX3Nob3J0Y29kZSA9IGZhbHNlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZiAoICdzb2NpYWxfc2hhcmluZycgPT09IHRoaXMubW9kdWxlVHlwZSAmJiAoICEgZ3JvdXAuYXBwbHlfb25fZmxvYXRpbmcgfHwgISBncm91cC5hcHBseV9vbl9pbmxpbmUgIHx8ICEgZ3JvdXAuYXBwbHlfb25fd2lkZ2V0IHx8ICEgZ3JvdXAuYXBwbHlfb25fc2hvcnRjb2RlICkgKSB7XG5cblx0XHRcdFx0aWYgKCAhIGdyb3VwLmFwcGx5X29uX2Zsb2F0aW5nICkge1xuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX2Zsb2F0aW5nID0gdHJ1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoICEgZ3JvdXAuYXBwbHlfb25faW5saW5lICkge1xuXHRcdFx0XHRcdGdyb3VwLmFwcGx5X29uX2lubGluZSA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCAhIGdyb3VwLmFwcGx5X29uX3dpZGdldCApIHtcblx0XHRcdFx0XHRncm91cC5hcHBseV9vbl93aWRnZXQgPSB0cnVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggISBncm91cC5hcHBseV9vbl9zaG9ydGNvZGUgKSB7XG5cdFx0XHRcdFx0Z3JvdXAuYXBwbHlfb25fc2hvcnRjb2RlID0gZmFsc2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaE1vZGVsID0gSHVzdGxlLmdldCggJ01vZGVsJyApLFxuXHRcdFx0XHRncm91cE1vZGVsID0gbmV3IGhNb2RlbCggZ3JvdXAgKTtcblxuXHRcdFx0cmV0dXJuIGdyb3VwTW9kZWw7XG5cdFx0fVxuXG5cdH0pO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTWl4aW5zLldpemFyZF9WaWV3JywgZnVuY3Rpb24oICQsIGRvYywgd2luICkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRyZXR1cm4ge1xuXG5cdFx0bW9kdWxlVHlwZTogJycsXG5cblx0XHRlbDogJy5zdWktd3JhcCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuc3VpLXNpZGVuYXYgLnN1aS12ZXJ0aWNhbC10YWIgYSc6ICdzaWRlbmF2Jyxcblx0XHRcdCdjbGljayBhLmh1c3RsZS1nby10by10YWInOiAnc2lkZW5hdicsXG5cdFx0XHQnY2xpY2sgYS5ub3RpZnktZXJyb3ItdGFiJzogJ3NpZGVuYXYnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtYWN0aW9uLXNhdmUnOiAnc2F2ZUNoYW5nZXMnLFxuXHRcdFx0J2NsaWNrIC53cG11ZGV2LWJ1dHRvbi1uYXZpZ2F0aW9uJzogJ2RvQnV0dG9uTmF2aWdhdGlvbicsXG5cdFx0XHQnY2hhbmdlICNodXN0bGUtbW9kdWxlLW5hbWUnOiAndXBkYXRlTW9kdWxlTmFtZScsXG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1wcmV2aWV3LW1vZHVsZSc6ICdwcmV2aWV3TW9kdWxlJyxcblx0XHRcdCdibHVyIGlucHV0LnN1aS1mb3JtLWNvbnRyb2wnOiAncmVtb3ZlRXJyb3JNZXNzYWdlJ1xuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBJbml0aWFsaXplIFdpemFyZFxuXHRcdGluaXQoIG9wdHMgKSB7XG5cblx0XHRcdHRoaXMuc2V0VGFic1ZpZXdzKCBvcHRzICk7XG5cblx0XHRcdEh1c3RsZS5FdmVudHMub2ZmKCAnbW9kdWxlcy52aWV3LnN3aXRjaF9zdGF0dXMnLCAkLnByb3h5KCB0aGlzLnN3aXRjaFN0YXR1c1RvLCB0aGlzICkgKTtcblx0XHRcdEh1c3RsZS5FdmVudHMub24oICdtb2R1bGVzLnZpZXcuc3dpdGNoX3N0YXR1cycsICQucHJveHkoIHRoaXMuc3dpdGNoU3RhdHVzVG8sIHRoaXMgKSApO1xuXG5cdFx0XHQkKCB3aW4gKS5vZmYoICdwb3BzdGF0ZScsICQucHJveHkoIHRoaXMudXBkYXRlVGFiT25Qb3BzdGF0ZSwgdGhpcyApICk7XG5cdFx0XHQkKCB3aW4gKS5vbiggJ3BvcHN0YXRlJywgJC5wcm94eSggdGhpcy51cGRhdGVUYWJPblBvcHN0YXRlLCB0aGlzICkgKTtcblxuXHRcdFx0JCggZG9jdW1lbnQgKS5vZmYoICd0aW55bWNlLWVkaXRvci1pbml0JywgJC5wcm94eSggdGhpcy50aW55bWNlUmVhZHksIHRoaXMgKSApO1xuXHRcdFx0JCggZG9jdW1lbnQgKS5vbiggJ3RpbnltY2UtZWRpdG9yLWluaXQnLCAkLnByb3h5KCB0aGlzLnRpbnltY2VSZWFkeSwgdGhpcyApICk7XG5cblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLl9ldmVudHMgKSB7XG5cdFx0XHRcdHRoaXMuZXZlbnRzID0gJC5leHRlbmQoIHRydWUsIHt9LCB0aGlzLmV2ZW50cywgdGhpcy5fZXZlbnRzICk7XG5cdFx0XHRcdHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5yZW5kZXJUYWJzKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEFzc2lnbiB0aGUgdGFicyB2aWV3cyB0byB0aGUgb2JqZWN0LlxuXHRcdCAqIE92ZXJyaWRkZW4gYnkgc29jaWFsIHNoYXJlLlxuXHRcdCAqIEBwYXJhbSBvYmplY3Qgb3B0c1xuXHRcdCAqL1xuXHRcdHNldFRhYnNWaWV3cyggb3B0cyApIHtcblxuXHRcdFx0dGhpcy5jb250ZW50VmlldyAgICA9IG9wdHMuY29udGVudFZpZXc7XG5cdFx0XHR0aGlzLmVtYWlsc1ZpZXcgICAgID0gb3B0cy5lbWFpbHNWaWV3O1xuXHRcdFx0dGhpcy5kZXNpZ25WaWV3ICAgICA9IG9wdHMuZGVzaWduVmlldztcblx0XHRcdHRoaXMuaW50ZWdyYXRpb25zVmlldyA9IG9wdHMuaW50ZWdyYXRpb25zVmlldztcblx0XHRcdHRoaXMudmlzaWJpbGl0eVZpZXcgPSBvcHRzLnZpc2liaWxpdHlWaWV3O1xuXHRcdFx0dGhpcy5zZXR0aW5nc1ZpZXcgICA9IG9wdHMuc2V0dGluZ3NWaWV3O1xuXHRcdFx0dGhpcy5tb2R1bGVUeXBlID0gdGhpcy5tb2RlbC5nZXQoICdtb2R1bGVfdHlwZScgKTtcblxuXHRcdFx0aWYgKCAnZW1iZWRkZWQnID09PSB0aGlzLm1vZHVsZVR5cGUgKSB7XG5cdFx0XHRcdHRoaXMuZGlzcGxheVZpZXcgID0gb3B0cy5kaXNwbGF5Vmlldztcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0Ly8gUmVuZGVyIGNvbnRlbnRcblxuXHRcdC8qKlxuXHRcdCAqIFJlbmRlciB0aGUgdGFicy5cblx0XHQgKiBPdmVycmlkZGVuIGJ5IHNvY2lhbCBzaGFyZS5cblx0XHQgKi9cblx0XHRyZW5kZXJUYWJzKCkge1xuXG5cdFx0XHQvLyBDb250ZW50IHZpZXdcblx0XHRcdHRoaXMuY29udGVudFZpZXcuZGVsZWdhdGVFdmVudHMoKTtcblxuXHRcdFx0Ly8gRW1haWxzIHZpZXdcblx0XHRcdHRoaXMuZW1haWxzVmlldy5kZWxlZ2F0ZUV2ZW50cygpO1xuXG5cdFx0XHQvLyBJbnRlZ3JhdGlvbnMgdmlld1xuXHRcdFx0dGhpcy5pbnRlZ3JhdGlvbnNWaWV3LmRlbGVnYXRlRXZlbnRzKCk7XG5cblx0XHRcdC8vIEFwcGVhcmFuY2Ugdmlld1xuXHRcdFx0dGhpcy5kZXNpZ25WaWV3LmRlbGVnYXRlRXZlbnRzKCk7XG5cblx0XHRcdC8vIERpc3BsYXkgT3B0aW9ucyBWaWV3XG5cdFx0XHRpZiAoICdlbWJlZGRlZCcgPT09IHRoaXMubW9kdWxlVHlwZSApIHtcblx0XHRcdFx0dGhpcy5kaXNwbGF5Vmlldy5kZWxlZ2F0ZUV2ZW50cygpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBWaXNpYmlsaXR5IHZpZXdcblx0XHRcdHRoaXMudmlzaWJpbGl0eVZpZXcuZGVsZWdhdGVFdmVudHMoKTtcblx0XHRcdHRoaXMudmlzaWJpbGl0eVZpZXcuYWZ0ZXJSZW5kZXIoKTtcblxuXHRcdFx0Ly8gQmVoYXZpb3Igdmlld1xuXHRcdFx0dGhpcy5zZXR0aW5nc1ZpZXcuZGVsZWdhdGVFdmVudHMoKTtcblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0Ly8gU2lkZSBOYXZpZ2F0aW9uXG5cdFx0c2lkZW5hdiggZSApIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0IHRhYk5hbWUgPSAkKCBlLnRhcmdldCApLmRhdGEoICd0YWInICk7XG5cblx0XHRcdGlmICggdGFiTmFtZSApIHtcblx0XHRcdFx0dGhpcy5nb1RvVGFiKCB0YWJOYW1lLCB0cnVlICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGdvVG9UYWIoIHRhYk5hbWUsIHVwZGF0ZUhpc3RvcnkgKSB7XG5cblx0XHRcdGxldCAkdGFiIFx0ID0gdGhpcy4kZWwuZmluZCggJ2FbZGF0YS10YWI9XCInICsgdGFiTmFtZSArICdcIl0nICksXG5cdFx0XHRcdCRzaWRlbmF2ID0gJHRhYi5jbG9zZXN0KCAnLnN1aS12ZXJ0aWNhbC10YWJzJyApLFxuXHRcdFx0XHQkdGFicyAgICA9ICRzaWRlbmF2LmZpbmQoICcuc3VpLXZlcnRpY2FsLXRhYiBhJyApLFxuXHRcdFx0XHQkY29udGVudCA9IHRoaXMuJGVsLmZpbmQoICcuc3VpLWJveFtkYXRhLXRhYl0nICksXG5cdFx0XHRcdCRjdXJyZW50ID0gdGhpcy4kZWwuZmluZCggJy5zdWktYm94W2RhdGEtdGFiPVwiJyArIHRhYk5hbWUgKyAnXCJdJyApO1xuXG5cdFx0XHRpZiAoIHVwZGF0ZUhpc3RvcnkgKSB7XG5cblx0XHRcdFx0Ly8gVGhlIG1vZHVsZSBpZCBtdXN0IGJlIGRlZmluZWQgYXQgdGhpcyBwb2ludC5cblx0XHRcdFx0Ly8gSWYgaXQncyBub3QsIHRoZSB1c2VyIHNob3VsZCBiZSByZWRpcmVjdGVkIHRvIHRoZSBsaXN0aW5nIHBhZ2UgdG8gcHJvcGVybHkgY3JlYXRlIGEgbW9kdWxlIGJlZm9yZSByZWFjaGluZyB0aGlzLlxuXHRcdFx0XHRsZXQgc3RhdGUgPSB7IHRhYk5hbWUgfSxcblx0XHRcdFx0bW9kdWxlSWQgPSB0aGlzLm1vZGVsLmdldCggJ21vZHVsZV9pZCcgKTtcblxuXHRcdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZSggc3RhdGUsICdIdXN0bGUgJyArIHRoaXMubW9kdWxlVHlwZSArICcgd2l6YXJkJywgJ2FkbWluLnBocD9wYWdlPScgKyBvcHRpblZhcnMuY3VycmVudC53aXphcmRfcGFnZSArICcmaWQ9JyArIG1vZHVsZUlkICsgJyZzZWN0aW9uPScgKyB0YWJOYW1lICApO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGFicy5yZW1vdmVDbGFzcyggJ2N1cnJlbnQnICk7XG5cdFx0XHQkY29udGVudC5oaWRlKCk7XG5cblx0XHRcdCR0YWIuYWRkQ2xhc3MoICdjdXJyZW50JyApO1xuXHRcdFx0JGN1cnJlbnQuc2hvdygpO1xuXG5cdFx0XHQkKCAnLnN1aS13cmFwLWh1c3RsZScgKVswXS5zY3JvbGxJbnRvVmlldygpO1xuXHRcdH0sXG5cblx0XHQvLyBLZWVwIHRoZSBzeW5jIG9mIHRoZSBzaG93biB0YWIgYW5kIHRoZSBVUkwgd2hlbiBnb2luZyBcImJhY2tcIiB3aXRoIHRoZSBicm93c2VyLlxuXHRcdHVwZGF0ZVRhYk9uUG9wc3RhdGUoIGUgKSB7XG5cdFx0XHR2YXIgc3RhdGUgPSBlLm9yaWdpbmFsRXZlbnQuc3RhdGU7XG5cblx0XHRcdGlmICggc3RhdGUgKSB7XG5cdFx0XHRcdHRoaXMuZ29Ub1RhYiggc3RhdGUudGFiTmFtZSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBHbyB0byBoZSBcIm5leHRcIiBhbmQgXCJwcmV2aW91c1wiIHRhYiB3aGVuIHVzaW5nIHRoZSBidXR0b25zIGF0IHRoZSBib3R0b20gb2YgdGhlIHdpemFyZC5cblx0XHRkb0J1dHRvbk5hdmlnYXRpb24oIGUgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRsZXQgJGJ1dHRvbiA9ICQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdGRpcmVjdGlvbiA9ICdwcmV2JyA9PT0gJGJ1dHRvbi5kYXRhKCAnZGlyZWN0aW9uJyApID8gJ3ByZXYnIDogJ25leHQnLFxuXHRcdFx0XHRuZXh0VGFiTmFtZSA9IHRoaXMuZ2V0TmV4dE9yUHJldlRhYk5hbWUoIGRpcmVjdGlvbiApO1xuXG5cdFx0XHR0aGlzLmdvVG9UYWIoIG5leHRUYWJOYW1lLCB0cnVlICk7XG5cblx0XHR9LFxuXG5cdFx0Ly8gR2V0IHRoZSBuYW1lIG9mIHRoZSBwcmV2aW91cyBvciBuZXh0IHRhYi5cblx0XHRnZXROZXh0T3JQcmV2VGFiTmFtZSggZGlyZWN0aW9uICkge1xuXHRcdFx0dmFyIGN1cnJlbnQgPSAkKCAnI2h1c3RsZS1tb2R1bGUtd2l6YXJkLXZpZXcgLnN1aS1zaWRlbmF2IHVsIGxpIGEuY3VycmVudCcgKSxcblx0XHRcdFx0dGFiID0gY3VycmVudC5kYXRhKCAndGFiJyApO1xuXG5cdFx0XHRpZiAoICdwcmV2JyA9PT0gZGlyZWN0aW9uICkge1xuXHRcdFx0XHR0YWIgPSBjdXJyZW50LnBhcmVudCgpLnByZXYoKS5maW5kKCAnYScgKS5kYXRhKCAndGFiJyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFiID0gY3VycmVudC5wYXJlbnQoKS5uZXh0KCkuZmluZCggJ2EnICkuZGF0YSggJ3RhYicgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRhYjtcblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0Ly8gVGlueU1DRVxuXG5cdFx0Ly8gTWFyayB0aGUgd2l6YXJkIGFzIFwidW5zYXZlZFwiIHdoZW4gdGhlIHRpbnltY2UgZWRpdG9ycyBoYWQgYSBjaGFuZ2UuXG5cdFx0dGlueW1jZVJlYWR5KCBlLCBlZGl0b3IgKSB7XG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRcdGVkaXRvci5vbiggJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdFx0aWYgKCAhIE1vZHVsZS5oYXNDaGFuZ2VzICkge1xuXHRcdFx0XHRcdHNlbGYuY29udGVudFZpZXcubW9kZWwudXNlckhhc0NoYW5nZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdCQoICd0ZXh0YXJlYSMnICsgZWRpdG9yLmlkICkub24oICdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHRcdGlmICggISBNb2R1bGUuaGFzQ2hhbmdlcyApIHtcblx0XHRcdFx0XHRzZWxmLmNvbnRlbnRWaWV3Lm1vZGVsLnVzZXJIYXNDaGFuZ2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdHNldENvbnRlbnRGcm9tVGlueW1jZSgga2VlcFNpbGVudCA9IGZhbHNlICkge1xuXG5cdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGlueU1DRSApIHtcblxuXHRcdFx0XHQvLyBtYWluX2NvbnRlbnQgZWRpdG9yXG5cdFx0XHRcdGxldCBtYWluQ29udGVudEVkaXRvciA9IHRpbnlNQ0UuZ2V0KCAnbWFpbl9jb250ZW50JyApLFxuXHRcdFx0XHRcdCRtYWluQ29udGVudFRleHRhcmVhID0gdGhpcy4kKCAndGV4dGFyZWEjbWFpbl9jb250ZW50JyApLFxuXHRcdFx0XHRcdG1haW5Db250ZW50ID0gKCAndHJ1ZScgPT09ICRtYWluQ29udGVudFRleHRhcmVhLmF0dHIoICdhcmlhLWhpZGRlbicgKSApID8gbWFpbkNvbnRlbnRFZGl0b3IuZ2V0Q29udGVudCgpIDogJG1haW5Db250ZW50VGV4dGFyZWEudmFsKCk7XG5cblx0XHRcdFx0dGhpcy5jb250ZW50Vmlldy5tb2RlbC5zZXQoICdtYWluX2NvbnRlbnQnLCBtYWluQ29udGVudCwge1xuXHRcdFx0XHRcdHNpbGVudDoga2VlcFNpbGVudFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBzdWNjZXNzX21lc3NhZ2UgZWRpdG9yXG5cdFx0XHRcdGxldCBzdWNjZXNzTWVzc2FnZUVkaXRvciA9IHRpbnlNQ0UuZ2V0KCAnc3VjY2Vzc19tZXNzYWdlJyApLFxuXHRcdFx0XHRcdCRzdWNjZXNzTWVzc2FnZVRleHRhcmVhID0gdGhpcy4kKCAndGV4dGFyZWEjc3VjY2Vzc19tZXNzYWdlJyApLFxuXHRcdFx0XHRcdHN1Y2Nlc3NNZXNzYWdlID0gKCAndHJ1ZScgPT09ICRzdWNjZXNzTWVzc2FnZVRleHRhcmVhLmF0dHIoICdhcmlhLWhpZGRlbicgKSApID8gc3VjY2Vzc01lc3NhZ2VFZGl0b3IuZ2V0Q29udGVudCgpIDogJHN1Y2Nlc3NNZXNzYWdlVGV4dGFyZWEudmFsKCk7XG5cblx0XHRcdFx0dGhpcy5lbWFpbHNWaWV3Lm1vZGVsLnNldCggJ3N1Y2Nlc3NfbWVzc2FnZScsIHN1Y2Nlc3NNZXNzYWdlLCB7XG5cdFx0XHRcdFx0c2lsZW50OiBrZWVwU2lsZW50XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIGVtYWlsX2JvZHkgZWRpdG9yXG5cdFx0XHRcdGxldCBlbWFpbEJvZHlFZGl0b3IgPSB0aW55TUNFLmdldCggJ2VtYWlsX2JvZHknICksXG5cdFx0XHRcdFx0JGVtYWlsQm9keVRleHRhcmVhID0gdGhpcy4kKCAndGV4dGFyZWEjZW1haWxfYm9keScgKSxcblx0XHRcdFx0XHRlbWFpbEJvZHkgPSAoICd0cnVlJyA9PT0gJHN1Y2Nlc3NNZXNzYWdlVGV4dGFyZWEuYXR0ciggJ2FyaWEtaGlkZGVuJyApICkgPyBlbWFpbEJvZHlFZGl0b3IuZ2V0Q29udGVudCgpIDogJGVtYWlsQm9keVRleHRhcmVhLnZhbCgpO1xuXG5cdFx0XHRcdHRoaXMuZW1haWxzVmlldy5tb2RlbC5zZXQoICdlbWFpbF9ib2R5JywgZW1haWxCb2R5LCB7XG5cdFx0XHRcdFx0c2lsZW50OiBrZWVwU2lsZW50XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdC8vIFNhbml0aXplIERhdGFcblx0XHRzYW5pdGl6ZURhdGEoKSB7XG5cblx0XHRcdC8vIENhbGwgdG8gYWN0aW9uXG5cdFx0XHR2YXIgY3RhVXJsID0gdGhpcy5jb250ZW50Vmlldy5tb2RlbC5nZXQoICdjdGFfdXJsJyApO1xuXG5cdFx0XHRpZiAoICEgL14oZnxodCl0cHM/OlxcL1xcLy9pLnRlc3QoIGN0YVVybCApICkge1xuXHRcdFx0XHRjdGFVcmwgPSAnaHR0cHM6Ly8nICsgY3RhVXJsO1xuXHRcdFx0XHR0aGlzLmNvbnRlbnRWaWV3Lm1vZGVsLnNldCggJ2N0YV91cmwnLCBjdGFVcmwsIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDdXN0b20gQ1NTXG5cdFx0XHR0aGlzLmRlc2lnblZpZXcudXBkYXRlQ3VzdG9tQ3NzKCk7XG5cblx0XHR9LFxuXG5cdFx0dmFsaWRhdGUoKSB7XG5cblx0XHRcdHRoaXMuc2V0Q29udGVudEZyb21UaW55bWNlKCB0cnVlICk7XG5cdFx0XHR0aGlzLnNhbml0aXplRGF0YSgpO1xuXG5cdFx0XHQvLyBQcmVwYXJpZyB0aGUgZGF0YVxuXHRcdFx0bGV0IG1lICAgICAgID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgICAgPSB0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1tb2R1bGUtd2l6YXJkLXZpZXcnICksXG5cdFx0XHRcdGlkICAgICAgID0gKCAhICR0aGlzLmRhdGEoICdpZCcgKSApID8gJy0xJyA6ICR0aGlzLmRhdGEoICdpZCcgKSxcblx0XHRcdFx0bm9uY2UgICAgPSAkdGhpcy5kYXRhKCAnbm9uY2UnICksXG5cdFx0XHRcdG1vZHVsZSAgID0gdGhpcy5tb2RlbC50b0pTT04oKSxcblx0XHRcdFx0ZGF0YSBcdCA9IHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfdmFsaWRhdGVfbW9kdWxlJyxcblx0XHRcdFx0XHQnX2FqYXhfbm9uY2UnOiBub25jZSxcblx0XHRcdFx0XHRpZCxcblx0XHRcdFx0XHRtb2R1bGVcblx0XHRcdFx0fTtcblxuXHRcdFx0Xy5leHRlbmQoIGRhdGEsIHRoaXMuZ2V0RGF0YVRvU2F2ZSgpICk7XG5cblx0XHRcdC8vIGFqYXggc2F2ZSBoZXJlXG5cdFx0XHRyZXR1cm4gJC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCByZXN1bHQgKSB7XG5cblx0XHRcdFx0XHRpZiAoIHRydWUgPT09IHJlc3VsdC5zdWNjZXNzICkge1xuXG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBoYW5kbGUgZXJyb3JzLiBTdWNoIGFzIHdoZW4gbm9uY2VzIGV4cGlyZSB3aGVuIHlvdSBsZWF2ZSB0aGUgd2luZG93IG9wZW5kIGZvciBsb25nLlxuXG5cdFx0XHRcdFx0XHQvLyBUaGUgY2hhbmdlcyB3ZXJlIGFscmVhZHkgc2F2ZWQuXG5cdFx0XHRcdFx0XHRNb2R1bGUuaGFzQ2hhbmdlcyA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHQvLyBDaGFuZ2UgdGhlIFwiUGVuZGluZyBjaGFuZ2VzXCIgbGFiZWwgdG8gXCJTYXZlZFwiLlxuXHRcdFx0XHRcdFx0bWUuc3dpdGNoU3RhdHVzVG8oICdzYXZlZCcgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV0IGVycm9ycyA9IHJlc3VsdC5kYXRhLFxuXHRcdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2UgPSAnJztcblxuXHRcdFx0XHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGVycm9ycy5kYXRhLmljb25fZXJyb3IgKSB7XG5cdFx0XHRcdFx0XHRcdF8uZWFjaCggZXJyb3JzLmRhdGEuaWNvbl9lcnJvciwgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRcdFx0XHRcdCQoICcjaHVzdGxlLXBsYXRmb3JtLScgKyBlcnJvciApLmZpbmQoICcuc3VpLWVycm9yLW1lc3NhZ2UnICkuc2hvdygpO1xuXHRcdFx0XHRcdFx0XHRcdCQoICcjaHVzdGxlLXBsYXRmb3JtLScgKyBlcnJvciArICcgLmh1c3RsZS1zb2NpYWwtdXJsLWZpZWxkJyApLmFkZENsYXNzKCAnc3VpLWZvcm0tZmllbGQtZXJyb3InICk7XG5cdFx0XHRcdFx0XHRcdFx0JCggJyNodXN0bGUtcGxhdGZvcm0tJyArIGVycm9yICkubm90KCAnLnN1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKS5maW5kKCAnLnN1aS1hY2NvcmRpb24tb3Blbi1pbmRpY2F0b3InICkuY2xpY2soKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlID0gJzxhIGhyZWY9XCIjXCIgZGF0YS10YWI9XCJzZXJ2aWNlc1wiIGNsYXNzPVwibm90aWZ5LWVycm9yLXRhYlwiPiBTZXJ2aWNlcyA8L2E+Jztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGVycm9ycy5kYXRhLnNlbGVjdG9yX2Vycm9yICkge1xuXHRcdFx0XHRcdFx0XHRfLmVhY2goIGVycm9ycy5kYXRhLnNlbGVjdG9yX2Vycm9yLCBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0XHRcdFx0XHRcdFx0JCggJ2lucHV0W25hbWU9XCInICsgZXJyb3IgKyAnX2Nzc19zZWxlY3RvclwiXScgKS5zaWJsaW5ncyggJy5zdWktZXJyb3ItbWVzc2FnZScgKS5zaG93KCk7XG5cblx0XHRcdFx0XHRcdFx0XHQkKCAnaW5wdXRbbmFtZT1cIicgKyBlcnJvciArICdfY3NzX3NlbGVjdG9yXCJdJyApLnBhcmVudCggJy5zdWktZm9ybS1maWVsZCcgKS5hZGRDbGFzcyggJ3N1aS1mb3JtLWZpZWxkLWVycm9yJyApO1xuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoICEgXy5pc0VtcHR5KCBlcnJvck1lc3NhZ2UgKSApIHtcblx0XHRcdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UgKyAnIGFuZCAnO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlICsgJzxhIGhyZWY9XCIjXCIgZGF0YS10YWI9XCJkaXNwbGF5XCIgY2xhc3M9XCJub3RpZnktZXJyb3ItdGFiXCI+IERpc3BsYXkgT3B0aW9ucyA8L2E+Jztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlID0gIG9wdGluVmFycy5tZXNzYWdlcy5zc2hhcmVfbW9kdWxlX2Vycm9yLnJlcGxhY2UoICd7cGFnZX0nLCBlcnJvck1lc3NhZ2UgKTtcblxuXHRcdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnZXJyb3InLCBlcnJvck1lc3NhZ2UsIDEwMDAwMDAwMDAgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBTYXZlIGNoYW5nZXNcblx0XHRzYXZlKCkge1xuXG5cdFx0XHR0aGlzLnNldENvbnRlbnRGcm9tVGlueW1jZSggdHJ1ZSApO1xuXHRcdFx0dGhpcy5zYW5pdGl6ZURhdGEoKTtcblxuXHRcdFx0Ly8gUHJlcGFyaWcgdGhlIGRhdGFcblx0XHRcdGxldCBtZSAgICAgICA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzICAgID0gdGhpcy4kZWwuZmluZCggJyNodXN0bGUtbW9kdWxlLXdpemFyZC12aWV3JyApLFxuXHRcdFx0XHRpZCAgICAgICA9ICggISAkdGhpcy5kYXRhKCAnaWQnICkgKSA/ICctMScgOiAkdGhpcy5kYXRhKCAnaWQnICksXG5cdFx0XHRcdG5vbmNlICAgID0gJHRoaXMuZGF0YSggJ25vbmNlJyApLFxuXHRcdFx0XHRtb2R1bGUgICA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cblx0XHRcdGxldCBkYXRhID0ge1xuXHRcdFx0XHRcdGFjdGlvbjogJ2h1c3RsZV9zYXZlX21vZHVsZScsXG5cdFx0XHRcdFx0J19hamF4X25vbmNlJzogbm9uY2UsXG5cdFx0XHRcdFx0aWQsXG5cdFx0XHRcdFx0bW9kdWxlXG5cdFx0XHRcdH07XG5cblx0XHRcdF8uZXh0ZW5kKCBkYXRhLCB0aGlzLmdldERhdGFUb1NhdmUoKSApO1xuXG5cdFx0XHQvLyBhamF4IHNhdmUgaGVyZVxuXHRcdFx0cmV0dXJuICQuYWpheCh7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzdWx0ICkge1xuXG5cdFx0XHRcdFx0aWYgKCB0cnVlID09PSByZXN1bHQuc3VjY2VzcyApIHtcblxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogaGFuZGxlIGVycm9ycy4gU3VjaCBhcyB3aGVuIG5vbmNlcyBleHBpcmUgd2hlbiB5b3UgbGVhdmUgdGhlIHdpbmRvdyBvcGVuZCBmb3IgbG9uZy5cblxuXHRcdFx0XHRcdFx0Ly8gVGhlIGNoYW5nZXMgd2VyZSBhbHJlYWR5IHNhdmVkLlxuXHRcdFx0XHRcdFx0TW9kdWxlLmhhc0NoYW5nZXMgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0Ly8gQ2hhbmdlIHRoZSBcIlBlbmRpbmcgY2hhbmdlc1wiIGxhYmVsIHRvIFwiU2F2ZWRcIi5cblx0XHRcdFx0XHRcdG1lLnN3aXRjaFN0YXR1c1RvKCAnc2F2ZWQnICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxldCBlcnJvcnMgPSByZXN1bHQuZGF0YSxcblx0XHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlID0gJyc7XG5cblx0XHRcdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBlcnJvcnMuZGF0YS5pY29uX2Vycm9yICkge1xuXHRcdFx0XHRcdFx0XHRfLmVhY2goIGVycm9ycy5kYXRhLmljb25fZXJyb3IsIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdFx0XHRcdFx0XHQkKCAnI2h1c3RsZS1wbGF0Zm9ybS0nICsgZXJyb3IgKS5maW5kKCAnLnN1aS1lcnJvci1tZXNzYWdlJyApLnNob3coKTtcblx0XHRcdFx0XHRcdFx0XHQkKCAnI2h1c3RsZS1wbGF0Zm9ybS0nICsgZXJyb3IgKyAnIC5odXN0bGUtc29jaWFsLXVybC1maWVsZCcgKS5hZGRDbGFzcyggJ3N1aS1mb3JtLWZpZWxkLWVycm9yJyApO1xuXHRcdFx0XHRcdFx0XHRcdCQoICcjaHVzdGxlLXBsYXRmb3JtLScgKyBlcnJvciApLm5vdCggJy5zdWktYWNjb3JkaW9uLWl0ZW0tLW9wZW4nICkuZmluZCggJy5zdWktYWNjb3JkaW9uLW9wZW4taW5kaWNhdG9yJyApLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZSA9ICc8YSBocmVmPVwiI1wiIGRhdGEtdGFiPVwic2VydmljZXNcIiBjbGFzcz1cIm5vdGlmeS1lcnJvci10YWJcIj4gU2VydmljZXMgPC9hPic7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBlcnJvcnMuZGF0YS5zZWxlY3Rvcl9lcnJvciApIHtcblx0XHRcdFx0XHRcdFx0Xy5lYWNoKCBlcnJvcnMuZGF0YS5zZWxlY3Rvcl9lcnJvciwgZnVuY3Rpb24oIGVycm9yICkge1xuXHRcdFx0XHRcdFx0XHRcdCQoICdpbnB1dFtuYW1lPVwiJyArIGVycm9yICsgJ19jc3Nfc2VsZWN0b3JcIl0nICkuc2libGluZ3MoICcuc3VpLWVycm9yLW1lc3NhZ2UnICkuc2hvdygpO1xuXG5cdFx0XHRcdFx0XHRcdFx0JCggJ2lucHV0W25hbWU9XCInICsgZXJyb3IgKyAnX2Nzc19zZWxlY3RvclwiXScgKS5wYXJlbnQoICcuc3VpLWZvcm0tZmllbGQnICkuYWRkQ2xhc3MoICdzdWktZm9ybS1maWVsZC1lcnJvcicgKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCAhIF8uaXNFbXB0eSggZXJyb3JNZXNzYWdlICkgKSB7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlICsgJyBhbmQgJztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZSArICc8YSBocmVmPVwiI1wiIGRhdGEtdGFiPVwiZGlzcGxheVwiIGNsYXNzPVwibm90aWZ5LWVycm9yLXRhYlwiPiBEaXNwbGF5IE9wdGlvbnMgPC9hPic7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZSA9ICBvcHRpblZhcnMubWVzc2FnZXMuc3NoYXJlX21vZHVsZV9lcnJvci5yZXBsYWNlKCAne3BhZ2V9JywgZXJyb3JNZXNzYWdlICk7XG5cblx0XHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgZXJyb3JNZXNzYWdlLCAxMDAwMCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGdldERhdGFUb1NhdmUoKSB7XG5cblx0XHRcdGNvbnN0IGRhdGEgPSB7XG5cdFx0XHRcdGNvbnRlbnQ6IHRoaXMuY29udGVudFZpZXcubW9kZWwudG9KU09OKCksXG5cdFx0XHRcdGVtYWlsczogdGhpcy5lbWFpbHNWaWV3Lm1vZGVsLnRvSlNPTigpLFxuXHRcdFx0XHRkZXNpZ246IHRoaXMuZGVzaWduVmlldy5tb2RlbC50b0pTT04oKSxcblx0XHRcdFx0aW50ZWdyYXRpb25zX3NldHRpbmdzOiB0aGlzLmludGVncmF0aW9uc1ZpZXcubW9kZWwudG9KU09OKCksIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHZpc2liaWxpdHk6IHRoaXMudmlzaWJpbGl0eVZpZXcubW9kZWwudG9KU09OKCksXG5cdFx0XHRcdHNldHRpbmdzOiB0aGlzLnNldHRpbmdzVmlldy5tb2RlbC50b0pTT04oKVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCAnZW1iZWRkZWQnID09PSB0aGlzLm1vZHVsZVR5cGUgKSB7XG5cdFx0XHRcdGRhdGEuZGlzcGxheSA9IHRoaXMuZGlzcGxheVZpZXcubW9kZWwudG9KU09OKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkYXRhO1xuXG5cdFx0fSxcblxuXHRcdHNhdmVDaGFuZ2VzKCBlICkge1xuXG5cdFx0XHRsZXQgbWUgICAgICAgICAgICAgPSB0aGlzLFxuXHRcdFx0XHRjdXJyZW50QWN0aXZlID0gdGhpcy5tb2RlbC5nZXQoICdhY3RpdmUnICksXG5cdFx0XHRcdHNldEFjdGl2ZVRvICA9ICd1bmRlZmluZWQnICE9PSB0eXBlb2YgJCggZS5jdXJyZW50VGFyZ2V0ICkuZGF0YSggJ2FjdGl2ZScgKSA/IFN0cmluZyggJCggZS5jdXJyZW50VGFyZ2V0ICkuZGF0YSggJ2FjdGl2ZScgKSApIDogZmFsc2UsXG5cdFx0XHRcdHVwZGF0ZUFjdGl2ZSAgPSBmYWxzZSxcblx0XHRcdFx0dmFsaWRhdGlvbiAgICA9IGZhbHNlXG5cdFx0XHRcdDtcblxuXHRcdFx0aWYgKCBmYWxzZSAhPT0gc2V0QWN0aXZlVG8gKSB7XG5cdFx0XHRcdGlmICggJzAnID09PSBzZXRBY3RpdmVUbyApIHtcblx0XHRcdFx0XHRtZS5kaXNhYmxlQnV0dG9uc09uU2F2ZSggJ2RyYWZ0JyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lLmRpc2FibGVCdXR0b25zT25TYXZlKCAncHVibGlzaCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB2YWxpZGF0ZSA9IHRoaXMudmFsaWRhdGUoKTtcblx0XHRcdHZhbGlkYXRlLmRvbmUoIGZ1bmN0aW9uKCByZXNwICkge1xuXG5cdFx0XHRcdGlmICggcmVzcC5zdWNjZXNzICkge1xuXHRcdFx0XHRcdGlmICggZmFsc2UgIT09IHNldEFjdGl2ZVRvICYmIHJlc3Auc3VjY2VzcyApIHtcblx0XHRcdFx0XHRcdHZhbGlkYXRpb24gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRpZiAoICcwJyAhPT0gc2V0QWN0aXZlVG8gICYmIHNldEFjdGl2ZVRvICE9PSBjdXJyZW50QWN0aXZlICkge1xuXHRcdFx0XHRcdFx0XHRtZS5wdWJsaXNoaW5nRmxvdyggJ2xvYWRpbmcnICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIHNldEFjdGl2ZVRvICE9PSBjdXJyZW50QWN0aXZlICkge1xuXHRcdFx0XHRcdFx0XHR1cGRhdGVBY3RpdmUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRtZS5tb2RlbC5zZXQoICdhY3RpdmUnLCBzZXRBY3RpdmVUbywge1xuXHRcdFx0XHRcdFx0XHRcdHNpbGVudDogdHJ1ZVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBzYXZlID0gbWUuc2F2ZSgpO1xuXHRcdFx0XHRcdGlmICggc2F2ZSAmJiB2YWxpZGF0aW9uICkge1xuXHRcdFx0XHRcdFx0c2F2ZS5kb25lKCBmdW5jdGlvbiggcmVzcCApIHtcblxuXHRcdFx0XHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgcmVzcCAgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzcCA9IEpTT04ucGFyc2UoIHJlc3AgKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICggcmVzcC5zdWNjZXNzICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCB1cGRhdGVBY3RpdmUgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZS51cGRhdGVWaWV3T25BY3RpdmVDaGFuZ2UoKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoICcwJyAhPT0gc2V0QWN0aXZlVG8gJiYgc2V0QWN0aXZlVG8gIT09IGN1cnJlbnRBY3RpdmUgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoIHJlc3Auc3VjY2VzcyApIHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCB1cGRhdGVBY3RpdmUgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWUucHVibGlzaGluZ0Zsb3coICdyZWFkeScgKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSwgNTAwICk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KS5hbHdheXMoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRtZS5lbmFibGVTYXZlQnV0dG9ucygpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHQvLyBJZiBzYXZpbmcgZGlkIG5vdCB3b3JrLCByZW1vdmUgbG9hZGluZyBpY29uLlxuXHRcdFx0XHRcdFx0bWUuZW5hYmxlU2F2ZUJ1dHRvbnMoKTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIENoYW5nZSB0aGUgXCJQZW5kaW5nIGNoYW5nZXNcIiBsYWJlbCB0byBcIlNhdmVkXCIuXG5cdFx0XHRcdFx0bWUuc3dpdGNoU3RhdHVzVG8oICd1bnNhdmVkJyApO1xuXG5cdFx0XHRcdFx0Ly8gSWYgc2F2aW5nIGRpZCBub3Qgd29yaywgcmVtb3ZlIGxvYWRpbmcgaWNvbi5cblx0XHRcdFx0XHRtZS5lbmFibGVTYXZlQnV0dG9ucygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0fSxcblxuXHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdC8vIFVwZGF0ZSB0aGUgdmlldyBlbGVtZW50c1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHRoaXMgbW9kdWxlJ3MgbmFtZSBpZiB0aGUgbmV3IHZhbHVlIGlzIG5vdCBlbXB0eS5cblx0XHQgKiBAcGFyYW0gZXZlbnQgZVxuXHRcdCAqL1xuXHRcdHVwZGF0ZU1vZHVsZU5hbWUoIGUgKSB7XG5cblx0XHRcdGxldCAkaW5wdXQgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRtb2R1bGVOYW1lID0gJGlucHV0LnZhbCgpO1xuXG5cdFx0XHRpZiAoIG1vZHVsZU5hbWUubGVuZ3RoICkge1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLW1vZHVsZS1uYW1lLXdyYXBwZXInICkucmVtb3ZlQ2xhc3MoICdzdWktZm9ybS1maWVsZC1lcnJvcicgKTtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1tb2R1bGUtbmFtZS1lcnJvcicgKS5oaWRlKCk7XG5cdFx0XHRcdHRoaXMubW9kZWwuc2V0KCAnbW9kdWxlX25hbWUnLCBtb2R1bGVOYW1lICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLW1vZHVsZS1uYW1lLXdyYXBwZXInICkuYWRkQ2xhc3MoICdzdWktZm9ybS1maWVsZC1lcnJvcicgKTtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1tb2R1bGUtbmFtZS1lcnJvcicgKS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIERpc2FibGUgdGhlIHNhdmUgYnV0dG9ucy5cblx0XHRkaXNhYmxlQnV0dG9uc09uU2F2ZSggdHlwZSApIHtcblxuXHRcdFx0aWYgKCAnZHJhZnQnID09PSB0eXBlICkge1xuXHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWRyYWZ0LWJ1dHRvbicgKS5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCAncHVibGlzaCcgPT09IHR5cGUgKSB7XG5cdFx0XHRcdHRoaXMuJCggJy5odXN0bGUtcHVibGlzaC1idXR0b24nICkuYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1hY3Rpb24tc2F2ZScgKS5wcm9wKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cdFx0XHR0aGlzLiQoICcud3BtdWRldi1idXR0b24tbmF2aWdhdGlvbicgKS5wcm9wKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cdFx0fSxcblxuXHRcdC8vIEVuYWJsZSB0aGUgc2F2ZSBidXR0b25zLlxuXHRcdGVuYWJsZVNhdmVCdXR0b25zKCkge1xuXHRcdFx0dGhpcy4kKCAnLnN1aS1idXR0b24tb25sb2FkJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLWFjdGlvbi1zYXZlJyApLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHR0aGlzLiQoICcud3BtdWRldi1idXR0b24tbmF2aWdhdGlvbicgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdH0sXG5cblx0XHQvLyBDaGFuZ2UgdGhlICdzYXZlZCcvJ3Vuc2F2ZWQnIGxhYmVsLlxuXHRcdHN3aXRjaFN0YXR1c1RvKCBzd2l0Y2hUbyApIHtcblxuXHRcdFx0aWYgKCAnc2F2ZWQnID09PSBzd2l0Y2hUbyApIHtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCggJyNodXN0bGUtdW5zYXZlZC1jaGFuZ2VzLXN0YXR1cycgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoICcjaHVzdGxlLXNhdmVkLWNoYW5nZXMtc3RhdHVzJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoICcjaHVzdGxlLXVuc2F2ZWQtY2hhbmdlcy1zdGF0dXMnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1zYXZlZC1jaGFuZ2VzLXN0YXR1cycgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIENoYW5nZSB0aGUgJ0RyYWZ0Jy8nUHVibGlzaGVkJyBtb2R1bGUgc3RhdHVzIGxhYmVsLCBhbmQgdXBkYXRlIHRoZSBzYXZlIGJ1dHRvbnMgZm9yIGVhY2ggY2FzZS5cblx0XHR1cGRhdGVWaWV3T25BY3RpdmVDaGFuZ2UoKSB7XG5cblx0XHRcdHZhciBhY3RpdmUgPSB0aGlzLm1vZGVsLmdldCggJ2FjdGl2ZScgKSxcblx0XHRcdFx0bmV3U3RhdHVzID0gJzEnID09PSBhY3RpdmUgPyBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy5wdWJsaXNoZWQgOiBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy5kcmFmdCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0ZHJhZnRCdXR0b25UZXh0ID0gJzEnID09PSBhY3RpdmUgPyBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy51bnB1Ymxpc2ggOiBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy5zYXZlX2RyYWZ0LCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRwdWJsaXNoQnV0dG9uVGV4dCA9ICcxJyA9PT0gYWN0aXZlID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnMuc2F2ZV9jaGFuZ2VzIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnMucHVibGlzaDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcblxuXHRcdFx0Ly8gVXBkYXRlIHRoZSBtb2R1bGUgc3RhdHVzIHRhZy4gVGhlIG9uZSB0aGF0IHNheXMgaWYgdGhlIG1vZHVsZSBpcyBQdWJsaXNoZWQgb3IgYSBEcmFmdC5cblx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLXN0YXR1cy1tb2R1bGUgLnN1aS10YWcnICkudGV4dCggbmV3U3RhdHVzICk7XG5cblx0XHRcdC8vIFVwZGF0ZSB0aGUgdGV4dCB3aXRoaW4gdGhlIERyYWZ0IGJ1dHRvbi5cblx0XHRcdHRoaXMuJGVsLmZpbmQoICcjaHVzdGxlLWRyYWZ0LWJ1dHRvbiAuYnV0dG9uLXRleHQnICkudGV4dCggZHJhZnRCdXR0b25UZXh0ICk7XG5cblx0XHRcdC8vIFVwZGF0ZSB0aGUgdGV4dCB3aXRoaW4gdGhlIFB1Ymxpc2ggYnV0dG9uLlxuXHRcdFx0dGhpcy4kZWwuZmluZCggJy5odXN0bGUtcHVibGlzaC1idXR0b24gLmJ1dHRvbi10ZXh0JyApLnRleHQoIHB1Ymxpc2hCdXR0b25UZXh0ICk7XG5cdFx0fSxcblxuXHRcdC8vIFB1Ymxpc2hpbmcgZmxvdyBkaWFsb2cuXG5cdFx0cHVibGlzaGluZ0Zsb3coIGZsb3dTdGF0dXMgKSB7XG5cblx0XHRcdGNvbnN0IGdldERpYWxvZyA9ICQoICcjaHVzdGxlLWRpYWxvZy0tcHVibGlzaC1mbG93JyApO1xuXHRcdFx0Y29uc3QgZ2V0Q29udGVudCA9IGdldERpYWxvZy5maW5kKCAnLnN1aS1kaWFsb2ctY29udGVudCA+IC5zdWktYm94JyApO1xuXHRcdFx0Y29uc3QgZ2V0SWNvbiA9IGdldERpYWxvZy5maW5kKCAnI2RpYWxvZ0ljb24nICk7XG5cdFx0XHRjb25zdCBnZXRUaXRsZSA9IGdldERpYWxvZy5maW5kKCAnI2RpYWxvZ1RpdGxlJyApO1xuXHRcdFx0Y29uc3QgZ2V0RGVzYyA9IGdldERpYWxvZy5maW5kKCAnI2RpYWxvZ0Rlc2NyaXB0aW9uJyApO1xuXHRcdFx0Y29uc3QgZ2V0Q2xvc2UgPSBnZXREaWFsb2cuZmluZCggJy5zdWktZGlhbG9nLWNsb3NlJyApO1xuXHRcdFx0Y29uc3QgZ2V0TWFzayA9IGdldERpYWxvZy5maW5kKCAnLnN1aS1kaWFsb2ctb3ZlcmxheScgKTtcblxuXHRcdFx0ZnVuY3Rpb24gcmVzZXRQdWJsaXNoUmVhZHkoKSB7XG5cblx0XHRcdFx0Z2V0SWNvbi5yZW1vdmVDbGFzcyggJ3N1aS1pY29uLScgKyBnZXRDb250ZW50LmRhdGEoICdsb2FkaW5nLWljb24nICkgKTtcblx0XHRcdFx0Z2V0SWNvbi5hZGRDbGFzcyggJ3N1aS1pY29uLScgKyBnZXRDb250ZW50LmRhdGEoICdyZWFkeS1pY29uJyApICk7XG5cblx0XHRcdFx0aWYgKCAnbG9hZGVyJyA9PT0gZ2V0Q29udGVudC5hdHRyKCAnZGF0YS1sb2FkaW5nLWljb24nICkgKSB7XG5cdFx0XHRcdFx0Z2V0SWNvbi5yZW1vdmVDbGFzcyggJ3N1aS1sb2FkaW5nJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Z2V0VGl0bGUudGV4dCggZ2V0Q29udGVudC5kYXRhKCAncmVhZHktdGl0bGUnICkgKTtcblx0XHRcdFx0Z2V0RGVzYy50ZXh0KCBnZXRDb250ZW50LmRhdGEoICdyZWFkeS1kZXNjJyApICk7XG5cblx0XHRcdFx0Z2V0Q2xvc2Uuc2hvdygpO1xuXG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlc2V0UHVibGlzaExvYWRpbmcoKSB7XG5cblx0XHRcdFx0Z2V0SWNvbi5yZW1vdmVDbGFzcyggJ3N1aS1pY29uLScgKyBnZXRDb250ZW50LmRhdGEoICdyZWFkeS1pY29uJyApICk7XG5cdFx0XHRcdGdldEljb24uYWRkQ2xhc3MoICdzdWktaWNvbi0nICsgZ2V0Q29udGVudC5kYXRhKCAnbG9hZGluZy1pY29uJyApICk7XG5cblx0XHRcdFx0aWYgKCAnbG9hZGVyJyA9PT0gZ2V0Q29udGVudC5hdHRyKCAnZGF0YS1sb2FkaW5nLWljb24nICkgKSB7XG5cdFx0XHRcdFx0Z2V0SWNvbi5hZGRDbGFzcyggJ3N1aS1sb2FkaW5nJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Z2V0VGl0bGUudGV4dCggZ2V0Q29udGVudC5kYXRhKCAnbG9hZGluZy10aXRsZScgKSApO1xuXHRcdFx0XHRnZXREZXNjLnRleHQoIGdldENvbnRlbnQuZGF0YSggJ2xvYWRpbmctZGVzYycgKSApO1xuXG5cdFx0XHRcdGdldENsb3NlLmhpZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2xvc2VEaWFsb2coKSB7XG5cblx0XHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLXB1Ymxpc2gtZmxvdyddLmhpZGUoKTtcblxuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXNldFB1Ymxpc2hMb2FkaW5nKCk7XG5cdFx0XHRcdH0sIDUwMCApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdsb2FkaW5nJyA9PT0gZmxvd1N0YXR1cyApIHtcblx0XHRcdFx0cmVzZXRQdWJsaXNoTG9hZGluZygpO1xuXHRcdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tcHVibGlzaC1mbG93J10uc2hvdygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICdyZWFkeScgPT09IGZsb3dTdGF0dXMgKSB7XG5cblx0XHRcdFx0cmVzZXRQdWJsaXNoUmVhZHkoKTtcblxuXHRcdFx0XHQvLyBGb2N1cyByZWFkeSB0aXRsZVxuXHRcdFx0XHQvLyBUaGlzIHdpbGwgaGVscCBzY3JlZW4gcmVhZGVycyBrbm93IHdoZW4gbW9kdWxlIGhhcyBiZWVuIHB1Ymxpc2hlZFxuXHRcdFx0XHRnZXRUaXRsZS5mb2N1cygpO1xuXG5cdFx0XHRcdC8vIENsb3NlIGRpYWxvZyB3aGVuIGNsaWNraW5nIG9uIG1hc2tcblx0XHRcdFx0Z2V0TWFzay5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y2xvc2VEaWFsb2coKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gQ2xvc2UgZGlhbG9nIHdoZW4gY2xpY2tpbmcgb24gY2xvc2UgYnV0dG9uXG5cdFx0XHRcdGdldENsb3NlLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvL3JlbW92ZSBlcnJvciBtZXNzYWdlXG5cdFx0cmVtb3ZlRXJyb3JNZXNzYWdlKCBlICkge1xuXHRcdFx0aWYgKCBlLnRhcmdldC52YWx1ZSApIHtcblx0XHRcdFx0bGV0IHBhcmVudCA9ICQoIGUudGFyZ2V0ICkucGFyZW50KCAnLnN1aS1mb3JtLWZpZWxkJyApO1xuXHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2xhc3MoICdzdWktZm9ybS1maWVsZC1lcnJvcicgKTtcblx0XHRcdFx0cGFyZW50LmZpbmQoICcuc3VpLWVycm9yLW1lc3NhZ2UnICkuaGlkZSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBQcmV2aWV3aW5nXG5cblx0XHRwcmV2aWV3TW9kdWxlKCBlICkge1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHRoaXMuc2V0Q29udGVudEZyb21UaW55bWNlKCB0cnVlICk7XG5cdFx0XHR0aGlzLnNhbml0aXplRGF0YSgpO1xuXG5cdFx0XHRsZXQgJGJ1dHRvbiA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRpZCA9IHRoaXMubW9kZWwuZ2V0KCAnbW9kdWxlX2lkJyApLFxuXHRcdFx0XHR0eXBlID0gdGhpcy5tb2RlbC5nZXQoICdtb2R1bGVfdHlwZScgKSxcblx0XHRcdFx0cHJldmlld0RhdGEgPSBfLmV4dGVuZCh7fSwgdGhpcy5tb2RlbC50b0pTT04oKSwgdGhpcy5nZXREYXRhVG9TYXZlKCkgKTtcblxuXHRcdFx0JGJ1dHRvbi5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHRNb2R1bGUucHJldmlldy5vcGVuKCBpZCwgdHlwZSwgcHJldmlld0RhdGEgKTtcblx0XHR9XG5cdH07XG5cbn0pO1xuIiwiKCBmdW5jdGlvbiggJCApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIENvbmRpdGlvbkJhc2U7XG5cblx0T3B0aW4uVmlldy5Db25kaXRpb25zID0gT3B0aW4uVmlldy5Db25kaXRpb25zIHx8IHt9O1xuXG5cdENvbmRpdGlvbkJhc2UgPSBIdXN0bGUuVmlldy5leHRlbmQoe1xuXG5cdFx0Y29uZGl0aW9uSWQ6ICcnLFxuXG5cdFx0Y2xhc3NOYW1lOiAnc3VpLWJ1aWxkZXItZmllbGQgc3VpLWFjY29yZGlvbi1pdGVtIHN1aS1hY2NvcmRpb24taXRlbS0tb3BlbicsXG5cblx0XHRfdGVtcGxhdGU6IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLXZpc2liaWxpdHktcnVsZS10cGwnICksXG5cblx0XHR0ZW1wbGF0ZTogZmFsc2UsXG5cblx0XHRfZGVmYXVsdHM6IHtcblx0XHRcdHR5cGVOYW1lOiAnJyxcblx0XHRcdGNvbmRpdGlvbk5hbWU6ICcnXG5cdFx0fSxcblxuXHRcdF9ldmVudHM6IHtcblx0XHRcdCdjaGFuZ2UgaW5wdXQnOiAnY2hhbmdlSW5wdXQnLFxuXHRcdFx0J2NoYW5nZSB0ZXh0YXJlYSc6ICdjaGFuZ2VJbnB1dCcsXG5cdFx0XHQnY2hhbmdlIHNlbGVjdCc6ICdjaGFuZ2VJbnB1dCdcblx0XHR9LFxuXG5cdFx0aW5pdDogZnVuY3Rpb24oIG9wdHMgKSB7XG5cblx0XHRcdHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuXHRcdFx0dGhpcy4kZWwucmVtb3ZlRGF0YSgpLnVuYmluZCgpO1xuXG5cdFx0XHR0aGlzLnR5cGUgPSBvcHRzLnR5cGU7XG5cdFx0XHR0aGlzLmdyb3VwSWQgPSBvcHRzLmdyb3VwSWQ7XG5cdFx0XHR0aGlzLmZpbHRlcl90eXBlID0gb3B0cy5maWx0ZXJfdHlwZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdHRoaXMuaWQgPSB0aGlzLmNvbmRpdGlvbklkO1xuXG5cdFx0XHR0aGlzLnRlbXBsYXRlID0gICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLmNwdCApID8gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtdmlzaWJpbGl0eS1ydWxlLXRwbC0tcG9zdF90eXBlJyApIDogT3B0aW4udGVtcGxhdGUoICdodXN0bGUtdmlzaWJpbGl0eS1ydWxlLXRwbC0tJyArIHRoaXMuY29uZGl0aW9uSWQgKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHR5cGVOYW1lIGFuZCBjb25kaXRpb25OYW1lIGJhc2VkIG9uIHR5cGUgYW5kIGlkIHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlIGxhdGVyIG9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHR5cGUge09iamVjdH1cblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdHRoaXMuX2RlZmF1bHRzID0ge1xuXHRcdFx0XHR0eXBlTmFtZTogb3B0aW5WYXJzLm1lc3NhZ2VzLnNldHRpbmdzWyB0aGlzLnR5cGUgXSA/IG9wdGluVmFycy5tZXNzYWdlcy5zZXR0aW5nc1sgdGhpcy50eXBlIF0gOiB0aGlzLnR5cGUsXG5cdFx0XHRcdGNvbmRpdGlvbk5hbWU6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zWyB0aGlzLmNvbmRpdGlvbklkIF0gPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uc1sgdGhpcy5jb25kaXRpb25JZCBdIDogdGhpcy5jb25kaXRpb25JZCxcblx0XHRcdFx0Z3JvdXBJZDogdGhpcy5ncm91cElkLFxuXHRcdFx0XHRpZDogdGhpcy5jb25kaXRpb25JZCxcblx0XHRcdFx0c291cmNlOiBvcHRzLnNvdXJjZVxuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy5kYXRhID0gdGhpcy5nZXREYXRhKCk7XG5cblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR0aGlzLmV2ZW50cyA9ICQuZXh0ZW5kKCB0cnVlLCB7fSwgdGhpcy5ldmVudHMsIHRoaXMuX2V2ZW50cyApO1xuXHRcdFx0dGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuXHRcdFx0aWYgKCB0aGlzLm9uSW5pdCAmJiBfLmlzRnVuY3Rpb24oIHRoaXMub25Jbml0ICkgKSB7XG5cdFx0XHRcdHRoaXMub25Jbml0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRnZXREYXRhOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7fSwgdGhpcy5fZGVmYXVsdHMsIHRoaXMuZGVmYXVsdHMoKSwgdGhpcy5tb2RlbC5nZXQoIHRoaXMuY29uZGl0aW9uSWQgKSwgeyB0eXBlOiB0aGlzLnR5cGUgfSk7XG5cdFx0fSxcblxuXHRcdGdldFRpdGxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRpdGxlLnJlcGxhY2UoICd7dHlwZV9uYW1lfScsIHRoaXMuZGF0YS50eXBlTmFtZSApO1xuXHRcdH0sXG5cblx0XHRnZXRCb2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAnZnVuY3Rpb24nID09PSB0eXBlb2YgdGhpcy5ib2R5ID8gdGhpcy5ib2R5LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKSA6IHRoaXMuYm9keS5yZXBsYWNlKCAne3R5cGVfbmFtZX0nLCB0aGlzLmRhdGEudHlwZU5hbWUgKTtcblx0XHR9LFxuXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmhlYWRlcjtcblx0XHR9LFxuXG5cdFx0Y291bnRMaW5lczogZnVuY3Rpb24oIHZhbHVlICkge1xuXG5cdFx0XHQvLyB0cmltIHRyYWlsaW5nIHJldHVybiBjaGFyIGlmIGV4aXN0c1xuXHRcdFx0bGV0IHRleHQgPSB2YWx1ZS5yZXBsYWNlKCAvXFxzKyQvZywgJycgKTtcblx0XHRcdGxldCBzcGxpdCA9IHRleHQuc3BsaXQoICdcXG4nICk7XG5cdFx0XHRyZXR1cm4gc3BsaXQubGVuZ3RoO1xuXHRcdH0sXG5cblx0XHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLnNldFByb3BlcnRpZXMoKTtcblxuXHRcdFx0bGV0IGh0bWwgPSB0aGlzLl90ZW1wbGF0ZSggXy5leHRlbmQoe30sIHtcblx0XHRcdFx0XHR0aXRsZTogdGhpcy5nZXRUaXRsZSgpLFxuXHRcdFx0XHRcdGJvZHk6IHRoaXMuZ2V0Qm9keSgpLFxuXHRcdFx0XHRcdGhlYWRlcjogdGhpcy5nZXRIZWFkZXIoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aGlzLl9kZWZhdWx0cyxcblx0XHRcdFx0eyB0eXBlOiB0aGlzLnR5cGUgfVxuXHRcdFx0KSApO1xuXG5cdFx0XHR0aGlzLiRlbC5odG1sKCAnJyApO1xuXHRcdFx0dGhpcy4kZWwuaHRtbCggaHRtbCApO1xuXG5cdFx0XHQkKCAnLndwaC1jb25kaXRpb25zLS1ib3ggLndwaC1jb25kaXRpb25zLS1pdGVtOm5vdCg6bGFzdC1jaGlsZCknIClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnd3BoLWNvbmRpdGlvbnMtLW9wZW4nIClcblx0XHRcdFx0LmFkZENsYXNzKCAnd3BoLWNvbmRpdGlvbnMtLWNsb3NlZCcgKTtcblx0XHRcdCQoICcud3BoLWNvbmRpdGlvbnMtLWJveCAud3BoLWNvbmRpdGlvbnMtLWl0ZW06bm90KDpsYXN0LWNoaWxkKSBzZWN0aW9uJyApLmhpZGUoKTtcblxuXHRcdFx0aWYgKCB0aGlzLnJlbmRlcmVkICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiB0aGlzLnJlbmRlcmVkICkge1xuXHRcdFx0XHR0aGlzLnJlbmRlcmVkLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlcyBhdHRyaWJ1dGUgdmFsdWUgaW50byB0aGUgY29uZGl0aW9uIGhhc2hcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBhdHRyaWJ1dGVcblx0XHQgKiBAcGFyYW0gdmFsXG5cdFx0ICovXG5cdFx0dXBkYXRlQXR0cmlidXRlOiBmdW5jdGlvbiggYXR0cmlidXRlLCB2YWwgKSB7XG5cdFx0XHR0aGlzLmRhdGEgPSB0aGlzLm1vZGVsLmdldCggdGhpcy5jb25kaXRpb25JZCApO1xuXHRcdFx0dGhpcy5kYXRhWyBhdHRyaWJ1dGUgXSA9IHZhbDtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCB0aGlzLmNvbmRpdGlvbklkLCB0aGlzLmRhdGEgKTtcblxuXHRcdFx0Ly8gVE9ETzogaW5zdGVhZCBvZiB0cmlnZ2VyaW5nIG1hbnVhbGx5LCBjbG9uZSB0aGUgcmV0cmlldmVkIG9iamVjdCBzb1xuXHRcdFx0Ly8gYmFja2JvbmUgcmVjb2duaXplcyB0aGUgY2hhbmdlLlxuXHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXG5cdFx0fSxcblx0XHRnZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGUgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwuZ2V0KCB0aGlzLmNvbmRpdGlvbklkICApO1xuXHRcdFx0cmV0dXJuIGRhdGEgJiYgZGF0YVsgYXR0cmlidXRlIF0gPyBkYXRhWyBhdHRyaWJ1dGUgXSA6IGZhbHNlO1xuXHRcdH0sXG5cdFx0cmVmcmVzaExhYmVsOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBodG1sID0gIHRoaXMuZ2V0SGVhZGVyKCk7XG5cdFx0XHR0aGlzLiRlbC5maW5kKCAnLndwaC1jb25kaXRpb24tLXByZXZpZXcnICkuaHRtbCggJycgKTtcblx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLWFjY29yZGlvbi1pdGVtLWhlYWRlciAuc3VpLXRhZycgKS5odG1sKCBodG1sICk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFRyaWdnZXJlZCBvbiBpbnB1dCBjaGFuZ2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0Y2hhbmdlSW5wdXQ6IGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHQvL3N0b3AgaGFuZGxlciBpbiAvYXNzZXRzL2pzL2FkbWluL21peGlucy9tb2RlbC11cGRhdGVyLmpzXG5cblx0XHRcdHZhciB1cGRhdGVkLFxuXHRcdFx0XHRlbCA9IGUudGFyZ2V0LFxuXHRcdFx0XHRhdHRyaWJ1dGUgPSBlbC5nZXRBdHRyaWJ1dGUoICdkYXRhLWF0dHJpYnV0ZScgKSxcblx0XHRcdFx0JGVsID0gJCggZWwgKSxcblx0XHRcdFx0dmFsID0gJGVsLmlzKCAnLnN1aS1zZWxlY3QnICkgPyAkZWwudmFsKCkgOiBlLnRhcmdldC52YWx1ZTtcblxuXHRcdFx0ZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0aWYgKCAkZWwuaXMoICc6Y2hlY2tib3gnICkgKSB7XG5cdFx0XHRcdHZhbCA9ICRlbC5pcyggJzpjaGVja2VkJyApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBza2lwIGZvciBpbnB1dCBzZWFyY2hcblx0XHRcdGlmICggJGVsLmlzKCAnLnNlbGVjdDItc2VhcmNoX19maWVsZCcgKSApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGVkID0gdGhpcy51cGRhdGVBdHRyaWJ1dGUoIGF0dHJpYnV0ZSwgdmFsICk7XG5cblx0XHRcdHRoaXMucmVmcmVzaExhYmVsKCk7XG5cdFx0XHRyZXR1cm4gdXBkYXRlZDtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyBjb25maWdzIG9mIGNvbmRpdGlvblxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgYm9vbCB0cnVlXG5cdFx0ICovXG5cdFx0Z2V0Q29uZmlnczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5kZWZhdWx0cygpIHx8IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRsZXQgcmVlbmFibGVTY3JvbGwgPSBmdW5jdGlvbiggZSApIHtcblxuXHRcdC8qKlxuXHRcdCAqIHJlZW5hYmxlIHNjcm9sbGluZyBmb3IgdGhlIGNvbnRhaW5lclxuXHRcdCAqIHNlbGVjdDIgZGlzYWJsZXMgc2Nyb2xsaW5nIGFmdGVyIHNlbGVjdCBzbyB3ZSByZWVuYWJsZSBpdFxuXHRcdCAqL1xuXHRcdCQoICcud3BoLWNvbmRpdGlvbnMtLWl0ZW1zJyApLmRhdGEoICdzZWxlY3QyU2Nyb2xsUG9zaXRpb24nLCB7fSk7XG5cdH0sXG5cdFRvZ2dsZUJ1dHRvblRvZ2dsZXJNaXhpbiA9IHtcblx0XHRldmVudHM6IHtcblx0XHRcdCdjaGFuZ2UgaW5wdXRbdHlwZT1cInJhZGlvXCJdJzogJ3NldEN1cnJlbnRMaSdcblx0XHR9LFxuXHRcdHNldEN1cnJlbnRMaTogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHQkbGkgPSAkdGhpcy5jbG9zZXN0KCAnbGknICk7XG5cblx0XHRcdCRsaS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCAnY3VycmVudCcgKTtcblx0XHRcdCRsaS50b2dnbGVDbGFzcyggJ2N1cnJlbnQnLCAgJHRoaXMuaXMoICc6Y2hlY2tlZCcgKSApO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogUG9zdHNcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy5wb3N0cyA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKCBfLmV4dGVuZCh7fSwgVG9nZ2xlQnV0dG9uVG9nZ2xlck1peGluLCB7XG5cdFx0Y29uZGl0aW9uSWQ6ICdwb3N0cycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy5wb3N0cztcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnLCAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHRcdHBvc3RzOiBbXVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vdGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3Bvc3RzJyApLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsICB0aGlzLmdldEF0dHJpYnV0ZSggJ3Bvc3RzJyApLmxlbmd0aCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH0sXG5cdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1zZWxlY3QtYWpheCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0dGFnczogJ3RydWUnLFxuXHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRkcm9wZG93bkNzc0NsYXNzOiAnc3VpLXNlbGVjdC1kcm9wZG93bicsXG5cdFx0XHRcdGFqYXg6IHtcblx0XHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdFx0ZGVsYXk6IDI1MCwgLy8gd2FpdCAyNTAgbWlsbGlzZWNvbmRzIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSByZXF1ZXN0XG5cdFx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0ZGF0YTogZnVuY3Rpb24oIHBhcmFtcyApIHtcblx0XHRcdFx0XHRcdHZhciBxdWVyeSA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiAnZ2V0X25ld19jb25kaXRpb25faWRzJyxcblx0XHRcdFx0XHRcdFx0c2VhcmNoOiBwYXJhbXMudGVybSxcblx0XHRcdFx0XHRcdFx0cG9zdFR5cGU6ICdwb3N0J1xuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHF1ZXJ5O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0czogZGF0YS5kYXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y2FjaGU6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub24oICdzZWxlY3QyOnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsIClcblx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXG5cdFx0fVxuXHR9KSApO1xuXG5cdC8qKlxuXHQgKiBQYWdlc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLnBhZ2VzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoIF8uZXh0ZW5kKHt9LCBUb2dnbGVCdXR0b25Ub2dnbGVyTWl4aW4sIHtcblx0XHRjb25kaXRpb25JZDogJ3BhZ2VzJyxcblx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0dGhpcy50aXRsZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zLnBhZ2VzO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcsIC8vIGV4Y2VwdCB8IG9ubHlcblx0XHRcdFx0cGFnZXM6IFtdXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0b25Jbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly90aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAncGFnZXMnICkubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm4gKCAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5vbmx5X3RoZXNlIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuZXhjZXB0X3RoZXNlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgIHRoaXMuZ2V0QXR0cmlidXRlKCAncGFnZXMnICkubGVuZ3RoICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gKCAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH0sXG5cdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1zZWxlY3QtYWpheCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0XHR0YWdzOiAndHJ1ZScsXG5cdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRkcm9wZG93bkNzc0NsYXNzOiAnc3VpLXNlbGVjdC1kcm9wZG93bicsXG5cdFx0XHRcdFx0YWpheDoge1xuXHRcdFx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRcdFx0ZGVsYXk6IDI1MCwgLy8gd2FpdCAyNTAgbWlsbGlzZWNvbmRzIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSByZXF1ZXN0XG5cdFx0XHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRcdFx0ZGF0YTogZnVuY3Rpb24oIHBhcmFtcyApIHtcblx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogJ2dldF9uZXdfY29uZGl0aW9uX2lkcycsXG5cdFx0XHRcdFx0XHRcdFx0c2VhcmNoOiBwYXJhbXMudGVybSxcblx0XHRcdFx0XHRcdFx0XHRwb3N0VHlwZTogJ3BhZ2UnXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHF1ZXJ5O1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHRzOiBkYXRhLmRhdGFcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQub24oICdzZWxlY3QyOnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsIClcblx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXG5cdFx0fVxuXHR9KSApO1xuXG5cdC8qKlxuXHQgKiBDdXN0b20gUG9zdCBUeXBlc1xuXHQgKi9cblx0aWYgKCBvcHRpblZhcnMucG9zdF90eXBlcyApIHtcblx0XHRfLmVhY2goIG9wdGluVmFycy5wb3N0X3R5cGVzLCBmdW5jdGlvbiggY3B0RGV0YWlscywgY3B0ICkge1xuXHRcdFx0T3B0aW4uVmlldy5Db25kaXRpb25zWyBjcHREZXRhaWxzLm5hbWUgXSA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKCBfLmV4dGVuZCh7fSwgVG9nZ2xlQnV0dG9uVG9nZ2xlck1peGluLCB7XG5cdFx0XHRcdGNvbmRpdGlvbklkOiBjcHREZXRhaWxzLm5hbWUsXG5cdFx0XHRcdGNwdDogdHJ1ZSxcblxuXHRcdFx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0XHRcdHRoaXMudGl0bGUgPSBjcHREZXRhaWxzLmxhYmVsO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnLCAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHRcdFx0XHQnc2VsZWN0ZWRfY3B0cyc6IFtdLFxuXHRcdFx0XHRcdFx0cG9zdFR5cGU6IGNwdCxcblx0XHRcdFx0XHRcdHBvc3RUeXBlTGFiZWw6IGNwdERldGFpbHMubGFiZWxcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggdGhpcy5nZXRBdHRyaWJ1dGUoICdzZWxlY3RlZF9jcHRzJyApLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCAgdGhpcy5nZXRBdHRyaWJ1dGUoICdzZWxlY3RlZF9jcHRzJyApLmxlbmd0aCAgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoaXMuJCggJy5odXN0bGUtc2VsZWN0LWFqYXgnICkuU1VJc2VsZWN0Mih7XG5cdFx0XHRcdFx0XHR0YWdzOiAndHJ1ZScsXG5cdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdFx0ZHJvcGRvd25Dc3NDbGFzczogJ3N1aS1zZWxlY3QtZHJvcGRvd24nLFxuXHRcdFx0XHRcdFx0YWpheDoge1xuXHRcdFx0XHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdFx0XHRcdGRlbGF5OiAyNTAsIC8vIHdhaXQgMjUwIG1pbGxpc2Vjb25kcyBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgcmVxdWVzdFxuXHRcdFx0XHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiAnZ2V0X25ld19jb25kaXRpb25faWRzJyxcblx0XHRcdFx0XHRcdFx0XHRcdHNlYXJjaDogcGFyYW1zLnRlcm0sXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3N0VHlwZTogY3B0XG5cdFx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBxdWVyeTtcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHRzOiBkYXRhLmRhdGFcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNyZWF0ZVRhZzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSApO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXNcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy5jYXRlZ29yaWVzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoIF8uZXh0ZW5kKHt9LCBUb2dnbGVCdXR0b25Ub2dnbGVyTWl4aW4sIHtcblx0XHRjb25kaXRpb25JZDogJ2NhdGVnb3JpZXMnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMuY2F0ZWdvcmllcztcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnLCAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHRcdGNhdGVnb3JpZXM6IFtdXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0b25Jbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly90aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAnY2F0ZWdvcmllcycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCAgdGhpcy5nZXRBdHRyaWJ1dGUoICdjYXRlZ29yaWVzJyApLmxlbmd0aCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH0sXG5cdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1zZWxlY3QtYWpheCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0XHR0YWdzOiAndHJ1ZScsXG5cdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRkcm9wZG93bkNzc0NsYXNzOiAnc3VpLXNlbGVjdC1kcm9wZG93bicsXG5cdFx0XHRcdFx0YWpheDoge1xuXHRcdFx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRcdFx0ZGVsYXk6IDI1MCwgLy8gd2FpdCAyNTAgbWlsbGlzZWNvbmRzIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSByZXF1ZXN0XG5cdFx0XHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRcdFx0ZGF0YTogZnVuY3Rpb24oIHBhcmFtcyApIHtcblx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogJ2dldF9uZXdfY29uZGl0aW9uX2lkcycsXG5cdFx0XHRcdFx0XHRcdFx0c2VhcmNoOiBwYXJhbXMudGVybSxcblx0XHRcdFx0XHRcdFx0XHRwb3N0VHlwZTogJ2NhdGVnb3J5J1xuXHRcdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRcdHJldHVybiBxdWVyeTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0czogZGF0YS5kYXRhXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0Y2FjaGU6IHRydWVcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNyZWF0ZVRhZzogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0Lm9uKCAnc2VsZWN0Mjp1bnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsICk7XG5cdFx0fVxuXHR9KSApO1xuXG5cdC8qKlxuXHQgKiBUYWdzXG5cdCAqL1xuXHRPcHRpbi5WaWV3LkNvbmRpdGlvbnMudGFncyA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKCBfLmV4dGVuZCh7fSwgVG9nZ2xlQnV0dG9uVG9nZ2xlck1peGluLCB7XG5cdFx0Y29uZGl0aW9uSWQ6ICd0YWdzJyxcblx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0dGhpcy50aXRsZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zLnRhZ3M7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnZmlsdGVyX3R5cGUnOiAnZXhjZXB0JywgLy8gZXhjZXB0IHwgb25seVxuXHRcdFx0XHR0YWdzOiBbXVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vdGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3RhZ3MnICkubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm4gKCAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5vbmx5X3RoZXNlIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuZXhjZXB0X3RoZXNlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgIHRoaXMuZ2V0QXR0cmlidXRlKCAndGFncycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5odXN0bGUtc2VsZWN0LWFqYXgnICkuU1VJc2VsZWN0Mih7XG5cdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHR0YWdzOiAndHJ1ZScsXG5cdFx0XHRcdFx0ZHJvcGRvd25Dc3NDbGFzczogJ3N1aS1zZWxlY3QtZHJvcGRvd24nLFxuXHRcdFx0XHRcdGFqYXg6IHtcblx0XHRcdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0XHRcdGRlbGF5OiAyNTAsIC8vIHdhaXQgMjUwIG1pbGxpc2Vjb25kcyBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgcmVxdWVzdFxuXHRcdFx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0XHRcdGRhdGE6IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBxdWVyeSA9IHtcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb246ICdnZXRfbmV3X2NvbmRpdGlvbl9pZHMnLFxuXHRcdFx0XHRcdFx0XHRcdHNlYXJjaDogcGFyYW1zLnRlcm0sXG5cdFx0XHRcdFx0XHRcdFx0cG9zdFR5cGU6ICd0YWcnXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHF1ZXJ5O1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHRzOiBkYXRhLmRhdGFcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCAnc2VsZWN0MjpzZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApXG5cdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pICk7XG5cblx0LyoqXG5cdCAqIFZpc2l0b3IgbG9nZ2VkIGluIC8gbm90IGxvZ2dlZCBpblxuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLnZpc2l0b3JfbG9nZ2VkX2luX3N0YXR1cyA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ3Zpc2l0b3JfbG9nZ2VkX2luX3N0YXR1cycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy52aXNpdG9yX2xvZ2dlZF9pbjtcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdzaG93X3RvJzogJ2xvZ2dlZF9pbidcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3Nob3dfdG8nICkubGVuZ3RoICYmICdsb2dnZWRfb3V0JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdzaG93X3RvJyApICkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMubG9nZ2VkX291dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5sb2dnZWRfaW47XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiB0aW1lcyB0aGUgbW9kdWxlIGhhcyBiZWVuIHNob3duIHRvIHRoZSBzYW1lIHZpc2l0b3Jcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy5zaG93bl9sZXNzX3RoYW4gPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICdzaG93bl9sZXNzX3RoYW4nLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMuc2hvd25fbGVzc190aGFuO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J2xlc3Nfb3JfbW9yZSc6ICdsZXNzX3RoYW4nLFxuXHRcdFx0XHQnbGVzc190aGFuJzogJydcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCAwIDwgdGhpcy5nZXRBdHRyaWJ1dGUoICdsZXNzX3RoYW4nICkgKSB7XG5cdFx0XHRcdGlmICggJ2xlc3NfdGhhbicgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnbGVzc19vcl9tb3JlJyApICkge1xuXHRcdFx0XHRcdHJldHVybiAoIG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm51bWJlcl92aWV3cyApLnJlcGxhY2UoICd7bnVtYmVyfScsICB0aGlzLmdldEF0dHJpYnV0ZSggJ2xlc3NfdGhhbicgKSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiAoIG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm51bWJlcl92aWV3c19tb3JlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgIHRoaXMuZ2V0QXR0cmlidXRlKCAnbGVzc190aGFuJyApICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbnk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIFZpc2l0b3IgaXMgb24gbW9iaWxlIC8gZGVza3RvcFxuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLnZpc2l0b3JfZGV2aWNlID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAndmlzaXRvcl9kZXZpY2UnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMub25seV9vbl9tb2JpbGU7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnZmlsdGVyX3R5cGUnOiAnbW9iaWxlJyAvLyBtb2JpbGUgfCBub3RfbW9iaWxlXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggJ25vdF9tb2JpbGUnID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApICkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuZGVza3RvcF9vbmx5O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm1vYmlsZV9vbmx5O1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBGcm9tIHJlZmVycmVyXG5cdCAqL1xuXHRPcHRpbi5WaWV3LkNvbmRpdGlvbnMuZnJvbV9yZWZlcnJlciA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ2Zyb21fcmVmZXJyZXInLFxuXHRcdGRpc2FibGU6IFsgJ2Zyb21fcmVmZXJyZXInIF0sXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy5mcm9tX3NwZWNpZmljX3JlZjtcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICd0cnVlJywgLy8gdHJ1ZSB8IGZhbHNlXG5cdFx0XHRcdHJlZnM6ICcnXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBsZW5ndGggPSAwO1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3JlZnMnICkubGVuZ3RoICkge1xuXHRcdFx0XHRsZW5ndGggPSB0aGlzLmNvdW50TGluZXMoIHRoaXMuZ2V0QXR0cmlidXRlKCAncmVmcycgKSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBsZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdmYWxzZScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5vbmx5X3RoZXNlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgbGVuZ3RoICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gJ2ZhbHNlJyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmFueSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmU7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIFNvdXJjZSBvZiBhcnJpdmFsXG5cdCAqL1xuXHRPcHRpbi5WaWV3LkNvbmRpdGlvbnMuc291cmNlX29mX2Fycml2YWwgPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICdzb3VyY2Vfb2ZfYXJyaXZhbCcsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy5mcm9tX3NlYXJjaF9lbmdpbmU7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnc291cmNlX2RpcmVjdCc6ICdmYWxzZScsIC8vIHRydWUgfCBmYWxzZVxuXHRcdFx0XHQnc291cmNlX2V4dGVybmFsJzogJ2ZhbHNlJywgLy8gdHJ1ZSB8IGZhbHNlXG5cdFx0XHRcdCdzb3VyY2VfaW50ZXJuYWwnOiAnZmFsc2UnLCAvLyB0cnVlIHwgZmFsc2Vcblx0XHRcdFx0J3NvdXJjZV9ub3Rfc2VhcmNoJzogJ2ZhbHNlJywgLy8gdHJ1ZSB8IGZhbHNlXG5cdFx0XHRcdCdzb3VyY2Vfc2VhcmNoJzogJ2ZhbHNlJyAvLyB0cnVlIHwgZmFsc2Vcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNvbmRpdGlvbnMgPSAwLFxuXHRcdFx0XHRkaXJlY3QgPSBfLmlzVHJ1ZSggdGhpcy5nZXRBdHRyaWJ1dGUoICdzb3VyY2VfZGlyZWN0JyApICkgJiYgKytjb25kaXRpb25zLFxuXHRcdFx0XHRleHRlcm5hbCA9IF8uaXNUcnVlKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3NvdXJjZV9leHRlcm5hbCcgKSApICYmICsrY29uZGl0aW9ucyxcblx0XHRcdFx0aW50ZXJuYWwgPSBfLmlzVHJ1ZSggdGhpcy5nZXRBdHRyaWJ1dGUoICdzb3VyY2VfaW50ZXJuYWwnICkgKSAmJiArK2NvbmRpdGlvbnMsXG5cdFx0XHRcdHNlYXJjaCA9IF8uaXNUcnVlKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3NvdXJjZV9zZWFyY2gnICkgKSAmJiArK2NvbmRpdGlvbnMsXG5cdFx0XHRcdG5vdFNlYXJjaCA9IF8uaXNUcnVlKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3NvdXJjZV9ub3Rfc2VhcmNoJyApICkgJiYgKytjb25kaXRpb25zXHQ7XG5cblx0XHRcdGlmICggc2VhcmNoICYmIG5vdFNlYXJjaCB8fCBkaXJlY3QgJiYgaW50ZXJuYWwgJiYgZXh0ZXJuYWwgKSB7XG5cdFx0XHRcdHJldHVybiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbnk7XG5cdFx0XHR9IGVsc2UgaWYgKCBjb25kaXRpb25zICkge1xuXHRcdFx0XHRyZXR1cm4gKCBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbnlfY29uZGl0aW9ucyApLnJlcGxhY2UoICd7bnVtYmVyfScsIGNvbmRpdGlvbnMgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbnk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIE9uL25vdCBvbiBzcGVjaWZpYyB1cmxcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy5vbl91cmwgPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICdvbl91cmwnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMub25fc3BlY2lmaWNfdXJsO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcsIC8vIGV4Y2VwdCB8IG9ubHlcblx0XHRcdFx0dXJsczogJydcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGxlbmd0aCA9IDA7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAndXJscycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdGxlbmd0aCA9IHRoaXMuY291bnRMaW5lcyggdGhpcy5nZXRBdHRyaWJ1dGUoICd1cmxzJyApICk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsIGxlbmd0aCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIE9uL25vdCBvbiBzcGVjaWZpYyBicm93c2VyXG5cdCAqL1xuXHRPcHRpbi5WaWV3LkNvbmRpdGlvbnMub25fYnJvd3NlciA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ29uX2Jyb3dzZXInLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMub25fc3BlY2lmaWNfYnJvd3Nlcjtcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJyb3dzZXJzOiAnJyxcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcgLy8gZXhjZXB0IHwgb25seVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAnYnJvd3NlcnMnICkubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm4gKCAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5vbmx5X3RoZXNlIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuZXhjZXB0X3RoZXNlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgdGhpcy5nZXRBdHRyaWJ1dGUoICdicm93c2VycycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktc2VsZWN0JyApXG5cdFx0XHRcdC52YWwoIHRoaXMuZ2V0QXR0cmlidXRlKCAnYnJvd3NlcnMnICkgKVxuXHRcdFx0XHQuU1VJc2VsZWN0MigpXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBWaXNpdG9yIGNvbW1lbnRlZCBvciBub3Rcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy52aXNpdG9yX2NvbW1lbnRlZCA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ3Zpc2l0b3JfY29tbWVudGVkJyxcblx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0dGhpcy50aXRsZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zLnZpc2l0b3JfaGFzX25ldmVyX2NvbW1lbnRlZDtcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICd0cnVlJyAvLyB0cnVlIHwgZmFsc2Vcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICdmYWxzZScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5mYWxzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLnRydWU7XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIFVzZXIgaGFzIHJvbGVcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy51c2VyX3JvbGVzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAndXNlcl9yb2xlcycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy5vbl9zcGVjaWZpY19yb2xlcztcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJvbGVzOiAnJyxcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcgLy8gZXhjZXB0IHwgb25seVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAncm9sZXMnICkubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm4gKCAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5vbmx5X3RoZXNlIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuZXhjZXB0X3RoZXNlICkucmVwbGFjZSggJ3tudW1iZXJ9JywgdGhpcy5nZXRBdHRyaWJ1dGUoICdyb2xlcycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktc2VsZWN0JyApXG5cdFx0XHRcdC52YWwoIHRoaXMuZ2V0QXR0cmlidXRlKCAncm9sZXMnICkgKVxuXHRcdFx0XHQuU1VJc2VsZWN0MigpXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBQYWdlIHRlbXBsYXRlc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLnBhZ2VfdGVtcGxhdGVzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAncGFnZV90ZW1wbGF0ZXMnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMub25fc3BlY2lmaWNfdGVtcGxhdGVzO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGVtcGxhdGVzOiAnJyxcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcgLy8gZXhjZXB0IHwgb25seVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAndGVtcGxhdGVzJyApLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsIHRoaXMuZ2V0QXR0cmlidXRlKCAndGVtcGxhdGVzJyApLmxlbmd0aCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH0sXG5cdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kKCAnLnN1aS1zZWxlY3QnIClcblx0XHRcdFx0LnZhbCggdGhpcy5nZXRBdHRyaWJ1dGUoICd0ZW1wbGF0ZXMnICkgKVxuXHRcdFx0XHQuU1VJc2VsZWN0MigpXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBTaG93IG1vZHVsZXMgYmFzZWQgb24gdXNlciByZWdpc3RyYXRpb24gdGltZVxuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLnVzZXJfcmVnaXN0cmF0aW9uID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAndXNlcl9yZWdpc3RyYXRpb24nLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMudXNlcl9yZWdpc3RyYXRpb247XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnZnJvbV9kYXRlJzogMCxcblx0XHRcdFx0J3RvX2RhdGUnOiAwXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBmcm9tLCB1cFRvO1xuXG5cdFx0XHRmcm9tID0gMCA8IHRoaXMuZ2V0QXR0cmlidXRlKCAnZnJvbV9kYXRlJyApID9cblx0XHRcdFx0KCBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5yZWdfZGF0ZSApLnJlcGxhY2UoICd7bnVtYmVyfScsICB0aGlzLmdldEF0dHJpYnV0ZSggJ2Zyb21fZGF0ZScgKSApIDpcblx0XHRcdFx0b3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuaW1tZWRpYXRlbHk7XG5cblx0XHRcdHVwVG8gPSAwIDwgdGhpcy5nZXRBdHRyaWJ1dGUoICd0b19kYXRlJyApID9cblx0XHRcdFx0KCBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5yZWdfZGF0ZSApLnJlcGxhY2UoICd7bnVtYmVyfScsICB0aGlzLmdldEF0dHJpYnV0ZSggJ3RvX2RhdGUnICkgKSA6XG5cdFx0XHRcdG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmZvcmV2ZXI7XG5cblx0XHRcdHJldHVybiBmcm9tICsgJyAtICcgKyB1cFRvO1xuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBWaXNpdG9yIGNvdW50cnlcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy52aXNpdG9yX2NvdW50cnkgPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICd2aXNpdG9yX2NvdW50cnknLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMubm90X2luX2FfY291bnRyeTtcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGNvdW50cmllczogJycsXG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnIC8vIG9ubHkgfCBleGNlcHRcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ2NvdW50cmllcycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCAgdGhpcy5nZXRBdHRyaWJ1dGUoICdjb3VudHJpZXMnICkubGVuZ3RoICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMubm9uZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmFsbDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0RGF0YSgpICk7XG5cdFx0fSxcblx0XHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiQoICcuc3VpLXNlbGVjdCcgKVxuXHRcdFx0XHQudmFsKCB0aGlzLmdldEF0dHJpYnV0ZSggJ2NvdW50cmllcycgKSApXG5cdFx0XHRcdC5TVUlzZWxlY3QyKClcblx0XHRcdFx0Lm9uKCAnc2VsZWN0MjpzZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIFN0YXRpYyBQYWdlc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLndwX2NvbmRpdGlvbnMgPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICd3cF9jb25kaXRpb25zJyxcblx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0dGhpcy50aXRsZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zLndwX2NvbmRpdGlvbnM7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnd3BfY29uZGl0aW9ucyc6ICcnLFxuXHRcdFx0XHQnZmlsdGVyX3R5cGUnOiAnZXhjZXB0JyAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5nZXRBdHRyaWJ1dGUoICd3cF9jb25kaXRpb25zJyApLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsIHRoaXMuZ2V0QXR0cmlidXRlKCAnd3BfY29uZGl0aW9ucycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktc2VsZWN0JyApXG5cdFx0XHRcdC52YWwoIHRoaXMuZ2V0QXR0cmlidXRlKCAnd3BfY29uZGl0aW9ucycgKSApXG5cdFx0XHRcdC5TVUlzZWxlY3QyKClcblx0XHRcdFx0Lm9uKCAnc2VsZWN0MjpzZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIEFyY2hpdmUgUGFnZXNcblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy5hcmNoaXZlX3BhZ2VzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAnYXJjaGl2ZV9wYWdlcycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy5hcmNoaXZlX3BhZ2VzO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J2FyY2hpdmVfcGFnZXMnOiAnJyxcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcgLy8gZXhjZXB0IHwgb25seVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAnYXJjaGl2ZV9wYWdlcycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCB0aGlzLmdldEF0dHJpYnV0ZSggJ2FyY2hpdmVfcGFnZXMnICkubGVuZ3RoICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMubm9uZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmFsbDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0RGF0YSgpICk7XG5cdFx0fSxcblx0XHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiQoICcuc3VpLXNlbGVjdCcgKVxuXHRcdFx0XHQudmFsKCB0aGlzLmdldEF0dHJpYnV0ZSggJ2FyY2hpdmVfcGFnZXMnICkgKVxuXHRcdFx0XHQuU1VJc2VsZWN0MigpXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6c2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKVxuXHRcdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFdvb0NvbW1lcmNlIENvbmRpdGlvbnMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXHQvKipcblx0ICogQWxsIFdvb0NvbW1lcmNlIFBhZ2VzXG5cdCAqL1xuXHRPcHRpbi5WaWV3LkNvbmRpdGlvbnMud2NfcGFnZXMgPSBDb25kaXRpb25CYXNlLmV4dGVuZCggXy5leHRlbmQoe30sIFRvZ2dsZUJ1dHRvblRvZ2dsZXJNaXhpbiwgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAnd2NfcGFnZXMnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMud2NfcGFnZXM7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnZmlsdGVyX3R5cGUnOiAnYWxsJyAvLyBhbGwgfCBub25lXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktdGFnJyApLnJlbW92ZSgpO1xuXHRcdH1cblx0fSkgKTtcblxuXHQvKipcblx0ICogV29vQ29tbWVyY2UgQ2F0ZWdvcmllc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLndjX2NhdGVnb3JpZXMgPSBDb25kaXRpb25CYXNlLmV4dGVuZCggXy5leHRlbmQoe30sIFRvZ2dsZUJ1dHRvblRvZ2dsZXJNaXhpbiwgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdGNvbmRpdGlvbklkOiAnd2NfY2F0ZWdvcmllcycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy53Y19jYXRlZ29yaWVzO1xuXHRcdH0sXG5cdFx0ZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J2ZpbHRlcl90eXBlJzogJ2V4Y2VwdCcsIC8vIGV4Y2VwdCB8IG9ubHlcblx0XHRcdFx0d2NfY2F0ZWdvcmllczogW10gLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdH07XG5cdFx0fSxcblx0XHRvbkluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5nZXRBdHRyaWJ1dGUoICd3Y19jYXRlZ29yaWVzJyApLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsICB0aGlzLmdldEF0dHJpYnV0ZSggJ3djX2NhdGVnb3JpZXMnICkubGVuZ3RoICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMubm9uZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmFsbDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0RGF0YSgpICk7XG5cdFx0fSxcblx0XHRyZW5kZXJlZDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLXNlbGVjdC1hamF4JyApLlNVSXNlbGVjdDIoe1xuXHRcdFx0XHRcdHRhZ3M6ICd0cnVlJyxcblx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0XHRcdGRyb3Bkb3duQ3NzQ2xhc3M6ICdzdWktc2VsZWN0LWRyb3Bkb3duJyxcblx0XHRcdFx0XHRhamF4OiB7XG5cdFx0XHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdFx0XHRkZWxheTogMjUwLCAvLyB3YWl0IDI1MCBtaWxsaXNlY29uZHMgYmVmb3JlIHRyaWdnZXJpbmcgdGhlIHJlcXVlc3Rcblx0XHRcdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0XHRkYXRhOiBmdW5jdGlvbiggcGFyYW1zICkge1xuXHRcdFx0XHRcdFx0XHR2YXIgcXVlcnkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiAnZ2V0X25ld19jb25kaXRpb25faWRzJyxcblx0XHRcdFx0XHRcdFx0XHRzZWFyY2g6IHBhcmFtcy50ZXJtLFxuXHRcdFx0XHRcdFx0XHRcdHBvc3RUeXBlOiAnd2NfY2F0ZWdvcnknXG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHF1ZXJ5O1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHRzOiBkYXRhLmRhdGFcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCAnc2VsZWN0MjpzZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApXG5cdFx0XHQub24oICdzZWxlY3QyOnVuc2VsZWN0aW5nJywgcmVlbmFibGVTY3JvbGwgKTtcblx0XHR9XG5cdH0pICk7XG5cblx0LyoqXG5cdCAqIFdvb0NvbW1lcmNlIFRhZ3Ncblx0ICovXG5cdE9wdGluLlZpZXcuQ29uZGl0aW9ucy53Y190YWdzID0gQ29uZGl0aW9uQmFzZS5leHRlbmQoIF8uZXh0ZW5kKHt9LCBUb2dnbGVCdXR0b25Ub2dnbGVyTWl4aW4sIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ3djX3RhZ3MnLFxuXHRcdHNldFByb3BlcnRpZXMoKSB7XG5cdFx0XHR0aGlzLnRpdGxlID0gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbnMud2NfdGFncztcblx0XHR9LFxuXHRcdGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnLCAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHRcdHdjX3RhZ3M6IFtdIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0b25Jbml0OiBmdW5jdGlvbigpIHtcblx0XHR9LFxuXHRcdGdldEhlYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuZ2V0QXR0cmlidXRlKCAnd2NfdGFncycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCAgdGhpcy5nZXRBdHRyaWJ1dGUoICd3Y190YWdzJyApLmxlbmd0aCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm5vbmUgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5hbGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib2R5OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldERhdGEoKSApO1xuXHRcdH0sXG5cdFx0cmVuZGVyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kKCAnLmh1c3RsZS1zZWxlY3QtYWpheCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0XHR0YWdzOiAndHJ1ZScsXG5cdFx0XHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdFx0XHRkcm9wZG93bkNzc0NsYXNzOiAnc3VpLXNlbGVjdC1kcm9wZG93bicsXG5cdFx0XHRcdFx0YWpheDoge1xuXHRcdFx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRcdFx0ZGVsYXk6IDI1MCwgLy8gd2FpdCAyNTAgbWlsbGlzZWNvbmRzIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSByZXF1ZXN0XG5cdFx0XHRcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRcdFx0ZGF0YTogZnVuY3Rpb24oIHBhcmFtcyApIHtcblx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogJ2dldF9uZXdfY29uZGl0aW9uX2lkcycsXG5cdFx0XHRcdFx0XHRcdFx0c2VhcmNoOiBwYXJhbXMudGVybSxcblx0XHRcdFx0XHRcdFx0XHRwb3N0VHlwZTogJ3djX3RhZydcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcXVlcnk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdHM6IGRhdGEuZGF0YVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNhY2hlOiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub24oICdzZWxlY3QyOnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsIClcblx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXHRcdH1cblx0fSkgKTtcblxuXHQvKipcblx0ICogV29vQ29tbWVyY2UgQXJjaGl2ZSBQYWdlc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLndjX2FyY2hpdmVfcGFnZXMgPSBDb25kaXRpb25CYXNlLmV4dGVuZCh7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0Y29uZGl0aW9uSWQ6ICd3Y19hcmNoaXZlX3BhZ2VzJyxcblx0XHRzZXRQcm9wZXJ0aWVzKCkge1xuXHRcdFx0dGhpcy50aXRsZSA9IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25zLndjX2FyY2hpdmVfcGFnZXM7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnd2NfYXJjaGl2ZV9wYWdlcyc6ICcnLFxuXHRcdFx0XHQnZmlsdGVyX3R5cGUnOiAnZXhjZXB0JyAvLyBleGNlcHQgfCBvbmx5XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0SGVhZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcy5nZXRBdHRyaWJ1dGUoICd3Y19hcmNoaXZlX3BhZ2VzJyApLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuICggJ29ubHknID09PSB0aGlzLmdldEF0dHJpYnV0ZSggJ2ZpbHRlcl90eXBlJyApID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMub25seV90aGVzZSA6IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLmV4Y2VwdF90aGVzZSApLnJlcGxhY2UoICd7bnVtYmVyfScsIHRoaXMuZ2V0QXR0cmlidXRlKCAnd2NfYXJjaGl2ZV9wYWdlcycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktc2VsZWN0JyApXG5cdFx0XHRcdC52YWwoIHRoaXMuZ2V0QXR0cmlidXRlKCAnd2NfYXJjaGl2ZV9wYWdlcycgKSApXG5cdFx0XHRcdC5TVUlzZWxlY3QyKClcblx0XHRcdFx0Lm9uKCAnc2VsZWN0MjpzZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApXG5cdFx0XHRcdC5vbiggJ3NlbGVjdDI6dW5zZWxlY3RpbmcnLCByZWVuYWJsZVNjcm9sbCApO1xuXHRcdH1cblx0fSk7XG5cblx0LyoqXG5cdCAqIFdvb0NvbW1lcmNlIFN0YXRpYyBQYWdlc1xuXHQgKi9cblx0T3B0aW4uVmlldy5Db25kaXRpb25zLndjX3N0YXRpY19wYWdlcyA9IENvbmRpdGlvbkJhc2UuZXh0ZW5kKHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRjb25kaXRpb25JZDogJ3djX3N0YXRpY19wYWdlcycsXG5cdFx0c2V0UHJvcGVydGllcygpIHtcblx0XHRcdHRoaXMudGl0bGUgPSBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9ucy53Y19zdGF0aWNfcGFnZXM7XG5cdFx0fSxcblx0XHRkZWZhdWx0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQnd2Nfc3RhdGljX3BhZ2VzJzogJycsXG5cdFx0XHRcdCdmaWx0ZXJfdHlwZSc6ICdleGNlcHQnIC8vIGV4Y2VwdCB8IG9ubHlcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLmdldEF0dHJpYnV0ZSggJ3djX3N0YXRpY19wYWdlcycgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybiAoICdvbmx5JyA9PT0gdGhpcy5nZXRBdHRyaWJ1dGUoICdmaWx0ZXJfdHlwZScgKSA/IG9wdGluVmFycy5tZXNzYWdlcy5jb25kaXRpb25fbGFiZWxzLm9ubHlfdGhlc2UgOiBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5leGNlcHRfdGhlc2UgKS5yZXBsYWNlKCAne251bWJlcn0nLCB0aGlzLmdldEF0dHJpYnV0ZSggJ3djX3N0YXRpY19wYWdlcycgKS5sZW5ndGggKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAnb25seScgPT09IHRoaXMuZ2V0QXR0cmlidXRlKCAnZmlsdGVyX3R5cGUnICkgPyBvcHRpblZhcnMubWVzc2FnZXMuY29uZGl0aW9uX2xhYmVscy5ub25lIDogb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbmRpdGlvbl9sYWJlbHMuYWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym9keTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXREYXRhKCkgKTtcblx0XHR9LFxuXHRcdHJlbmRlcmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJCggJy5zdWktc2VsZWN0JyApXG5cdFx0XHRcdC52YWwoIHRoaXMuZ2V0QXR0cmlidXRlKCAnd2Nfc3RhdGljX3BhZ2VzJyApIClcblx0XHRcdFx0LlNVSXNlbGVjdDIoKVxuXHRcdFx0XHQub24oICdzZWxlY3QyOnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsIClcblx0XHRcdFx0Lm9uKCAnc2VsZWN0Mjp1bnNlbGVjdGluZycsIHJlZW5hYmxlU2Nyb2xsICk7XG5cdFx0fVxuXHR9KTtcblxuXHQkKCBkb2N1bWVudCApLnRyaWdnZXIoICdodXN0bGVBZGRWaWV3Q29uZGl0aW9ucycsIFsgQ29uZGl0aW9uQmFzZSBdKTtcblxufSggalF1ZXJ5ICkgKTtcbiIsIkh1c3RsZS5kZWZpbmUoICdTZXR0aW5ncy5QYWxldHRlcycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0XHRlbDogJyNwYWxldHRlcy1ib3gnLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jcmVhdGUtcGFsZXR0ZSc6ICdvcGVuQ3JlYXRlUGFsZXR0ZU1vZGFsJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLWRlbGV0ZS1idXR0b24nOiAnb3BlbkRlbGV0ZVBhbGV0dGVNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1idXR0b24tZGVsZXRlJzogJ2RlbGV0dGVQYWxldHRlJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplKCkge1xuXHRcdFx0Y29uc3QgUGFsZXR0ZU1vZGFsID0gSHVzdGxlLmdldCggJ1NldHRpbmdzLlBhbGV0dGVzX01vZGFsJyApO1xuXHRcdFx0dGhpcy5wYWxldHRlTW9kYWwgPSBuZXcgUGFsZXR0ZU1vZGFsKCk7XG5cdFx0fSxcblxuXHRcdG9wZW5DcmVhdGVQYWxldHRlTW9kYWwoIGUgKSB7XG5cdFx0XHR0aGlzLnBhbGV0dGVNb2RhbC5vcGVuKCBlICk7XG5cdFx0fSxcblxuXHRcdG9wZW5EZWxldGVQYWxldHRlTW9kYWwoIGUgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdGlkOiAkdGhpcy5kYXRhKCAnaWQnICksXG5cdFx0XHRcdFx0dGl0bGU6ICR0aGlzLmRhdGEoICd0aXRsZScgKSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogJHRoaXMuZGF0YSggJ2Rlc2NyaXB0aW9uJyApLFxuXHRcdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZScsXG5cdFx0XHRcdFx0bm9uY2U6ICR0aGlzLmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0XHRhY3Rpb25DbGFzczogJ2h1c3RsZS1idXR0b24tZGVsZXRlJ1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRNb2R1bGUuZGVsZXRlTW9kYWwub3BlbiggZGF0YSApO1xuXG5cdFx0XHQvLyBUaGlzIGVsZW1lbnQgaXMgb3V0c2lkZSB0aGUgdmlldyBhbmQgb25seSBhZGRlZCBhZnRlciBvcGVuaW5nIHRoZSBtb2RhbC5cblx0XHRcdCQoICcuaHVzdGxlLWJ1dHRvbi1kZWxldGUnICkub24oICdjbGljaycsICQucHJveHkoIHRoaXMuZGVsZXR0ZVBhbGV0dGUsIHRoaXMgKSApO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBIYW5kbGUgdGhlIGNvbG9yIHBhbGV0dGVzICdkZWxldGUnIGFjdGlvbi5cblx0XHQgKiBAc2luY2UgNC4wLjNcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gZVxuXHRcdCAqL1xuXHRcdGRlbGV0dGVQYWxldHRlKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRjb25zdCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRyZWxhdGVkRm9ybUlkID0gJHRoaXMuZGF0YSggJ2Zvcm0taWQnICksXG5cdFx0XHRcdGFjdGlvbkRhdGEgPSAkdGhpcy5kYXRhKCksXG5cdFx0XHRcdCRmb3JtID0gJCggJyMnICsgcmVsYXRlZEZvcm1JZCApLFxuXHRcdFx0XHRkYXRhID0gbmV3IEZvcm1EYXRhKCAkZm9ybVswXSk7XG5cblx0XHRcdC8vIFRPRE86IHJlbW92ZSB3aGVuIFwiaHVzdGxlX2FjdGlvblwiIGZpZWxkIG5hbWUgaXMgY2hhbmdlZCB0byBcImh1c3RsZUFjdGlvblwiXG5cdFx0XHQkLmVhY2goIGFjdGlvbkRhdGEsICggbmFtZSwgdmFsdWUgKSA9PiBkYXRhLmFwcGVuZCggbmFtZSwgdmFsdWUgKSApO1xuXG5cdFx0XHRkYXRhLmFwcGVuZCggJ19hamF4X25vbmNlJywgb3B0aW5WYXJzLnNldHRpbmdzX3BhbGV0dGVzX2FjdGlvbl9ub25jZSApO1xuXHRcdFx0ZGF0YS5hcHBlbmQoICdhY3Rpb24nLCAnaHVzdGxlX2hhbmRsZV9wYWxldHRlX2FjdGlvbnMnICk7XG5cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXG5cdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKCByZXMgPT4ge1xuXG5cdFx0XHRcdGlmICggcmVzLmRhdGEudXJsICkge1xuXHRcdFx0XHRcdGxvY2F0aW9uLnJlcGxhY2UoIHJlcy5kYXRhLnVybCApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIHJlcy5kYXRhLm5vdGlmaWNhdGlvbiApIHtcblx0XHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oIHJlcy5kYXRhLm5vdGlmaWNhdGlvbi5zdGF0dXMsIHJlcy5kYXRhLm5vdGlmaWNhdGlvbi5tZXNzYWdlLCByZXMuZGF0YS5ub3RpZmljYXRpb24uZGVsYXkgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIERvbid0IHJlbW92ZSB0aGUgJ2xvYWRpbmcnIGljb24gd2hlbiByZWRpcmVjdGluZy9yZWxvYWRpbmcuXG5cdFx0XHRcdGlmICggISByZXMuZGF0YS51cmwgKSB7XG5cdFx0XHRcdFx0JCggJy5zdWktYnV0dG9uLW9ubG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmVycm9yKCAoKSA9PiB7XG5cdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnMuZ2VuZXJpY19hamF4X2Vycm9yICk7XG5cdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXG5cdH0pO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU2V0dGluZ3MuRGF0YV9TZXR0aW5ncycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjZGF0YS1ib3gnLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgI2h1c3RsZS1kaWFsb2ctb3Blbi0tcmVzZXQtZGF0YS1zZXR0aW5ncyc6ICdkYXRhRGlhbG9nJyxcblx0XHRcdCdjbGljayAuc3VpLWRpYWxvZy1jb250ZW50ICNodXN0bGUtcmVzZXQtc2V0dGluZ3MnOiAnc2V0dGluZ3NSZXNldCdcblx0XHR9LFxuXG5cdFx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdFx0Ly8gRElBTE9HOiBSZXNldCBTZXR0aW5nc1xuXHRcdC8vIE9wZW4gZGlhbG9nXG5cdFx0ZGF0YURpYWxvZzogZnVuY3Rpb24oIGUgKSB7XG5cblx0XHRcdHZhciAkYnV0dG9uID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHQkZGlhbG9nID0gJCggJyNodXN0bGUtZGlhbG9nLS1yZXNldC1kYXRhLXNldHRpbmdzJyApLFxuXHRcdFx0XHQkdGl0bGUgID0gJGRpYWxvZy5maW5kKCAnI2RpYWxvZ1RpdGxlJyApLFxuXHRcdFx0XHQkaW5mbyAgID0gJGRpYWxvZy5maW5kKCAnI2RpYWxvZ0Rlc2NyaXB0aW9uJyApXG5cdFx0XHRcdDtcblxuXHRcdFx0JHRpdGxlLnRleHQoICRidXR0b24uZGF0YSggJ2RpYWxvZy10aXRsZScgKSApO1xuXHRcdFx0JGluZm8udGV4dCggJGJ1dHRvbi5kYXRhKCAnZGlhbG9nLWluZm8nICkgKTtcblxuXHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLXJlc2V0LWRhdGEtc2V0dGluZ3MnXS5zaG93KCk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdH0sXG5cblx0XHQvLyBDb25maXJtIGFuZCBjbG9zZVxuXHRcdHNldHRpbmdzUmVzZXQ6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0dmFyICR0aGlzICAgID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHQkZGlhbG9nICA9ICR0aGlzLmNsb3Nlc3QoICcuc3VpLWRpYWxvZycgKSxcblx0XHRcdFx0JGJ1dHRvbnMgPSAkZGlhbG9nLmZpbmQoICdidXR0b24sIC5zdWktYnV0dG9uJyApO1xuXG5cdFx0XHQkYnV0dG9ucy5wcm9wKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cdFx0XHQkdGhpcy5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfcmVzZXRfc2V0dGluZ3MnLFxuXHRcdFx0XHRcdF9hamF4X25vbmNlOiAkdGhpcy5kYXRhKCAnbm9uY2UnICkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JCggJyMnICsgJHRoaXMuZGF0YSggJ25vdGljZScgKSApLnNob3coKTtcblx0XHRcdFx0XHRTVUkuZGlhbG9nc1sgJGRpYWxvZy5hdHRyKCAnaWQnICkgXS5oaWRlKCk7XG5cdFx0XHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0XHQkYnV0dG9ucy5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ3N1Y2Nlc3MnLCBvcHRpblZhcnMubWVzc2FnZXMuc2V0dGluZ3Nfd2FzX3Jlc2V0ICk7XG5cdFx0XHRcdFx0d2luZG93LnNldFRpbWVvdXQoICgpID0+IGxvY2F0aW9uLnJlbG9hZCggdHJ1ZSApLCAyMDAwICk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRTVUkuZGlhbG9nc1sgJGRpYWxvZy5hdHRyKCAnaWQnICkgXS5oaWRlKCk7XG5cdFx0XHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0XHQkYnV0dG9ucy5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgb3B0aW5WYXJzLm1lc3NhZ2VzLnNvbWV0aGluZ193ZW50X3dyb25nICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ1NldHRpbmdzLlBhbGV0dGVzX01vZGFsJywgZnVuY3Rpb24oICQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJyNodXN0bGUtZGlhbG9nLS1lZGl0LXBhbGV0dGUnLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1idXR0b24tYWN0aW9uJzogJ2hhbmRsZUFjdGlvbicsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1jYW5jZWwtcGFsZXR0ZSc6ICdjbG9zZUNyZWF0ZVBhbGV0dGVNb2RhbCcsXG5cdFx0XHQnY2hhbmdlICNodXN0bGUtcGFsZXR0ZS1tb2R1bGUtdHlwZSc6ICd1cGRhdGVNb2R1bGVzT3B0aW9ucydcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSgpIHt9LFxuXG5cdFx0b3BlbiggZSApIHtcblxuXHRcdFx0Y29uc3Qgc2x1ZyA9ICQoIGUuY3VycmVudFRhcmdldCApLmRhdGEoICdzbHVnJyApO1xuXG5cdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2Ygc2x1ZyApIHtcblxuXHRcdFx0XHQvLyBXaGVuIGVkaXRpbmcgYSBwYWxldHRlLlxuXHRcdFx0XHR0aGlzLmhhbmRsZUFjdGlvbiggZSApO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBXaGVuIGNyZWF0aW5nIGEgbmV3IHBhbGV0dGUuXG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBtb2R1bGVzJyBvcHRpb25zIHdoZW4gb3BlbmluZy5cblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1wYWxldHRlLW1vZHVsZS10eXBlJyApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cblx0XHRcdFx0U1VJLm9wZW5Nb2RhbCggJ2h1c3RsZS1kaWFsb2ctLWVkaXQtcGFsZXR0ZScsIGUuY3VycmVudFRhcmdldCwgJ2h1c3RsZS1wYWxldHRlLW5hbWUnLCBmYWxzZSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBIYW5kbGUgdGhlIGNvbG9yIHBhbGV0dGVzICdzYXZlJyBhY3Rpb24uXG5cdFx0ICogQHNpbmNlIDQuMC4zXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IGVcblx0XHQgKi9cblx0XHRoYW5kbGVBY3Rpb24oIGUgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRyZWxhdGVkRm9ybUlkID0gJHRoaXMuZGF0YSggJ2Zvcm0taWQnICksXG5cdFx0XHRcdGFjdGlvbkRhdGEgPSAkdGhpcy5kYXRhKCk7XG5cblx0XHRcdCR0aGlzLmFkZENsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZUhpZGUoIHRoaXMuJCggJy5zdWktZXJyb3ItbWVzc2FnZScgKSApO1xuXG5cdFx0XHRsZXQgZGF0YSA9IG5ldyBGb3JtRGF0YSgpLFxuXHRcdFx0XHRlcnJvcnMgPSBmYWxzZSA7XG5cblxuXHRcdFx0Ly8gR3JhYiB0aGUgZm9ybSdzIGRhdGEgaWYgdGhlIGFjdGlvbiBoYXMgYSByZWxhdGVkIGZvcm0uXG5cdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgcmVsYXRlZEZvcm1JZCApIHtcblx0XHRcdFx0Y29uc3QgJGZvcm0gPSAkKCAnIycgKyByZWxhdGVkRm9ybUlkICk7XG5cblx0XHRcdFx0aWYgKCAkZm9ybS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0ZGF0YSA9IG5ldyBGb3JtRGF0YSggJGZvcm1bMF0pO1xuXHRcdFx0XHRcdCRmb3JtLmZpbmQoICcuaHVzdGxlLXJlcXVpcmVkLWZpZWxkJyApLmVhY2goICggaSwgZWwgKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCAkZmllbGQgPSAkKCBlbCApO1xuXG5cdFx0XHRcdFx0XHRcdGlmICggISAkZmllbGQudmFsKCkudHJpbSgpLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvck1lc3NhZ2UgPSAkZmllbGQuZGF0YSggJ2Vycm9yLW1lc3NhZ2UnICksXG5cdFx0XHRcdFx0XHRcdFx0XHQkZXJyb3JNZXNzYWdlID0gJGZpZWxkLnNpYmxpbmdzKCAnLnN1aS1lcnJvci1tZXNzYWdlJyApO1xuXG5cdFx0XHRcdFx0XHRcdFx0JGVycm9yTWVzc2FnZS5odG1sKCBlcnJvck1lc3NhZ2UgKTtcblx0XHRcdFx0XHRcdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coICRlcnJvck1lc3NhZ2UgKTtcblx0XHRcdFx0XHRcdFx0XHRlcnJvcnMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gRG9uJ3QgZG8gdGhlIHJlcXVlc3QgaWYgdGhlcmUgYXJlIG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzLlxuXHRcdFx0aWYgKCBlcnJvcnMgKSB7XG5cdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQkLmVhY2goIGFjdGlvbkRhdGEsICggbmFtZSwgdmFsdWUgKSA9PiBkYXRhLmFwcGVuZCggbmFtZSwgdmFsdWUgKSApO1xuXG5cdFx0XHRkYXRhLmFwcGVuZCggJ19hamF4X25vbmNlJywgb3B0aW5WYXJzLnNldHRpbmdzX3BhbGV0dGVzX2FjdGlvbl9ub25jZSApO1xuXHRcdFx0ZGF0YS5hcHBlbmQoICdhY3Rpb24nLCAnaHVzdGxlX2hhbmRsZV9wYWxldHRlX2FjdGlvbnMnICk7XG5cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXG5cdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKCByZXMgPT4ge1xuXG5cdFx0XHRcdC8vIElmIHRoZXJlJ3MgYSBkZWZpbmVkIGNhbGxiYWNrLCBjYWxsIGl0LlxuXHRcdFx0XHRpZiAoIHJlcy5kYXRhLmNhbGxiYWNrICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBzZWxmWyByZXMuZGF0YS5jYWxsYmFjayBdKSB7XG5cblx0XHRcdFx0XHQvLyBUaGlzIGNhbGxzIHRoZSBcImFjdGlvbnsgaHVzdGxlIGFjdGlvbiB9XCIgZnVuY3Rpb25zIGZyb20gdGhpcyB2aWV3LlxuXHRcdFx0XHRcdC8vIEZvciBleGFtcGxlOiBhY3Rpb25Ub2dnbGVTdGF0dXMoKTtcblx0XHRcdFx0XHRzZWxmWyByZXMuZGF0YS5jYWxsYmFjayBdKCByZXMuZGF0YSwgcmVzLnN1Y2Nlc3MsIGUgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCByZXMuZGF0YS51cmwgKSB7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVwbGFjZSggcmVzLmRhdGEudXJsICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggcmVzLmRhdGEubm90aWZpY2F0aW9uICkge1xuXG5cdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCByZXMuZGF0YS5ub3RpZmljYXRpb24uc3RhdHVzLCByZXMuZGF0YS5ub3RpZmljYXRpb24ubWVzc2FnZSwgcmVzLmRhdGEubm90aWZpY2F0aW9uLmRlbGF5ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBEb24ndCByZW1vdmUgdGhlICdsb2FkaW5nJyBpY29uIHdoZW4gcmVkaXJlY3RpbmcvcmVsb2FkaW5nLlxuXHRcdFx0XHRpZiAoICEgcmVzLmRhdGEudXJsICkge1xuXHRcdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5lcnJvciggcmVzID0+IHtcblx0XHRcdFx0JCggJy5zdWktYnV0dG9uLW9ubG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGFjdGlvbk9wZW5FZGl0UGFsZXR0ZSggZGF0YSwgc3VjY2VzcywgZSApIHtcblxuXHRcdFx0dGhpcy5hY3Rpb25Hb1RvU2Vjb25kU3RlcCggZGF0YSApO1xuXHRcdFx0U1VJLm9wZW5Nb2RhbCggJ2h1c3RsZS1kaWFsb2ctLWVkaXQtcGFsZXR0ZScsIGUuY3VycmVudFRhcmdldCwgJ2h1c3RsZS1wYWxldHRlLW5hbWUnLCBmYWxzZSApO1xuXG5cdFx0XHRpZiAoIGRhdGEucGFsZXR0ZV9kYXRhLm5hbWUgKSB7XG5cdFx0XHRcdCQoICcjaHVzdGxlLWRpYWxvZy0tZWRpdC1wYWxldHRlJyApLmZpbmQoICcjaHVzdGxlLXBhbGV0dGUtbmFtZScgKS52YWwoIGRhdGEucGFsZXR0ZV9kYXRhLm5hbWUgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0YWN0aW9uR29Ub1NlY29uZFN0ZXAoIGRhdGEgKSB7XG5cblx0XHRcdGNvbnN0IHN0ZXBPbmUgICAgID0gdGhpcy4kKCAnI2h1c3RsZS1lZGl0LXBhbGV0dGUtZmlyc3Qtc3RlcCcgKSxcblx0XHRcdFx0c3RlcFR3byAgICAgPSB0aGlzLiQoICcjaHVzdGxlLWVkaXQtcGFsZXR0ZS1zZWNvbmQtc3RlcCcgKSxcblx0XHRcdFx0YnRuQWN0aW9uICAgPSB0aGlzLiQoICcuaHVzdGxlLWJ1dHRvbi1hY3Rpb24nICksXG5cdFx0XHRcdHBhbGV0dGVEYXRhID0gZGF0YS5wYWxldHRlX2RhdGEsXG5cdFx0XHRcdHRlbXBsYXRlICAgID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtZGlhbG9nLS1lZGl0LXBhbGV0dGUtdHBsJyApO1xuXG5cdFx0XHQvLyBIaWRlIGZpcnN0IHN0ZXBcblx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlSGlkZSggc3RlcE9uZSwgdHJ1ZSApO1xuXG5cdFx0XHQvLyBQcmludCBhbmQgc2hvdyBzZWNvbmQgc3RlcFxuXHRcdFx0c3RlcFR3by5odG1sKCB0ZW1wbGF0ZSggcGFsZXR0ZURhdGEgKSApO1xuXHRcdFx0dGhpcy5pbml0aWF0ZVNlY29uZFN0ZXBFbGVtZW50cygpO1xuXG5cdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coIHN0ZXBUd28sIHRydWUgKTtcblx0XHRcdHN0ZXBUd28uZm9jdXMoKTtcblxuXHRcdFx0Ly8gU2V0IG5ldyBzdGVwXG5cdFx0XHRidG5BY3Rpb24uZGF0YSggJ3N0ZXAnLCAzICk7XG5cdFx0XHRidG5BY3Rpb24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLWJsdWUnICk7XG5cdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZUhpZGUoIGJ0bkFjdGlvbi5maW5kKCAnI2h1c3RsZS1zdGVwLWJ1dHRvbi10ZXh0JyApICk7XG5cdFx0XHRNb2R1bGUuVXRpbHMuYWNjZXNzaWJsZVNob3coIGJ0bkFjdGlvbi5maW5kKCAnI2h1c3RsZS1maW5pc2gtYnV0dG9uLXRleHQnICkgKTtcblxuXHRcdH0sXG5cblx0XHRpbml0aWF0ZVNlY29uZFN0ZXBFbGVtZW50cygpIHtcblxuXHRcdFx0Ly8gQWNjb3JkaW9ucy5cblx0XHRcdHRoaXMuJCggJy5zdWktYWNjb3JkaW9uJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRTVUkuc3VpQWNjb3JkaW9uKCB0aGlzICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gSW5pdCB0YWJzXG5cdFx0XHRTVUkuc3VpVGFicygpO1xuXHRcdFx0U1VJLnRhYnMoKTtcblxuXHRcdFx0Ly8gQ29sb3IgcGlja2Vycy5cblx0XHRcdHRoaXMuY3JlYXRlUGlja2VycygpO1xuXHRcdH0sXG5cblx0XHRjbG9zZUNyZWF0ZVBhbGV0dGVNb2RhbCgpIHtcblxuXHRcdFx0Y29uc3Qgc2VsZiAgICA9IHRoaXMsXG5cdFx0XHRcdHN0ZXBPbmUgICA9IHRoaXMuJCggJyNodXN0bGUtZWRpdC1wYWxldHRlLWZpcnN0LXN0ZXAnICksXG5cdFx0XHRcdHN0ZXBUd28gICA9IHRoaXMuJCggJyNodXN0bGUtZWRpdC1wYWxldHRlLXNlY29uZC1zdGVwJyApLFxuXHRcdFx0XHRidG5BY3Rpb24gPSB0aGlzLiQoICcuaHVzdGxlLWJ1dHRvbi1hY3Rpb24nICk7XG5cblx0XHRcdC8vIEhpZGUgbW9kYWxcblx0XHRcdFNVSS5jbG9zZU1vZGFsKCk7XG5cblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdC8vIEhpZGUgZXJyb3IgbWVzc2FnZXNcblx0XHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCBzZWxmLiQoICcuc3VpLWVycm9yLW1lc3NhZ2UnICkgKTtcblxuXHRcdFx0XHQvLyBIaWRlIHNlY29uZCBzdGVwXG5cdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlSGlkZSggc3RlcFR3bywgdHJ1ZSApO1xuXHRcdFx0XHRzdGVwVHdvLmh0bWwoICcnICk7XG5cblx0XHRcdFx0Ly8gU2hvdyBmaXJzdCBzdGVwXG5cdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggc3RlcE9uZSwgdHJ1ZSApO1xuXG5cdFx0XHRcdC8vIFJlc2V0IGFjdGlvbiBidXR0b25cblx0XHRcdFx0YnRuQWN0aW9uLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1ibHVlJyApO1xuXHRcdFx0XHRidG5BY3Rpb24uZGF0YSggJ3N0ZXAnLCAyICk7XG5cdFx0XHRcdE1vZHVsZS5VdGlscy5hY2Nlc3NpYmxlU2hvdyggYnRuQWN0aW9uLmZpbmQoICcjaHVzdGxlLXN0ZXAtYnV0dG9uLXRleHQnICkgKTtcblx0XHRcdFx0TW9kdWxlLlV0aWxzLmFjY2Vzc2libGVIaWRlKCBidG5BY3Rpb24uZmluZCggJyNodXN0bGUtZmluaXNoLWJ1dHRvbi10ZXh0JyApICk7XG5cblx0XHRcdH0sIDUwMCApO1xuXG5cdFx0fSxcblxuXHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdC8vIENvbG9yIFBpY2tlcnNcblxuXHRcdC8vIFRPRE86IENvcGllZCBmcm9tIHdpemFyZHMuIFJlLXVzZSBpbnN0ZWFkIG9mIGNvcHktcGFzdGluZ1xuXHRcdGNyZWF0ZVBpY2tlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdCRzdWlQaWNrZXJJbnB1dHMgPSB0aGlzLiQoICcuc3VpLWNvbG9ycGlja2VyLWlucHV0JyApO1xuXG5cdFx0XHQkc3VpUGlja2VySW5wdXRzLndwQ29sb3JQaWNrZXIoe1xuXG5cdFx0XHRcdGNoYW5nZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICk7XG5cblx0XHRcdFx0XHQvLyBQcmV2ZW50IHRoZSBtb2RlbCBmcm9tIGJlaW5nIG1hcmtlZCBhcyBjaGFuZ2VkIG9uIGxvYWQuXG5cdFx0XHRcdFx0aWYgKCAkdGhpcy52YWwoKSAhPT0gdWkuY29sb3IudG9DU1MoKSApIHtcblx0XHRcdFx0XHRcdCR0aGlzLnZhbCggdWkuY29sb3IudG9DU1MoKSApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYWxldHRlczogW1xuXHRcdFx0XHRcdCcjMzMzMzMzJyxcblx0XHRcdFx0XHQnI0ZGRkZGRicsXG5cdFx0XHRcdFx0JyMxN0E4RTMnLFxuXHRcdFx0XHRcdCcjRTFGNkZGJyxcblx0XHRcdFx0XHQnIzY2NjY2NicsXG5cdFx0XHRcdFx0JyNBQUFBQUEnLFxuXHRcdFx0XHRcdCcjRTZFNkU2J1xuXHRcdFx0XHRdXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCAkc3VpUGlja2VySW5wdXRzLmhhc0NsYXNzKCAnd3AtY29sb3ItcGlja2VyJyApICkge1xuXG5cdFx0XHRcdCRzdWlQaWNrZXJJbnB1dHMuZWFjaCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHR2YXIgJHN1aVBpY2tlcklucHV0ID0gJCggdGhpcyApLFxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlciAgICAgID0gJHN1aVBpY2tlcklucHV0LmNsb3Nlc3QoICcuc3VpLWNvbG9ycGlja2VyLXdyYXAnICksXG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyQ29sb3IgPSAkc3VpUGlja2VyLmZpbmQoICcuc3VpLWNvbG9ycGlja2VyLXZhbHVlIHNwYW5bcm9sZT1idXR0b25dJyApLFxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlclZhbHVlID0gJHN1aVBpY2tlci5maW5kKCAnLnN1aS1jb2xvcnBpY2tlci12YWx1ZScgKSxcblx0XHRcdFx0XHRcdCRzdWlQaWNrZXJDbGVhciA9ICRzdWlQaWNrZXJWYWx1ZS5maW5kKCAnYnV0dG9uJyApLFxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlclR5cGUgID0gJ2hleCdcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdHZhciAkd3BQaWNrZXIgICAgICAgPSAkc3VpUGlja2VySW5wdXQuY2xvc2VzdCggJy53cC1waWNrZXItY29udGFpbmVyJyApLFxuXHRcdFx0XHRcdFx0JHdwUGlja2VyQnV0dG9uID0gJHdwUGlja2VyLmZpbmQoICcud3AtY29sb3ItcmVzdWx0JyApLFxuXHRcdFx0XHRcdFx0JHdwUGlja2VyQWxwaGEgID0gJHdwUGlja2VyQnV0dG9uLmZpbmQoICcuY29sb3ItYWxwaGEnICksXG5cdFx0XHRcdFx0XHQkd3BQaWNrZXJDbGVhciAgPSAkd3BQaWNrZXIuZmluZCggJy53cC1waWNrZXItY2xlYXInIClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdC8vIENoZWNrIGlmIGFscGhhIGV4aXN0c1xuXHRcdFx0XHRcdGlmICggdHJ1ZSA9PT0gJHN1aVBpY2tlcklucHV0LmRhdGEoICdhbHBoYScgKSApIHtcblxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlclR5cGUgPSAncmdiYSc7XG5cblx0XHRcdFx0XHRcdC8vIExpc3RlbiB0byBjb2xvciBjaGFuZ2Vcblx0XHRcdFx0XHRcdCRzdWlQaWNrZXJJbnB1dC5iaW5kKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQ2hhbmdlIGNvbG9yIHByZXZpZXdcblx0XHRcdFx0XHRcdFx0JHN1aVBpY2tlckNvbG9yLmZpbmQoICdzcGFuJyApLmNzcyh7XG5cdFx0XHRcdFx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiAkd3BQaWNrZXJBbHBoYS5jc3MoICdiYWNrZ3JvdW5kJyApXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdC8vIENoYW5nZSBjb2xvciB2YWx1ZVxuXHRcdFx0XHRcdFx0XHQkc3VpUGlja2VyVmFsdWUuZmluZCggJ2lucHV0JyApLnZhbCggJHN1aVBpY2tlcklucHV0LnZhbCgpICk7XG5cblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0Ly8gTGlzdGVuIHRvIGNvbG9yIGNoYW5nZVxuXHRcdFx0XHRcdFx0JHN1aVBpY2tlcklucHV0LmJpbmQoICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBDaGFuZ2UgY29sb3IgcHJldmlld1xuXHRcdFx0XHRcdFx0XHQkc3VpUGlja2VyQ29sb3IuZmluZCggJ3NwYW4nICkuY3NzKHtcblx0XHRcdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6ICR3cFBpY2tlckJ1dHRvbi5jc3MoICdiYWNrZ3JvdW5kLWNvbG9yJyApXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdC8vIENoYW5nZSBjb2xvciB2YWx1ZVxuXHRcdFx0XHRcdFx0XHQkc3VpUGlja2VyVmFsdWUuZmluZCggJ2lucHV0JyApLnZhbCggJHN1aVBpY2tlcklucHV0LnZhbCgpICk7XG5cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEFkZCBwaWNrZXIgdHlwZSBjbGFzc1xuXHRcdFx0XHRcdCRzdWlQaWNrZXIuZmluZCggJy5zdWktY29sb3JwaWNrZXInICkuYWRkQ2xhc3MoICdzdWktY29sb3JwaWNrZXItJyArICRzdWlQaWNrZXJUeXBlICk7XG5cblx0XHRcdFx0XHQvLyBPcGVuIGlyaXMgcGlja2VyXG5cdFx0XHRcdFx0JHN1aVBpY2tlci5maW5kKCAnLnN1aS1idXR0b24sIHNwYW5bcm9sZT1idXR0b25dJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0XHRcdFx0JHdwUGlja2VyQnV0dG9uLmNsaWNrKCk7XG5cblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vIENsZWFyIGNvbG9yIHZhbHVlXG5cdFx0XHRcdFx0JHN1aVBpY2tlckNsZWFyLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0XHRcdFx0bGV0IGlucHV0TmFtZSA9ICRzdWlQaWNrZXJJbnB1dC5kYXRhKCAnYXR0cmlidXRlJyApLFxuXHRcdFx0XHRcdFx0XHRzZWxlY3RlZFN0eWxlID0gJCggJyNodXN0bGUtcGFsZXR0ZS1tb2R1bGUtZmFsbGJhY2snICkudmFsKCksXG5cdFx0XHRcdFx0XHRcdHJlc2V0VmFsdWUgPSBvcHRpblZhcnMucGFsZXR0ZXNbIHNlbGVjdGVkU3R5bGUgXVsgaW5wdXROYW1lIF07XG5cblx0XHRcdFx0XHRcdCR3cFBpY2tlckNsZWFyLmNsaWNrKCk7XG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyVmFsdWUuZmluZCggJ2lucHV0JyApLnZhbCggcmVzZXRWYWx1ZSApO1xuXHRcdFx0XHRcdFx0JHN1aVBpY2tlcklucHV0LnZhbCggcmVzZXRWYWx1ZSApLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0XHRcdFx0XHQkc3VpUGlja2VyQ29sb3IuZmluZCggJ3NwYW4nICkuY3NzKHtcblx0XHRcdFx0XHRcdFx0J2JhY2tncm91bmQtY29sb3InOiByZXNldFZhbHVlXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dXBkYXRlTW9kdWxlc09wdGlvbnMoIGUgKSB7XG5cblx0XHRcdGNvbnN0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdG1vZHVsZVR5cGUgPSAkdGhpcy52YWwoKSxcblx0XHRcdFx0JG1vZHVsZXNPcHRpb25zU2VsZWN0ID0gdGhpcy4kKCAnI2h1c3RsZS1wYWxldHRlLW1vZHVsZS1uYW1lJyApO1xuXG5cdFx0XHRsZXQgaHRtbCA9ICcnO1xuXG5cdFx0XHQkLmVhY2goIG9wdGluVmFycy5jdXJyZW50WyBtb2R1bGVUeXBlIF0sICggaWQsIG5hbWUgKSA9PiB7XG5cdFx0XHRcdGh0bWwgKz0gYDxvcHRpb24gdmFsdWU9XCIkeyBpZCB9XCI+JHsgbmFtZSB9PC9vcHRpb24+YDtcblx0XHRcdH0pO1xuXG5cdFx0XHQkbW9kdWxlc09wdGlvbnNTZWxlY3QuaHRtbCggaHRtbCApO1xuXG5cdFx0XHR0aGlzLiQoICcuc3VpLXNlbGVjdDpub3QoLmh1c3RsZS1zZWxlY3QtYWpheCknICkuU1VJc2VsZWN0Mih7XG5cdFx0XHRcdGRyb3Bkb3duQ3NzQ2xhc3M6ICdzdWktc2VsZWN0LWRyb3Bkb3duJ1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdH0pO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU2V0dGluZ3MuUGVybWlzc2lvbnNfVmlldycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI3Blcm1pc3Npb25zLWJveCcsXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdCQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdC8vRGVsZXRlIHRoZSByZW1vdmUgYWJpbGl0eSBmb3IgQWRtaW5pc3RyYXRvciBvcHRpb24gaW4gc2VsZWN0MlxuXHRcdFx0XHRmdW5jdGlvbiBibG9ja2luZ0FkbWluUmVtb3ZlKCkge1xuXHRcdFx0XHRcdCQoICcuc2VsZWN0Mi1zZWxlY3Rpb25fX3JlbmRlcmVkIGxpOmZpcnN0LWNoaWxkIC5zZWxlY3QyLXNlbGVjdGlvbl9fY2hvaWNlX19yZW1vdmUnICkub2ZmKCAnY2xpY2snICkudGV4dCggJycgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQoICdzZWxlY3QnICkub24oICdjaGFuZ2Uuc2VsZWN0MicsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRcdGJsb2NraW5nQWRtaW5SZW1vdmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJsb2NraW5nQWRtaW5SZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59KTtcbiIsIkh1c3RsZS5kZWZpbmUoICdTZXR0aW5ncy5Qcml2YWN5X1NldHRpbmdzJywgZnVuY3Rpb24oICQgKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0XHRlbDogJyNwcml2YWN5LWJveCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAjaHVzdGxlLWRpYWxvZy1vcGVuLS1kZWxldGUtaXBzJzogJ29wZW5EZWxldGVJcHNEaWFsb2cnXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JCggJyNodXN0bGUtZGVsZXRlLWlwcy1zdWJtaXQnICkub24oICdjbGljaycsIHRoaXMuaGFuZGxlSXBEZWxldGlvbiApO1xuXHRcdH0sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBESUFMT0c6IERlbGV0ZSBBbGwgSVBzXG5cdFx0Ly8gT3BlbiBkaWFsb2dcblx0XHRvcGVuRGVsZXRlSXBzRGlhbG9nKCBlICkge1xuXHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLWRlbGV0ZS1pcHMnXS5zaG93KCk7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSxcblxuXHRcdGhhbmRsZUlwRGVsZXRpb24oIGUgKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGNvbnN0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdCRkaWFsb2cgID0gJHRoaXMuY2xvc2VzdCggJy5zdWktZGlhbG9nJyApLFxuXHRcdFx0XHQkZm9ybSA9ICQoICcjJyArICR0aGlzLmRhdGEoICdmb3JtSWQnICkgKSxcblx0XHRcdFx0ZGF0YSA9IG5ldyBGb3JtRGF0YSggJGZvcm1bMF0pO1xuXG5cdFx0XHRkYXRhLmFwcGVuZCggJ2FjdGlvbicsICdodXN0bGVfcmVtb3ZlX2lwcycgKTtcblx0XHRcdGRhdGEuYXBwZW5kKCAnX2FqYXhfbm9uY2UnLCAkdGhpcy5kYXRhKCAnbm9uY2UnICkgKTtcblxuXHRcdFx0JHRoaXMuYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGEsXG5cdFx0XHRcdGNvbnRlbnRUeXBlOiBmYWxzZSxcblx0XHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzICkge1xuXG5cdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnc3VjY2VzcycsIHJlcy5kYXRhLm1lc3NhZ2UgKTtcblx0XHRcdFx0XHRTVUkuZGlhbG9nc1sgJGRpYWxvZy5hdHRyKCAnaWQnICkgXS5oaWRlKCk7XG5cdFx0XHRcdFx0JCggJy5zdWktYnV0dG9uLW9ubG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0U1VJLmRpYWxvZ3NbICRkaWFsb2cuYXR0ciggJ2lkJyApIF0uaGlkZSgpO1xuXHRcdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oICdlcnJvcicsIG9wdGluVmFycy5tZXNzYWdlcy5zb21ldGhpbmdfd2VudF93cm9uZyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fSk7XG5cbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ1NldHRpbmdzLnJlQ2FwdGNoYV9TZXR0aW5ncycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjcmVjYXB0Y2hhLWJveCcsXG5cdFx0ZGF0YToge30sXG5cblx0XHRpbml0aWFsaXplKCkge1xuXHRcdFx0dGhpcy5tYXliZVJlbmRlclJlY2FwdGNoYXMoKTtcblx0XHR9LFxuXG5cdFx0bWF5YmVSZW5kZXJSZWNhcHRjaGFzKCkge1xuXG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcyxcblx0XHRcdFx0dmVyc2lvbnMgPSBbICd2Ml9jaGVja2JveCcsICd2Ml9pbnZpc2libGUnLCAndjNfcmVjYXB0Y2hhJyBdO1xuXG5cdFx0XHRsZXQgc2NyaXB0QWRkZWQgPSBmYWxzZTtcblxuXHRcdFx0Zm9yICggbGV0IHZlcnNpb24gb2YgdmVyc2lvbnMgKSB7XG5cblx0XHRcdFx0Y29uc3QgJHByZXZpZXdDb250YWluZXIgPSB0aGlzLiQoIGAjaHVzdGxlLW1vZGFsLXJlY2FwdGNoYS0keyB2ZXJzaW9uIH0tMGAgKSxcblx0XHRcdFx0XHRzaXRla2V5ID0gdGhpcy4kKCBgaW5wdXRbbmFtZT1cIiR7IHZlcnNpb24gfV9zaXRlX2tleVwiXWAgKS52YWwoKS50cmltKCksXG5cdFx0XHRcdFx0c2VjcmV0a2V5ID0gdGhpcy4kKCBgaW5wdXRbbmFtZT1cIiR7IHZlcnNpb24gfV9zZWNyZXRfa2V5XCJdYCApLnZhbCgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAoIHNpdGVrZXkgJiYgc2VjcmV0a2V5ICkge1xuXG5cdFx0XHRcdFx0JHByZXZpZXdDb250YWluZXIuZGF0YSggJ3NpdGVrZXknLCBzaXRla2V5ICk7XG5cblx0XHRcdFx0XHRpZiAoICEgc2NyaXB0QWRkZWQgKSB7XG5cblx0XHRcdFx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdFx0XHRcdHVybDogYWpheHVybCxcblx0XHRcdFx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiAnaHVzdGxlX2xvYWRfcmVjYXB0Y2hhX3ByZXZpZXcnXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pLmRvbmUoIHJlc3VsdCA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmICggcmVzdWx0LnN1Y2Nlc3MgKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2NyaXB0QWRkZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYuJCggJyNodXN0bGUtcmVjYXB0Y2hhLXNjcmlwdC1jb250YWluZXInICkuaHRtbCggcmVzdWx0LmRhdGEgKTtcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCAoKSA9PiBIVUkubWF5YmVSZW5kZXJSZWNhcHRjaGEoICRwcmV2aWV3Q29udGFpbmVyLmNsb3Nlc3QoICcuc3VpLWZvcm0tZmllbGQnICkgKSwgMTAwMCApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRIVUkubWF5YmVSZW5kZXJSZWNhcHRjaGEoICRwcmV2aWV3Q29udGFpbmVyLmNsb3Nlc3QoICcuc3VpLWZvcm0tZmllbGQnICkgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0aGlzLiQoIGAuaHVzdGxlLXJlY2FwdGNoYS0keyB2ZXJzaW9uIH0tcHJldmlldy1ub3RpY2VgICkuaGlkZSgpO1xuXHRcdFx0XHRcdCRwcmV2aWV3Q29udGFpbmVyLnNob3coKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuJCggYC5odXN0bGUtcmVjYXB0Y2hhLSR7IHZlcnNpb24gfS1wcmV2aWV3LW5vdGljZWAgKS5zaG93KCk7XG5cdFx0XHRcdFx0JHByZXZpZXdDb250YWluZXIuaGlkZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU2V0dGluZ3MuVG9wX01ldHJpY3NfVmlldycsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdFx0ZWw6ICcjdG9wLW1ldHJpY3MtYm94JyxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5zdWktY2hlY2tib3ggaW5wdXQnOiAnbWF5YmVEaXNhYmxlSW5wdXRzJ1xuXHRcdH0sXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubWF5YmVEaXNhYmxlSW5wdXRzKCk7XG5cdFx0fSxcblxuXHRcdG1heWJlRGlzYWJsZUlucHV0czogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJGFsbGNoZWNrZWQgPSB0aGlzLiRlbC5maW5kKCAnaW5wdXQ6Y2hlY2tlZCcgKSxcblx0XHRcdFx0JHVuY2hlY2tlZCAgPSB0aGlzLiRlbC5maW5kKCAnaW5wdXQ6bm90KDpjaGVja2VkKScgKSxcblx0XHRcdFx0JGJ1dHRvbiAgXHQ9IHRoaXMuJGVsLmZpbmQoICdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScgKSxcblx0XHRcdFx0JGJ1dHRvblRpcCAgPSAkYnV0dG9uLnBhcmVudCgpLFxuXHRcdFx0XHQkZGVzaWduICAgICA9ICR1bmNoZWNrZWQubmV4dCggJ3NwYW4nICk7XG5cdFx0XHRpZiAoIDMgPD0gJGFsbGNoZWNrZWQubGVuZ3RoICkge1xuXHRcdFx0XHQkdW5jaGVja2VkLnByb3AoICdkaXNhYmxlZCcsIHRydWUgKTtcblx0XHRcdFx0JGRlc2lnbi5hZGRDbGFzcyggJ3N1aS10b29sdGlwJyApO1xuXHRcdFx0XHQkZGVzaWduLmNzcyggJ29wYWNpdHknLCAnMScgKTtcblx0XHRcdFx0JGJ1dHRvbi5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHQkYnV0dG9uVGlwLnJlbW92ZUNsYXNzKCAnc3VpLXRvb2x0aXAnICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkYnV0dG9uLnByb3AoICdkaXNhYmxlZCcsIHRydWUgKTtcblx0XHRcdFx0JHVuY2hlY2tlZC5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHQkZGVzaWduLnJlbW92ZUNsYXNzKCAnc3VpLXRvb2x0aXAnICk7XG5cdFx0XHRcdCRkZXNpZ24uY3NzKCAnb3BhY2l0eScsICcnICk7XG5cdFx0XHRcdCRidXR0b25UaXAuYWRkQ2xhc3MoICdzdWktdG9vbHRpcCcgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG4iLCIoIGZ1bmN0aW9uKCAkLCBkb2MgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCAnLndwb2ktbGlzdGluZy13cmFwIGhlYWRlci5jYW4tb3BlbiAudG9nZ2xlLCAud3BvaS1saXN0aW5nLXdyYXAgaGVhZGVyLmNhbi1vcGVuIC50b2dnbGUtbGFiZWwnLCBmdW5jdGlvbiggZSApIHtcblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9KTtcblxuXG5cdCQoICcuYWNjb3JkaW9uIGhlYWRlciAub3B0aW4tZGVsZXRlLW9wdGluLCAuYWNjb3JkaW9uIGhlYWRlciAuZWRpdC1vcHRpbiwgLndwb2ktb3B0aW4tZGV0YWlscyB0ciAuYnV0dG9uLWVkaXQnICkuaGlkZSgpLmNzcyh7XG5cdFx0dHJhbnNpdGlvbjogJ25vbmUnXG5cdH0pO1xuXG5cdCQoIGRvY3VtZW50ICkub24oe1xuXHRcdG1vdXNlZW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR0aGlzID0gJCggdGhpcyApO1xuXHRcdFx0JHRoaXMuZmluZCggJy5vcHRpbi1kZWxldGUtb3B0aW4sIC5lZGl0LW9wdGluJyApLnN0b3AoKS5mYWRlSW4oICdmYXN0JyApO1xuXHRcdH0sXG5cdFx0bW91c2VsZWF2ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICk7XG5cdFx0XHQkdGhpcy5maW5kKCAnLnRvZ2dsZS1jaGVja2JveCcgKS5yZW1vdmVQcm9wKCAnZGlzYWJsZWQnICk7XG5cdFx0XHQkdGhpcy5maW5kKCAnLmVkaXQtb3B0aW4nICkucmVtb3ZlUHJvcCggJ2Rpc2FibGVkJyApO1xuXHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3MoICdkaXNhYmxlZCcgKTtcblx0XHRcdCR0aGlzLmZpbmQoICcub3B0aW4tZGVsZXRlLW9wdGluLCAuZWRpdC1vcHRpbiwgLmRlbGV0ZS1vcHRpbi1jb25maXJtYXRpb24nICkuc3RvcCgpLmZhZGVPdXQoICdmYXN0JyApO1xuXHRcdH1cblx0fSwgJy5hY2NvcmRpb24gaGVhZGVyJyApO1xuXG5cdCQoIGRvY3VtZW50ICkub24oe1xuXHRcdG1vdXNlZW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR0aGlzID0gJCggdGhpcyApO1xuXHRcdFx0JHRoaXMuZmluZCggJy5idXR0b24tZWRpdCcgKS5zdG9wKCkuZmFkZUluKCAnZmFzdCcgKTtcblx0XHR9LFxuXHRcdG1vdXNlbGVhdmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR0aGlzID0gJCggdGhpcyApO1xuXHRcdFx0JHRoaXMuZmluZCggJy5idXR0b24tZWRpdCcgKS5zdG9wKCkuZmFkZU91dCggJ2Zhc3QnICk7XG5cdFx0fVxuXHR9LCAnLndwb2ktb3B0aW4tZGV0YWlscyB0cicgKTtcblxuXHQkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCAnLndwb2ktdGFicy1tZW51IGEnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIHRhYiA9ICQoIHRoaXMgKS5hdHRyKCAndGFiJyApO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0T3B0aW4ucm91dGVyLm5hdmlnYXRlKCB0YWIsIHRydWUgKTtcblx0fSk7XG5cblx0JCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5lZGl0LW9wdGluJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSAkKCB0aGlzICkuYXR0ciggJ2hyZWYnICk7XG5cdH0pO1xuXG5cdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcud3BvaS10eXBlLWVkaXQtYnV0dG9uJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBvcHRpbklkID0gJCggdGhpcyApLmRhdGEoICdpZCcgKTtcblx0XHR2YXIgb3B0aW5UeXBlID0gJCggdGhpcyApLmRhdGEoICd0eXBlJyApO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSAnYWRtaW4ucGhwP3BhZ2U9aW5jX29wdGluJm9wdGluPScgKyBvcHRpbklkICsgJyNkaXNwbGF5LycgKyBvcHRpblR5cGU7XG5cdH0pO1xuXG5cdC8qKlxuXHQgKiBNYWtlICdmb3InIGF0dHJpYnV0ZSB3b3JrIG9uIHRhZ3MgdGhhdCBkb24ndCBzdXBwb3J0ICdmb3InIGJ5IGRlZmF1bHRcblx0ICpcblx0ICovXG5cdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcqW2Zvcl0nLCBmdW5jdGlvbiggZSApIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRfZm9yID0gJHRoaXMuYXR0ciggJ2ZvcicgKSxcblx0XHRcdCRmb3IgPSAkKCAnIycgKyBfZm9yICk7XG5cblx0XHRpZiAoICR0aGlzLmlzKCAnbGFiZWwnICkgfHwgISAkZm9yLmxlbmd0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkZm9yLnRyaWdnZXIoICdjaGFuZ2UnICk7XG5cdFx0JGZvci50cmlnZ2VyKCAnY2xpY2snICk7XG5cdH0pO1xuXG5cdCQoICcjd3BvaS1jb21wbGV0ZS1tZXNzYWdlJyApLmZhZGVJbigpO1xuXG5cdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcjd3BvaS1jb21wbGV0ZS1tZXNzYWdlIC5uZXh0LWJ1dHRvbiBidXR0b24nLCBmdW5jdGlvbiggZSApIHtcblx0XHQkKCAnI3dwb2ktY29tcGxldGUtbWVzc2FnZScgKS5mYWRlT3V0KCk7XG5cdH0pO1xuXG5cdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcud3BvaS1saXN0aW5nLXBhZ2UgLndwb2ktbGlzdGluZy13cmFwIGhlYWRlci5jYW4tb3BlbicsIGZ1bmN0aW9uKCBlICkge1xuXHRcdCQoIHRoaXMgKS5maW5kKCAnLm9wZW4nICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHR9KTtcblxuXHQvKipcblx0ICogT24gY2xpY2sgb2YgYXJyb3cgb2YgYW55IG9wdGluIGluIHRoZSBsaXN0aW5nIHBhZ2Vcblx0ICpcblx0ICovXG5cdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcud3BvaS1saXN0aW5nLXBhZ2UgLndwb2ktbGlzdGluZy13cmFwIC5jYW4tb3BlbiAub3BlbicsIGZ1bmN0aW9uKCBlICkge1xuXHRcdHZhciAkdGhpcyA9ICQoIHRoaXMgKSxcblx0XHRcdCRwYW5lbCA9ICR0aGlzLmNsb3Nlc3QoICcud3BvaS1saXN0aW5nLXdyYXAnICksXG5cdFx0XHQkc2VjdGlvbiA9ICRwYW5lbC5maW5kKCAnc2VjdGlvbicgKSxcblx0XHRcdCRvdGhlcnMgPSAkKCAnLndwb2ktbGlzdGluZy13cmFwJyApLm5vdCggJHBhbmVsICksXG5cdFx0XHQkb3RoZXJTZWN0aW9ucyA9ICQoICcud3BvaS1saXN0aW5nLXdyYXAgc2VjdGlvbicgKS5ub3QoICRzZWN0aW9uICk7XG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdCRvdGhlclNlY3Rpb25zLnNsaWRlVXAoIDMwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkb3RoZXJTZWN0aW9ucy5yZW1vdmVDbGFzcyggJ29wZW4nICk7XG5cdFx0fSk7XG5cdFx0JG90aGVycy5maW5kKCAnLmRldi1pY29uJyApLnJlbW92ZUNsYXNzKCAnZGV2LWljb24tY2FyZXRfdXAnICkuYWRkQ2xhc3MoICdkZXYtaWNvbi1jYXJldF9kb3duJyApO1xuXG5cdFx0JHNlY3Rpb24uc2xpZGVUb2dnbGUoIDMwMCwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkcGFuZWwudG9nZ2xlQ2xhc3MoICdvcGVuJyApO1xuXHRcdFx0JHBhbmVsLmZpbmQoICcuZGV2LWljb24nICkudG9nZ2xlQ2xhc3MoICdkZXYtaWNvbi1jYXJldF91cCBkZXYtaWNvbi1jYXJldF9kb3duJyApO1xuXHRcdH0pO1xuXG5cdH0pO1xuXG5cdE9wdGluLmRlY29yYXRlTnVtYmVySW5wdXRzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0dmFyICRpdGVtcyA9ICBlbGVtICYmIGVsZW0uJGVsID8gZWxlbS4kZWwuZmluZCggJy53cGgtaW5wdXQtLW51bWJlciBpbnB1dCcgKSA6ICQoICcud3BoLWlucHV0LS1udW1iZXIgaW5wdXQnICksXG5cdFx0XHR0cGwgPSBIdXN0bGUuY3JlYXRlVGVtcGxhdGUoICc8ZGl2IGNsYXNzPVwid3BoLW5ici0tbmF2XCI+PGRpdiBjbGFzcz1cIndwaC1uYnItLWJ1dHRvbiB3cGgtbmJyLS11cCB7e2Rpc2FibGVkfX1cIj4rPC9kaXY+PGRpdiBjbGFzcz1cIndwaC1uYnItLWJ1dHRvbiB3cGgtbmJyLS1kb3duIHt7ZGlzYWJsZWR9fVwiPi08L2Rpdj48L2Rpdj4nIClcblx0XHQ7XG5cdFx0JGl0ZW1zLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0XHRkaXNhYmxlZENsYXNzID0gJHRoaXMuaXMoICc6ZGlzYWJsZWQnICkgPyAnZGlzYWJsZWQnIDogJyc7XG5cblx0XHRcdC8vIEFkZCArIGFuZCAtIGJ1dHRvbnMgb25seSBpZiBpdCdzIG5vdCBhbHJlYWR5IGFkZGVkXG5cdFx0XHRpZiAoICEgJHRoaXMuc2libGluZ3MoICcud3BoLW5ici0tbmF2JyApLmxlbmd0aCApIHtcblx0XHRcdFx0JHRoaXMuYWZ0ZXIoIHRwbCh7IGRpc2FibGVkOiBkaXNhYmxlZENsYXNzIH0pICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9O1xuXG5cdEh1c3RsZS5FdmVudHMub24oICd2aWV3LnJlbmRlcmVkJywgT3B0aW4uZGVjb3JhdGVOdW1iZXJJbnB1dHMgKTtcblxuXHQvLyBMaXN0ZW4gdG8gbnVtYmVyIGlucHV0ICsgYW5kIC0gY2xpY2sgZXZlbnRzXG5cdCggZnVuY3Rpb24oKSB7XG5cdFx0JCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy53cGgtbmJyLS11cDpub3QoLmRpc2FibGVkKScsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0XHQkd3JhcCA9ICR0aGlzLmNsb3Nlc3QoICcud3BoLWlucHV0LS1udW1iZXInICksXG5cdFx0XHRcdCRpbnB1dCA9ICR3cmFwLmZpbmQoICdpbnB1dCcgKSxcblx0XHRcdFx0b2xkVmFsdWUgPSBwYXJzZUZsb2F0KCAkaW5wdXQudmFsKCkgKSxcblx0XHRcdFx0bWluID0gJGlucHV0LmF0dHIoICdtaW4nICksXG5cdFx0XHRcdG1heCA9ICRpbnB1dC5hdHRyKCAnbWF4JyApLFxuXHRcdFx0XHRuZXdWYWw7XG5cblx0XHRcdGlmICggb2xkVmFsdWUgPj0gbWF4ICkge1xuXHRcdFx0XHRuZXdWYWwgPSBvbGRWYWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5ld1ZhbCA9IG9sZFZhbHVlICsgMTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBuZXdWYWwgIT09IG9sZFZhbHVlICkge1xuXHRcdFx0XHQkaW5wdXQudmFsKCBuZXdWYWwgKS50cmlnZ2VyKCAnY2hhbmdlJyApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy53cGgtbmJyLS1kb3duOm5vdCguZGlzYWJsZWQpJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHRcdCR3cmFwID0gJHRoaXMuY2xvc2VzdCggJy53cGgtaW5wdXQtLW51bWJlcicgKSxcblx0XHRcdFx0JGlucHV0ID0gJHdyYXAuZmluZCggJ2lucHV0JyApLFxuXHRcdFx0XHRvbGRWYWx1ZSA9IHBhcnNlRmxvYXQoICRpbnB1dC52YWwoKSApLFxuXHRcdFx0XHRtaW4gPSAkaW5wdXQuYXR0ciggJ21pbicgKSxcblx0XHRcdFx0bWF4ID0gJGlucHV0LmF0dHIoICdtYXgnICksXG5cdFx0XHRcdG5ld1ZhbDtcblxuXG5cdFx0XHRpZiAoIG9sZFZhbHVlIDw9IG1pbiApIHtcblx0XHRcdFx0bmV3VmFsID0gb2xkVmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuZXdWYWwgPSBvbGRWYWx1ZSAtIDE7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbmV3VmFsICE9PSBvbGRWYWx1ZSApIHtcblx0XHRcdFx0JGlucHV0LnZhbCggbmV3VmFsICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSgpICk7XG5cblx0Ly8gU3RpY2t5IGV5ZSBpY29uXG5cdCggZnVuY3Rpb24oKSB7XG5cdFx0ZnVuY3Rpb24gc3RpY2t5UmVsb2NhdGUoKSB7XG5cdFx0XHR2YXIgd2luZG93VG9wID0gJCggd2luZG93ICkuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgZGl2VG9wID0gJCggJy53cGgtc3RpY2t5LS1hbmNob3InICk7XG5cblx0XHRcdGlmICggISBkaXZUb3AubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGRpdlRvcCA9IGRpdlRvcC5vZmZzZXQoKS50b3A7XG5cdFx0XHRpZiAoIHdpbmRvd1RvcCA+IGRpdlRvcCApIHtcblx0XHRcdFx0JCggJy53cGgtcHJldmlldy0tZXllJyApLmFkZENsYXNzKCAnd3BoLXN0aWNreS0tZWxlbWVudCcgKTtcblx0XHRcdFx0JCggJy53cGgtc3RpY2t5LS1hbmNob3InICkuaGVpZ2h0KCAkKCAnLndwaC1wcmV2aWV3LS1leWUnICkub3V0ZXJIZWlnaHQoKSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCggJy53cGgtcHJldmlldy0tZXllJyApLnJlbW92ZUNsYXNzKCAnd3BoLXN0aWNreS0tZWxlbWVudCcgKTtcblx0XHRcdFx0JCggJy53cGgtc3RpY2t5LS1hbmNob3InICkuaGVpZ2h0KCAwICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCggd2luZG93ICkuc2Nyb2xsKCBzdGlja3lSZWxvY2F0ZSApO1xuXHRcdFx0c3RpY2t5UmVsb2NhdGUoKTtcblx0XHR9KTtcblx0fSgpICk7XG5cbn0oIGpRdWVyeSwgZG9jdW1lbnQgKSApO1xuIiwiSHVzdGxlLmRlZmluZSggJ0ludGVncmF0aW9uX01vZGFsX0hhbmRsZXInLCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuaHVzdGxlLXByb3ZpZGVyLWNvbm5lY3QnOiAnY29ubmVjdEFkZE9uJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXByb3ZpZGVyLWRpc2Nvbm5lY3QnOiAnZGlzY29ubmVjdEFkZE9uJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXByb3ZpZGVyLW5leHQnOiAnc3VibWl0TmV4dFN0ZXAnLFxuXHRcdFx0J2NsaWNrIC5odXN0bGUtcHJvdmlkZXItYmFjayc6ICdnb1ByZXZTdGVwJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXJlZnJlc2gtZW1haWwtbGlzdHMnOiAncmVmcmVzaExpc3RzJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXByb3ZpZGVyLWZvcm0tZGlzY29ubmVjdCc6ICdkaXNjb25uZWN0QWRkT25Gb3JtJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLXByb3ZpZGVyLWNsZWFyLXJhZGlvLW9wdGlvbnMnOiAnY2xlYXJSYWRpb09wdGlvbnMnLFxuXHRcdFx0J2tleXByZXNzIC5zdWktZGlhbG9nLWNvbnRlbnQnOiAncHJldmVudEVudGVyS2V5RnJvbURvaW5nVGhpbmdzJyxcblx0XHRcdCdjaGFuZ2Ugc2VsZWN0I2dyb3VwJzogJ3Nob3dJbnRlcmVzdHMnXG5cdFx0fSxcblxuXHRcdHByZXZlbnRFbnRlcktleUZyb21Eb2luZ1RoaW5ncyggZSApIHtcblx0XHRcdGlmICggMTMgPT09IGUud2hpY2ggKSB7IC8vIHRoZSBlbnRlciBrZXkgY29kZVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0aWYgKCB0aGlzLiQoICcuaHVzdGxlLXByb3ZpZGVyLWNvbm5lY3QnICkubGVuZ3RoICkge1xuXHRcdFx0XHRcdHRoaXMuJCggJy5odXN0bGUtcHJvdmlkZXItY29ubmVjdCcgKS50cmlnZ2VyKCAnY2xpY2snICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggdGhpcy4kKCAnLmh1c3RsZS1wcm92aWRlci1uZXh0JyApLmxlbmd0aCApIHtcblx0XHRcdFx0XHR0aGlzLiQoICcuaHVzdGxlLXByb3ZpZGVyLW5leHQnICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0XHR0aGlzLnNsdWcgICAgICA9IG9wdGlvbnMuc2x1Zztcblx0XHRcdHRoaXMubm9uY2UgICAgID0gb3B0aW9ucy5ub25jZTtcblx0XHRcdHRoaXMuYWN0aW9uICAgID0gb3B0aW9ucy5hY3Rpb247XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHR0aGlzLm1vZHVsZUlkID0gb3B0aW9ucy5tb2R1bGVJZDtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdHRoaXMubXVsdGlfaWQgID0gb3B0aW9ucy5tdWx0aUlkO1xuXHRcdFx0dGhpcy5nbG9iYWxNdWx0aUlkID0gb3B0aW9ucy5nbG9iYWxNdWx0aUlkO1xuXHRcdFx0dGhpcy5zdGVwID0gMDtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdHRoaXMubmV4dF9zdGVwID0gZmFsc2U7XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHR0aGlzLnByZXZfc3RlcCA9IGZhbHNlO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Y29uc3QgZGF0YSA9IHt9O1xuXG5cdFx0XHRkYXRhLmFjdGlvbiA9IHRoaXMuYWN0aW9uO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRcdFx0ZGF0YS5fYWpheF9ub25jZSA9IHRoaXMubm9uY2U7XG5cdFx0XHRkYXRhLmRhdGEgPSB7fTtcblx0XHRcdGRhdGEuZGF0YS5zbHVnID0gdGhpcy5zbHVnO1xuXHRcdFx0ZGF0YS5kYXRhLnN0ZXAgPSB0aGlzLnN0ZXA7XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRkYXRhLmRhdGEuY3VycmVudF9zdGVwID0gdGhpcy5zdGVwO1xuXHRcdFx0aWYgKCB0aGlzLm1vZHVsZUlkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdGRhdGEuZGF0YS5tb2R1bGVfaWQgPSB0aGlzLm1vZHVsZUlkO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLm11bHRpX2lkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdGRhdGEuZGF0YS5tdWx0aV9pZCA9IHRoaXMubXVsdGlfaWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMuZ2xvYmFsTXVsdGlJZCApIHtcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRkYXRhLmRhdGEuZ2xvYmFsX211bHRpX2lkID0gdGhpcy5nbG9iYWxNdWx0aUlkO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnJlcXVlc3QoIGRhdGEsIGZhbHNlLCB0cnVlICk7XG5cdFx0fSxcblxuXHRcdGFwcGx5TG9hZGVyOiBmdW5jdGlvbiggJGVsZW1lbnQgKSB7XG5cdFx0XHQkZWxlbWVudC5maW5kKCAnLnN1aS1idXR0b246bm90KC5kaXNhYmxlLWxvYWRlciknICkuYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHR9LFxuXG5cdFx0cmVzZXRMb2FkZXI6IGZ1bmN0aW9uKCAkZWxlbWVudCApIHtcblx0XHRcdCRlbGVtZW50LmZpbmQoICcuc3VpLWJ1dHRvbicgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdH0sXG5cblx0XHRyZXF1ZXN0OiBmdW5jdGlvbiggZGF0YSwgY2xvc2UsIGxvYWRlciApIHtcblxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRpZiAoIGxvYWRlciApIHtcblx0XHRcdFx0dGhpcy4kZWxcblx0XHRcdFx0XHQuZmluZCggJy5zdWktYm94LWJvZHknIClcblx0XHRcdFx0XHQuYWRkQ2xhc3MoICdzdWktYmxvY2stY29udGVudC1jZW50ZXInIClcblx0XHRcdFx0XHQuaHRtbChcblxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogdHJhbnNsYXRlIFwibG9hZGluZyBjb250ZW50XCIuXG5cdFx0XHRcdFx0XHQnPHAgY2xhc3M9XCJzdWktbG9hZGluZy1kaWFsb2dcIiBhcmlhLWxhYmVsPVwiTG9hZGluZyBjb250ZW50XCI+PGkgY2xhc3M9XCJzdWktaWNvbi1sb2FkZXIgc3VpLWxvYWRpbmdcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9wPidcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtZm9vdGVyJyApLmh0bWwoICcnICk7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoICcuaW50ZWdyYXRpb24taGVhZGVyJyApLmh0bWwoICcnICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYXBwbHlMb2FkZXIoIHRoaXMuJGVsICk7XG5cblx0XHRcdHRoaXMuYWpheCA9ICRcblx0XHRcdC5wb3N0KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdH0pXG5cdFx0XHQuZG9uZSggZnVuY3Rpb24oIHJlc3VsdCApIHtcblx0XHRcdFx0aWYgKCByZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MgKSB7XG5cblx0XHRcdFx0XHQvLyBSZW5kZXIgcG9wdXAgYm9keVxuXHRcdFx0XHRcdHNlbGYucmVuZGVyQm9keSggcmVzdWx0ICk7XG5cblx0XHRcdFx0XHQvLyBSZW5kZXIgcG9wdXAgZm9vdGVyXG5cdFx0XHRcdFx0c2VsZi5yZW5kZXJGb290ZXIoIHJlc3VsdCApO1xuXG5cdFx0XHRcdFx0Ly8gU2hvcnRlbiByZXN1bHQgZGF0YVxuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdERhdGEgPSByZXN1bHQuZGF0YS5kYXRhO1xuXG5cdFx0XHRcdFx0c2VsZi5vblJlbmRlciggcmVzdWx0RGF0YSApO1xuXG5cdFx0XHRcdFx0c2VsZi5yZXNldExvYWRlciggc2VsZi4kZWwgKTtcblxuXHRcdFx0XHRcdC8vIEhhbmRsZSBjbG9zZSBtb2RhbFxuXHRcdFx0XHRcdGlmICggY2xvc2UgfHwgKCAhIF8uaXNVbmRlZmluZWQoIHJlc3VsdERhdGEuaXNfY2xvc2UgKSAmJiByZXN1bHREYXRhLmlzX2Nsb3NlICkgKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmNsb3NlKCBzZWxmICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQWRkIGNsb3NpbmcgZXZlbnRcblx0XHRcdFx0XHRzZWxmLiRlbC5maW5kKCAnLmh1c3RsZS1wcm92aWRlci1jbG9zZScgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmNsb3NlKCBzZWxmICk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvLyBIYW5kbGUgbm90aWZpY2F0aW9uc1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdCEgXy5pc1VuZGVmaW5lZCggcmVzdWx0RGF0YS5ub3RpZmljYXRpb24gKSAmJlxuXHRcdFx0XHRcdFx0ISBfLmlzVW5kZWZpbmVkKCByZXN1bHREYXRhLm5vdGlmaWNhdGlvbi50eXBlICkgJiZcblx0XHRcdFx0XHRcdCEgXy5pc1VuZGVmaW5lZCggcmVzdWx0RGF0YS5ub3RpZmljYXRpb24udGV4dCApXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjdXN0b20gPSBNb2R1bGUuTm90aWZpY2F0aW9uO1xuXHRcdFx0XHRcdFx0Y3VzdG9tLm9wZW4oXG5cdFx0XHRcdFx0XHRcdHJlc3VsdERhdGEubm90aWZpY2F0aW9uLnR5cGUsXG5cdFx0XHRcdFx0XHRcdHJlc3VsdERhdGEubm90aWZpY2F0aW9uLnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gU2hvdyBNYWlsY2hpbXAgaW50ZXJlc3RzIGlzIEdyb3VwIGlzIGFscmVhZHkgY2hvb3NlblxuXHRcdFx0XHRcdGlmICggJ21haWxjaGltcCcgPT09IHNlbGYuc2x1ZyApIHtcblx0XHRcdFx0XHRcdGxldCBncm91cCA9IHNlbGYuJGVsLmZpbmQoICcjZ3JvdXAnICk7XG5cdFx0XHRcdFx0XHRpZiAoIGdyb3VwLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0Z3JvdXAudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFJlbW92ZSB0aGUgcHJlbG9hZGVyXG5cdFx0XHR0aGlzLmFqYXguYWx3YXlzKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi4kZWwuZmluZCggJy5zdWktYm94LWJvZHknICkucmVtb3ZlQ2xhc3MoICdzdWktYmxvY2stY29udGVudC1jZW50ZXInICk7XG5cdFx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLWxvYWRpbmctZGlhbG9nJyApLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdHJlbmRlckJvZHk6IGZ1bmN0aW9uKCByZXN1bHQgKSB7XG5cblx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLWJveC1ib2R5JyApLmh0bWwoIHJlc3VsdC5kYXRhLmRhdGEuaHRtbCApO1xuXG5cdFx0XHQvLyBhcHBlbmQgaGVhZGVyIHRvIGludGVncmF0aW9uLWhlYWRlclxuXHRcdFx0bGV0IGludGVncmF0aW9uSGVhZGVyID0gdGhpcy4kZWwuZmluZCggJy5zdWktYm94LWJvZHkgLmludGVncmF0aW9uLWhlYWRlcicgKS5yZW1vdmUoKTtcblxuXHRcdFx0aWYgKCAwIDwgaW50ZWdyYXRpb25IZWFkZXIubGVuZ3RoICkge1xuXHRcdFx0XHR0aGlzLiRlbC5maW5kKCAnLmludGVncmF0aW9uLWhlYWRlcicgKS5odG1sKCBpbnRlZ3JhdGlvbkhlYWRlci5odG1sKCkgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSGlkZSBlbXB0eSBjb250ZW50XG5cdFx0XHRpZiAoICEgJC50cmltKCB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtYm9keScgKS5odG1sKCkgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLWJveC1ib2R5JyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0dGhpcy4kZWwuZmluZCggJy5zdWktYm94LWZvb3RlcicgKS5jc3MoICdwYWRkaW5nLXRvcCcsICcnICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtYm9keScgKS5jaGlsZHJlbigpO1xuXHRcdFx0XHRsZXQgaGlkZUJvZHkgPSB0cnVlO1xuXG5cdFx0XHRcdCQuZWFjaCggY2hpbGRyZW4sICggaSwgY2hpbGQgKSA9PiB7XG5cblx0XHRcdFx0XHRpZiAoICEgJCggY2hpbGQgKS5pcyggJzpoaWRkZW4nICkgKSB7XG5cdFx0XHRcdFx0XHRoaWRlQm9keSA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gSGlkZSB0aGUgY29udGVudCBvbmx5IHdoZW4gYWxsIGNoaWxkcmVuIGFyZSBoaWRkZW4uXG5cdFx0XHRcdGlmICggaGlkZUJvZHkgKSB7XG5cdFx0XHRcdFx0dGhpcy4kZWwuZmluZCggJy5zdWktYm94LWJvZHknICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLWJveC1mb290ZXInICkuY3NzKCAncGFkZGluZy10b3AnLCAnJyApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBMb2FkIFNVSSBzZWxlY3Rcblx0XHRcdFx0XHR0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtYm9keSBzZWxlY3QnICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRTVUkuc3VpU2VsZWN0KCB0aGlzICk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvLyBGSVg6IFByZXZlbnQgZXh0cmEgc3BhY2luZy5cblx0XHRcdFx0XHRpZiAoIHRoaXMuJGVsLmZpbmQoICcuc3VpLWJveC1ib2R5IC5zdWktbm90aWNlJyApLm5leHQoKS5pcyggJ2lucHV0W3R5cGU9XCJoaWRkZW5cIl0nICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3gtYm9keSAuc3VpLW5vdGljZScgKS5jc3Moe1xuXHRcdFx0XHRcdFx0XHQnbWFyZ2luLWJvdHRvbSc6ICcwJ1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cmVuZGVyRm9vdGVyOiBmdW5jdGlvbiggcmVzdWx0ICkge1xuXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRcdGJ1dHRvbnMgPSByZXN1bHQuZGF0YS5kYXRhLmJ1dHRvbnMsXG5cdFx0XHRcdGJvZHkgPSBzZWxmLiRlbC5maW5kKCAnLnN1aS1ib3gtYm9keScgKSxcblx0XHRcdFx0Zm9vdGVyID0gc2VsZi4kZWwuZmluZCggJy5zdWktYm94LWZvb3RlcicgKVxuXHRcdFx0XHQ7XG5cblx0XHRcdC8vIENsZWFyIGZvb3RlciBmcm9tIHByZXZpb3VzIGJ1dHRvbnNcblx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLWJveC1mb290ZXInIClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuLWltcG9ydGFudCcgKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoICdzdWktYm94LWZvb3Rlci1jZW50ZXInIClcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnc3VpLWJveC1mb290ZXItcmlnaHQnIClcblx0XHRcdFx0Lmh0bWwoICcnIClcblx0XHRcdFx0O1xuXG5cdFx0XHQvLyBBcHBlbmQgYnV0dG9uc1xuXHRcdFx0Xy5lYWNoKCBidXR0b25zLCBmdW5jdGlvbiggYnV0dG9uICkge1xuXG5cdFx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLWJveC1mb290ZXInIClcblx0XHRcdFx0XHQuYXBwZW5kKCBidXR0b24ubWFya3VwIClcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCAwID09PSBmb290ZXIuZmluZCggJy5zdWktYnV0dG9uJyApLmxlbmd0aCApIHtcblx0XHRcdFx0Zm9vdGVyLmFkZENsYXNzKCAnc3VpLWhpZGRlbi1pbXBvcnRhbnQnICk7XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmICggYm9keS5maW5kKCAnLmh1c3RsZS1pbnN0YWxsYXRpb24tZXJyb3InICkubGVuZ3RoICkge1xuXHRcdFx0XHRcdGZvb3Rlci5hZGRDbGFzcyggJ3N1aS1oaWRkZW4taW1wb3J0YW50JyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRklYOiBBbGlnbiBidXR0b25zIHRvIGNlbnRlci5cblx0XHRcdFx0aWYgKCBmb290ZXIuZmluZCggJy5zdWktYnV0dG9uJyApLmhhc0NsYXNzKCAnc3VpLWJ1dHRvbi1jZW50ZXInICkgKSB7XG5cdFx0XHRcdFx0Zm9vdGVyLmFkZENsYXNzKCAnc3VpLWJveC1mb290ZXItY2VudGVyJyApO1xuXG5cdFx0XHRcdC8vIEZJWDogQWxpZ24gYnV0dG9ucyB0byByaWdodC5cblx0XHRcdFx0fSBlbHNlIGlmICggZm9vdGVyLmZpbmQoICcuc3VpLWJ1dHRvbicgKS5oYXNDbGFzcyggJ3N1aS1idXR0b24tcmlnaHQnICkgKSB7XG5cblx0XHRcdFx0XHRpZiAoICEgZm9vdGVyLmZpbmQoICcuc3VpLWJ1dHRvbicgKS5oYXNDbGFzcyggJ3N1aS1idXR0b24tbGVmdCcgKSApIHtcblx0XHRcdFx0XHRcdGZvb3Rlci5hZGRDbGFzcyggJ3N1aS1ib3gtZm9vdGVyLXJpZ2h0JyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvblJlbmRlcjogZnVuY3Rpb24oIHJlc3VsdCApIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0dGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuXG5cdFx0XHQvLyBVcGRhdGUgY3VycmVudCBzdGVwXG5cdFx0XHRpZiAoICEgXy5pc1VuZGVmaW5lZCggcmVzdWx0Lm9wdF9pbl9wcm92aWRlcl9jdXJyZW50X3N0ZXAgKSApIHtcblx0XHRcdFx0dGhpcy5zdGVwID0gK3Jlc3VsdC5vcHRfaW5fcHJvdmlkZXJfY3VycmVudF9zdGVwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBVcGRhdGUgaGFzIG5leHQgc3RlcFxuXHRcdFx0aWYgKCAhIF8uaXNVbmRlZmluZWQoIHJlc3VsdC5vcHRfaW5fcHJvdmlkZXJfaGFzX25leHRfc3RlcCApICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHRoaXMubmV4dF9zdGVwID0gcmVzdWx0Lm9wdF9pbl9wcm92aWRlcl9oYXNfbmV4dF9zdGVwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBVcGRhdGUgaGFzIHByZXYgc3RlcFxuXHRcdFx0aWYgKCAhIF8uaXNVbmRlZmluZWQoIHJlc3VsdC5vcHRfaW5fcHJvdmlkZXJfaGFzX3ByZXZfc3RlcCApICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHRoaXMucHJldl9zdGVwID0gcmVzdWx0Lm9wdF9pbl9wcm92aWRlcl9oYXNfcHJldl9zdGVwO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxmLiRlbC5maW5kKCAnc2VsZWN0JyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRTVUkuc3VpU2VsZWN0KCB0aGlzICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0c2VsZi4kZWwuZmluZCggJy5zdWktc2VsZWN0JyApLlNVSXNlbGVjdDIoe1xuXHRcdFx0XHRkcm9wZG93bkNzc0NsYXNzOiAnc3VpLXNlbGVjdC1kcm9wZG93bidcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRyZWZyZXNoTGlzdHM6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGlkID0gdGhpcy5tb2R1bGVJZCxcblx0XHRcdFx0c2x1ZyA9IHRoaXMuc2x1Zyxcblx0XHRcdFx0dHlwZSA9ICQoICcjZm9ybV9pZCcgKS5sZW5ndGggPyAnZm9ybXMnIDogJ2xpc3RzJyxcblx0XHRcdFx0bm9uY2UgPSB0aGlzLm5vbmNlO1xuXG5cdFx0XHQkdGhpcy5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvbjogJ2h1c3RsZV9yZWZyZXNoX2VtYWlsX2xpc3RzJyxcblx0XHRcdFx0XHRpZDogaWQsXG5cdFx0XHRcdFx0c2x1Zzogc2x1Zyxcblx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdF9hamF4X25vbmNlOiBub25jZSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmRvbmUoIGZ1bmN0aW9uKCByZXN1bHQgKSB7XG5cdFx0XHRcdGlmICggcmVzdWx0LnN1Y2Nlc3MgKSB7XG5cdFx0XHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHJlc3VsdC5kYXRhLnNlbGVjdCApIHtcblx0XHRcdFx0XHRcdGxldCBzZWxlY3QgPSAkdGhpcy5zaWJsaW5ncyggJ3NlbGVjdCcgKTtcblx0XHRcdFx0XHRcdHNlbGVjdC5uZXh0KCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRzZWxlY3QucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHQkdGhpcy5iZWZvcmUoIHJlc3VsdC5kYXRhLnNlbGVjdCApO1xuXHRcdFx0XHRcdFx0JHRoaXMuc2libGluZ3MoICcuc3VpLXNlbGVjdCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0XHRcdFx0ZHJvcGRvd25Dc3NDbGFzczogJ3N1aS1zZWxlY3QtZHJvcGRvd24nXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuZXJyb3IoIGZ1bmN0aW9uKCByZXMgKSB7XG5cblx0XHRcdFx0Ly8gVE9ETzogaGFuZGxlIGVycm9yc1xuXHRcdFx0XHRjb25zb2xlLmxvZyggcmVzICk7XG5cdFx0XHR9KVxuXHRcdFx0LmFsd2F5cyggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR0aGlzLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRzdWJtaXROZXh0U3RlcDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRsZXQgZGF0YSA9IHt9LFxuXHRcdFx0XHRmb3JtID0gdGhpcy4kZWwuZmluZCggJ2Zvcm0nICksXG5cdFx0XHRcdHBhcmFtcyA9IHtcblx0XHRcdFx0XHRzbHVnOiB0aGlzLnNsdWcsXG5cdFx0XHRcdFx0c3RlcDogdGhpcy5nZXRTdGVwKCksXG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRcdFx0XHRcdGN1cnJlbnRfc3RlcDogdGhpcy5zdGVwXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZvcm1EYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcblxuXHRcdFx0aWYgKCB0aGlzLm1vZHVsZUlkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHBhcmFtcy5tb2R1bGVfaWQgPSB0aGlzLm1vZHVsZUlkO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3JtRGF0YSA9IGZvcm1EYXRhICsgJyYnICsgJC5wYXJhbSggcGFyYW1zICk7XG5cdFx0XHRkYXRhLmFjdGlvbiA9IHRoaXMuYWN0aW9uO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRcdFx0ZGF0YS5fYWpheF9ub25jZSA9IHRoaXMubm9uY2U7XG5cdFx0XHRkYXRhLmRhdGEgPSBmb3JtRGF0YTtcblxuXHRcdFx0dGhpcy5yZXF1ZXN0KCBkYXRhLCBmYWxzZSwgZmFsc2UgKTtcblxuXHRcdH0sXG5cblx0XHRnb1ByZXZTdGVwOiBmdW5jdGlvbiggZSApIHtcblx0XHRcdGxldCBkYXRhICAgICA9IHt9LFxuXHRcdFx0XHRwYXJhbXMgICA9IHtcblx0XHRcdFx0XHQnc2x1Zyc6IHRoaXMuc2x1Zyxcblx0XHRcdFx0XHQnc3RlcCc6IHRoaXMuZ2V0UHJldlN0ZXAoKSxcblx0XHRcdFx0XHQnY3VycmVudF9zdGVwJzogdGhpcy5zdGVwXG5cdFx0XHRcdH1cblx0XHRcdDtcblxuXHRcdFx0aWYgKCB0aGlzLm1vZHVsZUlkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHBhcmFtcy5tb2R1bGVfaWQgPSB0aGlzLm1vZHVsZUlkO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLm11bHRpX2lkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHBhcmFtcy5tdWx0aV9pZCA9IHRoaXMubXVsdGlfaWQ7XG5cdFx0XHR9XG5cblx0XHRcdGRhdGEuYWN0aW9uID0gdGhpcy5hY3Rpb247XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRkYXRhLl9hamF4X25vbmNlID0gdGhpcy5ub25jZTtcblx0XHRcdGRhdGEuZGF0YSA9IHBhcmFtcztcblxuXHRcdFx0dGhpcy5yZXF1ZXN0KCBkYXRhLCBmYWxzZSwgZmFsc2UgKTtcblx0XHR9LFxuXG5cdFx0Z2V0U3RlcDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMubmV4dF9zdGVwICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5zdGVwICsgMTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuc3RlcDtcblx0XHR9LFxuXG5cdFx0Z2V0UHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCB0aGlzLnByZXZfc3RlcCApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc3RlcCAtIDE7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLnN0ZXA7XG5cdFx0fSxcblxuXHRcdGNvbm5lY3RBZGRPbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zdCBkYXRhID0ge30sXG5cdFx0XHRcdGZvcm0gPSB0aGlzLiRlbC5maW5kKCAnZm9ybScgKSxcblx0XHRcdFx0cGFyYW1zID0ge1xuXHRcdFx0XHRcdHNsdWc6IHRoaXMuc2x1Zyxcblx0XHRcdFx0XHRzdGVwOiB0aGlzLmdldFN0ZXAoKSxcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdFx0Y3VycmVudF9zdGVwOiB0aGlzLnN0ZXBcblx0XHRcdFx0fTtcblxuXHRcdFx0bGV0IGZvcm1EYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcblxuXHRcdFx0aWYgKCB0aGlzLm1vZHVsZUlkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHBhcmFtcy5tb2R1bGVfaWQgPSB0aGlzLm1vZHVsZUlkO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLm11bHRpX2lkICkge1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRcdHBhcmFtcy5tdWx0aV9pZCA9IHRoaXMubXVsdGlfaWQ7XG5cdFx0XHR9XG5cblx0XHRcdGZvcm1EYXRhID0gZm9ybURhdGEgKyAnJicgKyAkLnBhcmFtKCBwYXJhbXMgKTtcblx0XHRcdGRhdGEuYWN0aW9uID0gdGhpcy5hY3Rpb247XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRkYXRhLl9hamF4X25vbmNlID0gdGhpcy5ub25jZTtcblx0XHRcdGRhdGEuZGF0YSA9IGZvcm1EYXRhO1xuXG5cdFx0XHR0aGlzLnJlcXVlc3QoIGRhdGEsIGZhbHNlLCBmYWxzZSApO1xuXHRcdH0sXG5cblx0XHRkaXNjb25uZWN0QWRkT246IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0dmFyIHNlbGYgID0gdGhpcyxcblx0XHRcdFx0aW1nICAgPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1kaWFsb2ctaW1hZ2UgaW1nJyApLmF0dHIoICdzcmMnICksXG5cdFx0XHRcdHRpdGxlID0gdGhpcy4kZWwuZmluZCggJyNkaWFsb2dUaXRsZTInICkuaHRtbCgpO1xuXHRcdFx0Y29uc3QgZGF0YSA9IHt9LFxuXHRcdFx0aXNBY3RpdmVEYXRhID0ge307XG5cblx0XHRcdHZhciBtb2R1bGVzID0ge30sXG5cdFx0XHR3YXJuaW5nRmxhZyA9ICQoICdodXN0bGUtZGlhbG9nLS1yZW1vdmUtYWN0aXZlLXdhcm5pbmcnICkudmFsKCk7XG5cblx0XHRcdGRhdGEuYWN0aW9uID0gJ2h1c3RsZV9wcm92aWRlcl9kZWFjdGl2YXRlJztcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGRhdGEuX2FqYXhfbm9uY2UgPSB0aGlzLm5vbmNlO1xuXHRcdFx0ZGF0YS5kYXRhID0ge307XG5cdFx0XHRkYXRhLmRhdGEuc2x1ZyA9IHRoaXMuc2x1Zztcblx0XHRcdGRhdGEuZGF0YS5pbWcgID0gaW1nO1xuXHRcdFx0ZGF0YS5kYXRhLnRpdGxlID0gdGl0bGU7XG5cblxuXHRcdFx0aWYgKCB0aGlzLmdsb2JhbE11bHRpSWQgKSB7XG5cdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0ZGF0YS5kYXRhLmdsb2JhbF9tdWx0aV9pZCA9IHRoaXMuZ2xvYmFsTXVsdGlJZDtcblx0XHRcdH1cblxuXHRcdFx0aXNBY3RpdmVEYXRhLmFjdGlvbiA9ICdodXN0bGVfcHJvdmlkZXJfaXNfb25fbW9kdWxlJztcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGlzQWN0aXZlRGF0YS5fYWpheF9ub25jZSA9IHRoaXMubm9uY2U7XG5cdFx0XHRpc0FjdGl2ZURhdGEuZGF0YSA9IHt9O1xuXHRcdFx0aXNBY3RpdmVEYXRhLmRhdGEuc2x1ZyA9IHRoaXMuc2x1Zztcblx0XHRcdGlzQWN0aXZlRGF0YS5kYXRhLmdsb2JhbE11bHRpSWQgPSB0aGlzLmdsb2JhbE11bHRpSWQ7XG5cblx0XHRcdHRoaXMuJGVsLmZpbmQoICcuc3VpLWJ1dHRvbjpub3QoLmRpc2FibGUtbG9hZGVyKScgKS5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YTogaXNBY3RpdmVEYXRhLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzcCApIHtcblx0XHRcdFx0XHRpZiAoIHRydWUgPT09IHJlc3Auc3VjY2VzcyApIHtcblx0XHRcdFx0XHRcdG1vZHVsZXMgPSByZXNwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggdHJ1ZSA9PT0gbW9kdWxlcy5zdWNjZXNzICkge1xuXHRcdFx0XHRcdFx0TW9kdWxlLmludGVncmF0aW9uc0FjdGl2ZVJlbW92ZS5vcGVuKCBtb2R1bGVzLmRhdGEsIGRhdGEsIHNlbGYgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c2VsZi5yZXF1ZXN0KCBkYXRhLCB0cnVlLCBmYWxzZSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0ZGlzY29ubmVjdEFkZE9uRm9ybTogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGNvbnN0IGRhdGEgPSB7fTtcblxuXHRcdFx0bGV0IGFjdGl2ZSBcdFx0IFx0PSAkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbnMtYWN0aXZlLWNvdW50JyApLnZhbCgpLFxuXHRcdFx0YWN0aXZlSW50ZWdyYXRpb24gXHQ9ICQoICcjaHVzdGxlLWludGVncmF0aW9ucy1hY3RpdmUtaW50ZWdyYXRpb25zJyApLnZhbCgpO1xuXHRcdFx0ZGF0YS5hY3Rpb24gXHRcdD0gJ2h1c3RsZV9wcm92aWRlcl9mb3JtX2RlYWN0aXZhdGUnO1xuXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG5cdFx0XHRkYXRhLl9hamF4X25vbmNlID0gdGhpcy5ub25jZTtcblx0XHRcdGRhdGEuZGF0YSA9IHt9O1xuXHRcdFx0ZGF0YS5kYXRhLnNsdWcgPSB0aGlzLnNsdWc7XG5cblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGRhdGEuZGF0YS5tb2R1bGVfaWQgPSB0aGlzLm1vZHVsZUlkO1xuXG5cdFx0XHRpZiAoIHRoaXMubXVsdGlfaWQgKSB7XG5cdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdFx0ZGF0YS5kYXRhLm11bHRpX2lkID0gdGhpcy5tdWx0aV9pZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAxID09IGFjdGl2ZSAmJiBhY3RpdmVJbnRlZ3JhdGlvbiA9PT0gdGhpcy5zbHVnICYmICdsb2NhbF9saXN0JyAhPT0gdGhpcy5zbHVnICkge1xuXHRcdFx0XHRNb2R1bGUuaW50ZWdyYXRpb25zQWxsUmVtb3ZlLm9wZW4oIGRhdGEsIHNlbGYgKTtcblx0XHRcdH0gZWxzZSBpZiAoIDEgPT0gYWN0aXZlICYmICdsb2NhbF9saXN0JyA9PT0gdGhpcy5zbHVnICkge1xuXHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oICdlcnJvcicsIG9wdGluVmFycy5tZXNzYWdlcy5pbnRlZ3JhaXRvbl9yZXF1aXJlZCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yZXF1ZXN0KCBkYXRhLCB0cnVlLCBmYWxzZSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjbG9zZTogZnVuY3Rpb24oIHNlbGYgKSB7XG5cblx0XHRcdC8vIEtpbGwgQUpBWCBoZWFyYmVhdFxuXHRcdFx0c2VsZi5hamF4LmFib3J0KCk7XG5cblx0XHRcdC8vIFJlbW92ZSB0aGUgdmlld1xuXHRcdFx0c2VsZi5yZW1vdmUoKTtcblxuXHRcdFx0Ly8gUmVzZXQgYm9keSBzY3JvbGxiYXJcblx0XHRcdCQoICdib2R5JyApLmNzcyggJ292ZXJmbG93JywgJ2F1dG8nICk7XG5cblx0XHRcdC8vIFJlZnJlc3QgYWRkLW9uIGxpc3Rcblx0XHRcdEh1c3RsZS5FdmVudHMudHJpZ2dlciggJ2h1c3RsZTpwcm92aWRlcnM6cmVsb2FkJyApO1xuXHRcdH0sXG5cblx0XHRjbGVhclJhZGlvT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiQoICdpbnB1dFt0eXBlPXJhZGlvXScsIHRoaXMuJGVsICkucmVtb3ZlQXR0ciggJ2NoZWNrZWQnICk7XG5cdFx0fSxcblxuXHRcdC8vc2hvdyBpbnRlcmVzdHMgZm9yIG1haWxjaGltcFxuXHRcdHNob3dJbnRlcmVzdHM6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRub25jZSA9ICR0aGlzLmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0Z3JvdXAgPSAkdGhpcy52YWwoKSxcblx0XHRcdFx0ZGF0YSA9IHt9LFxuXHRcdFx0XHRmb3JtID0gc2VsZi4kZWwuZmluZCggJ2Zvcm0nICksXG5cdFx0XHRcdHBhcmFtcyA9IHtcblx0XHRcdFx0XHRzbHVnOiBzZWxmLnNsdWcsXG5cdFx0XHRcdFx0Z3JvdXA6IGdyb3VwLFxuXHRcdFx0XHRcdCdtb2R1bGVfaWQnOiBzZWxmLm1vZHVsZUlkXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZvcm1EYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcblxuXHRcdFx0Zm9ybURhdGEgPSBmb3JtRGF0YSArICcmJyArICQucGFyYW0oIHBhcmFtcyApO1xuXHRcdFx0ZGF0YS5hY3Rpb24gPSAnaHVzdGxlX21haWxjaGltcF9nZXRfZ3JvdXBfaW50ZXJlc3RzJztcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGRhdGEuX2FqYXhfbm9uY2UgPSBub25jZTtcblx0XHRcdGRhdGEuZGF0YSA9IGZvcm1EYXRhO1xuXG5cdFx0XHRzZWxmLmFwcGx5TG9hZGVyKCBzZWxmLiRlbCApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKCBmdW5jdGlvbiggcmVzdWx0ICkge1xuXHRcdFx0XHRpZiAoIHJlc3VsdC5zdWNjZXNzICkge1xuXHRcdFx0XHRcdGZvcm0uZmluZCggJy5zdWktZm9ybS1maWVsZCcgKS5zbGljZSggMSApLnJlbW92ZSgpO1xuXHRcdFx0XHRcdGZvcm0uZmluZCggJy5zdWktZm9ybS1maWVsZDpmaXJzdC1jaGlsZCcgKS5hZnRlciggcmVzdWx0LmRhdGEgKTtcblxuXHRcdFx0XHRcdHNlbGYuJGVsLmZpbmQoICcuc3VpLXNlbGVjdCcgKS5TVUlzZWxlY3QyKHtcblx0XHRcdFx0XHRcdGRyb3Bkb3duQ3NzQ2xhc3M6ICdzdWktc2VsZWN0LWRyb3Bkb3duJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmVycm9yKCBmdW5jdGlvbiggcmVzICkge1xuXG5cdFx0XHRcdC8vIFRPRE86IGhhbmRsZSBlcnJvcnNcblx0XHRcdFx0Y29uc29sZS5sb2coIHJlcyApO1xuXHRcdFx0fSlcblx0XHRcdC5hbHdheXMoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLnJlc2V0TG9hZGVyKCBzZWxmLiRlbCApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdH0pO1xuXG59KTtcbiIsInZhciBNb2R1bGUgPSB3aW5kb3cuTW9kdWxlIHx8IHt9O1xuXG5IdXN0bGUuZGVmaW5lKCAnTW9kZWwnLCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHJldHVybiBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm9uKCAnY2hhbmdlJywgdGhpcy51c2VySGFzQ2hhbmdlLCB0aGlzICk7XG5cdFx0XHRCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fSxcblxuXHRcdHVzZXJIYXNDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRNb2R1bGUuaGFzQ2hhbmdlcyA9IHRydWU7XG5cblx0XHRcdC8vIEFkZCB0aGUgXCJ1bnNhdmVkXCIgc3RhdHVzIHRhZyB0byB0aGUgbW9kdWxlIHNjcmVlbi5cblx0XHRcdEh1c3RsZS5FdmVudHMudHJpZ2dlciggJ21vZHVsZXMudmlldy5zd2l0Y2hfc3RhdHVzJywgJ3Vuc2F2ZWQnICk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5IdXN0bGUuZGVmaW5lKCAnTW9kZWxzLk0nLCBmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXHRyZXR1cm4gSHVzdGxlLmdldCggJ01vZGVsJyApLmV4dGVuZCh7XG5cdFx0XHR0b0pTT046IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIganNvbiA9IF8uY2xvbmUoIHRoaXMuYXR0cmlidXRlcyApO1xuICAgICAgICAgICAgICAgIHZhciBhdHRyO1xuXHRcdFx0XHRmb3IgKCBhdHRyIGluIGpzb24gKSB7XG5cdFx0XHRcdFx0aWYgKCAoIGpzb25bIGF0dHIgXSBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsICkgfHwgKCBqc29uWyBhdHRyIF0gaW5zdGFuY2VvZiBCYWNrYm9uZS5Db2xsZWN0aW9uICkgKSB7XG5cdFx0XHRcdFx0XHRqc29uWyBhdHRyIF0gPSBqc29uWyBhdHRyIF0udG9KU09OKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBqc29uO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24oIGtleSwgdmFsLCBvcHRpb25zICkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQsIGNoaWxkLCBwYXJlbnRNb2RlbDtcblxuXHRcdFx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2Yga2V5ICYmIC0xICE9PSBrZXkuaW5kZXhPZiggJy4nICkgKSB7XG5cdFx0XHRcdFx0cGFyZW50ID0ga2V5LnNwbGl0KCAnLicgKVsgMCBdO1xuXHRcdFx0XHRcdGNoaWxkID0ga2V5LnNwbGl0KCAnLicgKVsgMSBdO1xuXHRcdFx0XHRcdHBhcmVudE1vZGVsID0gdGhpcy5nZXQoIHBhcmVudCApO1xuXG5cdFx0XHRcdFx0aWYgKCBwYXJlbnRNb2RlbCAmJiBwYXJlbnRNb2RlbCBpbnN0YW5jZW9mIEJhY2tib25lLk1vZGVsICkge1xuXHRcdFx0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCBjaGlsZCwgdmFsLCBvcHRpb25zICk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoICdjaGFuZ2U6JyArIGtleSwga2V5LCB2YWwsIG9wdGlvbnMgKTtcblx0XHRcdFx0XHRcdHRoaXMudHJpZ2dlciggJ2NoYW5nZTonICsgcGFyZW50LCBrZXksIHZhbCwgb3B0aW9ucyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zZXQuY2FsbCggdGhpcywga2V5LCB2YWwsIG9wdGlvbnMgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24oIGtleSApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50LCBjaGlsZDtcblx0XHRcdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGtleSAmJiAtMSAhPT0ga2V5LmluZGV4T2YoICcuJyApICkge1xuXHRcdFx0XHRcdHBhcmVudCA9IGtleS5zcGxpdCggJy4nIClbIDAgXTtcblx0XHRcdFx0XHRjaGlsZCA9IGtleS5zcGxpdCggJy4nIClbIDEgXTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXQoIHBhcmVudCApLmdldCggY2hpbGQgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldC5jYWxsKCB0aGlzLCBrZXkgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xufSk7XG5cbkh1c3RsZS5kZWZpbmUoICdNb2RlbHMuVHJpZ2dlcicsIGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cdHJldHVybiAgSHVzdGxlLmdldCggJ01vZGVsJyApLmV4dGVuZCh7XG5cdFx0ZGVmYXVsdHM6IHtcblx0XHRcdHRyaWdnZXI6ICd0aW1lJywgLy8gdGltZSB8IHNjcm9sbCB8IGNsaWNrIHwgZXhpdF9pbnRlbnQgfCBhZGJsb2NrXG5cdFx0XHQnb25fdGltZV9kZWxheSc6IDAsXG5cdFx0XHQnb25fdGltZV91bml0JzogJ3NlY29uZHMnLFxuXHRcdFx0J29uX3Njcm9sbCc6ICdzY3JvbGxlZCcsIC8vIHNjcm9sbGVkIHwgc2VsZWN0b3Jcblx0XHRcdCdvbl9zY3JvbGxfcGFnZV9wZXJjZW50JzogJzIwJyxcblx0XHRcdCdvbl9zY3JvbGxfY3NzX3NlbGVjdG9yJzogJycsXG5cdFx0XHQnZW5hYmxlX29uX2NsaWNrX2VsZW1lbnQnOiAnMScsXG5cdFx0XHQnb25fY2xpY2tfZWxlbWVudCc6ICcnLFxuXHRcdFx0J2VuYWJsZV9vbl9jbGlja19zaG9ydGNvZGUnOiAnMScsXG5cdFx0XHQnb25fZXhpdF9pbnRlbnQnOiAnMScsXG5cdFx0XHQnb25fZXhpdF9pbnRlbnRfcGVyX3Nlc3Npb24nOiAnMScsXG5cdFx0XHQnb25fZXhpdF9pbnRlbnRfZGVsYXllZCc6ICcwJyxcblx0XHRcdCdvbl9leGl0X2ludGVudF9kZWxheWVkX3RpbWUnOiA1LFxuXHRcdFx0J29uX2V4aXRfaW50ZW50X2RlbGF5ZWRfdW5pdCc6ICdzZWNvbmRzJyxcblx0XHRcdCdvbl9hZGJsb2NrJzogJzAnXG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5Nb2R1bGUuTW9kZWwgID0gSHVzdGxlLmdldCggJ01vZGVscy5NJyApLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0J21vZHVsZV9uYW1lJzogJycsXG5cdFx0bW9kdWxlVHlwZTogJ3BvcHVwJyxcblx0XHRhY3RpdmU6ICcwJ1xuXHR9XG59KTtcbiIsIiggZnVuY3Rpb24oICQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNb2R1bGUgPSB3aW5kb3cuTW9kdWxlIHx8IHt9O1xuXG5cdC8qKlxuXHQgKiBSZW5kZXIgYSBub3RpZmljYXRpb24gYXQgdGhlIHRvcCBvZiB0aGUgcGFnZS5cblx0ICogVXNlZCBpbiB0aGUgZ2xvYmFsIHNldHRpbmdzIHBhZ2Ugd2hlbiBzYXZpbmcsIGZvciBleGFtcGxlLlxuXHQgKiBAc2luY2UgNC4wXG5cdCAqL1xuXHRNb2R1bGUuTm90aWZpY2F0aW9uID0ge1xuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmICggISAkKCAnI2h1c3RsZS1ub3RpZmljYXRpb24nICkubGVuZ3RoICkge1xuXG5cdFx0XHRcdCQoICc8ZGl2IHJvbGU9XCJhbGVydFwiIGlkPVwiaHVzdGxlLW5vdGlmaWNhdGlvblwiIGNsYXNzPVwic3VpLW5vdGljZS10b3Agc3VpLW5vdGljZS0nICsgdGhpcy50eXBlICsgJyBzdWktY2FuLWRpc21pc3NcIj4nICtcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cInN1aS1ub3RpY2UtY29udGVudFwiPicgK1xuXHRcdFx0XHRcdFx0JzxwPicgKyB0aGlzLnRleHQgKyAnPC9wPicgK1xuXHRcdFx0XHRcdCc8L2Rpdj4nICtcblx0XHRcdFx0XHQnPHNwYW4gY2xhc3M9XCJzdWktbm90aWNlLWRpc21pc3NcIiBhcmlhLWhpZGRlbj1cInRydWVcIj4nICtcblx0XHRcdFx0XHRcdCc8YSByb2xlPVwiYnV0dG9uXCIgaHJlZj1cIiNcIiBhcmlhLWxhYmVsPVwiJyArIG9wdGluVmFycy5tZXNzYWdlcy5jb21tb25zLmRpc21pc3MgKyAnXCIgY2xhc3M9XCJzdWktaWNvbi1jaGVja1wiPjwvYT4nICtcblx0XHRcdFx0XHQnPC9zcGFuPicgK1xuXHRcdFx0XHQnPC9kaXY+JyApXG5cdFx0XHRcdC5yZW1vdmVBdHRyKCAnaGlkZGVuJyApXG5cdFx0XHRcdC5hcHBlbmRUbyggJCggJ21haW4uc3VpLXdyYXAnICkgKVxuXHRcdFx0XHQuc2xpZGVEb3duKClcblx0XHRcdFx0O1xuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiAhISEgVE8gSU1QUk9WRTpcblx0XHRcdFx0ICpcblx0XHRcdFx0ICogVW5jb21tZW50IGNvZGUgYmVsb3cgYW5kIHJlcGxhY2UgTU9EVUxFX0lEIHdpdGhcblx0XHRcdFx0ICogaW1wb3J0ZWQgbW9kdWxlIElEIHRvIGZvY3VzIGl0LlxuXHRcdFx0XHQgKlxuXHRcdFx0XHQgKiBXZSBhbHNvIG5lZWQgdG8gcnVuIHRoaXMgb24gd2luZG93IGxvYWQuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQvLyAkKCAnLnN1aS1hY2NvcmRpb24taXRlbS1oZWFkZXJbZGF0YS1pZD1cIicgKyBNT0RVTEVfSUQgKyAnXCJdJyApLmNsb3Nlc3QoICcuc3VpLWFjY29yZGlvbi1pdGVtJyApLmZvY3VzKCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoICcjaHVzdGxlLW5vdGlmaWNhdGlvbicgKS5yZW1vdmUoKTtcblx0XHRcdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9wZW46IGZ1bmN0aW9uKCB0eXBlLCB0ZXh0LCBjbG9zZVRpbWUgKSB7XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCBjbG9zZVRpbWUgKSApIHtcblx0XHRcdFx0Y2xvc2VUaW1lID0gNDAwMDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mICggc2VsZi5jbG9zZVRpbWVvdXQgKSApIHtcblx0XHRcdFx0d2luZG93LmNsZWFyVGltZW91dCggc2VsZi5jbG9zZVRpbWVvdXQgKTtcblx0XHRcdFx0ZGVsZXRlIHNlbGYuY2xvc2VUaW1lb3V0O1xuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudHlwZSA9IHR5cGUgfHwgJ25vdGljZSc7XG5cdFx0XHR0aGlzLnRleHQgPSB0ZXh0O1xuXG5cdFx0XHR0aGlzLmluaXRpYWxpemUoKTtcblxuXHRcdFx0Y29uc3QgJHBvcHVwID0gJCggJyNodXN0bGUtbm90aWZpY2F0aW9uJyApO1xuXG5cdFx0XHQkcG9wdXAucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0JHBvcHVwLnJlbW92ZVByb3AoICdoaWRkZW4nICk7XG5cblx0XHRcdCQoICcuc3VpLW5vdGljZS1kaXNtaXNzIGEnICkuY2xpY2soIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIGNsb3NlVGltZSApIHtcblxuXHRcdFx0XHR0aGlzLmNsb3NlVGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNlbGYuY2xvc2UoKTtcblx0XHRcdFx0fSwgY2xvc2VUaW1lICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyICRwb3B1cCA9ICQoICcjaHVzdGxlLW5vdGlmaWNhdGlvbicgKTtcblxuXHRcdFx0JHBvcHVwLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdCRwb3B1cC5wcm9wKCAnaGlkZGVuJywgdHJ1ZSApO1xuXHRcdFx0JHBvcHVwLnN0b3AoKS5zbGlkZVVwKCAnc2xvdycgKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlbmRlciB0aGUgbW9kYWwgdXNlZCBmb3IgZWRpdGluZyB0aGUgaXRuZWdyYXRpb25zJyBzZXR0aW5ncy5cblx0ICogQHNpbmNlIDQuMFxuXHQgKi9cblx0TW9kdWxlLmludGVncmF0aW9uc01vZGFsID0ge1xuXG5cdFx0JHBvcHVwOiB7fSxcblxuXHRcdF9kZWZlcnJlZDoge30sXG5cblx0XHRvcGVuKCBlICkge1xuXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgJHRhcmdldCA9ICQoIGUudGFyZ2V0ICk7XG5cblx0XHRcdC8vIFJlbW92ZSBwb3B1cFxuXHRcdFx0JCggJyNodXN0bGUtaW50ZWdyYXRpb24tcG9wdXAnICkucmVtb3ZlKCk7XG5cblx0XHRcdGlmICggISAkdGFyZ2V0Lmhhc0NsYXNzKCAnY29ubmVjdC1pbnRlZ3JhdGlvbicgKSApIHtcblx0XHRcdFx0JHRhcmdldCA9ICR0YXJnZXQuY2xvc2VzdCggJy5jb25uZWN0LWludGVncmF0aW9uJyApO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgY2xvc2VDbGljayA9ICgpID0+IHtcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9O1xuXG5cdFx0XHRsZXQgbm9uY2UgPSAkdGFyZ2V0LmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0c2x1ZyA9ICR0YXJnZXQuZGF0YSggJ3NsdWcnICksXG5cdFx0XHRcdHRpdGxlID0gICR0YXJnZXQuZGF0YSggJ3RpdGxlJyApLFxuXHRcdFx0XHRpbWFnZSA9ICR0YXJnZXQuZGF0YSggJ2ltYWdlJyApLFxuXHRcdFx0XHRhY3Rpb24gPSAkdGFyZ2V0LmRhdGEoICdhY3Rpb24nICksXG5cdFx0XHRcdG1vZHVsZUlkID0gJHRhcmdldC5kYXRhKCAnbW9kdWxlX2lkJyApLFxuXHRcdFx0XHRtdWx0aUlkID0gJHRhcmdldC5kYXRhKCAnbXVsdGlfaWQnICksXG5cdFx0XHRcdGdsb2JhbE11bHRpSWQgPSAkdGFyZ2V0LmRhdGEoICdnbG9iYWxfbXVsdGlfaWQnIClcblx0XHRcdFx0O1xuXG5cdFx0XHRsZXQgdHBsID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtaW50ZWdyYXRpb24tZGlhbG9nLXRwbCcgKTtcblxuXHRcdFx0JCggJ21haW4uc3VpLXdyYXAnICkuYXBwZW5kKCB0cGwoe1xuXHRcdFx0XHRpbWFnZTogaW1hZ2UsXG5cdFx0XHRcdHRpdGxlOiB0aXRsZVxuXHRcdFx0fSkgKTtcblxuXHRcdFx0dGhpcy4kcG9wdXAgPSAkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1kaWFsb2cnICk7XG5cblx0XHRcdGxldCBzZXR0aW5nc1ZpZXcgPSBIdXN0bGUuZ2V0KCAnSW50ZWdyYXRpb25fTW9kYWxfSGFuZGxlcicgKSxcblx0XHRcdFx0dmlldyA9IG5ldyBzZXR0aW5nc1ZpZXcoe1xuXHRcdFx0XHRzbHVnOiBzbHVnLFxuXHRcdFx0XHRub25jZTogbm9uY2UsXG5cdFx0XHRcdGFjdGlvbjogYWN0aW9uLFxuXHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG5cdFx0XHRcdG11bHRpSWQ6IG11bHRpSWQsXG5cdFx0XHRcdGdsb2JhbE11bHRpSWQsXG5cdFx0XHRcdGVsOiB0aGlzLiRwb3B1cFxuXHRcdFx0fSk7XG5cblx0XHRcdHZpZXcub24oICdtb2RhbDpjbG9zZWQnLCAoKSA9PiBzZWxmLmNsb3NlKCkgKTtcblxuXHRcdFx0dGhpcy4kcG9wdXAuZmluZCggJy5odXN0bGUtcG9wdXAtYWN0aW9uJyApLnJlbW92ZSgpO1xuXG5cdFx0XHQvLyBBZGQgY2xvc2luZyBldmVudFxuXHRcdFx0dGhpcy4kcG9wdXAuZmluZCggJy5zdWktZGlhbG9nLWNsb3NlJyApLm9uKCAnY2xpY2snLCBjbG9zZUNsaWNrICk7XG5cdFx0XHR0aGlzLiRwb3B1cC5maW5kKCAnLnN1aS1kaWFsb2ctb3ZlcmxheScgKS5vbiggJ2NsaWNrJywgY2xvc2VDbGljayApO1xuXHRcdFx0dGhpcy4kcG9wdXAub24oICdjbGljaycsICcuaHVzdGxlLXBvcHVwLWNhbmNlbCcsIGNsb3NlQ2xpY2sgKTtcblx0XHRcdHRoaXMuJHBvcHVwLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnBhcmVudCggJyNodXN0bGUtaW50ZWdyYXRpb24tZGlhbG9nJyApLmZpbmQoICcuc3VpLWRpYWxvZy1jbG9zZScgKS50cmlnZ2VyKCAnY2xpY2snICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gT3BlblxuXHRcdFx0dGhpcy4kcG9wdXAuZmluZCggJy5zdWktZGlhbG9nLW92ZXJsYXknICkucmVtb3ZlQ2xhc3MoICdzdWktZmFkZS1vdXQnICkuYWRkQ2xhc3MoICdzdWktZmFkZS1pbicgKTtcblx0XHRcdHRoaXMuJHBvcHVwLmZpbmQoICcuc3VpLWRpYWxvZy1jb250ZW50JyApLnJlbW92ZUNsYXNzKCAnc3VpLWJvdW5jZS1vdXQnICkuYWRkQ2xhc3MoICdzdWktYm91bmNlLWluJyApO1xuXG5cdFx0XHR0aGlzLiRwb3B1cC5yZW1vdmVBdHRyKCAnYXJpYS1oaWRkZW4nICk7XG5cblx0XHRcdC8vIGhpZGUgYm9keSBzY3JvbGxiYXJcblx0XHRcdCQoICdib2R5JyApLmNzcyggJ292ZXJmbG93JywgJ2hpZGRlbicgKTtcblxuXHRcdFx0dGhpcy5fZGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXG5cdFx0XHQvLyBNYWtlIHN1aS10YWJzIGNoYW5nZWFibGVcblx0XHRcdHRoaXMuJHBvcHVwLm9uKCAnY2xpY2snLCAnLnN1aS10YWItaXRlbScsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRsZXQgJHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0XHQkaXRlbXMgPSAkdGhpcy5jbG9zZXN0KCAnLnN1aS1zaWRlLXRhYnMnICkuZmluZCggJy5zdWktdGFiLWl0ZW0nICk7XG5cblx0XHRcdFx0JGl0ZW1zLnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApO1xuXHRcdFx0XHQkdGhpcy5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5fZGVmZXJyZWQucHJvbWlzZSgpO1xuXG5cdFx0fSxcblxuXHRcdGNsb3NlKCByZXN1bHQgKSB7XG5cblx0XHRcdHZhciAkcG9wdXAgPSAkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1wb3B1cCcgKTtcblxuXHRcdFx0JHBvcHVwLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnc3VpLWZhZGUtaW4nICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICk7XG5cdFx0XHQkcG9wdXAuZmluZCggJy5zdWktZGlhbG9nLWNvbnRlbnQnICkucmVtb3ZlQ2xhc3MoICdzdWktYm91bmNlLWluJyApLmFkZENsYXNzKCAnc3VpLWJvdW5jZS1vdXQnICk7XG5cblx0XHRcdC8vIHJlc2V0IGJvZHkgc2Nyb2xsYmFyXG5cdFx0XHQkKCAnYm9keScgKS5jc3MoICdvdmVyZmxvdycsICdhdXRvJyApO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHBvcHVwLmF0dHIoICdhcmlhLWhpZGRlbicsICd0cnVlJyApO1xuXHRcdFx0fSwgMzAwICk7XG5cblx0XHRcdHRoaXMuX2RlZmVycmVkLnJlc29sdmUoIHRoaXMuJHBvcHVwLCByZXN1bHQgKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlbmRlciB0aGUgbW9kYWwgdXNlZCB3aGVuIHJlbW92aW5nIHRoZSBvbmx5IGxlZnQgaW50ZWdyYXRpb24uXG5cdCAqIEBzaW5jZSA0LjAuMVxuXHQgKi9cblx0TW9kdWxlLmludGVncmF0aW9uc0FsbFJlbW92ZSA9IHtcblxuXHRcdCRwb3B1cDoge30sXG5cblx0XHRfZGVmZXJyZWQ6IHt9LFxuXG5cdFx0LyoqXG5cdFx0ICogQHNpbmNlIDQuMC4yXG5cdFx0ICogQHBhcmFtIE1vZHVsZUlEXG5cdFx0ICovXG5cdFx0b3BlbiggZGF0YSwgcmVmZXJyZXIgKSB7XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0bGV0IGRpYWxvZ0lkID0gJCggJyNodXN0bGUtZGlhbG9nLS1maW5hbC1kZWxldGUnICk7XG5cblx0XHRcdGxldCBjbG9zZUNsaWNrID0gKCkgPT4ge1xuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cblx0XHRcdGxldCBpbnNlcnRMb2NhbCA9ICggZGF0YSApID0+IHtcblx0XHRcdFx0c2VsZi5pbnNlcnRMb2NhbExpc3QoIGRhdGEgKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblxuXHRcdFx0bGV0IGRlbGV0ZUludCA9ICggZGF0YSwgcmVmZXJyZXIgKSA9PiB7XG5cdFx0XHRcdHNlbGYuZGVsZXRlSW50ZWdyYXRpb24oIGRhdGEsIHJlZmVycmVyICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cblx0XHRcdC8vIEFkZCBjbG9zaW5nIGV2ZW50XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnLnN1aS1kaWFsb2ctY2xvc2UnICkub24oICdjbGljaycsIGNsb3NlQ2xpY2sgKTtcblx0XHRcdGRpYWxvZ0lkLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLm9uKCAnY2xpY2snLCBjbG9zZUNsaWNrICk7XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnI2h1c3RsZS1kZWxldGUtZmluYWwtYnV0dG9uLWNhbmNlbCcgKS5vbiggJ2NsaWNrJywgY2xvc2VDbGljayApO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1kZWxldGUtZmluYWwtYnV0dG9uJyApLm9mZiggJ2NsaWNrJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdFx0JCggJyNodXN0bGUtZGVsZXRlLWZpbmFsLWJ1dHRvbicgKS5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0XHRkZWxldGVJbnQoIGRhdGEsIHJlZmVycmVyICk7XG5cdFx0XHRcdGluc2VydExvY2FsKCBkYXRhICk7XG5cdFx0XHRcdGNsb3NlQ2xpY2soKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1kaWFsb2cnICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICkuaGlkZSgpO1xuXHRcdFx0JCggJyNodXN0bGUtZGVsZXRlLWZpbmFsLWJ1dHRvbicgKS5yZW1vdmVBdHRyKCAnZGlzYWJsZWQnICk7XG5cblx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tZmluYWwtZGVsZXRlJyBdLnNob3coKTtcblx0XHR9LFxuXG5cdFx0Y2xvc2UoKSB7XG5cblx0XHRcdHZhciAkcG9wdXAgPSAkKCAnI2h1c3RsZS1kaWFsb2ctLWZpbmFsLWRlbGV0ZScgKTtcblxuXHRcdFx0JHBvcHVwLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnc3VpLWZhZGUtaW4nICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICk7XG5cdFx0XHQkcG9wdXAuZmluZCggJy5zdWktZGlhbG9nLWNvbnRlbnQnICkucmVtb3ZlQ2xhc3MoICdzdWktYm91bmNlLWluJyApLmFkZENsYXNzKCAnc3VpLWJvdW5jZS1vdXQnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1kZWxldGUtZmluYWwtYnV0dG9uJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1kaWFsb2cnICkucmVtb3ZlKCk7XG5cblx0XHRcdC8vIHJlc2V0IGJvZHkgc2Nyb2xsYmFyXG5cdFx0XHQkKCAnYm9keScgKS5jc3MoICdvdmVyZmxvdycsICdhdXRvJyApO1xuXHRcdFx0JCggJyNodXN0bGUtZGVsZXRlLWZpbmFsLWJ1dHRvbicgKS5hdHRyKCAnZGlzYWJsZWQnICk7XG5cblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkcG9wdXAuYXR0ciggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG5cdFx0XHR9LCAzMDAgKTtcblxuXHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1maW5hbC1kZWxldGUnIF0uaGlkZSgpO1xuXHRcdH0sXG5cblx0XHRjb25maXJtRGVsZXRlKCBkYXRhLCByZWZlcnJlciApIHtcblx0XHRcdHRoaXMuZGVsZXRlSW50ZWdyYXRpb24oIGRhdGEsIHJlZmVycmVyICk7XG5cdFx0XHR0aGlzLmluc2VydExvY2FsKCBkYXRhICk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSxcblx0XHRkZWxldGVJbnRlZ3JhdGlvbiggZGF0YSwgcmVmZXJyZXIgKSB7XG5cdFx0XHRyZWZlcnJlci5yZXF1ZXN0KCBkYXRhLCB0cnVlLCBmYWxzZSApO1xuXHRcdH0sXG5cblx0XHRpbnNlcnRMb2NhbExpc3QoIGRhdGEgKSB7XG5cdFx0XHRsZXQgYWpheERhdGEgPSB7XG5cdFx0XHRcdGlkOiBkYXRhLmRhdGEubW9kdWxlX2lkLFxuXHRcdFx0XHQnX2FqYXhfbm9uY2UnOiBkYXRhLl9hamF4X25vbmNlLFxuXHRcdFx0XHRhY3Rpb246ICdodXN0bGVfcHJvdmlkZXJfaW5zZXJ0X2xvY2FsX2xpc3QnXG5cdFx0XHR9O1xuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGE6IGFqYXhEYXRhLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzcCApIHtcblx0XHRcdFx0XHRpZiAoIHJlc3Auc3VjY2VzcyApIHtcblx0XHRcdFx0XHRcdEh1c3RsZS5FdmVudHMudHJpZ2dlciggJ2h1c3RsZTpwcm92aWRlcnM6cmVsb2FkJyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoICd1bmRlZmluZWQnID09PSB0eXBlb2YgU1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1maW5hbC1kZWxldGUnIF0pIHtcblx0XHRcdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnZXJyb3InLCBvcHRpblZhcnMubWVzc2FnZXMuc29tZXRoaW5nX3dlbnRfd3JvbmcgKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1maW5hbC1kZWxldGUnIF0uaGlkZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgb3B0aW5WYXJzLm1lc3NhZ2VzLnNvbWV0aGluZ193ZW50X3dyb25nICk7XG5cdFx0XHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1maW5hbC1kZWxldGUnIF0uaGlkZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlbmRlciB0aGUgbW9kYWwgdXNlZCB3aGVuIHJlbW92aW5nIHRoZSBvbmx5IGxlZnQgaW50ZWdyYXRpb24uXG5cdCAqIEBzaW5jZSA0LjAuMVxuXHQgKi9cblx0TW9kdWxlLmludGVncmF0aW9uc0FjdGl2ZVJlbW92ZSA9IHtcblxuXHRcdCRwb3B1cDoge30sXG5cblx0XHRfZGVmZXJyZWQ6IHt9LFxuXG5cdFx0LyoqXG5cdFx0ICogQHNpbmNlIDQuMC4yXG5cdFx0ICogQHBhcmFtIE1vZHVsZUlEXG5cdFx0ICovXG5cdFx0b3BlbiggZGF0YSwgZGlzY29ubmVjdCwgcmVmZXJyZXIgKSB7XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0bGV0IGRpYWxvZ0lkID0gJCggJyNodXN0bGUtZGlhbG9nLS1yZW1vdmUtYWN0aXZlJyApO1xuXG5cdFx0XHRsZXQgY2xvc2VDbGljayA9ICgpID0+IHtcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9O1xuXG5cdFx0XHRsZXQgZ29CYWNrID0gKCkgPT4ge1xuXHRcdFx0XHRzZWxmLmJhY2soIHJlZmVycmVyICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cblx0XHRcdGxldCByZW1vdmVJbnRlZ3JhdGlvbiA9ICggZGF0YSwgcmVmZXJyZXIsIG1vZHVsZXMgKSA9PiB7XG5cdFx0XHRcdHNlbGYucmVtb3ZlSW50ZWdyYXRpb24oIGRhdGEsIHJlZmVycmVyLCBtb2R1bGVzICk7XG5cdFx0XHRcdGNsb3NlQ2xpY2soKTtcblx0XHRcdH07XG5cblx0XHRcdGxldCB0cGwgXHQ9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLW1vZHVsZXMtYWN0aXZlLWludGVncmF0aW9uLXRwbCcgKSxcblx0XHRcdFx0dHBsSW1nICA9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLW1vZHVsZXMtYWN0aXZlLWludGVncmF0aW9uLWltZy10cGwnICksXG5cdFx0XHRcdHRwbEhlYWQgPSBPcHRpbi50ZW1wbGF0ZSggJ2h1c3RsZS1tb2R1bGVzLWFjdGl2ZS1pbnRlZ3JhdGlvbi1oZWFkZXItdHBsJyApLFxuXHRcdFx0XHR0cGxEZXNjID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtbW9kdWxlcy1hY3RpdmUtaW50ZWdyYXRpb24tZGVzYy10cGwnICk7XG5cblx0XHRcdC8vcmVtb3ZlIHByZXZpb3VzIGh0bWxcblx0XHRcdCQoICcjaHVzdGxlLWRpYWxvZy0tcmVtb3ZlLWFjdGl2ZSB0Ym9keScgKS5odG1sKCAnJyApO1xuXHRcdFx0JCggJyNodXN0bGUtZGlhbG9nLS1yZW1vdmUtYWN0aXZlIC5zdWktZGlhbG9nLWltYWdlJyApLmh0bWwoICcnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUgI3N1aS1ib3gtbW9kYWwtaGVhZGVyJyApLmh0bWwoICcnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUgI3N1aS1ib3gtbW9kYWwtY29udGVudCcgKS5odG1sKCAnJyApO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUgLnN1aS1kaWFsb2ctaW1hZ2UnICkuYXBwZW5kKCB0cGxJbWcoe1xuXHRcdFx0XHRpbWFnZTogZGlzY29ubmVjdC5kYXRhLmltZyxcblx0XHRcdFx0dGl0bGU6IGRpc2Nvbm5lY3QuZGF0YS5zbHVnXG5cdFx0XHR9KSApO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUgI3N1aS1ib3gtbW9kYWwtaGVhZGVyJyApLmFwcGVuZCggdHBsSGVhZCh7XG5cdFx0XHRcdHRpdGxlOiBkaXNjb25uZWN0LmRhdGEudGl0bGUucmVwbGFjZSggL0Nvbm5lY3R8Q29uZmlndXJlL2dpLCAnICcgKVxuXHRcdFx0fSkgKTtcblxuXHRcdFx0JCggJyNodXN0bGUtZGlhbG9nLS1yZW1vdmUtYWN0aXZlICNzdWktYm94LW1vZGFsLWNvbnRlbnQnICkuYXBwZW5kKCB0cGxEZXNjKHtcblx0XHRcdFx0dGl0bGU6IGRpc2Nvbm5lY3QuZGF0YS50aXRsZS5yZXBsYWNlKCAvQ29ubmVjdHxDb25maWd1cmUvZ2ksICcgJyApXG5cdFx0XHR9KSApO1xuXG5cdFx0XHQkLmVhY2goIGRhdGEsIGZ1bmN0aW9uKCBpZCwgbWV0YSApIHtcblxuXHRcdFx0XHQkKCAnI2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUgdGJvZHknICkuYXBwZW5kKCB0cGwoe1xuXHRcdFx0XHRcdG5hbWU6IG1ldGEubmFtZSxcblx0XHRcdFx0XHR0eXBlOiBtZXRhLnR5cGUsXG5cdFx0XHRcdFx0ZWRpdFVybDogbWV0YS5lZGl0X3VybFxuXHRcdFx0XHR9KSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEFkZCBjbG9zaW5nIGV2ZW50XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnLnN1aS1kaWFsb2ctY2xvc2UnICkub24oICdjbGljaycsIGNsb3NlQ2xpY2sgKTtcblx0XHRcdGRpYWxvZ0lkLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLm9uKCAnY2xpY2snLCBjbG9zZUNsaWNrICk7XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnI2h1c3RsZS1yZW1vdmUtYWN0aXZlLWJ1dHRvbi1jYW5jZWwnICkub24oICdjbGljaycsIGNsb3NlQ2xpY2sgKTtcblx0XHRcdGRpYWxvZ0lkLmZpbmQoICcuaHVzdGxlLXJlbW92ZS1hY3RpdmUtaW50ZWdyYXRpb24tYmFjaycgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGdvQmFjaygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCQoICcjaHVzdGxlLXJlbW92ZS1hY3RpdmUtYnV0dG9uJyApLm9mZiggJ2NsaWNrJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0XHRyZW1vdmVJbnRlZ3JhdGlvbiggZGlzY29ubmVjdCwgcmVmZXJyZXIsIGRhdGEgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1kaWFsb2cnICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICkuaGlkZSgpO1xuXG5cdFx0XHRTVUkuZGlhbG9nc1sgJ2h1c3RsZS1kaWFsb2ctLXJlbW92ZS1hY3RpdmUnIF0uc2hvdygpO1xuXHRcdH0sXG5cblx0XHRjbG9zZSgpIHtcblxuXHRcdFx0dmFyICRwb3B1cCA9ICQoICcjaHVzdGxlLWRpYWxvZy0tcmVtb3ZlLWFjdGl2ZScgKTtcblxuXHRcdFx0JHBvcHVwLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnc3VpLWZhZGUtaW4nICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICk7XG5cdFx0XHQkcG9wdXAuZmluZCggJy5zdWktZGlhbG9nLWNvbnRlbnQnICkucmVtb3ZlQ2xhc3MoICdzdWktYm91bmNlLWluJyApLmFkZENsYXNzKCAnc3VpLWJvdW5jZS1vdXQnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1kZWxldGUtZmluYWwtYnV0dG9uJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHQkKCAnI2h1c3RsZS1pbnRlZ3JhdGlvbi1kaWFsb2cnICkucmVtb3ZlKCk7XG5cblx0XHRcdC8vIHJlc2V0IGJvZHkgc2Nyb2xsYmFyXG5cdFx0XHQkKCAnYm9keScgKS5jc3MoICdvdmVyZmxvdycsICdhdXRvJyApO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHBvcHVwLmF0dHIoICdhcmlhLWhpZGRlbicsICd0cnVlJyApO1xuXHRcdFx0fSwgMzAwICk7XG5cblx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tcmVtb3ZlLWFjdGl2ZScgXS5oaWRlKCk7XG5cdFx0fSxcblx0XHRiYWNrKCBzbHVnICkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0c2VsZi5jbG9zZSgpO1xuXG5cdFx0XHQvL2ludGVncmF0aW9ucyB0aGF0IGRvZXNuJ3Qgc3VwcG9ydCBnbG9iYWwgbXVsdGkgaWQuXG5cdFx0XHRpZiAoICdodWJzcG90JyA9PT0gc2x1Zy5zbHVnIHx8ICdjb25zdGFudGNvbnRhY3QnID09PSBzbHVnLnNsdWcgKSB7XG5cdFx0XHRcdCQoICdidXR0b25bZGF0YS1zbHVnPVwiJyArIHNsdWcuc2x1ZyArICdcIl0nICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JCggJ2J1dHRvbltkYXRhLWdsb2JhbF9tdWx0aV9pZD1cIicgKyBzbHVnLmdsb2JhbE11bHRpSWQgKyAnXCJdJyApLnRyaWdnZXIoICdjbGljaycgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cmVtb3ZlSW50ZWdyYXRpb24oIGRhdGEsIHJlZmVycmVyLCBtb2R1bGVzICkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0JC5lYWNoKCBtb2R1bGVzLCBmdW5jdGlvbiggaWQsIG1ldGEgKSB7XG5cdFx0XHRcdGlmICggZGF0YS5kYXRhLnNsdWcgPT09IG1ldGEuYWN0aXZlLmFjdGl2ZV9pbnRlZ3JhdGlvbnMgKSB7XG5cdFx0XHRcdFx0c2VsZi5pbnNlcnRMb2NhbExpc3QoIGRhdGEsIGlkICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZWZlcnJlci5yZXF1ZXN0KCBkYXRhLCB0cnVlLCBmYWxzZSApO1xuXHRcdFx0JCggJyNodXN0bGUtcmVtb3ZlLWFjdGl2ZS1idXR0b24nICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHR9LFxuXG5cdFx0aW5zZXJ0TG9jYWxMaXN0KCBkYXRhLCBpZCApIHtcblx0XHRcdGxldCBhamF4RGF0YSA9IHtcblx0XHRcdFx0aWQ6IGlkLFxuXHRcdFx0XHQnX2FqYXhfbm9uY2UnOiBkYXRhLl9hamF4X25vbmNlLFxuXHRcdFx0XHRhY3Rpb246ICdodXN0bGVfcHJvdmlkZXJfaW5zZXJ0X2xvY2FsX2xpc3QnXG5cdFx0XHR9O1xuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGE6IGFqYXhEYXRhLFxuXHRcdFx0XHRzdWNjZXNzOiBmdW5jdGlvbiggcmVzcCApIHtcblx0XHRcdFx0XHRpZiAoIGZhbHNlID09PSByZXNwLnN1Y2Nlc3MgKSB7XG5cdFx0XHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oICdlcnJvcicsIG9wdGluVmFycy5tZXNzYWdlcy5zb21ldGhpbmdfd2VudF93cm9uZyApO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgb3B0aW5WYXJzLm1lc3NhZ2VzLnNvbWV0aGluZ193ZW50X3dyb25nICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogVGhlIHByb3ZpZGVyIG1pZ3JhdGlvbiBtb2RlbFxuXHQgKiBAc2luY2UgNC4wLjNcblx0ICovXG5cdE1vZHVsZS5Qcm92aWRlck1pZ3JhdGlvbiA9IHtcblxuXHRcdCRwb3B1cDoge30sXG5cblx0XHRfZGVmZXJyZWQ6IHt9LFxuXG5cdFx0LyoqXG5cdFx0ICogQHNpbmNlIDQuMC4zXG5cdFx0ICogQHBhcmFtIG9iamVjdCBzbHVnIG9mIHByb3ZpZGVyLlxuXHRcdCAqL1xuXHRcdG9wZW4oIHNsdWcgKSB7XG5cblx0XHRcdGxldFx0ZGlhbG9nSWQgPSAkKCAnI2h1c3RsZS1kaWFsb2ctbWlncmF0ZS0tJyArIHNsdWcgKSxcblx0XHRcdFx0Y2xvc2VDbGljayA9ICgpID0+IHtcblx0XHRcdFx0XHRzZWxmLmNsb3NlKCBkaWFsb2dJZCwgc2x1ZyApO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0ZGlhbG9nSWQuZmluZCggJy5zdWktZGlhbG9nLWNsb3NlJyApLm9uKCAnY2xpY2snLCBjbG9zZUNsaWNrICk7XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnLnN1aS1kaWFsb2ctb3ZlcmxheScgKS5vbiggJ2NsaWNrJywgY2xvc2VDbGljayApO1xuXHRcdFx0c2V0VGltZW91dCggKCkgPT4gIFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy1taWdyYXRlLS0nICsgc2x1ZyBdLnNob3coKSwgMzAwICk7XG5cdFx0fSxcblx0XHRjbG9zZSggZGlhbG9nSWQsIHNsdWcgKSB7XG5cblx0XHRcdGRpYWxvZ0lkLmZpbmQoICcuc3VpLWRpYWxvZy1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnc3VpLWZhZGUtaW4nICkuYWRkQ2xhc3MoICdzdWktZmFkZS1vdXQnICk7XG5cdFx0XHRkaWFsb2dJZC5maW5kKCAnLnN1aS1kaWFsb2ctY29udGVudCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1ib3VuY2UtaW4nICkuYWRkQ2xhc3MoICdzdWktYm91bmNlLW91dCcgKTtcblxuXHRcdFx0Ly8gcmVzZXQgYm9keSBzY3JvbGxiYXJcblx0XHRcdCQoICdib2R5JyApLmNzcyggJ292ZXJmbG93JywgJ2F1dG8nICk7XG5cblx0XHRcdHNldFRpbWVvdXQoICgpID0+ICBkaWFsb2dJZC5hdHRyKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKSwgMzAwICk7XG5cblx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy1taWdyYXRlLS0nICsgc2x1ZyBdLmhpZGUoKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIFRoZSBcImFyZSB5b3Ugc3VyZT9cIiBtb2RhbCBmcm9tIHdoZW4gZGVsZXRpbmcgbW9kdWxlcyBvciBlbnRyaWVzLlxuXHQgKiBAc2luY2UgNC4wXG5cdCAqL1xuXHRNb2R1bGUuZGVsZXRlTW9kYWwgPSB7XG5cblx0XHQvKipcblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICogQHBhcmFtIG9iamVjdCBkYXRhIC0gbXVzdCBjb250YWluICd0aXRsZScsICdkZXNjcmlwdGlvbicsICdub25jZScsICdhY3Rpb24nLCBhbmQgJ2lkJyB0aGF0J3MgYmVpbmcgZGVsZXRlZC5cblx0XHQgKi9cblx0XHRvcGVuKCBkYXRhLCBzaG93ID0gdHJ1ZSApIHtcblx0XHRcdGxldCBkaWFsb2dJZCA9ICdodXN0bGUtZGlhbG9nLS1kZWxldGUnLFxuXHRcdFx0XHR0ZW1wbGF0ZSA9IE9wdGluLnRlbXBsYXRlKCAnaHVzdGxlLWRpYWxvZy0tZGVsZXRlLXRwbCcgKSxcblx0XHRcdFx0Y29udGVudCA9IHRlbXBsYXRlKCBkYXRhICk7XG5cblx0XHRcdC8vIEFkZCB0aGUgdGVtcGxhdGVkIGNvbnRlbnQgdG8gdGhlIG1vZGFsLlxuXHRcdFx0JCggJyMnICsgZGlhbG9nSWQgKyAnICNodXN0bGUtZGVsZXRlLWRpYWxvZy1jb250ZW50JyApLmh0bWwoIGNvbnRlbnQgKTtcblxuXHRcdFx0Ly8gQWRkIHRoZSB0aXRsZSB0byB0aGUgbW9kYWwuXG5cdFx0XHQkKCAnIycgKyBkaWFsb2dJZCArICcgI2h1c3RsZS1kaWFsb2ctdGl0bGUnICkuaHRtbCggZGF0YS50aXRsZSApO1xuXG5cdFx0XHRpZiAoICd1bmRlZmluZWQnID09PSB0eXBlb2YgU1VJLmRpYWxvZ3NbIGRpYWxvZ0lkIF0pIHtcblx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnZXJyb3InLCBvcHRpblZhcnMubWVzc2FnZXMuc29tZXRoaW5nX3dlbnRfd3JvbmcgKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQkKCAnIycgKyBkaWFsb2dJZCArICcgLmh1c3RsZS1kZWxldGUtY29uZmlybScgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdGxldCAkYnV0dG9uID0gJCggZS5jdXJyZW50VGFyZ2V0ICk7XG5cdFx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRTVUkuZGlhbG9nc1sgZGlhbG9nSWQgXS5jcmVhdGUoKTtcblxuXHRcdFx0aWYgKCBzaG93ICkge1xuXHRcdFx0XHRTVUkuZGlhbG9nc1sgZGlhbG9nSWQgXS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBPcGVuIHRoZSBtb2R1bGUncyBwcmV2aWV3LlxuXHQgKiBTaG93cyB0aGUgbW9kdWxlIGlmIGl0J3Mgc2xpZGUtaW4gb3IgcG9wLXVwLlxuXHQgKiBPcGVuIGEgbW9kYWwgY29udGFpbmluZyB0aGUgbW9kdWxlIGlmIGl0J3MgZW1iZWRkZWQgb3Igc29jaWFsIHNoYXJpbmcuIFRoaXMgc2hvdWxkIGJlIGFscmVhZHkgcmVuZGVyZWQgaW4gdGhlIHBhZ2UuXG5cdCAqIEBzaW5jZSA0LjBcblx0ICovXG5cdE1vZHVsZS5wcmV2aWV3ID0ge1xuXG5cdFx0b3BlbiggaWQsIHR5cGUsIHByZXZpZXdEYXRhID0gZmFsc2UgKSB7XG5cdFx0XHRjb25zdCBtZSA9IHRoaXMsXG5cdFx0XHRcdGlzSW5saW5lID0gKCAnZW1iZWRkZWQnID09PSB0eXBlIHx8ICdzb2NpYWxfc2hhcmluZycgPT09IHR5cGUgKTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb246ICdodXN0bGVfcHJldmlld19tb2R1bGUnLFxuXHRcdFx0XHRcdGlkLFxuXHRcdFx0XHRcdHByZXZpZXdEYXRhXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQudGhlbiggZnVuY3Rpb24oIHJlcyApIHtcblxuXHRcdFx0XHRpZiAoIHJlcy5zdWNjZXNzICkge1xuXG5cdFx0XHRcdFx0bGV0ICRwcmV2aWV3Q29udGFpbmVyID0gJyc7XG5cblx0XHRcdFx0XHQvLyBGaWxsIGEgcmVndWxhciBkaXYgaWYgdGhleSdyZSBub3QgaW5saW5lIG1vZHVsZXMuXG5cdFx0XHRcdFx0aWYgKCAhIGlzSW5saW5lICkge1xuXHRcdFx0XHRcdFx0JHByZXZpZXdDb250YWluZXIgPSAkKCAnI21vZHVsZS1wcmV2aWV3LWNvbnRhaW5lcicgKTtcblxuXHRcdFx0XHRcdFx0Ly8gSWYgaXQgZG9lc24ndCBleGlzdCBhbHJlYWR5LCBhZGQgaXQuXG5cdFx0XHRcdFx0XHRpZiAoICEgJHByZXZpZXdDb250YWluZXIubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHQkKCAnbWFpbi5zdWktd3JhcCcgKS5hcHBlbmQoICc8ZGl2IGlkPVwibW9kdWxlLXByZXZpZXctY29udGFpbmVyXCI+PC9kaXY+JyApO1xuXHRcdFx0XHRcdFx0XHQkcHJldmlld0NvbnRhaW5lciA9ICQoICcjbW9kdWxlLXByZXZpZXctY29udGFpbmVyJyApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gVXNlIHRoZSBwcmV2aWV3IG1vZGFsIGZvciBpbmxpbmUgbW9kdWxlcy5cblx0XHRcdFx0XHRcdCRwcmV2aWV3Q29udGFpbmVyID0gJCggJyNodXN0bGUtZGlhbG9nLS1wcmV2aWV3IC5zdWktYm94LWJvZHknICk7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQkcHJldmlld0NvbnRhaW5lci5odG1sKCByZXMuZGF0YS5odG1sICk7XG5cdFx0XHRcdFx0Y29uc3QgJG1vZHVsZSA9ICRwcmV2aWV3Q29udGFpbmVyLmZpbmQoICcuaHVzdGxlLXVpJyApO1xuXG5cdFx0XHRcdFx0SFVJLm1heWJlUmVuZGVyUmVjYXB0Y2hhKCAkbW9kdWxlICk7XG5cblx0XHRcdFx0XHQvLyBMb2FkIHNlbGVjdDIgaWYgdGhpcyBtb2R1bGUgaGFzIHNlbGVjdCBmaWVsZHMuXG5cdFx0XHRcdFx0aWYgKCAkbW9kdWxlLmZpbmQoICcuaHVzdGxlLXNlbGVjdDInICkubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0SFVJLnNlbGVjdDIoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZiB0aGVyZSdzIGEgdGltZXBpY2tlci5cblx0XHRcdFx0XHRpZiAoICRtb2R1bGUuZmluZCggJy5odXN0bGUtdGltZScgKS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRIVUkudGltZXBpY2tlciggJy5odXN0bGUtdGltZScgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBJZiB0aGVyZSdzIGEgZGF0ZXBpY2tlci5cblx0XHRcdFx0XHRpZiAoICRtb2R1bGUuZmluZCggJy5odXN0bGUtZGF0ZScgKS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IGRheXNfYW5kX21vbnRoczogc3RyaW5ncyB9ID0gb3B0aW5WYXJzLm1lc3NhZ2VzO1xuXHRcdFx0XHRcdFx0SFVJLmRhdGVwaWNrZXIoICcuaHVzdGxlLWRhdGUnLCBzdHJpbmdzLmRheXNfZnVsbCwgc3RyaW5ncy5kYXlzX3Nob3J0LCBzdHJpbmdzLmRheXNfbWluLCBzdHJpbmdzLm1vbnRoc19mdWxsLCBzdHJpbmdzLm1vbnRoc19zaG9ydCApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdEhVSS5ub25TaGFyaW5nU2ltdWxhdGlvbiggJG1vZHVsZSApO1xuXHRcdFx0XHRcdEhVSS5pbnB1dEZpbGxlZCgpO1xuXG5cdFx0XHRcdFx0aWYgKCByZXMuZGF0YS5zdHlsZSApIHtcblx0XHRcdFx0XHRcdCRwcmV2aWV3Q29udGFpbmVyLmFwcGVuZCggcmVzLmRhdGEuc3R5bGUgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIHJlcy5kYXRhLnNjcmlwdCApIHtcblx0XHRcdFx0XHRcdCRwcmV2aWV3Q29udGFpbmVyLmFwcGVuZCggcmVzLmRhdGEuc2NyaXB0ICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGlkLFxuXHRcdFx0XHRcdGRhdGE6IHJlcy5kYXRhLm1vZHVsZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKCByZXMgKSB7XG5cblx0XHRcdFx0Ly8gVE9ETzogaGFuZGxlIGVycm9yc1xuXHRcdFx0XHRjb25zb2xlLmxvZyggcmVzICk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oIGZ1bmN0aW9uKHsgaWQsIGRhdGEgfSkge1xuXG5cdFx0XHRcdC8vIElmIG5vIElELCBhYm9ydC5cblx0XHRcdFx0aWYgKCAhIGlkICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIERpc3BsYXkgdGhlIHByZXZpZXcgbW9kYWwgZm9yIGlubGluZSBtb2R1bGVzLlxuXHRcdFx0XHRpZiAoIGlzSW5saW5lICkge1xuXHRcdFx0XHRcdFNVSS5kaWFsb2dzWydodXN0bGUtZGlhbG9nLS1wcmV2aWV3J10uc2hvdygpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBEaXNwbGF5IHRoZSBtb2R1bGUuXG5cdFx0XHRcdG1lLnNob3dNb2R1bGUoIGlkLCBkYXRhICk7XG5cblx0XHRcdH0pXG5cdFx0XHQuYWx3YXlzKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggJy5zdWktYnV0dG9uLW9ubG9hZCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdHNob3dNb2R1bGUoIGlkLCBkYXRhICkge1xuXG5cdFx0XHRjb25zdCBlbCA9ICcuaHVzdGxlX21vZHVsZV9pZF8nICsgaWQ7XG5cblx0XHRcdGlmICggJ3BvcHVwJyA9PT0gZGF0YS5tb2R1bGVfdHlwZSApIHtcblx0XHRcdFx0Y29uc3QgYXV0b2hpZGVEZWxheSA9ICcwJyA9PT0gU3RyaW5nKCAkKCBlbCApLmRhdGEoICdjbG9zZS1kZWxheScgKSApID8gZmFsc2UgOiAkKCBlbCApLmRhdGEoICdjbG9zZS1kZWxheScgKTtcblx0XHRcdFx0SFVJLnBvcHVwTG9hZCggZWwsIGF1dG9oaWRlRGVsYXkgKTtcblxuXHRcdFx0fSBlbHNlIGlmICggJ3NsaWRlaW4nID09PSBkYXRhLm1vZHVsZV90eXBlICkge1xuXHRcdFx0XHRjb25zdCBhdXRvaGlkZURlbGF5ID0gJzAnID09PSBTdHJpbmcoICQoIGVsICkuZGF0YSggJ2Nsb3NlLWRlbGF5JyApICkgPyBmYWxzZSA6ICQoIGVsICkuZGF0YSggJ2Nsb3NlLWRlbGF5JyApO1xuXHRcdFx0XHRIVUkuc2xpZGVpbkxheW91dHMoIGVsICk7XG5cdFx0XHRcdEhVSS5zbGlkZWluTG9hZCggZWwsIGF1dG9oaWRlRGVsYXkgKTtcblxuXHRcdFx0XHQkKCB3aW5kb3cgKS5vbiggJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdEhVSS5zbGlkZWluTGF5b3V0cyggZWwgKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdEhVSS5pbmxpbmVSZXNpemUoIGVsICk7XG5cdFx0XHRcdEhVSS5pbmxpbmVMb2FkKCBlbCApO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBtb2R1bGUncyBjaGFydHMgaW4gdGhlIGxpc3RpbmcgcGFnZXMuXG5cdCAqIEl0IGFsc28gaGFuZGxlcyB0aGUgdmlldyB3aGVuIHRoZSAnY29udmVyc2lvbnMgdHlwZScgc2VsZWN0IGNoYW5nZXMuXG5cdCAqIEBzaW5jZSA0LjAuNFxuXHQgKi9cblx0TW9kdWxlLnRyYWNraW5nQ2hhcnQgPSB7XG5cblx0XHRjaGFydHNEYXRhOiB7fSxcblx0XHR0aGVDaGFydHM6IHt9LFxuXG5cdFx0aW5pdCggJGNvbnRhaW5lciwgY2hhcnRzRGF0YSApIHtcblxuXHRcdFx0JGNvbnRhaW5lci5maW5kKCAnc2VsZWN0Lmh1c3RsZS1jb252ZXJzaW9uLXR5cGUnICkuZWFjaCggKCBpLCBlbCApID0+IHtcblx0XHRcdFx0U1VJLnN1aVNlbGVjdCggZWwgKTtcblx0XHRcdFx0JCggZWwgKS5vbiggJ2NoYW5nZS5zZWxlY3QyJywgKCBlICkgPT4gdGhpcy5jb252ZXJzaW9uVHlwZUNoYW5nZWQoIGUsICRjb250YWluZXIgKSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuY2hhcnRzRGF0YSA9IGNoYXJ0c0RhdGE7XG5cdFx0XHRPYmplY3QudmFsdWVzKCBjaGFydHNEYXRhICkuZm9yRWFjaCggY2hhcnQgPT4gdGhpcy51cGRhdGVDaGFydCggY2hhcnQgKSApO1xuXHRcdH0sXG5cblx0XHRjb252ZXJzaW9uVHlwZUNoYW5nZWQoIGUsICRjb250YWluZXIgKSB7XG5cdFx0XHRjb25zdCAkc2VsZWN0ID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGNvbnZlcnNpb25UeXBlID0gJHNlbGVjdC52YWwoKSxcblx0XHRcdFx0bW9kdWxlU3ViVHlwZSA9ICRzZWxlY3QuZGF0YSggJ21vZHVsZVR5cGUnICksXG5cdFx0XHRcdHN1YlR5cGVDaGFydCA9IHRoaXMuY2hhcnRzRGF0YVsgbW9kdWxlU3ViVHlwZSBdLFxuXHRcdFx0XHQkY29udmVyc2lvbnNDb3VudCA9ICRjb250YWluZXIuZmluZCggYC5odXN0bGUtdHJhY2tpbmctJHsgbW9kdWxlU3ViVHlwZSB9LWNvbnZlcnNpb25zLWNvdW50YCApLFxuXHRcdFx0XHQkY29udmVyc2lvbnNSYXRlID0gJGNvbnRhaW5lci5maW5kKCBgLmh1c3RsZS10cmFja2luZy0keyBtb2R1bGVTdWJUeXBlIH0tY29udmVyc2lvbnMtcmF0ZWAgKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHRoZSBudW1iZXIgZm9yIHRoZSBjb252ZXJzaW9ucyBjb3VudCBhbmQgY29udmVyc2lvbiByYXRlIGF0IHRoZSB0b3Agb2YgdGhlIGNoYXJ0LlxuXHRcdFx0JGNvbnZlcnNpb25zQ291bnQudGV4dCggc3ViVHlwZUNoYXJ0WyBjb252ZXJzaW9uVHlwZSBdLmNvbnZlcnNpb25zX2NvdW50ICk7XG5cdFx0XHQkY29udmVyc2lvbnNSYXRlLnRleHQoIHN1YlR5cGVDaGFydFsgY29udmVyc2lvblR5cGUgXS5jb252ZXJzaW9uX3JhdGUgKyAnJScgKTtcblxuXHRcdFx0dGhpcy51cGRhdGVDaGFydCggc3ViVHlwZUNoYXJ0LCBjb252ZXJzaW9uVHlwZSwgZmFsc2UgKTtcblx0XHR9LFxuXG5cdFx0dXBkYXRlQ2hhcnQoIGNoYXJ0LCBjb252ZXJzaW9uVHlwZSA9ICdhbGwnLCByZW5kZXIgPSB0cnVlICkge1xuXG5cdFx0XHRsZXQgdmlld3MgPSBjaGFydC52aWV3cyxcblx0XHRcdFx0c3VibWlzc2lvbnMgPSBjaGFydFsgY29udmVyc2lvblR5cGUgXS5jb252ZXJzaW9ucyxcblxuXHRcdFx0ZGF0YXNldHMgPSBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYWJlbDogJ1N1Ym1pc3Npb25zJyxcblx0XHRcdFx0XHRkYXRhOiBzdWJtaXNzaW9ucyxcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFtcblx0XHRcdFx0XHRcdCcjRTFGNkZGJ1xuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Ym9yZGVyQ29sb3I6IFtcblx0XHRcdFx0XHRcdCcjMTdBOEUzJ1xuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Ym9yZGVyV2lkdGg6IDIsXG5cdFx0XHRcdFx0cG9pbnRSYWRpdXM6IDAsXG5cdFx0XHRcdFx0cG9pbnRIaXRSYWRpdXM6IDIwLFxuXHRcdFx0XHRcdHBvaW50SG92ZXJSYWRpdXM6IDUsXG5cdFx0XHRcdFx0cG9pbnRIb3ZlckJvcmRlckNvbG9yOiAnIzE3QThFMycsXG5cdFx0XHRcdFx0cG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogJyMxN0E4RTMnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYWJlbDogJ1ZpZXdzJyxcblx0XHRcdFx0XHRkYXRhOiB2aWV3cyxcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFtcblx0XHRcdFx0XHRcdCcjRjhGOEY4J1xuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Ym9yZGVyQ29sb3I6IFtcblx0XHRcdFx0XHRcdCcjREREREREJ1xuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Ym9yZGVyV2lkdGg6IDIsXG5cdFx0XHRcdFx0cG9pbnRSYWRpdXM6IDAsXG5cdFx0XHRcdFx0cG9pbnRIaXRSYWRpdXM6IDIwLFxuXHRcdFx0XHRcdHBvaW50SG92ZXJSYWRpdXM6IDUsXG5cdFx0XHRcdFx0cG9pbnRIb3ZlckJvcmRlckNvbG9yOiAnI0RERERERCcsXG5cdFx0XHRcdFx0cG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogJyNEREREREQnXG5cdFx0XHRcdH1cblx0XHRcdF07XG5cblx0XHRcdC8vIFRoZSBjaGFydCB3YXMgYWxyZWFkeSBjcmVhdGVkLiBVcGRhdGUgaXQuXG5cdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy50aGVDaGFydHNbIGNoYXJ0LmlkIF0pIHtcblxuXHRcdFx0XHQvLyBUaGUgY29udGFpbmVyIGhhcyBiZWVuIHJlLXJlbmRlcmVkLCBzbyByZW5kZXIgdGhlIGNoYXJ0IGFnYWluLlxuXHRcdFx0XHRpZiAoIHJlbmRlciApIHtcblx0XHRcdFx0XHR0aGlzLnRoZUNoYXJ0c1sgY2hhcnQuaWQgXS5kZXN0cm95KCk7XG5cdFx0XHRcdFx0dGhpcy5jcmVhdGVOZXdDaGFydCggY2hhcnQsIGRhdGFzZXRzICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIEp1c3QgdXBkYXRlIHRoZSBjaGFydCBvdGhlcndpc2UuXG5cdFx0XHRcdFx0dGhpcy50aGVDaGFydHNbIGNoYXJ0LmlkIF0uZGF0YS5kYXRhc2V0cyA9IGRhdGFzZXRzO1xuXHRcdFx0XHRcdHRoaXMudGhlQ2hhcnRzWyBjaGFydC5pZCBdLnVwZGF0ZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuY3JlYXRlTmV3Q2hhcnQoIGNoYXJ0LCBkYXRhc2V0cyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjcmVhdGVOZXdDaGFydCggY2hhcnQsIGRhdGFzZXRzICkge1xuXHRcdFx0bGV0IHlBeGVzSGVpZ2h0ID0gKCBNYXRoLm1heCggLi4uY2hhcnQudmlld3MgKSArIDIgKTtcblx0XHRcdGNvbnN0IGNoYXJ0Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGNoYXJ0LmlkICk7XG5cblx0XHRcdGlmICggTWF0aC5tYXgoIC4uLmNoYXJ0LnZpZXdzICkgPCBNYXRoLm1heCggLi4uY2hhcnQuY29udmVyc2lvbnMgKSApIHtcblx0XHRcdFx0eUF4ZXNIZWlnaHQgPSAoIE1hdGgubWF4KCAuLi5jaGFydC5jb252ZXJzaW9ucyApICsgMiApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICEgY2hhcnRDb250YWluZXIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZGF5cyA9IGNoYXJ0LmRheXMsXG5cdFx0XHRcdGNoYXJ0RGF0YSA9IHtcblx0XHRcdFx0XHRsYWJlbHM6IGRheXMsXG5cdFx0XHRcdFx0ZGF0YXNldHNcblx0XHRcdFx0fTtcblxuXHRcdFx0bGV0IGNoYXJ0T3B0aW9ucyA9IHtcblx0XHRcdFx0bWFpbnRhaW5Bc3BlY3RSYXRpbzogZmFsc2UsXG5cdFx0XHRcdGxlZ2VuZDoge1xuXHRcdFx0XHRcdGRpc3BsYXk6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNjYWxlczoge1xuXHRcdFx0XHRcdHhBeGVzOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRncmlkTGluZXM6IHtcblx0XHRcdFx0XHRcdFx0XHRjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMCknXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdHlBeGVzOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRncmlkTGluZXM6IHtcblx0XHRcdFx0XHRcdFx0XHRjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMCknXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdHRpY2tzOiB7XG5cdFx0XHRcdFx0XHRcdFx0YmVnaW5BdFplcm86IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdG1pbjogMCxcblx0XHRcdFx0XHRcdFx0XHRtYXg6IHlBeGVzSGVpZ2h0LFxuXHRcdFx0XHRcdFx0XHRcdHN0ZXBTaXplOiAxXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVsZW1lbnRzOiB7XG5cdFx0XHRcdFx0bGluZToge1xuXHRcdFx0XHRcdFx0dGVuc2lvbjogMFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cG9pbnQ6IHtcblx0XHRcdFx0XHRcdHJhZGl1czogMC41XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0b29sdGlwczoge1xuXHRcdFx0XHRcdGN1c3RvbTogZnVuY3Rpb24oIHRvb2x0aXAgKSB7XG5cblx0XHRcdFx0XHRcdGlmICggISB0b29sdGlwICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIERpc2FibGUgZGlzcGxheWluZyB0aGUgY29sb3IgYm94XG5cdFx0XHRcdFx0XHR0b29sdGlwLmRpc3BsYXlDb2xvcnMgPSBmYWxzZTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNhbGxiYWNrczoge1xuXHRcdFx0XHRcdFx0dGl0bGU6IGZ1bmN0aW9uKCB0b29sdGlwSXRlbSwgZGF0YSApIHtcblx0XHRcdFx0XHRcdFx0aWYgKCAwID09PSB0b29sdGlwSXRlbVswXS5kYXRhc2V0SW5kZXggKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9wdGluVmFycy5sYWJlbHMuc3VibWlzc2lvbnMucmVwbGFjZSggJyVkJywgdG9vbHRpcEl0ZW1bMF0ueUxhYmVsICk7Ly8gKyAnIFN1Ym1pc3Npb25zJztcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICggMSA9PT0gdG9vbHRpcEl0ZW1bMF0uZGF0YXNldEluZGV4ICkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvcHRpblZhcnMubGFiZWxzLnZpZXdzLnJlcGxhY2UoICclZCcsIHRvb2x0aXBJdGVtWzBdLnlMYWJlbCApOyAvLysgJyBWaWV3cyc7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRsYWJlbDogZnVuY3Rpb24oIHRvb2x0aXBJdGVtLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdG9vbHRpcEl0ZW0ueExhYmVsO1xuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0Ly8gU2V0IGxhYmVsIHRleHQgY29sb3Jcblx0XHRcdFx0XHRcdGxhYmVsVGV4dENvbG9yOiBmdW5jdGlvbiggdG9vbHRpcEl0ZW0sIGNoYXJ0ICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gJyNBQUFBQUEnO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy50aGVDaGFydHNbIGNoYXJ0LmlkIF0gPSBuZXcgQ2hhcnQoIGNoYXJ0Q29udGFpbmVyLCB7XG5cdFx0XHRcdHR5cGU6ICdsaW5lJyxcblx0XHRcdFx0ZmlsbDogJ3N0YXJ0Jyxcblx0XHRcdFx0ZGF0YTogY2hhcnREYXRhLFxuXHRcdFx0XHRvcHRpb25zOiBjaGFydE9wdGlvbnNcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogS2V5IHZhciB0byBsaXN0ZW4gdXNlciBjaGFuZ2VzIGJlZm9yZSB0cmlnZ2VyaW5nXG5cdCAqIG5hdmlnYXRlIGF3YXkgbWVzc2FnZS5cblx0ICoqL1xuXHRNb2R1bGUuaGFzQ2hhbmdlcyA9IGZhbHNlO1xuXG5cdC8vIFVudXNlZFxuXHQvKk1vZHVsZS51c2VyX2NoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXHRcdE1vZHVsZS5oYXNDaGFuZ2VzID0gdHJ1ZTtcblx0fTsqL1xuXG5cdHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCBNb2R1bGUuaGFzQ2hhbmdlcyApIHtcblx0XHRcdHJldHVybiBvcHRpblZhcnMubWVzc2FnZXMuZG9udF9uYXZpZ2F0ZV9hd2F5O1xuXHRcdH1cblx0fTtcblxuXHQkKCAnLmhpZ2hsaWdodF9pbnB1dF90ZXh0JyApLmZvY3VzKCBmdW5jdGlvbigpIHtcblx0XHQkKCB0aGlzICkuc2VsZWN0KCk7XG5cdH0pO1xuXG59KCBqUXVlcnkgKSApO1xuIiwiKCBmdW5jdGlvbiggJCApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNb2R1bGUgPSB3aW5kb3cuTW9kdWxlIHx8IHt9O1xuXG5cdE1vZHVsZS5VdGlscyA9IHtcblxuXHRcdC8qXG5cdFx0ICogUmV0dXJuIFVSTCBwYXJhbSB2YWx1ZVxuXHRcdCAqL1xuXHRcdGdldFVybFBhcmFtOiBmdW5jdGlvbiggcGFyYW0gKSB7XG5cdFx0XHR2YXIgcGFnZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKCAxICksXG5cdFx0XHRcdHVybFBhcmFtcyA9IHBhZ2VVcmwuc3BsaXQoICcmJyApLFxuXHRcdFx0XHRwYXJhbU5hbWUsIGk7XG5cblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgdXJsUGFyYW1zLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRwYXJhbU5hbWUgPSB1cmxQYXJhbXNbaV0uc3BsaXQoICc9JyApO1xuXHRcdFx0XHRpZiAoIHBhcmFtTmFtZVswXSA9PT0gcGFyYW0gKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcmFtTmFtZVsxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblxuXHRcdGFjY2Vzc2libGVIaWRlKCAkZWxlbWVudHMsIGlzRm9jdXNhYmxlID0gZmFsc2UsIGV4dHJhVG9VcGRhdGUgPSBmYWxzZSApIHtcblx0XHRcdCRlbGVtZW50cy5oaWRlKCk7XG5cdFx0XHQkZWxlbWVudHMuYXR0ciggJ2FyaWEtaGlkZGVuJywgdHJ1ZSApO1xuXHRcdFx0JGVsZW1lbnRzLnByb3AoICdoaWRkZW4nLCB0cnVlICk7XG5cdFx0XHRpZiAoIGlzRm9jdXNhYmxlICkge1xuXHRcdFx0XHQkZWxlbWVudHMucHJvcCggJ3RhYmluZGV4JywgJy0xJyApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBleHRyYVRvVXBkYXRlICkge1xuXHRcdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgZXh0cmFUb1VwZGF0ZS5uYW1lICkge1xuXHRcdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBleHRyYVRvVXBkYXRlLnZhbHVlICkge1xuXHRcdFx0XHRcdFx0JGVsZW1lbnRzLmF0dHIoIGV4dHJhVG9VcGRhdGUubmFtZSwgZXh0cmFUb1VwZGF0ZS52YWx1ZSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkZWxlbWVudHMucmVtb3ZlQXR0ciggZXh0cmFUb1VwZGF0ZS5uYW1lICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGFjY2Vzc2libGVTaG93KCAkZWxlbWVudHMsIGlzRm9jdXNhYmxlID0gZmFsc2UsIGV4dHJhVG9VcGRhdGUgPSBmYWxzZSApIHtcblx0XHRcdCRlbGVtZW50cy5zaG93KCk7XG5cdFx0XHQkZWxlbWVudHMucmVtb3ZlQXR0ciggJ2FyaWEtaGlkZGVuJyApO1xuXHRcdFx0JGVsZW1lbnRzLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdCRlbGVtZW50cy5yZW1vdmVQcm9wKCAnaGlkZGVuJyApO1xuXHRcdFx0aWYgKCBpc0ZvY3VzYWJsZSApIHtcblx0XHRcdFx0JGVsZW1lbnRzLmF0dHIoICd0YWJpbmRleCcsICcwJyApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBleHRyYVRvVXBkYXRlICkge1xuXHRcdFx0XHRpZiAoICd1bmRlZmluZWQnICE9PSB0eXBlb2YgZXh0cmFUb1VwZGF0ZS5uYW1lICkge1xuXHRcdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBleHRyYVRvVXBkYXRlLnZhbHVlICkge1xuXHRcdFx0XHRcdFx0JGVsZW1lbnRzLmF0dHIoIGV4dHJhVG9VcGRhdGUubmFtZSwgZXh0cmFUb1VwZGF0ZS52YWx1ZSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkZWxlbWVudHMucmVtb3ZlQXR0ciggZXh0cmFUb1VwZGF0ZS5uYW1lICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNlcmlhbGl6ZU9iamVjdCggJGZvcm0gKSB7XG5cblx0XHRcdGxldCBvYmplY3QgPSB7fSxcblx0XHRcdFx0YXJyYXkgPSAkZm9ybS5zZXJpYWxpemVBcnJheSgpO1xuXHRcdFx0JC5lYWNoKCBhcnJheSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdW5kZWZpbmVkICE9PSBvYmplY3RbIHRoaXMubmFtZSBdKSB7XG5cdFx0XHRcdFx0aWYgKCAhIG9iamVjdFt0aGlzLm5hbWVdLnB1c2ggKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RbdGhpcy5uYW1lXSA9IFsgb2JqZWN0WyB0aGlzLm5hbWUgXSBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvYmplY3RbIHRoaXMubmFtZSBdLnB1c2goIHRoaXMudmFsdWUgfHwgJycgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvYmplY3RbIHRoaXMubmFtZSBdID0gdGhpcy52YWx1ZSB8fCAnJztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdCRmb3JtLmZpbmQoICdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl06bm90KDpjaGVja2VkKScgKS5lYWNoKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRpZiAoIHVuZGVmaW5lZCA9PT0gb2JqZWN0WyB0aGlzLm5hbWUgXSkge1xuXHRcdFx0XHRcdG9iamVjdFsgdGhpcy5uYW1lIF0gPSAnMCc7XG5cdFx0XHRcdH0gZWxzZSBpZiAoICcwJyA9PT0gb2JqZWN0WyB0aGlzLm5hbWUgXSkge1xuXHRcdFx0XHRcdG9iamVjdFsgdGhpcy5uYW1lIF0gPSBbXTtcblx0XHRcdFx0fSBlbHNlIGlmICggISAkLmlzQXJyYXkoIG9iamVjdFsgdGhpcy5uYW1lIF0pICkge1xuXHRcdFx0XHRcdG9iamVjdFsgdGhpcy5uYW1lIF0gPSBbIG9iamVjdFsgdGhpcy5uYW1lIF0gXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBvYmplY3Q7XG5cdFx0fVxuXG5cdH07XG5cblx0LyoqXG5cdCAqIE9uZSBjYWxsYmFjayB0byBydWxlIHRoZW0gYWxsLlxuXHQgKiBSZWNlaXZlcyB0aGUgZXZlbnRzIGZyb20gc2luZ2xlIG1vZHVsZSBhY3Rpb25zLlxuXHQgKiBDYWxsIGFub3RoZXIgY2FsbGJhY2sgb3IgZG9lcyBhbiBhY3Rpb24gKGVnLiBhIHJlZGlyZWN0KSBhY2NvcmRpbmcgdG8gdGhlIGFqYXggcmVxdWVzdCByZXNwb25zZS5cblx0ICogVXNlZCBpbiBtb2R1bGUgbGlzdGluZyBwYWdlcyBhbmQgZGFzaGJvYXJkLlxuXHQgKiBAc2luY2UgNC4wLjNcblx0ICovXG5cdE1vZHVsZS5oYW5kbGVBY3Rpb25zID0ge1xuXG5cdFx0Y29udGV4dDogJycsXG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBpbml0aWF0ZSB0aGUgYWN0aW9uLlxuXHRcdCAqIEBzaW5jZSA0LjAuM1xuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBlXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNvbnRleHQgV2hlcmUgaXQncyBjYWxsZWQgZnJvbS4gZGFzaGJvYXJkfGxpc3Rpbmdcblx0XHQgKi9cblx0XHRpbml0QWN0aW9uKCBlLCBjb250ZXh0LCByZWZlcnJlciApIHtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0cmVsYXRlZEZvcm1JZCA9ICR0aGlzLmRhdGEoICdmb3JtLWlkJyApLFxuXHRcdFx0XHRhY3Rpb25EYXRhID0gJHRoaXMuZGF0YSgpO1xuXG5cdFx0XHRsZXQgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG5cdFx0XHQvLyBHcmFiIHRoZSBmb3JtJ3MgZGF0YSBpZiB0aGUgYWN0aW9uIGhhcyBhIHJlbGF0ZWQgZm9ybS5cblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiByZWxhdGVkRm9ybUlkICkge1xuXHRcdFx0XHRjb25zdCAkZm9ybSA9ICQoICcjJyArIHJlbGF0ZWRGb3JtSWQgKTtcblxuXHRcdFx0XHRpZiAoICRmb3JtLmxlbmd0aCApIHtcblx0XHRcdFx0XHRkYXRhID0gbmV3IEZvcm1EYXRhKCAkZm9ybVswXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0JC5lYWNoKCBhY3Rpb25EYXRhLCAoIG5hbWUsIHZhbHVlICkgPT4gZGF0YS5hcHBlbmQoIG5hbWUsIHZhbHVlICkgKTtcblxuXHRcdFx0ZGF0YS5hcHBlbmQoICdjb250ZXh0JywgdGhpcy5jb250ZXh0ICk7XG5cdFx0XHRkYXRhLmFwcGVuZCggJ19hamF4X25vbmNlJywgb3B0aW5WYXJzLnNpbmdsZV9tb2R1bGVfYWN0aW9uX25vbmNlICk7XG5cdFx0XHRkYXRhLmFwcGVuZCggJ2FjdGlvbicsICdodXN0bGVfbW9kdWxlX2hhbmRsZV9zaW5nbGVfYWN0aW9uJyApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0Y29udGVudFR5cGU6IGZhbHNlLFxuXHRcdFx0XHRwcm9jZXNzRGF0YTogZmFsc2Vcblx0XHRcdH0pXG5cdFx0XHQuZG9uZSggcmVzID0+IHtcblxuXHRcdFx0XHQvLyBJZiB0aGVyZSdzIGEgZGVmaW5lZCBjYWxsYmFjaywgY2FsbCBpdC5cblx0XHRcdFx0aWYgKCByZXMuZGF0YS5jYWxsYmFjayAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2Ygc2VsZlsgcmVzLmRhdGEuY2FsbGJhY2sgXSkge1xuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYWxscyB0aGUgXCJhY3Rpb257IGh1c3RsZSBhY3Rpb24gfVwiIGZ1bmN0aW9ucyBmcm9tIHRoaXMgdmlldy5cblx0XHRcdFx0XHQvLyBGb3IgZXhhbXBsZTogYWN0aW9uVG9nZ2xlU3RhdHVzKCk7XG5cdFx0XHRcdFx0c2VsZlsgcmVzLmRhdGEuY2FsbGJhY2sgXSggJHRoaXMsIHJlcy5kYXRhLCByZXMuc3VjY2VzcyApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIHJlcy5kYXRhLmNhbGxiYWNrICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiByZWZlcnJlclsgcmVzLmRhdGEuY2FsbGJhY2sgXSkge1xuXHRcdFx0XHRcdHJlZmVycmVyWyByZXMuZGF0YS5jYWxsYmFjayBdKCAkdGhpcywgcmVzLmRhdGEsIHJlcy5zdWNjZXNzICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggcmVzLmRhdGEudXJsICkge1xuXHRcdFx0XHRcdGxvY2F0aW9uLnJlcGxhY2UoIHJlcy5kYXRhLnVybCApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIHJlcy5kYXRhLm5vdGlmaWNhdGlvbiApIHtcblxuXHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggcmVzLmRhdGEubm90aWZpY2F0aW9uLnN0YXR1cywgcmVzLmRhdGEubm90aWZpY2F0aW9uLm1lc3NhZ2UsIHJlcy5kYXRhLm5vdGlmaWNhdGlvbi5kZWxheSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRG9uJ3QgcmVtb3ZlIHRoZSAnbG9hZGluZycgaWNvbiB3aGVuIHJlZGlyZWN0aW5nL3JlbG9hZGluZy5cblx0XHRcdFx0aWYgKCAhIHJlcy5kYXRhLnVybCApIHtcblx0XHRcdFx0XHQkKCAnLnN1aS1idXR0b24tb25sb2FkJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuZXJyb3IoIHJlcyA9PiB7XG5cdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBpbml0QWN0aW9uIHN1Y2NjZXNzIGNhbGxiYWNrIGZvciBcInRvZ2dsZS10cmFja2luZ1wiLlxuXHRcdCAqIEBzaW5jZSA0LjAuM1xuXHRcdCAqL1xuXHRcdGFjdGlvblRvZ2dsZVRyYWNraW5nKCAkdGhpcywgZGF0YSApIHtcblxuXHRcdFx0aWYgKCAhIGRhdGEuaXNfZW1iZWRfb3Jfc3NoYXJlICkge1xuXG5cdFx0XHRcdGNvbnN0IGVuYWJsZWQgPSBkYXRhLndhc19lbmFibGVkID8gMSA6IDAsXG5cdFx0XHRcdFx0aXRlbSA9ICR0aGlzLnBhcmVudHMoICcuc3VpLWFjY29yZGlvbi1pdGVtJyApO1xuXG5cdFx0XHRcdCR0aGlzLmRhdGEoICdlbmFibGVkJywgMSAtIGVuYWJsZWQgKTtcblx0XHRcdFx0JHRoaXMuZmluZCggJ3NwYW4nICkudG9nZ2xlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHRcdC8vIHVwZGF0ZSB0cmFja2luZyBkYXRhXG5cdFx0XHRcdGlmICggaXRlbS5oYXNDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKSApIHtcblx0XHRcdFx0XHRpdGVtLmZpbmQoICcuc3VpLWFjY29yZGlvbi1vcGVuLWluZGljYXRvcicgKS50cmlnZ2VyKCAnY2xpY2snICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0bGV0ICRidXR0b24gPSAkKCAnLmh1c3RsZS1tYW5hZ2UtdHJhY2tpbmctYnV0dG9uW2RhdGEtbW9kdWxlLWlkPVwiJyArICR0aGlzLmRhdGEoICdtb2R1bGUtaWQnICkgKyAnXCJdJyApLFxuXHRcdFx0XHRcdGl0ZW0gPSAkYnV0dG9uLnBhcmVudHMoICcuc3VpLWFjY29yZGlvbi1pdGVtJyApO1xuXG5cdFx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tbWFuYWdlLXRyYWNraW5nJyBdLmhpZGUoKTtcblxuXHRcdFx0XHQkYnV0dG9uLmRhdGEoICd0cmFja2luZy10eXBlcycsIGRhdGEuZW5hYmxlZF90eXBlcyApO1xuXG5cdFx0XHRcdC8vIHVwZGF0ZSB0cmFja2luZyBkYXRhXG5cdFx0XHRcdGlmICggaXRlbS5oYXNDbGFzcyggJ3N1aS1hY2NvcmRpb24taXRlbS0tb3BlbicgKSApIHtcblx0XHRcdFx0XHRpdGVtLmZpbmQoICcuc3VpLWFjY29yZGlvbi1vcGVuLWluZGljYXRvcicgKS50cmlnZ2VyKCAnY2xpY2snICkudHJpZ2dlciggJ2NsaWNrJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ3N1Y2Nlc3MnLCBkYXRhLm1lc3NhZ2UsIDEwMDAwICk7XG5cdFx0fVxuXG5cdH07XG5cbn0oIGpRdWVyeSApICk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU1NoYXJlLkNvbnRlbnRfVmlldycsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEh1c3RsZS5WaWV3LmV4dGVuZChcblxuXHRcdF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9Db250ZW50JyApLCB7XG5cblx0XHRcdGVsOiAnI2h1c3RsZS13aXphcmQtY29udGVudCcsXG5cblx0XHRcdGFjdGl2ZVBsYXRmb3JtczogW10sXG5cblx0XHRcdGV2ZW50czoge1xuXG5cdFx0XHRcdCdjaGFuZ2Ugc2VsZWN0Lmh1c3RsZS1zZWxlY3QtZmllbGQtdmFyaWFibGVzJzogJ2FkZFBsYWNlaG9sZGVyVG9GaWVsZCcsXG5cdFx0XHRcdCdjbGljayB1bC53cG11ZGV2LXRhYnMtbWVudSBsaSBsYWJlbCc6ICd0b2dnbGVDaGVja2JveCcsXG5cblx0XHRcdFx0Ly8gT3BlbiBBZGQgUGxhdGZvcm1zIHBvcHVwXG5cdFx0XHRcdCdjbGljayAuaHVzdGxlLWNob29zZS1wbGF0Zm9ybXMnOiAnb3BlblBsYXRmb3Jtc01vZGFsJ1xuXHRcdFx0fSxcblx0XHRcdHJlbmRlcigpIHtcblx0XHRcdFx0Y29uc3QgbWUgPSB0aGlzLFxuXHRcdFx0XHRcdGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBkYXRhLnNvY2lhbF9pY29ucyAmJiBkYXRhLnNvY2lhbF9pY29ucyApIHtcblx0XHRcdFx0XHRmb3IgKCBsZXQgcGxhdGZvcm0gaW4gZGF0YS5zb2NpYWxfaWNvbnMgKSB7XG5cdFx0XHRcdFx0XHRtZS5hZGRQbGF0Zm9ybVRvUGFuZWwoIHBsYXRmb3JtLCBkYXRhLnNvY2lhbF9pY29uc1sgcGxhdGZvcm0gXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSW5pdGlhdGUgdGhlIHNvcnRhYmxlIGZ1bmN0aW9uYWxpdHkgdG8gc29ydCBmb3JtIHBsYXRmb3Jtcycgb3JkZXIuXG5cdFx0XHRcdGxldCBzb3J0YWJsZUNvbnRhaW5lciA9IHRoaXMuJCggJyNodXN0bGUtc29jaWFsLXNlcnZpY2VzJyApLnNvcnRhYmxlKHtcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y29udGFpbm1lbnQ6ICcuc3VpLWJveC1idWlsZGVyJ1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzb3J0YWJsZUNvbnRhaW5lci5vbiggJ3NvcnR1cGRhdGUnLCAkLnByb3h5KCBtZS5wbGF0Zm9ybXNPcmRlckNoYW5nZWQsIG1lLCBzb3J0YWJsZUNvbnRhaW5lciApICk7XG5cblx0XHRcdFx0Ly9hZGQgYWxsIHBsYXRmb3JtcyB0byBBZGQgUGxhdGZvcm1zIHBvcHVwXG5cdFx0XHRcdGZvciAoIGxldCBwbGF0Zm9ybSBpbiBvcHRpblZhcnMuc29jaWFsX3BsYXRmb3JtcyApIHtcblx0XHRcdFx0XHRtZS5hZGRQbGF0Zm9ybVRvRGlhbG9nKCBwbGF0Zm9ybSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5iaW5kUmVtb3ZlU2VydmljZSgpO1xuXG5cdFx0XHRcdGlmICggJ3RydWUnID09PSAgTW9kdWxlLlV0aWxzLmdldFVybFBhcmFtKCAnbmV3JyApICApIHtcblx0XHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oICdzdWNjZXNzJywgb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnMubW9kdWxlX2NyZWF0ZWQucmVwbGFjZSggL3t0eXBlX25hbWV9L2csIG9wdGluVmFycy5tb2R1bGVfbmFtZVsgdGhpcy5tb2R1bGVUeXBlIF0pLCAxMDAwMCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRiaW5kUmVtb3ZlU2VydmljZSgpIHtcblxuXHRcdFx0XHQvLyBEZWxldGUgU29jaWFsIFNlcnZpY2Vcblx0XHRcdFx0JCggJyNodXN0bGUtd2l6YXJkLWNvbnRlbnQgLmh1c3RsZS1yZW1vdmUtc29jaWFsLXNlcnZpY2UnICkub2ZmKCAnY2xpY2snICkub24oICdjbGljaycsICQucHJveHkoIHRoaXMucmVtb3ZlU2VydmljZSwgdGhpcyApICk7XG5cdFx0XHR9LFxuXG5cdFx0XHRvcGVuUGxhdGZvcm1zTW9kYWwoIGUgKSB7XG5cblx0XHRcdFx0bGV0IHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRcdHNhdmVkUGxhdGZvcm1zID0gdGhpcy5tb2RlbC5nZXQoICdzb2NpYWxfaWNvbnMnICksXG5cdFx0XHRcdFx0cGxhdGZvcm1zID0gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBzYXZlZFBsYXRmb3JtcyA/IE9iamVjdC5rZXlzKCBzYXZlZFBsYXRmb3JtcyApIDogW10sXG5cdFx0XHRcdFx0UGxhdGZvcm1zTW9kYWxWaWV3ID0gSHVzdGxlLmdldCggJ01vZGFscy5TZXJ2aWNlc19QbGF0Zm9ybXMnICksXG5cdFx0XHRcdFx0cGxhdGZvcm1zTW9kYWwgPSBuZXcgUGxhdGZvcm1zTW9kYWxWaWV3KCBwbGF0Zm9ybXMgKTtcblxuXHRcdFx0XHRwbGF0Zm9ybXNNb2RhbC5vbiggJ3BsYXRmb3JtczphZGRlZCcsICQucHJveHkoIHNlbGYuYWRkTmV3UGxhdGZvcm1zLCBzZWxmICkgKTtcblxuXHRcdFx0XHQvLyBTaG93IGRpYWxvZ1xuXHRcdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tYWRkLXBsYXRmb3JtcyddLnNob3coKTtcblx0XHRcdH0sXG5cblx0XHRcdGFkZE5ld1BsYXRmb3JtcyggcGxhdGZvcm1zICkge1xuXG5cdFx0XHRcdGlmICggISB0aGlzLm1vZGVsLmdldCggJ3NvY2lhbF9pY29ucycgKSApIHtcblx0XHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ3NvY2lhbF9pY29ucycsIHt9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBzZWxmID0gdGhpcyxcblx0XHRcdFx0XHRzYXZlZFBsYXRmb3JtcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLm1vZGVsLmdldCggJ3NvY2lhbF9pY29ucycgKSApO1xuXG5cdFx0XHRcdCQuZWFjaCggcGxhdGZvcm1zLCAoIGksIHBsYXRmb3JtICkgPT4ge1xuXHRcdFx0XHRcdGlmICggc2F2ZWRQbGF0Zm9ybXMgJiYgcGxhdGZvcm0gaW4gc2F2ZWRQbGF0Zm9ybXMgKSB7XG5cblx0XHRcdFx0XHRcdC8vSWYgdGhpcyBwbGF0Zm9ybSBpcyBhbHJlYWR5IHNldCwgYWJvcnQuIFByZXZlbnQgZHVwbGljYXRlZCBwbGF0Zm9ybXMuXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c2VsZi5hZGRQbGF0Zm9ybVRvUGFuZWwoIHBsYXRmb3JtLCB7fSk7XG5cdFx0XHRcdFx0bGV0IGRhdGEgPSB0aGlzLmdldFBsYXRmb3JtRGVmYXVsdHMoIHBsYXRmb3JtICk7XG5cdFx0XHRcdFx0c2F2ZWRQbGF0Zm9ybXNbIHBsYXRmb3JtIF0gPSBkYXRhO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmJpbmRSZW1vdmVTZXJ2aWNlKCk7XG5cblx0XHRcdFx0dGhpcy5tb2RlbC5zZXQoICdzb2NpYWxfaWNvbnMnLCBzYXZlZFBsYXRmb3JtcyApO1xuXG5cdFx0XHRcdEh1c3RsZS5FdmVudHMudHJpZ2dlciggJ3ZpZXcucmVuZGVyZWQnLCB0aGlzICk7XG5cblx0XHRcdH0sXG5cblx0XHRcdGFkZFBsYXRmb3JtVG9QYW5lbCggcGxhdGZvcm0sIGRhdGEgKSB7XG5cblx0XHRcdFx0bGV0IHRlbXBsYXRlID0gT3B0aW4udGVtcGxhdGUoICdodXN0bGUtcGxhdGZvcm0tcm93LXRwbCcgKSxcblx0XHRcdFx0XHQkcGxhdGZvcm1zQ29udGFpbmVyID0gdGhpcy4kKCAnI2h1c3RsZS1zb2NpYWwtc2VydmljZXMnICk7XG5cblx0XHRcdFx0ZGF0YSA9IF8uZXh0ZW5kKHt9LCB0aGlzLmdldFBsYXRmb3JtVmlld0RlZmF1bHRzKCBwbGF0Zm9ybSApLCBkYXRhICk7XG5cblx0XHRcdFx0dGhpcy5hY3RpdmVQbGF0Zm9ybXMucHVzaCggcGxhdGZvcm0gKTtcblxuXHRcdFx0XHQkcGxhdGZvcm1zQ29udGFpbmVyLmFwcGVuZCggdGVtcGxhdGUoIGRhdGEgKSApO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRhZGRQbGF0Zm9ybVRvRGlhbG9nKCBwbGF0Zm9ybSApIHtcblxuXHRcdFx0XHRsZXQgdGVtcGxhdGUgPSBPcHRpbi50ZW1wbGF0ZSggJ2h1c3RsZS1hZGQtcGxhdGZvcm0tbGktdHBsJyApLFxuXHRcdFx0XHRcdCRjb250YWluZXIgPSAkKCAnI2h1c3RsZV9hZGRfcGxhdGZvcm1zX2NvbnRhaW5lcicgKSxcblx0XHRcdFx0XHRkYXRhID0gdGhpcy5nZXRQbGF0Zm9ybVZpZXdEZWZhdWx0cyggcGxhdGZvcm0gKTtcblx0XHRcdFx0JGNvbnRhaW5lci5hcHBlbmQoIHRlbXBsYXRlKCBkYXRhICkgKTtcblx0XHRcdH0sXG5cblx0XHRcdGdldFBsYXRmb3JtRGVmYXVsdHMoIHBsYXRmb3JtICkge1xuXHRcdFx0XHRsZXQgbGFiZWwgPSBwbGF0Zm9ybSBpbiBvcHRpblZhcnMuc29jaWFsX3BsYXRmb3JtcyA/IG9wdGluVmFycy5zb2NpYWxfcGxhdGZvcm1zWyBwbGF0Zm9ybSBdIDogcGxhdGZvcm0sXG5cdFx0XHRcdFx0ZGVmYXVsdHMgPSB7XG5cdFx0XHRcdFx0XHRwbGF0Zm9ybTogcGxhdGZvcm0sXG5cdFx0XHRcdFx0XHRsYWJlbCxcblx0XHRcdFx0XHRcdHR5cGU6ICdjbGljaycsXG5cdFx0XHRcdFx0XHRjb3VudGVyOiAnMCcsXG5cdFx0XHRcdFx0XHRsaW5rOiAnJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKCAnZW1haWwnID09PSBwbGF0Zm9ybSApIHtcblx0XHRcdFx0XHRkZWZhdWx0cy50aXRsZSA9ICd7cG9zdF90aXRsZX0nO1xuXHRcdFx0XHRcdGRlZmF1bHRzLm1lc3NhZ2UgPSBvcHRpblZhcnMuc29jaWFsX3BsYXRmb3Jtc19kYXRhLmVtYWlsX21lc3NhZ2VfZGVmYXVsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBkZWZhdWx0cztcblx0XHRcdH0sXG5cblx0XHRcdGdldFBsYXRmb3JtVmlld0RlZmF1bHRzKCBwbGF0Zm9ybSApIHtcblxuXHRcdFx0XHRsZXQgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCksXG5cdFx0XHRcdFx0Y291bnRlckVuYWJsZWQgPSAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIGRhdGEuY291bnRlcl9lbmFibGVkID8gJ3RydWUnIDogZGF0YS5jb3VudGVyX2VuYWJsZWQsXG5cdFx0XHRcdFx0Y2hhbmdlZFN0eWxlcyA9IHsgJ2ZpdmVodW5kcmVkcHgnOiAnNTAwcHgnIH0sXG5cdFx0XHRcdFx0aGFzRW5kcG9pbnQgPSAtMSAhPT0gb3B0aW5WYXJzLnNvY2lhbF9wbGF0Zm9ybXNfd2l0aF9lbmRwb2ludHMuaW5kZXhPZiggcGxhdGZvcm0gKSxcblx0XHRcdFx0XHRoYXNDb3VudGVyID0gLTEgIT09IG9wdGluVmFycy5zb2NpYWxfcGxhdGZvcm1zX3dpdGhfYXBpLmluZGV4T2YoIHBsYXRmb3JtICk7XG5cblx0XHRcdFx0bGV0IHBsYXRmb3JtU3R5bGUgPSBwbGF0Zm9ybSBpbiBjaGFuZ2VkU3R5bGVzID8gY2hhbmdlZFN0eWxlc1sgcGxhdGZvcm0gXSA6IHBsYXRmb3JtLFxuXG5cdFx0XHRcdFx0dmlld0RlZmF1bHRzID0gXy5leHRlbmQoe30sIHRoaXMuZ2V0UGxhdGZvcm1EZWZhdWx0cyggcGxhdGZvcm0gKSwge1xuXHRcdFx0XHRcdFx0J3BsYXRmb3JtX3N0eWxlJzogcGxhdGZvcm1TdHlsZSxcblx0XHRcdFx0XHRcdCdjb3VudGVyX2VuYWJsZWQnOiBjb3VudGVyRW5hYmxlZCxcblx0XHRcdFx0XHRcdGhhc0VuZHBvaW50LFxuXHRcdFx0XHRcdFx0aGFzQ291bnRlclxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiB2aWV3RGVmYXVsdHM7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEFzc2lnbiB0aGUgbmV3IHBsYXRmb20gb3JkZXIgdG8gdGhlIG1vZGVsLiBUcmlnZ2VyZWQgd2hlbiB0aGUgcGxhdGZvcm1zIGFyZSBzb3J0ZWQuXG5cdFx0XHQgKiBAc2luY2UgNC4wXG5cdFx0XHQgKiBAcGFyYW0galF1ZXJ5IHNvcnRhYmxlIG9iamVjdFxuXHRcdFx0ICovXG5cdFx0XHRwbGF0Zm9ybXNPcmRlckNoYW5nZWQoIHNvcnRhYmxlICkge1xuXHRcdFx0XHRsZXQgcGxhdGZvcm1zID0gdGhpcy5tb2RlbC5nZXQoICdzb2NpYWxfaWNvbnMnICksXG5cdFx0XHRcdFx0bmV3T3JkZXIgPSBzb3J0YWJsZS5zb3J0YWJsZSggJ3RvQXJyYXknLCB7IGF0dHJpYnV0ZTogJ2RhdGEtcGxhdGZvcm0nIH0pLFxuXHRcdFx0XHRcdG9yZGVyZWRQbGF0Zm9ybXMgPSB7fTtcblxuXHRcdFx0XHRmb3IgKCBsZXQgaWQgb2YgbmV3T3JkZXIgKSB7XG5cdFx0XHRcdFx0b3JkZXJlZFBsYXRmb3Jtc1sgaWQgXSA9IHBsYXRmb3Jtc1sgaWQgXSA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ3NvY2lhbF9pY29ucycsIG9yZGVyZWRQbGF0Zm9ybXMgKTtcblxuXHRcdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cblx0XHRcdH0sXG5cblx0XHRcdHJlbW92ZVNlcnZpY2UoIGUgKSB7XG5cblx0XHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdFx0cGxhdGZvcm0gPSAgJHRoaXMuZGF0YSggJ3BsYXRmb3JtJyApLFxuXHRcdFx0XHRcdHNvY2lhbEljb25zID0gdGhpcy5tb2RlbC5nZXQoICdzb2NpYWxfaWNvbnMnICksXG5cdFx0XHRcdFx0JHBsYXRmb3JtQ29udGFpbmVyID0gdGhpcy4kKCAnI2h1c3RsZS1wbGF0Zm9ybS0nICsgcGxhdGZvcm0gKTtcblxuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIHBsYXRmb3JtIGNvbnRhaW5lciBmcm9tIHRoZSBwYWdlLlxuXHRcdFx0XHQkcGxhdGZvcm1Db250YWluZXIucmVtb3ZlKCk7XG5cblx0XHRcdFx0dGhpcy5hY3RpdmVQbGF0Zm9ybXMgPSBfLndpdGhvdXQoIHRoaXMuYWN0aXZlUGxhdGZvcm1zLCBwbGF0Zm9ybSApO1xuXG5cdFx0XHRcdGRlbGV0ZSBzb2NpYWxJY29uc1sgcGxhdGZvcm0gXTtcblxuXHRcdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2UnLCB0aGlzLm1vZGVsICk7XG5cblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdH0sXG5cblx0XHRcdG1vZGVsVXBkYXRlZCggZSApIHtcblx0XHRcdFx0dmFyIGNoYW5nZWQgPSBlLmNoYW5nZWQsXG5cdFx0XHRcdFx0c29jaWFsSWNvbnMsXG5cdFx0XHRcdFx0a2V5ID0gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBPYmplY3Qua2V5cyggY2hhbmdlZCApWzBdID8gT2JqZWN0LmtleXMoIGNoYW5nZWQgKVswXSA6ICcnO1xuXG5cdFx0XHRcdC8vIGZvciBzZXJ2aWNlX3R5cGVcblx0XHRcdFx0aWYgKCAnc2VydmljZV90eXBlJyBpbiBjaGFuZ2VkICkge1xuXHRcdFx0XHRcdHRoaXMuc2VydmljZVR5cGVVcGRhdGVkKCBjaGFuZ2VkLnNlcnZpY2VfdHlwZSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZm9yIGNsaWNrX2NvdW50ZXJcblx0XHRcdFx0aWYgKCAnY2xpY2tfY291bnRlcicgaW4gY2hhbmdlZCApIHtcblx0XHRcdFx0XHR0aGlzLmNsaWNrQ291bnRlclVwZGF0ZWQoIGNoYW5nZWQuY2xpY2tfY291bnRlciApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCAtMSAhPT0ga2V5LmluZGV4T2YoICdfY291bnRlcicgKSApIHtcblx0XHRcdFx0XHRsZXQgcGxhdGZvcm0gPSBrZXkuc2xpY2UoIDAsIC04ICk7XG5cdFx0XHRcdFx0c29jaWFsSWNvbnMgPSB0aGlzLm1vZGVsLmdldCggJ3NvY2lhbF9pY29ucycgKTtcblx0XHRcdFx0XHRpZiAoIHBsYXRmb3JtIGluIHNvY2lhbEljb25zICkge1xuXHRcdFx0XHRcdFx0c29jaWFsSWNvbnNbIHBsYXRmb3JtIF0uY291bnRlciA9IHBhcnNlSW50KCBjaGFuZ2VkWyBrZXkgXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMubW9kZWwudW5zZXQoIGtleSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAtMSAhPT0ga2V5LmluZGV4T2YoICdfbGluaycgKSApIHtcblx0XHRcdFx0XHRsZXQgcGxhdGZvcm0gPSBrZXkuc2xpY2UoIDAsIC01ICk7XG5cdFx0XHRcdFx0c29jaWFsSWNvbnMgPSB0aGlzLm1vZGVsLmdldCggJ3NvY2lhbF9pY29ucycgKTtcblx0XHRcdFx0XHRpZiAoIHBsYXRmb3JtIGluIHNvY2lhbEljb25zICkge1xuXHRcdFx0XHRcdFx0c29jaWFsSWNvbnNbIHBsYXRmb3JtIF0ubGluayA9IGNoYW5nZWRbIGtleSBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLm1vZGVsLnVuc2V0KCBrZXksIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggLTEgIT09IGtleS5pbmRleE9mKCAnX3R5cGUnICkgKSB7XG5cdFx0XHRcdFx0bGV0IHBsYXRmb3JtID0ga2V5LnNsaWNlKCAwLCAtNSApO1xuXHRcdFx0XHRcdHNvY2lhbEljb25zID0gdGhpcy5tb2RlbC5nZXQoICdzb2NpYWxfaWNvbnMnICk7XG5cdFx0XHRcdFx0aWYgKCBwbGF0Zm9ybSBpbiBzb2NpYWxJY29ucyApIHtcblx0XHRcdFx0XHRcdHNvY2lhbEljb25zWyBwbGF0Zm9ybSBdLnR5cGUgPSAnbmF0aXZlJyA9PT0gY2hhbmdlZFsga2V5IF0gPyAnbmF0aXZlJyA6ICdjbGljayc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMubW9kZWwudW5zZXQoIGtleSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAnZW1haWxfdGl0bGUnIGluIGNoYW5nZWQgKSB7XG5cdFx0XHRcdFx0bGV0IHBsYXRmb3JtID0gJ2VtYWlsJztcblx0XHRcdFx0XHRzb2NpYWxJY29ucyA9IHRoaXMubW9kZWwuZ2V0KCAnc29jaWFsX2ljb25zJyApO1xuXHRcdFx0XHRcdGlmICggcGxhdGZvcm0gaW4gc29jaWFsSWNvbnMgKSB7XG5cdFx0XHRcdFx0XHRzb2NpYWxJY29uc1sgcGxhdGZvcm0gXS50aXRsZSA9IGNoYW5nZWRbIGtleSBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLm1vZGVsLnVuc2V0KCBrZXksIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggJ2VtYWlsX21lc3NhZ2UnIGluIGNoYW5nZWQgKSB7XG5cdFx0XHRcdFx0bGV0IHBsYXRmb3JtID0gJ2VtYWlsJztcblx0XHRcdFx0XHRzb2NpYWxJY29ucyA9IHRoaXMubW9kZWwuZ2V0KCAnc29jaWFsX2ljb25zJyApO1xuXHRcdFx0XHRcdGlmICggcGxhdGZvcm0gaW4gc29jaWFsSWNvbnMgKSB7XG5cdFx0XHRcdFx0XHRzb2NpYWxJY29uc1sgcGxhdGZvcm0gXS5tZXNzYWdlID0gY2hhbmdlZFsga2V5IF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMubW9kZWwudW5zZXQoIGtleSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0sXG5cblx0XHRcdHNlcnZpY2VUeXBlVXBkYXRlZDogZnVuY3Rpb24oIHZhbCApIHtcblx0XHRcdFx0dmFyICRjb3VudGVyT3B0aW9ucyA9IHRoaXMuJCggJyN3cG11ZGV2LXNzaGFyZS1jb3VudGVyLW9wdGlvbnMnICksXG5cdFx0XHRcdFx0JG5hdGl2ZU9wdGlvbnMgPSAkKCAnLndwaC13aXphcmQtc2VydmljZXMtaWNvbnMtbmF0aXZlJyApLFxuXHRcdFx0XHRcdCRjdXN0b21PcHRpb25zID0gJCggJy53cGgtd2l6YXJkLXNlcnZpY2VzLWljb25zLWN1c3RvbScgKTtcblxuXHRcdFx0XHRpZiAoICduYXRpdmUnID09PSB2YWwgKSB7XG5cdFx0XHRcdFx0JGNvdW50ZXJPcHRpb25zLnJlbW92ZUNsYXNzKCAnd3BtdWRldi1oaWRkZW4nICk7XG5cdFx0XHRcdFx0JGN1c3RvbU9wdGlvbnMuYWRkQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKTtcblx0XHRcdFx0XHQkbmF0aXZlT3B0aW9ucy5yZW1vdmVDbGFzcyggJ3dwbXVkZXYtaGlkZGVuJyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRjb3VudGVyT3B0aW9ucy5hZGRDbGFzcyggJ3dwbXVkZXYtaGlkZGVuJyApO1xuXHRcdFx0XHRcdCRuYXRpdmVPcHRpb25zLmFkZENsYXNzKCAnd3BtdWRldi1oaWRkZW4nICk7XG5cdFx0XHRcdFx0JGN1c3RvbU9wdGlvbnMucmVtb3ZlQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0Y2xpY2tDb3VudGVyVXBkYXRlZDogZnVuY3Rpb24oIHZhbCApIHtcblxuXHRcdFx0XHR2YXIgJGNvdW50ZXJOb3RpY2UgPSAkKCAnI3dwbXVkZXYtc3NoYXJlLWNvdW50ZXItb3B0aW9ucyAuaHVzdGxlLXR3aXR0ZXItbm90aWNlJyApO1xuXHRcdFx0XHRpZiAoICduYXRpdmUnID09PSB2YWwgKSB7XG5cdFx0XHRcdFx0JGNvdW50ZXJOb3RpY2UucmVtb3ZlQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoICEgJGNvdW50ZXJOb3RpY2UuaGFzQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKSApIHtcblx0XHRcdFx0XHRcdCRjb3VudGVyTm90aWNlLmFkZENsYXNzKCAnd3BtdWRldi1oaWRkZW4nICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdCQoICcjd3BoLXdpemFyZC1zZXJ2aWNlcy1pY29ucy1uYXRpdmUgLndwbXVkZXYtc29jaWFsLWl0ZW0nICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyICRjaGVja2JveCA9ICQoIHRoaXMgKS5maW5kKCAnLnRvZ2dsZS1jaGVja2JveCcgKSxcblx0XHRcdFx0XHRcdGlzQ2hlY2tlZCA9ICRjaGVja2JveC5pcyggJzpjaGVja2VkJyApLFxuXHRcdFx0XHRcdFx0JGlucHV0Q291bnRlciA9ICQoIHRoaXMgKS5maW5kKCAnaW5wdXQud3BtdWRldi1pbnB1dF9udW1iZXInICk7XG5cblx0XHRcdFx0XHRpZiAoICdub25lJyAhPT0gdmFsICYmIGlzQ2hlY2tlZCApIHtcblx0XHRcdFx0XHRcdCRpbnB1dENvdW50ZXIucmVtb3ZlQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKCAhICRpbnB1dENvdW50ZXIuaGFzQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKSApIHtcblx0XHRcdFx0XHRcdFx0JGlucHV0Q291bnRlci5hZGRDbGFzcyggJ3dwbXVkZXYtaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JCggJyN3cGgtd2l6YXJkLXNlcnZpY2VzLWljb25zLW5hdGl2ZSAjd3BtdWRldi1jb3VudGVyLXRpdGxlPnN0cm9uZycgKS5yZW1vdmVDbGFzcyggJ3dwbXVkZXYtaGlkZGVuJyApO1xuXHRcdFx0XHRpZiAoICdub25lJyA9PT0gdmFsICkge1xuXHRcdFx0XHRcdCQoICcjd3BoLXdpemFyZC1zZXJ2aWNlcy1pY29ucy1uYXRpdmUgI3dwbXVkZXYtY291bnRlci10aXRsZT5zdHJvbmc6Zmlyc3QtY2hpbGQnICkuYWRkQ2xhc3MoICd3cG11ZGV2LWhpZGRlbicgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI3dwaC13aXphcmQtc2VydmljZXMtaWNvbnMtbmF0aXZlICN3cG11ZGV2LWNvdW50ZXItdGl0bGU+c3Ryb25nOm50aC1jaGlsZCgyKScgKS5hZGRDbGFzcyggJ3dwbXVkZXYtaGlkZGVuJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHR0b2dnbGVDaGVja2JveDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHRcdFx0XHQkbGkgPSAkdGhpcy5jbG9zZXN0KCAnbGknICksXG5cdFx0XHRcdFx0JGlucHV0ID0gJGxpLmZpbmQoICdpbnB1dCcgKSxcblx0XHRcdFx0XHRwcm9wID0gJGlucHV0LmRhdGEoICdhdHRyaWJ1dGUnICk7XG5cblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0XHRcdGlmICggJGxpLmhhc0NsYXNzKCAnY3VycmVudCcgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkbGkuYWRkQ2xhc3MoICdjdXJyZW50JyApO1xuXHRcdFx0XHQkbGkuc2libGluZ3MoKS5yZW1vdmVDbGFzcyggJ2N1cnJlbnQnICk7XG5cdFx0XHRcdHRoaXMubW9kZWwuc2V0KCBwcm9wLCAkaW5wdXQudmFsKCkgKTtcblxuXHRcdFx0fSxcblxuXHRcdFx0c2V0U29jaWFsSWNvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc2VydmljZXMgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdFx0XHRzZXJ2aWNlcyA9IHRoaXMuZ2V0U29jaWFsSWNvbnNEYXRhKCBzZXJ2aWNlcyApO1xuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCggJ3NvY2lhbF9pY29ucycsIHNlcnZpY2VzLnNvY2lhbF9pY29ucywgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRnZXRTb2NpYWxJY29uc0RhdGE6IGZ1bmN0aW9uKCBzZXJ2aWNlcyApIHtcblxuXHRcdFx0XHR2YXIgJHNvY2lhbENvbnRhaW5lcnMgPSAkKCAnI3dwaC13aXphcmQtc2VydmljZXMtaWNvbnMtJyArIHNlcnZpY2VzWydzZXJ2aWNlX3R5cGUnXSArICcgLndwbXVkZXYtc29jaWFsLWl0ZW0nICksXG5cdFx0XHRcdFx0c29jaWFsSWNvbnMgPSB7fTtcblxuXHRcdFx0XHQkc29jaWFsQ29udGFpbmVycy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgJHNjID0gJCggdGhpcyApLFxuXHRcdFx0XHRcdFx0JHRvZ2dsZUlucHV0ID0gJHNjLmZpbmQoICdpbnB1dC50b2dnbGUtY2hlY2tib3gnICksXG5cdFx0XHRcdFx0XHRpY29uID0gJHRvZ2dsZUlucHV0LmRhdGEoICdpZCcgKSxcblx0XHRcdFx0XHRcdCRjb3VudGVyID0gJHNjLmZpbmQoICdpbnB1dC53cG11ZGV2LWlucHV0X251bWJlcicgKSxcblx0XHRcdFx0XHRcdCRsaW5rID0gJHNjLmZpbmQoICdpbnB1dC53cG11ZGV2LWlucHV0X3RleHQnICk7XG5cblx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIGNvdW50ZXIgaGF2ZSBuZWdhdGl2ZSB2YWx1ZXNcblx0XHRcdFx0XHRcdGlmICggJGNvdW50ZXIubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRsZXQgY291bnRlclZhbCA9IHBhcnNlSW50KCAkY291bnRlci52YWwoKSApO1xuXHRcdFx0XHRcdFx0XHRpZiAoIDAgPiBjb3VudGVyVmFsICkge1xuXHRcdFx0XHRcdFx0XHRcdCRjb3VudGVyLnZhbCggMCApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggJHRvZ2dsZUlucHV0LmlzKCAnOmNoZWNrZWQnICkgKSB7XG5cdFx0XHRcdFx0XHRcdHNvY2lhbEljb25zW2ljb25dID0ge1xuXHRcdFx0XHRcdFx0XHRcdCdlbmFibGVkJzogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHQnY291bnRlcic6ICggJGNvdW50ZXIubGVuZ3RoICkgPyAkY291bnRlci52YWwoKSA6ICcwJyxcblx0XHRcdFx0XHRcdFx0XHQnbGluayc6ICggJGxpbmsubGVuZ3RoICkgPyAkbGluay52YWwoKSA6ICcnXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKCAkc29jaWFsQ29udGFpbmVycy5sZW5ndGggKSB7XG5cdFx0XHRcdFx0c2VydmljZXNbJ3NvY2lhbF9pY29ucyddID0gc29jaWFsSWNvbnM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gc2VydmljZXM7XG5cdFx0XHR9LFxuXG5cdFx0XHRhZGRQbGFjZWhvbGRlclRvRmllbGQoIGUgKSB7XG5cblx0XHRcdFx0Y29uc3QgJHNlbGVjdCA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRcdHNlbGVjdGVkUGxhY2Vob2xkZXIgPSAkc2VsZWN0LnZhbCgpLFxuXHRcdFx0XHRcdHRhcmdldElucHV0TmFtZSA9ICRzZWxlY3QuZGF0YSggJ2ZpZWxkJyApLFxuXHRcdFx0XHRcdCRpbnB1dCA9ICQoIGBbbmFtZT1cIiR7IHRhcmdldElucHV0TmFtZSB9XCJdYCApLFxuXHRcdFx0XHRcdHZhbCA9ICRpbnB1dC52YWwoKSArIHNlbGVjdGVkUGxhY2Vob2xkZXI7XG5cblx0XHRcdFx0JGlucHV0LnZhbCggdmFsICkudHJpZ2dlciggJ2NoYW5nZScgKTtcblx0XHRcdH1cblx0XHR9XG5cdCkgKTtcblxufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU1NoYXJlLkRlc2lnbl9WaWV3JywgZnVuY3Rpb24oICQsIGRvYywgd2luICkge1xuXHQndXNlIHN0cmljdCc7XG5cdHJldHVybiBIdXN0bGUuVmlldy5leHRlbmQoXG5cblx0XHRfLmV4dGVuZCh7fSwgSHVzdGxlLmdldCggJ01peGlucy5Nb2RlbF9VcGRhdGVyJyApLCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9EZXNpZ24nICksIHtcblxuXHRcdFx0Ly9iZWZvcmVSZW5kZXIoKSB7XG5cblx0XHRcdC8vXHQvLyBVcGRhdGUgdGhlIEFwcGVhcmFuY2UgdGFiIHZpZXcgd2hlbiB0aGUgZGlzcGxheSB0eXBlcyBhcmUgY2hhbmdlZCBpbiB0aGUgRGlzcGxheSB0YWIuXG5cdFx0XHQvL1x0SHVzdGxlLkV2ZW50cy5vZmYoICdtb2R1bGVzLnZpZXcuZGlzcGxheVR5cGVVcGRhdGVkJyApLm9uKCAnbW9kdWxlcy52aWV3LmRpc3BsYXlUeXBlVXBkYXRlZCcsICQucHJveHkoIHRoaXMudmlld0NoYW5nZWREaXNwbGF5VGFiLCB0aGlzICkgKTtcblx0XHRcdC8vfSxcblxuXHRcdFx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHQvL2lmICggdGhpcy50YXJnZXRDb250YWluZXIubGVuZ3RoICkge1xuXHRcdFx0XHRcdHRoaXMuY3JlYXRlUGlja2VycygpO1xuXG5cdFx0XHRcdC8vfVxuXG5cdFx0XHRcdEh1c3RsZS5FdmVudHMub2ZmKCAnbW9kdWxlcy52aWV3LmRpc3BsYXlUeXBlVXBkYXRlZCcgKS5vbiggJ21vZHVsZXMudmlldy5kaXNwbGF5VHlwZVVwZGF0ZWQnLCAkLnByb3h5KCB0aGlzLnZpZXdDaGFuZ2VkRGlzcGxheVRhYiwgdGhpcyApICk7XG5cblx0XHRcdFx0Ly8gVHJpZ2dlciBwcmV2aWV3IHdoZW4gdGhpcyB0YWIgaXMgc2hvd24uXG5cdFx0XHRcdCQoICdhW2RhdGEtdGFiPVwiYXBwZWFyYW5jZVwiXScgKS5vbiggJ2NsaWNrJywgJC5wcm94eSggdGhpcy51cGRhdGVQcmV2aWV3LCB0aGlzICkgKTtcblx0XHRcdFx0JCggJy5zdWktYm94W2RhdGEtdGFiPVwiZGlzcGxheVwiXSAuc3VpLWJ1dHRvbltkYXRhLWRpcmVjdGlvbj1cIm5leHRcIicgKS5vbiggJ2NsaWNrJywgJC5wcm94eSggdGhpcy51cGRhdGVQcmV2aWV3LCB0aGlzICkgKTtcblx0XHRcdFx0JCggJy5zdWktYm94W2RhdGEtdGFiPVwidmlzaWJpbGl0eVwiXSAuc3VpLWJ1dHRvbltkYXRhLWRpcmVjdGlvbj1cInByZXZcIicgKS5vbiggJ2NsaWNrJywgJC5wcm94eSggdGhpcy51cGRhdGVQcmV2aWV3LCB0aGlzICkgKTtcblxuXHRcdFx0XHR0aGlzLnVwZGF0ZVByZXZpZXcoKTtcblx0XHRcdH0sXG5cblx0XHRcdHVwZGF0ZVByZXZpZXc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCAnI2h1aS1wcmV2aWV3LXNvY2lhbC1zaGFyZXMtZmxvYXRpbmcnICkudHJpZ2dlciggJ2h1c3RsZV91cGRhdGVfcHJld2lldicgKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIEFkanVzdCB0aGUgdmlldyB3aGVuIG1vZGVsIGlzIHVwZGF0ZWRcblx0XHRcdHZpZXdDaGFuZ2VkOiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cblx0XHRcdFx0bGV0IGNoYW5nZWQgPSBtb2RlbC5jaGFuZ2VkO1xuXG5cdFx0XHRcdGlmICggJ2ZsYXQnID09PSBtb2RlbC5nZXQoICdpY29uX3N0eWxlJyApICkge1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWZsb2F0aW5nLWljb25zLWN1c3RvbS1iYWNrZ3JvdW5kJyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS13aWRnZXQtaWNvbnMtY3VzdG9tLWJhY2tncm91bmQnICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWZsb2F0aW5nLWljb25zLWN1c3RvbS1iYWNrZ3JvdW5kJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS13aWRnZXQtaWNvbnMtY3VzdG9tLWJhY2tncm91bmQnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCAnb3V0bGluZScgPT09IG1vZGVsLmdldCggJ2ljb25fc3R5bGUnICkgKSB7XG5cblx0XHRcdFx0XHQvLyBSZXBsYWNlIFwiaWNvbiBiYWNrZ3JvdW5kXCIgdGV4dCB3aXRoIFwiaWNvbiBib3JkZXJcIlxuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWZsb2F0aW5nLWljb25zLWN1c3RvbS1iYWNrZ3JvdW5kIC5zdWktbGFiZWwnICkudGV4dCggJ0ljb24gYm9yZGVyJyApO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLXdpZGdldC1pY29ucy1jdXN0b20tYmFja2dyb3VuZCAuc3VpLWxhYmVsJyApLnRleHQoICdJY29uIGJvcmRlcicgKTtcblxuXHRcdFx0XHRcdC8vIEhpZGUgY291bnRlciBib3JkZXIgY29sb3Jcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1mbG9hdGluZy1jb3VudGVyLWJvcmRlcicgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0JCggJyNodXN0bGUtd2lkZ2V0LWNvdW50ZXItYm9yZGVyJyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIFJlcGxhY2UgXCJpY29uIGJvcmRlclwiIHRleHQgd2l0aCBcImljb24gYmFja2dyb3VuZFwiXG5cdFx0XHRcdFx0JCggJyNodXN0bGUtZmxvYXRpbmctaWNvbnMtY3VzdG9tLWJhY2tncm91bmQgLnN1aS1sYWJlbCcgKS50ZXh0KCAnSWNvbiBiYWNrZ3JvdW5kJyApO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLXdpZGdldC1pY29ucy1jdXN0b20tYmFja2dyb3VuZCAuc3VpLWxhYmVsJyApLnRleHQoICdJY29uIGJhY2tncm91bmQnICk7XG5cblx0XHRcdFx0XHQvLyBTaG93IGNvdW50ZXIgYm9yZGVyIGNvbG9yXG5cdFx0XHRcdFx0JCggJyNodXN0bGUtZmxvYXRpbmctY291bnRlci1ib3JkZXInICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLXdpZGdldC1jb3VudGVyLWJvcmRlcicgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnVwZGF0ZVByZXZpZXcoKTtcblxuXHRcdFx0fSxcblxuXHRcdFx0dmlld0NoYW5nZWREaXNwbGF5VGFiKCBtb2RlbCApIHtcblxuXHRcdFx0XHRjb25zdCBpbmxpbmUgPSBtb2RlbC5nZXQoICdpbmxpbmVfZW5hYmxlZCcgKSxcblx0XHRcdFx0XHR3aWRnZXQgPSBtb2RlbC5nZXQoICd3aWRnZXRfZW5hYmxlZCcgKSxcblx0XHRcdFx0XHRzaG9ydGNvZGUgPSBtb2RlbC5nZXQoICdzaG9ydGNvZGVfZW5hYmxlZCcgKSxcblx0XHRcdFx0XHRmbG9hdERlc2t0b3AgPSBtb2RlbC5nZXQoICdmbG9hdF9kZXNrdG9wX2VuYWJsZWQnICksXG5cdFx0XHRcdFx0ZmxvYXRNb2JpbGUgPSBtb2RlbC5nZXQoICdmbG9hdF9tb2JpbGVfZW5hYmxlZCcgKSxcblx0XHRcdFx0XHRpc1dpZGdldEVuYWJsZWQgPSAoIF8uaW50ZXJzZWN0aW9uKFsgMSwgJzEnLCAndHJ1ZScgXSwgWyBpbmxpbmUsIHdpZGdldCwgc2hvcnRjb2RlIF0pICkubGVuZ3RoLFxuXHRcdFx0XHRcdGlzRmxvYXRpbmdFbmFibGVkID0gKCBfLmludGVyc2VjdGlvbihbIDEsICcxJywgJ3RydWUnIF0sIFsgZmxvYXRNb2JpbGUsIGZsb2F0RGVza3RvcCBdKSApLmxlbmd0aDtcblxuXHRcdFx0XHQvLyBUT0RPOiB3ZSBzaG91bGQgYmUgdXNpbmcgdGhpcy4kKCAnLi4uJyApIGhlcmUgaW5zdGVhZC5cblx0XHRcdFx0aWYgKCBpc0Zsb2F0aW5nRW5hYmxlZCApIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWZsb2F0aW5nLWljb25zLXJvdycgKS5zaG93KCk7XG5cdFx0XHRcdFx0JCggJyNodXN0bGUtYXBwZWFyYW5jZS1mbG9hdGluZy1pY29ucy1wbGFjZWhvbGRlcicgKS5oaWRlKCk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWZsb2F0aW5nLWljb25zLXJvdycgKS5oaWRlKCk7XG5cdFx0XHRcdFx0JCggJyNodXN0bGUtYXBwZWFyYW5jZS1mbG9hdGluZy1pY29ucy1wbGFjZWhvbGRlcicgKS5zaG93KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGlzV2lkZ2V0RW5hYmxlZCApIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLXdpZGdldC1pY29ucy1yb3cnICkuc2hvdygpO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWFwcGVhcmFuY2Utd2lkZ2V0LWljb25zLXBsYWNlaG9sZGVyJyApLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLXdpZGdldC1pY29ucy1yb3cnICkuaGlkZSgpO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWFwcGVhcmFuY2Utd2lkZ2V0LWljb25zLXBsYWNlaG9sZGVyJyApLnNob3coKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggISBpc1dpZGdldEVuYWJsZWQgJiYgISBpc0Zsb2F0aW5nRW5hYmxlZCApIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWljb25zLXN0eWxlJyApLmhpZGUoKTtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWVtcHR5LW1lc3NhZ2UnICkuc2hvdygpO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWFwcGVhcmFuY2UtZmxvYXRpbmctaWNvbnMtcGxhY2Vob2xkZXInICkuaGlkZSgpO1xuXHRcdFx0XHRcdCQoICcjaHVzdGxlLWFwcGVhcmFuY2Utd2lkZ2V0LWljb25zLXBsYWNlaG9sZGVyJyApLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWljb25zLXN0eWxlJyApLnNob3coKTtcblx0XHRcdFx0XHQkKCAnI2h1c3RsZS1hcHBlYXJhbmNlLWVtcHR5LW1lc3NhZ2UnICkuaGlkZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9KVxuXHQpO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU1NoYXJlLkRpc3BsYXlfVmlldycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEh1c3RsZS5WaWV3LmV4dGVuZChcblx0XHRfLmV4dGVuZCh7fSwgSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfRGlzcGxheScgKSwge1xuXG5cdFx0XHR2aWV3Q2hhbmdlZCggY2hhbmdlZCApIHtcblxuXHRcdFx0XHRpZiAoICggXy5pbnRlcnNlY3Rpb24oWyAnZmxvYXRfZGVza3RvcF9lbmFibGVkJywgJ2Zsb2F0X21vYmlsZV9lbmFibGVkJywgJ2lubGluZV9lbmFibGVkJywgJ3dpZGdldF9lbmFibGVkJywgJ3Nob3J0Y29kZV9lbmFibGVkJyBdLCBPYmplY3Qua2V5cyggY2hhbmdlZCApICkgKS5sZW5ndGggKSB7XG5cblx0XHRcdFx0XHQvLyBTaG93L2hpZGUgc29tZSBzZXR0aW5ncyBpbiB0aGUgQXBwZWFyYW5jZSB0YWIuXG5cdFx0XHRcdFx0SHVzdGxlLkV2ZW50cy50cmlnZ2VyKCAnbW9kdWxlcy52aWV3LmRpc3BsYXlUeXBlVXBkYXRlZCcsIHRoaXMubW9kZWwgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCAnZmxvYXRfZGVza3RvcF9wb3NpdGlvbicgaW4gY2hhbmdlZCApIHtcblxuXHRcdFx0XHRcdGlmICggJ3JpZ2h0JyA9PT0gY2hhbmdlZC5mbG9hdF9kZXNrdG9wX3Bvc2l0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLWxlZnQtb2Zmc2V0LWxhYmVsJyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZmxvYXRfZGVza3RvcC1yaWdodC1vZmZzZXQtbGFiZWwnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLW9mZnNldC14LXdyYXBwZXInICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggJ2xlZnQnID09PSBjaGFuZ2VkLmZsb2F0X2Rlc2t0b3BfcG9zaXRpb24gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X2Rlc2t0b3AtbGVmdC1vZmZzZXQtbGFiZWwnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLXJpZ2h0LW9mZnNldC1sYWJlbCcgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X2Rlc2t0b3Atb2Zmc2V0LXgtd3JhcHBlcicgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLW9mZnNldC14LXdyYXBwZXInICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2UgaWYgKCAnZmxvYXRfZGVza3RvcF9wb3NpdGlvbl95JyBpbiBjaGFuZ2VkICkge1xuXG5cdFx0XHRcdFx0aWYgKCAnYm90dG9tJyA9PT0gY2hhbmdlZC5mbG9hdF9kZXNrdG9wX3Bvc2l0aW9uX3kgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X2Rlc2t0b3AtdG9wLW9mZnNldC1sYWJlbCcgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X2Rlc2t0b3AtYm90dG9tLW9mZnNldC1sYWJlbCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLXRvcC1vZmZzZXQtbGFiZWwnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9kZXNrdG9wLWJvdHRvbS1vZmZzZXQtbGFiZWwnICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2UgaWYgKCAnZmxvYXRfbW9iaWxlX3Bvc2l0aW9uJyBpbiBjaGFuZ2VkICkge1xuXG5cdFx0XHRcdFx0aWYgKCAncmlnaHQnID09PSBjaGFuZ2VkLmZsb2F0X21vYmlsZV9wb3NpdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZmxvYXRfbW9iaWxlLWxlZnQtb2Zmc2V0LWxhYmVsJyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZmxvYXRfbW9iaWxlLXJpZ2h0LW9mZnNldC1sYWJlbCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X21vYmlsZS1vZmZzZXQteC13cmFwcGVyJyApLnJlbW92ZUNsYXNzKCAnc3VpLWhpZGRlbicgKTtcblxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoICdsZWZ0JyA9PT0gY2hhbmdlZC5mbG9hdF9tb2JpbGVfcG9zaXRpb24gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X21vYmlsZS1sZWZ0LW9mZnNldC1sYWJlbCcgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X21vYmlsZS1yaWdodC1vZmZzZXQtbGFiZWwnICkuYWRkQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9tb2JpbGUtb2Zmc2V0LXgtd3JhcHBlcicgKS5yZW1vdmVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9tb2JpbGUtb2Zmc2V0LXgtd3JhcHBlcicgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSBpZiAoICdmbG9hdF9tb2JpbGVfcG9zaXRpb25feScgaW4gY2hhbmdlZCApIHtcblxuXHRcdFx0XHRcdGlmICggJ2JvdHRvbScgPT09IGNoYW5nZWQuZmxvYXRfbW9iaWxlX3Bvc2l0aW9uX3kgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLiQoICcjaHVzdGxlLWZsb2F0X21vYmlsZS10b3Atb2Zmc2V0LWxhYmVsJyApLmFkZENsYXNzKCAnc3VpLWhpZGRlbicgKTtcblx0XHRcdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZmxvYXRfbW9iaWxlLWJvdHRvbS1vZmZzZXQtbGFiZWwnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuJCggJyNodXN0bGUtZmxvYXRfbW9iaWxlLXRvcC1vZmZzZXQtbGFiZWwnICkucmVtb3ZlQ2xhc3MoICdzdWktaGlkZGVuJyApO1xuXHRcdFx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1mbG9hdF9tb2JpbGUtYm90dG9tLW9mZnNldC1sYWJlbCcgKS5hZGRDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxuXHQpO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnTW9kYWxzLlNlcnZpY2VzX1BsYXRmb3JtcycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0cmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnI2h1c3RsZS1kaWFsb2ctLWFkZC1wbGF0Zm9ybXMnLFxuXG5cdFx0c2VsZWN0ZWRQbGF0Zm9ybXM6IFtdLFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLnN1aS1ib3gtc2VsZWN0b3IgaW5wdXQnOiAnc2VsZWN0UGxhdGZvcm1zJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLWNhbmNlbC1wbGF0Zm9ybXMnOiAnY2FuY2VsUGxhdGZvcm1zJyxcblx0XHRcdCdjbGljayAuc3VpLWRpYWxvZy1vdmVybGF5JzogJ2NhbmNlbFBsYXRmb3JtcycsXG5cblx0XHRcdC8vQWRkIHBsYXRmb3Jtc1xuXHRcdFx0J2NsaWNrICNodXN0bGUtYWRkLXBsYXRmb3Jtcyc6ICdhZGRQbGF0Zm9ybXMnXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBwbGF0Zm9ybXMgKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGVkUGxhdGZvcm1zID0gcGxhdGZvcm1zO1xuXG5cdFx0XHR0aGlzLiQoICcuaHVzdGxlLWFkZC1wbGF0Zm9ybXMtb3B0aW9uJyApLnByb3AoICdjaGVja2VkJywgZmFsc2UgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXG5cdFx0XHRmb3IgKCBsZXQgcGxhdGZvcm0gb2YgdGhpcy5zZWxlY3RlZFBsYXRmb3JtcyApIHtcblx0XHRcdFx0dGhpcy4kKCAnI2h1c3RsZS1zb2NpYWwtLScgKyBwbGF0Zm9ybSApLnByb3AoICdjaGVja2VkJywgdHJ1ZSApLnByb3AoICdkaXNhYmxlZCcsIHRydWUgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c2VsZWN0UGxhdGZvcm1zOiBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0bGV0ICRpbnB1dCA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHRcdFx0JHNlbGVjdG9yTGFiZWwgID0gdGhpcy4kZWwuZmluZCggJ2xhYmVsW2Zvcj1cIicgKyAkaW5wdXQuYXR0ciggJ2lkJyApICsgJ1wiXScgKSxcblx0XHRcdFx0dmFsdWUgPSAkaW5wdXQudmFsKClcblx0XHRcdFx0O1xuXG5cdFx0XHQkc2VsZWN0b3JMYWJlbC50b2dnbGVDbGFzcyggJ3NlbGVjdGVkJyApO1xuXG5cdFx0XHRpZiAoICRpbnB1dC5wcm9wKCAnY2hlY2tlZCcgKSApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZFBsYXRmb3Jtcy5wdXNoKCB2YWx1ZSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZFBsYXRmb3JtcyA9IF8ud2l0aG91dCggdGhpcy5zZWxlY3RlZFBsYXRmb3JtcywgdmFsdWUgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y2hlY2tQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Zm9yICggbGV0IHBsYXRmb3JtIG9mIHRoaXMuc2VsZWN0ZWRQbGF0Zm9ybXMgKSB7XG5cdFx0XHRcdGlmICggISB0aGlzLiQoICcjaHVzdGxlLXNvY2lhbC0tJyArIHBsYXRmb3JtICkucHJvcCggJ2NoZWNrZWQnICkgKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWxlY3RlZFBsYXRmb3JtcyA9IF8ud2l0aG91dCggdGhpcy5zZWxlY3RlZFBsYXRmb3JtcywgcGxhdGZvcm0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjYW5jZWxQbGF0Zm9ybXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQvLyBIaWRlIGRpYWxvZ1xuXHRcdFx0U1VJLmRpYWxvZ3NbICdodXN0bGUtZGlhbG9nLS1hZGQtcGxhdGZvcm1zJyBdLmhpZGUoKTtcblxuXHRcdH0sXG5cblx0XHRhZGRQbGF0Zm9ybXM6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0bGV0ICRidXR0b24gICA9IHRoaXMuJCggZS50YXJnZXQgKTtcblx0XHRcdCRidXR0b24uYWRkQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdHRoaXMuY2hlY2tQbGF0Zm9ybXMoKTtcblx0XHRcdHRoaXMudHJpZ2dlciggJ3BsYXRmb3JtczphZGRlZCcsIHRoaXMuc2VsZWN0ZWRQbGF0Zm9ybXMgKTtcblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdC8vIEhpZGUgZGlhbG9nXG5cdFx0XHRcdFNVSS5kaWFsb2dzWyAnaHVzdGxlLWRpYWxvZy0tYWRkLXBsYXRmb3JtcycgXS5oaWRlKCk7XG5cdFx0XHRcdCRidXR0b24ucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdH0sIDUwMCApO1xuXHRcdH1cblxuXHR9KTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ1NTaGFyZS5WaWV3JywgZnVuY3Rpb24oICQgKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXHRyZXR1cm4gSHVzdGxlLlZpZXcuZXh0ZW5kKFxuXHRcdF8uZXh0ZW5kKHt9LCBIdXN0bGUuZ2V0KCAnTWl4aW5zLldpemFyZF9WaWV3JyApLCB7XG5cblx0XHRcdF9ldmVudHM6IHtcblx0XHRcdFx0J2h1c3RsZV91cGRhdGVfcHJld2lldiAjaHVpLXByZXZpZXctc29jaWFsLXNoYXJlcy1mbG9hdGluZyc6ICd1cGRhdGVQcmV2aWV3J1xuXHRcdFx0fSxcblxuXHRcdFx0dXBkYXRlUHJldmlldyggZSApIHtcblx0XHRcdFx0dmFyIHByZXZpZXdEYXRhID0gXy5leHRlbmQoe30sIHRoaXMubW9kZWwudG9KU09OKCksIHRoaXMuZ2V0RGF0YVRvU2F2ZSgpICk7XG5cblx0XHRcdFx0JC5hamF4KHtcblx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uOiAnaHVzdGxlX3ByZXZpZXdfbW9kdWxlJyxcblx0XHRcdFx0XHRcdGlkOiB0aGlzLm1vZGVsLmdldCggJ21vZHVsZV9pZCcgKSxcblx0XHRcdFx0XHRcdHByZXZpZXdEYXRhOiBwcmV2aWV3RGF0YVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oIHJlcyApIHtcblx0XHRcdFx0XHRcdGlmICggcmVzLnN1Y2Nlc3MgKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0ICRmbG9hdGluZ0NvbnRhaW5lciA9ICQoICcjaHVpLXByZXZpZXctc29jaWFsLXNoYXJlcy1mbG9hdGluZycgKSxcblx0XHRcdFx0XHRcdFx0XHQkd2lkZ2V0Q29udGFpbmVyID0gJCggJyNodWktcHJldmlldy1zb2NpYWwtc2hhcmVzLXdpZGdldCcgKTtcblx0XHRcdFx0XHRcdFx0JGZsb2F0aW5nQ29udGFpbmVyLmh0bWwoIHJlcy5kYXRhLmZsb2F0aW5nSHRtbCApO1xuXHRcdFx0XHRcdFx0XHQkd2lkZ2V0Q29udGFpbmVyLmh0bWwoIHJlcy5kYXRhLndpZGdldEh0bWwgKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIHJlcy5kYXRhLnN0eWxlICkge1xuXHRcdFx0XHRcdFx0XHRcdCRmbG9hdGluZ0NvbnRhaW5lci5hcHBlbmQoIHJlcy5kYXRhLnN0eWxlICk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQkKCAnLmh1c3RsZS1zaGFyZS1pY29uJyApLm9uKCAnY2xpY2snLCAoIGUgKSA9PiBlLnByZXZlbnREZWZhdWx0KCkgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPdmVycmlkaW5nLlxuXHRcdFx0ICogQHBhcmFtIG9iamVjdCBvcHRzXG5cdFx0XHQgKi9cblx0XHRcdHNldFRhYnNWaWV3cyggb3B0cyApIHtcblx0XHRcdFx0dGhpcy5jb250ZW50VmlldyA9IG9wdHMuY29udGVudFZpZXc7XG5cdFx0XHRcdHRoaXMuZGlzcGxheVZpZXcgPSBvcHRzLmRpc3BsYXlWaWV3O1xuXHRcdFx0XHR0aGlzLmRlc2lnblZpZXcgPSBvcHRzLmRlc2lnblZpZXc7XG5cdFx0XHRcdHRoaXMudmlzaWJpbGl0eVZpZXcgPSBvcHRzLnZpc2liaWxpdHlWaWV3O1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPdmVycmlkaW5nLlxuXHRcdFx0ICovXG5cdFx0XHRyZW5kZXJUYWJzKCkge1xuXG5cdFx0XHRcdC8vIFNlcnZpY2VzXG5cdFx0XHRcdHRoaXMuY29udGVudFZpZXcuZGVsZWdhdGVFdmVudHMoKTtcblxuXHRcdFx0XHQvLyBBcHBlYXJhbmNlIHZpZXdcblx0XHRcdFx0dGhpcy5kZXNpZ25WaWV3LmRlbGVnYXRlRXZlbnRzKCk7XG5cblx0XHRcdFx0Ly8gRGlzcGxheSBPcHRpb25zIFZpZXdcblx0XHRcdFx0dGhpcy5kaXNwbGF5Vmlldy50YXJnZXRDb250YWluZXIuaHRtbCggJycgKTtcblx0XHRcdFx0dGhpcy5kaXNwbGF5Vmlldy5yZW5kZXIoKTtcblx0XHRcdFx0dGhpcy5kaXNwbGF5Vmlldy5kZWxlZ2F0ZUV2ZW50cygpO1xuXHRcdFx0XHR0aGlzLmRpc3BsYXlWaWV3LnRhcmdldENvbnRhaW5lci5hcHBlbmQoIHRoaXMuZGlzcGxheVZpZXcuJGVsICk7XG5cdFx0XHRcdHRoaXMuZGlzcGxheVZpZXcuYWZ0ZXJSZW5kZXIoKTtcblxuXHRcdFx0XHQvLyBWaXNpYmlsaXR5IHZpZXcuXG5cdFx0XHRcdHRoaXMudmlzaWJpbGl0eVZpZXcuZGVsZWdhdGVFdmVudHMoKTtcblx0XHRcdFx0dGhpcy52aXNpYmlsaXR5Vmlldy5hZnRlclJlbmRlcigpO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPdmVycmlkaW5nLlxuXHRcdFx0ICovXG5cdFx0XHRzYW5pdGl6ZURhdGEoKSB7fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPdmVycmlkaW5nLlxuXHRcdFx0ICovXG5cdFx0XHRnZXREYXRhVG9TYXZlKCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGNvbnRlbnQ6IHRoaXMuY29udGVudFZpZXcubW9kZWwudG9KU09OKCksXG5cdFx0XHRcdFx0ZGlzcGxheTogdGhpcy5kaXNwbGF5Vmlldy5tb2RlbC50b0pTT04oKSxcblx0XHRcdFx0XHRkZXNpZ246IHRoaXMuZGVzaWduVmlldy5tb2RlbC50b0pTT04oKSxcblx0XHRcdFx0XHR2aXNpYmlsaXR5OiB0aGlzLnZpc2liaWxpdHlWaWV3Lm1vZGVsLnRvSlNPTigpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSlcblx0KTtcbn0pO1xuIiwiKCBmdW5jdGlvbigpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0LyoqXG5cdCAqIExpc3RpbmcgUGFnZVxuXHQgKi9cblx0KCBmdW5jdGlvbigpIHtcblxuXHRcdGxldCBwYWdlID0gJ19wYWdlX2h1c3RsZV9wb3B1cF9saXN0aW5nJztcblx0XHRpZiAoIHBhZ2UgIT09IHBhZ2Vub3cuc3Vic3RyKCBwYWdlbm93Lmxlbmd0aCAtIHBhZ2UubGVuZ3RoICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bmV3IE9wdGluLmxpc3RpbmdCYXNlKHsgbW9kdWxlVHlwZTogb3B0aW5WYXJzLmN1cnJlbnQubW9kdWxlX3R5cGUgfSk7XG5cblx0fSgpICk7XG5cblx0LyoqXG5cdCAqIEVkaXQgb3IgTmV3IHBhZ2Vcblx0ICovXG5cdCggZnVuY3Rpb24oKSB7XG5cblx0XHRsZXQgcGFnZSA9ICdfcGFnZV9odXN0bGVfcG9wdXAnO1xuXHRcdGlmICggcGFnZSAhPT0gcGFnZW5vdy5zdWJzdHIoIHBhZ2Vub3cubGVuZ3RoIC0gcGFnZS5sZW5ndGggKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgVmlldyAgICAgICAgICAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5XaXphcmRfVmlldycgKSApLFxuXHRcdFx0Vmlld0NvbnRlbnRcdFx0ID0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9Db250ZW50JyApICksXG5cdFx0XHRWaWV3RW1haWxzICAgICAgID0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9FbWFpbHMnICkgKSxcblx0XHRcdFZpZXdEZXNpZ24gICAgICAgPSBIdXN0bGUuVmlldy5leHRlbmQoIEh1c3RsZS5nZXQoICdNaXhpbnMuTW9kdWxlX0Rlc2lnbicgKSApLFxuXHRcdFx0Vmlld1Zpc2liaWxpdHkgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfVmlzaWJpbGl0eScgKSApLFxuXHRcdFx0Vmlld1NldHRpbmdzICAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfU2V0dGluZ3MnICkgKSxcblx0XHRcdFZpZXdJbnRlZ3JhdGlvbnMgPSBIdXN0bGUuZ2V0KCAnTW9kdWxlLkludGVncmF0aW9uc1ZpZXcnICksXG5cblx0XHRcdE1vZGVsVmlldyAgICAgICAgICAgPSBNb2R1bGUuTW9kZWwsXG5cdFx0XHRCYXNlTW9kZWwgPSBIdXN0bGUuZ2V0KCAnTW9kZWxzLk0nICk7XG5cblx0XHRyZXR1cm4gbmV3IFZpZXcoe1xuXHRcdFx0bW9kZWw6IG5ldyBNb2RlbFZpZXcoIG9wdGluVmFycy5jdXJyZW50LmRhdGEgfHwge30pLFxuXHRcdFx0Y29udGVudFZpZXc6IG5ldyBWaWV3Q29udGVudCh7IEJhc2VNb2RlbCB9KSxcblx0XHRcdGVtYWlsc1ZpZXc6IG5ldyBWaWV3RW1haWxzKHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0ZGVzaWduVmlldzogbmV3IFZpZXdEZXNpZ24oeyBCYXNlTW9kZWwgfSksXG5cdFx0XHRpbnRlZ3JhdGlvbnNWaWV3OiBuZXcgVmlld0ludGVncmF0aW9ucyh7IEJhc2VNb2RlbCB9KSxcblx0XHRcdHZpc2liaWxpdHlWaWV3OiBuZXcgVmlld1Zpc2liaWxpdHkoeyBCYXNlTW9kZWwgfSksXG5cdFx0XHRzZXR0aW5nc1ZpZXc6IG5ldyBWaWV3U2V0dGluZ3MoeyBCYXNlTW9kZWwgfSlcblx0XHR9KTtcblxuXHR9KCkgKTtcblxufSgpICk7XG4iLCIoIGZ1bmN0aW9uKCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvKipcblx0ICogTGlzdGluZyBQYWdlXG5cdCAqL1xuXHQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0bGV0IHBhZ2UgPSAnX3BhZ2VfaHVzdGxlX3NsaWRlaW5fbGlzdGluZyc7XG5cdFx0aWYgKCBwYWdlICE9PSBwYWdlbm93LnN1YnN0ciggcGFnZW5vdy5sZW5ndGggLSBwYWdlLmxlbmd0aCApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG5ldyBPcHRpbi5saXN0aW5nQmFzZSh7IG1vZHVsZVR5cGU6IG9wdGluVmFycy5jdXJyZW50Lm1vZHVsZV90eXBlIH0pO1xuXG5cdH0oKSApO1xuXG5cdC8qKlxuXHQgKiBFZGl0IG9yIE5ldyBwYWdlXG5cdCAqL1xuXHQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0bGV0IHBhZ2UgPSAnX3BhZ2VfaHVzdGxlX3NsaWRlaW4nO1xuXHRcdGlmICggcGFnZSAhPT0gcGFnZW5vdy5zdWJzdHIoIHBhZ2Vub3cubGVuZ3RoIC0gcGFnZS5sZW5ndGggKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgVmlldyAgICAgICAgICAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5XaXphcmRfVmlldycgKSApLFxuXHRcdFx0Vmlld0NvbnRlbnQgICAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfQ29udGVudCcgKSApLFxuXHRcdFx0Vmlld0VtYWlscyAgICAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfRW1haWxzJyApICksXG5cdFx0XHRWaWV3RGVzaWduICAgICAgID0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9EZXNpZ24nICkgKSxcblx0XHRcdFZpZXdWaXNpYmlsaXR5ICAgPSBIdXN0bGUuVmlldy5leHRlbmQoIEh1c3RsZS5nZXQoICdNaXhpbnMuTW9kdWxlX1Zpc2liaWxpdHknICkgKSxcblx0XHRcdFZpZXdTZXR0aW5ncyAgICA9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfU2V0dGluZ3MnICkgKSxcblx0XHRcdFZpZXdJbnRlZ3JhdGlvbnMgPSBIdXN0bGUuZ2V0KCAnTW9kdWxlLkludGVncmF0aW9uc1ZpZXcnICksXG5cblx0XHRcdE1vZGVsVmlldyA9IE1vZHVsZS5Nb2RlbCxcblx0XHRcdEJhc2VNb2RlbCA9IEh1c3RsZS5nZXQoICdNb2RlbHMuTScgKTtcblxuXHRcdHJldHVybiBuZXcgVmlldyh7XG5cdFx0XHRtb2RlbDogbmV3IE1vZGVsVmlldyggb3B0aW5WYXJzLmN1cnJlbnQuZGF0YSB8fCB7fSksXG5cdFx0XHRjb250ZW50VmlldzogbmV3IFZpZXdDb250ZW50KHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0ZW1haWxzVmlldzogbmV3IFZpZXdFbWFpbHMoeyBCYXNlTW9kZWwgfSksXG5cdFx0XHRkZXNpZ25WaWV3OiBuZXcgVmlld0Rlc2lnbih7IEJhc2VNb2RlbCB9KSxcblx0XHRcdGludGVncmF0aW9uc1ZpZXc6IG5ldyBWaWV3SW50ZWdyYXRpb25zKHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0dmlzaWJpbGl0eVZpZXc6IG5ldyBWaWV3VmlzaWJpbGl0eSh7IEJhc2VNb2RlbCB9KSxcblx0XHRcdHNldHRpbmdzVmlldzogbmV3IFZpZXdTZXR0aW5ncyh7IEJhc2VNb2RlbCB9KVxuXHRcdH0pO1xuXG5cdH0oKSApO1xufSgpICk7XG4iLCIoIGZ1bmN0aW9uKCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBMaXN0aW5ncyBQYWdlXG5cdCggZnVuY3Rpb24oKSB7XG5cdFx0bGV0IHBhZ2UgPSAnX3BhZ2VfaHVzdGxlX2VtYmVkZGVkX2xpc3RpbmcnO1xuXHRcdGlmICggcGFnZSAhPT0gcGFnZW5vdy5zdWJzdHIoIHBhZ2Vub3cubGVuZ3RoIC0gcGFnZS5sZW5ndGggKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRuZXcgT3B0aW4ubGlzdGluZ0Jhc2UoeyBtb2R1bGVUeXBlOiBvcHRpblZhcnMuY3VycmVudC5tb2R1bGVfdHlwZSB9KTtcblxuXHR9KCkgKTtcblxuXHQvLyBXaXphcmQgUGFnZVxuXHQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0bGV0IHBhZ2UgPSAnX3BhZ2VfaHVzdGxlX2VtYmVkZGVkJztcblx0XHRpZiAoIHBhZ2UgIT09IHBhZ2Vub3cuc3Vic3RyKCBwYWdlbm93Lmxlbmd0aCAtIHBhZ2UubGVuZ3RoICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHZpZXdcdFx0XHRcdD0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLldpemFyZF9WaWV3JyApICksXG5cdFx0XHRWaWV3Q29udGVudFx0XHRcdD0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9Db250ZW50JyApICksXG5cdFx0XHRWaWV3RW1haWxzIFx0XHRcdD0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9FbWFpbHMnICkgKSxcblx0XHRcdFZpZXdEZXNpZ25cdFx0XHQ9IEh1c3RsZS5WaWV3LmV4dGVuZCggSHVzdGxlLmdldCggJ01peGlucy5Nb2R1bGVfRGVzaWduJyApICksXG5cdFx0XHRWaWV3RGlzcGxheSBcdFx0PSBIdXN0bGUuVmlldy5leHRlbmQoIEh1c3RsZS5nZXQoICdNaXhpbnMuTW9kdWxlX0Rpc3BsYXknICkgKSxcblx0XHRcdFZpZXdWaXNpYmlsaXR5XHRcdD0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9WaXNpYmlsaXR5JyApICksXG5cdFx0XHRWaWV3U2V0dGluZ3NcdFx0PSBIdXN0bGUuVmlldy5leHRlbmQoIEh1c3RsZS5nZXQoICdNaXhpbnMuTW9kdWxlX1NldHRpbmdzJyApICksXG5cdFx0XHRWaWV3SW50ZWdyYXRpb25zIFx0PSBIdXN0bGUuZ2V0KCAnTW9kdWxlLkludGVncmF0aW9uc1ZpZXcnICksXG5cblx0XHRcdHZpZXdNb2RlbCA9IE1vZHVsZS5Nb2RlbCxcblx0XHRcdEJhc2VNb2RlbCA9IEh1c3RsZS5nZXQoICdNb2RlbHMuTScgKTtcblxuXHRcdHJldHVybiBuZXcgdmlldyh7XG5cdFx0XHRtb2RlbDogbmV3IHZpZXdNb2RlbCggb3B0aW5WYXJzLmN1cnJlbnQuZGF0YSB8fCB7fSksXG5cdFx0XHRjb250ZW50VmlldzogbmV3IFZpZXdDb250ZW50KHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0ZW1haWxzVmlldzogbmV3IFZpZXdFbWFpbHMoeyBCYXNlTW9kZWwgfSksXG5cdFx0XHRkZXNpZ25WaWV3OiBuZXcgVmlld0Rlc2lnbih7IEJhc2VNb2RlbCB9KSxcblx0XHRcdGludGVncmF0aW9uc1ZpZXc6IG5ldyBWaWV3SW50ZWdyYXRpb25zKHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0ZGlzcGxheVZpZXc6IG5ldyBWaWV3RGlzcGxheSh7IEJhc2VNb2RlbCB9KSxcblx0XHRcdHZpc2liaWxpdHlWaWV3OiBuZXcgVmlld1Zpc2liaWxpdHkoeyBCYXNlTW9kZWwgfSksXG5cdFx0XHRzZXR0aW5nc1ZpZXc6IG5ldyBWaWV3U2V0dGluZ3MoeyBCYXNlTW9kZWwgfSlcblx0XHR9KTtcblxuXHR9KCkgKTtcblxufSgpICk7XG4iLCIoIGZ1bmN0aW9uKCkge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvKipcblx0ICogTGlzdGluZyBQYWdlLlxuXHQgKi9cblx0KCBmdW5jdGlvbigpIHtcblxuXHRcdGxldCBwYWdlID0gJ19wYWdlX2h1c3RsZV9zc2hhcmVfbGlzdGluZyc7XG5cdFx0aWYgKCBwYWdlICE9PSBwYWdlbm93LnN1YnN0ciggcGFnZW5vdy5sZW5ndGggLSBwYWdlLmxlbmd0aCApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG5ldyBPcHRpbi5saXN0aW5nQmFzZSh7IG1vZHVsZVR5cGU6IG9wdGluVmFycy5jdXJyZW50Lm1vZHVsZV90eXBlIH0pO1xuXG5cdH0oKSApO1xuXG5cblx0LyoqXG5cdCAqIFdpemFyZCBwYWdlLlxuXHQgKi9cblx0KCBmdW5jdGlvbigpIHtcblxuXHRcdGxldCBwYWdlID0gJ19wYWdlX2h1c3RsZV9zc2hhcmUnO1xuXHRcdGlmICggcGFnZSAhPT0gcGFnZW5vdy5zdWJzdHIoIHBhZ2Vub3cubGVuZ3RoIC0gcGFnZS5sZW5ndGggKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCB2aWV3ID0gSHVzdGxlLmdldCggJ1NTaGFyZS5WaWV3JyApLFxuXHRcdFx0Vmlld0NvbnRlbnQgPSBIdXN0bGUuZ2V0KCAnU1NoYXJlLkNvbnRlbnRfVmlldycgKSxcblx0XHRcdFZpZXdEaXNwbGF5ID0gSHVzdGxlLmdldCggJ1NTaGFyZS5EaXNwbGF5X1ZpZXcnICksXG5cdFx0XHRWaWV3RGVzaWduID0gSHVzdGxlLmdldCggJ1NTaGFyZS5EZXNpZ25fVmlldycgKSxcblx0XHRcdFZpZXdWaXNpYmlsaXR5ID0gSHVzdGxlLlZpZXcuZXh0ZW5kKCBIdXN0bGUuZ2V0KCAnTWl4aW5zLk1vZHVsZV9WaXNpYmlsaXR5JyApICksXG5cblx0XHRcdHZpZXdNb2RlbCA9IE1vZHVsZS5Nb2RlbCxcblx0XHRcdEJhc2VNb2RlbCA9IEh1c3RsZS5nZXQoICdNb2RlbHMuTScgKTtcblxuXHRcdHJldHVybiBuZXcgdmlldyh7XG5cdFx0XHRtb2RlbDogbmV3IHZpZXdNb2RlbCggb3B0aW5WYXJzLmN1cnJlbnQuZGF0YSB8fCB7fSksXG5cdFx0XHRjb250ZW50VmlldzogbmV3IFZpZXdDb250ZW50KHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0ZGlzcGxheVZpZXc6IG5ldyBWaWV3RGlzcGxheSh7IEJhc2VNb2RlbCB9KSxcblx0XHRcdGRlc2lnblZpZXc6IG5ldyBWaWV3RGVzaWduKHsgQmFzZU1vZGVsIH0pLFxuXHRcdFx0dmlzaWJpbGl0eVZpZXc6IG5ldyBWaWV3VmlzaWJpbGl0eSh7IEJhc2VNb2RlbCB9KVxuXHRcdH0pO1xuXHR9KCkgKTtcbn0oKSApO1xuXG4iLCJIdXN0bGUuZGVmaW5lKCAnRGFzaGJvYXJkLlZpZXcnLCBmdW5jdGlvbiggJCwgZG9jLCB3aW4gKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRpZiAoICd0b3BsZXZlbF9wYWdlX2h1c3RsZScgIT09IHBhZ2Vub3cgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZGFzaGJvYXJkVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnLnN1aS13cmFwJyxcblxuXHRcdGV2ZW50czoge1xuXHRcdFx0J2NsaWNrIC5odXN0bGUtcHJldmlldy1tb2R1bGUtYnV0dG9uJzogJ29wZW5QcmV2aWV3Jyxcblx0XHRcdCdjbGljayAuaHVzdGxlLWRlbGV0ZS1tb2R1bGUtYnV0dG9uJzogJ29wZW5EZWxldGVNb2RhbCcsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1mcmVlLXZlcnNpb24tY3JlYXRlJzogJ3Nob3dVcGdyYWRlTW9kYWwnLFxuXHRcdFx0J2NsaWNrIC5zdWktZHJvcGRvd24gLmh1c3RsZS1vbmxvYWQtaWNvbi1hY3Rpb24nOiAnYWRkTG9hZGluZ0ljb25Ub0FjdGlvbnNCdXR0b24nLFxuXG5cdFx0XHQvLyBNb2R1bGVzJyBhY3Rpb25zLlxuXHRcdFx0J2NsaWNrIC5odXN0bGUtc2luZ2xlLW1vZHVsZS1idXR0b24tYWN0aW9uJzogJ2hhbmRsZVNpbmdsZU1vZHVsZUFjdGlvbidcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSggb3B0cyApIHtcblxuXHRcdFx0aWYgKCAkKCAnI2h1c3RsZS1kaWFsb2ctLXdlbGNvbWUnICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aGlzLm9wZW5XZWxjb21lRGlhbG9nKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggJCggJyNodXN0bGUtZGlhbG9nLS1taWdyYXRlJyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy5vcGVuTWlncmF0ZURpYWxvZygpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmRvQWN0aW9uc0Jhc2VkT25VcmwoKTtcblx0XHR9LFxuXG5cdFx0ZG9BY3Rpb25zQmFzZWRPblVybCgpIHtcblxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2UgYmFzZWQgb24gVVJMIHBhcmFtZXRlcnMuXG5cdFx0XHRpZiAoIE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ3Nob3ctbm90aWNlJyApICkge1xuXHRcdFx0XHRjb25zdCBzdGF0dXMgPSAnc3VjY2VzcycgPT09IE1vZHVsZS5VdGlscy5nZXRVcmxQYXJhbSggJ3Nob3ctbm90aWNlJyApID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyxcblx0XHRcdFx0XHRub3RpY2UgPSBNb2R1bGUuVXRpbHMuZ2V0VXJsUGFyYW0oICdub3RpY2UnICksXG5cdFx0XHRcdFx0bWVzc2FnZSA9ICggbm90aWNlICYmICd1bmRlZmluZWQnICE9PSBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9uc1sgbm90aWNlIF0pID8gb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnNbIG5vdGljZSBdIDogTW9kdWxlLlV0aWxzLmdldFVybFBhcmFtKCAnbm90aWNlLW1lc3NhZ2UnICk7XG5cblx0XHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1lc3NhZ2UgJiYgbWVzc2FnZS5sZW5ndGggKSB7XG5cdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCBzdGF0dXMsIG1lc3NhZ2UgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvcGVuUHJldmlldyggZSApIHtcblx0XHRcdGxldCAkdGhpcyA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHRpZCA9ICR0aGlzLmRhdGEoICdpZCcgKSxcblx0XHRcdFx0dHlwZSA9ICR0aGlzLmRhdGEoICd0eXBlJyApO1xuXG5cdFx0XHRNb2R1bGUucHJldmlldy5vcGVuKCBpZCwgdHlwZSApO1xuXHRcdH0sXG5cblx0XHRzaG93VXBncmFkZU1vZGFsKCBlICkge1xuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGUgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0ICR1cGdyYWRlTW9kYWwgPSAkKCAnI3dwaC11cGdyYWRlLW1vZGFsJyApO1xuXHRcdFx0JHVwZ3JhZGVNb2RhbC5hZGRDbGFzcyggJ3dwbXVkZXYtbW9kYWwtYWN0aXZlJyApO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAc2luY2UgNC4wXG5cdFx0ICovXG5cdFx0b3BlbkRlbGV0ZU1vZGFsKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0bGV0ICR0aGlzID0gJCggZS5jdXJyZW50VGFyZ2V0ICksXG5cdFx0XHRcdGRhdGEgPSB7XG5cdFx0XHRcdFx0aWQ6ICR0aGlzLmRhdGEoICdpZCcgKSxcblx0XHRcdFx0XHRub25jZTogJHRoaXMuZGF0YSggJ25vbmNlJyApLFxuXHRcdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZScsXG5cdFx0XHRcdFx0dGl0bGU6ICR0aGlzLmRhdGEoICd0aXRsZScgKSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogJHRoaXMuZGF0YSggJ2Rlc2NyaXB0aW9uJyApXG5cdFx0XHRcdH07XG5cblx0XHRcdE1vZHVsZS5kZWxldGVNb2RhbC5vcGVuKCBkYXRhICk7XG5cdFx0fSxcblxuXHRcdGFkZExvYWRpbmdJY29uVG9BY3Rpb25zQnV0dG9uKCBlICkge1xuXHRcdFx0Y29uc3QgJGFjdGlvbkJ1dHRvbiA9ICQoIGUuY3VycmVudFRhcmdldCApLFxuXHRcdFx0XHQkbWFpbkJ1dHRvbiA9ICRhY3Rpb25CdXR0b24uY2xvc2VzdCggJy5zdWktZHJvcGRvd24nICkuZmluZCggJy5zdWktZHJvcGRvd24tYW5jaG9yJyApO1xuXG5cdFx0XHQkbWFpbkJ1dHRvbi5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdH0sXG5cblx0XHRvcGVuV2VsY29tZURpYWxvZygpIHtcblx0XHRcdEh1c3RsZS5nZXQoICdNb2RhbHMuV2VsY29tZScgKTtcblx0XHR9LFxuXG5cdFx0b3Blbk1pZ3JhdGVEaWFsb2coKSB7XG5cdFx0XHRIdXN0bGUuZ2V0KCAnTW9kYWxzLk1pZ3JhdGlvbicgKTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU2luZ2xlTW9kdWxlQWN0aW9uKCBlICkge1xuXHRcdFx0TW9kdWxlLmhhbmRsZUFjdGlvbnMuaW5pdEFjdGlvbiggZSwgJ2Rhc2hib2FyZCcsIHRoaXMgKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogaW5pdEFjdGlvbiBzdWNjY2VzcyBjYWxsYmFjayBmb3IgXCJ0b2dnbGUtc3RhdHVzXCIuXG5cdFx0ICogQHNpbmNlIDQuMC40XG5cdFx0ICovXG5cdFx0YWN0aW9uVG9nZ2xlU3RhdHVzKCAkdGhpcywgZGF0YSApIHtcblxuXHRcdFx0Y29uc3QgZW5hYmxlZCA9IGRhdGEud2FzX21vZHVsZV9lbmFibGVkO1xuXG5cdFx0XHQkdGhpcy5maW5kKCAnc3BhbicgKS50b2dnbGVDbGFzcyggJ3N1aS1oaWRkZW4nICk7XG5cblx0XHRcdGxldCB0b29sdGlwID0gJHRoaXMucGFyZW50cyggJ3RkLmh1aS1zdGF0dXMnICkuZmluZCggJ3NwYW4uc3VpLXRvb2x0aXAnICk7XG5cdFx0XHR0b29sdGlwLnJlbW92ZUNsYXNzKCAnc3VpLWRyYWZ0IHN1aS1wdWJsaXNoZWQnICk7XG5cblx0XHRcdGlmICggZW5hYmxlZCApIHtcblx0XHRcdFx0dG9vbHRpcC5hZGRDbGFzcyggJ3N1aS1kcmFmdCcgKS5hdHRyKCAnZGF0YS10b29sdGlwJywgb3B0aW5WYXJzLm1lc3NhZ2VzLmNvbW1vbnMuZHJhZnQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoICdzdWktcHVibGlzaGVkJyApLmF0dHIoICdkYXRhLXRvb2x0aXAnLCBvcHRpblZhcnMubWVzc2FnZXMuY29tbW9ucy5wdWJsaXNoZWQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9KTtcblxuXHRuZXcgZGFzaGJvYXJkVmlldygpO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnSW50ZWdyYXRpb25zLlZpZXcnLCBmdW5jdGlvbiggJCwgZG9jLCB3aW4gKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRsZXQgcGFnZSA9ICdfcGFnZV9odXN0bGVfaW50ZWdyYXRpb25zJztcblx0aWYgKCBwYWdlICE9PSBwYWdlbm93LnN1YnN0ciggcGFnZW5vdy5sZW5ndGggLSBwYWdlLmxlbmd0aCApICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IGludGVncmF0aW9uc1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJy5zdWktd3JhcCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuY29ubmVjdC1pbnRlZ3JhdGlvbic6ICdjb25uZWN0SW50ZWdyYXRpb24nLFxuXHRcdFx0J2tleXByZXNzIC5jb25uZWN0LWludGVncmF0aW9uJzogJ3ByZXZlbnRFbnRlcktleUZyb21Eb2luZ1RoaW5ncydcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSgpIHtcblxuXHRcdFx0dGhpcy5zdG9wTGlzdGVuaW5nKCBIdXN0bGUuRXZlbnRzLCAnaHVzdGxlOnByb3ZpZGVyczpyZWxvYWQnLCB0aGlzLnJlbmRlclByb3ZpZGVyc1RhYmxlcyApO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggSHVzdGxlLkV2ZW50cywgJ2h1c3RsZTpwcm92aWRlcnM6cmVsb2FkJywgdGhpcy5yZW5kZXJQcm92aWRlcnNUYWJsZXMgKTtcblxuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9LFxuXG5cdFx0cmVuZGVyKCkge1xuXHRcdFx0dmFyICRub3RDb25uZWN0ZWRXcmFwcGVyID0gdGhpcy4kZWwuZmluZCggJyNodXN0bGUtbm90LWNvbm5lY3RlZC1wcm92aWRlcnMtc2VjdGlvbicgKSxcblx0XHRcdFx0JGNvbm5lY3RlZFdyYXBwZXIgPSB0aGlzLiRlbC5maW5kKCAnI2h1c3RsZS1jb25uZWN0ZWQtcHJvdmlkZXJzLXNlY3Rpb24nICk7XG5cblx0XHRcdGlmICggMCA8ICRub3RDb25uZWN0ZWRXcmFwcGVyLmxlbmd0aCAmJiAwIDwgJGNvbm5lY3RlZFdyYXBwZXIubGVuZ3RoICkge1xuXHRcdFx0XHR0aGlzLnJlbmRlclByb3ZpZGVyc1RhYmxlcygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG9wdGluVmFycy5pbnRlZ3JhdGlvbl9yZWRpcmVjdCApIHtcblx0XHRcdFx0dGhpcy5oYW5kbGVJbnRlZ3JhdGlvblJlZGlyZWN0KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJlbmRlclByb3ZpZGVyc1RhYmxlcygpIHtcblxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRkYXRhID0ge31cblx0XHRcdDtcblxuXHRcdFx0dGhpcy4kZWwuZmluZCggJy5odXN0bGUtaW50ZWdyYXRpb25zLWRpc3BsYXknICkuaHRtbChcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJzdWktbm90aWNlIHN1aS1ub3RpY2Utc20gc3VpLW5vdGljZS1sb2FkaW5nXCI+JyArXG5cdFx0XHRcdFx0JzxwPicgKyBvcHRpblZhcnMuZmV0Y2hpbmdfbGlzdCArICc8L3A+JyArXG5cdFx0XHRcdCc8L2Rpdj4nXG5cdFx0XHQpO1xuXG5cdFx0XHRkYXRhLmFjdGlvbiAgICAgID0gJ2h1c3RsZV9wcm92aWRlcl9nZXRfcHJvdmlkZXJzJztcblx0XHRcdGRhdGEuX2FqYXhfbm9uY2UgPSBvcHRpblZhcnMucHJvdmlkZXJzX2FjdGlvbl9ub25jZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2Vcblx0XHRcdGRhdGEuZGF0YSA9IHt9O1xuXG5cdFx0XHRjb25zdCBhamF4ID0gJC5wb3N0KHtcblx0XHRcdFx0dXJsOiBhamF4dXJsLFxuXHRcdFx0XHR0eXBlOiAncG9zdCcsXG5cdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdH0pXG5cdFx0XHQuZG9uZSggZnVuY3Rpb24oIHJlc3VsdCApIHtcblx0XHRcdFx0aWYgKCByZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MgKSB7XG5cdFx0XHRcdFx0c2VsZi4kZWwuZmluZCggJyNodXN0bGUtbm90LWNvbm5lY3RlZC1wcm92aWRlcnMtc2VjdGlvbicgKS5odG1sKCByZXN1bHQuZGF0YS5ub3RfY29ubmVjdGVkICk7XG5cdFx0XHRcdFx0c2VsZi4kZWwuZmluZCggJyNodXN0bGUtY29ubmVjdGVkLXByb3ZpZGVycy1zZWN0aW9uJyApLmh0bWwoIHJlc3VsdC5kYXRhLmNvbm5lY3RlZCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9yZW1vdmUgdGhlIHByZWxvYWRlclxuXHRcdFx0YWpheC5hbHdheXMoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLiRlbC5maW5kKCAnLnN1aS1ub3RpY2UtbG9hZGluZycgKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLyBQcmV2ZW50IHRoZSBlbnRlciBrZXkgZnJvbSBvcGVuaW5nIGludGVncmF0aW9ucyBtb2RhbHMgYW5kIGJyZWFraW5nIHRoZSBwYWdlLlxuXHRcdHByZXZlbnRFbnRlcktleUZyb21Eb2luZ1RoaW5ncyggZSApIHtcblx0XHRcdGlmICggMTMgPT09IGUud2hpY2ggKSB7IC8vIHRoZSBlbnRlciBrZXkgY29kZVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y29ubmVjdEludGVncmF0aW9uKCBlICkge1xuXHRcdFx0TW9kdWxlLmludGVncmF0aW9uc01vZGFsLm9wZW4oIGUgKTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlSW50ZWdyYXRpb25SZWRpcmVjdCgpIHtcblxuXHRcdFx0Y29uc3QgZGF0YSBcdFx0PSBvcHRpblZhcnMuaW50ZWdyYXRpb25fcmVkaXJlY3Q7XG5cdFx0XHRjb25zdCBtaWdyYXRlIFx0PSBvcHRpblZhcnMuaW50ZWdyYXRpb25zX21pZ3JhdGU7XG5cdFx0XHR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe30sIGRvY3VtZW50LnRpdGxlLCBvcHRpblZhcnMuaW50ZWdyYXRpb25zX3VybCApO1xuXHRcdFx0aWYgKCAnbm90aWZpY2F0aW9uJyA9PT0gZGF0YS5hY3Rpb24gKSB7XG5cblx0XHRcdFx0Y29uc3Qgc3RhdHVzID0gJ3N1Y2Nlc3MnID09PSBkYXRhLnN0YXR1cyA/ICdzdWNjZXNzJyA6ICdlcnJvcicsXG5cdFx0XHRcdFx0ZGVsYXkgPSBkYXRhLmRlbGF5ID8gZGF0YS5kZWxheSA6IDEwMDAwO1xuXG5cdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3Blbiggc3RhdHVzLCBkYXRhLm1lc3NhZ2UsIGRlbGF5ICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtaWdyYXRlLmhhc093blByb3BlcnR5KCAncHJvdmlkZXJfbW9kYWwnICkgJiYgJ2NvbnN0YW50Y29udGFjdCcgPT09IG1pZ3JhdGUucHJvdmlkZXJfbW9kYWwgKSB7XG5cdFx0XHRcdE1vZHVsZS5Qcm92aWRlck1pZ3JhdGlvbi5vcGVuKCBtaWdyYXRlLnByb3ZpZGVyX21vZGFsICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbWlncmF0ZS5oYXNPd25Qcm9wZXJ0eSggJ21pZ3JhdGlvbl9ub3RpZmljYWl0b24nICkgKSB7XG5cdFx0XHRcdGNvbnN0IHN0YXR1cyA9ICdzdWNjZXNzJyA9PT0gbWlncmF0ZS5taWdyYXRpb25fbm90aWZpY2FpdG9uLnN0YXR1cyA/ICdzdWNjZXNzJyA6ICdlcnJvcicsXG5cdFx0XHRcdFx0ZGVsYXkgID0gIG1pZ3JhdGUubWlncmF0aW9uX25vdGlmaWNhaXRvbi5kZWxheSA/ICBtaWdyYXRlLm1pZ3JhdGlvbl9ub3RpZmljYWl0b24uZGVsYXkgOiAxMDAwMDtcblx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCBzdGF0dXMsICBtaWdyYXRlLm1pZ3JhdGlvbl9ub3RpZmljYWl0b24ubWVzc2FnZSwgZGVsYXkgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG5cblx0bmV3IGludGVncmF0aW9uc1ZpZXcoKTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ0VudHJpZXMuVmlldycsIGZ1bmN0aW9uKCAkICkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0bGV0IHBhZ2UgPSAnX3BhZ2VfaHVzdGxlX2VudHJpZXMnO1xuXHRpZiAoIHBhZ2UgIT09IHBhZ2Vub3cuc3Vic3RyKCBwYWdlbm93Lmxlbmd0aCAtIHBhZ2UubGVuZ3RoICkgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZW50cmllc1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJy5zdWktd3JhcCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuc3VpLXBhZ2luYXRpb24td3JhcCAuaHVzdGxlLW9wZW4taW5saW5lLWZpbHRlcic6ICdvcGVuRmlsdGVySW5saW5lJyxcblx0XHRcdCdjbGljayAuc3VpLXBhZ2luYXRpb24td3JhcCAuaHVzdGxlLW9wZW4tZGlhbG9nLWZpbHRlcic6ICdvcGVuRmlsdGVyTW9kYWwnLFxuXHRcdFx0J2NsaWNrICNodXN0bGUtZGlhbG9nLS1maWx0ZXItZW50cmllcyAuaHVzdGxlLWRpYWxvZy1jbG9zZSc6ICdjbG9zZUZpbHRlck1vZGFsJyxcblx0XHRcdCdjbGljayAuaHVzdGxlLWRlbGV0ZS1lbnRyeS1idXR0b24nOiAnb3BlbkRlbGV0ZU1vZGFsJyxcblx0XHRcdCdjbGljayAuc3VpLWFjdGl2ZS1maWx0ZXItcmVtb3ZlJzogJ3JlbW92ZUZpbHRlcicsXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1lbnRyaWVzLWNsZWFyLWZpbHRlcic6ICdjbGVhckZpbHRlcidcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZSggb3B0cyApIHtcblxuXHRcdFx0dmFyIGVudHJpZXNEYXRlUGlja2VyUmFuZ2UgPSB7fSxcblx0XHRcdFx0ZW50cmllc0FsZXJ0ID0gJCggJy5odWktZW50cmllcy1hbGVydCcgKTtcblxuXHRcdFx0aWYgKCAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdy5odXN0bGVfZW50cmllc19kYXRlcGlja2VyX3JhbmdlcyApIHtcblx0XHRcdFx0ZW50cmllc0RhdGVQaWNrZXJSYW5nZSA9IHdpbmRvdy5odXN0bGVfZW50cmllc19kYXRlcGlja2VyX3Jhbmdlcztcblx0XHRcdH1cblxuXHRcdFx0JCggJ2lucHV0Lmh1c3RsZS1lbnRyaWVzLWZpbHRlci1kYXRlJyApLmRhdGVyYW5nZXBpY2tlcih7XG5cdFx0XHRcdGF1dG9VcGRhdGVJbnB1dDogZmFsc2UsXG5cdFx0XHRcdGF1dG9BcHBseTogdHJ1ZSxcblx0XHRcdFx0YWx3YXlzU2hvd0NhbGVuZGFyczogdHJ1ZSxcblx0XHRcdFx0cmFuZ2VzOiBlbnRyaWVzRGF0ZVBpY2tlclJhbmdlLFxuXHRcdFx0XHRsb2NhbGU6IG9wdGluVmFycy5kYXRlcmFuZ2VwaWNrZXJcblx0XHRcdH0pO1xuXG5cdFx0XHQkKCAnaW5wdXQuaHVzdGxlLWVudHJpZXMtZmlsdGVyLWRhdGUnICkub24oICdhcHBseS5kYXRlcmFuZ2VwaWNrZXInLCBmdW5jdGlvbiggZXYsIHBpY2tlciApIHtcblx0XHRcdFx0JCggdGhpcyApLnZhbCggcGlja2VyLnN0YXJ0RGF0ZS5mb3JtYXQoICdNTS9ERC9ZWVlZJyApICsgJyAtICcgKyBwaWNrZXIuZW5kRGF0ZS5mb3JtYXQoICdNTS9ERC9ZWVlZJyApICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCBlbnRyaWVzQWxlcnQubGVuZ3RoICkge1xuXG5cdFx0XHRcdC8vIEFzc2lnbiBjb3JyZWN0IGNvbHNwYW4uXG5cdFx0XHRcdGVudHJpZXNBbGVydC5hdHRyKCAnY29sc3BhbicsIGVudHJpZXNBbGVydC5jbG9zZXN0KCAnLnN1aS10YWJsZScgKS5maW5kKCAnPiB0aGVhZCB0ciB0aCcgKS5sZW5ndGggKTtcblxuXHRcdFx0XHQvLyBTaG93IG1lc3NhZ2UuXG5cdFx0XHRcdGVudHJpZXNBbGVydC5maW5kKCAnaScgKS5oaWRlKCk7XG5cdFx0XHRcdGVudHJpZXNBbGVydC5maW5kKCAnc3BhbicgKS5yZW1vdmVDbGFzcyggJ3N1aS1zY3JlZW4tcmVhZGVyLXRleHQnICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdG9wZW5GaWx0ZXJJbmxpbmUoIGUgKSB7XG5cblx0XHRcdHZhciAkdGhpcyAgICA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHRcdFx0JHdyYXBwZXIgPSAkdGhpcy5jbG9zZXN0KCAnLnN1aS1wYWdpbmF0aW9uLXdyYXAnICksXG5cdFx0XHRcdCRidXR0b24gID0gJHdyYXBwZXIuZmluZCggJy5zdWktYnV0dG9uLWljb24nICksXG5cdFx0XHRcdCRmaWx0ZXJzID0gJHRoaXMuY2xvc2VzdCggJy5odWktYWN0aW9ucy1iYXInICkubmV4dCggJy5zdWktcGFnaW5hdGlvbi1maWx0ZXInIClcblx0XHRcdFx0O1xuXG5cdFx0XHQkYnV0dG9uLnRvZ2dsZUNsYXNzKCAnc3VpLWFjdGl2ZScgKTtcblx0XHRcdCRmaWx0ZXJzLnRvZ2dsZUNsYXNzKCAnc3VpLW9wZW4nICk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR9LFxuXG5cdFx0b3BlbkZpbHRlck1vZGFsKCBlICkge1xuXG5cdFx0XHQvLyBTaG93IGRpYWxvZ1xuXHRcdFx0Ly8gU1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLWZpbHRlci1lbnRyaWVzJ10uc2hvdygpO1xuXG5cdFx0XHQvLyBDaGFuZ2UgYW5pbWF0aW9uIG9uIHRoZSBzaG93IGV2ZW50XG5cdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tZmlsdGVyLWVudHJpZXMnXS5zaG93KCkub24oICdzaG93JywgZnVuY3Rpb24oIGRpYWxvZ0VsLCBldmVudCApIHtcblx0XHRcdFx0dmFyIGNvbnRlbnQgPSBkaWFsb2dFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCAnc3VpLWRpYWxvZy1jb250ZW50JyApO1xuXHRcdFx0XHRjb250ZW50WzBdLmNsYXNzTmFtZSA9ICdzdWktZGlhbG9nLWNvbnRlbnQgc3VpLWZhZGUtaW4nO1xuXHRcdFx0fSk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdH0sXG5cblx0XHRjbG9zZUZpbHRlck1vZGFsKCBlICkge1xuXG5cdFx0XHQvLyBIaWRlIGRpYWxvZ1xuXHRcdFx0U1VJLmRpYWxvZ3NbJ2h1c3RsZS1kaWFsb2ctLWZpbHRlci1lbnRyaWVzJ10uaGlkZSgpO1xuXG5cdFx0XHQvLyBDaGFuZ2UgYW5pbWF0aW9uIG9uIHRoZSBoaWRlIGV2ZW50XG5cdFx0XHRTVUkuZGlhbG9nc1snaHVzdGxlLWRpYWxvZy0tZmlsdGVyLWVudHJpZXMnXS5vbiggJ2hpZGUnLCBmdW5jdGlvbiggZGlhbG9nRWwsIGV2ZW50ICkge1xuXHRcdFx0XHR2YXIgY29udGVudCA9IGRpYWxvZ0VsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoICdzdWktZGlhbG9nLWNvbnRlbnQnICk7XG5cdFx0XHRcdGNvbnRlbnRbMF0uY2xhc3NOYW1lID0gJ3N1aS1kaWFsb2ctY29udGVudCBzdWktZmFkZS1vdXQnO1xuXHRcdFx0fSk7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdH0sXG5cblx0XHRyZW1vdmVGaWx0ZXIoIGUgKSB7XG5cdFx0XHRsZXQgJHRoaXMgICAgPSB0aGlzLiQoIGUudGFyZ2V0ICksXG5cdFx0XHRcdHBvc3NpYmxlRmlsdGVycyA9IFsgJ29yZGVyX2J5JywgJ3NlYXJjaF9lbWFpbCcsICdkYXRlX3JhbmdlJyBdLFxuXHRcdFx0XHRjdXJyZW50RmlsdGVyID0gJHRoaXMuZGF0YSggJ2ZpbHRlcicgKSxcblx0XHRcdFx0cmUgPSBuZXcgUmVnRXhwKCAnJicgKyBjdXJyZW50RmlsdGVyICsgJz1bXiZdKicsICdpJyApO1xuXG5cdFx0XHRpZiAoIC0xICE9PSBwb3NzaWJsZUZpbHRlcnMuaW5kZXhPZiggY3VycmVudEZpbHRlciApICkge1xuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZi5yZXBsYWNlKCByZSwgJycgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b3BlbkRlbGV0ZU1vZGFsKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRsZXQgJHRoaXMgPSAkKCBlLnRhcmdldCApLFxuXHRcdFx0XHRkYXRhID0ge1xuXHRcdFx0XHRcdGlkOiAkdGhpcy5kYXRhKCAnaWQnICksXG5cdFx0XHRcdFx0bm9uY2U6ICR0aGlzLmRhdGEoICdub25jZScgKSxcblx0XHRcdFx0XHRhY3Rpb246ICdkZWxldGUnLFxuXHRcdFx0XHRcdHRpdGxlOiAkdGhpcy5kYXRhKCAndGl0bGUnICksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246ICR0aGlzLmRhdGEoICdkZXNjcmlwdGlvbicgKSxcblx0XHRcdFx0XHRhY3Rpb25DbGFzczogJydcblx0XHRcdFx0fTtcblxuXHRcdFx0TW9kdWxlLmRlbGV0ZU1vZGFsLm9wZW4oIGRhdGEgKTtcblx0XHR9LFxuXG5cdFx0Y2xlYXJGaWx0ZXIoIGUgKSB7XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dGhpcy4kKCAnaW5wdXRbbmFtZT1zZWFyY2hfZW1haWxdJyApLnZhbCggJycgKTtcblx0XHRcdHRoaXMuJCggJ2lucHV0W25hbWU9ZGF0ZV9yYW5nZV0nICkudmFsKCAnJyApO1xuXHRcdH1cblxuXHR9KTtcblxuXHRuZXcgZW50cmllc1ZpZXcoKTtcbn0pO1xuIiwiSHVzdGxlLmRlZmluZSggJ1Byb3ZpZGVyTm90aWNlLlZpZXcnLCBmdW5jdGlvbiggJCwgZG9jLCB3aW4gKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRjb25zdCBwcm92aWRlck5vdGljZSA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuXHRcdGVsOiAnLmh1c3RsZS1wcm92aWRlci1ub3RpY2UnLFxuXHRcdGNvb2tpZUtleTogJycsXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQnY2xpY2sgLmRpc21pc3MtcHJvdmlkZXItbWlncmF0aW9uLW5vdGljZSc6ICdIaWRlUHJvdmlkZXJOb3RpY2UnXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemUoKSB7XG5cdFx0XHR0aGlzLmNvb2tpZUtleSA9ICdwcm92aWRlcl9taWdyYXRpb25fbm90aWNlXyc7XG5cblx0XHRcdGlmICggJCggJy5odXN0bGUtcHJvdmlkZXItbm90aWNlJyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhpcy5zaG93UHJvdmlkZXJOb3RpY2UoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0SGlkZVByb3ZpZGVyTm90aWNlKCBlICkge1xuXHRcdFx0T3B0aW4uY29va2llLnNldCggdGhpcy5jb29raWVLZXkgKyAkKCBlLmN1cnJlbnRUYXJnZXQgKS5kYXRhKCAnbmFtZScgKSwgMSwgNyApO1xuXHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0fSxcblxuXHRcdHNob3dQcm92aWRlck5vdGljZSgpIHtcblx0XHRcdGxldCBwcm92aWRlciA9ICQoICcuaHVzdGxlLXByb3ZpZGVyLW5vdGljZScgKS5kYXRhKCAnbmFtZScgKSxcblx0XHRcdG5vdGljZSA9IE9wdGluLmNvb2tpZS5nZXQoIHRoaXMuY29va2llS2V5ICsgcHJvdmlkZXIgKTtcblx0XHRcdGlmICggMSAhPT0gbm90aWNlICkge1xuXHRcdFx0XHQkKCAnI2h1c3RsZV9taWdyYXRpb25fbm90aWNlX18nICsgcHJvdmlkZXIgKS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0pO1xuXG5cdG5ldyBwcm92aWRlck5vdGljZSgpO1xufSk7XG4iLCJIdXN0bGUuZGVmaW5lKCAnU2V0dGluZ3MuVmlldycsIGZ1bmN0aW9uKCAkLCBkb2MsIHdpbiApIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0aWYgKCAnaHVzdGxlX3BhZ2VfaHVzdGxlX3NldHRpbmdzJyAhPT0gcGFnZW5vdyApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB2aWV3U2V0dGluZ3MgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cblx0XHRlbDogJy5zdWktd3JhcCcsXG5cblx0XHRldmVudHM6IHtcblx0XHRcdCdjbGljayAuc3VpLXNpZGVuYXYgLnN1aS12ZXJ0aWNhbC10YWIgYSc6ICdzaWRlbmF2Jyxcblx0XHRcdCdjbGljayAuc3VpLXBhZ2luYXRpb24td3JhcCA+IGJ1dHRvbic6ICdwYWdpbmF0aW9uJyxcblx0XHRcdCdjbGljayAjaHVzdGxlLWRpYWxvZy1vcGVuLS1yZXNldC1zZXR0aW5ncyc6ICdyZXNldERpYWxvZycsXG5cblx0XHRcdC8vIFNhdmUgc2V0dGluZ3MuXG5cdFx0XHQnY2xpY2sgLmh1c3RsZS1zZXR0aW5ncy1zYXZlJzogJ2hhbmRsZVNhdmUnXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRzICkge1xuXG5cdFx0XHRsZXQgbWUgPSB0aGlzLFxuXG5cdFx0XHRcdHJlY2FwdGNoYVZpZXcgPSBIdXN0bGUuZ2V0KCAnU2V0dGluZ3MucmVDYXB0Y2hhX1NldHRpbmdzJyApLFxuXHRcdFx0XHR0b3BNZXRyaWNzVmlldyA9IEh1c3RsZS5nZXQoICdTZXR0aW5ncy5Ub3BfTWV0cmljc19WaWV3JyApLFxuXHRcdFx0XHRwcml2YWN5U2V0dGluZ3MgPSBIdXN0bGUuZ2V0KCAnU2V0dGluZ3MuUHJpdmFjeV9TZXR0aW5ncycgKSxcblx0XHRcdFx0cGVybWlzc2lvbnNWaWV3ID0gSHVzdGxlLmdldCggJ1NldHRpbmdzLlBlcm1pc3Npb25zX1ZpZXcnICksXG5cdFx0XHRcdGRhdGFTZXR0aW5ncyA9IEh1c3RsZS5nZXQoICdTZXR0aW5ncy5EYXRhX1NldHRpbmdzJyApLFxuXHRcdFx0XHRwYWxldHRlc1ZpZXcgPSBIdXN0bGUuZ2V0KCAnU2V0dGluZ3MuUGFsZXR0ZXMnICk7XG5cblx0XHRcdFx0dGhpcy5yZWNhcHRjaGFWaWV3ID0gbmV3IHJlY2FwdGNoYVZpZXcoKTtcblx0XHRcdFx0bmV3IHRvcE1ldHJpY3NWaWV3KCk7XG5cdFx0XHRcdG5ldyBwcml2YWN5U2V0dGluZ3MoKTtcblx0XHRcdFx0bmV3IHBlcm1pc3Npb25zVmlldygpO1xuXHRcdFx0XHRuZXcgZGF0YVNldHRpbmdzKCk7XG5cdFx0XHRcdG5ldyBwYWxldHRlc1ZpZXcoKTtcblxuXHRcdFx0JCggd2luICkub2ZmKCAncG9wc3RhdGUnLCAkLnByb3h5KCBtZS50YWJVcGRhdGUsIG1lICkgKTtcblx0XHRcdCQoIHdpbiApLm9uKCAncG9wc3RhdGUnLCAkLnByb3h5KCBtZS50YWJVcGRhdGUsIG1lICkgKTtcblxuXHRcdFx0SHVzdGxlLkV2ZW50cy50cmlnZ2VyKCAndmlldy5yZW5kZXJlZCcsIHRoaXMgKTtcblxuXHRcdH0sXG5cblx0XHRzaWRlbmF2OiBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0dmFyIHRhYk5hbWUgPSAkKCBlLnRhcmdldCApLmRhdGEoICd0YWInICk7XG5cblx0XHRcdGlmICggdGFiTmFtZSApIHtcblx0XHRcdFx0dGhpcy50YWJKdW1wKCB0YWJOYW1lLCB0cnVlICk7XG5cdFx0XHR9XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9LFxuXG5cdFx0dGFiVXBkYXRlOiBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0dmFyIHN0YXRlID0gZS5vcmlnaW5hbEV2ZW50LnN0YXRlO1xuXG5cdFx0XHRpZiAoIHN0YXRlICkge1xuXHRcdFx0XHR0aGlzLnRhYkp1bXAoIHN0YXRlLnRhYlNlbGVjdGVkICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRhYkp1bXA6IGZ1bmN0aW9uKCB0YWJOYW1lLCB1cGRhdGVIaXN0b3J5ICkge1xuXG5cdFx0XHR2YXIgJHRhYiBcdCA9IHRoaXMuJGVsLmZpbmQoICdhW2RhdGEtdGFiPVwiJyArIHRhYk5hbWUgKyAnXCJdJyApLFxuXHRcdFx0XHQkc2lkZW5hdiA9ICR0YWIuY2xvc2VzdCggJy5zdWktdmVydGljYWwtdGFicycgKSxcblx0XHRcdFx0JHRhYnMgICAgPSAkc2lkZW5hdi5maW5kKCAnLnN1aS12ZXJ0aWNhbC10YWInICksXG5cdFx0XHRcdCRjb250ZW50ID0gdGhpcy4kZWwuZmluZCggJy5zdWktYm94W2RhdGEtdGFiXScgKSxcblx0XHRcdFx0JGN1cnJlbnQgPSB0aGlzLiRlbC5maW5kKCAnLnN1aS1ib3hbZGF0YS10YWI9XCInICsgdGFiTmFtZSArICdcIl0nICk7XG5cblx0XHRcdGlmICggdXBkYXRlSGlzdG9yeSApIHtcblx0XHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoXG5cdFx0XHRcdFx0eyB0YWJTZWxlY3RlZDogdGFiTmFtZSB9LFxuXHRcdFx0XHRcdCdIdXN0bGUgU2V0dGluZ3MnLFxuXHRcdFx0XHRcdCdhZG1pbi5waHA/cGFnZT1odXN0bGVfc2V0dGluZ3Mmc2VjdGlvbj0nICsgdGFiTmFtZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQkdGFicy5yZW1vdmVDbGFzcyggJ2N1cnJlbnQnICk7XG5cdFx0XHQkY29udGVudC5oaWRlKCk7XG5cblx0XHRcdCR0YWIucGFyZW50KCkuYWRkQ2xhc3MoICdjdXJyZW50JyApO1xuXHRcdFx0JGN1cnJlbnQuc2hvdygpO1xuXHRcdH0sXG5cblx0XHRwYWdpbmF0aW9uOiBmdW5jdGlvbiggZSApIHtcblxuXHRcdFx0dmFyICR0aGlzICAgID0gdGhpcy4kKCBlLnRhcmdldCApLFxuXHRcdFx0XHQkd3JhcHBlciA9ICR0aGlzLmNsb3Nlc3QoICcuc3VpLXBhZ2luYXRpb24td3JhcCcgKSxcblx0XHRcdFx0JGJ1dHRvbiAgPSAkd3JhcHBlci5maW5kKCAnLnN1aS1idXR0b24taWNvbicgKSxcblx0XHRcdFx0JGZpbHRlcnMgPSAkd3JhcHBlci5uZXh0KCAnLnN1aS1wYWdpbmF0aW9uLWZpbHRlcicgKVxuXHRcdFx0XHQ7XG5cblx0XHRcdCRidXR0b24udG9nZ2xlQ2xhc3MoICdzdWktYWN0aXZlJyApO1xuXHRcdFx0JGZpbHRlcnMudG9nZ2xlQ2xhc3MoICdzdWktb3BlbicgKTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdH0sXG5cblx0XHQvL3NpZGV0YWJzOiBmdW5jdGlvbiggZSApIHtcblxuXHRcdC8vXHR2YXIgJHRoaXMgICAgICA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHQvL1x0XHQkbGFiZWwgICAgID0gJHRoaXMucGFyZW50KCAnbGFiZWwnICksXG5cdFx0Ly9cdFx0JGRhdGEgICAgICA9ICR0aGlzLmRhdGEoICd0YWItbWVudScgKSxcblx0XHQvL1x0XHQkd3JhcHBlciAgID0gJHRoaXMuY2xvc2VzdCggJy5zdWktc2lkZS10YWJzJyApLFxuXHRcdC8vXHRcdCRhbGxsYWJlbHMgPSAkd3JhcHBlci5maW5kKCAnLnN1aS10YWJzLW1lbnUgLnN1aS10YWItaXRlbScgKSxcblx0XHQvL1x0XHQkYWxsaW5wdXRzID0gJGFsbGxhYmVscy5maW5kKCAnaW5wdXQnIClcblx0XHQvL1x0XHQ7XG5cblx0XHQvL1x0JGFsbGxhYmVscy5yZW1vdmVDbGFzcyggJ2FjdGl2ZScgKTtcblx0XHQvL1x0JGFsbGlucHV0cy5yZW1vdmVBdHRyKCAnY2hlY2tlZCcgKTtcblx0XHQvL1x0JHdyYXBwZXIuZmluZCggJy5zdWktdGFicy1jb250ZW50ID4gZGl2JyApLnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApO1xuXG5cdFx0Ly9cdCRsYWJlbC5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcblx0XHQvL1x0JHRoaXMuYXR0ciggJ2NoZWNrZWQnLCAnY2hlY2tlZCcgKTtcblxuXHRcdC8vXHRpZiAoICR3cmFwcGVyLmZpbmQoICcuc3VpLXRhYnMtY29udGVudCBkaXZbZGF0YS10YWItY29udGVudD1cIicgKyAkZGF0YSArICdcIl0nICkubGVuZ3RoICkge1xuXHRcdC8vXHRcdCR3cmFwcGVyLmZpbmQoICcuc3VpLXRhYnMtY29udGVudCBkaXZbZGF0YS10YWItY29udGVudD1cIicgKyAkZGF0YSArICdcIl0nICkuYWRkQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0Ly9cdH1cblx0XHQvL30sXG5cblx0XHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0XHQvLyBIYW5kbGUgc2F2aW5nIGFjdGlvbnNcblx0XHRoYW5kbGVTYXZlKCBlICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRjb25zdCBzZWxmID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCBlLmN1cnJlbnRUYXJnZXQgKSxcblx0XHRcdFx0cmVsYXRlZEZvcm1JZCA9ICR0aGlzLmRhdGEoICdmb3JtLWlkJyApLFxuXHRcdFx0XHRhY3Rpb25EYXRhID0gJHRoaXMuZGF0YSgpO1xuXG5cdFx0XHRsZXQgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0dGlueU1DRS50cmlnZ2VyU2F2ZSgpO1xuXG5cdFx0XHQvLyBHcmFiIHRoZSBmb3JtJ3MgZGF0YSBpZiB0aGUgYWN0aW9uIGhhcyBhIHJlbGF0ZWQgZm9ybS5cblx0XHRcdGlmICggJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiByZWxhdGVkRm9ybUlkICkge1xuXHRcdFx0XHRjb25zdCAkZm9ybSA9ICQoICcjJyArIHJlbGF0ZWRGb3JtSWQgKTtcblxuXHRcdFx0XHRpZiAoICRmb3JtLmxlbmd0aCApIHtcblx0XHRcdFx0XHRkYXRhID0gbmV3IEZvcm1EYXRhKCAkZm9ybVswXSk7XG5cblx0XHRcdFx0XHQvLyBBZGQgdW5jaGVja2VkIGNoZWNrYm94ZXMuXG5cdFx0XHRcdFx0JC5lYWNoKCAkZm9ybS5maW5kKCAnaW5wdXRbdHlwZT1jaGVja2JveF0nICksIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgJHRoaXMgPSAkKCB0aGlzICk7XG5cdFx0XHRcdFx0XHRpZiAoICEgJHRoaXMuaXMoICc6Y2hlY2tlZCcgKSApIHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5hcHBlbmQoICR0aGlzLmF0dHIoICduYW1lJyApLCAnMCcgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdCQuZWFjaCggYWN0aW9uRGF0YSwgKCBuYW1lLCB2YWx1ZSApID0+IGRhdGEuYXBwZW5kKCBuYW1lLCB2YWx1ZSApICk7XG5cblx0XHRcdGRhdGEuYXBwZW5kKCAnX2FqYXhfbm9uY2UnLCBvcHRpblZhcnMuY3VycmVudC5zYXZlX3NldHRpbmdzX25vbmNlICk7XG5cdFx0XHRkYXRhLmFwcGVuZCggJ2FjdGlvbicsICdodXN0bGVfc2F2ZV9zZXR0aW5ncycgKTtcblxuXHRcdFx0Ly8gSGFuZGxlIHRoZSBidXR0b24gYmVoYXZpb3IuXG5cdFx0XHQkdGhpcy5hZGRDbGFzcyggJ3N1aS1idXR0b24tb25sb2FkJyApO1xuXHRcdFx0JHRoaXMucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG5cdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHR1cmw6IGFqYXh1cmwsXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0Y29udGVudFR5cGU6IGZhbHNlLFxuXHRcdFx0XHRwcm9jZXNzRGF0YTogZmFsc2Vcblx0XHRcdH0pXG5cdFx0XHQuZG9uZSggcmVzID0+IHtcblxuXHRcdFx0XHQvLyBJZiB0aGUgcmVzcG9uc2UgcmV0dXJuZWQgYWN0aW9uYWJsZSBkYXRhLlxuXHRcdFx0XHRpZiAoIHJlcy5kYXRhICkge1xuXG5cdFx0XHRcdFx0Ly8gSWYgdGhlcmUncyBhIGRlZmluZWQgY2FsbGJhY2ssIGNhbGwgaXQuXG5cdFx0XHRcdFx0aWYgKCByZXMuZGF0YS5jYWxsYmFjayAmJiAndW5kZWZpbmVkJyAhPT0gc2VsZlsgcmVzLmRhdGEuY2FsbGJhY2sgXSkge1xuXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGNhbGxzIHRoZSBcImFjdGlvbnsgaHVzdGxlIGFjdGlvbiB9XCIgZnVuY3Rpb25zIGZyb20gdGhpcyB2aWV3LlxuXHRcdFx0XHRcdFx0Ly8gRm9yIGV4YW1wbGU6IGFjdGlvblRvZ2dsZVN0YXR1cygpO1xuXHRcdFx0XHRcdFx0c2VsZlsgcmVzLmRhdGEuY2FsbGJhY2sgXSggJHRoaXMsIHJlcy5kYXRhLCByZXMuc3VjY2VzcyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggcmVzLmRhdGEudXJsICkge1xuXHRcdFx0XHRcdFx0aWYgKCB0cnVlID09PSByZXMuZGF0YS51cmwgKSB7XG5cdFx0XHRcdFx0XHRcdGxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bG9jYXRpb24ucmVwbGFjZSggcmVzLmRhdGEudXJsICk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2UgaWYgKCByZXMuZGF0YS5ub3RpZmljYXRpb24gKSB7XG5cblx0XHRcdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggcmVzLmRhdGEubm90aWZpY2F0aW9uLnN0YXR1cywgcmVzLmRhdGEubm90aWZpY2F0aW9uLm1lc3NhZ2UsIHJlcy5kYXRhLm5vdGlmaWNhdGlvbi5kZWxheSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIERvbid0IHJlbW92ZSB0aGUgJ2xvYWRpbmcnIGljb24gd2hlbiByZWRpcmVjdGluZy9yZWxvYWRpbmcuXG5cdFx0XHRcdFx0aWYgKCAhIHJlcy5kYXRhLnVybCApIHtcblx0XHRcdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0XHRcdCR0aGlzLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBVc2UgZGVmYXVsdCBhY3Rpb25zIG90aGVyd2lzZS5cblx0XHRcdFx0XHRpZiAoIHJlcy5zdWNjZXNzICkge1xuXHRcdFx0XHRcdFx0TW9kdWxlLk5vdGlmaWNhdGlvbi5vcGVuKCAnc3VjY2VzcycsIG9wdGluVmFycy5tZXNzYWdlcy5zZXR0aW5nc19zYXZlZCApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRNb2R1bGUuTm90aWZpY2F0aW9uLm9wZW4oICdlcnJvcicsIG9wdGluVmFycy5tZXNzYWdlcy5zb21ldGhpbmdfd2VudF93cm9uZyApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdCQoICcuc3VpLWJ1dHRvbi1vbmxvYWQnICkucmVtb3ZlQ2xhc3MoICdzdWktYnV0dG9uLW9ubG9hZCcgKTtcblx0XHRcdFx0XHQkdGhpcy5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmVycm9yKCByZXMgPT4ge1xuXHRcdFx0XHQkKCAnLnN1aS1idXR0b24tb25sb2FkJyApLnJlbW92ZUNsYXNzKCAnc3VpLWJ1dHRvbi1vbmxvYWQnICk7XG5cdFx0XHRcdCR0aGlzLnByb3AoICdkaXNhYmxlZCcsIGZhbHNlICk7XG5cdFx0XHRcdE1vZHVsZS5Ob3RpZmljYXRpb24ub3BlbiggJ2Vycm9yJywgb3B0aW5WYXJzLm1lc3NhZ2VzLnNvbWV0aGluZ193ZW50X3dyb25nICk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQ2FsbGJhY2sgYWN0aW9uIGZvciB3aGVuIHNhdmluZyByZUNhcHRjaGFzLlxuXHRcdCAqIEBzaW5jZSA0LjEuMFxuXHRcdCAqL1xuXHRcdGFjdGlvblNhdmVSZWNhcHRjaGEoKSB7XG5cdFx0XHR0aGlzLnJlY2FwdGNoYVZpZXcubWF5YmVSZW5kZXJSZWNhcHRjaGFzKCk7XG5cdFx0fSxcblxuXHRcdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRcdC8vIERJQUxPR1xuXHRcdC8vIE9wZW4gZGlhbG9nXG5cdFx0cmVzZXREaWFsb2c6IGZ1bmN0aW9uKCBlICkge1xuXG5cdFx0XHR2YXIgJGJ1dHRvbiA9IHRoaXMuJCggZS50YXJnZXQgKSxcblx0XHRcdFx0JGRpYWxvZyA9ICQoICcjaHVzdGxlLWRpYWxvZy0tcmVzZXQtc2V0dGluZ3MnICksXG5cdFx0XHRcdCR0aXRsZSAgPSAkZGlhbG9nLmZpbmQoICcjZGlhbG9nVGl0bGUnICksXG5cdFx0XHRcdCRpbmZvICAgPSAkZGlhbG9nLmZpbmQoICcjZGlhbG9nRGVzY3JpcHRpb24nICk7XG5cblx0XHRcdCR0aXRsZS50ZXh0KCAkYnV0dG9uLmRhdGEoICdkaWFsb2ctdGl0bGUnICkgKTtcblx0XHRcdCRpbmZvLnRleHQoICRidXR0b24uZGF0YSggJ2RpYWxvZy1pbmZvJyApICk7XG5cblx0XHRcdFNVSS5kaWFsb2dzWydodXN0bGUtZGlhbG9nLS1yZXNldC1zZXR0aW5ncyddLnNob3coKTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0fVxuXHR9KTtcblxuXHRuZXcgdmlld1NldHRpbmdzKCk7XG5cbn0pO1xuIl19
