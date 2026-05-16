// src/__tests__/authSlice.test.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout, setTokens, clearError } from '../store/slices/authSlice'

const makeStore = (preloadedState = {}) =>
  configureStore({ reducer: { auth: authReducer }, preloadedState })

describe('authSlice', () => {
  describe('initial state', () => {
    it('should have null user when localStorage is empty', () => {
      localStorage.clear()
      const store = makeStore()
      expect(store.getState().auth.user).toBeNull()
      expect(store.getState().auth.accessToken).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user and tokens', () => {
      const store = makeStore({
        auth: {
          user: { id: '1', fullName: 'Test', email: 'test@test.com', role: 'PATIENT' },
          accessToken: 'abc',
          refreshToken: 'xyz',
          loading: false,
          error: null,
        },
      })
      store.dispatch(logout())
      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
    })
  })

  describe('setTokens', () => {
    it('should update tokens', () => {
      const store = makeStore()
      store.dispatch(setTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }))
      const state = store.getState().auth
      expect(state.accessToken).toBe('new-access')
      expect(state.refreshToken).toBe('new-refresh')
    })
  })

  describe('clearError', () => {
    it('should reset error to null', () => {
      const store = makeStore({ auth: { user: null, accessToken: null, refreshToken: null, loading: false, error: 'Some error' } })
      store.dispatch(clearError())
      expect(store.getState().auth.error).toBeNull()
    })
  })
})
