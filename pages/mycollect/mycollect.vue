<!-- 我的收藏 -->
<template>
	<view class="mycollect-content">
		<view v-if="articleid.length>0" class="mycollect-content-list">
			<!-- <text v-for="item in article_content">{{item}}</text> -->
			<view class="consult-item" v-for="(item,index) in article_content" :key="index" @click="JumpDetails(item)">
				<image :src="item.cover.path" mode="aspectFill" class="item-bg"></image>
				<text>{{item.title}}</text>
				<!-- <text>{{item.description}}</text> -->
				<rich-text style="font-size: 25rpx; color: #989898; margin-left: 20rpx;" :nodes="item.description"></rich-text>
				<view :class="item.label==''?'':'item-tab'">
					<text v-for="(x,y) in item.label.split(',')" :key="y">{{x}}</text>
				</view>

			</view>
		</view>
		
		<view v-else style="padding: 50rpx;">你的收藏夹和月球一样空旷，快给它添点“星星”吧！ </view>

	</view>

</template>

<script>
	import {
		markRaw
	} from 'vue';
	export default {
		data() {
			return {
				articleid: [], //存储收藏文章的id
				article_content: [] //存储文章的内容
			};
		},

		onShow() {
			this.articleid = [];
			this.article_content = [];
			this.getMyCollect();
		},
		methods: {

			// 获取我的收藏
			async getMyCollect() {
				const db = uniCloud.databaseForJQL();

				try {
					// 获取到文章id
					const collectdata = await db.collection('favorite').where({
						user_id: db.getCloudEnv('$cloudEnv_uid')
					}).get();

					if (collectdata.data && collectdata.data.length > 0) {
						collectdata.data.map(x => {
							this.articleid.push(x.article_id);
						});
					}
					console.log('文章id---', this.articleid);

					// 通过文章id获取具体内容
					this.articleid.map(async (x) => {
						const articleCotent = await db.collection('classify-Info').doc(x).get();
						this.article_content.push(articleCotent.data[0]);
					});

				} catch (error) {
					console.log('获取信息错误, error', error);
				}
			},
			
			// 跳转详情
			JumpDetails(e) {
				let data = encodeURIComponent(JSON.stringify(e));
				uni.navigateTo({
					url: `/pages/clubdetails/clubdetails?data=${data}`
				})
			},
			
		}
	}
</script>

<style lang="less">
	.mycollect-content {
		background-color: #f5f5f5;
		min-height: 100vh;

		.mycollect-content-list {
			padding: 15rpx;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 25rpx;

			.consult-item {
				display: flex;
				flex-direction: column;
				background-color: #fff;
				border-radius: 15rpx;
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
					height: 300rpx;
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
			}
		}

	}
</style>