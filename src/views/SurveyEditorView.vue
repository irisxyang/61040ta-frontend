<template>
  <div class="editor-page">
    <nav class="navbar">
      <h1>Survey</h1>
      <div class="navbar-actions">
        <button @click="router.push('/dashboard')" class="btn btn-secondary btn-small">
          Dashboard
        </button>
        <button @click="viewResults" class="btn btn-secondary btn-small">
          Results
        </button>
        <button @click="handleLogout" class="btn btn-secondary btn-small">Sign Out</button>
      </div>
    </nav>

    <div class="container">
      <div v-if="loading" class="loading">Loading survey...</div>

      <div v-else>
        <!-- Survey Header -->
        <div class="survey-header-card">
          <h1 class="survey-name">{{ surveyTitle }}</h1>
          <p class="survey-id">Survey ID: {{ surveyId }}</p>
          
          <!-- Share Link Section -->
          <div class="share-section">
            <p class="share-label">Share Link</p>
            <p class="share-description">
              Anyone with this link can respond to your survey
            </p>
            <div class="share-link-box">
              <input
                type="text"
                :value="shareLink"
                readonly
                class="input share-input"
                ref="shareLinkInput"
                @click="selectShareLink"
              />
              <button @click="copyShareLink" class="btn btn-primary">
                {{ linkCopied ? 'Copied' : 'Copy Link' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="questions-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Questions</h2>
              <p class="section-subtitle">Add and manage survey questions</p>
            </div>
            <button @click="showAddQuestion = true" class="btn btn-primary">
              Add Question
            </button>
          </div>

          <div v-if="questions.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p class="empty-title">No questions yet</p>
            <p class="empty-description">Add your first question to get started</p>
            <button @click="showAddQuestion = true" class="btn btn-primary">
              Add Your First Question
            </button>
          </div>

          <div v-else class="question-list">
            <div v-for="(question, index) in questions" :key="question.id" class="question-card">
              <div class="question-number-badge">{{ index + 1 }}</div>
              <div class="question-content">
                <p class="question-stem">{{ question.stem }}</p>
              </div>
              <button
                @click="removeQuestion(question.id)"
                class="btn btn-danger btn-small"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Question Modal -->
    <transition name="modal">
      <div v-if="showAddQuestion" class="modal-overlay" @click="showAddQuestion = false">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">Add New Question</h2>
          <form @submit.prevent="addQuestion">
            <div class="form-group">
              <label for="stem">Question Text</label>
              <textarea
                id="stem"
                v-model="newQuestionStem"
                class="input"
                placeholder="Enter your question here..."
                rows="4"
                required
                autofocus
              ></textarea>
            </div>

            <div v-if="questionError" class="error-message">{{ questionError }}</div>

            <div class="modal-actions">
              <button type="submit" class="btn btn-primary" style="flex: 1">
                Add Question
              </button>
              <button
                type="button"
                @click="showAddQuestion = false"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { surveyAPI } from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const surveyId = ref(route.params.id)
const surveyTitle = ref('')
const loading = ref(false)
const questions = ref([])
const showAddQuestion = ref(false)
const newQuestionStem = ref('')
const questionError = ref(null)
const shareLinkInput = ref(null)
const linkCopied = ref(false)

const shareLink = `${window.location.origin}/take/${route.params.id}`

async function loadSurvey() {
  loading.value = true
  try {
    // Load survey title
    const titleResponse = await surveyAPI.getSurveyTitle(surveyId.value)
    surveyTitle.value = titleResponse[0]?.title || 'Untitled Survey'

    // Load questions
    await loadQuestions()
  } catch (error) {
    console.error('Failed to load survey:', error)
  } finally {
    loading.value = false
  }
}

async function loadQuestions() {
  try {
    const response = await surveyAPI.getSurveyQuestions(surveyId.value)
    
    // Load stem for each question
    const questionDetails = await Promise.all(
      response.map(async (item) => {
        const stemResponse = await surveyAPI.getQuestionStem(item.question)
        return {
          id: item.question,
          stem: stemResponse[0]?.stem || ''
        }
      })
    )
    
    questions.value = questionDetails
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

async function addQuestion() {
  questionError.value = null
  
  try {
    const response = await surveyAPI.addQuestion(newQuestionStem.value, surveyId.value)
    
    if (response.error) {
      questionError.value = response.error
      return
    }
    
    // Success
    showAddQuestion.value = false
    newQuestionStem.value = ''
    
    // Reload questions
    await loadQuestions()
  } catch (error) {
    questionError.value = error.response?.data?.error || error.message || 'Failed to add question'
  }
}

async function removeQuestion(questionId) {
  if (!confirm('Remove this question? All responses will be deleted.')) {
    return
  }
  
  try {
    await surveyAPI.removeQuestion(questionId)
    
    // Reload questions
    await loadQuestions()
  } catch (error) {
    console.error('Failed to remove question:', error)
    alert('Failed to remove question')
  }
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
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

function viewResults() {
  router.push(`/results/${surveyId.value}`)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadSurvey()
})
</script>

<style scoped>
.editor-page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.survey-header-card {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
}

.survey-name {
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-4xl);
}

.survey-id {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
  font-family: 'SF Mono', Monaco, monospace;
}

.share-section {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.share-label {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.share-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.share-link-box {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.share-input {
  flex: 1;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--accent-blue);
  background: var(--background-secondary);
}

.questions-section {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-3);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.section-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.question-card {
  background: var(--background-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-base) ease;
}

.question-card:hover {
  background: var(--background-elevated);
  border-color: var(--border-light);
}

.question-number-badge {
  min-width: 36px;
  height: 36px;
  background: var(--accent-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.question-content {
  flex: 1;
  min-width: 0;
}

.question-stem {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.5;
  word-wrap: break-word;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--space-3);
}

.empty-title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.empty-description {
  font-size: var(--text-base);
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.modal-title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.modal-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
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
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header .btn {
    width: 100%;
  }
  
  .share-link-box {
    flex-direction: column;
  }
  
  .share-link-box .btn {
    width: 100%;
  }
}
</style>
