/*
 * Rename this file to `local-config.js` and add any values that you
 * would like to override for the client's global config.
 */

module.exports = {
  indexHost: '/wp-content/plugins/agile-alliance-search/query.php',
  fakeAuth: {
    jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC93d3cuYWdpbGVhbGxpYW5jZS5vcmciLCJpYXQiOjE0OTIxMTQzNzcsImV4cCI6MTcxMzAzOTE3NywicGVybWlzc2lvbkxldmVsIjoyfQ.3jczeL1R4-okh_ME6l2wgqg5Ck2MfHDGLEA7Dx9L3-s',
    payload: {
      permissionLevel: 2,
    },
  },
};
