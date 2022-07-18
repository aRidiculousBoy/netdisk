import { createStore } from 'vuex'
import LoginModule from './modules/login-module.js'
import FileModule from './modules/files.js'
export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    login: LoginModule,
    file: FileModule
  }
})
