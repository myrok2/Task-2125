import { get } from 'lodash';

const matchTextInQuotes = /['"](.*)['"]/;

export function extractExactMatch(term = '') {
  const regexMatch = term.match(matchTextInQuotes);
  return get(regexMatch, '[1]', false);
}

export default {};
