<template>
	<view>
		<wd-cell-group v-if="resumeList">
			<wd-cell v-for="(item, index) in resumeList" :key="item._id" :title="maskMobileNumber(item.fill_user[0].mobile)"
				is-link @click="toQuestionnaireEditBox(item._id)" />
		</wd-cell-group>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onShow } from '@dcloudio/uni-app'
	const template = uniCloud.importObject("template");

	const db = uniCloud.database()
	const userInfo = uniCloud.getCurrentUserInfo()
	const resumeList = ref([])

	// 获取 list-resume 表的数据
	async function getResumeList() {
		try {
			const db = uniCloud.databaseForJQL()
			const resumes = db.collection('list-resume').where('generate_user==$cloudEnv_uid').field("fill_user").getTemp()
			const users = db.collection('uni-id-users').field("_id,mobile").getTemp()
			const res = await db.collection(resumes, users).get()
			resumeList.value = res.data
			console.log("list-resume------",res);
		} catch (err) {
			console.log("没权限------");
			console.log(err.code); 
			console.log(err.message); 
		}
	}
	
	function maskMobileNumber(mobile) {
	  // 使用正则表达式将中间四位替换为星号
	  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
	}

	function toQuestionnaireEditBox(resumeId){
		uni.navigateTo({
			url: `/pages/questionnaire-show/questionnaire-show?resumeId=${resumeId}`
		})
	}
	
	onShow(async () => {
		await getResumeList(); // 获取 resume 列表
	});
</script>

<style>
/* 样式可以在此定义 */
</style>
