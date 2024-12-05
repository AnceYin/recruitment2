<template>
	<!-- 渲染表标题及描述，确保 props.data 存在时才渲染 -->
	<view v-if="props.data">
		<wd-text custom-class="text-lg flex justify-center text-red-500" type="primary" :text="props.data.title"></wd-text>
		<wd-text custom-class="pl-4" type="primary" :text="props.data.description"></wd-text>
		<!-- 渲染表头 -->
		<wd-cell-group v-if="props.data.properties"
			:title="props.data.state==='edit'?'编辑表头':props.data.state==='show'?'数据展示':'数据填写'" border>
			<!-- 标题和是否必选，以单元格的形式渲染 -->
			<wd-cell v-for="item in props.data.properties" :key="item.id" :title="item.title"
				:required="item.is_required" vertical :clickable="props.data.state==='edit'"
				@click="$emit('cellClick', item.id)">
				<template #label>
					<!-- 输入框 -->
					<view v-if="item.headerType==='string'">
						<wd-input v-model="item.data" :readonly="!(props.data.state==='input')" :placeholder="item.body" />
					</view>
					<!-- 图片 -->
					<view v-else-if="item.headerType==='picture'">
						<wd-img :width="100" :height="100" :src="item.data.url" :enable-preview="true"
							v-if="props.data.state==='show'" />
						<uni-file-picker v-else :limit="1" v-model="item.data" fileMediatype="image" mode="grid"
							:disabled="props.data.state==='edit'" />
					</view>
					<!-- 单选 -->
					<view v-else-if="item.headerType==='single'">
						<wd-radio-group :disabled="!(props.data.state==='input')" v-model="item.data">
							<wd-radio shape="dot" v-for="(item2,index2) in item.body" :key="index2"
								:value="item2">{{item2}}</wd-radio>
						</wd-radio-group>
					</view>
					<!-- 多选 -->
					<view v-else-if="item.headerType==='double'">
						<wd-checkbox-group :disabled="!(props.data.state==='input')" v-model="item.data">
							<wd-checkbox shape="square" v-for="(item3,index3) in item.body" :key="index3"
								:modelValue="item3">{{item3}}</wd-checkbox>
						</wd-checkbox-group>
					</view>
					<!-- 开关 -->
					<view v-else-if="item.headerType==='bool'">
						<wd-switch v-model="item.data" :disabled="!(props.data.state==='input')" />
					</view>
				</template>
			</wd-cell>
		</wd-cell-group>

		<!-- 渲染输入状态下的提交按钮 -->
		<wd-button custom-class="flex w-1/2 justify-center" v-if="props.data.state==='input'"
			@click="$emit('cellClick')">点击提交</wd-button>
		<!-- 渲染展示界面状态下的聊一聊按钮 -->
		<wd-button custom-class="flex w-1/2 justify-center" v-if="props.data.state==='show'"
			@click="$emit('cellClick')">沟通</wd-button>
	</view>
</template>

<script lang="ts" setup>
	const props = defineProps(["data"])
</script>

<style lang="scss" scoped>

</style>
