#!/usr/bin/env node

/**
 * Simple test script for the AI Text Humanizer
 * Run with: node test-humanizer.js
 */

const BASE_URL = 'http://localhost:3050';

async function testHumanizerAPI() {
  console.log('🧪 Testing AI Text Humanizer API...\n');

  const testCases = [
    {
      name: 'Basic Humanization - Casual',
      text: 'This is an AI-generated text that needs to be humanized. The artificial intelligence system processes data efficiently.',
      preset: 'casual'
    },
    {
      name: 'Professional Style',
      text: 'The aforementioned system demonstrates optimal performance characteristics and provides comprehensive solutions.',
      preset: 'professional'
    },
    {
      name: 'Minimal Errors',
      text: 'This document contains important information that requires careful review and analysis.',
      preset: 'minimal-errors'
    },
    {
      name: 'Playful Style',
      text: 'The system is working perfectly and all functions are operational as expected.',
      preset: 'playful'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Preset: ${testCase.preset}`);

    try {
      const response = await fetch(`${BASE_URL}/api/humanizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text,
          preset: testCase.preset
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success!`);
        console.log(`Humanized: "${data.humanized_text}"`);
        console.log(`AI Score: ${data.ai_score?.toFixed(2) || 'N/A'}`);
        console.log(`Detector Passed: ${data.detector_result?.passed ? 'Yes' : 'No'}`);
        console.log(`Tokens Used: ${data.tokens_used}`);
        console.log(`Credits Remaining: ${data.credits_remaining}`);
      } else {
        const error = await response.text();
        console.log(`❌ Error ${response.status}: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test history endpoint
  console.log('\n📚 Testing History Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/humanizer`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ History retrieved: ${data.history?.length || 0} items`);
    } else {
      console.log(`❌ History Error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ History Network Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n🎉 Testing completed!');
}

// Test error cases
async function testErrorCases() {
  console.log('\n🚨 Testing Error Cases...\n');

  const errorCases = [
    {
      name: 'No Text',
      body: { preset: 'casual' },
      expectedStatus: 400
    },
    {
      name: 'Empty Text',
      body: { text: '', preset: 'casual' },
      expectedStatus: 400
    },
    {
      name: 'Text Too Long',
      body: { text: 'A'.repeat(5000), preset: 'casual' },
      expectedStatus: 400
    }
  ];

  for (const testCase of errorCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/humanizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body)
      });

      if (response.status === testCase.expectedStatus) {
        console.log(`✅ Correctly returned ${response.status}`);
      } else {
        console.log(`❌ Expected ${testCase.expectedStatus}, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Text Humanizer Tests\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('Make sure the development server is running!\n');

  await testHumanizerAPI();
  await testErrorCases();
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/humanizer`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('Please start the development server with: npm run dev');
    process.exit(1);
  }

  await runTests();
}

main().catch(console.error);
