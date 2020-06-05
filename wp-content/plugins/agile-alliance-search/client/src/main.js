// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
import Rx from 'rxjs/Rx';
import VueRx from 'vue-rx';
import VTooltip from 'v-tooltip';
import VueScrollTo from 'vue-scrollto';
import { ObserveVisibility } from 'vue-observe-visibility';

import App from './App';

Vue.config.productionTip = false;

Vue.use(VueRx, Rx);
Vue.use(VTooltip, {
  tetherOptions: {
    constraints: [
      {
        to: 'window',
        attachment: 'together',
        pin: false,
      },
    ],
  },
});

Vue.directive('observe-visibility', ObserveVisibility);

Vue.use(VueScrollTo);

/* eslint-disable no-new */
new Vue({
  el: '#aa-search',
  template: '<App/>',
  components: { App },
});
