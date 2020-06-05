<?php
defined( 'ABSPATH' ) or die( 'Direct access not allowed' );
function PerPageATHInstallStep2(){
  global $wp_roles;
  $roleobject = $wp_roles->get_role('administrator');
  $roleobject->add_cap('add-to-head');
  add_option('ppath_types_allowed', array('post', 'page'), '', 'no');
}
function PerPageATHDeinstallStep2(){
	$configdir = dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR.'evonapluginconfig';
	$htmlfile = $configdir.DIRECTORY_SEPARATOR.'everyheadpage.html';
	PerpageathConfigMgrDeleteConfigfile($htmlfile);
	$scanned_directory = array_diff(scandir($configdir), array('..', '.'));
	if(empty($scanned_directory)){
		rmdir($configdir);
	}
	delete_option('ppath_roles_allowed');
	delete_option('ppath_types_allowed');
	delete_option('ppath_head_every_page');
}
function PerpageathConfigMgrDeleteConfigfile($filename){
	$configdir = dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR.'evonapluginconfig';
	$keepfileindex = $configdir.DIRECTORY_SEPARATOR.'keepfiles.txt';
	$neverdelete = $configdir.DIRECTORY_SEPARATOR.'neverdelete.txt';
	if(is_file($configdir .DIRECTORY_SEPARATOR. basename($filename))){
		//File exists and is inside the config dir
	  if(!is_file($neverdelete)){
		  //never delete is not set
		if(is_file($keepfileindex)){
			//There is a keep file index
			$tokeep = file($keepfileindex, FILE_SKIP_EMPTY_LINES | FILE_IGNORE_NEW_LINES);
			if(!in_array($basename($filename),$tokeep)){
				//but the file to delete isn't in it
			   return unlink($filename);
			}else{
				//The file is in the keep file index, do not delete
				return false;
			}
		}else{
			//There is no keep file index, delete
			return unlink($filename);
		}
	  }else{
		  //Never delete is set, do not delete
		  return false;
	  }
	}else{
		//The file is invalid, do not delete (but can't delete anyway)
		return false;
	}
}
?>