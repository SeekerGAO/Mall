const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Goods = require('./../models/goods')
const Users = require('./../models/users')

// connect MongoDB database
mongoose.connect('mongodb://localhost:27017/dbmall')

mongoose.connection.on('connected', () => {
	console.log('MongoDB connected success...')
})

mongoose.connection.on('error', () => {
	console.log('MongoDB connected failed...')
})

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB connected disconnected...')
})

// 查询商品列表
router.get('/list', function(req, res, next) {
    // 进行分页处理
    let page = parseInt(req.query.page) //当前第几页
    let pageSize = parseInt(req.query.pageSize) //一页多少条
    let sort = req.query.sort  //获取前端的传值‘sort’字段的值,1是升序，-1是降序
    let skip = (page-1)*pageSize
    let params = {}

    // 选择价格区间内的商品
    let priceLevel = req.query.priceLevel
    var priceGt = '',priceLte = ''

    // 选择查看全部商品
    if(priceLevel!='All'){
      switch (priceLevel){
        case '0':priceGt = 0;priceLte=100;break;
        case '1':priceGt = 100;priceLte=500;break;
        case '2':priceGt = 500;priceLte=1000;break;
        case '3':priceGt = 1000;priceLte=5000;break;
      }
      params = {
        productPrice:{
            $gt:priceGt,
            $lte:priceLte
        }
      }
    }

    let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
    goodsModel.sort({'productPrice': sort})
    goodsModel.exec(function(err, docs) {
  		if(err) {
  			res.json({
  				status : '0',
  				msg : err.message,
  			})
  		}else{
  			res.json({
  				status : '1',
  				msg : '',
  				result : {
  					count : docs.length,
  					list: docs
  				}
  			})
  		}
  	})
});

// 添加商品到购物车
router.post('/addCart', function(req, res, next) {
  let userId = '100'
  let productId = req.body.productId

  // 通过用户id查出其所对应的商品列表
  Users.findOne({userId: userId}, function(err, usersDoc) {
    console.log(usersDoc)
    if(err) {
      res.json({
        status: '0',
        msg: err.message,

      })
    }else{
      if(usersDoc) {
        let goodsItem = ''
        // 多次添加同一商品,只增加其数量
        usersDoc.cartList.forEach(function(item) {
          if(item.productId === productId) {
            goodsItem = item
            item.productNum++
          }
        })

        if(goodsItem) {
          usersDoc.save(function(err2, goodsDoc2) {
            if(err2) {
              res.json({
                status: '0',
                msg : err2.message
              })
            }else{
              res.json({
                status: '1',
                msg: '',
                result: 'success'
              })
            }
          })
        }else{
          Goods.findOne({productId: productId}, function(err1, goodsDoc) {
            console.log(goodsDoc)
            if(err1) {
              res.json({
                status: '0',
                msg : err1.message
              })
            }else{
              // 加入购物车
              if(goodsDoc) {
                goodsDoc.productNum = 1
                goodsDoc.checked = 1
                usersDoc.cartList.push(goodsDoc)
                usersDoc.save(function(err2, goodsDoc2) {
                  if(err2) {
                    res.json({
                      status: '0',
                      msg : err2.message
                    })
                  }else{
                    res.json({
                      status: '1',
                      msg: '',
                      result: 'success'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
})

module.exports = router
