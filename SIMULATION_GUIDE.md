# 🎲 Survey Simulation Guide

Quick guide to generating test data for your survey statistics features.

## ⚡ Quick Start (Easiest Method)

Create a complete test survey with simulated responses in one command:

```bash
npm run simulate
```

**What this does:**
- ✅ Creates a test user account
- ✅ Creates a survey with 8 sample questions
- ✅ Generates 100 diverse simulated responses
- ✅ Prints login credentials for testing

### Custom Configuration

```bash
# Generate 50 responses with 5 questions
npm run simulate 50 5

# Generate 200 responses with 8 questions  
npm run simulate 200 8

# Or use node directly for more control
node scripts/quick-simulate.js 150 10
```

## 📊 Response Patterns

Your simulated survey will include 8 different response patterns:

```
Question 1: Very Positive    [▁▂▃▅█] - Most responses are 4-5
Question 2: Positive          [▂▃▄▇█] - Skewed toward positive
Question 3: Neutral           [▃▅█▅▃] - Bell curve, centered on 3
Question 4: Negative          [█▇▄▃▂] - Skewed toward negative  
Question 5: Very Negative     [█▅▃▂▁] - Most responses are 1-2
Question 6: Bimodal           [█▃▃▃█] - Love it or hate it
Question 7: Mixed             [▅▅▆▅▅] - Evenly distributed
Question 8: Strong Bimodal    [█▁ ▁█] - Highly polarized
```

This gives you diverse data to test different statistical scenarios!

## 🔧 Advanced Usage

### Step 1: Create Survey Only

```bash
npm run setup-survey
```

This creates a survey and gives you a survey ID like: `abc123def456`

### Step 2: Generate Responses

```bash
npm run simulate-responses abc123def456 100
```

Or with node directly:
```bash
node scripts/simulate-responses.js abc123def456 150
```

## 📈 Example Output

```
🚀 Quick Survey Simulation

📊 Configuration:
   Number of responders: 100
   Number of questions: 8

👤 Creating test user...
   ✅ User created: testuser_1697123456789

📋 Creating survey...
   ✅ Survey created: 67890abcdef12345

❓ Adding questions...
   1. How satisfied are you with the overall product quality? [veryPositive]
   2. How likely are you to recommend this to a friend? [positive]
   3. How easy was it to get started? [neutral]
   ...
   ✅ 8 questions added

🎲 Generating simulated responses...
   Progress: 100% (800 responses)
   ✅ All responses generated

======================================================================
✨ Simulation Complete!

📈 Statistics:
   Total responders: 100
   Total questions: 8
   Total responses: 800
   Time taken: 12.3s
   Responses/sec: 65.0

📝 Survey Details:
   Survey ID: 67890abcdef12345
   Owner ID:  user_12345
   Username:  testuser_1697123456789
   Password:  test123
======================================================================

💡 Next steps:
   1. Login to the web app with username: testuser_1697123456789
   2. View the survey results and test your statistics features
   3. Each question has a different response pattern for diverse testing
```

## 🧪 Testing Your Statistics Features

After generating data, you can test:

### 1. **Distribution Analysis**
- View response counts per question
- Calculate percentages for each choice (1-5)
- Identify most/least common responses

### 2. **Sentiment Analysis**  
- Test the `_analyzeSentiment` API endpoint
- Verify correct detection of positive/negative/bimodal/neutral patterns

### 3. **Aggregation Statistics**
- Calculate mean (average) score
- Find median response
- Identify mode (most common)
- Calculate standard deviation

### 4. **Visualization**
- Create bar charts of distributions
- Display histograms
- Show comparison across questions

### 5. **Advanced Analytics**
- Compare response patterns across questions
- Identify outliers or unusual distributions
- Calculate correlation between questions

## 🎯 Use Cases

### Testing with Different Sample Sizes

```bash
# Small sample (good for development)
npm run simulate 20 5

# Medium sample (typical use case)
npm run simulate 100 8

# Large sample (stress testing)
npm run simulate 500 10

# Very large (performance testing)
npm run simulate 1000 12
```

### Creating Multiple Test Surveys

```bash
# Run multiple times to create different test scenarios
npm run simulate 100 8  # Survey 1
npm run simulate 150 6  # Survey 2  
npm run simulate 75 10  # Survey 3
```

### Testing Specific Patterns

Edit `scripts/quick-simulate.js` to customize:
- Question text
- Response distributions
- Number of each pattern type

## 💡 Pro Tips

1. **Start small**: Begin with 50-100 responders to verify everything works
2. **Use the quick script**: `npm run simulate` is the fastest way to get started
3. **Save credentials**: The script prints login info - save it to test the UI
4. **Check patterns**: Each question gets a different response pattern automatically
5. **Multiple runs**: Create several surveys to test different scenarios

## 🐛 Troubleshooting

**Backend not running?**
```bash
# Make sure your backend is running on http://localhost:8000
curl http://localhost:8000/api
```

**Need to change the API URL?**
Edit the `API_BASE` constant in the script files.

**Want different questions?**
Edit the `SAMPLE_QUESTIONS` array in `scripts/quick-simulate.js`

**Need different patterns?**
Modify the `PATTERNS` object to change response distributions.

## 📚 More Information

See `scripts/README.md` for detailed documentation on all simulation scripts.


