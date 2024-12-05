<template>
	<view>
		<cxt-form :data="formData" @cellClick="handleCellClick"></cxt-form>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	const template = uniCloud.importObject('template')
	
	const formData = ref()
	onLoad(async (e) => {
		console.log(e.resumeId)
		const res = await template.get("list-resume",{
				_id: e.resumeId
			})
		formData.value = res.data.data[0]
		formData.value.state = "show"
		
	})
	function handleCellClick(){
		uni.navigateTo({
			url:'/uni_modules/uni-im/pages/chat/chat?user_id=' + formData.value.fill_user
		})
	}
</script>

<style>

</style>