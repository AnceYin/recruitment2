// article.schema.ext.js
module.exports = {
	trigger: {
		afterCreate: async function({
			collection,
			operation,
			clientInfo,
			addDataList
		} = {}) {
			const db = uniCloud.database()
			for (let i = 0; i < addDataList.length; i++) {
				const addDataItem = addDataList[i]
				await db.collection('classify-Info').doc(addDataItem.article_id).update({
					star: db.command.inc(1)
				})

			}
		},
		beforeDelete: async function({
			collection,
			operation,
			clientInfo,
			where
		} = {}) {
			const db = uniCloud.database()
			const res = await db.collection('favorite').where(where).get()
			const record = res.data[0]
			if (record) {
				await db.collection('classify-Info').doc(record.article_id).update({
					star: db.command.inc(-1)
				})
			}
		}
	}
}