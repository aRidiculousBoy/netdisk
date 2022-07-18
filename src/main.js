import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'element-plus/theme-chalk/index.css'
import 'normalize.css'
import '@/assets/css/base.css'
import registerElement from '@/global/registerElement'

const app = createApp(App)
registerElement(app)
app.use(store)
app.use(router)
app.mount('#app')
