<template>
  <view class="container">
    <unicloud-db ref="udb" v-slot:default="{data, loading, error, options}" :options="options" :collection="collectionList" field="cover,png_list,body" :where="queryWhere" :getone="true" :manual="true">
      <view v-if="error">{{error.message}}</view>
      <view v-else-if="loading">
        <uni-load-more :contentText="loadMore" status="loading"></uni-load-more>
      </view>
      <view v-else-if="data">
        <view>
          <text>封面</text>
          <uni-file-picker v-if="data.cover && data.cover.fileType == 'image'" :value="data.cover" :file-mediatype="data.cover && data.cover.fileType" return-type="object" readonly></uni-file-picker>
          <uni-link v-else-if="data.cover" :href="data.cover.url" :text="data.cover.url"></uni-link>
          <text v-else></text>
        </view>
        <view>
          <text>照片数组</text>
          <template v-for="(file, j) in data.png_list">
            <uni-file-picker v-if="file.fileType == 'image'" :value="file" :file-mediatype="file.fileType" return-type="object" readonly></uni-file-picker>
            <uni-link v-else :href="file.url" :text="file.url"></uni-link>
          </template>
        </view>
        <view>
          <text>正文</text>
          <template v-for="(file, j) in data.body">
            <uni-file-picker v-if="file.fileType == 'image'" :value="file" :file-mediatype="file.fileType" return-type="object" readonly></uni-file-picker>
            <uni-link v-else :href="file.url" :text="file.url"></uni-link>
          </template>
        </view>
      </view>
    </unicloud-db>
    <view class="btns">
      <button type="primary" @click="handleUpdate">修改</button>
    </view>
  </view>
</template>

<script>
  // 由schema2code生成，包含校验规则和enum静态数据
  import { enumConverter } from '../../js_sdk/validator/classify-Info.js'
  const db = uniCloud.database()

  export default {
    data() {
      return {
        queryWhere: '',
        collectionList: "classify-Info",
        loadMore: {
          contentdown: '',
          contentrefresh: '',
          contentnomore: ''
        },
        options: {
          // 将scheme enum 属性静态数据中的value转成text
          ...enumConverter
        }
      }
    },
    onLoad(e) {
      this._id = e.id
    },
    onReady() {
      if (this._id) {
        this.queryWhere = '_id=="' + this._id + '"'
      }
    },
    methods: {
      handleUpdate() {
        // 打开修改页面
        uni.navigateTo({
          url: './edit?id=' + this._id,
          events: {
            // 监听修改页面成功修改数据后, 刷新当前页面数据
            refreshData: () => {
              this.$refs.udb.loadData({
                clear: true
              })
            }
          }
        })
      }
    }
  }
</script>

<style>
  .container {
    padding: 10px;
  }

  .btns {
    margin-top: 10px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
  }

  .btns button {
    flex: 1;
  }

</style>
