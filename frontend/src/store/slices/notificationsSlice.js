import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

const initialState = { notifications: [], unreadCount: 0, loading: false }

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (userId) => {
  const res = await api.get(`/notifications/user/${userId}`)
  return res.data.data
})

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () => {
  const res = await api.get('/notifications/unread-count')
  return res.data.data
})

export const markAsRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.patch(`/notifications/${id}/read`)
  return id
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.notifications = payload.content || []
      })
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => { state.unreadCount = payload })
      .addCase(markAsRead.fulfilled, (state, { payload }) => {
        const n = state.notifications.find(n => n.id === payload)
        if (n) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
      })
  },
})

export default notificationsSlice.reducer
