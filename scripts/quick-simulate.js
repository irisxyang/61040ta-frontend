// Quick Simulation Script
// Creates a test survey and populates it with simulated responses in one go

import axios from 'axios'

const API_BASE = 'http://localhost:8000'
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Configuration
const NUM_RESPONDERS = parseInt(process.argv[2]) || 100
const NUM_QUESTIONS = parseInt(process.argv[3]) || 8

const SAMPLE_QUESTIONS = [
  'How satisfied are you with the overall product quality?',
  'How likely are you to recommend this to a friend?',
  'How easy was it to get started?',
  'How would you rate the customer support?',
  'How well does this meet your needs?',
  'How satisfied are you with the pricing?',
  'How intuitive is the user interface?',
  'How reliable is the service?',
  'How responsive is the application?',
  'How comprehensive is the documentation?',
  'How valuable are the features offered?',
  'How satisfied are you with the performance?'
]

const PATTERNS = {
  veryPositive: { 1: 2, 2: 5, 3: 8, 4: 25, 5: 60 },
  positive: { 1: 5, 2: 10, 3: 15, 4: 40, 5: 30 },
  neutral: { 1: 10, 2: 20, 3: 40, 4: 20, 5: 10 },
  negative: { 1: 30, 2: 40, 3: 15, 4: 10, 5: 5 },
  veryNegative: { 1: 60, 2: 25, 3: 8, 4: 5, 5: 2 },
  bimodal: { 1: 35, 2: 10, 3: 10, 4: 10, 5: 35 },
  mixed: { 1: 15, 2: 20, 3: 30, 4: 20, 5: 15 },
  strongBimodal: { 1: 45, 2: 5, 3: 0, 4: 5, 5: 45 },
}

function pickChoice(distribution) {
  const rand = Math.random() * 100
  let cumulative = 0
  
  for (let choice = 1; choice <= 5; choice++) {
    cumulative += distribution[choice]
    if (rand < cumulative) {
      return choice
    }
  }
  
  return 5
}

function generateResponderId(index) {
  return `sim_user_${Date.now()}_${index}`
}

async function createUser() {
  const username = `testuser_${Date.now()}`
  const password = 'test123'
  
  const response = await api.post('/api/UserAuth/register', {
    username,
    password
  })
  
  if (response.data.error) throw new Error(response.data.error)
  
  return { userId: response.data.user, username, password }
}

async function createSurvey(userId, title) {
  const response = await api.post('/api/LikertSurvey/createSurvey', {
    title,
    owner: userId
  })
  
  if (response.data.error) throw new Error(response.data.error)
  
  return response.data.survey
}

async function addQuestion(surveyId, stem) {
  const response = await api.post('/api/LikertSurvey/addQuestion', {
    stem,
    survey: surveyId
  })
  
  if (response.data.error) throw new Error(response.data.error)
  
  return response.data.question
}

async function submitResponse(questionId, responderId, choice) {
  const response = await api.post('/api/LikertSurvey/respondToQuestion', {
    question: questionId,
    responder: responderId,
    choice: choice
  })
  
  if (response.data.error) throw new Error(response.data.error)
}

async function main() {
  console.log('🚀 Quick Survey Simulation\n')
  console.log(`📊 Configuration:`)
  console.log(`   Number of responders: ${NUM_RESPONDERS}`)
  console.log(`   Number of questions: ${NUM_QUESTIONS}\n`)
  
  try {
    // Step 1: Create user
    console.log('👤 Creating test user...')
    const { userId, username, password } = await createUser()
    console.log(`   ✅ User created: ${username}\n`)
    
    // Step 2: Create survey
    console.log('📋 Creating survey...')
    const surveyTitle = `Simulated Survey - ${new Date().toLocaleString()}`
    const surveyId = await createSurvey(userId, surveyTitle)
    console.log(`   ✅ Survey created: ${surveyId}\n`)
    
    // Step 3: Add questions
    console.log('❓ Adding questions...')
    const questions = []
    const patternKeys = Object.keys(PATTERNS)
    const questionPatterns = {}
    
    for (let i = 0; i < Math.min(NUM_QUESTIONS, SAMPLE_QUESTIONS.length); i++) {
      const questionId = await addQuestion(surveyId, SAMPLE_QUESTIONS[i])
      const pattern = patternKeys[i % patternKeys.length]
      questions.push(questionId)
      questionPatterns[questionId] = pattern
      console.log(`   ${i + 1}. ${SAMPLE_QUESTIONS[i]} [${pattern}]`)
    }
    console.log(`   ✅ ${questions.length} questions added\n`)
    
    // Step 4: Generate responses
    console.log('🎲 Generating simulated responses...')
    let totalResponses = 0
    const startTime = Date.now()
    
    for (let i = 0; i < NUM_RESPONDERS; i++) {
      const responderId = generateResponderId(i)
      
      for (const questionId of questions) {
        const pattern = questionPatterns[questionId]
        const distribution = PATTERNS[pattern]
        const choice = pickChoice(distribution)
        
        await submitResponse(questionId, responderId, choice)
        totalResponses++
      }
      
      // Progress
      if ((i + 1) % 10 === 0 || i === NUM_RESPONDERS - 1) {
        const progress = ((i + 1) / NUM_RESPONDERS * 100).toFixed(0)
        process.stdout.write(`\r   Progress: ${progress}% (${totalResponses} responses)`)
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('\n   ✅ All responses generated\n')
    
    // Summary
    console.log('=' .repeat(70))
    console.log('✨ Simulation Complete!\n')
    console.log('📈 Statistics:')
    console.log(`   Total responders: ${NUM_RESPONDERS}`)
    console.log(`   Total questions: ${questions.length}`)
    console.log(`   Total responses: ${totalResponses}`)
    console.log(`   Time taken: ${duration}s`)
    console.log(`   Responses/sec: ${(totalResponses / (duration || 1)).toFixed(1)}`)
    console.log('')
    console.log('📝 Survey Details:')
    console.log(`   Survey ID: ${surveyId}`)
    console.log(`   Owner ID:  ${userId}`)
    console.log(`   Username:  ${username}`)
    console.log(`   Password:  ${password}`)
    console.log('=' .repeat(70))
    console.log('\n💡 Next steps:')
    console.log(`   1. Login to the web app with username: ${username}`)
    console.log(`   2. View the survey results and test your statistics features`)
    console.log(`   3. Each question has a different response pattern for diverse testing\n`)
    
    // Show patterns
    console.log('📊 Response patterns by question:')
    questions.forEach((questionId, index) => {
      const pattern = questionPatterns[questionId]
      console.log(`   Q${index + 1}: ${pattern}`)
    })
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


