import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import appointmentsReducer from './slices/appointmentsSlice'
import doctorsReducer from './slices/doctorsSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    notifications: notificationsReducer,
  },
})
