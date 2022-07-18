import { ElMessage } from 'element-plus'

export default function showMessage({ message, type = 'success', duration = 1500, showClose = true }) {
  ElMessage({
    message,
    type,
    duration,
    showClose
  })
}
