import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const userId = ref(localStorage.getItem('userId') || null)
  const username = ref(localStorage.getItem('username') || null)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function register(usernameInput, password) {
    try {
      error.value = null
      const response = await authAPI.register(usernameInput, password)
      
      if (response.error) {
        error.value = response.error
        return false
      }

      userId.value = response.user
      username.value = usernameInput
      
      // Auto-login after registration
      return await login(usernameInput, password)
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Registration failed'
      return false
    }
  }

  async function login(usernameInput, password) {
    try {
      error.value = null
      const response = await authAPI.login(usernameInput, password)
      
      if (response.error) {
        error.value = response.error
        return false
      }

      token.value = response.token
      localStorage.setItem('token', response.token)

      // Get user info
      const userResponse = await authAPI.getUserFromToken(response.token)
      if (userResponse && userResponse.length > 0) {
        userId.value = userResponse[0].user
        localStorage.setItem('userId', userResponse[0].user)
      }

      const usernameResponse = await authAPI.getUsernameFromToken(response.token)
      if (usernameResponse && usernameResponse.length > 0) {
        username.value = usernameResponse[0].username
        localStorage.setItem('username', usernameResponse[0].username)
      }

      return true
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Login failed'
      return false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await authAPI.logout(token.value)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      userId.value = null
      username.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
    }
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await authAPI.getUserFromToken(token.value)
      if (response && response.length > 0) {
        userId.value = response[0].user
        return true
      }
      // Token is invalid
      await logout()
      return false
    } catch (err) {
      await logout()
      return false
    }
  }

  return {
    token,
    userId,
    username,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    checkAuth
  }
})

