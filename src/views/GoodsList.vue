<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>商品</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">排序:</span>
          <a href="javascript:void(0)" class="default cur">默认</a>
          <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">价格 <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show' : filterBy}">
            <dl class="filter-price">
              <dt>价格区间:</dt>
              <dd><a href="javascript:void(0)" v-bind:class="{'cur' : priceChecked === 'All'}" @click="setPriceFilter('All')">全部</a></dd>
              <dd v-for="(item, index) in priceFilter">
                <a href="javascript:void(0)" v-bind:class="{'cur' : priceChecked === index}" @click="setPriceFilter(index)">{{item.startPrice | currency("￥")}} - {{item.endPrice | currency("￥")}}</a>
              </dd>
            </dl>
          </div>
          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item, index) in goodsList">
                  <div class="pic">
                    <a href="#"><img v-lazy=" '/static/' + item.productImg " alt=""></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.productPrice | currency("￥")}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="view-more-normal" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="20">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>

    <!-- 插槽 -->
    <modal v-bind:mdShow="mdShow" v-on:close="closeModal()">
      <p slot="message">
        请先登录，否则无法加入到购物车！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" @click="mdShow = false">关闭</a>
      </div>
    </modal>
    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal()">
      <p slot="message">
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
        </svg>
        <span>加入购物车成!</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="closeModal">继续购物</a>
        <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
      </div>
    </modal>

    <nav-footer></nav-footer>
  </div>
</template>
<style>
.btn:hover {
  background-color: #ffe5e6;
  transition: all .3s easy-out;
}

</style>
<script>
import "@/assets/css/base.css"
import "@/assets/css/product.css"
import {currency} from '@/util/currency'

import NavHeader from "@/components/NavHeader"
import NavFooter from "@/components/NavFooter"
import NavBread from "@/components/NavBread"
import Modal from "@/components/Modal"
import axios from "axios"
export default {
  data() {
    return {
      goodsList: [],
      priceChecked: "All",
      filterBy: false,
      overLayFlag: false,
      sortFlag: true,
      page: 1,
      pageSize: 8,
      busy: true,
      loading: false,
      mdShow: false,
      mdShowCart: false,
      priceFilter: [{
          startPrice: '0.00',
          endPrice: '100.00'
        },
        {
          startPrice: '100.00',
          endPrice: '500.00'
        },
        {
          startPrice: '500.00',
          endPrice: '1000.00'
        },
        {
          startPrice: '1000.00',
          endPrice: '5000.00'
        }
      ]
    }
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },
  mounted() {
    this.getGoodsList()
  },
  // 使用金额格式工具
  filters: {
    currency: currency
  },
  methods: {
    // 商品列表
    getGoodsList(flag) {
      let param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        priceLevel: this.priceChecked
      }
      this.loading = true
      axios.get("/goods/list", {
        params: param
      }).then((result) => {
        let res = result.data
        this.loading = false
        if (res.status == '1') {
          if (flag) {
            // 持续加载商品列表
            this.goodsList = this.goodsList.concat(res.result.list);
            // 若是商品列表数量没有,则不再加载
            if (res.result.count == 0) {
              this.busy = true;
            } else {
              this.busy = false;
            }
          } else {
            this.goodsList = res.result.list;
            this.busy = false;
          }
        } else {
          this.goodsList = []
        }

      })
    },
    showFilterPop() {
      this.filterBy = true,
      this.overLayFlag = true
    },
    closePop() {
      this.filterBy = false,
      this.overLayFlag = false
    },
    // 通过价格区间来过滤商品
    setPriceFilter(index) {
      this.priceChecked = index
      this.page = 1
      this.getGoodsList()
      this.closePop()
    },
    // 商品价格排序
    sortGoods() {
      this.sortFlag = !this.sortFlag
      this.page = 1
      this.getGoodsList()
    },
    // 滚动持续加载商品列表
    loadMore() {
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 500);
    },
    // 加入购物车
    addCart(productId) {
      axios.post('/goods/addCart', {
        productId: productId
      }).then((response) => {
        console.log(response)
        let res = response.data
        if (res.status == '1') {
          this.mdShowCart = true
          this.$store.commit('updateCartCountd', 1)
        } else {
          this.mdShow = true
        }
      })
    },
    // 关闭模态框,与子组件之间有通信
    closeModal() {
      this.mdShow = false
      this.mdShowCart = false
    }
  }
}

</script>
