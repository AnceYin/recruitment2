<template>
	<view class="container">
		<view class="header">
		</view>
		<view class="middle">
			<view class="detail-item">
				<text>拼团单号: {{ detailsid }}</text>
				<text>发起人: {{ initiator }}</text>
				<text>最大参与人数: {{ max_participants }}</text>
				<text v-if="current_participants !== undefined">当前参与人数: {{ current_participants }}</text>
				<text v-else>加载中...</text>
				<text>截止时间: {{ formatDate(deadline) }}</text>
				<button>状态: {{status }}</button>
				<button @click="joinGroup">加入拼团</button>
			</view>
		</view>

		<view class="footer">
			<text class="link" @click="navigateToBookingDeal">拼团服务协议</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		onLoad,
		onShareAppMessage
	} from '@dcloudio/uni-app';

	// 定义响应式数据
	const status = ref('');
	const initiator = ref('');
	const max_participants = ref(0);
	const current_participants = ref(0); // 初始化为0，表示当前没有参与者

	const deadline = ref('');
	const detailsid = ref('');
	const groupData = ref({});

	// onLoad 方法，用于处理页面加载时的逻辑
	onLoad((options) => {
		console.log('Received options:', options);

		if (options.data) {
			// 处理通过 navigateTo 方式传递的复杂对象
			try {
				const data = JSON.parse(decodeURIComponent(options.data));
				console.log('Parsed data:', data);
				// 正确解析数据并赋值
				status.value = data.status || '';
				initiator.value = data.initiator || '';
				max_participants.value = data.max_participants;
				current_participants.value = Array.isArray(data.participants) ? data.participants.length : 0;


				deadline.value = data.deadline || '';
				detailsid.value = data._id || '';
				// 将 data 中的 _id 赋值给 groupData.value
				groupData.value = data;


				console.log('Details after parsing:', {
					status: status.value,
					initiator: initiator.value,
					max_participants: max_participants.value,
					current_participants: current_participants.value,
					deadline: deadline.value,
					detailsid: detailsid.value,
					groupData: groupData.value

				});
			} catch (e) {
				console.error('Error parsing data:', e);
				uni.showToast({
					title: '数据解析失败',
					icon: 'none'
				});
			}
		} else if (options.id) {
			// 处理通过分享路径传递的 id 参数
			detailsid.value = options.id;

			// 将接收到的id赋值为groupData.value._id
			groupData.value._id = options.id;
			console.log('Received ID:', detailsid.value);
			// 根据 ID 加载详细信息，比如发起网络请求获取数据等
			loadGroupDetail(detailsid.value);
		} else {
			console.log("未接收到有效的参数");
			uni.showToast({
				title: '未找到拼团详情',
				icon: 'none'
			});
		}
	});

	const navigateToBookingDeal = () => {
		// 跳转到用户服务协议页面
		wx.navigateTo({
			url: '/pages/booking-deal/booking-deal'
		});
	};

	// 示例方法：根据接收到的 ID 加载拼团详情
	const loadGroupDetail = async (id) => {
		try {
			const db = uniCloud.database();
			const res = await db.collection('group-booking').doc(id).get();
			if (res.result.data && res.result.data.length > 0) {
				const data = res.result.data[0];
				groupData.value = data;
				status.value = data.status || '';
				initiator.value = data.initiator || ''; // 这里是发起人的ID
				max_participants.value = data.max_participants || 0;
				current_participants.value = Array.isArray(data.current_participants) ? data.current_participants :
					[]; // 确保是数组

				deadline.value = data.deadline || '';
				detailsid.value = data._id || '';
				// 调试日志，确认发起人ID是否正确
				console.log("拼团详情:", groupData.value);
				console.log("发起人ID:", initiator.value); // 确保发起人ID被正确加载
			} else {
				console.log("未找到拼团详情");
				uni.showToast({
					title: '未找到拼团详情',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('加载拼团详情失败:', error);
			uni.showToast({
				title: '加载拼团详情失败',
				icon: 'none'
			});
		}
	};
	const joinGroup = () => {
		// 记录开始时间
		const startTime = new Date();
		// 获取当前用户信息
		const userInfo = uniCloud.getCurrentUserInfo();
		if (!userInfo || !userInfo.uid) {
			uni.showToast({
				title: '获取用户信息失败，请先登录',
				icon: 'none',
				duration: 2000 // 提示持续时间，单位为毫秒
			});
			uni.switchTab({
				url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
			})
			return; // 终止操作
		}

		// 确保 participants 是一个数组
		let participants = Array.isArray(groupData.value.participants) ? groupData.value.participants : [];

		// 使用 switch 来处理判断条件
		let conditionMet = false; // 用于跟踪是否满足任何条件

		switch (true) {
			// 检查条件：是否为发起人
			case groupData.value.initiator === userInfo.uid:
				uni.showToast({
					title: '您是发起人，无需加入拼团',
					icon: 'none'
				});
				conditionMet = true; // 条件满足，终止操作
				break;

				// 检查条件：用户是否已经在拼团中
			case participants.includes(userInfo.uid):
				uni.showToast({
					title: '您已经在拼团中',
					icon: 'none'
				});
				conditionMet = true; // 条件满足，终止操作
				break;

				// 检查条件：拼团是否已满员或已结束
			case groupData.value.status === '已满员' || groupData.value.status === '已结束':
				uni.showToast({
					title: '拼团已满员或已结束',
					icon: 'none'
				});
				conditionMet = true; // 条件满足，终止操作
				break;

			default:
				// 没有任何条件满足时，继续后续操作
				break;
		}

		// 如果满足任意条件，返回并终止
		if (conditionMet) {
			return;
		}

		// 将用户ID添加到 participants 数组中
		participants.push(String(userInfo.uid));

		// 手动更新数据库记录
		const db = uniCloud.database();

		db.collection('group-booking')
			.doc(groupData.value._id) // 基于拼团记录的 ID 更新
			.update({
				participants: participants, // 更新 participants 数组
				current_participants: groupData.value.current_participants + 1 // 当前参与人数 +1
			})
			.then((res) => {
				console.log('数据库更新响应:', res);
				uni.redirectTo({
					url: '/pages/historygroup/historygroup' // 重定向到历史拼团页面
				});
				// 记录结束时间
				const endTime = new Date();
				const executionTime = endTime - startTime; // 计算执行时间
				console.log(`joinGroup 方法执行时间: ${executionTime} 毫秒`);
			})
			.catch((error) => {
				console.error('加入拼团失败，错误信息:', error);
				uni.showToast({
					title: `加入拼团失败，请重试`,
					icon: 'none'
				});
			});
	};




	// 格式化日期的方法
	const formatDate = (timestamp) => {
		if (!timestamp || isNaN(new Date(timestamp).getTime())) {
			return '无效日期';
		}
		const date = new Date(timestamp);
		return date.toLocaleString(); // 将时间戳格式化为本地时间字符串
	};

	// 分享页面设置
	onShareAppMessage(() => {
		console.log('detailsid before generating share path:', detailsid.value);
		return {
			title: '产学通 - 拼团详情',
			path: `/pages/group-booking-detail/group-booking-detail?id=${detailsid.value}`, // 这里要使用 ${detailsid.value} 而不是字符串形式,
			imageUrl: 'https://env-00jxgxphldz6.normal.cloudstatic.cn/切图/8d1770a0dea6ca0a0bd19b4d47454ed9.jpg'
		};
	});
	// 分享到朋友圈的设置
	const onShareTimeline = () => {
		return {
			title: '产学通',
			query: `data=${encodeURIComponent(JSON.stringify({ _id: detailsid.value }))}`, // 使用响应式变量 detailsid.value
			imageUrl: 'https://env-00jxgxphldz6.normal.cloudstatic.cn/切图/8d1770a0dea6ca0a0bd19b4d47454ed9.jpg?expire_at=1724988110&er_sign=5b6d9becea5546bae299347e399c8bd4' // 分享的图片 URL
		};
	};
</script>

<style scoped>
	.container {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.middle {
		margin-top: 20px;
		padding: 10px;
		/* border: 1px solid #ddd; */
		border-radius: 5px;

		flex-grow: 1;
	}

	.detail-item {
		margin-bottom: 10px;
	}

	.detail-item text {
		display: block;
		margin-bottom: 5px;
		font-size: 14px;
		color: #333;
	}

	.footer {
		padding-bottom: 20px;
		text-align: center;
		margin-top: auto;
	}
</style>