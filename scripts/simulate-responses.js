// Survey Response Simulation Script
// Generates diverse simulated responses for testing statistics features

import axios from 'axios'

const API_BASE = 'http://localhost:8000'
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Configuration
const CONFIG = {
  surveyId: process.argv[2], // Pass survey ID as first argument
  numResponders: parseInt(process.argv[3]) || 50, // Number of simulated responders
  
  // Distribution patterns for different questions
  patterns: {
    veryPositive: { 1: 2, 2: 5, 3: 8, 4: 25, 5: 60 },    // Strongly positive
    positive: { 1: 5, 2: 10, 3: 15, 4: 40, 5: 30 },      // Moderately positive
    neutral: { 1: 10, 2: 20, 3: 40, 4: 20, 5: 10 },      // Centered distribution
    negative: { 1: 30, 2: 40, 3: 15, 4: 10, 5: 5 },      // Moderately negative
    veryNegative: { 1: 60, 2: 25, 3: 8, 4: 5, 5: 2 },    // Strongly negative
    bimodal: { 1: 35, 2: 10, 3: 10, 4: 10, 5: 35 },      // Polarized (love it or hate it)
    mixed: { 1: 15, 2: 20, 3: 30, 4: 20, 5: 15 },        // Evenly distributed
    strongBimodal: { 1: 45, 2: 5, 3: 0, 4: 5, 5: 45 },   // Very polarized
  }
}

// Helper to pick a choice based on weighted distribution
function pickChoice(distribution) {
  const rand = Math.random() * 100
  let cumulative = 0
  
  for (let choice = 1; choice <= 5; choice++) {
    cumulative += distribution[choice]
    if (rand < cumulative) {
      return choice
    }
  }
  
  return 5 // Fallback
}

// Generate simulated responder IDs
function generateResponderId(index) {
  return `simulated_user_${Date.now()}_${index}`
}

async function getSurveyQuestions(surveyId) {
  try {
    const response = await api.post('/api/LikertSurvey/_getSurveyQuestions', {
      survey: surveyId
    })
    
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    
    return response.data.map(item => item.question)
  } catch (error) {
    throw new Error(`Failed to get survey questions: ${error.message}`)
  }
}

async function submitResponse(questionId, responderId, choice) {
  try {
    const response = await api.post('/api/LikertSurvey/respondToQuestion', {
      question: questionId,
      responder: responderId,
      choice: choice
    })
    
    if (response.data.error) {
      throw new Error(response.data.error)
    }
  } catch (error) {
    throw new Error(`Failed to submit response: ${error.message}`)
  }
}

async function getQuestionStem(questionId) {
  try {
    const response = await api.post('/api/LikertSurvey/_getQuestionStem', {
      question: questionId
    })
    
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    
    return response.data[0]?.stem || 'Unknown question'
  } catch (error) {
    return 'Unknown question'
  }
}

async function simulateResponses() {
  console.log('🎲 Survey Response Simulator\n')
  
  // Validate input
  if (!CONFIG.surveyId) {
    console.error('❌ Error: Survey ID is required!')
    console.log('\nUsage: node simulate-responses.js <survey-id> [num-responders]')
    console.log('Example: node simulate-responses.js abc123 50\n')
    process.exit(1)
  }
  
  console.log(`📊 Survey ID: ${CONFIG.surveyId}`)
  console.log(`👥 Number of responders: ${CONFIG.numResponders}\n`)
  
  // Get questions
  console.log('🔍 Fetching survey questions...')
  let questions
  try {
    questions = await getSurveyQuestions(CONFIG.surveyId)
  } catch (error) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
  
  if (questions.length === 0) {
    console.error('❌ Error: Survey has no questions!')
    process.exit(1)
  }
  
  console.log(`✅ Found ${questions.length} question(s)\n`)
  
  // Get question stems for better logging
  const questionStems = {}
  for (const questionId of questions) {
    questionStems[questionId] = await getQuestionStem(questionId)
  }
  
  // Assign patterns to questions (cycle through patterns)
  const patternKeys = Object.keys(CONFIG.patterns)
  const questionPatterns = {}
  
  console.log('📋 Question patterns:')
  questions.forEach((questionId, index) => {
    const pattern = patternKeys[index % patternKeys.length]
    questionPatterns[questionId] = pattern
    console.log(`   Q${index + 1}: "${questionStems[questionId]}"`)
    console.log(`       → Pattern: ${pattern}`)
  })
  console.log('')
  
  // Generate and submit responses
  console.log('🚀 Generating responses...\n')
  
  let totalResponses = 0
  const startTime = Date.now()
  
  for (let i = 0; i < CONFIG.numResponders; i++) {
    const responderId = generateResponderId(i)
    
    for (const questionId of questions) {
      const pattern = questionPatterns[questionId]
      const distribution = CONFIG.patterns[pattern]
      const choice = pickChoice(distribution)
      
      await submitResponse(questionId, responderId, choice)
      totalResponses++
    }
    
    // Progress indicator
    const progress = ((i + 1) / CONFIG.numResponders * 100).toFixed(0)
    process.stdout.write(`\r   Progress: ${progress}% (${i + 1}/${CONFIG.numResponders} responders, ${totalResponses} total responses)`)
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n')
  
  // Summary
  console.log('✨ Simulation complete!\n')
  console.log('📈 Summary:')
  console.log(`   Total responders: ${CONFIG.numResponders}`)
  console.log(`   Total responses: ${totalResponses}`)
  console.log(`   Time taken: ${duration}s`)
  console.log(`   Responses per second: ${(totalResponses / (duration || 1)).toFixed(1)}\n`)
  
  console.log('💡 Tip: You can now view the survey results to see the different')
  console.log('   distribution patterns and test your statistics features!\n')
  
  // Show expected distributions for each question
  console.log('📊 Expected distribution patterns:')
  questions.forEach((questionId, index) => {
    const pattern = questionPatterns[questionId]
    const distribution = CONFIG.patterns[pattern]
    console.log(`\n   Q${index + 1} (${pattern}):`)
    console.log(`      Choice 1: ~${distribution[1]}%`)
    console.log(`      Choice 2: ~${distribution[2]}%`)
    console.log(`      Choice 3: ~${distribution[3]}%`)
    console.log(`      Choice 4: ~${distribution[4]}%`)
    console.log(`      Choice 5: ~${distribution[5]}%`)
  })
  console.log('')
}

// Run the simulation
simulateResponses()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Simulation failed:', error.message)
    process.exit(1)
  })


