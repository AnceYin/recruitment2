// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129


let dbJQL = null // exports外的函数和变量可以被内部的函数调用，但内部之间不可以相互调用

module.exports = {
	_before: function() {

		// 参数通过挂载的方式传递，也可以直接传递
		this.params = this.getParams()

		// 参数通过http协议传递
		this.httpParams = this.getHttpInfo() // 获取url化时的http信息

		dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo() // 云对象调用JQL专用格式，客户端则删掉整个对象
		}) // exports外的函数和变量可以被内部的函数调用，但内部之间不可以相互调用

		dbJQL.setUser({ // 指定后续执行操作的用户信息，此虚拟用户将同时拥有传入的uid、role、permission
			uid: '_uni_starter_test_user_id', // 用户id
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission字段
			permission: [] // 用户权限
		})

		const methodName = this.getMethodName() // 获取当前调用的方法名
		const clientInfo = this.getClientInfo() // 获取客户端信息
		const secretType = clientInfo.secretType // 客户端调用 uniCloud.importObject 传递的参数
		// 
		// if (methodName === 'add' && !this.getUniIdToken()) { // 获取客户端token
		// 	throw new Error('token不存在')
		// }
		// 如果这个云对象的reward方法的返回数据必须加密，那么应该使用如下方式校验客户端的请求是否合法
		// if (methodName === 'reward' && (secretType !== 'both' || secretType !== 'response')) {
		// 	throw new Error('secretType invalid') // 拒绝返回有效数据
		// }

		this.startTime = Date.now() // 在before内记录开始时间并在this上挂载，以供后续流程使用
	},
	_after(error, result) {
		// if (error) {
		// 	throw error // 如果方法抛出错误，也直接抛出不处理
		// }
		// result.timeCost = Date.now() - this.startTime
		// return result
	},
	_timing: function(param) {
		console.log('触发时间：', param.Time)
		console.log('triggered by timing')
	},
	async IP() {
		const clientInfos = uniCloud.getClientInfos()
		const ip = clientInfos[0].clientIP
		return {
			"errCode": "0",
			"errMsg": "调用成功",
			"data": ip
		}
	},
	async WXGZHtoken() {
		const url = "https://api.weixin.qq.com/cgi-bin/token"
		const res = await uniCloud.request({
			url,
			data: {
				grant_type: 'client_credential',
				appid: 'wxdd8766b03ba80482',
				secret: '814f0e209f54672412ded8025ee03621'
			}
		})
		return res
	},
	async uppng() {
		let path = URL.createObjectURL(item)
		let name = item.name
		await uniCloud.uploadFile({
			filePath: path,
			cloudPath: name
		}).then(res => {
			uniCloud.getTempFileURL({
				fileList: [res.fileID]
			}).then(ress => {
				insertFn(ress.fileList[0].tempFileURL)
				console.log(ress.fileList[0].tempFileURL)
			});
		})
	},
	async delepng() {
		// 云函数删除文件示例代码
		let result = await uniCloud.deleteFile({
			fileList: [
				"cloud://test-28farb/a.png" // 阿里云fileID是url形式，例：https://xxx.com/xxx.png
			]
		});
	},
	async del() {
		let res = await dbJQL.collection("favorite").where(
			"article_id=='66a9f0949eb7c090915afaa9' && user_id=='66a35d160c04326bf4e352b5'").remove()
		return res
	},
	async get(searchVal = "") {
		const res = await dbJQL.collection('classify-Info').where({
			body: new RegExp(searchVal, 'i')
		}).field("title, cover, description, label").get()
		console.log(res)
	},
	async remove(article_id) {
		const res = await dbJQL.collection('favorite').where({
			article_id,
			user_id: dbJQL.getCloudEnv('$cloudEnv_uid')
		}).remove()
		return res
	},
	async add(article_id) {
		const res = await dbJQL.collection('favorite').add({
			article_id: article_id,
			user_id: dbJQL.getCloudEnv('$cloudEnv_uid'),
			create_date: dbJQL.getCloudEnv('$cloudEnv_now')
		})
		return {
			errCode: 0,
			errMsg: '插入成功',
			data: res
		}
		/*
		// 客户端代码
		const test1 = uniCloud.importObject('test1')
		
		//  尝试不传article_id，云函数返回错误的响应
		try { 
			await todo.add()
		} catch (e) {
			// e.errCode === 'INVALID_ARTICLE_ID'
			// e.errMsg === 'article_id不可为空'
			// e.detail === {errCode: 'INVALID_ARTICLE_ID',errMsg: 'article_id不可为空'}
			// e.requestId === 'xxxx'
			// js错误对象不是json，直接console.log(e)，只能得到被toString()后的errMsg。
		}
		
		// 尝试传入正确的article_id，云函数返回原始响应
		try {
			const res = await todo.add('66a9f0949eb7c090915afaa9')
			// res = {errCode: 0,errMsg: '插入成功',data:{}}
		} catch (e) {}
		
		*/
	}
}