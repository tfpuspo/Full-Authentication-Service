import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import { tokenStore } from './tokenStore'

// General-purpose axios client for NON-auth API calls (e.g. future feature
// endpoints). Auth endpoints (login/refresh/logout/sessions) go through
// authFetch instead, since that's where the 401 -> refresh -> retry logic
// lives. This client still attaches whatever access token is currently in
// memory so protected endpoints work the same way.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = tokenStore.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      tokenStore.notifyUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default api
