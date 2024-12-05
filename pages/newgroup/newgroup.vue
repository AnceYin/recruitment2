<template>
	<view class="container">
		<text>发起拼团</text>
		<form @submit="submitForm" report-submit="true">
			<view class="form-item">
				<label>发起人：</label>
				<input type="text" v-model="formData.initiator" placeholder="请输入发起人名称或ID" disabled />
			</view>
			<view class="form-item">
				<label>手机号：</label>
				<input type="text" v-model="formData.mobile" placeholder="自动填充手机号" disabled />
			</view>
			<view class="form-item">
				<label>最大参与人数：</label>
				<picker mode="selector" :range="maxParticipantsOptions" @change="bindMaxParticipantsChange">
					<view class="picker">
						{{ formData.max_participants ? formData.max_participants : '请选择参与人数' }}
					</view>
				</picker>
			</view>
			<view class="form-item">
				<label>截止日期：</label>
				<picker mode="date" :value="formData.deadlineDate" start="2020-01-01" end="2024-12-31"
					@change="bindDateChange">
					<view class="picker">
						{{ formData.deadlineDate ? formData.deadlineDate : '请选择日期' }}
					</view>
				</picker>
			</view>
			<view class="form-item">
				<label>截止时间：</label>
				<picker mode="time" :value="formData.deadlineTime" start="00:00" end="23:59" @change="bindTimeChange">
					<view class="picker">
						{{ formData.deadlineTime ? formData.deadlineTime : '请选择时间' }}
					</view>
				</picker>
			</view>
			<button form-type="submit">提交</button>
		</form>

		<view class="deal">

			<view @click="handleDealClick">
				<label class="checkbox-label">
					<checkbox @click="handleCheckboxClick" :checked="isAgreed"></checkbox>
					请先阅读<text class="link" @click="navigateToBookingDeal">拼团服务协议</text>
				</label>
			</view>



		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					initiator: '', // 发起人
					mobile: '', // 手机号
					max_participants: 0, // 最大参与人数
					deadlineDate: '', // 截止日期
					deadlineTime: '', // 截止时间
					hasPreviousGroup: null // 新增字段，用来存储是否已有拼团记录
				},
				maxParticipantsOptions: [2, 3, 4, ], // 可选的最大参与人数
				isAgreed: false, // 是否同意条款，默认未勾选
				isDealRead: false // 是否已经阅读了拼团服务协议，默认未阅读

			};
		},
		mounted() {
			// 获取当前登录用户的信息
			const userInfo = uniCloud.getCurrentUserInfo();
			if (userInfo && userInfo.uid) {
				// 自动填充发起人为当前登录用户的ID
				this.formData.initiator = userInfo.uid;

				// 根据用户 UID 查询数据库中的 mobile 字段，只查询需要的字段
				const db = uniCloud.database();
				db.collection('uni-id-users').doc(userInfo.uid).field({
						mobile: true, // 只查询 mobile 字段，避免查询 password
					}).get()
					.then(res => {
						console.log('查询结果:', res);
						if (res.result.data && res.result.data.length > 0) {
							const userData = res.result.data[0];
							// 填充手机号
							this.formData.mobile = userData.mobile || '未绑定手机号';


						} else {
							// 如果查询失败或者没有该用户信息
							uni.showToast({
								title: '未找到用户手机号',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						// 查询错误处理
						console.error('查询手机号失败', err);
						uni.showToast({
							title: '查询手机号失败',
							icon: 'none'
						});
					});
				// 调用查询拼团记录的方法
				this.checkIfUserHasGroupBooking(userInfo.uid);
			} else {
				// 如果未能获取用户信息，可以进行错误处理或提示
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				});
			}
		},
		methods: {

			// 新增方法：查询用户是否已有拼团记录
			async checkIfUserHasGroupBooking(uid) {
				try {
					const db = uniCloud.database();
					const res = await db.collection('group-booking').where({
						'participants.uid': uid // 查询当前用户是否已参与拼团
					}).get();

					if (res.result.data && res.result.data.length > 0) {
						this.formData.hasPreviousGroup = true; // 用户已有拼团记录
					} else {
						this.formData.hasPreviousGroup = false; // 用户没有拼团记录
					}
				} catch (err) {
					uni.showToast({
						title: '查询拼团记录失败',
						icon: 'none'
					});
					console.error(err);
				}
			},

			handleCheckboxClick() {
				// 如果未阅读服务协议，不允许勾选复选框
				if (!this.isDealRead) {
					uni.showToast({
						title: '请先阅读服务协议',
						icon: 'none'
					});
					return; // 阻止勾选操作
				}
				// 切换 `isAgreed` 的值
				this.isAgreed = !this.isAgreed;
			},



			navigateToBookingDeal() {
				wx.navigateTo({
					url: '/pages/booking-deal/booking-deal',
					success: () => {
						this.isDealRead = true; // 设置为已阅读协议
						uni.showToast({
							title: '已阅读服务协议',
							icon: 'success'
						});
					}
				});
			},
			// 处理最大参与人数选择器的变化
			bindMaxParticipantsChange(e) {
				this.formData.max_participants = this.maxParticipantsOptions[e.detail.value];
			},
			// 处理日期选择器的变化
			bindDateChange(e) {
				this.formData.deadlineDate = e.detail.value;
			},
			// 处理时间选择器的变化
			bindTimeChange(e) {
				this.formData.deadlineTime = e.detail.value;
			},


			// 表单数据提交方法
			async submitForm() {
				if (!this.isDealRead) {
					uni.showToast({
						title: '请先阅读服务协议',
						icon: 'none'
					});
					return; // 阻止提交
				}

				if (!this.isAgreed) {
					uni.showToast({
						title: '请勾选同意协议',
						icon: 'none'
					});
					return; // 阻止提交
				}
				
				   // 新增：判断用户是否已有拼团记录
				    if (this.formData.hasPreviousGroup) {
				        uni.showToast({
				            title: '您已有拼团记录，无法再次发起拼团',
				            icon: 'none'
				        });
				        return;
				    }

				try {
					// 将日期和时间组合成一个截止时间
					const deadline = new Date(
						`${this.formData.deadlineDate}T${this.formData.deadlineTime}`
					).getTime();

					// 获取表单数据
					const data = {
						initiator: this.formData.initiator,

						max_participants: parseInt(this.formData.max_participants, 10),
						deadline: deadline,
						status: '待上传', // 初始状态设为“待上传”
						current_participants: 1, // 发起拼团时参与人数为 1
						participants: [{
							uid: this.formData.initiator, // 用户 ID
							mobile: this.formData.mobile // 用户手机号
						}], // 将发起者的 ID 和手机号添加到参与者列表中
					};

					// 使用 JQL 将数据写入数据库
					const db = uniCloud.database();
					await db.collection('group-booking').add(data);

					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					// 使用 redirectTo 方法重定向页面
					this.redirectToHistoryGroup();
				} catch (error) {
					console.error('提交失败', error);
					uni.showToast({
						title: '提交失败',
						icon: 'none'
					});
				}
			},


			// 使用 redirectTo 方法重定向页面的方法
			async redirectToHistoryGroup() {
				try {



					// 状态更新完毕后再进行页面跳转
					uni.redirectTo({
						url: '/pages/historygroup/historygroup',
						fail: (err) => {
							console.error('重定向失败', err);
							uni.showToast({
								title: '跳转失败',
								icon: 'none'
							});
						}
					});
				} catch (error) {
					console.error('重定向出错', error);

				}
			}


		}
	};
</script>

<style scoped lang="less">
	.container {
		padding: 20px;
	}

	.form-item {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
	}

	label {
		width: 80px;
		font-weight: bold;
	}

	.picker {
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #f8f8f8;
		text-align: center;
	}

	button {
		width: 100%;
		padding: 10px;
		background-color: #007aff;
		color: #fff;
		border: none;
		border-radius: 4px;
		text-align: center;
	}

	.deal {
		display: flex;
		align-items: center;
		padding: 10px 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #333;
	}

	.link {
		color: #409EFF;
		margin-left: 3px;
		margin-right: 3px;
		text-decoration: underline;
		cursor: pointer;
	}
</style>