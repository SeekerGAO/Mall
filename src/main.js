// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'  // 懒加载
import infiniteScroll from 'vue-infinite-scroll'  // 滚动加载
import Vuex from 'vuex'
// import {currency} from './util/currency'

Vue.config.productionTip = false

Vue.use(VueLazyLoad, {
	loading : '/static/loading-svg/loading-bars.svg'
})

Vue.use(infiniteScroll)
Vue.use(Vuex)
// Vue.filter("currency", currency)

// 用户名和购物车数量的全局状态管理
const store = new Vuex.Store({
	state: {
		nickName: '',
		cartCount: 0
	},
	mutations: {
	  // 更新名字
		updataNickName(state, nickName) {
			state.nickName = nickName
		},
    // 更新购物车数量
		updateCartCount(state, cartCount) {
			state.cartCount += cartCount
		},
    // 初始化购物车数量
		initCartCount(state, cartCount) {
			state.cartCount = cartCount
		}
	}
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
