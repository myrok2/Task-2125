import config from './config';

export function debugLog(...args) {
  if (config.debugMode) {
    // eslint-disable-next-line
    console.log('[AA Search Debug]', ...args);
  }
}

export function debugTable(...args) {
  if (config.debugMode) {
    // eslint-disable-next-line
    console.table(...args);
  }
}
