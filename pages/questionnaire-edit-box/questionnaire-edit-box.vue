<template>
	<view>
		<wd-cell-group v-if="classifyInfo">
			<wd-cell v-for="(item,index) in classifyInfo" :key="item._id" :title="item.title"
				:value="(!(item.template==='')) ? '已创建' : '未创建'" is-link @click="toQuestionnaireEditBox(item._id)" />
		</wd-cell-group>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onShow } from '@dcloudio/uni-app'

	const db = uniCloud.database()
	const userInfo = uniCloud.getCurrentUserInfo()
	const classifyInfo = ref([])

	async function getClassifyInfo() {
		try {
			const res = await db.collection('classify-Info')
				.where({
					author: userInfo.uid
				})
				.field({ template: true, title: true }) // 指定返回字段
				.get()
			classifyInfo.value = res.result.data || []; // 赋值给 ref 变量
		} catch (err) {
			console.log(err.code); // 打印错误码
			console.log(err.message); // 打印错误内容
		}
	}
	function toQuestionnaireEditBox(classifyInfoId){
		uni.navigateTo({
			url: `/pages/questionnaire-edit/questionnaire-edit?classifyInfoId=${classifyInfoId}`
		})
	}
	
	onShow(() => {
		getClassifyInfo();
	});
	
</script>

<style>
/* 样式可以在此定义 */
</style>
