<script type="text/javascript">

	  (function($){
		$(function(){

			jQuery.amaran({
				content:{
				img:"<?php echo $image ?>",
		        title:"<?php echo $heading ?>",
		        content: "<?php echo $message ?>",
		        container: "<?php echo $unique_id ?>"
				},
				width:"<?php echo $width ?>",
				height:"<?php echo $height ?>",
				theme:'readmore <?php echo $variation ?>',
				sticky:<?php echo $sticky ?>,
				fullwidth: <?php echo $fullwidth ?>,
				position:"<?php echo $position ?>",
				<?php echo $in_effect ?>,
				<?php echo $out_effect ?>,
				startdelay:"<?php echo $startdelay ?>",
			    delay:"<?php echo $delay ?>",
				closeOnClick:<?php echo $closeonclick?>,
				closeButton:<?php echo $closebutton; ?>,
				container: "<?php echo $unique_id ?>",
				times: "<?php echo $times; ?>"
			});

		})

	  })(jQuery)
	  </script>