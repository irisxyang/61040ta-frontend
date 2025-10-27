# Survey Simulation Scripts

This directory contains scripts to help you test your survey application with realistic data.

## Quick Start (Recommended)

The easiest way to create a test survey with simulated responses:

```bash
node scripts/quick-simulate.js [num_responders] [num_questions]
```

**Examples:**
```bash
# Create survey with 100 responders and 8 questions (default)
node scripts/quick-simulate.js

# Create survey with 50 responders and 5 questions
node scripts/quick-simulate.js 50 5

# Create survey with 200 responders and 10 questions
node scripts/quick-simulate.js 200 10
```

This script will:
1. Create a test user account
2. Create a new survey with sample questions
3. Generate diverse simulated responses
4. Print login credentials and survey details

## Advanced Usage

### Step-by-Step Simulation

If you want more control, use the two-step process:

#### Step 1: Create Test Survey

```bash
node scripts/setup-test-survey.js
```

This creates a survey and prints the survey ID. Save this ID for the next step.

#### Step 2: Generate Responses

```bash
node scripts/simulate-responses.js <survey-id> [num_responders]
```

**Examples:**
```bash
# Generate 50 responses (default)
node scripts/simulate-responses.js abc123def456

# Generate 200 responses
node scripts/simulate-responses.js abc123def456 200
```

## Response Patterns

The simulation generates 8 different response distribution patterns to create diverse and realistic data:

| Pattern | Description | Distribution |
|---------|-------------|--------------|
| **veryPositive** | Strongly positive responses | Heavily weighted toward 5 |
| **positive** | Moderately positive | Weighted toward 4-5 |
| **neutral** | Balanced/centered | Bell curve centered on 3 |
| **negative** | Moderately negative | Weighted toward 1-2 |
| **veryNegative** | Strongly negative | Heavily weighted toward 1 |
| **bimodal** | Polarized opinions | High on both ends (1 & 5) |
| **strongBimodal** | Very polarized | Almost only 1s and 5s |
| **mixed** | Evenly distributed | Roughly equal across all |

Questions in your survey will automatically cycle through these patterns, giving you diverse data to test your statistics features.

## Testing Statistics Features

After running the simulation, you can test various statistical analyses:

1. **Distribution Analysis** - View response counts for each question
2. **Sentiment Analysis** - Test the `_analyzeSentiment` endpoint
3. **Pattern Recognition** - Identify bimodal, positive, negative, and neutral patterns
4. **Aggregation** - Calculate means, medians, modes across questions
5. **Visualization** - Create charts showing distribution patterns

## API Testing

The `test-api.js` script runs comprehensive integration tests:

```bash
node scripts/test-api.js
```

This tests all API endpoints to ensure everything works correctly.

## Tips

- **Large datasets**: Start with 100-200 responders. You can always generate more.
- **Pattern testing**: The quick-simulate script assigns different patterns to each question
- **Multiple surveys**: Run the scripts multiple times to create different test scenarios
- **Real-time testing**: Generate responses while viewing results in the web app to see live updates

## Troubleshooting

**"Survey ID is required" error**
- Make sure you're passing the survey ID as the first argument
- Check that the survey exists in your database

**"Failed to submit response" error**
- Ensure your backend server is running on `http://localhost:8000`
- Check that the survey and questions exist

**Slow generation**
- Each response requires an API call, so large simulations take time
- The script shows progress as it runs
- Typical speed: 20-50 responses per second

## Configuration

Edit the scripts to customize:
- Question text (in `SAMPLE_QUESTIONS` array)
- Response patterns (in `PATTERNS` object)
- API endpoint (change `API_BASE` constant)
- Distribution weights (modify pattern percentages)


