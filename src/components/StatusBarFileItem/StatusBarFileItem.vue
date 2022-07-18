<template>
  <div class="status-bar-file-item">
    <div class="file-info">
      <img
        src="../../assets/svgs/png.svg"
        style="display: block; width: 44px; height: 36px"
        draggable="false"
        class="file-cover"
      />
      <div class="file-name">{{ useFilename }}</div>
    </div>
    <div class="file-progress">
      <el-progress
        :percentage="percentage"
        :stroke-width="14"
        :text-inside="true"
      >
      </el-progress>
    </div>
    <div class="button-group">
      <el-tooltip
        v-if="!isFinished"
        effect="dark"
        content="取消上传"
        placement="top"
      >
        <el-button size="small" circle @click="cancelFileUploadHandler">
          <el-icon :size="16">
            <close />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip
        v-if="!isFinished"
        effect="dark"
        :content="isUploading ? '暂停上传' : '继续上传'"
        placement="top"
      >
        <el-button
          v-if="isUploading"
          size="small"
          circle
          @click="pauseFileUploadHandler"
        >
          <el-icon :size="16">
            <img
              src="../../assets/svgs/pause.svg"
              style="display: block; width: 22px; height: 24px"
              draggable="false"
            />
          </el-icon>
        </el-button>
        <el-button
          v-else
          size="small"
          circle
          @click="continueFileUploadHandler"
        >
          <el-icon :size="16">
            <refresh-right />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed, onUnmounted } from 'vue'
import { Close, RefreshRight } from '@element-plus/icons-vue'
import { fileNameFormat } from '@/utils/format.js'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'StatusBarFileItem',
  components: {
    Close,
    RefreshRight
  },
  props: {
    fileInfo: {
      type: Object,
      required: true
    }
  },
  emits: ['cancelFileUpload'],
  setup(props, { emit }) {
    const store = useStore()
    // 获取文件在上传列表中的索引
    const fileIndex = store.state.file.fileList.indexOf(props.fileInfo)
    console.log('file index', fileIndex)

    const percentage = ref(0)
    const isUploading = computed(
      () => store.state.file.fileList[fileIndex].isUploading
    )
    const isFinished = computed(
      () => store.state.file.fileList[fileIndex].isFinished
    )
    const stopWatch = watch(
      () => store.state.file.fileList[fileIndex].percentage,
      () => {
        percentage.value = store.state.file.fileList[fileIndex].percentage
      }
    )
    const filename = props.fileInfo.filename
    let useFilename = filename
    if (useFilename.length > 14) {
      useFilename = fileNameFormat(filename, 0, 9, 12)
    }

    const pauseFileUploadHandler = () => {
      store.dispatch('file/pauseSingleFileUploadAction', fileIndex)
    }
    const continueFileUploadHandler = () => {
      store.dispatch('file/continueSingleFileUploadAction', fileIndex)
    }

    const cancelFileUploadHandler = () => {
      emit('cancelFileUpload', {
        fileIndex,
        fileName: filename,
        stopWatch
      })
    }
    onUnmounted(() => {
      stopWatch()
    })
    return {
      useFilename,
      percentage,
      isUploading,
      isFinished,
      pauseFileUploadHandler,
      continueFileUploadHandler,
      cancelFileUploadHandler
    }
  }
})
</script>

<style scoped lang="less">
.status-bar-file-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  height: 72px;
  padding: 4px;
  &:hover {
    background-color: #dcdfe6;
  }
  .file-info {
    width: 96px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .file-name {
      font-size: 12px;
      text-align: center;
      color: rgba(37, 38, 43, 0.36);
    }
  }
  .file-progress {
    flex: 2.77777;
  }
  .button-group {
    flex: 1;
    margin-left: 16px;
  }
}
</style>
