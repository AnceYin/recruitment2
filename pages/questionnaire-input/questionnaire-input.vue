<template>
	<view>
		<cxt-form :data="formData" @cellClick="handleCellClick"></cxt-form>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	const db = uniCloud.database();
	const userInfo = uniCloud.getCurrentUserInfo();
	const template = uniCloud.importObject("template");

	const formData = ref(null);

	onLoad(async (e) => {
		try {
			// 查询 list-resume 中是否存在对应的记录
			const res = await template.get("list-resume", {
				fill_user: userInfo.uid,
				template_id: e.templateID,
			});

			// 从模板加载数据
			const templateRes = await template.get("template-resume", {
				_id: e.templateID,
			});

			// 使用模板数据初始化 formData
			formData.value = templateRes.data.data[0];
			formData.value.state = "input";
			formData.value.fill_user = userInfo.uid;
			formData.value.template_id = e.templateID;
			delete formData.value._id;

			if (res.data.data.length > 0) {
				// 如果记录已存在，从 list-resume 表中获取数据
				const existingData = res.data.data[0];

				// 遍历模板中的 properties
				formData.value.properties.forEach((templateProp) => {
					// 在已有数据中查找相同 id 的 property
					const existingProp = existingData.properties.find(
						(prop) => prop.id === templateProp.id
					);

					// 如果找到了对应的 property，保留用户已经填写的 data
					if (existingProp) {
						templateProp.data = existingProp.data;
					}
				});
			}

			// 如果是第一次加载，插入到 list-resume 表中
			if (res.data.data.length === 0) {
				await template.add("list-resume", formData.value);
			}
		} catch (error) {
			console.error("数据加载失败:", error);
		}
	});

	async function handleCellClick() {
		try {
			// 删除 _id 字段，避免更新冲突
			delete formData.value._id;
			let required = true
			// 查看必填字段是否填写
			formData.value.properties.forEach(property => {
				// 检查 data 是否为空且 is_required 为 true
				if (property.data === "" && property.is_required) {
					required = false
				}
			});
			if(required){
				// 更新现有的文档
				await template.update("list-resume", {
					fill_user: userInfo.uid,
					template_id: formData.value.template_id,
				}, formData.value);
				uni.showToast({
					title: '简历已提交至负责人',
					icon: 'none',
					duration: 2000 // 提示持续时间，单位为毫秒
				});
			}else{
				uni.showToast({
					title: '必填字段尚未填写',
					icon: 'none',
					duration: 2000 // 提示持续时间，单位为毫秒
				});
			}
		} catch (error) {
			console.error("更新数据失败:", error);
		}
	}
</script>

<style>
	/* 样式 */
</style>