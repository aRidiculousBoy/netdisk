<template>
  <div class="file-list-main">
    <div class="file-list-info">
      <div class="total-file">
        <el-checkbox :v-model="true" border>
          共{{ totalFileLength }}项
        </el-checkbox>
        <div class="toggle-view">
          <el-tooltip class="box-item" effect="dark" content="切换视图" placement="top">
            <img src="../../assets/svgs/toggle.svg" style="display: block; width: 24px; height: 24px"
              class="toggle-icon" />
          </el-tooltip>
        </div>
      </div>
    </div>
    <el-scrollbar :height="scrollHeight">
      <div class="file-list">
        <!-- folders -->
        <div v-for="folder in folders" :key="folder.folderId" class="file-list-item folder">
          <file :file-info="folder" :page-env="pageEnv" @resourceClick="fileClickHandler" @rename="renameFileUIHandler"
            @viewDetails="viewDetailsUIHandler" @remove="removeFileUIHandler" @recover="recoverFileHandler"
            @clean="removeFileUIHandler" />
        </div>
        <!-- files -->
        <div v-for="file in files" :key="file.fileId" class="file-list-item file">
          <file :file-info="file" :page-env="pageEnv" @resourceClick="fileClickHandler" @rename="renameFileUIHandler"
            @viewDetails="viewDetailsUIHandler" @remove="removeFileUIHandler" @recover="recoverFileHandler"
            @clean="removeFileUIHandler"></file>
        </div>
      </div>
      <el-empty v-if="!totalFileLength" description="文件夹中空空如也"></el-empty>
    </el-scrollbar>
    <div class="file-dialog">
      <el-dialog v-model="fileDialogVisible" :title="fileDialogTitle" width="26%" center append-to-body>
        <div :class="{ 'dialog-file-icon': true, 'use-bottom': useInputBottom }">
          <img v-if="fileType === 'folder'" src="../../assets/svgs/folder.svg" class="dialog-file-image"
            draggable="false" />
          <img v-if="fileType === '.txt'" src="../../assets/svgs/txt.svg" class="dialog-file-image" draggable="false" />
          <img v-else-if="fileType === '.jpg'" src="../../assets/svgs/jpg.svg" class="dialog-file-image"
            draggable="false" />
          <img v-else-if="fileType === '.png'" src="../../assets/svgs/png.svg" class="dialog-file-image"
            draggable="false" />
          <img v-else-if="fileType === '.mp4'" src="../../assets/svgs/mp4.svg" class="dialog-file-image"
            draggable="false" />
          <img v-else-if="fileType === '.pdf'" src="../../assets/svgs/pdf.svg" class="dialog-file-image"
            draggable="false" />
          <img v-else-if="fileType === '.mp3'" src="../../assets/svgs/mp3.svg" class="dialog-file-image"
            draggable="false" />
        </div>
        <el-input v-if="fileDialogTitle.indexOf('重命名') !== -1" v-model="useFileName" max="128" />
        <template #footer>
          <span class="dialog-footer">
            <div v-if="fileDialogTitle.indexOf('重命名') !== -1" class="button-group">
              <el-button @click="fileDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="renameFileHandler">确定</el-button>
            </div>
            <div v-else class="file-details">
              <el-descriptions title="详细信息" direction="vertical" :column="4" border>
                <el-descriptions-item label="文件名" :width="100">{{
                    detailFileName
                }}</el-descriptions-item>
                <el-descriptions-item label="文件大小" :width="72">{{
                    fileSize
                }}</el-descriptions-item>
                <el-descriptions-item label="创建时间" :width="108">
                  {{ createTime }}
                </el-descriptions-item>
                <el-descriptions-item label="文件类型" :width="80">
                  {{ fileType === 'folder' ? '文件夹' : fileType }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </span>
        </template>
      </el-dialog>
    </div>
    <div class="remove-file-dialog">
      <el-dialog v-model="removeFileDialogVisible" title="警告" width="24%" append-to-body>
        <span>{{
            isPhysical
              ? '删除的文件暂不支持找回，是否确认彻底删除?'
              : '你确定要将该文件夹/文件夹放入回收站吗?'
        }}
        </span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="removeFileDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="removeFileHandler">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

import File from '../File/File.vue'
import StatusBar from '@/components/StatusBar/StatusBar.vue'
import { useStore } from 'vuex'
import { fileNameFormat } from '@/utils/format.js'
import showMessage from '@/utils/show-message.js'
export default defineComponent({
  name: 'FileListMain',
  components: {
    File,
    StatusBar
  },
  props: {
    folders: {
      type: Array,
      default: () => []
    },
    files: {
      type: Array,
      default: () => []
    },
    totalFileLength: {
      type: Number,
      default: 0
    },
    pageEnv: {
      type: String,
      required: true
    }
  },
  emits: ['onFileClick'],
  setup(props, { emit }) {
    const store = useStore()
    const fileDialogVisible = ref(false)
    const removeFileDialogVisible = ref(false)
    const fileDialogTitle = ref('')
    const useFileName = ref('')
    const detailFileName = ref('')
    const fileType = ref('')
    const fileSize = ref('')
    const createTime = ref('')
    const useInputBottom = ref(false)
    const key = ref('')
    const isPhysical = ref(false)
    const scrollHeight = 776
    const fileClickHandler = (payload) => {
      emit('onFileClick', payload)
    }
    const renameFileUIHandler = (payload) => {
      key.value = payload.id
      useFileName.value = payload.rawName
      fileType.value = payload.type
      fileDialogTitle.value = '重命名'
      useInputBottom.value = true
      fileDialogVisible.value = true
    }
    const viewDetailsUIHandler = (payload) => {
      useFileName.value = payload.fileName
      fileType.value = payload.type
      fileSize.value = payload.fileSize
      createTime.value = payload.createTime
      fileDialogTitle.value = useFileName.value
      detailFileName.value =
        useFileName.value.length > 12
          ? fileNameFormat(useFileName.value)
          : useFileName.value
      useInputBottom.value = false
      fileDialogVisible.value = true
    }
    const removeFileUIHandler = (payload) => {
      fileType.value = payload.type
      key.value = payload.id
      isPhysical.value = payload.isPhysical
      removeFileDialogVisible.value = true
    }

    const renameFileHandler = () => {
      fileDialogVisible.value = false
      if (fileType.value === 'folder') {
        if (!useFileName.value) {
          return showMessage({
            type: 'error',
            message: '文件夹名不能为空'
          })
        }
        store.dispatch('file/renameFolderAction', {
          folderId: key.value,
          newFolderName: useFileName.value
        })
      } else {
        if (!useFileName.value) {
          return showMessage({
            type: 'error',
            message: '文件名不能为空'
          })
        }
        store.dispatch('file/renameFileAction', {
          fileId: key.value,
          newFileName: useFileName.value
        })
      }
    }

    const removeFileHandler = () => {
      removeFileDialogVisible.value = false
      if (fileType.value === 'folder') {
        store.dispatch('file/removeFolderAction', {
          folderId: key.value,
          isPhysical: isPhysical.value
        })
      } else {
        store.dispatch('file/removeFileAction', {
          fileId: key.value,
          isPhysical: isPhysical.value
        })
      }
    }

    const recoverFileHandler = (payload) => {
      if (payload.type === 'folder') {
        store.dispatch('file/recoverFolderAction', payload.id)
      } else {
        store.dispatch('file/recoverFileAction', payload.id)
      }
    }
    return {
      scrollHeight,
      fileDialogVisible,
      removeFileDialogVisible,
      fileDialogTitle,
      useFileName,
      detailFileName,
      fileType,
      fileSize,
      createTime,
      isPhysical,
      useInputBottom,
      fileClickHandler,
      renameFileUIHandler,
      viewDetailsUIHandler,
      removeFileUIHandler,
      renameFileHandler,
      removeFileHandler,
      recoverFileHandler
    }
  }
})
</script>

<style scoped lang="less">
.file-list-info {
  height: 48px;
  margin-right: 52px;
}

&:deep(.el-radio__label) {
  font-size: 12px !important;
}

.total-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-view {
  .toggle-icon {
    box-sizing: border-box;
    margin-right: 24px;
    cursor: pointer;

    &:hover {
      background-color: rgb(227, 227, 229);
      border-radius: 4px;
    }
  }
}

&:deep(.el-checkbox__label) {
  font-size: 12px;
}

&:deep(.el-checkbox__input) {
  border-radius: 20px !important;
}

.dialog-file-icon {
  display: flex;
  justify-content: center;
}

.file-list {
  display: flex;
  flex-wrap: wrap;

  .file-list-item {
    display: flex;
    justify-content: center;
  }
}

.use-bottom {
  margin-bottom: 24px;
}

.dialog-file-image {
  display: block;
  width: 108px;
  height: 102px;
  padding-bottom: 12px;
}
</style>
