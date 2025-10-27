<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Survey</h1>
          <p class="subtitle">{{ isLoginMode ? 'Sign in to continue' : 'Create your account' }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="input"
              placeholder="Enter username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="input"
              placeholder="Enter password"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary btn-large" style="width: 100%">
            {{ isLoginMode ? 'Sign In' : 'Create Account' }}
          </button>
        </form>

        <div class="toggle-mode">
          <button @click="toggleMode" type="button" class="btn-link">
            {{ isLoginMode ? "Don't have an account?" : 'Already have an account?' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoginMode = ref(true)

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  authStore.error = null
}

async function handleSubmit() {
  let success = false

  if (isLoginMode.value) {
    success = await authStore.login(username.value, password.value)
  } else {
    success = await authStore.register(username.value, password.value)
  }

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.login-header h1 {
  font-size: var(--text-5xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-5xl);
  letter-spacing: -0.003em;
}

.subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  font-weight: var(--weight-regular);
}

.login-form {
  margin-bottom: var(--space-4);
}

.error-message {
  background: rgba(255, 59, 48, 0.08);
  color: var(--accent-red);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-3);
  border: 1px solid rgba(255, 59, 48, 0.2);
}

.toggle-mode {
  text-align: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent-blue);
  cursor: pointer;
  font-size: var(--text-base);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) ease;
  font-family: var(--font-family);
}

.btn-link:hover {
  background: rgba(0, 113, 227, 0.08);
  color: var(--accent-blue-hover);
}

.btn-link:active {
  background: rgba(0, 113, 227, 0.15);
}

@media (max-width: 640px) {
  .login-card {
    padding: var(--space-6);
  }
  
  .login-header h1 {
    font-size: var(--text-4xl);
    line-height: var(--leading-4xl);
  }
  
  .subtitle {
    font-size: var(--text-lg);
  }
}
</style>
