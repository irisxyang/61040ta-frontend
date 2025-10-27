<template>
  <div class="dashboard-page">
    <nav class="navbar">
      <h1>Survey</h1>
      <div class="navbar-actions">
        <span class="welcome-text">{{ authStore.username }}</span>
        <button @click="handleLogout" class="btn btn-secondary btn-small">Sign Out</button>
      </div>
    </nav>

    <div class="container">
      <div class="dashboard-header">
        <div class="header-content">
          <h2 class="page-title">My Surveys</h2>
          <p class="page-subtitle">Create and manage your survey projects</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          Create Survey
        </button>
      </div>

      <div v-if="loading" class="loading">Loading surveys...</div>

      <div v-else-if="surveys.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-title">No surveys yet</p>
        <p class="empty-description">Create your first survey to get started</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          Create Your First Survey
        </button>
      </div>

      <div v-else class="survey-list">
        <div
          v-for="survey in surveys"
          :key="survey.id"
          class="survey-card"
          @click="goToSurvey(survey.id)"
        >
          <div class="survey-content">
            <h3 class="survey-title">{{ survey.title }}</h3>
            <p class="survey-meta">{{ survey.questionCount }} {{ survey.questionCount === 1 ? 'question' : 'questions' }}</p>
          </div>
          <div class="survey-actions" @click.stop>
            <button
              @click="viewResults(survey.id)"
              class="btn btn-secondary btn-small"
              title="View Results"
            >
              Results
            </button>
            <button
              @click="shareSurvey(survey.id)"
              class="btn btn-secondary btn-small"
              title="Share Survey"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Survey Modal -->
    <transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">Create New Survey</h2>
          <form @submit.prevent="createSurvey">
            <div class="form-group">
              <label for="title">Survey Title</label>
              <input
                id="title"
                v-model="newSurveyTitle"
                type="text"
                class="input"
                placeholder="Enter survey title"
                required
                autofocus
              />
            </div>

            <div v-if="createError" class="error-message">{{ createError }}</div>

            <div class="modal-actions">
              <button type="submit" class="btn btn-primary" style="flex: 1">
                Create
              </button>
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary"
                style="flex: 1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Share Survey Modal -->
    <transition name="modal">
      <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">Share Survey</h2>
          <p class="modal-description">
            Share this link to collect responses
          </p>
          
          <div class="share-link-container">
            <input
              type="text"
              :value="shareLink"
              readonly
              class="input share-input"
              ref="shareLinkInput"
              @click="selectShareLink"
            />
            <button @click="copyShareLink" class="btn btn-primary">
              {{ shareLinkCopied ? 'Copied' : 'Copy' }}
            </button>
          </div>

          <button
            type="button"
            @click="showShareModal = false"
            class="btn btn-secondary"
            style="width: 100%;"
          >
            Close
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { surveyAPI } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const surveys = ref([])
const showCreateModal = ref(false)
const newSurveyTitle = ref('')
const createError = ref(null)
const showShareModal = ref(false)
const shareLink = ref('')
const shareLinkInput = ref(null)
const shareLinkCopied = ref(false)

async function loadSurveys() {
  loading.value = true
  try {
    const response = await surveyAPI.getUserSurveys(authStore.userId)
    
    // Response is an array of objects with survey IDs
    const surveyIds = response.map(item => item.survey)
    
    // Load details for each survey
    const surveyDetails = await Promise.all(
      surveyIds.map(async (id) => {
        const titleResponse = await surveyAPI.getSurveyTitle(id)
        const questionsResponse = await surveyAPI.getSurveyQuestions(id)
        
        return {
          id,
          title: titleResponse[0]?.title || 'Untitled',
          questionCount: questionsResponse.length
        }
      })
    )
    
    surveys.value = surveyDetails
  } catch (error) {
    console.error('Failed to load surveys:', error)
  } finally {
    loading.value = false
  }
}

async function createSurvey() {
  createError.value = null
  
  try {
    const response = await surveyAPI.createSurvey(newSurveyTitle.value, authStore.userId)
    
    if (response.error) {
      createError.value = response.error
      return
    }
    
    // Success
    showCreateModal.value = false
    newSurveyTitle.value = ''
    
    // Reload surveys
    await loadSurveys()
    
    // Navigate to the new survey
    router.push(`/survey/${response.survey}`)
  } catch (error) {
    createError.value = error.response?.data?.error || error.message || 'Failed to create survey'
  }
}

function goToSurvey(id) {
  router.push(`/survey/${id}`)
}

function viewResults(id) {
  router.push(`/results/${id}`)
}

function shareSurvey(id) {
  shareLink.value = `${window.location.origin}/take/${id}`
  showShareModal.value = true
  shareLinkCopied.value = false
}

function selectShareLink() {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
  }
}

function copyShareLink() {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
    document.execCommand('copy')
    shareLinkCopied.value = true
    setTimeout(() => {
      shareLinkCopied.value = false
    }, 2000)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadSurveys()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-3);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-4xl);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.welcome-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.survey-card {
  background: var(--background-elevated);
  padding: var(--space-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all var(--duration-medium) var(--ease-in-out);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.survey-card:hover {
  border-color: var(--accent-blue);
  transform: scale(1.015);
  box-shadow: var(--shadow-md);
}

.survey-content {
  flex: 1;
}

.survey-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: 1.3;
}

.survey-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.survey-actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-light);
}

.survey-actions button {
  flex: 1;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--space-3);
}

.empty-title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-dark);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: var(--space-3);
}

.modal-content {
  background: var(--background-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.modal-title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.modal-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.modal-actions {
  display: flex;
  gap: var(--space-2);
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

.share-link-container {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-3);
}

.share-input {
  flex: 1;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--accent-blue);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-medium) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  animation: modal-slide var(--duration-medium) var(--ease-in-out);
}

@keyframes modal-slide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: var(--text-3xl);
  }
  
  .modal-content {
    padding: var(--space-4);
  }
  
  .share-link-container {
    flex-direction: column;
  }
  
  .share-link-container .btn {
    width: 100%;
  }
}
</style>
