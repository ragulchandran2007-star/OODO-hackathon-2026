import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// TODO: Add request/response interceptors

export default api
