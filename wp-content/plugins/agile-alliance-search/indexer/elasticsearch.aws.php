<?php
namespace aa\search\es;
use aa\search\config;
use Aws\ElasticsearchService\ElasticsearchPhpHandler;
use Elasticsearch\ClientBuilder;

/**
 * @return mixed ElasticSearch client with AWS request signing handler
 */
function get_es_client() {
	return ClientBuilder::create()
		->setHandler(new ElasticsearchPhpHandler('us-east-1', config\get_aws_credentials_provider()))
		->setHosts(config\get_indexer_hosts())
		->build();
}