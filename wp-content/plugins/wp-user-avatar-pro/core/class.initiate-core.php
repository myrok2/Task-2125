<?php

	/**
	 *  Load All Core Initialisation class
	 *  @package Core
	 *  @author Flipper Code <hello@flippercode.com>
	 */

	if ( ! class_exists( 'FlipperCode_Initialise_Core' ) ) {


		 class FlipperCode_Initialise_Core {

		 	public function __construct() {

		 		$this->_load_core_files();
		 		$this->_register_flippercode_globals();
	 	    }

		 	public function _register_flippercode_globals() {

		 		/*Register Hooks that we want for every product to work */

		 		// Register method to hide promotional product from overview page of current product.
		 		add_action( 'wp_ajax_hide_promotional_products',array( $this, 'hide_promotional_products' ) );
		 		add_action( 'wp_ajax_check_products_updates',array( $this, 'check_products_updates' ) );
		 		add_action( 'wp_ajax_verify_envanto_purchase',array( $this, 'verify_envanto_purchase' ) );
		 		add_action( 'wp_ajax_submit_user_suggestion',array( $this, 'submit_user_suggestion' ) );
		 		add_action( 'admin_enqueue_scripts', array($this,'load_products_common_resources') );


		  	}

		 	function load_products_common_resources($hook) {


				if (strpos($hook, 'view_overview') !== false) {

					// One of our product's overview page. Load necessary resources on this page only.
					$corePath = FC_CORE_URL.'/core-assets/';
					wp_enqueue_style( 'font_awesome_minimised', $corePath. '/css/font-awesome.min.css' );// We have used icons on page
					wp_enqueue_style( 'product_common_style', $corePath. '/css/backend-core.css' );//For Overview page Styling
					wp_enqueue_script( 'product_common_script', $corePath . '/js/backend-core.js' );//For Overview page custom events
					wp_enqueue_script( 'bootstrap_script', $corePath . '/js/bootstrap.min.js' ); //For Bootstrap product Slider

				}


			}

			function is_localhost() {

				$isLocalhost = ($_SERVER['SERVER_NAME']!= 'localhost') ? true : false;
				return $isLocalhost;
			}

		 	function submit_user_suggestion() {

				$current_user = wp_get_current_user();
				if (isset( $_POST['action'] )
				&& $_POST['action'] == 'submit_user_suggestion'
				&& isset( $_POST['uss'] )
				&& wp_verify_nonce($_POST['uss'],'user-suggestion-submitted')
				)
				{
					$data = $_POST;
					$current_user = wp_get_current_user();
					$sitename = get_bloginfo('name');
					$username = $current_user->user_nicename;
					$siteURL = get_bloginfo('url');
					$siteadminemail = get_bloginfo('admin_email');
					$suggestion = sanitize_text_field($data['suggestion']);
					$suggestionfor = sanitize_text_field($data['suggestionfor']);
					$url = 'http://guide.flippercode.com/wunpupdates/';
					$bodyargs = array( 'wunpu_action' => 'submit-suggestion',
									   'username' =>   $username,
									   'sitename' =>   $sitename,
									   'siteurl' =>    urlencode($siteURL),
									   'useremail' =>  $siteadminemail,
									   'suggestion' => $suggestion,
									   'suggestion_for' => $suggestionfor);
					$args = array('method' => 'POST', 'timeout' => 45, 'body' => $bodyargs );
					$response = wp_remote_post($url,$args);
					if ( is_wp_error( $response ) ) {
					$result = array('status' => '0','error' => $response->get_error_message()) ;
					} else {
					$result = array('status' => '1','submission_saved' => $response['body']);
					echo $response['body'];

					}
				 }else {
					echo 'failed';
				}

				exit;

			}
		 	function verify_envanto_purchase() {


			if (isset($_POST['action']) and $_POST['action'] == 'verify_envanto_purchase' and isset( $_POST['pvn'] ) && wp_verify_nonce($_POST['pvn'], 'purchase-verification-request') )
	        {

				$submitData = $_POST;
				$url = 'http://guide.flippercode.com/wunpupdates/';

				$bodyargs = array( 'wunpu_action' => 'verify-purchase',
								'purchasekey' => wp_unslash($submitData['purchasekey']),
								'ip' => $_SERVER['REMOTE_ADDR'],
								'site_url' => urlencode(site_url()),
								'currentTextDomain' => $submitData['current_text_domain'],
								'admin_email' => get_bloginfo('admin_email'));
				$args = array('method' => 'POST', 'timeout' => 45, 'body' => $bodyargs );

				$response = wp_remote_post($url,$args);

				if ( is_wp_error( $response ) ) {
				$result = array('status' => '0','error' => $response->get_error_message()) ;
				} else {
				   $valid_purchase = (array) json_decode($response['body']);
				   if($response['response']['code'] == '200') {

						   $result = array('status' => '1','purchase_verified' => $valid_purchase['status']);
						   if(  $valid_purchase['status'] == 'true') {
							   update_option( $submitData['current_text_domain'].'_user_has_license', 'yes' );
							   update_option( $submitData['current_text_domain'].'_license_key', $submitData['purchasekey'] );
							   update_option( $submitData['current_text_domain'].'_license_details', $valid_purchase );
						   }
			   	    } else {

					   $result = array('status' => '0','purchase_verified' => $valid_purchase['status'],'error' => 'Sorry! Server cannot be reached right now.');
				   }

				}
				echo json_encode($result);
				exit;

		 	}

		   }

		   public function check_products_updates() {

				$url = 'http://guide.flippercode.com/wunpupdates/';
				$plugin = wp_unslash($_POST['productslug']);
		 		$bodyargs = array( 'wunpu_action' => 'updates',
		 						   'plugin' => $plugin,
		 						   'get_info' => 'version',
		 						   );

		 		$args = array('method' => 'POST', 'timeout' => 45, 'body' => $bodyargs );
     	 		$response = wp_remote_post($url,$args);
     	 		$response = (array) unserialize($response['body']);
     	 		if ( is_wp_error( $response ) ) {
				   $summary = array('status' => '0','error' => $response->get_error_message()) ;
				} else {

				 update_option( $plugin.'_latest_version', serialize($response) );

				 $version = trim($response['new_version'], '"');
				 $summary = array('status' => '1','latestversion' => wp_unslash(trim($version))) ;
				}

		 		echo json_encode($summary);
		 		exit;

		 	}


		 	public function hide_promotional_products() {

		 		if(isset($_POST['productname']) and !empty($_POST['productname']))
		 		update_option($_POST['productname'].'_hide_promotional_products','yes');
		 		//echo '<pre>'; print_r($_POST); exit;

		 	}

		 	public function _load_core_files() {

		 		$corePath  = plugin_dir_path( __FILE__ );
				$coreFiles = array(
					'class.tabular.php',
					'class.template.php',
					'abstract.factory.php',
					'class.controller-factory.php',
					'class.model-factory.php',
					'class.controller.php',
					'class.model.php',
					'class.validation.php',
					'class.database.php',
					'class.importer.php',
					'class.wp-auto-plugin-update.php',
					'class.plugin-overview.php',
				);

				/**
				 *  Load All Core Initialisation class from core folder
				 */
				foreach ( $coreFiles as $file ) {

					if ( file_exists( $corePath.$file ) ) {
					    	require_once( $corePath.$file );
				    }
				}


		 	}

		 }

	}

    return new FlipperCode_Initialise_Core();

