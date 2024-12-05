const uniID = require('uni-id-common')
module.exports = {
	_before: function() {
		this.db = uniCloud.database();
		const clientInfo = this.getClientInfo()
		this.uniID = uniID.createInstance({
			clientInfo
		})
		this.token = this.getUniIdToken()
	},

	async addIdToInfo(e, templateID) {
		const collection = this.db.collection("classify-Info");
		const res = await collection.where({
			_id: e
		}).update({
			template: templateID
		})
		console.log("tempppp", res)
		return {
			errCode: 0,
			errMsg: 'ID插入成功',
			data: res
		}
	},

	async add(collectionName, param) {
		const userInfo = await this.uniID.checkToken(this.token)
		if (!collectionName || !param) {
			return {
				errCode: 'INVALID_PARAM',
				errMsg: '参数无效'
			}
		}
		const collection = this.db.collection(collectionName);
		let res = null
		switch (collectionName) {
			case "template-questionnaire":
				if (userInfo.role.includes('admin')) {
					res = await collection.add(param)
					return {
						errCode: 0,
						errMsg: '插入成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			case "template-resume":
				if (userInfo.role.includes('hr')) {
					res = await collection.add(param)
					console.log(res)
					return {
						errCode: 0,
						errMsg: '插入成功',
						data: res
					}
				}
				console.log("没有插入")
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			case "list-questionnaire":
				if (userInfo.uid === param.fill_user) {
					res = await collection.add(param)
					return {
						errCode: 0,
						errMsg: '插入成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			case "list-resume":
				if (userInfo.uid === param.fill_user) {
					res = await collection.add(param)
					return {
						errCode: 0,
						errMsg: '插入成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			default:
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
		}
	},

	async remove(collectionName, param) {
		const userInfo = await this.uniID.checkToken(this.token)
		if (!collectionName || !param) {
			return {
				errCode: 'INVALID_PARAM',
				errMsg: '参数无效'
			}
		}
		const collection = this.db.collection(collectionName);
		let res = null
		switch (collectionName) {
			case "template-questionnaire":
				if (userInfo.role.includes('admin')) {
					res = await collection.remove(param)
					return {
						errCode: 0,
						errMsg: '删除成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			default:
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
		}
	},

	async update(collectionName, param1, param2) {
		const userInfo = await this.uniID.checkToken(this.token)
		if (!collectionName || !param1 || !param2) {
			return {
				errCode: 'INVALID_PARAM',
				errMsg: '参数无效'
			}
		}
		const collection = this.db.collection(collectionName);
		let res = null
		switch (collectionName) {
			case "template-questionnaire":
				if (userInfo.role.includes('admin')) {
					res = await collection.where(param1).update(param2)
					return {
						errCode: 0,
						errMsg: '更新成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			case "template-resume":
				if (userInfo.role.includes('hr')) {
					res = await collection.where(param1).update(param2)
					return {
						errCode: 0,
						errMsg: '更新成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				console.log("没有更新")
				break;
			case "list-questionnaire":
				if (userInfo.uid === param2.fill_user) {
					res = await collection.where(param1).update(param2)
					return {
						errCode: 0,
						errMsg: '更新成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			case "list-resume":
				if (userInfo.uid === param2.fill_user) {
					res = await collection.where(param1).update(param2)
					return {
						errCode: 0,
						errMsg: '更新成功',
						data: res
					}
				}
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
			default:
				return {
					errCode: 'INVALID_ROLE',
						errMsg: '身份校验未通过'
				}
				break;
		}
	},

	async get(collectionName, param) {
		const userInfo = await this.uniID.checkToken(this.token)
		if (!collectionName || !param) {
			return {
				errCode: 'INVALID_PARAM',
				errMsg: '参数无效'
			}
		}
		const collection = this.db.collection(collectionName);
		let res = null
		switch (collectionName) {
			case "template-questionnaire":
				res = await collection.where(param).get()
				break;
			case "template-resume":
				res = await collection.where(param).get()
				break;
			case "list-questionnaire":
				res = await collection.where(param).get()
				break;
			case "list-resume":
				res = await collection.where(param).get()
				break;
			default:
				return {
					errCode: 'INVALID_ROLE',
					errMsg: '身份校验未通过'
				}
				break;
		}
		return {
			errCode: 0,
			errMsg: '查询成功',
			data: res
		}
	}
}