import { getFileBuffer } from '@/service/file-api.js'
async function processPng(fileId) {
  const res = await getFileBuffer(fileId)
  const blob = new Blob([res])
  const url = URL.createObjectURL(blob)
  return url
}
export async function usePreviewFile(fileType, fileId) {
  let ret
  switch (fileType) {
    case '.jpg':
      ret = await processPng(fileId)
      break
  }
  return ret
}
