<!-- 校区分类 -->
<template>
	<view style="display: flex; min-height: 100vh; flex-direction: column;">
		<uni-nav-bar style="align-items: center;" :fixed="true" class="nav-search" left-icon="left" title="自定义导航栏"
			status-bar :border="false" @clickLeft="BackTapPage">
			<input type="text" v-model="campus_Name" placeholder="请输入校区进行搜索" />
			<button @click="searchCampus">搜索</button>
		</uni-nav-bar>

		<!-- 默认可选校区内容 -->
		<view v-show="schoolbol" class="campus-content">
			<view class="left-content">
				<view :class=" ['title-itme',{'title-itmebg':itembgindex===index}]" v-for="(item,index) in campusTitle"
					:key="index" @click="chooseAddress(item,index)">
					<view :class="{itembg:itembgindex===index}"></view>
					<text :class="{itemtext:itembgindex===index}">{{item}}</text>
				</view>
			</view>

			<view class="right-content">

				<view v-if="schoolCampusData.length>0" class="school-box" v-for="(item,index) in schoolCampusData"
					:key="index" @click="chooseCampus(item)">
					<image :src="item.school_badge.path"></image>
					<view class="school-data">
						<view>{{item.school_name}}</view>
						<view>{{item.school_badge.size}}人加入</view>
					</view>
				</view>
				<view v-else>暂无相关数据，敬请期待！</view>

			</view>

		</view>

		<!-- 搜索后的校区内容 -->
		<view v-show="!schoolbol" class="search-content">
			<view v-if="searchCampusData.length>0" class="search-box" v-for="(item,index) in searchCampusData"
				:key="index" @click="chooseCampus(item)">
				<image :src="item.school_badge.path"></image>
				<view class="school-data">
					<view>{{item.school_name}}</view>
					<view>{{item.school_badge.size}}人加入</view>
				</view>
			</view>
			<view v-else="searchCampusData.length<=0">暂未搜寻到相关数据</view>
		</view>

	</view>

</template>

<script>
	export default {
		data() {
			return {
				campusTitle: ['广东'],
				schoolCampusData: [], //默认校区内容
				searchCampusData: [], //搜索后的校区
				itembgindex: 0,
				campus_Name: '', //搜索的校区名
				schoolbol: true, //用来判断显示默认还是搜索后的校区
			}
		},
		methods: {

			// 选择地方
			chooseAddress(item, index) {
				this.itembgindex = index;
				console.log(item);
				this.getSchoolData(item);

			},
			async getSchoolData(addres) {
				const db = uniCloud.databaseForJQL();
				try {
					const data = await db.collection('site').where({
						region: addres
					}).get();

					if (data.errCode === 0) {
						this.schoolCampusData = data.data;
					} else {
						console.log('查询错误,错误信息', data.errMsg);
					}
				} catch (error) {
					console.log('查询错误', error);
				}



			},

			// 选择校区
			chooseCampus(e) {
				console.log('校区---', e);

				uni.setStorage({
					key: 'selectedCampused',
					data: e
				});

				// 跳转首页
				uni.switchTab({
					url: '/pages/index/index'
				});
			},

			// 搜索校区
			async searchCampus() {
				let campusName = this.campus_Name; //用户输入内容
				let escapedCampus = campusName.split('').join('.*'); //加工，将输入的每个字符用 ".*" 分隔，用于模糊匹配
				const db = uniCloud.databaseForJQL();
				try {
					const data = await db.collection('site').where(`${new RegExp(escapedCampus)}.test(school_name)`)
						.get();
					console.log('查询结果----', data);

					if (data.errCode === 0) {
						this.searchCampusData = data.data;
						this.schoolbol = false;
					} else {
						console.log('未查询到相关数据', data.errMsg);
					}
				} catch (error) {
					console.log('查询错误', error);
				}
			},
			
			// 返回上一级
			BackTapPage(){
				if(!this.schoolbol){
					this.schoolbol = true;
					this.campus_Name = '';
				}else{
					uni.switchTab({
						url:'/pages/index/index'
					});
				}
			}

		},
		onLoad() {
			this.getSchoolData('广东');
		}
	}
</script>



<style lang="less">
	// 顶部导航样式
	.nav-search {

		input {
			background-color: #f4f4f4;
			width: 65%;
			height: 60rpx;
			line-height: 60rpx;
			font-size: 25rpx;
			border-radius: 15rpx;
			padding-left: 15rpx;

		}

		button {
			margin-left: 15rpx;
			height: 60rpx;
			font-size: 25rpx;
			line-height: 60rpx;
			background-color: #ffbc2f;
			color: #f9f9f9;
			border-radius: 15rpx;
		}
	}


	// 默认校区样式
	.campus-content {
		flex: 1;
		display: flex;

		.left-content {
			flex: 2;
			background-color: #f5f5f9;

			.title-itme {
				display: flex;
				height: 100rpx;

				text {
					flex: 1;
					text-align: center;
					line-height: 100rpx;
				}
			}

			.title-itmebg {
				background-color: #fafafa;
			}
		}

		.right-content {
			padding: 15rpx 25rpx;
			flex: 6;
			background-color: #fafafa;

			.school-box {
				margin-bottom: 20rpx;
				display: flex;
				align-items: center;
				background-color: #fff;
				padding: 20rpx;
				border-radius: 20rpx;
				box-shadow: 1rpx 1rpx 20rpx #f9f9f9;

				image {
					width: 100rpx;
					height: 100rpx;
				}

				.school-data {
					margin-left: 20rpx;

					view:nth-child(2) {
						font-size: 24rpx;
						color: #b1b1b1;
					}
				}
			}
		}
	}

	.itembg {
		width: 10rpx;
		height: 100%;
		background-color: #ffbc2f;
	}

	.itemtext {
		color: #ffbc2f;
	}


	// 搜索后的校区样式
	.search-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		background-color: #f5f5f9;
		padding: 15rpx;


		.search-box {
			width: 90%;
			height: 125rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			padding: 0 20rpx;
			border-radius: 15rpx;

			image {
				width: 100rpx;
				height: 100rpx;
			}

			.school-data {
				margin-left: 50rpx;

				view:nth-child(2) {
					margin-top: 8rpx;
					font-size: 24rpx;
					color: #b1b1b1;
				}
			}
		}
	}
</style>