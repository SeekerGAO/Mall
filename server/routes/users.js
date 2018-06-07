var express = require('express');
var router = express.Router();

var User = require('./../models/users.js')

require('./../util/util')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 用户登录
router.post('/login', function(req, res, next) {
	var param = {
		userName: req.body.userName,
		userPwd: req.body.userPwd
	}

	User.findOne(param, function(err, docs) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message
			})
		}else{
		  // 设置用户的缓存
			if(docs) {
				res.cookie('userId', docs.userId, {
					path: '/',
					maxAge: 1000 * 60 * 60
				})
				res.cookie('userName', docs.userName, {
					path: '/',
					maxAge: 1000 * 60 * 60
				})

				res.json({
				status: '1',
				msg: '',
				result: {
					userName: docs.userName
				}
			})
			}
		}
	})
})

// 用户退出
router.post('/logout', function(req, res, next) {
  // 清空用户缓存
	res.cookie('userId','', {
		path: '/',
		maxAge: -1
	})
	res.cookie('userName','', {
		path: '/',
		maxAge: -1
	})

	res.json({
		status: '1',
		msg: '',
		result: ''
	})
})

// 检测用户是否有登录信息
router.get('/checkLogin', function(req, res,next) {
  // 通过缓存的用户id
	if(req.cookies.userId) {
		res.json({
			status: '1',
			msg: '',
			result: req.cookies.userName
		})
	}else{
		res.json({
			status: '0',
			msg: '当前未登录',
			result: ''
		})
	}
})

// 获取购物车列表
router.get('/cartList', function(req, res, next) {
	let userId = req.cookies.userId

  // 查找出用户对应的购物车信息
	User.findOne({userId: userId}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
		  // 返回给前段
			if(doc) {
				res.json({
					status: '1',
					msg: '',
					result: doc.cartList
				})
			}
		}
	})
})

// 删除购物车商品信息
router.post('/cartDel', function(req, res, next) {
	let userId = req.cookies.userId
	let productId = req.body.productId

  // 可以直接通过要更改的信息去更新数据库
	User.update({
		userId: userId
	},{
	  // 直接传入具体对应的商品id,数据库会自动去更新所需的字段
		$pull: {
			cartList: {
				productId: productId
			}
		}
	}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
			res.json({
				status: '1',
				msg: '',
				result: 'success'
			})
		}
	})
})

// 编辑购物车的信息： 数量、是否选中
router.post('/cartEdit', function(req, res, next) {
	let userId = req.cookies.userId
	let productId = req.body.productId
	let productNum = req.body.productNum
	let checked = req.body.checked

  // 也是可以直接传入对应的字段即可,数据库也会相对应的进行更新
	User.update({'userId': userId, 'cartList.productId': productId}, {
		'cartList.$.productNum': productNum,
		'cartList.$.checked': checked
	}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
			res.json({
				status: '1',
				msg: '',
				result: 'success'
			})
		}
	})
})

// 选中购物车中全部的商品
router.post('/cartCheckAll', function(req, res, next) {
	let userId = req.cookies.userId
  // 选中的状态
	let checkedAll = req.body.checkedAll ? '1' : '0'

	User.findOne({userId: userId}, function(err, user) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
		  // 用户购物车有商品
			if(user) {
			  // 通过遍历去改变购物车中每个商品是否选中的状态
				user.cartList.forEach((item) => {
					item.checked = checkedAll
				})
				user.save(function(err1, doc) {
					if(err1) {
						res.json({
							status: '0',
							msg: err1.message,
							result: ''
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
})

// 获取购物车中的商品数量
router.get('/getCartCount', function(req, res, next) {
	if(req.cookies && req.cookies.userId) {
		let userId = req.cookies.userId

		User.findOne({userId: userId}, function(err, doc) {
			if(err) {
				res.json({
					status: '0',
					msg:err.message,
					result: ''
				})
			}else {
				let cartList = doc.cartList
				let cartCount = 0
        // 遍历全部商品中每一种商品的数量,即为商品的总数量
				cartList.map((item) => {
					cartCount += parseInt(item.productNum)
				})

				res.json({
					status: '1',
					msg: '',
					result: cartCount
				})
			}
		})
	}
})

// 地址列表
router.get('/addressList', function(req, res, next) {
	let userId = req.cookies.userId

	User.findOne({userId: userId}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else {
			res.json({
				status: '1',
				msg: '',
				result: doc.addressList
			})
		}
	})
})

// 设置购买的默认地址
router.post('/setDefault', function (req,res,next) {
  	let userId = req.cookies.userId
    let addressId = req.body.addressId
    // 没有此地址的情况
	  if(!addressId){
	    res.json({
	       status:'1003',
	       msg:'addressId is null',
	       result:''
	    });
	  }else{
	    User.findOne({userId:userId}, function (err,doc) {
	      if(err){
	        res.json({
	          status:'0',
	          msg:err.message,
	          result:''
	        })
	      }else{
	        // 获取到具体的地址,并设置其状态
	        let addressList = doc.addressList
	        addressList.forEach((item)=>{
	          if(item.addressId == addressId){
	             item.isDefault = true
	          }else{
	            item.isDefault = false
	          }
	        })

	        doc.save(function (err1,doc1) {
	          if(err1){
	            res.json({
	              status:'0',
	              msg:err1.message,
	              result:''
	            });
	          }else{
	              res.json({
	                status:'1',
	                msg:'',
	                result:''
	            })
	          }
	        })
	      }
	    })
  	}
});

// 删除地址信息
router.post('/delAddress', function(req, res, next) {
	let userId = req.cookies.userId
	let addressId = req.body.addressId

  // 拿到具体的地址id直接更新
	User.update({
		userId: userId
	}, {
		$pull: {
			addressList: {
				addressId : addressId
			}
		}
	}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else {
			res.json({
				status: '1',
				msg: '',
				result: ''
			})
		}
	})
})

// 结算信息
router.post('/payMent', function(req, res, next) {
	let userId = req.cookies.userId
	let addressId = req.body.addressId
	let orderTotal = req.body.orderTotal

	User.findOne({userId: userId}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else {
			let address = '', goodsList = []

      // 拿到购买的地址
			doc.addressList.forEach((item) => {
				if(item.addressId == addressId) {
					address = item
				}
			})
      //拿到所购买的所有商品
			doc.cartList.forEach((item) => {
				if(item.checked == '1') {
					goodsList.push(item)
				}
			})

      // 生成订单的id号
			let platForm = '622'
			let r1 = Math.floor(Math.random() * 10)
			let r2 = Math.floor(Math.random() * 10)

			let sysDate = new Date().Format('yyyyMMddhhmmss')
      let orderDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      let orderId = platForm + r1 + sysDate + r2

      let order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        orderDate: orderDate
      }

      // 每完成一个结算,就将其加入到订单列表
      doc.orderList.push(order)

			doc.save(function(err1, doc1) {
				if(err1) {
					res.json({
						status: '0',
						msg: err1.message,
						result: ''
					})
				}else{
					res.json({
						status: '1',
						msg: '',
						result: {
							orderId: order.orderId,
							orderTotal: order.orderTotal
						}
					})
				}
			})
		}
	})
})

// 订单信息
router.get('/orderDetail', function(req, res, next) {
	let userId = req.cookies.userId
	let orderId = req.query.orderId

	User.findOne({userId: userId}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else {
		  // 获取订单列表
			let orderList = doc.orderList
			let orderTotal = 0
      // 在有订单的情况下
			if(orderList.length > 0) {
				orderList.forEach((item) => {
					if(item.orderId == orderId) {
						orderTotal = item.orderTotal
					}
				})
        // 并且要有购买的结算金额
				if(orderTotal > 0) {
					res.json({
						status: '1',
						msg: '',
						result: {
							orderId: orderId,
							orderTotal: orderTotal
						}
					})
				}else{
				  // 用户有创建订单,但是订单不符合
					res.json({
						status: '500001',
						msg: '无此订单',
						result: ''
					})
				}
			}else {
			  // 用户根本就没有创建订单
				res.json({
					status: '0',
					msg: '当前用户未创建订单',
					result: ''
				})
			}
		}
	})
})

module.exports = router;
