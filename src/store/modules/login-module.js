import { accountLoginRequest, rememberLoginRequest } from '@/service/login-api'
import localCache from '@/utils/cache.js'
import router from '@/router'
import showMessage from '@/utils/show-message'
const loginModule = {
  namespaced: true,
  state() {
    return {
      token: localCache.getCache('token') || '',
      userName: localCache.getCache('userName') || '',
      sequence: localCache.getCache('sequence') || '',
      password: localCache.getCache('password') || ''
    }
  },
  actions: {
    async accountLoginAction({ state, commit }, payload) {
      const account = payload.account
      const isKeepPassword = payload.isKeepPassword
      const password = account.password
      // 1、第一种方式：记住账号密码方式登录(基于序列验证)
      if (isKeepPassword && state.sequence) {
        const account = {
          userName: state.userName,
          sequence: state.sequence
        }
        const loginResult = await rememberLoginRequest(account)
        if (loginResult.code === 200) {
          const { data } = loginResult
          const token = data.token
          const userName = data.userName
          console.log(token)
          commit('SAVE_TOKEN', token)
          commit('SAVE_USERNAME', userName)
          commit('SAVE_PASSWORD', password)
          showMessage({
            message: '恭喜您登录成功:' + userName
          })
          router.push('/home')
        } else {
          showMessage({
            message: '用户名或密码不正确,请重新登录',
            type: 'error'
          })
        }
        return
      }

      // 2、第二种方式：正常方式登录(基于账号密码的验证)
      if (isKeepPassword && !state.sequence) {
        const loginResult = await accountLoginRequest(account)
        if (loginResult.code === 200) {
          const { data } = loginResult
          const token = data.token
          commit('SAVE_TOKEN', token)
          const userName = data.userName
          commit('SAVE_USERNAME', userName)
          commit('SAVE_PASSWORD', password)
          const sequence = data.sequence
          commit('SAVE_SEQUENCE', sequence)
          router.push('/home')
          showMessage({
            message: '恭喜您登录成功:' + userName
          })
        } else {
          showMessage({
            message: '用户名或密码不正确,请重新登录',
            type: 'error'
          })
        }
        return
      }

      if (!isKeepPassword) {
        const loginResult = await accountLoginRequest(account)
        if (loginResult.code === 200) {
          const { data } = loginResult
          const token = data.token
          const userName = data.userName
          commit('SAVE_USERNAME', userName)
          commit('SAVE_TOKEN', token)
          showMessage({
            message: '恭喜您登录成功:' + userName
          })
          router.push('/home')
        } else {
          showMessage({
            message: '用户名或密码不正确,请重新登录',
            type: 'error'
          })
        }
      }
    }
  },
  mutations: {
    SAVE_TOKEN(state, token) {
      state.token = token
      localCache.setCache('token', token)
    },
    SAVE_USERNAME(state, userName) {
      state.userName = userName
      localCache.setCache('userName', userName)
    },
    SAVE_SEQUENCE(state, sequence) {
      state.sequence = sequence
      localCache.setCache('sequence', sequence)
    },
    SAVE_PASSWORD(state, password) {
      state.password = password
      localCache.setCache('password', password)
    }
  }
}

export default loginModule