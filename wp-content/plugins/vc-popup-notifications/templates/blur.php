 <script type="text/javascript">

	  (function($){
		$(function(){

		$.amaran({
				content:{
					message:"<?php echo $message ?>",
					title:"<?php echo $heading ?>",
					container: "<?php echo $unique_id ?>",
				},
				width:"<?php echo $width ?>",
				height:"<?php echo $height ?>",
				theme:'blur ',
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