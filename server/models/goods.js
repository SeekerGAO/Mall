const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 存放商品信息模型
const productSchema = new Schema({
	'productId' : String,
	'productName' : String,
	'productPrice' : Number,
	'productImg' : String,
	'productNum': Number,
	'checked': String
})

module.exports = mongoose.model('Good', productSchema)
