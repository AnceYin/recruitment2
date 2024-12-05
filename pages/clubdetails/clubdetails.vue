<template>
	<view class="clubdetails-content">
		<view class="content">
			<view class="swiper-and-icon">
				<swiper autoplay="true" interval="3000" duration="500" class="carousel-container">
					<swiper-item v-for="(image, index) in pngList" :key="index" class="carousel-item">
						<image :src="image.url" class="carousel-image" mode="widthFix"></image>
					</swiper-item>
				</swiper>
				<image class="club-icon" :src="logoicon"></image>
			</view>
			<view class="job-introduce">
				<rich-text :nodes="body"></rich-text>
			</view>
		</view>

		<view class="bottom-tab">
			<view class="collect-icon" @click="addordelCollect">
				<image :src="collecticon"></image>
				<view>{{collecttext}}</view>
			</view>
			<button @click="handInResume()">投简历</button>
			<button @click="chat()" :show-badge="unreadMsgCount>0" :badge-text="unreadMsgCount+''"
				:badge-style="{'background':'#f41500'}">聊一聊</button>
		</view>
	</view>
</template>

<!-- 			padding-bottom: 70px; /* 增加底部填充，确保内容不会被按钮栏遮挡 */ -->

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		data() {
			return {
				author: '', //作者id
				collecticon: '../../static/collect.png', //收藏icon
				collectbol: false, //用来判断该详情页否收藏，默认值为false
				detailsid: '', //该详情id
				collecttext: '收藏', //收藏文本
				pngList: [], // 初始化为空数组
				body: '',
			}
		},
		onLoad(options) {
			if (options.data) {
				let data = JSON.parse(decodeURIComponent(options.data));
				this.logoicon = data.cover.url;
				this.jobTitle = data.title;
				this.author = data.author;
				this.detailsid = data._id;
				this.template = data.template;

				// 解析 png_list 数组
				if (Array.isArray(data.png_list)) {
					this.pngList = data.png_list.map(item => {
						return {
							url: item.url // 获取图片的 URL
						};
					});
				}
				// 解析 body 数组
				if (Array.isArray(data.body)) {
					this.body = data.body.map(item => {
						return `<img src="${item.url}" style="max-width:100%;" contenteditable="false" />` // 获取图片的 URL
					}).join('\n');;
				}
				console.log("this.body ", this.body)
				this.getcollectBySql(data._id); //调用该方法查询该文章是否收藏
			}
		},

		async onReady() {
			if (!uniIm.isWidescreen) {
				uni.showLoading({
					mask: true
				});
				try {
					await uniIm.conversation.loadMore()
				} catch (e) {
					console.log(e)
				}
				uni.hideLoading()
			}
		},

		methods: {

			//未读系统通知数量
			toPath(path) {
				uni.navigateTo({
					url: path,
					fail: () => {
						uni.switchTab({
							url: path,
							fail: (e) => {
								console.error(e);
							}
						})
					}
				});
			},

			// 添加或取消收藏
			addordelCollect() {

				// 添加
				if (this.collectbol) {
					this.collecticon = '../../static/collect.png';
					this.collecttext = '收藏';
					this.collectbol = false;
					this.deleteCollect(this.detailsid);
					uni.showToast({
						title: '取消收藏',
						icon: 'none',
						duration: 1000
					});
				}
				// 取消
				else {
					this.collecticon = '../../static/collect_b.png';
					this.collecttext = '已收藏';
					this.collectbol = true;
					this.addCollect(this.detailsid);
					uni.showToast({
						title: '收藏成功',
						icon: 'none',
						duration: 1000
					});


				}


			},

			// 判断该文章是否收藏
			async getcollectBySql(detailsid) {
				try {
					const db = uniCloud.databaseForJQL();
					const collectdata = await db.collection('favorite').where({
						article_id: detailsid,
						user_id: db.getCloudEnv('$cloudEnv_uid')
					}).get();

					console.log('是否收藏====', collectdata);

					if (collectdata.data) {
						// 未查询到相关收藏数据
						if (collectdata.data.length === 0) {
							this.collecticon = '../../static/collect.png';
							this.collectbol = false;
							this.collecttext = "收藏";
							console.log('未收藏');
						}
						// 查询到相关数据
						else {
							this.collecticon = '../../static/collect_b.png';
							this.collectbol = true;
							this.collecttext = '已收藏';
							console.log('已收藏');
						}
					} else {
						console.log('获取收藏数据失败，errCode:', collectdata.errCode, 'errMsg:', collectdata.errMsg);
					}

				} catch (error) {
					console.error('获取收藏数据失败，错误信息:', error);
				}
			},


			// 收藏添加到数据库
			async addCollect(detailsid) {
				const db = uniCloud.databaseForJQL();
				try {
					const collectdata = await db.collection('favorite').add({
						article_id: detailsid
					});

					console.log('添加收藏coll====', collectdata);

				} catch (error) {
					console.error('添加数据失败，错误信息:', error);
				}
			},


			// 取消收藏，从数据库删除此条数据
			async deleteCollect(detailsid) {
				const db = uniCloud.databaseForJQL();
				try {
					const collectdata = await db.collection('favorite').where({
						article_id: detailsid
					}).remove();
					console.log('取消收藏coll====', collectdata);
				} catch (error) {
					console.error('删除数据失败，错误信息:', error);
				}
			},


			// 投简历
			handInResume() {

				// 判断 template 是否为空
				if (!this.template) {
					// 提示负责人尚未创建简历模板
					uni.showToast({
						title: '负责人尚未创建简历模板',
						icon: 'none',
						duration: 2000 // 提示持续时间，单位为毫秒
					});
				} else {
					if (!store.userInfo.mobile) {
						uni.showModal({
							content: "请在个人中心绑定手机号，您可以先收藏此文章，下次可在我的收藏快捷打开",
							showCancel: false,
							confirmText: '关闭',
						});
					}else{
						// 如果 template 不为空，则跳转到目标页面
						uni.navigateTo({
							url: `/pages/questionnaire-input/questionnaire-input?templateID=${this.template}`
						});
					}
				}
			},
			// 聊一聊
			chat() {
				// 判断 author 是否为空
				if (!this.author) {
					// 提示负责人尚未创建简历模板
					uni.showToast({
						title: '负责人尚未加入产学通',
						icon: 'none',
						duration: 2000 // 提示持续时间，单位为毫秒
					});
				} else {
					// 如果 author 不为空，则跳转到目标页面
					uni.navigateTo({
						url: `/uni_modules/uni-im/pages/chat/chat?user_id=${this.author}`
					});
				}
			},
		},

		computed: {
			unreadMsgCount() {
				return uniIm.conversation.unreadCount()
			},
			notificationUnreadCount() {
				return uniIm.notification.unreadCount()
			}
		},


	}
</script>

<style lang="less">
	.clubdetails-content {
		position: relative;
		min-height: 100vh;

		.content {
			padding-bottom: 100px;
			/* 增加底部填充，确保内容不会被按钮栏遮挡 */

		}

		.carousel-container {
			width: 100%;
			height: 400rpx;
			/* 根据需要调整高度 */
		}

		.carousel-item {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.carousel-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			/* 保持图片比例 */
		}

		.swiper-and-icon {
			position: relative;

			.club-icon {
				position: absolute;
				width: 100rpx;
				height: 100rpx;
				bottom: -30rpx;
				left: 60rpx;
				border-radius: 50%;
			}
		}




		.job-introduce {
			padding: 20rpx;
			margin-top: 30rpx;
		}


		.bottom-tab {
			position: fixed;
			left: 0;
			bottom: 0;
			display: flex;
			align-items: center;
			width: 100%;
			padding: 32rpx 0;
			background-color: #efefef;

			.collect-icon {
				display: flex;
				justify-content: center;
				align-items: center;
				flex: 1;
				text-align: center;
				font-size: 28rpx;


				image {
					margin-right: 10rpx;
					width: 50rpx;
					height: 50rpx;
				}
			}


			button {
				// padding: 0rpx 30rpx;
				width: 200rpx;
				border-radius: 20rpx;
				font-size: 28rpx;
				color: #fff;

				&:nth-of-type(1) {
					background-color: #e1a542;
				}

				&:nth-of-type(2) {
					margin: 0 50rpx;
					background-color: #2a85e5;
				}

			}


		}


	}
</style>