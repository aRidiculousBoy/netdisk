<template>
  <div draggable="true" :class="{ file: true, 'use-high-light': useHighLight }" @click="fileClickHandler"
    @contextmenu.prevent="contextMenuHandler" @dragstart="fileDragStartHandler" @dragover="fileDragOverHandler"
    @dragleave="fileDragLeaveHandler" @drop.prevent="fileDropHandler">
    <div class="file-icon">
      <img v-if="fileInfo.folderId" src="../../assets/svgs/folder.svg"
        style="display: block; width: 108px; height: 102px" />
      <img v-if="fileInfo.fileType === '.txt'" src="../../assets/svgs/txt.svg"
        style="display: block; width: 108px; height: 102px" />
      <img v-if="fileInfo.fileType === '.jpg'" src="../../assets/svgs/jpg.svg"
        style="display: block; width: 108px; height: 102px" />
      <img v-if="fileInfo.fileType === '.mp4'" src="../../assets/svgs/mp4.svg"
        style="display: block; width: 108px; height: 102px" />
      <img v-if="fileInfo.fileType === '.png'" src="../../assets/svgs/png.svg"
        style="display: block; width: 108px; height: 102px" draggable="false" />
      <img v-if="fileInfo.fileType === '.pdf'" src="../../assets/svgs/pdf.svg"
        style="display: block; width: 108px; height: 102px" draggable="false" />
      <img v-if="fileInfo.fileType === '.mp3'" src="../../assets/svgs/mp3.svg"
        style="display: block; width: 108px; height: 102px" draggable="false" />
    </div>
    <div class="file-info">
      <div class="file-name">
        {{ useFileName }}
      </div>
      <div class="file-created-time">{{ fileInfo.createTime || fileInfo.deleteTime || '未知' }}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, shallowRef, watch } from 'vue'
import { menusEvent } from 'vue3-menus'
import { fileSizeFormat, fileNameFormat } from '@/utils/format.js'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'File',
  props: {
    // 该属性方便后面对文件进行封装 不用专门为每个类型写组件
    fileInfo: {
      type: Object,
      required: true
    },
    pageEnv: {
      type: String,
      required: true
    }
  },
  emits: ['resourceClick', 'rename', 'viewDetails', 'remove', 'recover'],
  setup(props, { emit }) {
    const store = useStore()
    const file = props.fileInfo
    const useHighLight = ref(false)
    const isFolder = !!file.folderId
    const rawName = isFolder ? ref(file.folderName) : ref(file.fileName)
    const useFileName = isFolder ? ref(file.folderName) : ref(file.fileName)
    watch(
      () => (isFolder ? file.folderName : file.fileName),
      () => {
        useFileName.value = isFolder ? file.folderName : file.fileName
      }
    )
    // 获取文件本来的名称

    if (useFileName.value?.length > 12) {
      useFileName.value = fileNameFormat(useFileName.value)
    }
    const fileClickHandler = () => {
      if (isFolder) {
        emit('resourceClick', {
          folderId: file.folderId
        })
      } else {
        emit('resourceClick', {
          fileId: file.fileId
        })
      }
    }
    const fileDragStartHandler = (e) => {
      e.dataTransfer.setData('sourceFileId', file.id || file.folderId)
      e.dataTransfer.setData('sourceFileType', isFolder ? 'folder' : 'file')
      e.dataTransfer.setData('sourceFileName', rawName.value)
    }
    const fileDragOverHandler = (e) => {
      if (isFolder) {
        useHighLight.value = true
        e.preventDefault()
      }
    }
    const fileDragLeaveHandler = (e) => {
      useHighLight.value = false
    }
    const fileDropHandler = (e) => {
      useHighLight.value = false
      const sourceFileId = e.dataTransfer.getData('sourceFileId')
      const sourceFileType = e.dataTransfer.getData('sourceFileType')
      const sourceFileName = e.dataTransfer.getData('sourceFileName')
      console.log('sourceFileId =>', sourceFileId)
      console.log('currentFileId =>', file.id || file.folderId)
      console.log('sourceFileType =>', sourceFileType)
      console.log('sourceFileName =>', sourceFileName)
      console.log('执行拖拽逻辑')
      if (isFolder) {
        if (sourceFileId === file.folderId + '') {
          return
        }
        if (sourceFileType === 'folder') {
          // console.log('移动对象是文件夹')
          store.dispatch('file/moveFolderAction', {
            folderId: sourceFileId,
            folderName: sourceFileName,
            parentId: file.folderId
          })
        } else {
          // console.log('移动对象是文件')
          store.dispatch('file/moveFileAction', {
            fileId: sourceFileId,
            fileName: sourceFileName,
            parentId: file.folderId
          })
        }
      } else {
        useHighLight.value = false
      }
    }
    const menus = props.pageEnv === 'filelist' ? shallowRef([
      {
        label: '下载',
        style: {
          width: '168px',
          height: '40px'
        },
        click: () => {
          store.dispatch('file/downLoadFileAction', {
            isFolder,
            fileId: isFolder ? file.folderId : file.fileId,
            fileName: file.fileName
          })
        }
      },
      {
        label: '分享',
        style: {
          width: '168px',
          height: '40px'
        }
      },
      {
        label: '收藏',
        divided: true,
        style: {
          width: '168px',
          height: '40px'
        }
      },
      {
        label: '重命名',
        style: {
          width: '168px',
          height: '40px'
        },
        click: () => {
          // elDialogTitle.value = isFolder ? '重命名文件夹' : '重命名文件'
          // useBottom.value = true
          // fileDialogVisible.value = true
          emit('rename', {
            type: isFolder ? 'folder' : file.fileType,
            rawName: isFolder ? file.folderName : file.fileName,
            id: file.id || file.folderId
          })
        }
      },
      {
        label: '移动',
        style: {
          width: '168px',
          height: '40px'
        }
      },
      {
        label: '查看详细信息',
        divided: true,
        style: {
          width: '168px',
          height: '40px'
        },
        click: () => {
          emit('viewDetails', {
            fileSize: isFolder ? '' : fileSizeFormat(file.fileSize),
            fileName: file.fileName ? file.fileName : file.folderName,
            createTime: file.createTime,
            type: file.fileType || 'folder'
          })
        }
      },
      {
        label: '移动到回收站',
        style: {
          color: '#F56C6C',
          height: '40px'
        },
        click: () => {
          emit('remove', {
            type: isFolder ? 'folder' : file.fileType,
            id: file.id || file.folderId,
            isPhysical: false
          })
        }
      }
    ]) : shallowRef([
      {
        label: '恢复',
        style: {
          width: '168px',
          height: '40px'
        },
        click: () => {
          emit('recover', {
            type: isFolder ? 'folder' : file.fileType,
            id: file.fileId || file.folderId
          })
        }
      },
      {
        label: '彻底删除',
        style: {
          width: '168px',
          height: '44px',
          color: '#F56C6C'
        },
        click: () => {
          emit('remove', {
            type: isFolder ? 'folder' : file.fileType,
            id: file.fileId || file.folderId,
            isPhysical: true
          })
        }
      }
    ])
    const contextMenuHandler = (e) => {
      menusEvent(e, menus.value)
    }

    return {
      useFileName,
      useHighLight,
      fileClickHandler,
      fileDragStartHandler,
      fileDragOverHandler,
      fileDragLeaveHandler,
      fileDropHandler,
      contextMenuHandler
    }
  }
})
</script>

<style scoped lang="less">
.file {
  width: 102px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 12px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 12px;

  &:hover {
    cursor: pointer;
    background-color: rgba(132, 133, 141, 0.08);
    border-radius: 12px;
    transition: 0.3s all linear;
  }

  .file-info {
    margin-top: 8px;

    .file-name {
      font-size: 14px;
      font-weight: 700;
    }

    .file-created-time {
      font-size: 12px;
      color: rgba(37, 38, 43, 0.36);
      margin-top: 4px;
    }
  }
}

.dialog-file-icon {
  display: flex;
  justify-content: center;
}

.use-high-light {
  cursor: pointer;
  background-color: rgba(132, 133, 141, 0.08);
  border-radius: 12px;
}
</style>
