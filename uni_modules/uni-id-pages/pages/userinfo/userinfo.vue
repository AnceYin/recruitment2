<!-- 用户资料页 -->
<template>
	<view class="uni-content">
		<view class="avatar">
			<image src="https://env-00jxgxphldz6.normal.cloudstatic.cn/uni-im/userbg.png"></image>
			<uni-id-pages-avatar width="153rpx" height="153rpx"></uni-id-pages-avatar>
			<text @click="setNickname('')">{{userInfo.nickname||'未设置'}}</text>
		</view>
		<uni-list class="nav-list">
			<!-- 			<uni-list-item style="position: none;"  @click="setNickname('')" title="昵称" :rightText="userInfo.nickname||'未设置'" link>
			</uni-list-item> -->
			<uni-list-item class="item" @click="bindMobile" title="手机号" :rightText="userInfo.mobile||'未绑定'"
				iconimg="../../../../static/shoujihao.png" link>
			</uni-list-item>
			<uni-list-item v-if="userInfo.email" class="item" title="电子邮箱" :rightText="userInfo.email">
			</uni-list-item>
			<uni-list-item class="item" @click="subscribeMessage" title="订阅消息通知" link> </uni-list-item>
			<!-- 
			<uni-list-item class="item" title="历史记录" rightText="" iconimg="../../../../static/lishijilu_1.png" link>
			</uni-list-item> -->
			<uni-list-item class="item" title="我的收藏" rightText="" iconimg="../../../../static/collect_b.png" link
				@click="JumpmyCollect">
			</uni-list-item>

			<uni-list-item v-if="uniIDHasRole('hr')||uniIDHasRole('admin')" class="item"
				:title="uniIDHasRole('hr')?'简历模板':uniIDHasRole('admin')?'问卷调查模板':''" rightText=""
				iconimg="../../../../static/questionnaire.png" link @click="JumpQuestionnaireEditBox">
			</uni-list-item>

			<uni-list-item v-if="uniIDHasRole('hr')||uniIDHasRole('admin')" class="item"
				:title="uniIDHasRole('hr')?'简历箱':uniIDHasRole('admin')?'问卷调查':''" rightText=""
				iconimg="../../../../static/questionnaireBox.png" link @click="JumpQuestionnaireBox">
			</uni-list-item>

			<uni-list-item v-if="uniIDHasRole('cm')" class="item" title="内容管理" rightText="" link @click="JumpCM">
			</uni-list-item>

			<uni-list-item class="item" :title="campusName" rightText="" iconimg="../../../../static/school.png" link
				@click="Jumpcampus">
			</uni-list-item>

			<uni-list-item v-if="uniIDHasRole('hr')||uniIDHasRole('admin')" class="item"
				:title="uniIDHasRole('hr')?'拼团订单':uniIDHasRole('admin')?'拼团订单':''" rightText="拼团订单"
				iconimg="../../../../static/questionnaireBox.png" link @click="JumpGruopBookingAdmin">
			</uni-list-item>
			
			<uni-list-item class="item" title="我的拼团" rightText="" iconimg="../../../../static/collect_b.png" link @click="JumpmyGroupbooking">
			</uni-list-item>

			<uni-list-item class="item" title="联系我们" rightText="" iconimg="../../../../static/co.png" link
				@click="JumpCo">
			</uni-list-item>



		</uni-list>
		<!-- #ifndef MP -->
		<uni-list class="mt10">
			<uni-list-item @click="deactivate" title="注销账号" link="navigateTo"></uni-list-item>
		</uni-list>
		<!-- #endif -->
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog mode="input" :value="userInfo.nickname" @confirm="setNickname"
				:inputType="setNicknameIng?'nickname':'text'" title="设置昵称" placeholder="请输入要设置的昵称">
			</uni-popup-dialog>
		</uni-popup>
		<uni-id-pages-bind-mobile ref="bind-mobile-by-sms" @success="bindMobileSuccess"></uni-id-pages-bind-mobile>
		<template v-if="showLoginManage">
			<view class="button-box">
				<button v-if="userInfo._id" @click="logout">退出登录</button>
				<button v-else @click="login">一键登录</button>
				<uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login>
			</view>
		</template>
	</view>
</template>
<script>
	import config from '@/uni_modules/uni-id-pages/config.js'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'

	const uniIdCo = uniCloud.importObject("uni-id-co")
	export default {
		mixins: [mixin],
		computed: {
			userInfo() {
				return store.userInfo
			},
			realNameStatus() {
				if (!this.userInfo.realNameAuth) {
					return 0
				}

				return this.userInfo.realNameAuth.authStatus
			}
		},
		data() {
			return {
				univerifyStyle: {
					authButton: {
						"title": "本机号码一键绑定", // 授权按钮文案
					},
					otherLoginButton: {
						"title": "其他号码绑定",
					}
				},
				// userInfo: {
				// 	mobile:'',
				// 	nickname:''
				// },
				hasPwd: false,
				showLoginManage: true, //通过页面传参隐藏登录&退出登录按钮
				setNicknameIng: false,
				campusName: '未绑定校区', //校区名
			}
		},
		async onShow() {
			this.univerifyStyle.authButton.title = "本机号码一键绑定"
			this.univerifyStyle.otherLoginButton.title = "其他号码绑定"
			this.getCampus(); //获取校区
			this.checkAndRemoveGroupsWithoutImages(); //检查拼团是否有上传图片的参与者并处理
		},
		async onLoad(e) {
			if (e.showLoginManage) {
				this.showLoginManage = true //通过页面传参隐藏登录&退出登录按钮
			}
			//判断当前用户是否有密码，否则就不显示密码修改功能
			// let res = await uniIdCo.getAccountInfo()
			// this.hasPwd = res.isPasswordSet

		},
		methods: {
			async checkAndRemoveGroupsWithoutImages() {
			    try {
			        const db = uniCloud.database();
			        const now = new Date().getTime(); // 获取当前时间戳
			
			        // 查询已结束的拼团记录
			        const res = await db.collection('group-booking')
			            .where({
			                status: '已结束'
			            })
			            .get();
			
			        if (res.result.data && res.result.data.length > 0) {
			            // 遍历每条已结束的记录，检查是否有参与者上传图片
			            const updates = res.result.data.map(async (item) => {
			                const participantsWithImages = item.participants.filter(participant =>
			                    participant.imageUrl); // 筛选出有上传图片的参与者
			
			                // 如果所有参与者都没有上传图片，则删除该拼团队伍
			                if (participantsWithImages.length === 0) {
			                    await db.collection('group-booking').doc(item._id).remove();
			                    console.log(`拼团队伍 ${item._id} 被删除，因为没有参与者上传图片。`);
			                } else {
			                    // 移除没有上传图片的参与者
			                    const removedCount = item.participants.length - participantsWithImages.length;
			
			                    // 更新最大参与人数，确保不小于1
			                    let newMaxParticipants = item.max_participants;
			                    if (removedCount > 0) {
			                        newMaxParticipants = Math.max(item.max_participants - removedCount, 1);
			                    }
			
			                    // 更新拼团记录中的参与者和最大参与人数
			                    await db.collection('group-booking').doc(item._id).update({
			                        participants: participantsWithImages, // 更新后的参与人数组
			                        max_participants: newMaxParticipants // 更新最大参与人数
			                    });
			                }
			            });
			
			            // 等待所有更新操作完成
			            await Promise.all(updates);
			        }
			
			        console.log("拼团上传图片检查完毕");
			        uni.showToast({
			            title: '拼团图片检查完成',
			            icon: 'none'
			        });
			
			    } catch (error) {
			        console.error('拼团图片检查失败', error);
			        uni.showToast({
			            title: '拼团图片检查失败',
			            icon: 'none'
			        });
			    }
			},
			// 跳转我的拼团
			JumpmyGroupbooking() {
				uni.navigateTo({
					url: '/pages/myGroupbooking/myGroupbooking'
				})
			},
            			
			// 跳转到拼团管理
			JumpGruopBookingAdmin() {
				uni.navigateTo({
					url: '/pages/gruop-booking-admin/gruop-booking-admin'
				})
			},
			// 获取校区
			getCampus() {
				const that = this;
				uni.getStorage({
					key: 'selectedCampused',
					success(res) {
						console.log('res', res);
						that.campusName = res.data.school_name;
					},
					fail(e) {
						console.log('获取失败--', err);
					}
				})
			},

			// 跳转我的收藏
			JumpmyCollect() {
				uni.navigateTo({
					url: '/pages/mycollect/mycollect'
				})
			},
			// 跳转我的校区
			Jumpcampus() {
				uni.navigateTo({
					url: '/pages/campus/campus'
				})
			},
			// 跳转到简历编辑
			JumpQuestionnaireEditBox() {
				uni.navigateTo({
					url: '/pages/questionnaire-edit-box/questionnaire-edit-box'
				})
			},
			// 跳转到简历箱
			JumpQuestionnaireBox() {
				uni.navigateTo({
					url: '/pages/questionnaire-box/questionnaire-box'
				})
			},
			JumpCM() {
				uni.navigateTo({
					url: '/pages/classify-Info/list'
				})
			},
			// 联系我们
			JumpCo() {
				uni.navigateTo({
					url: '/uni_modules/uni-im/pages/chat/chat?user_id=' + "66cacb7bb5d950c810b3506d"
				})
			},
			login(e) {
				let options = {};
				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code;
				}
				this.$refs.uniFabLogin.login_before('weixin', true, options);
			},
			logout() {
				mutations.logout()
			},
			bindMobileSuccess() {
				mutations.updateUserInfo()
			},
			bindMobile() {
				// #ifdef APP-PLUS
				uni.preLogin({
					provider: 'univerify',
					success: this.univerify(), //预登录成功
					fail: (res) => { // 预登录失败
						// 不显示一键登录选项（或置灰）
						console.log(res)
						this.bindMobileBySmsCode()
					}
				})
				// #endif

				// #ifdef MP-WEIXIN
				this.$refs['bind-mobile-by-sms'].open()
				// #endif

				// #ifdef H5
				//...去用验证码绑定
				this.bindMobileBySmsCode()
				// #endif
			},
			univerify() {
				uni.login({
					"provider": 'univerify',
					"univerifyStyle": this.univerifyStyle,
					success: async e => {
						uniIdCo.bindMobileByUniverify(e.authResult).then(res => {
							mutations.updateUserInfo()
						}).catch(e => {
							console.log(e);
						}).finally(e => {
							// console.log(e);
							uni.closeAuthView()
						})
					},
					fail: (err) => {
						console.log(err);
						if (err.code == '30002' || err.code == '30001') {
							this.bindMobileBySmsCode()
						}
					}
				})
			},
			bindMobileBySmsCode() {
				uni.navigateTo({
					url: './bind-mobile/bind-mobile'
				})
			},
			setNickname(nickname) {
				if (nickname) {
					mutations.updateUserInfo({
						nickname
					})
					this.setNicknameIng = false
					this.$refs.dialog.close()
				} else {
					this.$refs.dialog.open()
				}
			},
			deactivate() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate"
				})
			},
			async bindThirdAccount(provider) {
				const uniIdCo = uniCloud.importObject("uni-id-co")
				const bindField = {
					weixin: 'wx_openid',
					alipay: 'ali_openid',
					apple: 'apple_openid',
					qq: 'qq_openid'
				} [provider.toLowerCase()]

				if (this.userInfo[bindField]) {
					await uniIdCo['unbind' + provider]()
					await mutations.updateUserInfo()
				} else {
					uni.login({
						provider: provider.toLowerCase(),
						onlyAuthorize: true,
						success: async e => {
							const res = await uniIdCo['bind' + provider]({
								code: e.code
							})
							if (res.errCode) {
								uni.showToast({
									title: res.errMsg || '绑定失败',
									duration: 3000
								})
							}
							await mutations.updateUserInfo()
						},
						fail: async (err) => {
							console.log(err);
							uni.hideLoading()
						}
					})
				}
			},
			subscribeMessage() {
				uni.requestSubscribeMessage({
					tmplIds: ["BZD93PWRNa9vxm4u0TRevKjMfdJV-njyZSv0wwWdBIw"],
					success: (e) => {
						console.log("e:", e)
						uni.showToast({
							title: "订阅成功",
							icon: "none"
						})
					}
				});
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		padding: 0;
		min-height: 100vh;
		background-color: #F6F6F6FF;
	}

	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	@media screen and (min-width: 690px) {
		.uni-content {
			padding: 0;
			max-width: 690px;
			margin-left: calc(50% - 345px);
			border: none;
			max-height: none;
			border-radius: 0;
			box-shadow: none;
		}
	}

	/* #endif */
	.avatar {
		position: relative;
		// align-items: center;
		// justify-content: center;
		// margin: 22px 0;
		width: 100%;
		height: 402rpx;

		image {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		text {
			position: absolute;
			left: 242rpx;
			top: 138rpx;
			z-index: 1;
			font-size: 36rpx;
			color: #FFFFFF;

		}
	}

	.nav-list {
		margin: 50rpx 24rpx 0 24rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.item {
		flex: 1;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}


	.button-box {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 20rpx;

	}

	.button-box button {
		border-radius: 15rpx;
		background-color: #FFFFFF;
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 26rpx;
	}

	.mt10 {
		margin-top: 10px;
	}
</style>