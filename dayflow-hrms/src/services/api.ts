import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 (expired/invalid token), clear stored auth so the app can redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dayflow_token')
      localStorage.removeItem('dayflow_user')
      // Let the app react to this (AuthContext listens for this event)
      window.dispatchEvent(new Event('dayflow:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
