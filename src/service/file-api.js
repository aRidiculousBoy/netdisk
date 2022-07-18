import wRequest from '@/service/request.js'
import { saveAs } from 'file-saver'

// apis
const FileAPIS = {
  UploadChunkAPI: '/api/user/resource/file/slice',
  GetUserFileAPI: '/api/user/resource/',
  NewFolderAPI: '/api/user/resource/folder/',
  ModifyFolderNameAPI: '/api/user/resource/folder/',
  ModifyFileNameAPI: '/api/user/resource/file/',
  InquireProgressAPI: '/api/user/resource/file/progress/',
  RemoveFileAPI: '/api/user/resource/file/',
  RemoveFolderAPI: '/api/user/resource/folder/',
  RecoverFileAPI: '/api/user/resource/file/rc/',
  RecoverFolderAPI: '/api/user/resource/folder/rc/',
  DownloadFileAPI: '/api/user/resource/file/',
  CancelUploadAPI: '/api/user/undo/resource/',
  GetBinFileAPI: '/api/user/resource/recycle'
}

// 上传分片请求
export function uploadChunkRequest(formData, cancelToken) {
  return wRequest.post({
    url: FileAPIS.UploadChunkAPI,
    data: formData,
    timeout: Infinity,
    cancelToken
  })
}

// 获取用户文件资源请求
export function getUserFileRequest(parentId) {
  return wRequest.get({
    url: FileAPIS.GetUserFileAPI + parentId
  })
}

// 新建文件夹的请求
export function newFolderRequest(parentId, formData) {
  return wRequest.post({
    url: FileAPIS.NewFolderAPI + parentId,
    data: formData
  })
}

// 重命名文件夹请求
export function renameFolderRequest(folderId, folderName, parentId) {
  return wRequest.put({
    url: FileAPIS.ModifyFolderNameAPI + folderId,
    data: {
      folderName,
      parentId
    }
  })
}

// 重命名文件请求
export function renameFileRequest(resourceId, originalName, parentId) {
  return wRequest.put({
    url: FileAPIS.ModifyFileNameAPI + resourceId,
    data: {
      originalName,
      parentId
    }
  })
}

// 查询文件在服务器已经上传过多少请求
export function queryProgressRequest(fileName) {
  return wRequest.get({
    url: FileAPIS.InquireProgressAPI + fileName
  })
}

// 删除文件请求
export function removeFileRequest(parentId, resourceId, isPhysical) {
  return wRequest.delete({
    url:
      FileAPIS.RemoveFileAPI +
      parentId +
      '/' +
      resourceId +
      `/${isPhysical ? 1 : 0}`
  })
}

// 删除文件夹的请求
export function removeFolderRequest(folderId, isPhysical) {
  return wRequest.delete({
    url: FileAPIS.RemoveFolderAPI + folderId + `/${isPhysical ? 1 : 0}`
  })
}

// 下载文件请求
export function downloadFileRequest(fileId, sourceFileName) {
  saveAs(FileAPIS.DownloadFileAPI + fileId, sourceFileName)
}

// 取消文件上传请求
export function cancelUploadReqeust(fileId) {
  return wRequest.delete({
    url: FileAPIS.CancelUploadAPI + fileId
  })
}

// 获取用户回收站资源
export function getBinRequest() {
  return wRequest.get({
    url: FileAPIS.GetBinFileAPI
  })
}

// 恢复回收站文件夹请求
export function recoverFolderRequest(folderId) {
  return wRequest.put({
    url: FileAPIS.RecoverFolderAPI + folderId
  })
}

// 恢复回收站文件请求
export function recoverFileRequest(resourceId) {
  return wRequest.put({
    url: FileAPIS.RecoverFileAPI + resourceId
  })
}
