<script type="text/javascript">

	  (function($){
		$(function(){

			$.amaran({
        content:{
            message:"<?php echo $heading ?>"
        },
        width:"<?php echo $width ?>",
		height:"<?php echo $height ?>",
        theme:'simdark <?php echo $variation ?>',
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
		times: "<?php echo $times; ?>",
        themeTemplate:function(data){
            return "<div class='simdark-spinner'><span></span></div><div class='simdark-message'><span>"+data.message+"</span></div>";
        },
       /* beforeStart:borderFix(),
        afterEnd:borderFix()*/

    });



		})

	  })(jQuery)
	  </script>