<template>
<view v-if="!msg.is_revoke" :class="{'self':currentUid == msg.from_uid}">
  <text
    v-if="readerList"
    class="read-state"
    :class="{'active-color':isGroupMsg && unreadUserList.length}"
    @click="showReaderList"
  >
    {{isGroupMsg ? unreadUserCountTip : (readerList.length?'已读':'未读') }}
  </text>
  
  <view
    v-if="showPopup && isGroupMsg"
    class="popup"
    @click="closePopup"
  >
    <view
      class="reader-list-box"
      :class="{'show':showTransition}"
      @click.stop
    >
      <text class="title">消息接收人列表</text>
      <uni-segmented-control
        v-if="!isWidescreen"
        :current="currentIndex"
        :values="[`未读(${memberUids.length - readerList.length})`, `已读(${readerList.length})`]"
        style-type="text"
        active-color="black"
        @clickItem="e => currentIndex = e.currentIndex"
      />
      <view class="content">
        <view v-if="isWidescreen || currentIndex == 0" class="reader-list">
          <text v-if="isWidescreen" class="title">
            {{ memberUids.length - readerList.length }}人未读
          </text>
          <scroll-view class="user-list" scroll-y>
            <view
              v-for="(item,index) in unreadUserList"
              :key="index"
              class="users"
            >
              <cloud-image
                :src=" item.avatar_file&&item.avatar_file.url||'/uni_modules/uni-im/static/avatarUrl.png'"
                mode="widthFix"
                width="36px"
                height="36px"
                border-radius="15px"
              />
              <text class="nickname">
                {{ item.nickname }}
              </text>
            </view>
          </scroll-view>
        </view>
        <view v-if="isWidescreen || currentIndex == 1" class="reader-list">
          <text v-if="isWidescreen" class="title">
            {{ readerList.length }}人已读
          </text>
          <scroll-view class="user-list" scroll-y>
            <view
              v-for="(item,index) in readerUserlist"
              :key="index"
              class="users"
            >
              <cloud-image
                :src=" item.avatar_file&&item.avatar_file.url||'/uni_modules/uni-im/static/avatarUrl.png'"
                mode="widthFix"
                width="36px"
                height="36px"
                border-radius="15px"
              />
              <text class="nickname">
                {{ item.nickname }}
              </text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</view>
</template>

<script>
import uniIm from '@/uni_modules/uni-im/sdk/index.js';
/**
 * uni-im-msg-reader 组件，实现“已读反馈”功能，可在消息列表中每条消息的下方显示已读信息。
 */
export default {
  name: 'UniImMsgReader',
  props: {
    msg: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showPopup: false,
      showTransition: false,
      conversation: {},
      currentIndex: 0,
    }
  },
  // 计算属性
  computed: {
    ...uniIm.mapState(['isWidescreen','systemInfo']),
    currentUid() {
      return uniCloud.getCurrentUserInfo().uid
    },
    memberUids() {
      const groupMember = this.conversation && this.conversation.group_member || {}
      // 成员uid不包含消息发送者
      return Object.keys(groupMember).filter(uid => uid != this.msg.from_uid)
    },
    unreadUserList() {
      const unreadUserList = this.memberUids.filter(item => !this.readerList.find(reader => reader.user_id == item))
      return unreadUserList.map(item => uniIm.users[item])
    },
    unreadUserCountTip() {
      let unreadUserCount = this.memberUids.length - this.readerList.length
      // 大于99人显示99+
      unreadUserCount = unreadUserCount > 99 ? '99+' : unreadUserCount
      return unreadUserCount > 0 ? `${unreadUserCount}人未读` : '全部已读'
    },
    isGroupMsg() {
      return !!this.msg.group_id
    },
    readerList() {
      return this.msg.reader_list || []
    },
    readerUserlist() {
      return this.readerList.map(item => uniIm.users[item.user_id])
    }
  },
  watch: {
    showPopup(state) {
      setTimeout(()=>{
        this.showTransition = state
      },0)
    }
  },
  mounted() {
    this.conversation = uniIm.conversation.dataList.find(conversation => conversation.id == this.msg.conversation_id)
  },
  methods: {
    showReaderList() {
      if (this.isGroupMsg) {
        // this.$refs.popup.open()
        this.showPopup = true
      }
    },
    closePopup() {
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .self {
    align-items: flex-end;
  }
  .read-state {
    font-size: 12px;
    flex-direction: row;
    color: #999;
    margin: 0 60px;
    width: 65px;
  }
  
  .self .read-state {
    text-align: right;
  }

  .active-color {
    color: #0b65ff;
  }

  /* #ifdef H5 */
  .active-color{
    cursor: pointer;
  }
  /* #endif */

  .reader-list-box {
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    /* 显示隐藏的过度动画 */
    transition: transform 0.1s,opacity 0.1s;
    transform: scale(0.7);
    opacity: 0;
  }
  .show {
    transform: scale(1);
    opacity: 1;
  }

  .reader-list-box>.title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    padding: 10px;
    background-color: #f5f5f5;
  }

  .reader-list-box .content {
    flex-direction: row;
    padding: 10px;
    width: 550rpx;
  }

  .reader-list {
    flex-direction: column;
    padding: 0 10px;
    flex: 1;
    /* #ifndef APP-NVUE */
    width: 50%;
    min-width: 260px;
    max-height: 80vh !important;
    /* #endif */
  }

  .reader-list .title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .reader-list .user-list {
    height: 750rpx;
  }
  
  /* #ifdef H5 */
  @media screen and (min-device-width:960px) {
    .reader-list:last-child {
      border-left: 1px solid #eee;
    }
    .reader-list .user-list {
      flex: 1;
    }
    .reader-list-box .content {
      width: auto;
    }
  }
  /* #endif */

  .reader-list .users {
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }
  .reader-list .users:last-child {
    margin-bottom: 0;
  }

  .reader-list .users .nickname {
    font-size: 16px;
    color: #333;
    margin-left: 6px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    /* #ifndef APP-NVUE */
    white-space: nowrap;
    /* #endif */
  }

  .popup {
    position: fixed;
    top: 0;
    left: 0;
    /* #ifdef APP-NVUE */
    width: 750rpx;
    bottom: 0;
    /* #endif */
    /* #ifndef APP-NVUE */
    z-index: 9999;
    width: 100%;
    height: 100%;
    /* #endif */
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>