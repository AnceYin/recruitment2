// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const UniSubscribemsg = require('uni-subscribemsg');
module.exports = {
	_before: function () { // 通用预处理器
		this.httpParams = this.getHttpInfo()
	},

	async push() {
		// 引入uni-subscribemsg公共模块
		// 初始化实例
		let uniSubscribemsg = new UniSubscribemsg({
			dcloudAppid: "wxc3f708a1decede29",
			provider: "weixin-mp",
		});
		console.log("微信发来的消息",this.httpParams)
		// 发送订阅消息
		// let res = await uniSubscribemsg.sendSubscribeMessage({
		// 	touser: "用户openid",
		// 	template_id: "wxc3f708a1decede29",
		// 	page: "pages/index/index", // 小程序页面地址
		// 	miniprogram_state: "formal", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
		// 	lang: "zh_CN",
		// 	data: {
		// 		number5: {
		// 			value: "张三"
		// 		},
		// 		time6: {
		// 			value: "2023-12-21 15:30:20"
		// 		},
		// 		thing7: {
		// 			value: "2023-12-21 15:30:20"
		// 		}
		// 	}
		// });

		// 业务逻辑
		
		// 返回结果
		return {
			param1 //请根据实际需要返回值
		}
	}
}
