<template>
  <div class="upload">
    <el-dropdown @command="handleCommand">
      <el-button type="primary" class="add-file-button"> + </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-upload
            ref="uploadRef"
            action="http://www.pornhub.com"
            multiple
            :show-file-list="false"
            :accept="accept"
            :http-request="uploadFile"
            with-credentials
          >
            <el-dropdown-item command="上传文件">
              <img
                src="../../assets/svgs/fileupload.svg"
                style="display: block; width: 24px; height: 22px"
                class="dropdown-item-icon"
              />
              上传文件
            </el-dropdown-item>
            <el-dropdown-item command="上传Office">
              <img
                src="../../assets/svgs/document.svg"
                style="display: block; width: 24px; height: 22px"
                class="dropdown-item-icon"
              />
              上传Office
            </el-dropdown-item>
            <el-dropdown-item command="上传照片">
              <img
                src="../../assets/svgs/pic.svg"
                style="display: block; width: 24px; height: 22px"
                class="dropdown-item-icon"
              />
              上传照片
            </el-dropdown-item>
            <el-dropdown-item command="上传视频">
              <img
                src="../../assets/svgs/video.svg"
                style="display: block; width: 24px; height: 22px"
                class="dropdown-item-icon"
              />
              上传视频
            </el-dropdown-item>
          </el-upload>
          <el-dropdown-item command="新建文件夹">
            <img
              src="../../assets/svgs/newfolder.svg"
              style="display: block; width: 24px; height: 22px"
              class="dropdown-item-icon"
            />
            新建文件夹
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- 新建文件夹的对话框 -->
    <div class="new-folder-dialog">
      <el-dialog
        v-model="newFolderDialogVisible"
        title="新建文件夹"
        width="26%"
        center
        @close="newFolderDialogCloseHandler"
      >
        <div>
          <img
            src="../../assets/svgs/folder.svg"
            style="
              display: block;
              width: 96px;
              height: 108px;
              margin-bottom: 16px;
            "
            draggable="false"
          />
        </div>
        <el-input v-model="newFolderName" placeholder="文件夹名" max="128" />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="newFolderDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="newFolderHandler">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <div class="name-conflict-dialog">
      <el-dialog
        v-model="conflictDialogVisible"
        title="检测到同名文件"
        width="28%"
      >
        <span>文件：{{ conflictFileName }}已存在，是否需要继续？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="conflictDialogVisible = false">跳过</el-button>
            <el-button type="primary" @click="keepBothHandler"
              >保留两者</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watchEffect } from 'vue'
import { DocumentAdd } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'Upload',
  components: {
    DocumentAdd
  },
  props: {},
  setup() {
    const store = useStore()
    const files = ref([])
    watchEffect(() => {
      files.value = store.state.file.currentFileList.files
    })
    const accept = ref(null)
    const newFolderDialogVisible = ref(false)
    const conflictDialogVisible = ref(false)
    const conflictFileName = ref(null)
    const newFolderName = ref('')

    const newFolderDialogCloseHandler = () => {
      newFolderName.value = ''
    }
    const newFolderHandler = () => {
      newFolderDialogVisible.value = false
      store.dispatch('file/newFolderAction', newFolderName.value)
    }

    const uploadFile = async (data) => {
      const { file } = data
      const isDulplicate = files.value.some(
        (item) => item.fileName === file.name
      )

      if (isDulplicate) {
        conflictFileName.value = file.name
        conflictDialogVisible.value = true
      }
      store.dispatch('file/uploadFileAction', {
        file,
        isDulplicate,
        isImmediate: !isDulplicate
      })
    }
    // 根据用户点击响应对应类型的文件
    const handleCommand = (item) => {
      if (item === '上传文件') {
        accept.value = '*'
      }

      if (item === '上传Office') {
        accept.value = '.xls,.xlsx,.doc,.docx,.pdf,.ppt'
      }

      if (item === '新建文件夹') {
        console.log('新建文件夹的逻辑')
        newFolderDialogVisible.value = true
      }

      if (item === '上传照片') {
        accept.value = 'image/*'
      }

      if (item === '上传视频') {
        accept.value = 'audio/*,video/*'
      }
    }

    const keepBothHandler = () => {
      conflictDialogVisible.value = false
      store.dispatch('file/uploadFileAction', {
        file: null,
        isDulplicate: true,
        isImmediate: true
      })
    }
    return {
      accept,
      uploadFile,
      newFolderDialogVisible,
      conflictDialogVisible,
      newFolderName,
      conflictFileName,
      newFolderDialogCloseHandler,
      handleCommand,
      newFolderHandler,
      keepBothHandler,
      DocumentAdd
    }
  }
})
</script>

<style scoped lang="less">
.dropdown-item-icon {
  margin-right: 4px;
}

.add-file-button {
  font-size: 22px;
}

.new-folder-dialog {
  &:deep(.el-dialog__body) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
