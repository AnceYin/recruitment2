<template>
	<view class="tweet-content">
		<view class="tweet-top">
			<rich-text :nodes="tweetCotent"></rich-text>
		</view>
		<view class="tweet-bottom">
			<view class="icon-item" v-for="(item,index) in navlist" :key="index" @click="addordelCollect(index)">
				<image :src="item.imgurl"></image>
				<text>{{item.text}}</text>
			</view>
			<button @click="toPath(`/uni_modules/uni-im/pages/chat/chat?user_id=${author}`)" :link="true"
				:show-badge="unreadMsgCount>0" :badge-text="unreadMsgCount+''"
				:badge-style="{'background':'#f41500'}">留言</button>
			<!-- <button>打电话</button> -->
		</view>
	</view>
</template>

<script>
	import data from '../../uni_modules/uni-im/sdk/state/data';
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		computed: {
			unreadMsgCount() {
				return uniIm.conversation.unreadCount()
			},
			notificationUnreadCount() {
				return uniIm.notification.unreadCount()
			}
		},

		name: "tweetdeails",
		data() {
			return {
				navlist: [{
						imgurl: '../../static/collect.png',
						text: '收藏'
					},
					{
						imgurl: '../../static/userhead.png',
						text: '作者'
					},
				],
				tweetid: '', //该文章id
				acticleContent: '', //该文章内容
				collectbol: false, //用来判断该文章是否收藏，默认值为false
				tweetCotent: '', //文章详情内容
				author: '', // 用于存储传入的 author 值

				// tweetAllData: {}, //存储文章所有信息

			};
		},
		onLoad(options) {
			let data = JSON.parse(decodeURIComponent(options.data));
			console.log('options---', data);
			this.tweetCotent = data.body;
			this.author = data.author; // 获取并存储 author 值
			this.tweetid = data._id;
			this.getcollectBySql(data._id); //调用该方法查询该文章是否收藏
			this.getAuthor();
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
			// test
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
			addordelCollect(index) {
				if (index === 0) {
					// 添加
					if (this.collectbol) {
						this.navlist[0].imgurl = '../../static/collect.png';
						this.navlist[0].text = '收藏';
						this.collectbol = false;
						this.deleteCollect(this.tweetid);
						uni.showToast({
							title: '取消收藏',
							icon: 'none',
							duration: 1000
						});
					}
					// 取消
					else {
						this.navlist[0].imgurl = '../../static/collect_b.png';
						this.navlist[0].text = '已收藏';
						this.collectbol = true;
						this.addCollect(this.tweetid);
						uni.showToast({
							title: '收藏成功',
							icon: 'none',
							duration: 1000
						});

					}
				}


			},

			// 判断该文章是否收藏
			async getcollectBySql(tweetid) {
				try {
					const db = uniCloud.databaseForJQL();
					const collectdata = await db.collection('favorite').where({
						article_id:tweetid,
						user_id: db.getCloudEnv('$cloudEnv_uid')
					}).get();

					console.log('是否收藏====', collectdata);

					if (collectdata.data) {
						// 未查询到相关收藏数据
						if (collectdata.data.length === 0) {
							this.navlist[0].imgurl = '../../static/collect.png';
							this.collectbol = false;
							console.log('未收藏');
						}
						// 查询到相关数据
						else {
							this.navlist[0].imgurl = '../../static/collect_b.png';
							this.collectbol = true;
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
			async addCollect(tweetid) {
				const db = uniCloud.databaseForJQL();
				try {
					const collectdata = await db.collection('favorite').add({
						article_id: tweetid
					});

					console.log('添加收藏coll====', collectdata);

				} catch (error) {
					console.error('添加数据失败，错误信息:', error);
				}
			},


			// 取消收藏，从数据库删除此条数据
			async deleteCollect(tweetid) {
				const db = uniCloud.databaseForJQL();
				try {
					const collectdata = await db.collection('favorite').where({
						article_id: tweetid
					}).remove();
					console.log('取消收藏coll====', collectdata);
				} catch (error) {
					console.error('删除数据失败，错误信息:', error);
				}
			},
			
			// 获取作者
			async getAuthor(){
				const db = uniCloud.databaseForJQL();
				try {
					const author = await db.collection('uni-id-users').doc(this.author).get();
					console.log('author',author);
				} catch (error) {
					console.error('查询数据失败，错误信息:', error);
				}
			}


		},

	}
</script>

<style lang="less">
	.tweet-content {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #efefef;

		.tweet-top {
			padding: 10rpx;
			height: 88vh;
			overflow: auto;
		}

		.tweet-bottom {
			flex: 1;
			display: flex;
			height: 150rpx;
			padding: 15rpx;
			background-color: #fff;

			.icon-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 200rpx;

				image {
					width: 50rpx;
					height: 50rpx;
				}

				text {
					margin-top: ;
					font-size: 20rpx;
				}

			}

			button {
				margin-left: 10rpx;
				width: 220rpx;
				height: 100rpx;
				line-height: 100rpx;
				color: #fff;
				border-radius: 15rpx;
				font-size: 30rpx;

				&:nth-of-type(1) {
					background: linear-gradient(90deg, #eabe1b, #d68c25);
				}

				&:nth-of-type(2) {
					background: linear-gradient(90deg, #d66b24, #d64414);
				}

			}


		}
	}
</style>