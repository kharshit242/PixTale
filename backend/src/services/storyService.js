// src/services/storyService.js
const fs = require('fs');
const path = require('path');
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage } = require('langchain/schema');

// Initialize Groq chat model
const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "meta-llama/llama-4-scout-17b-16e-instruct", // Using Llama-3-8b model which is efficient and good for creative tasks
});

/**
 * Generates a story based on an image using Groq API
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Object} - Story and audio URL
 */
exports.generateStoryFromImage = async (imagePath) => {
  try {
    // For now, we're not actually analyzing the image content since that would require
    // an image analysis model. We'll simulate the image analysis with a placeholder.
    // In a production app, you'd use a vision model to first analyze the image.
    
    // Read image metadata
    const stats = fs.statSync(imagePath);
    const fileSizeInBytes = stats.size;
    const fileName = path.basename(imagePath);
    
    // Create prompt for story generation
    const prompt = `Generate a creative, engaging short story (300-400 words) based on an image 
    with filename ${fileName}. The story should be imaginative, suitable for all ages, and 
    have a clear beginning, middle, and end. Make the story whimsical and captivating, as if 
    describing a magical world discovered within the image. Don't mention that you're creating 
    a story based on a filename - just create the story as if you can see the image perfectly.`;

    // Call Groq API to generate the story
    const response = await groq.invoke([
      new HumanMessage(prompt)
    ]);

    // Extract the story text from the response
    const story = response.content;

    // In a real application, you would also generate audio here
    // For now, we'll return a placeholder audio URL
    const audioUrl = "/audio/sample.mp3";

    return { 
      story, 
      audioUrl,
      metadata: {
        imageSize: fileSizeInBytes,
        fileName: fileName,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error in story generation service:", error);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
};

/**
 * Generates audio from text using TTS service
 * @param {string} text - Text to convert to audio
 * @returns {string} - URL to the generated audio file
 */
exports.generateAudioFromText = async (text) => {
  try {
    // In a real implementation, you would use a Text-to-Speech API here
    // For now, we'll return a placeholder audio URL
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return "/audio/sample.mp3";
  } catch (error) {
    console.error("Error in audio generation service:", error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};
