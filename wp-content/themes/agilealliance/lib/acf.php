<?php

namespace Roots\Sage\Acf;

/**
 * Load Options pages via ACF Pro
 */
if(function_exists('acf_add_options_page')) {
  acf_add_options_page();
  acf_add_options_sub_page('Template Mapping');
  acf_add_options_sub_page('MemberPress Mapping');
  acf_add_options_sub_page('Swoogo Settings');
}
