export function fileSizeFormat(size) {
  if (Number(size)) {
    if (Number(size) < 1024 * 1024) {
      return (Number(size) / 1024).toFixed(1) + 'KB'
    }
    return (Number(size) / 1024 / 1024).toFixed(1) + 'MB'
  }
  return ''
}

export function fileNameFormat(filename, start = 0, end = 8) {
  return filename.substring(start, end) + '...'
}

export function getExt(filename) {
  if (!filename) {
    return
  } else {
    return filename.slice(filename.lastIndexOf('.'))
  }
}