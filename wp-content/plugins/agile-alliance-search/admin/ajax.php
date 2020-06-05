<?php
namespace aa\search\admin;
use aa\search\{auth, config, document};

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ajax {
	function __construct($indexer) {
		$this->index = $indexer;
		add_action('wp_ajax_aa_search_index_update', [$this, 'handleAdminAjaxRequest']);
		add_action('wp_ajax_aa_search_auth', [$this, 'handleFrontendAjaxRequest']);
		add_action('wp_ajax_nopriv_aa_search_auth', [$this, 'handleFrontendAjaxRequest']);
	}

	/**
	 * The methods below handle the WP Admin Dashboard ajax requests
	 */
	function handleAdminAjaxRequest() {
		if (!current_user_can('manage_options')) {
			wp_die();
		}
		$intent = filter_input(INPUT_POST, 'intent', FILTER_SANITIZE_STRING);
		ob_start(); // Prevent anything from outputting in the JSON stream
		switch($intent) {
			case 'FETCH_BATCH': {
				$response = [
					'start' => true,
					'payload' => $this->getIDsForBatch(),
				];
				break;
			}
			case 'RUN_BATCH': {
				if(class_exists('WPBMap') && method_exists('WPBMap', 'addAllMappedShortcodes')) {
					\WPBMap::addAllMappedShortcodes(); // This is needed to ensure VS shortcodes are ready
				}
				$job = filter_input(INPUT_POST, 'ids', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
				$batch_result = $this->executeBatch($job);
				$response = [
					'continue' => true,
					'payload' => $batch_result,
				];
				break;
			}
			case 'REMAP_INDEX' : {
				$response = [
					'response' => $this->resetIndexMapping(),
				];
				break;
			}
			case 'RESET_INDEX' : {
				$response = [
					'response' => $this->resetIndex(),
				];
				break;
			}
			default: {
				$response = [
					'error' => true,
				];
				break;
			}
		}
		ob_clean();
		echo json_encode($response);
		wp_die();
	}
	function getIDsForBatch() {
		global $wpdb;
		$post_types = implode(',', array_map(function($item) { return "'$item'"; }, config\allowed_post_types()));
		$post_statuses = implode(',', array_map(function($item) { return "'$item'"; }, config\allowed_post_statuses()));
		$queryString = "
			SELECT id
			FROM {$wpdb->prefix}posts
			  WHERE post_status IN ({$post_statuses})
			  AND post_type IN ({$post_types})
		";
		$query = $wpdb->get_col($queryString);
		return [
			'postTypes' => $post_types,
			'postStatuses' => $post_statuses,
			'batchItems' => $query,
		];
	}
	function executeBatch($post_ids) {
		$documents = array_map(function($post_id) {
			$document = document\init_post_as_document($post_id);
			if ($document) {
				return $document->extract_document();
			}
		}, $post_ids);
		return $this->index->bulkInsert('resource', $documents);
	}
	function resetIndexMapping() {
		$mapping_path = plugin_dir_path(__FILE__) . '/../es-mapping.json';
		$mapping_string = file_get_contents($mapping_path);
		$mapping = $mapping_string ? json_decode($mapping_string, true) : false;
		return $this->index->putMapping('resource', $mapping);
	}
	function resetIndex() {
		$mapping_path = plugin_dir_path(__FILE__) . '/../es-mapping.json';
		$mapping_string = file_get_contents($mapping_path);
		$mapping = $mapping_string ? json_decode($mapping_string, true) : false;
		$settings_path = plugin_dir_path(__FILE__) . '/../es-settings.json';
		$settings_string = file_get_contents($settings_path);
		$settings = $settings_string ? json_decode($settings_string, true) : false;
		return $this->index->resetIndex($settings, $mapping);
	}

	/**
	 * The methods below handle ajax requests made by the frontend to request JWT tokens
	 */
	function handleFrontendAjaxRequest() {
		if (!AA_SEARCH_DEVELOPMENT) {
			check_ajax_referer('aa_search_auth_nonce', 'nonce');
		} else {
			header('Access-Control-Allow-Origin: http://localhost:8080');
		}
		// Data in this array is both encoded in the JWT and included in the `jwtPayload` property
		// in the client config object for easy access without having to decode the JWT clientside.
		$current_user = wp_get_current_user();
		$user_data = [
			'permissionLevel' => 0, //TODO: REplace s2member Function ? Or return all?
			'user' => $current_user->ID === 0 ? 'anon' : [
				'id' => $current_user->ID,
				'caps' => $current_user->caps,
				'roles' => $current_user->roles,
			],
		];
		$encode_data = auth\encode($user_data);
		$response = $encode_data + [
			'payload' => $user_data,
		];
		echo json_encode($response);
		wp_die();
	}
}
