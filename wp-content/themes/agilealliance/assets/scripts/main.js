/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 * ======================================================================== */

(function($) {

  // Use this variable to set up the common and page specific functions. If you
  // rename this variable, you will also need to rename the namespace below.
  var Sage = {
    // All pages
    'common': {
      init: function() {

        var $body = $('body');
        var $html = $('html');
        function isHeaderExpanded() {
          return $html.hasClass('no-touch') && window
              .getComputedStyle($body[0], ':before')
              .getPropertyValue('content')
              .replace(/\"/g, '') === 'has-expanded-menu';
        }

        // Hover effects for primary navigation
        $('.js-hover-dropdown .dropdown').hover(
          function() {
            if (!isHeaderExpanded()) return;
            $(this).find('.dropdown-toggle').addClass('disabled');
          },
          function() {
            if (!isHeaderExpanded()) return;
            $(this).find('.dropdown-toggle').removeClass('disabled');
          }
        );

        // Add overview links to top level menu dropdowns
        $('.primary-navigation > li:has(.dropdown-menu)').each(function() {
           var $this = $(this);
           $this
             .clone()
             .remove('.dropdown-menu')
             .find('> a')
               .removeAttr('data-toggle')
               .removeClass('dropdown-toggle')
               .find('.dropdown-indicator')
                 .remove()
                 .end()
               .end()
             .addClass('menu-item--overview-link')
             .prependTo($this.find('> .dropdown-menu'));
        });

        // Hide open dropdowns on click/tap outside of nav
        $(document).on('click', function (event) {
          var clickover = $(event.target);
          var $navbar = $(".navbar-collapse");
          var _opened = $navbar.hasClass("in");
          var isClickInForm = !!clickover.parents('.mobile-search-form').length;
          if (_opened === true && !clickover.hasClass("navbar-toggle") && !isClickInForm) {
            $navbar.collapse('hide');
          }
        });

        // -----  Detect of IE and get version  -----
        function isIE () {
          var myNav = navigator.userAgent.toLowerCase();
          return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        }

        // -----  Image overlay wrap injection (~/our-people)  -----
        $('.aa_our-people-hover').wrap('<div class="aa_img-overlay" style="min-height:200px;"></div>');

        // ----- s2Member default fields label animation  -----
        function s2_labelAnimation(target) {
          $(target).filter('[value!=""]').closest('label').find('span:first-of-type').addClass('isFocus');

          $(target).on('focus', function() {
            $(this).closest('label').find('span:first-of-type').addClass('isFocus');

            $(this).focusout(function(event) {
              if ($(this).val() !== "") {
                $(this).closest('label').find('span:first-of-type').addClass('isFocus');
              }else {
                $(this).closest('label').find('span:first-of-type').removeClass('isFocus');
              }
            });
          });
        }

        // ----- s2Member custom fields label animation  -----
        function s2_labelAnimation__CustomField(target) {
          $(target).filter('[value!=""]').closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');

          $(target).on('focus', function() {
            $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');

             $(this).focusout(function(event) {
              if ($(this).val() !== "") {
                $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');
              }else {
                $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').removeClass('isFocus');
              }
            });
          });
        }

        // ----- Gravity Forms label animation  -----
        function gf_labelAnimation(target) {
          // Remove autocomplete show labels fallback if form is Event Submission Form
          $(target).filter('[value!=""]:not(textarea):not(.hasDatepicker)').closest('.gfield').find('label').addClass('isFocus');

          $(target).on('focus', function() {
            $(this).addClass('isFocus').closest('.gfield').find('label').addClass('isFocus');

            $(this).focusout(function(event) {
              if ($(this).val() !== "") {
                $(this).addClass('isFocus').closest('.gfield').find('label').addClass('isFocus');
              }else {
                $(this).removeClass('isFocus').closest('.gfield').find('label').removeClass('isFocus');
              }
            });
          });

          // Change opacity on textarea label
          $(target).filter('textarea').closest('.gfield').find('label').css('opacity', '1');
        }

        function gf_labelAnimationSelect(target) {
          $(target).closest('.gfield').find('label').addClass('isFocus');

          $(target).focusout(function(event) {
            $(this).closest('.gfield').find('label').addClass('isFocus');
          });
        }

        // ----- Gravity Forms label NO animation  -----
        function gf_label_noAnimation(target) {
          $(target).find('label').css({
            'font-size': '16px',
            'top': '0',
            'opacity': '1'
          });
        }

        // ----- Advanced Custom Fields label animation  -----
        function acf_labelAnimation(target) {
          $(target).filter('[value!=""]').addClass('isFocus').closest('.acf-field').find('.acf-label').addClass('isFocus');

          var $url = window.location.href;
          var $lastPart = $url.substr($url.lastIndexOf('/') + 1);
          if ($lastPart === "?action=edit") {

              $(target).removeAttr('placeholder');
              $(target).addClass('isFocus').closest('.acf-field').find('.acf-label').addClass('isFocus');

          } else {

            $(target).on('focus', function() {
              $(this).addClass('isFocus').closest('.acf-field').find('.acf-label').addClass('isFocus');

              $(this).focusout(function(event) {
                if ($(this).val() !== "") {
                  $(this).addClass('isFocus').closest('.acf-field').find('.acf-label').addClass('isFocus');
                }else {
                  $(this).removeClass('isFocus').closest('.acf-field').find('.acf-label').removeClass('isFocus');
                }
              });
            });
          }
        }

        // ----- Controllable Layout Form -----
        function tft_labelAnimation(target) {
          $(target).filter('[value!=""]').prev('label').addClass('isFocus');

          $(target).on('focus', function() {
            $(this).prev('label').addClass('isFocus');

            $(this).focusout(function(event) {
              if ($(this).val() !== "") {
                $(this).prev('label').addClass('isFocus');
              }else {
                $(this).prev('label').removeClass('isFocus');
              }
            });
          });
        }


        // ----- Checkout Form  -----
        s2_labelAnimation('#s2member-pro-authnet-checkout-form input');
        s2_labelAnimation__CustomField('#s2member-pro-authnet-checkout-form-custom-fields-section input');

        // ----- Non-member Registration Form  -----
        s2_labelAnimation('#s2member-pro-authnet-registration-form input');
        s2_labelAnimation__CustomField('#s2member-pro-authnet-registration-form-custom-fields-section input');

        // ----- Gravity Forms  -----
        gf_labelAnimation('.gform_wrapper input[type="text"], .gform_wrapper input[type="tel"], .gform_wrapper input[type="email"], .gform_wrapper textarea');
        // Membership Options
        gf_labelAnimationSelect('.gform_wrapper select, .gform_wrapper input[type="radio"]');
        gf_labelAnimationSelect('#gform_fields_16 select, #gform_fields_16 input[type="radio"]');
        // Events Registration
        gf_labelAnimationSelect('#event-register select, .aa_country-code select');

        // ----- Gravity Forms NO animation -----
        gf_label_noAnimation('.aa_gf-form-show-labels');

        // ----- Global  -----
        gf_labelAnimationSelect('.gfield_checkbox');
        gf_labelAnimationSelect('.ginput_container_date');
        gf_labelAnimationSelect('.ginput_container_time');
        // gf_labelAnimationSelect('.ginput_container_phone');
        gf_labelAnimationSelect('.ginput_container_singleproduct');

        // IF form is not valid, show all labels
        if ( $('.validation_error').length ) {
          $('.gform_wrapper label').addClass('isFocus');
        }
        // ----- ACF Forms  -----
        acf_labelAnimation('.acf-input input, .acf-input textarea');

        // ----- CLF Form  -----
        tft_labelAnimation('.input-group input');

        // ----- GF Autofill Label Animation -----
        // On Page Load
        // function gf_autofillLabelAnimation(target) {
        //   if ( $('#gform_fields_8 #field_8_1 select').val() !== "" ) {
        //     $('#gform_fields_8 #field_8_1 select').addClass('isFocus').closest('.gfield').find('label').addClass('isFocus');
        //   }
        // }
        // // ----- ACF Forms  ----
        // gf_autofillLabelAnimation('#gform_fields_8 #field_8_1 select');

        // ----- ACF Autofill Label Animation -----
        function acf_autofillLabelAnimation(target) {
          $(target).on('change', function() {
            var $check = $(target).data('ui-autocomplete') !== undefined;
            if ( $check === false ) {
              $(this).addClass('isFocus').closest('.acf-field').find('.acf-label').addClass('isFocus');
            }
          });
        }
        // ----- ACF Forms  ----
        acf_autofillLabelAnimation('.acf-input input');

        // ----- ACF Autofill Label Animation -----
        function gf_autofillLabelAnimation(target) {
          $(target).on('change', function() {
            var $check = $(target).data('ui-autocomplete') !== undefined;
            if ( $check === false ) {
              $(this).addClass('isFocus').closest('.gfield').find('label').addClass('isFocus');
            }
          });
        }
        // ----- Gravity Forms  ----
        gf_autofillLabelAnimation('.gform_wrapper input, .gform_wrapper textarea, #gform_fields_16 #field_16_1 select#event-register select');

        // ----- S2 Autofill Label Animation -----
        function s2_autofillLabelAnimation(target) {
          $(target).on('change', function() {
            var $check = $(target).data('ui-autocomplete') !== undefined;
            if ( $check === false ) {
              $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');
            }
          });
        }
        // ----- S2 Forms  ----
        s2_autofillLabelAnimation('#s2member-pro-authnet-checkout-form input');
        s2_autofillLabelAnimation('#s2member-pro-authnet-registration-form input');

        // ----- S2select Autofill Label Animation -----
        function s2select_autofillLabelAnimation(target) {
          $(target).on('change', function() {
            var $check = $(target).data('ui-autocomplete') !== undefined;
            if ( $check === false ) {
              $(this).closest('label').find('span:first-of-type').addClass('isFocus');
            }
          });
        }
        // ----- S2 Forms  ----
        s2select_autofillLabelAnimation('#s2member-pro-authnet-checkout-form-custom-fields-section input');
        s2select_autofillLabelAnimation('#s2member-pro-authnet-registration-form-custom-fields-section input');

        // ----- Profile Edit Form - s2member (Textarea focus animation) ----
        $('#ws-plugin--s2member-profile textarea').on('focus', function() {
          $(this).addClass('isFocus');

          $(this).focusout(function() {
            $(this).removeClass('isFocus');
          });
        });

        // Adds placeholder to ACF field
        $('.acf-field input[name="acf[_post_title]"]').attr('placeholder', 'Organization Name *');

        // Can be refactored
        $('#s2member-pro-authnet-checkout-form-custom-reg-field-country-code-div select').on('focus', function() {
          $(this).find('option[value="US"]').attr('selected', 'selected');
          $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');
          $(this).css('color', '#666').addClass('valid');
        });

        // Can be refactored
        $('#s2member-pro-authnet-checkout-form-custom-reg-field-preferred-email-div select').on('focus', function() {
          $(this).find('option:eq(1)').attr('selected', 'selected');
          $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');
          $(this).css('color', '#666').addClass('valid');
        });

        // Can be refactored
        $('#event-register .gfield select').on('focus', function() {
          // $(this).closest('.s2member-pro-authnet-form-div').find('label span:first-of-type').addClass('isFocus');
          $(this).closest('.gfield').find('label').addClass('isFocus');
        });

        // Can be refactored
        $('.aa_country-code select').on('focus', function() {
          $(this).closest('.gfield').find('label').addClass('isFocus');
        });

        // Can be refactored
        $('.aa_gf-member-type select').on('focus', function() {
          $(this).closest('.ginput_container_select').find('label').addClass('isFocus');
          $(this).css('border-color', '#468847');
        });

        // CC expiration date section
        $('.s2member-pro-authnet-card-expiration-month').find('option:first-of-type').text('Month *');
        $('.s2member-pro-authnet-card-expiration-year').find('option:first-of-type').text('Year *');
        $('.s2member-pro-authnet-checkout-form-country-div').find('select').before('<i class="fa fa-chevron-down aa_icon"></i>');
        $('.s2member-pro-authnet-checkout-form-country-label').find('br').remove();

        // S2Member custom select(dropdown) wrapper function
        function customSelectWrap(target, wprClass){
          var $targetEl = $(target).find('select'),
              // $wprClass = wprClass.replace(/"([^"]+(?="))"/g, '$1');
              // $wprClass = wprClass.replace(/['"]+/g, ''),
              $wrpContent = '<div class="aa_s2pro-form-select-wpr ' + wprClass + '"></div>';

          $targetEl.wrap($wrpContent);
          $targetEl.before('<i class="fa fa-chevron-down aa_icon"></i>');

          // $(target).find('select option:first-of-type').attr({
          //   disabled: 'disabled',
          //   selected: 'selected'
          // });
        }

        // Country code dropdown
        customSelectWrap('.s2member-pro-authnet-checkout-form-custom-reg-field-country-code-div', 'aa_country-code');

        // Preferred email dropdown
        customSelectWrap('.s2member-pro-authnet-checkout-form-custom-reg-field-preferred-email-div', 'aa_preferred-email');

        // Profile Edit Form - s2member
        customSelectWrap('#ws-plugin--s2member-profile td', 'aa_edit-profile-select');

        // Member type selection G-forms
        customSelectWrap('.ginput_container_select', 'aa_gf-membership-type-select');

        // Resource Grid Filter
        customSelectWrap('.aa_dropdown', 'aa_dropdown-wrapper');

        // Adds styling classes to Step 1 of Membership flow
        $('.gform_wrapper, #ws-plugin--s2member-profile').find('input[type="submit"]').addClass('aa_btn btn btn-primary');

        // Profile Edit Form - s2member
        // Remove validation attributes for jQuery Validate plugin
        $('#ws-plugin--s2member-profile input[type="text"]').removeAttr('placeholder data-validation data-validation-error-msg');
        $('#ws-plugin--s2member-profile select').removeAttr('data-validation data-validation-error-msg');

        function removeActive(){
          $('.translation-dropdown, .aa_caret-icon, .navigation-trigger').removeClass('isActive');
          //disableAnchor('#lang_sel_click');
        }

        // ----- Form validation  -----
        if (isIE() !== 9) {

          $.validate({
            modules : 'security',
            form : 'form:not(#s2member-pro-authnet-checkout-form)'
          });

          // Removes autocomplete from Newsletter Signup form
          $('#mc4wp-form-1').find('form').attr({
            autocomplete: 'off',
            novalidate: 'novalidate'
          });
        }
        // Adds the spinning icon to newsletter signup
        $('.mc4wp-ajax-loader').addClass('fa fa-refresh fa-spin');

        //$('.aa_footer-newsletter-signup').on('click', function(event) {
        //  event.preventDefault();
        //  // Resets Newsletter signup form when modal is opened
        //  $('#footer-newsletter-signup-form form').get(0).reset();
        //  removeActive();
        //});

        // Bootstrap modal
        $('.modal-backdrop').addClass('fadeIn');

        $( document ).ajaxComplete(function() {
          if ($('#newsletterSignup #mc4wp-form-1').hasClass('mc4wp-form-success') || $('#newsletterSignup #mc4wp-form-1').hasClass('mc4wp-form-success')) {
            $('#newsletterSignup .modal-header').hide();
          }
        });

        $( document ).ajaxComplete(function() {
          if ($('#conferenceNewsletterSignUp #mc4wp-form-1').hasClass('mc4wp-form-success') || $('#conferenceNewsletterSignUp #mc4wp-form-1').hasClass('mc4wp-form-success')) {
            $('#conferenceNewsletterSignUp .modal-header').hide();
          }
        });


        $('.language-selector').on('click', function(event) {
          event.preventDefault();
          var $headerIconsItems = $('#lang_sel_click, .aa_caret-icon, .navigation-trigger');

          $headerIconsItems.toggleClass('isActive');
        });

        // Add "SIGN OUT" text to login modal
        $('.ws-plugin--s2member-pro-login-widget-profile-summary-logout').find('a').text('SIGN OUT');

        //
        // TEMP TRIGGER FOR MOBILE VIEW
        // --------------------------------------------------
        $('.membership-temp').on('click', function(event) {
          event.preventDefault();
          $('.aa_login').trigger('click');
        });

        // ----- Show global search  -----
        var $searchTrigger = $('.js-search-trigger');
        var $searchContainer = $searchTrigger.parent().parent();
        var $searchInput = $searchContainer.find('.js-header-search-input');
        $searchTrigger.on('click', toggleSearchInput);
        function toggleSearchInput(e) {
          e.preventDefault();
          $searchContainer.toggleClass('search-container--open');
          if ($searchInput.is(':visible')) {
            $searchInput.focus();
          }
        }

        var $scrollAwareElements = $('.aa_caret-icon, #lang_sel_click, body');
        $(window).scroll( function() {
          var $scroll = $(this).scrollTop();

          if ($scroll > 50 ){
            $scrollAwareElements.addClass('isReduced');
          } else {
            $scrollAwareElements.removeClass('isReduced');
          }
        });

        // Header inputs generated s2Members
        $('#ws-plugin--s2member-pro-login-widget-username').attr('placeholder', 'Username');
        $('#ws-plugin--s2member-pro-login-widget-password').attr('placeholder', 'Password');
        $('.member_login_widget .btn').attr('value', 'SIGN IN');

        function baselineMatchHeight(el, target) {
          if ($(window).width() > 500) {
            var height = $(el).outerHeight();

            // Match height of Twitter feed section
            $(target).css( 'height', height );

            /*Recalculate on window resize*/
            $(window).on('resize', function() {
              var height = $(el).outerHeight();

              $(target).css( 'height', height );
            });
          }
        }

      //
      // Match Height of Columns Prototype
      // --------------------------------------------------
        var maxHeight = -1;

        // Calcuate Height prototype
        $.fn.calcHeight = function () {
          return this.each(function () {
            maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
          });
        };

        function matchHeight(el, late) {

          if (late) {
            adjustHeights(el);
          } else {
            $(window).load(function() {
              adjustHeights(el);
            });
          }

          function adjustHeights(el) {
            $(el).each(function() {
              $(el).calcHeight();
              $(this).height(maxHeight);
              maxHeight = -1;
            });
          }

        }

        function matchHeightResize(el) {

          // Trigger when resized
          $(window).on('resize', function() {

            $(el).css('height', 'auto'); // Reset height
            $(el).each(function() {

              $(el).calcHeight();
              $(this).height(maxHeight);

              maxHeight = -1;
            });
          });
        }

        function matchHeightBasic(el) {
          matchHeight(el);
          matchHeightResize(el);
        }

        // ----- Twitter feed card  -----
        var dfd1 = $.Deferred();
        var dfd2 = $.Deferred();

        $.when( dfd1, dfd2 ).done(function () {
            matchHeight('.tweet_data');
            // baselineMatchHeight('.footer-social-section', '.footer-newsletter-signup');
            $(window).resize();
        });

        dfd1.resolve();
        dfd2.resolve();

        // ----- Twitter feed card Resize-----
        $(window).on('resize', function() {

          $.when( dfd1, dfd2 ).done(function (  ) {
            matchHeightResize('.tweet_data');
            // baselineMatchHeight('.footer-social-section', '.footer-newsletter-signup');
          });

          dfd1.resolve();
          dfd2.resolve();
        });


        // Basic match height instances
        // -- Archives
        matchHeightBasic('.aa_arc-card-content');
        matchHeightBasic('.aa_cta-section');
        // -- Membership Pricing
        matchHeightBasic('.aa_membership-pricing-section-header');
        matchHeightBasic('.aa_pricing-block-text p');

        // -- Conference Site - Latest Updates
        matchHeightBasic('.aa_cs-updates-card');
        // $(document).bind('ajaxComplete', function(){
        //   matchHeight('.aa_cs-updates-card');
        // });

        // Over 500px match height instances
        if ($(window).width() > 500) {
          // -- 12 Principles
          matchHeightBasic('.aa_principles-list');
          // -- Archives
          matchHeightBasic('.aa_archive-content');
          // -- Membership Pricing
          matchHeightBasic('.ult_price_features ul');
          matchHeightBasic('.aa_member-oppprtunities');
          // -- Profile/Organizations
          matchHeightBasic('.aa_acf-content-top');
          matchHeightBasic('.aa_acf-content-secondary');
          matchHeightBasic('.aa_profile-org .titleHeight');
        }

        // Profile/Organizations
        if ( $('.aa_admin-btn-wpr').length === 1 ) {
          $('.aa_logo-title-wpr').parent().addClass('adminAccessWpr');
        }


      //
      // Event Registration
      // --------------------------------------------------
      var $eventInputs = $('#event-register ul');
      if ($eventInputs.find('select[name="regId"]').length) {
        // Manage Group Registrations Form
        $eventInputs.find('li:lt(1)').wrapAll('<div class="aa_event-reg-form s1"></div>');
        $eventInputs.not('.aa_event-reg-form').find('div.checkbox').first().prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s2"></div>');
        $eventInputs.not('.aa_event-reg-form').find('li:eq(8)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s3"></div>');
        $eventInputs.not('.aa_event-reg-form').find('li:eq(12)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s4"></div>');
        $eventInputs.not('.aa_event-reg-form').find('> .checkbox, > li').wrapAll('<div class="aa_event-reg-form s5"></div>');

        $('.aa_event-reg-form.s1').before('<h3>Group Registration Management</h3>');
        $('.aa_event-reg-form.s2').before('<h3>Contact Information</h3>');
        $('.aa_event-reg-form.s3').before('<h3>Company Information</h3>');
        $('.aa_event-reg-form.s4').before('<h3>Location and Experience</h3>');
        $('.aa_event-reg-form.s5').before('<h3>Possible Restrictions</h3>');


        var loadingSpinner = $('<div class="loading-spinner" style="display: block;">' +
          '<div class="ui-spinner">' +
          '<span class="side side-left">' +
          '<span class="fill"></span>' +
          '</span>' +
          '<span class="side side-right">' +
          '<span class="fill"></span>' +
          '</span>' +
          '</div>' +
          '</div>');
        $eventInputs.parent().addClass('group-registration__form').after(
          $('<nav id="svc_infinite" class="group-registration__loading text-center" style="width: 100%;"/>')
            .append(loadingSpinner)
        );
      } else if ($eventInputs.find('select[name="ticketType"]').length) {
        // Event Registration Form
        $eventInputs.find('li:lt(3)').wrapAll('<div class="aa_event-reg-form s1"></div>');
        $eventInputs.find('div.aa_checkbox').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s2"></div>');
        $eventInputs.find('li:eq(10)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s3"></div>');
        $eventInputs.find('li:eq(14)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s4"></div>');
        $eventInputs.find('li:eq(18)').prevAll('li').prev().andSelf().wrapAll('<div class="aa_event-reg-form s5"></div>');
        $eventInputs.find('li:eq(18)').nextUntil('input').andSelf().wrapAll('<div class="aa_event-reg-form s6"></div>');

        $('.aa_event-reg-form.s1').before('<h3>Ticket Options</h3>');
        $('.aa_event-reg-form.s2').before('<h3>Contact Information</h3>');
        $('.aa_event-reg-form.s3').before('<h3>Company Information</h3>');
        $('.aa_event-reg-form.s4').before('<h3>Location and Experience</h3>');
        $('.aa_event-reg-form.s5').before('<h3>Possible Restrictions</h3>');
        $('.aa_event-reg-form.s6').before('<h3>Payment</h3>');
      } else if ($eventInputs.length) {
        // Single Registration Management Form
        // $eventInputs.find('li:lt(1)').wrapAll('<div class="aa_event-reg-form s1"></div>');
        $eventInputs.not('.aa_event-reg-form').find('div.checkbox').first().prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s2"></div>');
        $eventInputs.not('.aa_event-reg-form').find('> li:eq(3)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s3"></div>');
        $eventInputs.not('.aa_event-reg-form').find('> li:eq(3)').prevAll('li').andSelf().wrapAll('<div class="aa_event-reg-form s4"></div>');
        $eventInputs.not('.aa_event-reg-form').find('> .checkbox, > li').wrapAll('<div class="aa_event-reg-form s5"></div>');

        // $('.aa_event-reg-form.s1').before('<h3>Group Registration Management</h3>');
        $('.aa_event-reg-form.s2').before('<h3>Contact Information</h3>');
        $('.aa_event-reg-form.s3').before('<h3>Company Information</h3>');
        $('.aa_event-reg-form.s4').before('<h3>Location and Experience</h3>');
        $('.aa_event-reg-form.s5').before('<h3>Possible Restrictions</h3>');
      }

      $eventInputs.find('div.checkbox').addClass('aa_checkbox');

        //
      // Misc
      // --------------------------------------------------

      // Adds download attribute to Logo Files CTA
      $('.aa_logo-download-card a').attr('download', 'download');

      // Scroll to form - Event single
      $('.scrollToForm').on('click', function(event) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: $('#aa_event-reg-form').offset().top - 75
        }, 1000);
      });

      // Hide label and change color of placeholder option
      if ($('#event-register select option:eq(0):selected')) {
        $('#event-register select').addClass('hasPlaceholder').closest('.gfield').find('label').removeClass('isFocus');
      }

      if ($('.aa_country-code select option:eq(0):selected')) {
        $('.aa_country-code select').addClass('hasPlaceholder').closest('.gfield').find('label').removeClass('isFocus');
      }

      // Changes select color if Placeholder is selected
      function gf_labelAnimationSelect__withPlaceholder(target) {
        $(target).on('change', function() {
          if ($(target + 'option:eq(0):selected')) {
            $(this).removeClass('hasPlaceholder');
          } else {
             $(this).addClass('hasPlaceholder');
          }
        });
      }

      gf_labelAnimationSelect__withPlaceholder('#event-register select, .aa_country-code select');

      // Adds "number" attr to GF inputs to overright GF bug
      $('.ginput_container_number input').removeAttr('type').attr('type', 'number');

      // Quick hack for Events Registration form - adds type="number", removes type="tel"
      $('#event-register input[type="tel"]').removeAttr('type').attr('type', 'number');

      // Adds "show" class to GF "Total" label
      $('.gform_wrapper .ginput_total').closest('.gfield').find('label').addClass('isFocus');

      // Hides the GF title label for Advanced Fields -> Address
      $('.ginput_container_address').closest('.gfield').find('label').hide();

      // Hides the GF title label for Advanced Fields -> No CAPTCHA
      $('.g-recaptcha').parent().closest('.gfield').find('label').hide();

      // Current url to .active href comparison prototype
      function compareHrefToUrl(targetEl) {
        var currentUrl = window.location.pathname,
            menuItemHref   = '';

        $.fn.itemHref = function () {
          return this.each(function () {
            menuItemHref = menuItemHref === currentUrl ? menuItemHref : $(this).attr('href');
          });
        };

        $(targetEl).itemHref();
        return menuItemHref;
      }

      var subMenuHref = compareHrefToUrl('.hvr-overline-reveal.active a');
      if (subMenuHref !== window.location.pathname) {
        $('.hvr-overline-reveal.active').removeClass('active');
        $('.hvr-overline-reveal a[href="'+ subMenuHref +'"]').parent().addClass('active');
      }

      },
      finalize: function() {
        // JavaScript to be fired on all pages, after page specific JS is fired
      }
    },
    // Home page
    'home': {
      init: function() {},
      finalize: function() {}
    },
    // blog page
    'blog': {
      init: function() {

        $(document).ajaxComplete(function(event, xhr, settings) {
          $('.alm-reveal').addClass('ui special cards');
        });

      },
      finalize: function() {
        // JavaScript to be fired on the home page, after the init JS
      }
    },
    'page_template_template_s2member_checkout_form': {
      init: function() {
        var stni = $('#s2member-pro-authnet-checkout-custom-reg-field-subscribe-to-newsletter');
        var countrySelect = $('#s2member-pro-authnet-checkout-country');
        var stateInputContainer = $('#s2member-pro-authnet-checkout-form-state-div');
        var stateInput = $('#s2member-pro-authnet-checkout-state');
        var stateContainerAndInputExistCond = (stateInput.length > 0 && stateInputContainer.length > 0);
        var isUsOrCanada = function(value) { return (value === 'US' || value === 'CA'); };
        var notApplicableValue = 'NotApplicable';

        if(stni.length > 0) {
          stni.prop('checked', true);
        }

        if (countrySelect.length > 0) {
          countrySelect.val('');
          countrySelect.find('option:first').text('Choose Country *');
          countrySelect.on('change', function (e) {
            var self = $(e.target);
            var countryValue = self.val();
            var selfIsUsOrCanada = isUsOrCanada(countryValue);

            if (stateContainerAndInputExistCond && selfIsUsOrCanada) {
              if (!stateInputContainer.is(':visible')) {
                stateInputContainer.show();
                if (stateInput.val() === notApplicableValue) {
                  stateInput.val('');
                }
              }
            } else if (stateContainerAndInputExistCond) {
              if (stateInputContainer.is(':visible')) {
                stateInput.val(notApplicableValue);
                stateInputContainer.hide();
              }
            }
          });

          if (stateContainerAndInputExistCond &&
              countrySelect.length > 0 &&
              !isUsOrCanada(countrySelect.val()) &&
              stateInputContainer.is(':visible'))
          {
            stateInputContainer.hide();
          } else {
            if (stateInput.val() === notApplicableValue) {
              stateInput.val('');
            }
          }
        }

      },
      finalize: function() {}
    }
  };

  // The routing fires all common scripts, followed by the page specific scripts.
  // Add additional events for more control over timing e.g. a finalize event
  var UTIL = {
    fire: function(func, funcname, args) {
      var fire;
      var namespace = Sage;
      funcname = (funcname === undefined) ? 'init' : funcname;
      fire = func !== '';
      fire = fire && namespace[func];
      fire = fire && typeof namespace[func][funcname] === 'function';

      if (fire) {
        namespace[func][funcname](args);
      }
    },
    loadEvents: function() {
      // Fire common init JS
      UTIL.fire('common');

      // Fire page-specific init JS, and then finalize JS
      $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function(i, classnm) {
        UTIL.fire(classnm);
        UTIL.fire(classnm, 'finalize');
      });

      // Fire common finalize JS
      UTIL.fire('common', 'finalize');
    }
  };

  // Load Events
  $(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.
