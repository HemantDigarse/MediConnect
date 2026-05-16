import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

const initialState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
  totalPages: 0,
  totalElements: 0,
}

export const searchDoctors = createAsyncThunk(
  'doctors/search',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.append(k, v) })
      const res = await api.get(`/doctors?${query.toString()}`)
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Search failed') }
  }
)

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/doctors/${id}`)
      return res.data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Doctor not found') }
  }
)

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearSelectedDoctor(state) { state.selectedDoctor = null },
  },
  extraReducers: builder => {
    builder
      .addCase(searchDoctors.pending,   s => { s.loading = true; s.error = null })
      .addCase(searchDoctors.fulfilled, (state, { payload }) => {
        state.loading = false
        state.doctors = payload.content || []
        state.totalPages = payload.totalPages || 0
        state.totalElements = payload.totalElements || 0
      })
      .addCase(searchDoctors.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchDoctorById.pending,   s => { s.loading = true })
      .addCase(fetchDoctorById.fulfilled, (state, { payload }) => { state.loading = false; state.selectedDoctor = payload })
      .addCase(fetchDoctorById.rejected,  (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { clearSelectedDoctor } = doctorsSlice.actions
export default doctorsSlice.reducer
