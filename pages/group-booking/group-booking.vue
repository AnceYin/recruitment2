<template>
	<view class="container">
		<text>拼团大厅</text>
		<view class="header">
			<text>筛选队伍</text>
		</view>

		<!-- 页面中部内容，渲染 status 为 "待上传" 的数据 -->
		<view class="middle">
			<view v-for="(item, index) in pendingGroups" :key="index" class="group-item"
				@click="goTogroupbookingdetail">
				<view class="group-header">
					<text class="group-id">拼团单号: {{ item._id }}</text>

				</view>
				<!-- 新增 group-middle 层，用于显示当前人数与最大人数 -->
				<view class="group-middle">
					<text>当前参与人数: {{ item.current_participants }} </text>
					<text>最大参与人数: {{ item.max_participants }}</text>
				</view>
				<view class="group-footer">
					<text class="group-timer">{{ formatCountdown(item.remainingTime) }}</text>
					<button class="group-join" @click="goToGroupBookingDetail(item)">参与拼团</button>
				</view>
			</view>
		</view>

		<!-- 页面内容部分 -->
		<view class="content">
			<!-- 底部固定操作栏 -->
			<view class="footer">
				<view class="footer-button" @click="goTonewGroup">
					<text>新建拼团</text>
				</view>
				<view class="footer-button chat-button" @click="goTohistoryGroup">
					<text>历史拼团</text>
				</view>
				<view class="footer-button chat-button"
					@click="toPath('/uni_modules/uni-im/pages/chat/chat?user_id=66cacb7bb5d950c810b3506d')" :link="true"
					:show-badge="unreadMsgCount>0" :badge-text="unreadMsgCount+''"
					:badge-style="{'background':'#f41500'}">
					<text>聊一聊</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
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
		data() {
			return {
				pendingGroups: [], // 用于存储 status 为 "待上传" 的拼团数据
				timer: null // 定时器，用于实时更新倒计时
			};
		},
		mounted() {
			this.fetchPendingGroups(); // 页面加载时获取拼团数据
			this.startCountdownUpdates(); // 开始倒计时更新
		},
		beforeDestroy() {
			// 清除定时器
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		onShow() {

			this.checkAndUpdateGroupStatus(); // 页面显示时触发状态检查和更新
			
			this.fetchPendingGroups(); // 页面加载时获取拼团数据

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
			// 查询 group-booking 数据表，获取 status 为 "待上传" 的记录
			async fetchPendingGroups() {
				try {
					const db = uniCloud.database();
					// 查询 status 为 "待上传" 的记录
					const res = await db.collection('group-booking').where({
						status: '待上传'
					}).get();

					if (res.result && res.result.data) {
						// 初始化每个拼团的剩余时间
						this.pendingGroups = res.result.data.map(item => {
							item.remainingTime = item.deadline - Date.now();
							return item;
						});
					} else {
						this.pendingGroups = []; // 如果没有查询到数据，清空数组
					}
				} catch (error) {
					console.error('获取待上传拼团数据时出错:', error);
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				}
			},
			// 启动定时器，实时更新倒计时
			startCountdownUpdates() {
				this.timer = setInterval(() => {
					this.updateCountdowns(); // 每秒更新一次倒计时
				}, 1000);
			},
			// 更新所有拼团的倒计时
			updateCountdowns() {
				this.pendingGroups.forEach(item => {
					item.remainingTime = item.deadline - Date.now();
					if (item.remainingTime <= 0) {
						item.remainingTime = 0; // 避免显示负值
					}
				});
			},
			// 格式化倒计时为 DD 天 HH 时 mm 分 ss 秒
			formatCountdown(remaining) {
				if (remaining <= 0) {
					return "00 天 00 时 00 分 00 秒";
				}

				const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
				remaining %= (1000 * 60 * 60 * 24);

				const hours = Math.floor(remaining / (1000 * 60 * 60));
				remaining %= (1000 * 60 * 60);

				const minutes = Math.floor(remaining / (1000 * 60));
				remaining %= (1000 * 60);

				const seconds = Math.floor(remaining / 1000);

				return `${String(days).padStart(2, '0')} 天 ${String(hours).padStart(2, '0')} 时 ${String(minutes).padStart(2, '0')} 分 ${String(seconds).padStart(2, '0')} 秒`;
			},
			// 跳转到新建拼团页面
			goTonewGroup() {
				uni.navigateTo({
					url: '/pages/newgroup/newgroup'
				});
			},
			// 跳转到历史拼团页面
			goTohistoryGroup() {
				uni.navigateTo({
					url: '/pages/historygroup/historygroup'
				});
			},


			// 跳转到拼团详情页面，并传递数据
			goToGroupBookingDetail(item) {
				uni.navigateTo({
					url: `/pages/group-booking-detail/group-booking-detail?data=${encodeURIComponent(JSON.stringify(item))}`,
				});
			},

			// 数据表时间戳更改触发页面
			// 数据表时间戳更改触发页面
	async checkAndUpdateGroupStatus() {
	    try {
	        const db = uniCloud.database();
	        const now = new Date().getTime(); // 获取当前时间戳
	
	        // 查询状态为“待上传”或“已满员”的记录
	        const res = await db.collection('group-booking')
	            .where({
	                status: {
	                    $in: ['待上传', '已满员']
	                }
	            })
	            .get();
	
	        if (res.result.data && res.result.data.length > 0) {
	            // 遍历每条记录，检查并更新状态
	            const updates = res.result.data.map(async (item) => {
	                const currentParticipants = item.participants.length; // 当前参与人数
	                const maxParticipants = item.max_participants; // 最大参与人数
	                const deadline = item.deadline; // 截止时间
	
	                // 1. 当前参与人数达到最大参与人数，且当前时间还没达到截止时间
	                if (currentParticipants >= maxParticipants && now < deadline) {
	                    await db.collection('group-booking').doc(item._id).update({
	                        status: '已满员' // 更新状态为已满员
	                    });
	                    console.log(`拼团队伍 ${item._id} 状态更新为已满员`);
	                }
	
	                // 2. 当前参与人数达到最大参与人数，且当前时间达到截止时间
	                if (currentParticipants >= maxParticipants && now >= deadline) {
	                    await db.collection('group-booking').doc(item._id).update({
	                        status: '已结束' // 更新状态为已结束
	                    });
	                    console.log(`拼团队伍 ${item._id} 状态更新为已结束`);
	                }
	
	                // 3. 当前参与人数未达到最大参与人数，但当前时间达到截止时间
	                if (currentParticipants < maxParticipants && now >= deadline) {
	                    await db.collection('group-booking').doc(item._id).update({
	                        status: '已结束' // 更新状态为已结束
	                    });
	                    console.log(`拼团队伍 ${item._id} 状态更新为已结束，因为截止时间已到`);
	                }
	            });
	
	            // 等待所有更新操作完成
	            await Promise.all(updates);
	        }
	
	        console.log("拼团状态更新完毕");
	        uni.showToast({
	            title: '拼团状态更新完成',
	            icon: 'none'
	        });
	
	    } catch (error) {
	        console.error('拼团状态更新失败', error);
	        uni.showToast({
	            title: '拼团状态更新失败',
	            icon: 'none'
	        });
	    }
	}







		}
	};
</script>

<style scoped lang="less">
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding: 10px;
		box-sizing: border-box;
	}

	.header {
		margin: 5px 0;
		padding: 10px;
		border: solid 1px black;
	}

	.middle {
		margin: 10px 0;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: #f9f9f9;

		.group-item {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: 15px;
			margin-bottom: 10px;
			border: 1px solid #ddd;
			border-radius: 5px;
			background-color: #fff;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

			.group-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10px;
			}

			.group-id {
				font-size: 14px;
				font-weight: bold;
				color: #333;
			}

			.group-timer {
				font-size: 14px;
				color: #333;
				font-weight: bold;
			}

			.group-middle {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.group-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.group-status {
				font-size: 14px;
				color: #333;
				font-weight: bold;
			}

			.group-join {
				font-size: 14px;
				color: #333;
				cursor: pointer;
				font-weight: bold;
			}
		}
	}

	.content {
		flex: 1;
		margin: 5px 0;
		padding: 10px;
		overflow-y: auto;

		.footer {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			display: flex;
			justify-content: space-around;
			padding: 10px 0;
			background-color: #fff;
			border-top: 1px solid #ddd;
		}

		.footer-button {
			flex: 1;
			text-align: center;
			padding: 10px;
			margin: 0 5px;
			background-color: #FF4500;
			color: white;
			font-size: 18px;
			border-radius: 5px;
		}

		.chat-button {
			background-color: #32CD32;
		}
	}
</style>