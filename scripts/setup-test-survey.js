// Setup Test Survey Script
// Creates a test survey with sample questions for statistics testing

import axios from 'axios'

const API_BASE = 'http://localhost:8000'
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Test questions covering different topics
const SAMPLE_QUESTIONS = [
  'How satisfied are you with the overall product quality?',
  'How likely are you to recommend this to a friend?',
  'How easy was it to get started?',
  'How would you rate the customer support?',
  'How well does this meet your needs?',
  'How satisfied are you with the pricing?',
  'How intuitive is the user interface?',
  'How reliable is the service?'
]

async function createTestUser() {
  const username = `testuser_${Date.now()}`
  const password = 'test123'
  
  console.log('👤 Creating test user...')
  const response = await api.post('/api/UserAuth/register', {
    username,
    password
  })
  
  if (response.data.error) {
    throw new Error(response.data.error)
  }
  
  const userId = response.data.user
  console.log(`   Username: ${username}`)
  console.log(`   User ID: ${userId}\n`)
  
  return { userId, username, password }
}

async function createSurvey(userId, title) {
  console.log('📋 Creating survey...')
  const response = await api.post('/api/LikertSurvey/createSurvey', {
    title,
    owner: userId
  })
  
  if (response.data.error) {
    throw new Error(response.data.error)
  }
  
  const surveyId = response.data.survey
  console.log(`   Title: ${title}`)
  console.log(`   Survey ID: ${surveyId}\n`)
  
  return surveyId
}

async function addQuestion(surveyId, stem) {
  const response = await api.post('/api/LikertSurvey/addQuestion', {
    stem,
    survey: surveyId
  })
  
  if (response.data.error) {
    throw new Error(response.data.error)
  }
  
  return response.data.question
}

async function setupTestSurvey() {
  console.log('🎯 Test Survey Setup\n')
  
  try {
    // Create test user
    const { userId, username, password } = await createTestUser()
    
    // Create survey
    const surveyTitle = `Statistics Test Survey - ${new Date().toLocaleDateString()}`
    const surveyId = await createSurvey(userId, surveyTitle)
    
    // Add questions
    console.log('❓ Adding questions...')
    const questionIds = []
    
    for (let i = 0; i < SAMPLE_QUESTIONS.length; i++) {
      const questionId = await addQuestion(surveyId, SAMPLE_QUESTIONS[i])
      questionIds.push(questionId)
      console.log(`   ${i + 1}. ${SAMPLE_QUESTIONS[i]}`)
    }
    
    console.log(`\n✅ Successfully created survey with ${questionIds.length} questions!\n`)
    
    // Output the important IDs
    console.log('=' .repeat(70))
    console.log('📝 IMPORTANT - Save these details:\n')
    console.log(`Survey ID:     ${surveyId}`)
    console.log(`Owner User ID: ${userId}`)
    console.log(`Username:      ${username}`)
    console.log(`Password:      ${password}`)
    console.log('=' .repeat(70))
    console.log('\n💡 Next steps:\n')
    console.log('1. Run the simulation script to generate responses:')
    console.log(`   node scripts/simulate-responses.js ${surveyId} 100\n`)
    console.log('2. Or login to the web app to view/manage the survey:')
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setupTestSurvey()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })


