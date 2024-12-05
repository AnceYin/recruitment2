<template>
	<view class="container">
		<!-- TabBar 置于顶部并吸顶 -->
		<!-- 	<view class="tabbar">
			<view :class="['tabbar-item', { active: currentTab === 0 }]" @click="switchTab(0)">
				<text>社团</text>
			</view>
			<view :class="['tabbar-item', { active: currentTab === 1 }]" @click="switchTab(1)">
				<text>部门</text>
			</view>
		</view> -->

		<!-- 内容区域 -->
		<view class="content">
			<!-- 当 currentTab 为 0 时，显示“社团”内容 -->

			<view v-if="currentTab === 0" class="content-box">
				<!-- 图标栏 -->
				<view class="icon-bar">
					<view v-for="(item, index) in categories" :key="index" class="icon-item"
						@click="selectCategory(index, false)">
						<image :src="item.icon" class="icon-img" />
						<text :class="['icon-title', { active: false }]">{{ item.title }}</text>
					</view>
				</view>

				<!-- test -->
				<!-- 显示当前选择的内容 -->
				<view class="content-display">
					<view v-for="(content, index) in currentContent" :key="index" class="content-item"
						@click="navigateToDetail(content)">
						<image v-if="content.cover && content.cover.url" :src="content.cover.url"
							class="content-display-img" />
						<text class="content-display-title">{{ content.title }}</text>
						<!-- 社团内容的标签展示 -->
						<view class="content-display-label-container">
							<text v-for="(label, index) in content.label.split(',')" :key="index"
								class="content-display-label">{{ label.trim() }}</text>
						</view>


					</view>

				</view>
			</view>

			<!-- 当 currentTab 为 1 时，显示“部门”内容 -->
			<view v-if="currentTab === 1" class="content-box">
				<view class="sidebar-container">
					<!-- 左侧侧边栏 -->
					<!-- 确保部门侧边栏的正确渲染 -->
					<view v-if="filteredDepartments.length > 0" class="sidebar">
						<view v-for="(item, index) in filteredDepartments" :key="index"
							:class="['sidebar-item', { active: selectedItem === index }]"
							@click="selectCategory(index, true)">
							<image :src="item.icon" class="sidebar-icon" />
							<text class="sidebar-title">{{ item.title }}</text>
						</view>
					</view>

					<!-- 确保右侧内容区域的正确渲染 -->
					<view v-if="currentDepartmentContent.length > 0" class="sidebar-content">
						<view v-for="(content, index) in currentDepartmentContent" :key="index"
							class="sidebar-content-item" @click="navigateToDetail(content)">
							<image v-if="content.cover && content.cover.url" :src="content.cover.url"
								class="sidebar-content-img" />
							<text class="sidebar-content-title">{{ content.title }}</text>
							<!-- 部门内容的标签展示 -->
							<view class="sidebar-content-label-container">
								<text v-for="(label, index) in content.label.split(',')" :key="index"
									class="sidebar-content-label">{{ label.trim() }}</text>
							</view>
						</view>
					</view>


				</view>
			</view>
		</view>
	</view>
</template>
<!-- test111 -->
<script>
	export default {
		data() {
			return {
				currentTab: 0, // 当前选中的 Tab
				categories: [], // 用于存储从数据库获取的分类数据
				filteredDepartments: [], // 用于存储过滤后的部门数据
				selectedItem: 0, // 默认选中的侧边栏项

				classifyInfoData: [], // 用于存储从数据库获取的 classify-Info 数据
				currentContent: [], // 用于存储当前显示的内容数据
				currentDepartmentContent: [], // 初始化为一个空数组

			};
		},
		// onLoad() {
		// 	this.getCategories();
		// 	this.getClassifyInfoData(); // 在页面加载时调用获取数据的方法
		// },
		onShow() {
			this.getCategories().then(() => {
				this.getClassifyInfoData().then(() => {
					this.initializeContent(); // 初始化页面时渲染默认内容
				});
			});
		},
		onLoad(options) {
			// 检查是否有 currentTab 参数，并设置 currentTab
			if (options.currentTab) {
				this.currentTab = parseInt(options.currentTab, 10);
			} else {
				this.currentTab = 0; // 默认显示社团内容
			}
			console.log("Received currentTab:", this.currentTab);
			this.initializeContent(); // 根据 currentTab 渲染相应内容
		},


		methods: {
			// 用于导航到详情页并传递数据的方法
			navigateToDetail(data) {
				wx.navigateTo({
					url: `/pages/clubdetails/clubdetails?data=${encodeURIComponent(JSON.stringify(data))}`, // 修改为目标页面的路径
					success(res) {
						console.log('跳转成功', res);
					},
					fail(err) {
						console.error('跳转失败', err);
						uni.showToast({
							title: '获取用户信息失败，请先登录',
							icon: 'none',
							duration: 2000 // 提示持续时间，单位为毫秒
						});
					}
				});
			},
			initializeContent() {
				if (this.currentTab === 0 && this.categories.length > 0) {
					this.selectCategory(0, false); // 默认选择第一个Icon
				} else if (this.currentTab === 1 && this.filteredDepartments.length > 0) {
					this.selectCategory(0, true); // 默认选择第一个部门
				}
			},


			// 查询 classify-Info 数据表并打印结果
			async getClassifyInfoData() {
				const db = uniCloud.database();
				try {
					const res = await db.collection('classify-Info').get(); // 查询 classify-Info 数据表
					this.classifyInfoData = res.result.data || []; // 将结果存储在 data 中
					console.log('classify-Info 数据表查询结果:', this.classifyInfoData); // 打印查询结果




				} catch (error) {
					console.error('获取 classify-Info 数据时出错:', error); // 捕获并打印错误
				}
			},



			async getCategories() {
				const db = uniCloud.database();
				try {
					const categoriesRes = await db.collection('classify-element-type').get();
					console.log('classify-element-type 数据库查询结果:', categoriesRes);

					if (categoriesRes.result && categoriesRes.result.data) {
						// 获取社团数据
						const societies = categoriesRes.result.data
							.filter(
								(item) =>
								item.categoriesType === '66cac8149d9f915ad26f4a39'
							)
							.sort((a, b) => a.sort - b.sort)
							.map((item) => ({
								title: item.title,
								icon: item.icon.url,
								id: item._id
							}));

						// 获取部门数据并过滤
						const departments = categoriesRes.result.data
							.filter(
								(item) =>
								item.categoriesType === '66cac8209d9f915ad26f4ad1'
							)
							.sort((a, b) => a.sort - b.sort)
							.map((item) => ({
								title: item.title,
								icon: item.icon.url, // 使用默认图标路径
								id: item._id,
								items: [], // 假设未来要添加内容

							}));

						this.categories = societies;
						this.filteredDepartments = departments;
						console.log('分类数据:', this.categories); // 调试输出社团数据
						console.log('部门数据:', this.filteredDepartments); // 调试输出部门数据


					}
				} catch (error) {
					console.error('获取分类数据时出错:', error);
				}
			},





			// 切换选项卡的方法
			switchTab(tabIndex) {
				this.currentTab = tabIndex; // 更新 currentTab
				console.log("Current Tab Index: ", this.currentTab);

				this.initializeContent(); // 切换Tab后默认加载内容
			},

			// 选择侧边栏项目的方法
			selectCategory(index, isDepartment = false) {
				this.selectedItem = index; // 更新选中的索引

				if (isDepartment) {
					const selectedId = this.filteredDepartments[index].id;
					this.currentDepartmentContent = this.classifyInfoData.filter(item => item.elementType === selectedId);
					console.log("Selected Department Index: ", this.selectedItem, " Department Content: ", this
						.currentDepartmentContent);
				} else {
					const selectedId = this.categories[index].id;
					this.currentContent = this.classifyInfoData.filter(item => item.elementType === selectedId);
					console.log("Selected Icon Index: ", this.selectedItem, " Icon Content: ", this.currentContent);
				}
			},






		}
	};
</script>

<style scoped lang="less">
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;

		.tabbar {
			display: flex;
			height: 50px;
			background-color: #fff;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			position: sticky;
			top: 0;
			z-index: 1000;

			.tabbar-item {
				flex: 1;
				text-align: center;
				line-height: 50px;
				font-size: 16px;
				cursor: pointer;
			}

			.tabbar-item.active {
				background-color: #ff6a6c;
				color: #fff;
			}
		}

		.content {
			flex: 1;
			padding-left: 15px;
			padding-right: 15px;
			background-color: #f5f5f5;
			overflow-y: auto;
			padding-bottom: 100px;
		}

		.icon-bar {
			display: flex;
			justify-content: space-around;
			padding: 10px 0;
			background-color: #fff;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

		}

		.icon-item {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.icon-img {
			width: 50px;
			height: 50px;
			object-fit: cover;
			/* 确保图像按比例缩放并填充框 */
		}

		.icon-title {
			margin-top: 5px;
			font-size: 14px;
			color: #666;
		}

		.icon-title.active {
			color: #ff6a6c;
		}

		.sidebar-container {
			display: flex;
			height: 100%;

			// test
			position: relative;
		}


		.sidebar {
			width: 150px;
			background-color: #f9f9f9;
			border-right: 1px solid #ddd;

			position: fixed;
			top: 0;
			/* 修改顶部对齐 */

			left: 0;
			height: 100vh;
			overflow-y: auto;
		}

		.sidebar-item {
			display: flex;
			align-items: center;
			padding: 10px;
			cursor: pointer;
		}

		.sidebar-item.active {
			background-color: #e5e5e5;
		}

		.sidebar-icon {
			width: 24px;
			height: 24px;
			margin-right: 10px;
		}

		.sidebar-title {
			font-size: 14px;
			color: #333;
		}

		.sidebar-content {
			flex: 1;
			padding-top: 0;
			/* 确保与顶部对齐 */

			// padding: 20px;
			background-color: #fff;
			margin-left: 130px;
			overflow-y: auto;
		}

		/* 社团内容的样式 */
		/* 社团内容的样式 */
		.content-display {
			display: flex;
			flex-wrap: wrap;
			/* 允许内容换行，以支持多列布局 */
			gap: 20px;
			/* 调整项之间的间距 */
			// padding: 10px;
			border-radius: 10px;
			justify-content: space-between;
			/* 在父容器内均匀分布卡片 */
			margin-top: 5%;
		}

		.content-item {
			display: flex;
			flex-direction: column;
			background-color: #ffffff;
			// padding: 15px;
			border-radius: 10px;
			box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
			align-items: center;
			/* 居中对齐内容 */
			width: calc(50% - 10px);
			/* 每个卡片占据50%的宽度，减去间距的一半 */
			box-sizing: border-box;
			/* 包括内边距和边框在内的宽度计算 */

			.content-display-img {
				width: 100%;
				/* 图片宽度为父容器的100% */


				height: 170px;
				/* 自动调整高度 */

				margin-bottom: 15px;
				/* 图片与文本之间的间距 */
				border-radius: 10px;
				/* 圆角设置为10px */
				object-fit: cover;
				/* 图片保持比例，填充容器 */
			}

			.content-display-title {
				color: #333;
				font-size: 18px;
				font-weight: 600;
				/* 文本大小设置为14px */
				line-height: 1.5;
				text-align: center;
				/* 文本居中对齐 */
				margin-bottom: 5px;
			}


			// .content-display-label {
			// 	color: #333;
			// 	border: 1px solid #a3a3a3;
			// 	border-radius: 5px;

			// 	font-size: 12px;
			// 	/* 文本大小设置为14px */
			// 	line-height: 1.5;
			// 	text-align: center;
			// 	/* 文本居中对齐 */
			// 	margin-bottom: 5px;
			// }

			/* 标签容器的样式，确保标签水平排列 */
			.content-display-label-container {
				display: flex;
				flex-wrap: wrap;
				/* 如果标签过多会自动换行 */
				justify-content: center;
				/* 居中对齐标签 */
				gap: 8px;
				/* 标签之间的间距 */
				// margin-top: 10px;
				/* 标签与标题之间的间距 */
			}

			/* 每个标签的样式 */
			.content-display-label {
				color: #333;
				border: 1px solid #a3a3a3;
				border-radius: 5px;
				padding: 0px 8px;
				margin-bottom: 4px;
				/* 增加内边距，使标签看起来更美观 */
				font-size: 12px;
				line-height: 1.5;
				text-align: center;
				background-color: #f9f9f9;
				/* 添加背景色使标签更突出 */
			}


		}




		/* 部门的样式 */
		.sidebar-content {
			display: flex;
			flex-direction: column;
			gap: 10px;
			background-color: #f5f5f5;
			padding: 10px;

			border-radius: 10px;
			box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		}

		.sidebar-content-item {
			display: flex;
			flex-direction: column;
			/* 先按列布局 */
			background-color: #ffffff;
			// padding: 15px;

			border-radius: 8px;
			box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
			width: 100%;
		}

		.sidebar-content-img {
			width: 60px;
			height: 60px;
			margin-bottom: 5px;
			border-radius: 4px;
			object-fit: contain;
			box-shadow: none;
			border: 1px solid #ddd;
		}

		.sidebar-content-title {
			color: #333;
			font-size: 16px;
			font-weight: 600;
			line-height: 1.5;
			margin-left: 70px;
			/* 给标题留出图片宽度的空间 */
			margin-top: -42px;
			/* 使标题与图片在一行 */
		}

		// .sidebar-content-label {
		// 	color: #a7b1c6;
		// 	font-size: 14px;
		// 	line-height: 1.5;
		// 	margin-top: 20px;
		// 	border: 1px solid #a3a3a3;
		// 	/* 标签与标题之间的距离 */
		// }

		/* 标签容器的样式，确保标签水平排列 */

		.sidebar-content-label-container {
			display: flex;
			flex-wrap: wrap;
			/* 如果标签过多会自动换行 */
			justify-content: center;
			/* 居中对齐标签 */
			gap: 8px;
			/* 标签之间的间距 */
			margin-top: 18px;
			/* 标签与标题之间的间距 */
		}

		/* 每个标签的样式 */

		.sidebar-content-label {
			color: #333;
			border: 1px solid #a3a3a3;
			border-radius: 5px;
			padding: 2px 8px;
			/* 增加内边距，使标签看起来更美观 */
			font-size: 12px;
			line-height: 1.5;
			text-align: center;
			background-color: #f9f9f9;
			/* 添加背景色使标签更突出 */
		}






	}
</style>