<?php
namespace aa\search\indexer;
use aa\search\es\ElasticSearch;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Indexer {
	function upsert($type, $document);
	function delete($type, $document);
	function bulkInsert($type, $documents);
	function putMapping($type, $mapping);
	function resetIndex($settings, $mappings);
}

require 'elasticsearch.php';

function get_indexer() {
	// Conditionally load a different indexer if needed
	return new ElasticSearch();
}