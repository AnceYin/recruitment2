<template>
	<view>
		<web-view :src="url"></web-view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	
	const url = ref()
	
	onLoad((e) => {
		console.log(e.url)
		url.value = "https://mp.weixin.qq.com/s/" + e.url
	});
	
</script>

<style>
	       
</style>
