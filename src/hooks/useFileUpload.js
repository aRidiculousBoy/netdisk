import HashWorker from '@/workers/hashWorker.worker.js'
import localCache from '@/utils/cache.js'
import { uploadChunkRequest, newFolderRequest } from '../service/file-api'
import axios from 'axios'
import pLimit from 'p-limit'

const limit = pLimit(6)
// 给文件创建分片
export function createChunks(file, SIZE = 1024 * 1024) {
  const chunkList = []
  let cur = 0
  while (cur < file.size) {
    chunkList.push({
      file: file.slice(cur, cur + SIZE)
    })
    cur += SIZE
  }
  return chunkList
}

// 计算文件Hash
export function calculateHash(chunkList) {
  return new Promise(resolve => {
    const useHashWorker = new HashWorker()
    useHashWorker.postMessage({ chunkList })
    useHashWorker.onmessage = (e) => {
      const { hash } = e.data
      if (hash) {
        resolve(hash)
      }
    }
  })
}

// 上传文件切片
export async function uploadChunks(fileInfo, successCallback, failedCallback, uploadedList = []) {
  const tasks = [

  ]
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  fileInfo.source = source
  // 根据切片生成请求列表
  console.log('uploadedList', uploadedList)
  fileInfo.chunkList
    .filter(({ index }) => !uploadedList.includes(index))
    .map(({ file, fileName, index }) => {
      const formData = new FormData()
      formData.append('sliceSize', fileInfo.chunkSize)
      formData.append('chunkNum', index)
      formData.append('totalChunkNum', fileInfo.chunkList.length)
      formData.append('fileName', fileName)
      formData.append('file', file)
      formData.append('totalSize', fileInfo.fileSize)
      formData.append('userName', localCache.getCache('userName'))
      formData.append('parentId', fileInfo.parentId)
      formData.append('originalName', fileInfo.filename)
      return {
        formData,
        index
      }
    })
    .map(({ formData, index }) => {
      tasks.push(
        limit(() => uploadChunkRequest(formData, source.token)).then(res => {
          successCallback && successCallback(res, index)
        })
      )
    })
  await Promise.all(tasks)
}

// 新建文件夹的逻辑
export function createFolder(parentId, folderName) {
  const formData = new FormData()
  formData.append('folderName', folderName)
  return newFolderRequest(parentId, formData)
}
