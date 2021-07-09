import Vue from 'vue';

import { createRouter } from './router';
import { createStore } from './store';
import { createVuetify } from './vuetify';
import { createI18n } from './i18n';
import { createPlayer } from './player';

import { createSnackbar } from './plugins/snackbar';

import plugins from './plugins';
import filters from './filters';
import * as directives from './directives';

import '@/scss/global.scss';
import '@/mock/index';

// Application
import App from '@/App.vue';

Vue.config.productionTip = false;

// register vue filter
Object.entries(filters).map(([key, fn]) => {
  Vue.filter(key, fn);
});
Vue.use(plugins);
Object.entries(directives).map(([id, definition]) => {
  Vue.directive(id, definition);
});
const store = createStore();
const vuetify = createVuetify(store);
const i18n = createI18n(store);
const router = createRouter(vuetify, store);
const player = createPlayer(store);

Vue.prototype.$message = createSnackbar(vuetify);

if (process.env.IS_ELECTRON) {
  import('./electron/ipcRenderer').then(
    ({ registerIpcRenderer, default: ipcRenderer }) => {
      registerIpcRenderer(store, router);
      Vue.prototype.$ipcRenderer = ipcRenderer;
    },
  );
}
new Vue({
  store,
  router,
  i18n,
  vuetify,
  player,
  render: (h) => h(App),
}).$mount('#app');
