<?php
self::static_render(
	'admin/dashboard/templates/widget-pages',
	array(
		'sshare_per_page_data' => $sshare_per_page_data,
		'widget_name'          => Opt_In_Utils::get_module_type_display_name( Hustle_Module_Model::SOCIAL_SHARING_MODULE, true, true ),
		'widget_type'          => Hustle_Module_Model::SOCIAL_SHARING_MODULE,
		'capability'           => $capability,
		'description'          => esc_html__( 'Make it easy for your visitors to share your content by adding floating or inline social sharing prompts. Once your modules start converting, your top converting pages will appear here.', 'wordpress-popup' ),
	)
);
