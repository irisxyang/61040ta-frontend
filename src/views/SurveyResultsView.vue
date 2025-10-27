<template>
  <div class="results-page">
    <nav class="navbar">
      <h1>Survey Results</h1>
      <div class="navbar-actions">
        <button @click="goBack" class="btn btn-secondary btn-small">
          Dashboard
        </button>
        <button @click="handleLogout" class="btn btn-secondary btn-small">Sign Out</button>
      </div>
    </nav>

    <div class="container">
      <div v-if="loading" class="loading">Loading results...</div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Unable to Load Results</h2>
        <p>{{ error }}</p>
      </div>

      <div v-else>
        <!-- Survey Header -->
        <div class="survey-header-section">
          <h2 class="survey-title-large">{{ surveyTitle }}</h2>
          
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Questions</div>
              <div class="stat-value">{{ questions.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Responses</div>
              <div class="stat-value">{{ totalResponses }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg Sentiment</div>
              <div class="stat-value" :class="sentimentClass">
                {{ overallSentiment }}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Agreement</div>
              <div class="stat-value stat-positive">{{ overallAgreement }}%</div>
            </div>
          </div>

          <!-- Share Link -->
          <div class="share-section">
            <p class="share-label">Survey Link</p>
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
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

        <!-- No questions state -->
        <div v-if="questions.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p class="empty-title">No questions yet</p>
          <p class="empty-description">Add questions to start collecting responses</p>
          <button @click="goToEditor" class="btn btn-primary">
            Add Questions
          </button>
        </div>

        <!-- Question Results -->
        <div v-else class="results-list">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-result-card"
          >
            <div class="question-result-header">
              <div>
                <div class="question-number-label">Question {{ index + 1 }}</div>
                <p class="question-text">{{ question.stem }}</p>
              </div>
              <div class="sentiment-badge" :class="getSentimentClass(question.sentiment)">
                {{ formatSentiment(question.sentiment) }}
              </div>
            </div>

            <div class="response-count-badge">
              {{ question.totalResponses }} {{ question.totalResponses === 1 ? 'response' : 'responses' }}
            </div>

            <!-- Statistics Grid -->
            <div class="question-stats-grid" v-if="question.totalResponses > 0">
              <div class="mini-stat">
                <span class="mini-stat-label">Mean</span>
                <span class="mini-stat-value">{{ calculateMean(question.counts).toFixed(2) }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-label">Median</span>
                <span class="mini-stat-value">{{ calculateMedian(question.counts) }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-label">Mode</span>
                <span class="mini-stat-value">{{ calculateMode(question.counts) }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-label">Std Dev</span>
                <span class="mini-stat-value">{{ calculateStdDev(question.counts).toFixed(2) }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-label">Agreement</span>
                <span class="mini-stat-value stat-positive">{{ calculateAgreement(question.counts) }}%</span>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-label">Disagreement</span>
                <span class="mini-stat-value stat-negative">{{ calculateDisagreement(question.counts) }}%</span>
              </div>
            </div>

            <!-- Chart -->
            <div class="chart-container" v-if="question.totalResponses > 0">
              <div
                v-for="choice in 5"
                :key="choice"
                class="chart-row"
              >
                <div class="chart-label">
                  <span class="choice-number">{{ choice }}</span>
                  <span class="choice-text">{{ getLikertLabel(choice) }}</span>
                </div>
                <div class="chart-bar-track">
                  <div
                    class="chart-bar"
                    :style="{
                      width: getBarWidth(question.counts, choice - 1) + '%',
                      background: getBarColor(choice)
                    }"
                  >
                    <span class="bar-count" v-if="question.counts[choice - 1] > 0">
                      {{ question.counts[choice - 1] }}
                    </span>
                  </div>
                </div>
                <div class="chart-percentage">
                  {{ getPercentage(question.counts, choice - 1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { surveyAPI } from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const surveyTitle = ref('')
const questions = ref([])
const copied = ref(false)
const shareLinkInput = ref(null)

const shareLink = computed(() => {
  return `${window.location.origin}/take/${route.params.id}`
})

const totalResponses = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.max(...questions.value.map(q => q.totalResponses))
})

const overallSentiment = computed(() => {
  if (questions.value.length === 0) return 'N/A'
  const validSentiments = questions.value
    .map(q => q.sentiment)
    .filter(s => s !== null && s !== undefined)
  
  if (validSentiments.length === 0) return 'N/A'
  
  const avg = validSentiments.reduce((sum, s) => sum + s, 0) / validSentiments.length
  return avg.toFixed(2)
})

const sentimentClass = computed(() => {
  const sentiment = parseFloat(overallSentiment.value)
  if (isNaN(sentiment)) return ''
  if (sentiment >= 4) return 'stat-positive'
  if (sentiment >= 3) return 'stat-neutral'
  return 'stat-negative'
})

const overallAgreement = computed(() => {
  if (questions.value.length === 0) return 0
  let totalAgreement = 0
  let totalResponses = 0
  
  questions.value.forEach(q => {
    const agreementCount = q.counts[3] + q.counts[4]
    const questionTotal = q.totalResponses
    if (questionTotal > 0) {
      totalAgreement += agreementCount
      totalResponses += questionTotal
    }
  })
  
  return totalResponses > 0 ? Math.round((totalAgreement / totalResponses) * 100) : 0
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

function getBarWidth(counts, index) {
  const max = Math.max(...counts, 1)
  return (counts[index] / max) * 100
}

function getBarColor(choice) {
  const colors = {
    1: 'var(--accent-red)',
    2: 'var(--accent-orange)',
    3: '#F59E0B',
    4: '#34D399',
    5: 'var(--accent-green)'
  }
  return colors[choice]
}

function getPercentage(counts, index) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  return Math.round((counts[index] / total) * 100)
}

function formatSentiment(sentiment) {
  if (sentiment === null || sentiment === undefined) return 'N/A'
  const num = parseFloat(sentiment)
  if (isNaN(num)) return 'N/A'
  return num.toFixed(2)
}

function getSentimentClass(sentiment) {
  if (sentiment === null || sentiment === undefined) return ''
  const num = parseFloat(sentiment)
  if (isNaN(num)) return ''
  if (num >= 4) return 'sentiment-positive'
  if (num >= 3) return 'sentiment-neutral'
  return 'sentiment-negative'
}

// Statistical calculation functions
function calculateMean(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  
  let weightedSum = 0
  counts.forEach((count, index) => {
    weightedSum += count * (index + 1)
  })
  
  return weightedSum / total
}

function calculateMedian(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 'N/A'
  
  const responses = []
  counts.forEach((count, index) => {
    for (let i = 0; i < count; i++) {
      responses.push(index + 1)
    }
  })
  
  responses.sort((a, b) => a - b)
  const mid = Math.floor(responses.length / 2)
  
  if (responses.length % 2 === 0) {
    return ((responses[mid - 1] + responses[mid]) / 2).toFixed(1)
  } else {
    return responses[mid]
  }
}

function calculateMode(counts) {
  const maxCount = Math.max(...counts)
  if (maxCount === 0) return 'N/A'
  
  const modes = []
  counts.forEach((count, index) => {
    if (count === maxCount) {
      modes.push(index + 1)
    }
  })
  
  return modes.length === counts.length ? 'None' : modes.join(', ')
}

function calculateStdDev(counts) {
  const mean = calculateMean(counts)
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  
  let varianceSum = 0
  counts.forEach((count, index) => {
    const value = index + 1
    varianceSum += count * Math.pow(value - mean, 2)
  })
  
  const variance = varianceSum / total
  return Math.sqrt(variance)
}

function calculateAgreement(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  
  const agreementCount = counts[3] + counts[4]
  return Math.round((agreementCount / total) * 100)
}

function calculateDisagreement(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  
  const disagreementCount = counts[0] + counts[1]
  return Math.round((disagreementCount / total) * 100)
}

async function loadResults() {
  loading.value = true
  error.value = null
  
  try {
    const surveyId = route.params.id
    
    // Verify ownership
    const ownerResponse = await surveyAPI.getSurveyOwner(surveyId)
    if (ownerResponse[0]?.owner !== authStore.userId) {
      error.value = 'You do not have permission to view these results'
      loading.value = false
      return
    }
    
    // Load survey title
    const titleResponse = await surveyAPI.getSurveyTitle(surveyId)
    surveyTitle.value = titleResponse[0]?.title || 'Untitled Survey'
    
    // Load questions
    const questionsResponse = await surveyAPI.getSurveyQuestions(surveyId)
    
    // Get details for each question
    const questionDetails = await Promise.all(
      questionsResponse.map(async (item) => {
        const [stemResponse, countsResponse, sentimentResponse] = await Promise.all([
          surveyAPI.getQuestionStem(item.question),
          surveyAPI.getQuestionResponseCounts(item.question),
          surveyAPI.analyzeSentiment(item.question)
        ])
        
        const counts = countsResponse[0]?.counts || [0, 0, 0, 0, 0]
        const totalResponses = counts.reduce((sum, count) => sum + count, 0)
        
        let sentiment = sentimentResponse[0]?.sentiment
        if (sentiment !== null && sentiment !== undefined) {
          sentiment = parseFloat(sentiment)
          if (isNaN(sentiment)) sentiment = null
        }
        
        return {
          id: item.question,
          stem: stemResponse[0]?.stem || 'No question text',
          counts,
          totalResponses,
          sentiment
        }
      })
    )
    
    questions.value = questionDetails
    
  } catch (err) {
    console.error('Failed to load results:', err)
    
    let errorMsg = 'Failed to load results'
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
      errorMsg = 'Cannot connect to API server'
    } else if (err.response?.data?.error) {
      errorMsg = err.response.data.error
    } else if (err.message) {
      errorMsg = err.message
    }
    
    error.value = errorMsg
  } finally {
    loading.value = false
  }
}

function copyShareLink() {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function selectShareLink() {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
  }
}

function goBack() {
  router.push('/dashboard')
}

function goToEditor() {
  router.push(`/survey/${route.params.id}`)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.survey-header-section {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
}

.survey-title-large {
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  line-height: var(--leading-4xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--background-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  text-align: center;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-1);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-positive {
  color: var(--accent-green);
}

.stat-neutral {
  color: var(--accent-orange);
}

.stat-negative {
  color: var(--accent-red);
}

.share-section {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.share-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.share-link-container {
  display: flex;
  gap: var(--space-2);
}

.share-input {
  flex: 1;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--accent-blue);
  background: var(--background-secondary);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.question-result-card {
  background: var(--background-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.question-result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.question-number-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--accent-blue);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-1);
}

.question-text {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  line-height: 1.4;
}

.sentiment-badge {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.sentiment-badge.sentiment-positive {
  background: rgba(48, 209, 88, 0.15);
  color: #0A7F43;
}

.sentiment-badge.sentiment-neutral {
  background: rgba(255, 149, 0, 0.15);
  color: #C66900;
}

.sentiment-badge.sentiment-negative {
  background: rgba(255, 59, 48, 0.15);
  color: #D30F00;
}

.response-count-badge {
  display: inline-flex;
  padding: 8px 12px;
  background: var(--background-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  margin-bottom: var(--space-4);
}

.question-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--background-secondary);
  border-radius: var(--radius-md);
}

.mini-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mini-stat-value {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.chart-row {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  align-items: center;
  gap: var(--space-2);
}

.chart-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.choice-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--accent-blue);
  color: white;
  border-radius: 50%;
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.choice-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.chart-bar-track {
  background: var(--background-secondary);
  border-radius: 6px;
  height: 32px;
  position: relative;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-2);
  transition: width var(--duration-medium) var(--ease-out);
  min-width: 32px;
}

.bar-count {
  color: white;
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chart-percentage {
  text-align: right;
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.error-state {
  text-align: center;
  padding: var(--space-10);
}

.error-icon {
  font-size: 64px;
  margin-bottom: var(--space-3);
}

.error-state h2 {
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.error-state p {
  font-size: var(--text-lg);
  color: var(--text-secondary);
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-value {
    font-size: var(--text-3xl);
  }
  
  .question-result-header {
    flex-direction: column;
  }
  
  .question-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-row {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
  
  .chart-percentage {
    display: none;
  }
  
  .share-link-container {
    flex-direction: column;
  }
  
  .share-link-container .btn {
    width: 100%;
  }
}
</style>
