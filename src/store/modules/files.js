// 用于存储由文件相关操作产生的状态以实现组件状态之间的共享
import {
  uploadChunks,
  createFolder,
  createChunks,
  calculateHash
} from '@/hooks/useFileUpload.js'
import {
  getUserFileRequest,
  renameFileRequest,
  renameFolderRequest,
  queryProgressRequest,
  removeFileRequest,
  removeFolderRequest,
  downloadFileRequest,
  cancelUploadReqeust,
  getBinRequest,
  recoverFolderRequest,
  recoverFileRequest
} from '@/service/file-api.js'
import showMessage from '@/utils/show-message.js'
import { getExt } from '@/utils/format.js'
import router from '@/router'
import localCache from '@/utils/cache.js'
import notification from '@/utils/notify.js'

const fileModule = {
  namespaced: true,
  state() {
    return {
      currentFileList: {
        folders: [],
        files: []
      }, // 发送请求获取当前文件夹下所有文件 之后已有文件校验基于该状态
      fileList: [], // 用于记录上传的文件列表
      successFileList: [], // 用于记录上传成功的文件列表
      recycleBinFiles: {
        folders: [],
        files: []
      },
      currentParentId: localCache.getCache('currentParentId') || 0,
      routes: [], // 用于记录面包屑导航
      file: null
    }
  },
  actions: {
    getCurrentFileListAction({ state, commit }, parentId) {
      commit('CHANGE_CURRENT_PARENTID', parentId)
      getUserFileRequest(parentId).then((res) => {
        if (res.code === 200) {
          commit('CHANGE_CURRENTFILELIST', {
            folders: res.data.folders,
            files: res.data.resources
          })
        } else {
          showMessage({
            message: '获取用户文件失败,请稍后重试'
          })
          router.push('/login')
        }
      })
    },
    async getBinFilesAction({ state, commit }) {
      const res = await getBinRequest()
      if (res.code === 200) {
        const list = res.data
        const files = []
        const folders = []
        list.forEach((file) => {
          if (!file.typeId) {
            file.folderName = file.originalName
            file.fileType = 'folder'
            file.folderId = file.resourceId
            folders.push(file)
          } else {
            file.fileName = file.originalName
            file.fileType = getExt(file.originalName)
            file.fileId = file.resourceId
            files.push(file)
          }
        })
        commit('CHANGE_RECYCLEBINFILES', {
          files,
          folders
        })
      } else {
        showMessage({
          message: '获取回收站文件失败!',
          type: 'error'
        })
      }
    },
    // 核心逻辑代码 牵扯到多个函数上下文以及文件上下文的切换
    async uploadFileAction(
      { state, commit },
      { file, isDulplicate, isImmediate }
    ) {
      state.file = file || state.file
      if (!isImmediate) {
        return
      }
      const parentId = state.currentParentId
      const fileInfo = {
        file,
        filename: isDulplicate
          ? state.file.name.slice(0, state.file.name.lastIndexOf('.')) +
            `${Date.now()}` +
            getExt(state.file.name)
          : state.file.name,
        hash: '',
        chunkList: [],
        chunkSize: 1024 * 1024,
        fileSize: state.file.size,
        successChunks: [],
        percentage: 0, // 记录文件的百分比 目前方案是根据成功块数量计算/总数量
        isUploading: false,
        isFinished: false,
        source: null,
        chunkSuccessCb: null,
        chunkFailedCb: null,
        parentId: parentId
      }
      const chunkList = createChunks(state.file, fileInfo.chunkSize)
      fileInfo.hash = await calculateHash(chunkList)

      commit('CHANGE_FILELIST', {
        file: fileInfo,
        type: 'add'
      })
      const fileIndex = state.fileList.indexOf(fileInfo)
      showMessage({
        message: `文件${fileInfo.filename}正在上传`,
        type: 'info'
      })
      commit('CHANGE_LOADINGSTATE', {
        type: 'continue',
        fileIndex
      })

      const progressRes = await queryProgressRequest(fileInfo.hash)
      if (progressRes.code === 200) {
        if (Array.isArray(progressRes.data)) {
          commit('CHANGE_SUCCESSCHUNKS', {
            fileIndex,
            successChunks: progressRes.data
          })
        } else if (progressRes.data === null) {
          // 说明在服务器已经存在至少一份逻辑实体 那么我们只需发一个请求获取有
          commit('CHANGE_FILE_PERCENTAGE', {
            fileIndex,
            percentage: 100
          })
          commit('CHANGE_LOADINGSTATE', { fileIndex, type: 'finished' })
          commit('CHANGE_LOADINGSTATE', { fileIndex, type: 'pause' })
        }
      }
      fileInfo.chunkList = chunkList.map(({ file }, index) => {
        return {
          file: file,
          fileName: fileInfo.hash,
          index: index + 1
        }
      })
      // 切片上传成功的回调
      fileInfo.chunkSuccessCb = (res, index) => {
        if (res.code === 400) {
          fileInfo.source.cancel()
          commit('CHANGE_FILELIST', {
            fileIndex,
            type: 'delete'
          })
          return showMessage({
            message: '文件类型不支持',
            type: 'error'
          })
        }
        const data = res.data
        fileInfo.successChunks.push(index)
        const percentage = parseInt(
          (fileInfo.successChunks.length / fileInfo.chunkList.length) * 100
        )
        commit('CHANGE_FILE_PERCENTAGE', { fileIndex, percentage })
        console.log(fileInfo.percentage)
        if (data.allSuccess) {
          fileInfo.source.cancel()
          commit('CHANGE_FILE_PERCENTAGE', { fileIndex, percentage: 100 })
          state.successFileList.includes(fileInfo.hash)
            ? null
            : commit('CHANGE_SUCCESSLIST', fileInfo.hash)
          commit('CHANGE_LOADINGSTATE', { fileIndex, type: 'finished' })
          commit('CHANGE_LOADINGSTATE', { fileIndex, type: 'pause' })
          console.log('data =>', data)
          commit('CHANGE_FILES', { file: data.resource, type: 'add' })
          return notification({
            message: `${fileInfo.filename}上传成功!`
          })
        }
      }
      // 切片上传失败的回调
      fileInfo.chunkFailedCb = (reason) => {
        console.log('切片上传失败的逻辑')
        console.log('参考Tcp慢启动策略')
        console.log('失败重传 超过三次提示用户重新上传----')
      }
      // 执行上传文件
      uploadChunks(
        fileInfo,
        fileInfo.chunkSuccessCb,
        fileInfo.chunkFailedCb,
        fileInfo.successChunks
      )
    },
    async newFolderAction({ state, commit }, newFolderName) {
      if (!newFolderName) {
        return showMessage({
          type: 'info',
          message: '文件夹名不能为空^_^'
        })
      }
      const res = await createFolder(state.currentParentId, newFolderName)
      if (res.code === 200) {
        commit('CHANGE_FOLDERS', {
          type: 'add',
          folder: res.data
        })
        return showMessage({
          message: '文件夹创建成功!'
        })
      } else {
        return showMessage({
          message: '文件夹失败,请稍后重试'
        })
      }
    },
    pauseSingleFileUploadAction({ state, commit }, fileIndex) {
      const file = state.fileList[fileIndex]
      const isUploading = file.isUploading
      const isFinished = file.isFinished
      if (isUploading && !isFinished) {
        commit('CHANGE_LOADINGSTATE', {
          fileIndex,
          type: 'pause'
        })
        file.source.cancel()
      }
    },
    pauseAllFileUploadAction({ state, commit }) {
      const fileList = state.fileList
      for (const file of fileList) {
        const fileIndex = fileList.indexOf(file)
        if (!file.isFinished) {
          file.source.cancel(`文件${file.filenanme}取消传输`)
          commit('CHANGE_LOADINGSTATE', {
            type: 'pause',
            fileIndex
          })
        }
      }
    },
    continueSingleFileUploadAction({ state, commit }, fileIndex) {
      const fileInfo = state.fileList[fileIndex]
      const isUploading = fileInfo.isUploading
      const isFinished = fileInfo.isFinished
      if (!isUploading && !isFinished) {
        console.log('执行继续上传的逻辑')
        commit('CHANGE_LOADINGSTATE', {
          fileIndex,
          type: 'continue'
        })
        uploadChunks(
          fileInfo,
          fileInfo.chunkSuccessCb,
          fileInfo.chunkFailedCb,
          fileInfo.successChunks
        )
      }
    },
    continueAllFileUploadAction({ state, commit }) {
      const fileList = state.fileList
      for (const fileInfo of fileList) {
        if (!fileInfo.isFinished) {
          const fileIndex = fileList.indexOf(fileInfo)
          commit('CHANGE_LOADINGSTATE', {
            type: 'continue',
            fileIndex
          })
          uploadChunks(
            fileInfo,
            fileInfo.chunkSuccessCb,
            fileInfo.chunkFailedCb,
            fileInfo.successChunks
          )
        }
      }
    },
    cancelSingleFileUploadAction({ state, commit }, fileIndex) {
      const fileInfo = state.fileList[fileIndex]
      const fileId = fileInfo.hash
      if (!fileInfo.isFinished) {
        fileInfo.source.cancel(`已经取消文件${fileInfo.filename}的上传`)
        cancelUploadReqeust(fileId).then((res) => {
          if (res.message === 'success!') {
            commit('CHANGE_FILELIST', { fileIndex, type: 'delete' })
            notification({
              message: '取消成功'
            })
          }
        })
      }
    },
    cancelAllFileUploadAction({ state, commit }) {
      const fileList = state.fileList
      commit('CHANGE_FILELIST', { type: 'clear' })
      for (const fileInfo of fileList) {
        if (!fileInfo.isFinished) {
          fileInfo.source?.cancel()
          cancelUploadReqeust(fileInfo.hash)
        }
      }
      notification({
        message: '已全部取消'
      })
    },
    async renameFileAction({ state, commit }, payload) {
      const fileId = payload.fileId
      const newFileName = payload.newFileName
      const fileIndex = state.currentFileList.files.findIndex(
        (file) => file.id === fileId
      )
      const res = await renameFileRequest(
        fileId,
        newFileName,
        state.currentParentId
      )
      if (res.code === 200) {
        commit('CHANGE_FILES', {
          newFileName,
          fileIndex,
          type: 'rename'
        })
        return showMessage({
          message: '修改文件名成功'
        })
      } else {
        return showMessage({
          message: '修改失败,请稍后重试',
          type: 'error'
        })
      }
    },
    async renameFolderAction({ state, commit }, payload) {
      const folderId = payload.folderId
      const newFolderName = payload.newFolderName
      const res = await renameFolderRequest(
        folderId,
        newFolderName,
        state.currentParentId
      )
      if (res.code === 200) {
        const folderIndex = state.currentFileList.folders.findIndex(
          (folder) => folder.folderId === folderId
        )
        commit('CHANGE_FOLDERS', {
          type: 'rename',
          folderIndex,
          newFolderName
        })
        return showMessage({
          message: '修改文件夹名成功'
        })
      } else {
        return showMessage({
          message: '修改失败,请稍后重试',
          type: 'error'
        })
      }
    },
    async removeFileAction({ state, commit }, payload) {
      const res = await removeFileRequest(
        state.currentParentId,
        payload.fileId,
        payload.isPhysical
      )
      if (res.code === 200) {
        if (payload.isPhysical) {
          const fileIndex = state.recycleBinFiles.files.findIndex((file) => {
            return file.fileId && file.fileId === payload.fileId
          })

          commit('CHANGE_BIN_FILES', {
            fileIndex,
            type: 'delete'
          })
        } else {
          const fileIndex = state.currentFileList.files.findIndex(
            (file) => file.id === payload.fileId
          )
          console.log(fileIndex)
          debugger
          commit('CHANGE_FILES', {
            fileIndex,
            type: 'delete',
            env: 'filelist'
          })
          return showMessage({
            message: '已移到回收站'
          })
        }
      }
    },
    async removeFolderAction({ state, commit }, payload) {
      const res = await removeFolderRequest(
        payload.folderId,
        payload.isPhysical
      )
      if (res.code === 200) {
        if (payload.isPhysical) {
          const folderIndex = state.recycleBinFiles.folders.findIndex(
            (folder) => {
              if (folder.folderId && folder.folderId === payload.folderId) {
                commit('CHANGE_BIN_FOLDERS', {
                  type: 'delete',
                  folderIndex
                })
                return true
              }
            }
          )
        } else {
          const folderIndex = state.currentFileList.folders.findIndex(
            (folder) => folder.folderId === payload.folderId
          )
          commit('CHANGE_FOLDERS', {
            type: 'delete',
            env: 'filelist',
            folderIndex
          })
        }
      }
    },
    async recoverFolderAction({ state, commit }, folderId) {
      const res = await recoverFolderRequest(folderId)
      if (res.code === 200) {
        const folderIndex = state.recycleBinFiles.folders.findIndex(
          (folder) => folder.folderId === folder
        )
        commit('CHANGE_BIN_FOLDERS', {
          type: 'delete',
          folderIndex
        })
      }
    },
    async recoverFileAction({ state, commit }, fileId) {
      const fileIndex = state.recycleBinFiles.files.findIndex(
        (file) => file.fileId === fileId
      )
      const res = await recoverFileRequest(fileId)
      if (res.code === 200) {
        commit('CHANGE_BIN_FILES', {
          type: 'delete',
          fileIndex
        })
      }
    },
    async moveFileAction({ state, commit }, payload) {
      const fileId = payload.fileId
      const fileName = payload.fileName
      const parentId = payload.parentId
      const res = await renameFileRequest(fileId, fileName, parentId)
      if (res.code === 200) {
        const fileIndex = state.currentFileList.files.findIndex(
          (file) => file.fileId === fileId
        )
        commit('CHANGE_FILES', {
          fileIndex,
          type: 'delete'
        })
        return showMessage({
          message: '已移动至目标文件夹'
        })
      } else {
        return showMessage({
          type: 'error',
          message: '移动失败,请稍后重试!'
        })
      }
    },
    async moveFolderAction({ state, commit }, payload) {
      const folderId = payload.folderId
      const folderName = payload.folderName
      const parentId = payload.parentId
      const res = await renameFolderRequest(folderId, folderName, parentId)
      if (res.code === 200) {
        const folderIndex = state.currentFileList.folders.findIndex(
          (folder) => folder.folderId === folderId
        )
        commit('CHANGE_FOLDERS', {
          folderIndex,
          type: 'delete'
        })
        return showMessage({
          message: '已移动至目标文件夹'
        })
      } else {
        return showMessage({
          type: 'error',
          message: '移动失败,请稍后重试!'
        })
      }
    },
    async downLoadFileAction({ state }, payload) {
      const isFolder = payload.isFolder
      if (isFolder) {
        return showMessage({
          message: '暂时不支持文件夹下载',
          type: 'error'
        })
      }
      const fileId = payload.fileId
      const fileName = payload.fileName
      downloadFileRequest(fileId, fileName)
    }
  },
  mutations: {
    CHANGE_FILELIST(state, { file, type, fileIndex }) {
      switch (type) {
        case 'add':
          state.fileList.push(file)
          break
        case 'delete':
          state.fileList.splice(fileIndex, 1)
          break
        case 'clear':
          state.fileList = []
      }
    },
    CHANGE_RECYCLEBINFILES(state, recycleBinFiles) {
      state.recycleBinFiles = recycleBinFiles
    },
    CHANGE_SUCCESSLIST(state, hash) {
      state.successFileList.push(hash)
    },
    CHANGE_CURRENTFILELIST(state, { files, folders }) {
      state.currentFileList.files = files
      state.currentFileList.folders = folders
    },
    CHANGE_FOLDERS(state, { folder, type, folderIndex, newFolderName }) {
      if (type === 'add') {
        state.currentFileList.folders.unshift(folder)
      } else if (type === 'delete') {
        state.currentFileList.folders.splice(folderIndex, 1)
      } else if (type === 'rename') {
        state.currentFileList.folders[folderIndex].folderName = newFolderName
      }
    },
    CHANGE_FILES(state, { fileIndex, type, newFileName, file }) {
      switch (type) {
        case 'delete':
          state.currentFileList.files.splice(fileIndex, 1)
          break
        case 'rename':
          state.currentFileList.files[fileIndex].fileName = newFileName
          break
        case 'add':
          state.currentFileList.files.push(file)
      }
    },
    CHANGE_FILE_PERCENTAGE(state, { fileIndex, percentage }) {
      state.fileList[fileIndex].percentage = percentage
    },
    CHANGE_LOADINGSTATE(state, { fileIndex, type }) {
      const fileInfo = state.fileList[fileIndex]
      switch (type) {
        case 'pause':
          fileInfo.isUploading = false
          break
        case 'continue':
          fileInfo.isUploading = true
          break
        case 'finished':
          fileInfo.isFinished = true
      }
    },
    CHANGE_CURRENT_PARENTID(state, parentId) {
      state.currentParentId = parentId
      localCache.setCache('currentParentId', parentId)
    },
    CHANGE_SUCCESSCHUNKS(state, { fileIndex, successChunks }) {
      state.fileList[fileIndex].successChunks = successChunks
    },
    CHANGE_ROUTES(state, payload) {
      state.routes.push(payload)
    },
    CHANGE_BIN_FOLDERS(state, payload) {
      const type = payload.type
      switch (type) {
        case 'delete':
          state.recycleBinFiles.folders.splice(payload.folderIndex, 1)
      }
    },
    CHANGE_BIN_FILES(state, payload) {
      const type = payload.type
      switch (type) {
        case 'delete':
          state.recycleBinFiles.files.splice(payload.fileIndex)
      }
    }
  }
}

export default fileModule
