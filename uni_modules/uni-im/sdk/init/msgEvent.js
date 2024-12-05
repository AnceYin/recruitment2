import $utils from '@/uni_modules/uni-im/sdk/utils/index.js';
import $extensions from '@/uni_modules/uni-im/sdk/methods/extensions.js';
import $state from '../state/index.js';
// #ifdef H5
import EasyWebNotification from './EasyWebNotification';
const easyWebNotification = new EasyWebNotification();
// #endif
// nvue下页面之间数据是隔离的需要挂载到$state上
$state.ext.onMsgFnList = []
const msgEvent = {
  emitMsg(res) {
    if ($state.isDisabled) {
      return console.log('uniIm isDisabled')
    }
    if (res.data.payload.device_id == $state.systemInfo.deviceId) {
      return console.log('当前设备发的消息，不用接收；忽略');
    }
    $state.ext.onMsgFnList.forEach(fn => {
      fn(res)
    })
  },
  onMsg(res) {
    $state.ext.onMsgFnList.push(res)
  },
  offMsg(fn) {
    $state.ext.onMsgFnList = $state.ext.onMsgFnList.filter(item => item != fn)
  }
}

export default msgEvent;

// 默认注册了一个监听收到im消息后的事件
msgEvent.onMsg(async res=>{
    // console.log('收到im消息', res);
    const {
      payload
    } = res.data;
    const msg = payload.data
    // console.log({msg});
    // 超长文本传输时的id
    if (msg.LongMsg) {
      const db = uniCloud.database();
      let res = await db.collection('uni-im-msg')
        .where({
          "_id": msg._id,
          "conversation_id": msg.conversation_id // conversation_id 必传否则会被触发器拦截
        })
        .get()
      // console.log(res);
      if (res.result.errCode == 0) {
        payload.data.body = res.result.data[0].body
      } else {
        console.error('超长文本类型消息查库失败', msg._id);
      }
    }
    // console.log('payload------', payload.device_id, $state.systemInfo.deviceId);
    // console.log(777);
    const {
      conversation_id,
      group_id
    } = msg
    // console.log('msgmsgmsgmsgmsg.msg',msg);
    // 拿到收到消息的会话对象
    let conversation = $state.conversation.getCached(conversation_id)
    let isNewCreateConversation = false
    if (!conversation) {
      isNewCreateConversation = true
      conversation = await $state.conversation.get(conversation_id)
    }
    
    // 处理其他设备已读某会话的情况
    if (msg.type == 'clear-conversation-unreadCount') {
      if (conversation.update_time < msg.create_time) {
        conversation.update_time = msg.create_time
        conversation.unread_count = 0
        // 同时去掉通知栏消息
        // #ifdef H5
        //关闭所有通知栏
        easyWebNotification.closeAllNotification()
        easyWebNotification.recoverTitle()
        // #endif
        
        // #ifdef APP
        //清理系统通知栏消息和app角标
        plus.push.clear()
        plus.runtime.setBadgeNumber(0)
        // #endif
        
      }
      // 阻止后续动作
      return
    }
    const isReadableMsg = $utils.isReadableMsg(msg)
    const isMuteMsg = $utils.isMuteMsg(msg)
    const canCreateNotification = isReadableMsg && 
                                  // 会话不是免打扰的
                                  !conversation.mute &&
                                  // 消息不是系统配置了免打扰的
                                  !isMuteMsg &&
                                  // 不是自己发的消息
                                  msg.from_uid != uniCloud.getCurrentUserInfo().uid
    // 判断并创建通知栏消息
    // #ifdef H5
    if (canCreateNotification) {
      if (!$state.ext.appIsActive) {
        easyWebNotification.create({
          "title": payload.title + "：" + payload.content,
          "option": {
            conversation_id,
            "icon": payload.avatar_file ? payload.avatar_file.url :
              'https://web-assets.dcloud.net.cn/unidoc/zh/uni.png'
          }
        })
      }

      // 调用扩展程序告知有新消息到达
      $extensions.invokeExts('ui-new-message')
    }
    // #endif
    
    /**
     * 排除会话中已包含此消息的情况
     */
    let msgList = conversation.msgList
    if (!msgList.find(item => item._id == msg._id)) {
      msgList.push(msg)
      if (
        // 不是正在对话的会话，且不是自己发的消息，就给会话的未读消息数+1
        $state.currentConversationId != msg.conversation_id &&
        // 为可读消息
        isReadableMsg &&
        // 消息不是系统配置了免打扰的
        !isMuteMsg &&
        msg.from_uid != uniCloud.getCurrentUserInfo().uid &&
        // 新创建的会话直接读取云端的未读消息数，本地不需要 ++
        !isNewCreateConversation
      ) {
        conversation.unread_count++
      }
    }
    // 如果socket已经关闭的情况下收到消息，说明消息来源浏览器页签之间通讯 不需要重复存库
    if (!$state.socketIsClose) {
      conversation.msgManager.localMsg.add(msg)
    }
    
    // #ifdef APP
    // console.log('notification type=>',res.type);
    if (res.type == 'click'){
      let currentPages = getCurrentPages()
      let topViewRoute = currentPages[currentPages.length - 1].route
      // console.log('topViewRoute',topViewRoute);
      if (topViewRoute == 'uni_modules/uni-im/pages/chat/chat') {
        uni.redirectTo({
          url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + msg.conversation_id,
          complete(e) {
            console.log(e);
          }
        })
      } else {
        uni.navigateTo({
          url: '/uni_modules/uni-im/pages/chat/chat?conversation_id=' + msg.conversation_id,
          complete(e) {
            console.log(e);
          }
        })
      }
    }else{
      let currentPages = getCurrentPages()
      let topViewRoute = currentPages[currentPages.length - 1].route
      // console.log('topViewRoute',topViewRoute);
      let pathList = [
        'uni_modules/uni-im/pages/chat/chat',
        'uni_modules/uni-im/pages/index/index',
        'uni_modules/uni-im/pages/userList/userList',
        'uni_modules/uni-im/pages/contacts/contacts'
      ]
      if (canCreateNotification && !$state.ext.appIsActive || !pathList.includes(topViewRoute)) {
        // console.log('payload',payload);
        let {
          content,
          data,
          title,
          avatar_file
        } = payload
        let url = avatar_file ? avatar_file.url : ''
        let icon = '_www/uni_modules/uni-im/static/avatarUrl.png'
        //安卓才有头像功能，再执行下载
        if ($state.systemInfo.platform == "android") {
          if (avatar_file) {
            let downloadFileRes = await uni.downloadFile({
              url: avatar_file.url
            });
            icon = downloadFileRes[1]?.tempFilePath
          }
        }
        plus.push.createMessage(content, payload, {
          title,
          icon
        })
      } else if (conversation_id != $state.currentConversationId) {
        // uni.showToast({
        // 	title: '收到新消息请注意查看',
        // 	icon: 'none'
        // });
      }
    }
    // #endif
})