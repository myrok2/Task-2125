(function( $, window, document, undefined ) {
    jQuery('.colorwell').wpColorPicker();
      //end colorpicker

    var file_frame;

    jQuery('body').on('click','.wpgldpnl_media_upload', function( event ){
        event.preventDefault();
        var widget_id = jQuery(this).closest('.widget').attr('id');

        // Create the media frame.
        file_frame = wp.media.frames.file_frame = wp.media({
          title: jQuery( this ).data( 'uploader_title' ),
          button: {
            text: jQuery( this ).data( 'uploader_button_text' ),
          },
          multiple: false  // Set to true to allow multiple files to be selected
        });

        // When an image is selected, run a callback.
        file_frame.on( 'select', function() {
          // We set multiple to false so only get one image from the uploader
          attachment = file_frame.state().get('selection').first().toJSON();
          jQuery('input.gldpnl_icon_settings_image').val(attachment.url);
          jQuery('div.wpgldpnl_media_image').html('<img src="'+ attachment.url +'" />');
          // jQuery('#wpautbox_user_image_url').html('<img src="'+ attachment.url +'" width="120"/><br />');
          // Do something with attachment.id and/or attachment.url here
        });

        // Finally, open the modal
        file_frame.open();
    });

    jQuery('.wpgldpnl_remove_image').on('click',function(){
        jQuery('input.gldpnl_icon_settings_image').val('');
          jQuery('div.wpgldpnl_media_image').html('');
    });

})( jQuery, window, document );