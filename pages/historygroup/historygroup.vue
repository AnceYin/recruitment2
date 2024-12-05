<template>
	<view class="container">
		<!-- 加载动画 -->
		<view v-if="isLoading" class="loading-container">
			<text>加载中...</text> <!-- 这里可以替换为更好看的加载动画组件 -->
		</view>

		<!-- TabBar 直接集成在页面内 -->
		<view v-else>
			<view class="tabbar">
				<view :class="['tabbar-item', { active: currentTab === 0 }]" @click="switchTab(0)">
					<text>待上传</text>
				</view>
				<view :class="['tabbar-item', { active: currentTab === 1 }]" @click="switchTab(1)">
					<text>已满员</text>
				</view>
				<view :class="['tabbar-item', { active: currentTab === 2 }]" @click="switchTab(2)">
					<text>已结束</text>
				</view>
			</view>

			<!-- 根据 currentTab 显示不同的内容 -->
			<view v-if="currentTab === 0" class="middle">
				<view v-for="(item, index) in dataList" :key="index" class="group-item">
					<view class="group-header">
						<text class="group-id">拼团单号: {{ item._id }}</text>
					</view>
					<view class="group-footer">
						<text class="group-timer">{{ formatCountdown(item.remainingTime) }}</text>
						<button class="group-join" @click="goToGroupBookingDetail(item)">去上传</button>
					</view>
				</view>
			</view>
			<view v-else-if="currentTab === 1" class="middle">
				<view v-for="(item, index) in dataList" :key="index" class="group-item"
					@click="goToGroupBookingDetail(item)">
					<view class="group-header">
						<text class="group-id">拼团单号: {{ item._id }}</text>
					</view>
					<view class="group-footer">
						<text class="group-timer">{{ formatCountdown(item.remainingTime) }}</text>
						<text class="group-status">状态: {{ item.status }}</text>
						<text class="group-max-participants">最大参与人数: {{ item.max_participants }}</text>
						<text class="group-current-participants">当前参与人数: {{ item.current_participants }}</text>
					</view>
				</view>
			</view>
			<view v-else-if="currentTab === 2" class="middle">
				<view v-for="(item, index) in dataList" :key="index" class="group-item"
					@click="goToGroupBookingDetail(item)">
					<view class="group-header">
						<text class="group-id">拼团单号: {{ item._id }}</text>
					</view>
					<view class="group-footer">
						<text class="group-deadline">截止时间: {{ new Date(item.deadline).toLocaleString() }}</text>
						<button class="group-status">状态: {{ item.status }}</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 0, // 初始化当前选中的 Tab
				dataList: [], // 用于存储查询到的数据
				timer: null, // 定时器，用于实时更新倒计时
				isLoading: false // 控制加载动画的显示
			};
		},
		mounted() {
			this.fetchGroupBookingData(); // 页面加载时获取数据
			this.startCountdownUpdates(); // 开始倒计时更新
		},
		beforeDestroy() {
			// 清除定时器
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		methods: {
		
			// 跳转到拼团详情页面，并传递数据
			goToGroupBookingDetail(item) {
				uni.navigateTo({
					url: `/pages/group-booking-detail/group-booking-detail?data=${encodeURIComponent(JSON.stringify(item))}`
				});
			},

			// 切换 Tab 的方法
			switchTab(index) {
				this.currentTab = index; // 更新 currentTab 的值
				this.fetchGroupBookingData(); // 切换 Tab 时重新查询数据
			},
			// 查询 group-booking 数据的方法
			// 查询 group-booking 数据的方法
			async fetchGroupBookingData() {
				try {
					this.isLoading = true; // 开始加载，显示加载动画
					const db = uniCloud.database();

					// 获取当前用户的信息
					const userInfo = uniCloud.getCurrentUserInfo(); // 确保在方法内部获取用户信息
					if (!userInfo || !userInfo.uid) {
						uni.showToast({
							title: '获取用户信息失败',
							icon: 'none'
						});
						return;
					}

					let status = '';
					if (this.currentTab === 0) {
						status = '待上传';
					} else if (this.currentTab === 1) {
						status = '已满员';
					} else if (this.currentTab === 2) {
						status = '已结束';
					}

					// 使用 JQL 查询 group-booking 数据表
					const res = await db.collection('group-booking').where({
						status,
						participants: userInfo.uid // 查询参与者包含当前用户ID的记录
					}).get();

					if (res.result && res.result.data) {
						// 使用 Promise.all 确保所有异步操作完成后再更新 dataList
						const processedData = await Promise.all(res.result.data.map(async (item) => {
							item.remainingTime = item.deadline - Date.now();

							// 更新状态为 "已结束" 的处理逻辑
							if (item.remainingTime <= 0 && item.status === '待上传') {
								item.status = '已结束';
								await db.collection('group-booking').doc(item._id).update({
									status: '已结束'
								});
							}
							return item;
						}));

						// 完成所有异步处理后，才更新 dataList
						this.dataList = processedData.filter(item => item.status === status);
					} else {
						this.dataList = []; // 如果没有查询到数据，清空数组
					}
				} catch (error) {
					console.error('获取 group-booking 数据时出错:', error);
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				} finally {
					this.isLoading = false; // 加载完成，隐藏加载动画
				}
			},
			
			async checkAndUpdateBookingStatus() {
			    try {
			        const db = uniCloud.database();
			        const now = new Date().getTime(); // 获取当前时间戳
			
			        // 查询状态为“待上传”的记录
			        const res = await db.collection('group-booking')
			            .where({
			                status: '待上传'
			            })
			            .get();
			
			        if (res.result.data && res.result.data.length > 0) {
			            // 遍历每条记录，检查并更新状态
			            const updates = res.result.data.map(async (item) => {
			                if (item.deadline < now) {
			                    // 如果当前时间超过了 deadline，则更新状态为“已结束”
			                    await db.collection('group-booking').doc(item._id).update({
			                        status: '已结束'
			                    });
			                } else if (item.current_participants >= item.max_participants) {
			                    // 如果当前参与人数已达最大值，并且当前时间未超过截止时间，则更新状态为“已满员”
			                    await db.collection('group-booking').doc(item._id).update({
			                        status: '已满员'
			                    });
			                }
			            });
			
			            // 等待所有更新操作完成
			            await Promise.all(updates);
			        }
			
			        console.log("拼团数据库状态检测完毕");
			        uni.showToast({
			            title: '状态检查和更新完成',
			            icon: 'none'
			        });
			
			    } catch (error) {
			        console.error('更新状态失败', error);
			        uni.showToast({
			            title: '状态更新失败',
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
				this.dataList.forEach(item => {
					item.remainingTime = item.deadline - Date.now();
					if (item.remainingTime <= 0) {
						item.remainingTime = 0; // 避免显示负值
					}
				});
			},
			// 启动定时器，实时更新倒计时
			startCountdownUpdates() {
				this.timer = setInterval(() => {
					this.updateCountdowns(); // 每秒更新一次倒计时
				}, 1000);
			},
			// 更新所有拼团的倒计时
			updateCountdowns() {
				this.dataList.forEach(item => {
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
			}
		}
	};
</script>

<style scoped lang="less">
	.container {
		padding: 20px;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: rgba(255, 255, 255, 0.8);
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 999;
	}

	.tabbar {
		display: flex;
		height: 50px;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 1000;
	}

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

	.middle {
		margin: 10px 0;
		padding: 10px;
	}

	.group-item {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 15px;
		margin-bottom: 10px;
		border: 1px solid #ddd;
		border-radius: 10px;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		.group-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			border-bottom: 1px solid #f0f0f0;
			padding-bottom: 10px;
		}

		.group-id {
			font-size: 14px;
			font-weight: bold;
			color: #333;
		}

		.group-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 10px;
		}

		.group-timer {
			font-size: 16px;
			color: #e60000;
			font-weight: bold;
		}

		.group-status,
		.group-max-participants,
		.group-current-participants,
		.group-deadline {
			font-size: 14px;
			color: #666;
		}

		.group-join {
			font-size: 14px;
			color: #007bff;
			cursor: pointer;
			font-weight: bold;
		}
	}
</style>