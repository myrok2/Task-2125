<?php

define('EVENT_SESSION_ATTACHMENT_FIELD_KEY', 'field_570240dc9f995');
define('EVENT_SESSION_SPEAKER_DIR_FIELD_KEY', 'field_57024cf77188d');

add_action('plugins_loaded', function() {
	if( function_exists('acf_add_local_field_group') ):

		acf_add_local_field_group(array (
			'key' => 'group_570240d2ab0a5',
			'title' => 'Event Sessions',
			'fields' => array (
				array (
					'key' => EVENT_SESSION_ATTACHMENT_FIELD_KEY,
					'label' => 'Attachments',
					'name' => 'attachments',
					'type' => 'repeater',
					'instructions' => '',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => array (
						'width' => '',
						'class' => '',
						'id' => '',
					),
					'collapsed' => '',
					'min' => '',
					'max' => '',
					'layout' => 'table',
					'button_label' => 'Add Attachment',
					'sub_fields' => array (
						array (
							'key' => 'field_570240ef9f996',
							'label' => 'Title',
							'name' => 'title',
							'type' => 'text',
							'instructions' => '',
							'required' => 1,
							'conditional_logic' => 0,
							'wrapper' => array (
								'width' => '',
								'class' => '',
								'id' => '',
							),
							'default_value' => '',
							'placeholder' => '',
							'prepend' => '',
							'append' => '',
							'maxlength' => '100',
							'readonly' => 0,
							'disabled' => 0,
						),
						array (
							'key' => 'field_570241029f998',
							'label' => 'URL',
							'name' => 'url',
							'type' => 'url',
							'instructions' => '',
							'required' => 1,
							'conditional_logic' => 0,
							'wrapper' => array (
								'width' => '',
								'class' => '',
								'id' => '',
							),
							'default_value' => '',
							'placeholder' => '',
						),
					),
				),
				array (
					'key' => EVENT_SESSION_SPEAKER_DIR_FIELD_KEY,
					'label' => 'Include in Speaker Directory',
					'name' => 'include_in_speaker_directory',
					'type' => 'true_false',
					'instructions' => '',
					'required' => 0,
					'conditional_logic' => 0,
					'wrapper' => array (
						'width' => '',
						'class' => '',
						'id' => '',
					),
					'message' => '',
					'default_value' => 0,
				),
			),
			'location' => array (
				array (
					array (
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'aa_event_session',
					),
				),
			),
			'menu_order' => 0,
			'position' => 'normal',
			'style' => 'default',
			'label_placement' => 'top',
			'instruction_placement' => 'label',
			'hide_on_screen' => array (
				0 => 'excerpt',
				1 => 'custom_fields',
				2 => 'discussion',
				3 => 'comments',
				4 => 'revisions',
				5 => 'author',
				6 => 'format',
				7 => 'page_attributes',
				8 => 'featured_image',
				9 => 'send-trackbacks',
			),
			'active' => 1,
			'description' => '',
		));

	endif;
});

add_shortcode('event_session_attachments', function() { ?>

	<?php ob_start(); ?>
	<?php echo do_shortcode('[p2p_connected type=experience_report_to_event_session]'); ?>
	<?php echo do_shortcode('[p2p_connected type=research_paper_to_event_session]'); ?>
	<?php echo do_shortcode('[p2p_connected type=video_to_event_session]'); ?>
	<?php if( have_rows('attachments') ): ?>
		<ul class="event-session-resources__attachments">
			<?php while ( have_rows('attachments') ) : the_row(); ?>
				<?php
				$label = get_sub_field('title') ?: get_sub_field('filename');
				$url = get_sub_field('url');
				echo "<li><a target='_blank' href='$url'>$label</a></li>";
				?>
			<?php endwhile; ?>
		</ul>
	<?php endif; ?>
    <?php
		$markup = ob_get_clean();
		if (empty(trim($markup))) return '';
	$content = 	"<style>
		.event-session-resources ul {
			padding-left: 2em;
		}
		#experience_report_to_event_session_list li:after,
		#video_to_event_session_list li:after,
		#research_paper_to_event_session_list li:after,
		.event-session-resources__attachments li:after {
			padding: 8px 7px;
			line-height: 0;
			border: 1px solid grey;
			border-radius: 30px;
			margin-left: 5px;
			-webkit-transition: all .3s ease-in-out;
			-o-transition: all .3s ease-in-out;
			transition: all .3s ease-in-out;
			display: inline-block;
			font-size: 0.5em;
			top: -2px;
			position: relative;
		}

		#research_paper_to_event_session_list li:after {
			content: 'Research Paper';
		}

		#experience_report_to_event_session_list li:after {
			content: 'Experience Report';
		}

		#video_to_event_session_list li:after {
			content: 'Video';
		}

		.event-session-resources__attachments li:after {
			content: 'Attachment';
		}
	</style>
	<h3>Additional Resources</h3>
	<div class='event-session-resources'>" .
		$markup
	. "</div>";
	echo render_protected($content, '');
	?>
<?php });

add_shortcode('speaker_directory_message', function() {
	if (get_field('include_in_speaker_directory')) {
		echo '<style>
			.speaker-directory-note {
				margin-top: 10px !important;
				padding-right: 10px;
			}
		</style>';
		echo do_shortcode('[mepr-active ifallowed="show"]<p class="speaker-directory-note"><i class="fa fa-info-circle"></i><small> Speaker(s) are willing to present this session at local group meetings and other events.</small></p>[/mepr-active]');
	}
});
