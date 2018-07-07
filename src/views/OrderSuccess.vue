<template>
  <div>
    <nav-header></nav-header>
    <div class="container">
      <div class="page-title-normal">
        <!-- <h2 class="page-title-h2"><span>check out</span></h2> -->
      </div>
      <!-- 进度条 -->
      <div class="check-step">
        <ul>
            <li class="cur">确认地址</li>
            <li class="cur">查看订单</li>
            <li class="cur">付款</li>
            <li class="cur">确认订单</li>
        </ul>
      </div>
      <div class="order-create">
        <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
        <div class="order-create-main">
          <h3>付款成功! <br>你的订单正在处理中...</h3>
          <p>
            <span>订单号：{{orderId}} </span>
            <span>付款金额：{{orderTotal | currency('￥')}}</span>
          </p>
          <div class="order-create-btn-wrap">
            <div class="btn-l-wrap">
              <router-link class="btn btn--m" to="/cart">我的购物车</router-link>
            </div>
            <div class="btn-r-wrap">
              <router-link class="btn btn--m" to="/">返回首页</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav-footer></nav-footer>
  </div>
</template>
<script>
	import NavHeader from "@/components/NavHeader"
	import NavFooter from "@/components/NavFooter"
	import {currency} from './../util/currency'
	import axios from "axios"

	export default {
		data() {
			return {
				orderId: '',
				orderTotal: 0
			}
		},
		components: {
			NavHeader,
			NavFooter
		},
		filters: {
			currency: currency
		},
		mounted() {
			this.init()
		},
		methods: {
		  // 获取到订单信息
			init() {
				let orderId = this.$route.query.orderId
				axios.get('/users/orderDetail', {
					params: {
						orderId: orderId
					}
				}).then((response) => {
					let res = response.data
					if(res.status == '1') {
						this.orderId = res.result.orderId
						this.orderTotal = res.result.orderTotal
					}
				})
			}
		}
	}
</script>
