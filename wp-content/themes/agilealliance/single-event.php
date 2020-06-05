
<?php the_content(); ?>

<script>
// I need to investigate this. For some reason, the
// enqueued script is getting extraneous characters
// appended which makes JS error out. Leaving this
// here for the time being

(function($) {
  var registrationForm = {
        init: function() {
          this.formSubmit();
          this.showHideFields();
          this.groupRegistration();
        },

        formSubmit: function() {
          $('#event-register').on('submit', function(e){
            e.preventDefault();
            registrationForm.clearErrors();
            var postData = $(this).serialize();
            $.ajax({
              method: "POST",
              url: '/wp-admin/admin-ajax.php',
              data: postData,
              dataType: 'json',
              success: function(data){
                if(data.hasErrors) {
                  registrationForm.displayErrors(data);
                } else {
                  alert('Registration OK. Paid: ' + data.paid);
                  document.location.reload(true);
                }
              },
              error: function(error) {
                console.log(error);
              }
            });
          });
        },

        displayErrors: function(errorData) {
          //Iterate over fields with errors
          $.each(errorData, function(key, val) {
            var field = $('#' + key);
            var renderedErrors = registrationForm.renderErrors(val);
            field.after(renderedErrors);
          });
        },

        renderErrors: function(errors) {
          var rendered = $('<ul class="errors"></ul>');
          $.each(errors, function(key, val) {
            rendered.append('<li>' + val + '</li>');
          });
          return rendered;
        },

        clearErrors: function() {
          $('ul.errors').remove();
        },

        //@TODO refactor this barf
        showHideFields: function() {

          // Dietary/accessibility needs
          $('input[name="specialNeeds"]').on('change', function() {
            if($('input[name="specialNeeds"]:checked').val() === 'yes') {
              $('.dietary').removeClass('hidden');
            } else if ($('input[name="specialNeeds"]:checked').val() === 'no') {
              $('.dietary').addClass('hidden');
            }
          });

          // Payment method cc/invoice
          $('#paymentMethod').on('change', function() {
            var ccFields = $('.cc');
            var invoiceFields = $('.invoice');
            if($(this).attr('value') === 'credit card') {
              ccFields.removeClass('hidden');
              invoiceFields.addClass('hidden');
            } else if($(this).attr('value') === 'invoice') {
              ccFields.addClass('hidden');
              invoiceFields.removeClass('hidden');
            }
          });

          // Canada or US, show state/province
          $('select[name="country"]').on('change', function() {
            if($(this).val() === 'US' || $(this).val() === 'CA') {
              $('.state-province').removeClass('hidden');
              if($(this).val() === 'US') {
                $('option[data-type="province"]').hide();
                $('option[data-type="state"]').show();
              } else {
                $('option[data-type="province"]').show();
                $('option[data-type="state"]').hide();
              }
            } else {
               $('.state-province').addClass('hidden');
            }
          });

          // Country/state for CC payment. @TODO really, refactor this
          $('select[name="ccCountry"]').on('change', function() {
            if($(this).val() === 'US' || $(this).val() === 'CA') {
              $('.cc-state-province').removeClass('hidden');
              if($(this).val() === 'US') {
                $('option[data-type="province"]').hide();
                $('option[data-type="state"]').show();
              } else {
                $('option[data-type="province"]').show();
                $('option[data-type="state"]').hide();
              }
            } else {
               $('.cc-state-province').addClass('hidden');
            }
          });
      },

      groupRegistration: function() {
        $('input[name="quantity"]').on('change', function(){
          if($(this).val() > 1) {
            //alert('its group');
          }
        });
      }
  }
  // Initialize
  registrationForm.init();
})(jQuery)
</script>
