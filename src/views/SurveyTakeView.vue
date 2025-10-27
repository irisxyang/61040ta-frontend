<template>
  <div class="take-survey-page">
    <div class="survey-header">
      <h1 class="survey-logo">Survey</h1>
    </div>

    <div class="container-narrow">
      <div v-if="loading" class="loading">Loading survey...</div>

      <div v-else-if="error" class="error-card">
        <div class="error-icon">⚠️</div>
        <h2>Unable to Load Survey</h2>
        <p>{{ error }}</p>
        <button @click="$router.push('/login')" class="btn btn-primary">
          Go to Sign In
        </button>
      </div>

      <div v-else-if="submitted" class="success-card">
        <div class="success-icon">✓</div>
        <h2>Thank You</h2>
        <p>Your responses have been submitted successfully.</p>
        <button @click="resetSurvey" class="btn btn-primary">
          Submit Another Response
        </button>
      </div>

      <div v-else class="survey-content">
        <div class="survey-intro">
          <h2 class="survey-title">{{ surveyTitle }}</h2>
          <p class="survey-description">
            Rate each statement on a scale from 1 to 5
          </p>
        </div>

        <div v-if="questions.length === 0" class="empty-state">
          <p class="empty-title">This survey has no questions yet</p>
        </div>

        <form v-else @submit.prevent="submitResponses" class="questions-form">
          <div v-for="(question, index) in questions" :key="question.id" class="question-block">
            <div class="question-header">
              <span class="question-number">Question {{ index + 1 }} of {{ questions.length }}</span>
            </div>
            <p class="question-text">{{ question.stem }}</p>
            
            <div class="likert-scale">
              <label
                v-for="choice in 5"
                :key="choice"
                class="likert-option"
                :class="{ selected: responses[question.id] === choice }"
              >
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  :value="choice"
                  v-model="responses[question.id]"
                  required
                />
                <div class="likert-button">
                  <span class="likert-number">{{ choice }}</span>
                  <span class="likert-label">{{ getLikertLabel(choice) }}</span>
                </div>
              </label>
            </div>
          </div>

          <div v-if="submitError" class="error-message">
            {{ submitError }}
          </div>

          <div class="submit-section">
            <button
              type="submit"
              class="btn btn-primary btn-large"
              :disabled="!allQuestionsAnswered"
              style="width: 100%"
            >
              Submit Responses
            </button>
            <p v-if="!allQuestionsAnswered" class="submit-hint">
              Please answer all questions to continue
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { surveyAPI } from '../services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const surveyTitle = ref('')
const questions = ref([])
const responses = ref({})
const submitted = ref(false)
const submitError = ref(null)

// Generate a simple respondent ID
const respondentId = ref(`respondent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

const allQuestionsAnswered = computed(() => {
  return questions.value.every(q => responses.value[q.id] !== undefined)
})

function getLikertLabel(choice) {
  const labels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  }
  return labels[choice]
}

async function loadSurvey() {
  loading.value = true
  error.value = null
  
  try {
    const surveyId = route.params.id
    
    // Load survey title
    const titleResponse = await surveyAPI.getSurveyTitle(surveyId)
    if (!titleResponse || titleResponse.length === 0) {
      error.value = 'Survey not found'
      return
    }
    surveyTitle.value = titleResponse[0].title
    
    // Load questions
    const questionsResponse = await surveyAPI.getSurveyQuestions(surveyId)
    
    // Get question stems
    const questionDetails = await Promise.all(
      questionsResponse.map(async (item) => {
        const stemResponse = await surveyAPI.getQuestionStem(item.question)
        return {
          id: item.question,
          stem: stemResponse[0]?.stem || 'No question text'
        }
      })
    )
    
    questions.value = questionDetails
    
    // Initialize responses object
    responses.value = {}
    
  } catch (err) {
    console.error('Failed to load survey:', err)
    error.value = err.response?.data?.error || err.message || 'Failed to load survey'
  } finally {
    loading.value = false
  }
}

async function submitResponses() {
  submitError.value = null
  
  try {
    // Submit each response
    await Promise.all(
      questions.value.map(async (question) => {
        const choice = responses.value[question.id]
        await surveyAPI.respondToQuestion(question.id, respondentId.value, choice)
      })
    )
    
    submitted.value = true
  } catch (err) {
    console.error('Failed to submit responses:', err)
    submitError.value = err.response?.data?.error || err.message || 'Failed to submit responses'
  }
}

function resetSurvey() {
  // Generate new respondent ID for new submission
  respondentId.value = `respondent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  responses.value = {}
  submitted.value = false
  submitError.value = null
}

onMounted(() => {
  loadSurvey()
})
</script>

<style scoped>
.take-survey-page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.survey-header {
  background: var(--background-elevated);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-3) 0;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.survey-logo {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.loading {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-xl);
  padding: var(--space-12);
}

.error-card,
.success-card {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  text-align: center;
  margin-top: var(--space-8);
}

.error-icon,
.success-icon {
  font-size: 64px;
  margin-bottom: var(--space-3);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--accent-green);
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-3);
}

.error-card h2,
.success-card h2 {
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.error-card p,
.success-card p {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.survey-content {
  padding: var(--space-8) 0;
}

.survey-intro {
  text-align: center;
  margin-bottom: var(--space-10);
}

.survey-title {
  font-size: var(--text-5xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: var(--leading-5xl);
  letter-spacing: -0.003em;
  margin-bottom: var(--space-2);
}

.survey-description {
  font-size: var(--text-xl);
  color: var(--text-secondary);
}

.questions-form {
  max-width: 800px;
  margin: 0 auto;
}

.question-block {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.question-header {
  margin-bottom: var(--space-2);
}

.question-number {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--accent-blue);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.question-text {
  font-size: var(--text-2xl);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: var(--space-5);
}

.likert-scale {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.likert-option {
  cursor: pointer;
}

.likert-option input[type="radio"] {
  display: none;
}

.likert-button {
  background: var(--background-secondary);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  text-align: center;
  transition: all var(--duration-base) var(--ease-in-out);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
}

.likert-option:hover .likert-button {
  border-color: var(--accent-blue);
  background: rgba(0, 113, 227, 0.03);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.likert-option.selected .likert-button {
  border-color: var(--accent-blue);
  border-width: 2px;
  background: var(--accent-blue);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15),
              0 4px 12px rgba(0, 113, 227, 0.3);
}

.likert-number {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  line-height: 1;
}

.likert-label {
  font-size: 11px;
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.8;
}

.likert-option.selected .likert-label {
  opacity: 1;
}

.submit-section {
  margin-top: var(--space-8);
  text-align: center;
}

.submit-hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

.error-message {
  background: rgba(255, 59, 48, 0.08);
  color: var(--accent-red);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  margin-bottom: var(--space-4);
  border: 1px solid rgba(255, 59, 48, 0.2);
  text-align: center;
}

@media (max-width: 768px) {
  .survey-title {
    font-size: var(--text-4xl);
    line-height: var(--leading-4xl);
  }
  
  .question-text {
    font-size: var(--text-xl);
  }
  
  .likert-scale {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  
  .likert-button {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: var(--space-3);
    gap: var(--space-3);
  }
  
  .likert-number {
    font-size: var(--text-2xl);
    min-width: 40px;
  }
  
  .likert-label {
    font-size: var(--text-sm);
    text-align: left;
    flex: 1;
  }
}
</style>
