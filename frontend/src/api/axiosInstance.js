import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Store injection to avoid circular dependency
// (store -> slices -> axiosInstance -> store)
let _store = null

export function injectStore(store) {
  _store = store
}

// Attach JWT token
api.interceptors.request.use(config => {
  const token = _store?.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, err => Promise.reject(err))

// Auto-refresh on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
          .catch(err => Promise.reject(err))
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = _store?.getState().auth.refreshToken
      if (!refreshToken) {
        const { logout } = await import('../store/slices/authSlice')
        _store?.dispatch(logout())
        return Promise.reject(error)
      }
      try {
        const res = await axios.post(`/api/auth/refresh-token?refreshToken=${refreshToken}`)
        const { accessToken, refreshToken: newRefresh } = res.data.data
        const { setTokens } = await import('../store/slices/authSlice')
        _store.dispatch(setTokens({ accessToken, refreshToken: newRefresh }))
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        const { logout } = await import('../store/slices/authSlice')
        _store?.dispatch(logout())
        toast.error('Session expired. Please log in again.')
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    if (error.response?.status === 403) toast.error('Access denied.')
    return Promise.reject(error)
  }
)

export default api
