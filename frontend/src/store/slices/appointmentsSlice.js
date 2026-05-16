import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const initialState = {
  patientAppointments: [],
  doctorAppointments:  [],
  currentAppointment:  null,
  loading: false,
  error:   null,
  totalPages: 0,
}

export const fetchPatientAppointments = createAsyncThunk(
  'appointments/fetchPatient',
  async ({ patientId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/appointments/patient/${patientId}?page=${page}&size=${size}`)
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed') }
  }
)

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctor',
  async ({ doctorId, page = 0 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/appointments/doctor/${doctorId}?page=${page}`)
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed') }
  }
)

export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/appointments', data)
      toast.success('Appointment booked! Complete payment to confirm.')
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Booking failed') }
  }
)

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/appointments/${appointmentId}/cancel`)
      toast.success('Appointment cancelled.')
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Cancel failed') }
  }
)

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setCurrentAppointment(state, { payload }) { state.currentAppointment = payload },
    clearError(state) { state.error = null },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPatientAppointments.pending,   s => { s.loading = true })
      .addCase(fetchPatientAppointments.fulfilled, (state, { payload }) => {
        state.loading = false
        state.patientAppointments = payload.content || []
        state.totalPages = payload.totalPages || 0
      })
      .addCase(fetchPatientAppointments.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; state.patientAppointments = [] })
      .addCase(fetchDoctorAppointments.fulfilled,  (state, { payload }) => { state.doctorAppointments = payload.content || [] })
      .addCase(bookAppointment.fulfilled, (state, { payload }) => { state.currentAppointment = payload })
      .addCase(bookAppointment.rejected,  (_, { payload }) => toast.error(payload))
      .addCase(cancelAppointment.rejected, (_, { payload }) => toast.error(payload))
  },
})

export const { setCurrentAppointment, clearError } = appointmentsSlice.actions
export default appointmentsSlice.reducer
