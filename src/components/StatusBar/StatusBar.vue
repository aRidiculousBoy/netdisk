<template>
  <div class="status-bar">
    <el-collapse>
      <el-collapse-item name="1">
        <template #title>
          <img
            src="../../assets/svgs/fileupload.svg"
            style="display: block; width: 28px; height: 28px"
            class="upload-icon"
          />
          <div class="list-info">动态信息</div>
          <div class="button-group">
            <el-tooltip effect="dark" content="全部取消" placement="top">
              <el-button size="small" circle @click="onAllCancelButtonClicked">
                <el-icon :size="16">
                  <close />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              :content="isUploading ? '全部暂停' : '全部继续'"
              placement="top"
            >
              <el-button
                v-if="isUploading"
                size="small"
                circle
                @click="allPauseHandler"
              >
                <el-icon :size="16">
                  <img
                    src="../../assets/svgs/pause.svg"
                    style="display: block; width: 22px; height: 24px"
                    draggable="false"
                  />
                </el-icon>
              </el-button>
              <el-button v-else size="small" circle @click="allContinueHandler">
                <el-icon :size="16">
                  <refresh-right />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
        <div class="status-bar-item-group">
          <status-bar-file-item
            v-for="file in fileList"
            :key="file.hash"
            :file-info="file"
            @cancelFileUpload="onItemCancelButtonClicked"
          ></status-bar-file-item>
        </div>
        <div class="no-more">没有更多了</div>
      </el-collapse-item>
    </el-collapse>
    <div class="cancel-file-upload-dialog">
      <el-dialog
        v-model="cancelUploadDialogVisibile"
        title="警告"
        width="24%"
        append-to-body
      >
        <span>确定要取消文件{{ fname }}的上传吗</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelUploadDialogVisibile = false"
              >取消</el-button
            >
            <el-button type="primary" @click="cancelFileUploadHandler"
              >确定</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
    <div class="cancel-all-file-upload-dialog">
      <el-dialog
        v-model="cancelAllUploadDialogVisibile"
        title="全部取消上传"
        width="24%"
        append-to-body
      >
        <span>上传列表中存在上传未完成状态的文件,确定放弃上传吗?</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelAllUploadDialogVisibile = false"
              >取消</el-button
            >
            <el-button type="danger" @click="cancelAllFileUploadHandler"
              >全部取消上传</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onUnmounted } from 'vue'
import StatusBarFileItem from '@/components/StatusBarFileItem/StatusBarFileItem.vue'
import { useStore } from 'vuex'
import { Close, RefreshRight } from '@element-plus/icons-vue'
export default defineComponent({
  name: 'StatusBar',
  components: { StatusBarFileItem, Close, RefreshRight },
  setup() {
    const store = useStore()
    const fileList = computed(() => store.state.file.fileList)
    const isUploading = computed(() =>
      store.state.file.fileList.some((item) => item.isUploading)
    )
    const cancelUploadDialogVisibile = ref(false)
    const cancelAllUploadDialogVisibile = ref(false)
    const fname = ref('')
    const index = ref(null)
    const stopFn = ref(null)
    const onItemCancelButtonClicked = ({ fileIndex, fileName, stopWatch }) => {
      // 收集信息
      index.value = fileIndex
      fname.value = fileName
      cancelUploadDialogVisibile.value = true
      stopFn.value = stopWatch
    }

    const onAllCancelButtonClicked = (e) => {
      e.stopPropagation()
      cancelAllUploadDialogVisibile.value = true
    }
    const cancelFileUploadHandler = () => {
      stopFn.value()
      store.dispatch('file/cancelSingleFileUploadAction', index.value)
    }

    const cancelAllFileUploadHandler = () => {
      cancelAllUploadDialogVisibile.value = false
      store.state.file.watchs.forEach(({ stopWatch }) => stopWatch())
      store.dispatch('file/cancelAllFileUploadAction')
    }

    const allContinueHandler = (e) => {
      e.stopPropagation()
      store.dispatch('file/continueAllFileUploadAction')
      console.log('patch store trigger allFileContinueAction')
    }

    const allPauseHandler = (e) => {
      e.stopPropagation()
      console.log('all pause')
      store.dispatch('file/pauseAllFileUploadAction')
    }

    onUnmounted(() => {
      store.dispatch('file/pauseAllFileUploadAction')
      store.commit('file/CHANGE_FILELIST', {
        type: 'clear'
      })
    })
    return {
      cancelUploadDialogVisibile,
      cancelAllUploadDialogVisibile,
      onItemCancelButtonClicked,
      onAllCancelButtonClicked,
      cancelFileUploadHandler,
      cancelAllFileUploadHandler,
      allPauseHandler,
      allContinueHandler,
      fileList,
      isUploading,
      fname
    }
  }
})
</script>

<style scoped lang="less">
/deep/.el-collapse-item__header {
  height: 44px;
  .upload-icon {
    flex: 2;
  }
  .list-info {
    flex: 5;
  }
  .button-group {
    flex: 2;
  }
}

.no-more {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 24px;
}
</style>
