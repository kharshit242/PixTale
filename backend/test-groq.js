// Quick test script for Groq API key
require('dotenv').config();
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage } = require('@langchain/core/messages');

async function testGroqAPIKey() {
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not set in environment variables');
    return false;
  }
  
  try {
    console.log('Testing Groq API key...');
    
    // Initialize the LangChain ChatGroq model
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    
    // Simple test message
    const humanPrompt = new HumanMessage({
      content: "Hello, please respond with a simple 'API key is working!' if you can read this message."
    });
    
    // Call the model and get the response
    const response = await model.invoke([humanPrompt]);
    
    console.log('✅ Groq API Response:', response.content);
    console.log('✅ API key is valid and working');
    return true;
  } catch (error) {
    console.error('❌ Error testing Groq API key:', error.message);
    console.error('Please check your GROQ_API_KEY in the .env file');
    return false;
  }
}

// Run the test
testGroqAPIKey();
