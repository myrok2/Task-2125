

 <script type="text/javascript">

	  (function($){
		$(function(){

			$.amaran({
				content:{
					message:"<?php echo $heading ?>",
					size:"<?php echo $sub_heading ?>",
					file:"<?php echo $message ?>",
					icon:'<?php echo $icon ?>',
					container: "<?php echo $unique_id ?>",
				},
				width:"<?php echo $width ?>",
				height:"<?php echo $height ?>",
				theme:'default <?php echo $variation ?>',
				sticky:<?php echo $sticky ?>,
				fullwidth: <?php echo $fullwidth ?>,
				position:"<?php echo $position ?>",
				<?php echo $in_effect ?>,
				<?php echo $out_effect ?>,
				startdelay:"<?php echo $startdelay ?>",
			    delay:"<?php echo $delay ?>",
				closeOnClick:<?php echo $closeonclick?>,
				closeButton:<?php echo $closebutton; ?>,
				times: "<?php echo $times; ?>"

			});

		})

	  })(jQuery)

</script>