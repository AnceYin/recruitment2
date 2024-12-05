<template>

	<uni-nav-bar status-bar :border="false" fixed>
		<view @click="switchCampus">
			<image src="../../uni_modules/uni-id-pages/static/bianzu36beifen.png"
				style="position: absolute; left: 50rpx; width: 38rpx;" mode="widthFix"></image>
			<text>{{campusName}}</text>
		</view>
	</uni-nav-bar>
	<view class="container">
		<view v-for="(item, index) in categories.filter(category => category.status).sort((a, b) => a.sort - b.sort)"
			:key="index" class="category-box">

			<!-- 判断是否为轮播图模块 -->
			<view v-if="item.type === 0" class="filled-box">
				<swiper autoplay="true" interval="3000" duration="500" class="carousel-container">
					<swiper-item v-for="link in item.links" :key="link._id" class="carousel-item">
						<image :src="link.pictureLink.url" class="carousel-image" mode="widthFix"></image>
					</swiper-item>
				</swiper>
			</view>
			<!-- 其他模块 -->
			<view v-else class="filled-box">
				<view class="title-bar">
					<view class="blue-bar"></view>
					<text class="category-title">{{ item.title }}</text>
				</view>
				<view :class="['childcategory-box', getArticleCountClass(item.article_count)]">
					<view class="links-container">
						<view v-for="(link, linkIndex) in item.links.sort((a, b) => a.sort - b.sort)" :key="link._id"
							class="link-box" @click="navigateToCategoryPage(link)">
							<image :src="link.pictureLink.url" class="link-image" mode="widthFix"></image>
							<view class="link-content">
								<view :class="['link-title', 'link-title-' + (index * 1000 + linkIndex)]">
									{{ link.title }}
								</view>
								<!-- 	<view
									:class="['link-title', 'link-title-' + (index * 1000 + linkIndex), { 'hide-title': link.categoriesType === '66d7cbecc390b34a06fd20b8' }]">
									{{ link.title }}
								</view> -->
								<view
									:class="['link-description', 'link-description-' + (index * 1000 + linkIndex), { 'hide-description': link.categoriesType === '66d7cbecc390b34a06fd20b8' }]">
									{{ item.title === '勤工助学' ? '点击进入' : '了解详情' }}
								</view>

							</view>
						</view>
					</view>
				</view>

			</view>
		</view>
	</view>
</template>

<script>
	import {
		ref,
		onLoad,
		onShareAppMessage
	} from '@dcloudio/uni-app'


	export default {
		data() {
			return {
				categories: [],
				campusName: '', //校区名
			};
		},
		onLoad(options) {


			// 加载校园和分类数据
			this.getCampus();
			this.getCategories();
		},
		onShow() {
			this.checkAndUpdateGroupStatus(); // 页面显示时触发状态检查和更新
		},

		// onShow() {
		// 	this.check()
		// },
		onShareAppMessage() {
			return {
				title: '产学通',
				path: '/pages/index/index', // 分享路径，确保路径正确
				imageUrl: 'https://env-00jxgt5r6k5b.normal.cloudstatic.cn/wx7670dd170ec4fad6.png?expire_at=1719149437&er_sign=d10509e14f9ce2f26611d40868fc138b' // 分享的图片 URL
			};
		},
		onShareTimeline() {
			return {
				title: '产学通',
				query: 'path=/pages/index/index', // 分享路径中的参数
				imageUrl: 'https://env-00jxgt5r6k5b.normal.cloudstatic.cn/wx7670dd170ec4fad6.png?expire_at=1719149437&er_sign=d10509e14f9ce2f26611d40868fc138b' // 分享的图片 URL
			};
		},

		methods: {

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
			},


			getArticleCountClass(article_count) {
				if (article_count === 2) {
					return 'double-article';
				} else if (article_count === 4) {
					return 'quadruple-article';
				} else if (article_count === 5) {
					return 'quintuple-article';
				} else {
					return 'multiple-articles';
				}
			},
			// 切换校区
			switchCampus() {
				uni.navigateTo({
					url: '/pages/campus/campus'
				})
			},
			navigateToCategoryPage(link) {




				// 根据 linkType 进行不同的跳转逻辑
				switch (link.linkType) {
					case 0:
						// 不跳转
						console.log('LinkType为0，不跳转页面');
						break;

					case 1:
						// 跳转到其他页面



						uni.navigateTo({
							url: link.linkPath,
						});

						break;
					case 2:
						// 跳转到其他小程序（小程序间跳转）
						const linkData = link.linkPath.split(':'); // 假设linkPath格式为 "appId:path"
						const appId = linkData[0]; // 获取 appId
						const path = linkData[1] || ''; // 获取 path, 如果没有 path 则为空字符串

						uni.navigateToMiniProgram({
							appId: appId, // 这里使用解析后的 appId
							path: path, // 使用解析后的 path
							extraData: {}, // 需要传递给目标小程序的数据
							success(res) {
								console.log('跳转到其他小程序成功', res);
							}
						});
						break;
					case 3:
						// 跳转到公众号文章
						uni.navigateTo({
							url: `/pages/webview/webview?url=${encodeURIComponent(link.linkPath)}`, // 使用 webview 显示公众号文章
						});
						break;
					case 4:
						// 跳转到视频号
						uni.navigateTo({
							url: `/pages/webview/webview?url=${encodeURIComponent(link.linkPath)}`, // 使用 webview 显示视频号内容
						});
						break;
					case 5:
						// 跳转到 http 链接
						uni.navigateTo({
							url: `/pages/webview/webview?url=${encodeURIComponent(link.linkPath)}`, // 使用 webview 显示 http 链接
						});
						break;
					case 6:
						// 其它用途，根据需要自定义处理逻辑
						console.log('其他用途的跳转处理', link);
						break;
					default:
						console.log('未知的 linkType 值', link.linkType);
				}
			},

			async getCategories() {
				const db = uniCloud.database(); // 初始化数据库
				try {
					const categoriesRes = await db.collection('home-categories').get(); // 查询 home-categories 集合
					console.log('home-categories 数据库查询结果:', categoriesRes); // 打印查询结果以供调试

					if (categoriesRes.result && categoriesRes.result.data) {
						const categories = categoriesRes.result.data;

						const linksRes = await db.collection('home-link').get(); // 查询 home-link 集合
						console.log('home-link 数据库查询结果:', linksRes); // 打印查询结果以供调试

						if (linksRes.result && linksRes.result.data) {
							const links = linksRes.result.data;
							console.log('home-link 数据:', links); // 打印链接数据以供调试

							// 将 home-link 数据附加到 categories
							categories.forEach(category => {
								category.links = links.filter(link => link.categoriesType === category._id);
							});

							this.categories = categories;
						} else {
							console.error('获取链接数据失败，errCode:', linksRes.result.errCode, 'errMsg:', linksRes.result
								.errMsg); // 打印详细的错误信息
						}
					} else {
						console.error('获取分类数据失败，errCode:', categoriesRes.result.errCode, 'errMsg:', categoriesRes
							.result.errMsg); // 打印详细的错误信息
					}
				} catch (error) {
					console.error('获取分类或链接数据失败，错误信息:', error.errMsg || error.message); // 优先使用 errMsg
				}
			},

			// 获取校区
			getCampus() {
				const that = this;
				uni.getStorage({
					key: 'selectedCampused',
					success(res) {
						that.campusName = res.data.school_name;
						// console.log('校区名',res.data.school_name);
					},
					fail(err) {
						uni.navigateTo({
							url: '/pages/campus/campus'
						})
						console.log('获取失败--', err);
					}
				})
			},

		}
	};
</script>

<style scoped lang="less">
	.container {
		display: flex;
		flex-direction: column;
		padding: 10px;
	}

	.category-box {
		margin: 5px 0;
		padding: 5px;
		border: 1px solid #ddd;
		border-radius: 5px;
	}


	.childcategory-box {
		margin: 5px 0;
		padding: 5px;

		border-radius: 5px;
	}

	.filled-box {
		padding: 5px;
		background-color: #fff;
	}

	.carousel-container {
		width: 100%;
		overflow: hidden;
	}

	.carousel-item {
		width: 100%;
		height: auto;
	}

	.carousel-image {
		width: 100%;
		height: 100%;
		object-fit: contain;

	}


	.title-bar {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.blue-bar {
		width: 5px;
		height: 20px;
		background-color: blue;
		margin-right: 10px;
	}

	.category-title {
		font-weight: bold;
	}





	/* 两个子元素并排样式 */
	.double-article .links-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: space-between;
		/* 确保两个元素均匀分布 */
	}

	.double-article .link-box {
		width: calc(50% - 10px);
		position: relative;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		height: auto;
	}

	.double-article .link-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		vertical-align: top;
		/* 添加这行 */

	}

	.double-article .link-content {
		position: absolute;
		top: 0;
		left: -17%;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 2;
		padding: 10px;
		text-align: center;


	}

	.double-article .link-title {
		color: #333;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.double-article .link-description {
		font-size: 12px;
		color: #333;
	}

	/* 四个子元素并排样式 */
	.quadruple-article .links-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: space-between;
	}

	.quadruple-article .link-box {
		width: calc(50% - 10px);
		position: relative;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		height: auto;
	}

	.quadruple-article .link-image {
		width: 100%;
		height: 120px;
		object-fit: cover;
		vertical-align: top;
		/* 添加这行 */

	}

	.quadruple-article .link-content {
		position: absolute;
		top: 0;
		left: -17%;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 2;
		padding: 10px;
		text-align: center;

	}

	.quadruple-article .link-title {
		color: #333;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.quadruple-article .link-description {
		font-size: 14px;
		color: #333;
	}

	/* 五个子元素排列样式 */
	.quintuple-article .links-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: flex-start;
	}

	.quintuple-article .link-box {
		width: calc(50% - 10px);
		position: relative;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		height: 100%;

		box-sizing: border-box;
		/* 确保盒子尺寸计算包括 padding 和 border */
		padding: 0;
		/* 去除多余的内边距 */
		margin: 0;
		/* 去除多余的外边距 */
		align-items: stretch;
		/* 确保子元素高度填满 */

	}

	.quintuple-article .link-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		vertical-align: top;
		/* 添加这行 */

	}

	.quintuple-article .link-content {
		position: absolute;
		top: 0;
		left: -20%;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 2;

		text-align: center;

	}

	.quintuple-article .link-title {
		color: #333;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.quintuple-article .link-description {
		font-size: 14px;
		color: #333;
	}

	.quintuple-article .link-box:nth-child(5) {
		width: 50%;
	}

	.quintuple-article .link-image:nth-child(5) {
		height: 100%;
		/* 确保图片高度填满盒子 */

		object-fit: contain;
	}

	/* 多个子元素并排样式 */
	.multiple-articles .links-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: space-between;
	}

	.multiple-articles .link-box {
		width: calc(25% - 10px);
		position: relative;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		height: auto;
	}

	.multiple-articles .link-image {
		width: 100%;
		height: 80px;
		object-fit: cover;
		vertical-align: top;
		/* 添加这行 */

	}

	.multiple-articles .link-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 2;
		padding: 10px;
		text-align: center;

	}

	.multiple-articles .link-title {
		color: #333;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.multiple-articles .link-description {
		font-size: 14px;
		color: #333;
	}

	.hide-title {
		display: none;
	}

	.hide-description {
		display: none;
	}
</style>