import axios from 'axios'

const service = axios.create({
  // baseURL: 'http://localhost:8081/', // 替换为实际后端地址
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(config => {
  // 可在此添加 token
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code !== 0) {
      return Promise.reject(response.data.msg)
    }
    return response.data.result
  },
  error => {
    return Promise.reject(error)
  }
)

export default service