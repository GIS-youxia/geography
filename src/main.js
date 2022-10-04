import Vue from 'vue'
import App from './App'
import router from './router'
import Moment from 'moment';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false

Vue.prototype.$moment = Moment;

Vue.use(ElementUI);

Vue.prototype.$EventBus = new Vue();

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
