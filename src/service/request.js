import axios from 'axios'
class WRequest {
  instance
  interceptors
  constructor(config) {
    this.instance = axios.create(config)
    this.interceptors = config.interceptors
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch
    )
    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch
    )

    // 所有实例都共享的拦截器
    this.instance.interceptors.request.use((config) => {
      return config
    })
    this.instance.interceptors.response.use((config) => {
      return config.data
    })
  }

  request(config) {
    return new Promise((resolve, reject) => {
      // 单个请求对请求config的处理
      if (config.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config)
      }

      this.instance
        .request(config)
        .then((res) => {
          // 单个请求对数据的处理
          if (config.interceptors?.responseInterceptor) {
            res = config.interceptors.responseInterceptor(res)
          }

          // 将结果resolve返回出去
          resolve(res)
        })
        .catch((err) => {
          reject(err)
          return err
        })
    })
  }

  get(config) {
    return this.request({ ...config, method: 'GET' })
  }

  post(config) {
    return this.request({ ...config, method: 'POST' })
  }

  delete(config) {
    return this.request({ ...config, method: 'DELETE' })
  }

  patch(config) {
    return this.request({ ...config, method: 'PATCH' })
  }

  put(config) {
    return this.request({ ...config, method: 'PUT' })
  }
}

const wRequest = new WRequest({
  timeout: 5000,
  interceptors: {
    requestInterceptor: (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = token
      }
      return config
    },
    requestInterceptorCatch: (err) => {
      return err
    },
    responseInterceptor: (res) => {
      return res
    }
  }
})

export default wRequest