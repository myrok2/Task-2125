<?php namespace AgileAlliance\Submissions;

if( !defined('WPINC') ) // MUST have WordPress.
	exit('Do not access this file directly.');

use Paradigm\Concepts\Functional as F;

/**
 * API: Get user for the 'Submission System'
 */
	add_action('init', function() {

		if( isset($_GET['submissions_get_user']) ) {

			header('Content-type: text/xml');

			/**
			 * Class submissions_api
			 * @package AgileAlliance\Submissions
			 */

			class submissions_api  {

				public static function aa_get_user($options) {

					$op = [
						'op' => 'get_user',
						'api_key' => $options['api_key'],
						'data' => [
							'user_id' => $options['identityid']
						]
					];

					$user_data_monad = new F\Identity(get_user_by('id', $options['identityid']));

					/** value is the return of s2member get_user api */
					$user_data = $user_data_monad
						->bind( function($value) {
							$xml_array = [
								'result'  => 0,
								'message' => 'Matching record not found.'
							];

							if( $value !== false) {

								$user_meta = get_user_meta($value->ID);

								$xml_array = [
										'result'         => 1,
										'message'        => 'Matching record found.',
										'identityid'     => $value->ID,
										'firstname'      => $user_meta['first_name'][0],
										'lastname'       => $user_meta['last_name'][0],
										'email'          => $value->user_email,
										'preferredemail' => $user_meta['preferred_email'][0],
										'workemail'      => $user_meta['work_email'][0],
										'company'        => $user_meta['mepr_company'][0],
										'telephone'      => $user_meta['mepr_telephone'][0],
										'title'          => $user_meta['mepr_title'][0],
										'twitter'        => $user_meta['mepr_twitter'][0],
										'biography'      => $user_meta['mepr_bio'][0],
										'country'        => $user_meta['mepr_country'][0]
								];
							}

							return $xml_array;
						})
						->bind(function($value) {

							if ( $value['result'] === 0 ) {
								http_response_code(404);
							}

							// To XML
							$xml = new \XMLWriter();
							$xml->openMemory();
							$xml->startDocument('1.0','UTF-8');
							$xml->startElement('data');
								foreach($value as $node => $text){
									$xml->startElement($node);
									$xml->text( $text );
									$xml->endElement();
								}
							$xml->endElement();
							$value = $xml->flush(true);
							return $value;
						})
						->extract();

					return $user_data;
				}

				public static function xml_error($message) {

					$xml = new \XMLWriter();
					$xml->openMemory();
					$xml->startDocument('1.0', 'UTF-8');
					$xml->startElement('data');
						$xml->startElement('result');
							$xml->text('0');
						$xml->endElement();
						$xml->startElement('message');
							$xml->text($message);
						$xml->endElement();
					$xml->endElement();

					http_response_code(404);

					return $xml->flush(true);
				}

			}

			/**
			 * Process xml post key value
			 */
			$post_body = file_get_contents('php://input');
			$post_maybe = new F\Maybe($post_body);

			$post_data = $post_maybe
				->bind(function($value) {
					return trim($value);
				})
				->bind(function($value) {
					return stripslashes($value);
				})
				->bind(function($value) {
					return html_entity_decode($value);
				})
				->bind(function($value) {
					return simplexml_load_string($value, 'SimpleXMLElement',
							LIBXML_NOERROR | LIBXML_NOWARNING );
				})
				->bind(function($value) {
					return json_encode($value);
				})
				->bind(function($value) {
					return json_decode($value, true);
				})
				// Check if submissions sent an old IDENTITYID alphanumeric value
				->bind(function($value) {

					if ($value !== false ) :
						$value['identityid'] = get_user_id_by_identifier($value['identityid']);
					endif;

					return $value;
				})
				 // API key validation
				->bind(function($value) {

					 if ($value !== false ) :

						 if ($value['api_key'] !== SUBMISSIONS_API_KEY) {
							$value = submissions_api::xml_error('api_key is empty or invalid');
						 }

					 endif;

					return $value;
				})
				// If you reach this XML is Malformed
				->bind(function($value) {

					if ($value === false ) {
						$value = submissions_api::xml_error( 'Malformed XML.' );
					}

					return $value;
				})
				->extract();

			/**
			 * Out put in XML
			 */

			if ( is_array($post_data) ) {
				echo submissions_api::aa_get_user($post_data);
			} else {
				echo $post_data;
			}

			exit;

		}

	});
