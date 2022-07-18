import { ElNotification } from 'element-plus'
export default function notifcation({ title = '通知', message = '', duration = 1500 }) {
  return ElNotification({
    title,
    message,
    duration
  })
}