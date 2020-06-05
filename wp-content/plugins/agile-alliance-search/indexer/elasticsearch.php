<?php
namespace aa\search\es;
use aa\search\{indexer, config};

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require 'elasticsearch.aws.php';

class ElasticSearch implements indexer\Indexer {
	private $client;
	function __construct() {
		try {
			$this->client = get_es_client();
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
		}
	}

	function upsert($type, $document) {
		$params = [];
		$params['index'] = config\get_index_name();
		$params['type'] = $type;
		$params['id'] = $document['id'];
		$params['body'] = [
			'doc_as_upsert' => true,
			'doc' => $document,
		];
		try {
			$this->client->update($params);
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
		}
	}

	function bulkInsert($type, $documents) {
		$params = ['body' => []];
		$params = array_reduce($documents, function($carry, $document) use ($type) {
			$carry['body'][] = [
				'update' => [
					'_index' => config\get_index_name(),
					'_type' => $type,
					'_id' => $document['id'],
				]
			];

			$carry['body'][] =  [
				'doc_as_upsert' => true,
				'doc' => $document,
			];

			return $carry;
		}, $params);

		try {
			return $this->client->bulk($params);
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
		}
	}

	function delete($type, $document_id) {
		$params = [
			'index' => config\get_index_name(),
			'type' => $type,
			'id' => $document_id,
		];
		try {
			$this->client->delete($params);
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
		}
	}

	function putMapping($type, $mapping) {
		$params = [
			'index' => config\get_index_name(),
			'type' => $type,
			'body' => $mapping,
		];
		try {
			return $this->client->indices()->putMapping($params);
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
			return 'Error';
		}
	}

	function resetIndex($settings, $mapping) {
		$delete_params = [
			'index' => config\get_index_name()
		];
		try {
			if ($this->client->indices()->exists($delete_params)) {
				$this->client->indices()->delete($delete_params);
			}
			$create_params = [
				'index' => config\get_index_name(),
				'body' => [
					'settings' => $settings,
					'mappings' => $mapping,
				],
			];

			return $this->client->indices()->create($create_params);
		} catch (\Exception $exception) {
			if (function_exists('xdebug_break')){
				xdebug_break();
			} else if (function_exists('newrelic_notice_error')) {
				newrelic_notice_error('AA Search', $exception);
			}
			return 'Error';
		}
	}
}
