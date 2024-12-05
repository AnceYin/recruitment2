<template>
	<wd-input custom-class="pl-4" type="text" v-model="formData.title" placeholder="请输入简历名称" />
	<wd-textarea custom-class="h-[150rpx]" v-model="formData.description" placeholder="请填写简历说明" />

	<cxt-form :data="formData" @cellClick="handleCellClick"></cxt-form>

	<view class="flex justify-center">
		<!-- 添加表单结构按钮 -->
		<wd-button custom-class="flex w-1/3 ml-18" @click="onclick5">添加表头</wd-button>

		<!-- 添加上传表单结构按钮 -->
		<wd-button custom-class="flex w-1/3 mr-18" @click="onclick8">保存表单</wd-button>

	</view>


	<!-- 编辑状态下各表头设置弹出层 -->
	<wd-popup v-model="popupValue" position="bottom">
		<view class="flex justify-center">
			<wd-button custom-class="mt-2 ml-3 mr-1" @click="onclick" size="large" plain
				icon="edit-outline">修改</wd-button>
			<wd-button custom-class="mt-2 ml-1 mr-1" type="error" @click="onclick2" size="large" plain
				icon="delete-thin">删除</wd-button>
			<wd-button custom-class="mt-2 ml-1 mr-1" @click="onclick3" size="large" plain
				icon="arrow-thin-up">上移</wd-button>
			<wd-button custom-class="mt-2 ml-1 mr-3" @click="onclick4" size="large" plain
				icon="arrow-thin-down">下移</wd-button>
			<view class="h-[500rpx]"></view>
		</view>
	</wd-popup>

	<!-- 渲染编辑状态下新增和修改底部弹出层 -->
	<wd-popup v-model="popupValue2" position="bottom">
		<wd-text custom-class="block" :text='textValue'></wd-text>
		<wd-switch v-model="checked" @change="switchChange" />
		<wd-input custom-class="pl-4" type="text" v-model="inputValue2" placeholder="在此处填写问题，例：个人简历" />
		<wd-radio-group v-model="radioValue" @change="radioChange" shape="button" cell>
			<wd-radio value="string">问答</wd-radio>
			<wd-radio value="picture">图片</wd-radio>
			<wd-radio value="single">单选</wd-radio>
			<wd-radio value="double">多选</wd-radio>
			<wd-radio value="bool">判断</wd-radio>
		</wd-radio-group>
		<wd-textarea v-model="textareaValue2" :placeholder="textareaPlaceholder" />
		<wd-button size="large" custom-class="flex w-1/2 justify-center z-100" v-if="state.type==='add'"
			@click="onclick6">添加</wd-button>
		<wd-button size="large" custom-class="flex w-1/2 justify-center z-100" v-else-if="state.type==='other'"
			@click="onclick7">更新</wd-button>
		<view class="h-[80rpx]"></view>
	</wd-popup>
</template>


<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	const userInfo = uniCloud.getCurrentUserInfo()
	const template = uniCloud.importObject('template')
	const db = uniCloud.databaseForJQL()
	const formData = ref({
		"generate_user": userInfo.uid,
		"fill_user": null,
		"generate_time": Date.now(),
		"state": "edit",
		"title": "",
		"description": "",
		"properties": []
	})

	let propertiesData = {
		"id": null,
		"is_required": true,
		"title": null,
		"headerType": null,
		"body": null,
		"data": null
	}

	// 用于区分是新增还是修改
	const state = ref({
		type: "",
		param: ""
	})

	onLoad(async (e) => {
		console.log('返回的e:', e);
		const temp = await db.collection('classify-Info').where({
			_id: e.classifyInfoId
		}).field("template").get();

		if (!temp.data[0].template) {
			// 没有template时才创建新的模板
			const res = await template.add('template-resume', formData.value);
			console.log('返回的id:', res.data.id);
			formData.value._id = res.data.id
			const ress = await template.addIdToInfo(e.classifyInfoId, res.data.id);
			console.log('ID插入情况:', ress.data);
		} else {
			// 已有template时，只需加载模板数据
			console.log("temp：", temp.data[0].template);
			const res = await template.get('template-resume', {
				_id: temp.data[0].template
			});
			console.log("已创建的复制", res.data.data[0]);
			formData.value = res.data.data[0];
		}
	});


	async function onclick8() {
		// 更新表单数据，而不是创建新的模板
		formData.value.generate_user = userInfo.uid
		const res = await template.update('template-resume', {
			_id: formData.value._id
		}, formData.value);

		uni.showToast({
			title: '创建简历模板成功',
			icon: 'none',
			duration: 2000 // 提示持续时间，单位为毫秒
		});

		console.log("提交情况", res.data);
		console.log("提交数据formData.value._id", formData.value._id, "提交数据formData.value", formData.value);
	}


	function handleCellClick(id) {
		state.value = {
			type: "other",
			param: id
		}
		popupValue.value = true
	}


	// 设置弹出层
	const popupValue = ref(false)

	function cellClick(event) {

	}

	// 增改弹出层
	const popupValue2 = ref(false)

	function onclick5(event) {

		state.value = {
			type: "add",
			param: ""
		}
		popupValue2.value = true
		console.log(popupValue2.value)
	}

	// 修改
	function onclick() {
		// 将数据还原到各组件
		const elementIndex = formData.value.properties.findIndex((obj => obj.id == state.value.param));
		const oldData = formData.value.properties[elementIndex];
		propertiesData = oldData;
		radioValue.value = oldData.headerType;

		// 判断是否是单选或多选类型，若是，则将数组转换为字符串
		if (oldData.headerType === "single" || oldData.headerType === "double") {
			textareaValue2.value = oldData.body.join(' '); // 将数组转换为字符串
		} else {
			textareaValue2.value = oldData.body;
		}

		checked.value = oldData.is_required;
		inputValue2.value = oldData.title;
		popupValue2.value = true;
	}

	// 删除
	function onclick2() {
		if (state.value.type === "other") {
			const elementIndex = formData.value.properties.findIndex((obj => obj.id == state.value.param));
			formData.value.properties.splice(elementIndex, 1)
		}
		popupValue2.value = false
	}

	function move(arr, index, direction) {
		if (direction === 'up' && index > 0) {
			// 上移
			var temp = arr[index];
			arr[index] = arr[index - 1];
			arr[index - 1] = temp;
		} else if (direction === 'down' && index < arr.length - 1) {
			// 下移
			var temp = arr[index];
			arr[index] = arr[index + 1];
			arr[index + 1] = temp;
		}
	}

	// 上移
	function onclick3() {
		const elementIndex = formData.value.properties.findIndex((obj => obj.id == state.value.param));
		move(formData.value.properties, elementIndex, "up")
	}
	// 下移
	function onclick4() {
		const elementIndex = formData.value.properties.findIndex((obj => obj.id == state.value.param));
		move(formData.value.properties, elementIndex, "down")
	}

	// 是否必选
	const textValue = ref('是否必选')
	const checked = ref(true)

	function switchChange({
		value
	}) {
		propertiesData.is_required = checked.value
	}



	// 选择回答的题型，并改变底部文本域提示内容
	const radioValue = ref('')
	const textareaPlaceholder = ref('点击上述选项选择表单项类型')

	function radioChange({
		value
	}) {
		propertiesData.headerType = value
		switch (value) {
			case "string":
				textareaPlaceholder.value = "在此处填写提示词，例：性格、爱好、特长等"
				break;
			case "picture":
				textareaPlaceholder.value = "无需填写"
				break;
			case "single":
				textareaPlaceholder.value = "在此处填写单选各选项，用空格隔开，例：竞赛部 新媒体部 策划部"
				break;
			case "double":
				textareaPlaceholder.value = "在此处填写多选各选项，用空格隔开，例：竞赛部 新媒体部 策划部"
				break;
			case "bool":
				textareaPlaceholder.value = "无需填写"
				break;
			default:
				break;
		}
	}

	// 表单选项标题
	const inputValue2 = ref('')
	const textareaValue2 = ref('')
	const conver = (input) => input.split(' ')

	function optionsToString() {
		propertiesData.title = inputValue2.value;
		if (radioValue.value === "single" || radioValue.value === "double") {
			propertiesData.body = conver(textareaValue2.value); // 将字符串转为数组
		} else {
			propertiesData.body = textareaValue2.value;
		}
	}


	function generateUniqueId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
	}

	// 提交数据
	function onclick6(event) {
		console.log("按钮被点击");
		optionsToString();
		propertiesData.id = generateUniqueId();
		formData.value.properties.push({
			...propertiesData
		}); // 使用扩展运算符来确保创建新对象
		console.log(propertiesData);
		resetPropertiesData(); // 重置数据
		popupValue2.value = false;
	}

	function resetPropertiesData() {
		propertiesData = {
			"id": null,
			"is_required": true,
			"title": null,
			"headerType": null,
			"body": null,
			"data": null
		};
		radioValue.value = '';
		textareaValue2.value = '';
		checked.value = true;
		textareaPlaceholder.value = '点击上述选项选择表单项类型';
		inputValue2.value = '';
	}


	// 更新按钮
	function onclick7(event) {
		const elementIndex = formData.value.properties.findIndex((obj => obj.id == state.value.param));
		optionsToString();
		propertiesData.id = state.value.param;
		formData.value.properties[elementIndex] = {
			...propertiesData
		}; // 确保只更新指定项
		resetPropertiesData();
		popupValue2.value = false;
	}
</script>

<style lang="scss" scoped>

</style>