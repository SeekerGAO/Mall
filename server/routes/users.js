var express = require('express');
var router = express.Router();

var User = require('./../models/users.js')

require('./../util/util')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

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

router.post('/logout', function(req, res, next) {
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

router.get('/checkLogin', function(req, res,next) {
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

router.get('/cartList', function(req, res, next) {
	let userId = req.cookies.userId
	
	User.findOne({userId: userId}, function(err, doc) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
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

router.post('/cartDel', function(req, res, next) {
	let userId = req.cookies.userId
	let productId = req.body.productId

	User.update({
		userId: userId
	},{
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

router.post('/cartEdit', function(req, res, next) {
	let userId = req.cookies.userId
	let productId = req.body.productId
	let productNum = req.body.productNum
	let checked = req.body.checked

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

router.post('/cartCheckAll', function(req, res, next) {
	let userId = req.cookies.userId
	let checkedAll = req.body.checkedAll ? '1' : '0'

	User.findOne({userId: userId}, function(err, user) {
		if(err) {
			res.json({
				status: '0',
				msg: err.message,
				result: ''
			})
		}else{
			if(user) {
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

router.post('/setDefault', function (req,res,next) {
  	let userId = req.cookies.userId
    let addressId = req.body.addressId
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

router.post('/delAddress', function(req, res, next) {
	let userId = req.cookies.userId
	let addressId = req.body.addressId

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

			doc.addressList.forEach((item) => {
				if(item.addressId == addressId) {
					address = item
				}
			})
			doc.cartList.forEach((item) => {
				if(item.checked == '1') {
					goodsList.push(item)
				}
			})

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
			let orderList = doc.orderList
			let orderTotal = 0
			if(orderList.length > 0) {
				orderList.forEach((item) => {
					if(item.orderId == orderId) {
						orderTotal = item.orderTotal
					}
				})

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
					res.json({
						status: '500001',
						msg: '无此订单',
						result: ''
					})
				}
			}else {
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
