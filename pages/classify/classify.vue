<template>


	<view class="" style="overflow: hidden;">
		<view :style="{marginTop:getStatusBarHeight()+'px'}">
			<wd-navbar custom-class="h-[40px] " left-text="返回" @click-left="handleClickLeft" left-arrow>
				<template #title>
					<view class="flex items-center h-full px-0 py-0">
						<wd-search custom-class="w-[300rpx]" v-model="keyword" hide-cancel placeholder-left></wd-search>
						<button
							style="background-color: #eca922; font-size: 28rpx;color: #fff; height: 60rpx; line-height: 60rpx; margin-left: 0;"
							@click="search">搜索</button>
					</view>
				</template>
			</wd-navbar>
		</view>

		<wd-tabs swipeable animated v-model="tabStatus">
			<!-- tab标题，排序筛选 -->
			<block v-for="(item,index) in Tablist" :key="index">
				<wd-tab :title="item.tabtitle">
					<view :style="filterTab?{display:'block'}:{display:'none'}">
						<wd-drop-menu direction="down" v-model="value">
							<wd-drop-menu-item v-model="screenValue" :options="option" @change="handleChange" />
							<wd-drop-menu-item title="筛选" ref="dropMenu">
								<view>
									<wd-checkbox-group v-model="checkboxValue" @change="CheckboxChange">
										<view style="display: inline; " v-for=" x in item.screenlist" class="" :key="y">
											<wd-checkbox custom-class="mr-0" :modelValue="x.value" shape="button"
												inline>{{x.label}}</wd-checkbox>
										</view>
									</wd-checkbox-group>
									<wd-button custom-class="mt-[25rpx] mr-[20rpx] mb-[20rpx] float-right" suck
										@click="confirm">确认</wd-button>
								</view>
							</wd-drop-menu-item>
						</wd-drop-menu>
					</view>

					<view v-if="status==0" class="content">
						<view v-if="tabStatus == 0" class="consult-content">
							<view class="consult-item" v-for="(item,index) in campubol ? campusscreened : campusconsult"
								:key="index" @click="JumpDetails(item)">
								<image :src="item.cover.path" mode="aspectFill" class="item-bg"></image>
								<text>{{item.title}}</text>
								<!-- <text>{{item.description}}</text> -->
								<rich-text style="margin-left: 20rpx; font-size: 25rpx; color: #909090;"
									:nodes="item.description"></rich-text>
								<view :class="item.label==''?'':'item-tab'">
									<text v-for="(x,y) in item.label.split(',')" :key="y">{{x}}</text>
								</view>
								<!-- 					<view class="author-data">
									<image src="../../static/userhead.png"></image>
									<text>作者</text>
								</view> -->
							</view>
						</view>

						<view v-else class="content-box">
							<view v-for="(item,index) in recuitbol ? recruitsreened : recruitdata" :key="index"
								class="job-item" @click="JumpDetails(item)">
								<view class="job-header">
									<image :src="item.cover.url" mode="aspectFill" class="job-image"></image>
									<text class="job-title">{{ item.title }}</text>
								</view>
								<view class="job-details">
									<view class="job-company">
										<!-- <text>{{ item.description }}</text> -->
										<rich-text :nodes="item.description"></rich-text>
									</view>
									<text class="job-salary">100-200/天</text>
								</view>

								<view class="job-tags">
									<text class="job-label" v-for="(label, idx) in item.label.split(',')"
										:key="idx">{{ label }}</text>
								</view>

							</view>
						</view>

					</view>


					<!-- 					<view class="" v-if="status==1">
						<view v-if="tabStatus==0" class="campus-content">
							<view class="campusitem" v-for="(item,index) in searchdata" :key="index"
								v-show="item.categoriesType=='66c1f2c607a97091a9dbf937'">{{item.title}}
							</view>
						</view>
						<view v-else="tabStatus==1" class="campus-content">
							<view class="campusitem" v-for="(item,index) in searchdata" :key="index"
								v-show="item.categoriesType=='66c1f2bb9d9f915ad22bd110'">{{item.title}}</view>
						</view>
					</view> -->
					<!-- 状态1 搜索后内容 -->
					<view class="content" v-if="status==1">
						<view v-if="tabStatus == 0" class="consult-content">
							<view class="consult-item" v-for="(item,index) in searchdata" :key="index"
								@click="JumpDetails(item)">
								<image :src="item.cover.path" mode="aspectFill" class="item-bg"></image>
								<text>{{item.categoriesType=='66c1f2c607a97091a9dbf937'}}</text>
								<text>{{item.title}}</text>
								<!-- <text>{{item.description}}</text> -->
								<rich-text style="margin-left: 20rpx; font-size: 25rpx; color: #909090;"
									:nodes="item.description"></rich-text>
								<view :class="item.label==''?'':'item-tab'">
									<text v-for="(x,y) in item.label.split(',')" :key="y">{{x}}</text>
								</view>
								<!-- 					<view class="author-data">
									<image src="../../static/userhead.png"></image>
									<text>作者</text>
								</view> -->
							</view>
						</view>

						<view v-else class="content-box">
							<view v-for="(item,index) in searchdata2" :key="index" class="job-item"
								@click="JumpDetails(item)">
								<view class="job-header">
									<image :src="item.cover.url" mode="aspectFill" class="job-image"></image>
									<text class="job-title">{{ item.title }}</text>
									<text>{{item.categoriesType=='66c1f2bb9d9f915ad22bd110'}}</text>
								</view>
								<view class="job-details">
									<view class="job-company">
										<!-- <text>{{ item.description }}</text> -->
										<rich-text :nodes="item.description"></rich-text>
									</view>
									<text class="job-salary">100-200/天</text>
								</view>

								<view class="job-tags">
									<text class="job-label" v-for="(label, idx) in item.label.split(',')"
										:key="idx">{{ label }}</text>
								</view>

							</view>
						</view>
					</view>


					<!-- 状态2 加载错误或没有搜索到内容 -->
					<view class="" v-if="status==2">
						<view>暂无相关数据</view>
					</view>



				</wd-tab>
			</block>




		</wd-tabs>

	</view>


</template>


<script setup lang="ts">
	import { onShow, onHide } from '@dcloudio/uni-app';
	import { ref } from 'vue';


	const dropMenu = ref();
	// const slider = ref<SliderInstance>(); // slider 1.2.25支持
	const screenValue = ref<number>(0);
	const value = ref<number>(0);
	const keyword = ref('');
	const tab = ref<number>(0);
	const SYSTEM_INFO = uni.getSystemInfoSync()
	const getStatusBarHeight = () => SYSTEM_INFO.statusBarHeight || 15;
	const option = ref<Record<string, any>>([
		{ label: '默认排序', value: 0 },
		{ label: '最新发布', value: 1 },
		{ label: '最多收藏', value: 2 }
	])
	const checkboxValue = ref([]);//选中的筛选条件
	const Tablist = ref([
		{
			tabtitle: '校园咨询',
			screenlist: [
				{ label: '入党', value: 0 },
				{ label: '奖学金', value: 1 },
				{ label: '助学金', value: 2 },
				{ label: '校园介绍', value: 3 },
				{ label: '专升本', value: 4 },
			]

		},
		{
			tabtitle: '招聘信息',
			screenlist: [
				{ label: '校内兼职', value: 5 },
				{ label: '校外兼职', value: 6 },
				{ label: '暑假工', value: 7 },
				{ label: '实习工作', value: 8 },
			]
		}
	]);
	const status = ref(0);//页面状态
	const tabStatus = ref(0);//tab状态
	const campusconsult = ref([]);//校园资讯
	const recruitdata = ref([]);//招聘信息
	const campusscreened = ref([]);//筛选后的校园资讯
	const recruitsreened = ref([]);//筛选后的招聘信息
	const campusCasual = ref([]);//筛选后的校园资讯临时数组
	const recruitCasual = ref([]);//筛选后的招聘信息临时数组
	const screenCondition1 = ref([]);//校园筛选条件 
	const screenCondition2 = ref([]);//招聘筛选条件
	const searchdata = ref([]);//查询到的校园咨询内容
	const searchdata2 = ref([]);//查询到的招聘信息内容
	const campubol = ref(false);//用来判断是否展示筛选后的校园咨询
	const campubol2 = ref(false);//用来判断是否使用了校园资讯筛选
	const recuitbol = ref(false);//用来判断是否展示筛选后的招聘信息
	const recuitbol2 = ref(false);//用来判断是否使用了招聘信息筛选
	const filterTab = ref(true);//用来判断是否展示或隐藏筛选排序导航条



	onShow(() => {
		// 获取当前页面的参数
		const pages = getCurrentPages(); // 获取页面栈
		const currentPage = pages[pages.length - 1]; // 获取当前页面对象
		const options = currentPage.options; // 获取页面跳转的参数

		// 打印所有 options 以查看传入的参数
		console.log('options:', options);

		// 初始化一个数组来保存传入的 _id 参数
		const idList = [];

		// 遍历 options，收集所有以 _id 开头的参数
		for (const key in options) {
			if (key.startsWith('_id')) {
				idList.push(options[key]); // 将所有 _id 参数加入数组
			}
		}

		// 打印解析后的 _id 列表
		console.log('解析后的 _id 列表:', idList);

		// 如果有传入的 _id 参数
		if (idList.length > 0) {
			// 判断 id 是否在 tabStatusZeroIds 中
			const tabStatusZeroIds = [
				'66a9f3fd6eac714e79967fb8',
				'66a9f4640c04326bf4f02ab6',
				'66a9f4a07f3a1ea14b24bb11',
				'66a9f4e07f3a1ea14b24bb74',
			];

			// 遍历 idList，根据每个 _id 调用查询函数并显示内容
			idList.forEach(id => {
				console.log('当前 _id:', id); // 打印当前处理的 _id
				if (tabStatusZeroIds.includes(id)) {
					getListbySelectId(id, true); // 如果 id 在 tabStatusZeroIds 列表中，则传递 true
				} else {
					getListbySelectId(id, false); // 否则传递 false
				}
			});

			filterTab.value = false;
		} else {
			// 如果没有传入 _id 参数，调用 getAllData() 显示所有数据
			getAllData();
		}
	});



	// 隐藏页面时，把一些变量初始化
	onHide(() => {
		status.value = 0;
		tabStatus.value = 0;
		campusconsult.value = [];
		recruitdata.value = [];


		screenCondition1.value = [];
		screenCondition2.value = [];
		campusscreened.value = [];
		recruitsreened.value = [];
		searchdata.value = [];
		searchdata2.value = [];
		screenValue.value = 0;
		checkboxValue.value = [];
		campubol.value = false;
		campubol2.value = false;
		recuitbol.value = false;
		recuitbol2.value = false;
		campusCasual.value = [];//筛选后的校园资讯临时数组
		recruitCasual.value = [];//筛选后的招聘信息临
		filterTab.value = true;

	});

	// 通过首页选择id获取数据
	async function getListbySelectId(id, bool) {
		const db = uniCloud.databaseForJQL();
		try {
			// 根据传入的 id 进行查询，查询条件为 _id
			const data = await db.collection('classify-Info').where({
				_id: id // 使用 _id 作为查询条件
			}).get();

			// 检查查询结果
			if (data.errCode == 0) {
				if (bool) {
					// 如果是部门的内容
					recruitdata.value = data.data;
					console.log('recruitdata----', recruitdata.value);
					tabStatus.value = 1;
				} else {
					// 如果是其他分类的内容
					campusconsult.value = data.data;
					console.log('campusconsult---', campusconsult.value);
					tabStatus.value = 0;
				}
			} else {
				console.error('数据查询失败: ', data.errMsg);
			}
		} catch (err) {
			console.error('查询错误: ', err);
		}
	}




	// 直接获取所有数据
	async function getAllData() {
		const db = uniCloud.databaseForJQL();
		try {
			const classifydata = await db.collection('classify-Info').get();
			console.log('数据', classifydata);
			if (classifydata.data) {
				let arr = classifydata.data;
				console.log('arrr----', arr);
				campusconsult.value = arr.filter(item => item.categoriesType == "66c1f2c607a97091a9dbf937");
				console.log('campusconsult.value0000', campusconsult.value);
				recruitdata.value = arr.filter(item => item.categoriesType == "66c1f2bb9d9f915ad22bd110");
			}
		} catch (err) {
			console.log('获取分类数据失败---', err);
		}
	}

	// 获取分类数据并使用 searchVal 进行查询
	async function search() {
		filterTab.value = false;
		if (keyword.value != '') {
			const db = uniCloud.databaseForJQL();
			try {
				const regex = new RegExp(keyword.value, 'i');
				const searchRes = await db.collection('classify-Info').where(
					`${regex}.test(title) || ${regex}.test(description) || ${regex}.test(body) || ${regex}.test(label)`
				).get();

				console.log('查询结果:', searchRes);

				if (searchRes.data && searchRes.data.length > 0) {
					console.log('sear----', searchRes.data);
					let arr = searchRes.data;
					searchdata.value = arr.filter(x => x.categoriesType == '66c1f2c607a97091a9dbf937');
					searchdata2.value = arr.filter(x => x.categoriesType == '66c1f2bb9d9f915ad22bd110');
					arr.map(x => {
						if (x.categoriesType == '66c1f2c607a97091a9dbf937') {
							tabStatus.value = 0;
						} else if (x.categoriesType == '66c1f2bb9d9f915ad22bd110') {
							tabStatus.value = 1;
						} else {
							tabStatus.value = 0;
						}
					});

					console.log('查询后的数据:', searchdata.value, searchdata2.value);
					// 设置 status 为 0
					status.value = 1;


				} else {
					// 如果没有找到数据，设置 status 为 2
					status.value = 2;
				}
			} catch (error) {
				console.error('查询数据失败:', error);
				status.value = 2; // 即使在捕获错误时，也应该设置 status 为 2
			}
		} else {
			uni.showToast({
				title: '请输入内容进行搜索哦',
				icon: 'none'
			})
		}

	};



	// 排序
	function handleChange({ value }) {
		// console.log(value)

		switch (value) {

			// 默认排序
			case 0:
				if (status.value == 0) {
					if (tabStatus.value == 0) {
						if (!campubol2.value) {
							campusscreened.value = campusconsult.value;
						} else {
							campusscreened.value = campusCasual.value;
							console.log('校区临时变量----', campusscreened.value, campusCasual.value);
						}
						campubol.value = true
					} else {
						if (!recuitbol2.value) {
							recruitsreened.value = recruitdata.value;
						} else {
							recruitsreened.value = recruitCasual.value;
						}
						recuitbol.value = true
					}


				} else if (status.value == 1) {

				}
				break;

			// 按最新时间排序
			case 1:
				if (status.value == 0) {
					if (tabStatus.value == 0) {
						if (!campubol2.value) {
							campusscreened.value = [...campusconsult.value];
						}
						campusscreened.value.sort((a, b) => b.create_date - a.create_date);
						campubol.value = true
					} else {
						if (!recuitbol2.value) {
							recruitsreened.value = [...recruitdata.value];
						}
						recruitsreened.value.sort((a, b) => b.create_date - a.create_date);
						recuitbol.value = true
					}
				} else if (status.value == 1) {

				}
				break;

			// 按收藏数量排序
			case 2:
				// console.log('待开发');
				if (status.value == 0) {
					if (tabStatus.value == 0) {
						if (!campubol2.value) {
							campusscreened.value = [...campusconsult.value];
						}
						campusscreened.value.sort((a, b) => b.star - a.star);
						campubol.value = true
					} else {
						if (!recuitbol2.value) {
							recruitsreened.value = [...recruitdata.value];
						}
						recruitsreened.value.sort((a, b) => b.star - a.star);
						recuitbol.value = true
					}
				} else if (status.value == 1) {

				}
				break;
		}
	}


	// 勾选筛选条件时复选框变化时执行
	function CheckboxChange({ value }) {
		// console.log('value000', value);

		if (tabStatus.value == 0) {
			if (value.length > 0) {
				campubol2.value = true;
			} else {
				campubol2.value = false;
			}
			let arr = []
			value.map(x => {
				if (x == 0) {
					arr.push('入党');
				} else if (x == 1) {
					arr.push('奖学金');
				} else if (x == 2) {
					arr.push('助学金');
				} else if (x == 3) {
					arr.push('校园介绍');
				} else if (x == 4) {
					arr.push('专升本');
				}
			})
			screenCondition1.value = arr;
			console.log('screenCondition1---', screenCondition1.value);
		} else {
			if (value.length > 0) {
				recuitbol2.value = true;
			} else {
				recuitbol2.value = false;
			}
			let arr = []
			value.map(x => {
				if (x == 5) {
					arr.push('校内兼职');
				} else if (x == 6) {
					arr.push('校外兼职');
				} else if (x == 7) {
					arr.push('暑假工');
				} else if (x == 8) {
					arr.push('实习工作');
				}
			})
			screenCondition2.value = arr;
			console.log('screenCondition2---', screenCondition2.value);
		}

	}


	//筛序确认后执行
	async function confirm() {
		if (tabStatus.value == 0) {
			getDatabyScreen(screenCondition1, campusscreened, campubol, campusCasual);//传相关参数获取筛选结果
			dropMenu.value[0].close();//关闭下拉菜单
		} else {
			getDatabyScreen(screenCondition2, recruitsreened, recuitbol, recruitCasual);//传相关参数获取筛选结果
			dropMenu.value[1].close();//关闭下拉菜单
		}


	}

	// 获取筛选结果
	async function getDatabyScreen(screenarr, chosearr, bolname, Casualarr) {
		const db = uniCloud.databaseForJQL();
		const dbCmd = db.command;
		let arr = []
		screenarr.value.map(x => {
			arr.push(x);
		});
		try {
			const data = await db.collection('classify-Info').where({
				title: dbCmd.in(arr)
			}).get();
			// console.log('dat----',data);
			if (data.data && data.data.length > 0) {
				chosearr.value = data.data;
				Casualarr.value = [...data.data];
				bolname.value = true;
			}
		} catch (err) {
			console.log('数据查询错误---', err);
		}
	}

	// 返回上一页
	function handleClickLeft() {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}

	// 跳转详情
	function JumpDetails(e) {
		let data = encodeURIComponent(JSON.stringify(e));
		if (tabStatus.value == 0) {
			uni.navigateTo({
				url: `/pages/tweetdetails/tweetdetails?data=${data}`
			})
		} else {
			uni.navigateTo({
				url: `/pages/clubdetails/clubdetails?data=${data}`
			})
		}
	};
</script>



<style lang="less" scoped>
	.campus-content {
		padding: 20rpx;
		display: flex;

		.campusitem {
			width: 300rpx;
			padding: 15rpx;
			background-color: #fff;
			box-shadow: #bdbdbd 1rpx 1rpx 20rpx;
			border-radius: 15rpx;
			text-align: center;
		}

	}

	.container {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #fff;
		padding: 4px;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 10px;
	}

	.search-bar input {
		flex: 1;
		border: none;
		padding: 4px;
		border-radius: 8px;
		font-size: 16px;
		outline: none;
	}

	.search-bar button {
		background-color: #ff6a6c;
		color: #fff;
		border: none;
		padding: 2px 8px;
		border-radius: 8px;
		margin-left: 8px;
		cursor: pointer;
		font-size: 16px;
	}

	.search-bar button:hover {
		background-color: #ff4a4a;
	}

	.tabs {
		display: flex;
		background-color: #fff;
		padding: 10px 0;
		white-space: nowrap;
		margin-bottom: 10px;
	}

	.tab {
		padding: 10px 20px;
		cursor: pointer;
	}

	.tab.active {
		font-weight: bold;
		border-bottom: 2px solid #ff6a6c;
	}

	.content {
		padding: 15rpx;
		padding-bottom: 150rpx;
		height: 85vh;
		overflow: auto;
		display: flex;
		flex-direction: column;
		background-color: #eee;
	}

	.consult-content {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 25rpx;
	}

	.consult-content .consult-item {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border-radius: 15rpx;
		box-shadow: 1rpx 1rpx 10rpx #dddddd;
		overflow: hidden;

		&:nth-child(odd) {
			grid-row: span 10;
		}

		&:nth-child(even) {
			grid-row: span 11;
		}

		text {
			margin-left: 20rpx;

			&:nth-of-type(1) {
				margin-top: 15rpx;
				font-size: 28rpx;
				font-weight: 700;
			}

			&:nth-of-type(2) {
				margin-top: 5rpx;
				font-size: 25rpx;
			}
		}

		.item-bg {
			width: 100%;
			height: 400rpx;
		}

		.item-tab {
			margin-top: 10rpx;
			margin-bottom: 15rpx;

			text {
				font-size: 20rpx;
				border: 1rpx solid #a3a3a3;
				border-radius: 10rpx;
				padding: 4rpx 10rpx;
				color: #909090;
			}
		}

		.author-data {
			height: 50rpx;
			margin-top: 20rpx;
			margin-bottom: 20rpx;
			margin-left: 20rpx;
			display: flex;
			align-items: center;

			image {
				width: 50rpx;
				height: 50rpx;
			}

			text {
				margin: 0 0 0 30rpx;
				font-size: 25rpx;
				line-height: 50rpx;
			}
		}
	}




	.content-box {
		padding: 15rpx;
		display: flex;
		flex-direction: column;
		gap: 15px;
		background-color: #eee;
	}

	.job-item {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.job-header {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.job-image {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 15px;
	}

	.job-title {
		font-size: 20px;
		font-weight: bold;
		flex: 1;
		/* 让标题占据剩余空间 */
	}

	.job-details {
		display: flex;
		justify-content: space-between;
		/* 让描述和薪资两边对齐 */
		align-items: center;
		margin-bottom: 10px;
	}

	.job-company {
		font-size: 14px;
		color: #888;
		flex: 1;
		/* 让描述占据剩余空间 */
	}

	.job-salary {
		color: #007BFF;
		font-size: 16px;
		text-align: right;
		/* 让薪资靠右对齐 */
	}

	.job-tags {
		display: flex;
		gap: 10px;
		margin-bottom: 10px;
	}

	.job-label {
		padding: 2px 8px;
		background-color: #F5F5F5;
		border-radius: 12px;
		font-size: 14px;
		color: #555;
	}
</style>