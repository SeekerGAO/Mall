const mongoose = require('mongoose')
const Schema = mongoose.Schema

//存放用户信息以及所对应的商品信息模型
const userSchema = new Schema({
	'userId' : String,
	'userName' : String,
	'userPwd' : String,
	'orderList' : Array,
	'cartList' : [
		{
			'productId' : String,
			'productName' : String,
			'productPrice' : Number,
			'productImg' : String,
			'productNum' : String,
			'checked' : String
		}
	],
	'addressList' : [
		{
			"addressId" : String,
      "userName" : String,
      "streetName" : String,
      "postCode" : String,
      "tell" : Number,
      "isDefault" : Boolean
		}
	]
})

module.exports = mongoose.model('User', userSchema)
