import axios from 'axios';
import bodybuilder from 'bodybuilder';
import { debounce, get, keys, values } from 'lodash';

import config from './config';
import { debugLog } from './log';
import { extractExactMatch } from './string';

let authPayload = null;

export function getUserData() {
  if (authPayload && (authPayload.exp > Date.now() / 1000)) {
    // Use cached payload if its still valid
    return Promise.resolve(authPayload);
  }
  const { url, nonce } = get(config, 'adminAjax', {});
  if (!url || !nonce) {
    throw Error('Failed to authenticate.');
  }
  return axios({
    method: 'GET',
    crossDomain: true,
    url,
    params: {
      action: 'aa_search_auth',
      nonce,
    },
  })
  .then(({ data }) => {
    debugLog('Auth: New', data.payload);
    authPayload = data;
    return data;
  });
}

/**
 * Applies a filter clause to an existing bodybuilder instance
 * @param esQuery {object} an initialized ES bodybuilder instance
 * @param taxonomyName {string} name of a taxonomy or 'postType'
 * @param taxonomyTerms {array} array of terms toe be filtered upon
 * @return {object} bodybuilder instance
 * @private
 */
function buildFilterQuery(esQuery, taxonomyName, taxonomyTerms = []) {
  // Append '.filter' to all fields other than postType and permissionLevel
  const termName = taxonomyName === 'postType' || taxonomyName === 'permissionLevel'
    ? taxonomyName
    : `${taxonomyName}.filter`;
  return taxonomyTerms.length
    ? esQuery.filter('terms', termName, taxonomyTerms)
    : esQuery;
}

/**
 * The default text search query for AA, applies to an existing ES bodybuilder instance
 *
 * NOTE: When no search term/phrase is entered, any filters are applied and the results
 * are simply sorted by publish date.
 *
 * There are a few tiers to the search query, they break down like this:
 *
 * 1. First a wide net is cast, allowing ElasticSearch (ES) to match any words within the
 * search phrase to any of the following fields: Name, Short Description, Long Description,
 * and Related Users. At this stage, each field is weighted equivalently however the
 * relevancy score of the results is impacted by ES's various relevancy algorithms (A basic
 * introduction can be reviewed here:
 * https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-intro.html).
 * The query type used is `'best_fields'`
 * (https://www.elastic.co/guide/en/elasticsearch/reference/master/query-dsl-multi-match-query.html#type-best-fields).
 *
 * 2. Next, ES performs a `'phrase_prefix`'
 * (https://www.elastic.co/guide/en/elasticsearch/reference/master/query-dsl-match-query-phrase-prefix.html)
 * query in which it looks for exact matches in the following fields (the number after the
 * caret, `^`, indicates a field-specific boost) Tags (^5), Related Users (^5), Name (^3),
 * Long Description, Short Description. In addition to the field-specific boosts, any match
 * in this secondary query also receives an additional 10 point boost.
 *
 * 3. Lastly, one final query is executed in which results which contain an exact match
 * for the Name field AND are a glossary item receive an additional boost of 100.
 *
 * When the search term is surrounded with single or double quotes, the same weighting is
 * applied however queries 1 & 2 are executed with the `'phrase'` query type
 * (https://www.elastic.co/guide/en/elasticsearch/reference/master/query-dsl-multi-match-query.html#type-phrase)
 *
 * @param esQuery {object} an initialized ES bodybuilder instance
 * @param searchTerm {string} search query
 * @param exactMatch {boolean} only find exact phrase matches
 * @return {object} bodybuilder instance
 * @private
 */
function applyTextQuery(esQuery, searchTerm, exactMatch = false) {
  // Ensure that the intended search matches a wide net from which to narrow down
  const q = esQuery
    .query('multi_match', {
      query: searchTerm,
      fields: [
        'relatedUsers',
        'name',
        'shortDescription',
        'longDescription',
        'longDescription.english',
        'tags^5',
      ],
      type: (exactMatch ? 'phrase' : 'best_fields'),
    })

    // Boost results with exact matches for the query as a phrase
    .orQuery('multi_match', {
      query: searchTerm,
      fields: [
        'tags^5',
        'relatedUsers^5',
        'name^3',
        'longDescription',
        'shortDescription',
      ],
      type: (exactMatch ? 'phrase' : 'phrase_prefix'),
      boost: 10,
    });

  // Boosts documents that have a name which matches the search and are glossary items
  const boostPostTypes = bodybuilder()
    .query('match_phrase', 'name', searchTerm)
    .andQuery('match', 'postType', { query: 'aa_glossary', boost: 100 });
  // Nested queries aren't supported in bodybuilder. This workaround came from:
  // https://github.com/danpaz/bodybuilder/issues/51#issuecomment-293349181
  q.getQuery().bool.should.push(boostPostTypes.getQuery());

  return q;
}

/**
 * Public query function for ES, accepts parameters in object form, submits AJAX request.
 * @param searchTerm {string} search query
 * @param page {number} desired page number
 * @param filters {object} hash map of filter terms and their desired values
 * @param sort {string|boolean} a property on which to sort or false if relevance should be used
 * @param sortDirection {('asc')|('desc')} sort direction
 * @return {Promise} resolves with API response
 */
export function query({ searchTerm, page = 1, filters, sort, sortDirection = 'desc', infinite = false }) {
  debugLog('Query: Input', { searchTerm, page, filters, sort, sortDirection });

  let esQuery = bodybuilder();

  if (searchTerm) {
    // Check for a query wrapped in quotes, if found, look for exact matches
    const exactValue = extractExactMatch(searchTerm);
    esQuery = applyTextQuery(esQuery, (exactValue || searchTerm), !!exactValue);
  } else if (sort) {
    // If no search term has been provided sort by date descending
    esQuery = esQuery.sort(sort, sortDirection);
  }

  // Append filters to query
  esQuery = keys(filters).reduce((aggQuery, filterKey) => (
    buildFilterQuery(aggQuery, filterKey, values(filters[filterKey]))
  ), esQuery);

  debugLog('Query: Output', esQuery.build());

  return getUserData()
    .then(({ jwt }) => axios({
      method: 'POST',
      url: `${config.indexHost}`,
      data: {
        jwt,
        page,
        infinite,
        queryBody: esQuery.build(),
      },
    }));
}

/**
 * Wraps `window.ga` with debounce, timeout is 1500ms
 */
export const debouncedGA = debounce((...args) => window.ga && window.ga(...args), 1500);
