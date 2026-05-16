import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const savedUser  = localStorage.getItem('user')
const initialState = {
  user:         savedUser ? JSON.parse(savedUser) : null,
  accessToken:  localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading:      false,
  error:        null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

const persist = (user, access, refresh) => {
  localStorage.setItem('user',         JSON.stringify(user))
  localStorage.setItem('accessToken',  access)
  localStorage.setItem('refreshToken', refresh)
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = state.accessToken = state.refreshToken = null
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    setTokens(state, { payload }) {
      state.accessToken  = payload.accessToken
      state.refreshToken = payload.refreshToken
      localStorage.setItem('accessToken',  payload.accessToken)
      localStorage.setItem('refreshToken', payload.refreshToken)
    },
    clearError(state) { state.error = null },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending,   s => { s.loading = true;  s.error = null })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false
        state.accessToken  = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.user = { id: payload.userId, fullName: payload.fullName, email: payload.email, role: payload.role, isVerified: payload.isVerified }
        persist(state.user, payload.accessToken, payload.refreshToken)
        toast.success('Welcome back, ' + payload.fullName + '!')
      })
      .addCase(login.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; toast.error(payload) })

      .addCase(register.pending,   s => { s.loading = true;  s.error = null })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false
        state.accessToken  = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.user = { id: payload.userId, fullName: payload.fullName, email: payload.email, role: payload.role, isVerified: payload.isVerified }
        persist(state.user, payload.accessToken, payload.refreshToken)
        toast.success('Account created! Please verify your email.')
      })
      .addCase(register.rejected, (state, { payload }) => { state.loading = false; state.error = payload; toast.error(payload) })
  },
})

export const { logout, setTokens, clearError } = authSlice.actions
export default authSlice.reducer
