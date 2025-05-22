// utils/groq.js - LangChain utility functions for Groq API calls
const fs = require('fs').promises;
const path = require('path');
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const gTTS = require('gtts');

/**
 * Reads an image file and converts it to base64 format
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Base64 encoded image data
 */
async function imageToBase64(imagePath) {
  try {
    // Read the image file as a buffer
    const data = await fs.readFile(imagePath);
    
    // Convert buffer to base64 string
    const base64Image = data.toString('base64');
    
    // Determine mime type from file extension
    const extname = path.extname(imagePath).toLowerCase();
    let mimeType;
    if (extname === '.png') {
      mimeType = 'image/png';
    } else if (extname === '.jpg' || extname === '.jpeg') {
      mimeType = 'image/jpeg';
    } else {
      throw new Error('Unsupported image format');
    }
    
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Generates a story based on an image using LangChain and Groq
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Generated story text
 */
async function generateStory(imagePath) {
  try {
    // Check if GROQ_API_KEY is set
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in environment variables');
      throw new Error('Missing GROQ_API_KEY. Please add it to your .env file');
    }

    // Convert image to base64
    const base64Image = await imageToBase64(imagePath);
    console.log(`Successfully converted image to base64: ${imagePath}`);

    // Initialize the LangChain ChatGroq model for image-to-text
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    console.log('Initialized ChatGroq model for image-to-text');

    // System prompt to guide the AI
    const systemPrompt = new SystemMessage(
      "You are a creative storyteller that creates imaginative, engaging, and family-friendly short stories (around 150-250 words) based on images. " +
      "Create a whimsical, positive narrative that captures the essence of the image. " +
      "Your stories should have a clear beginning, middle, and end, with vivid descriptions. " +
      "Avoid any adult, violent, political, or controversial themes."
    );

    // Human message with the image
    const humanPrompt = new HumanMessage({
      content: `Generate a creative short story based on this image: ${base64Image}`
    });

    console.log('Making API call to Groq for story generation...');
    // Call the model and get the response
    const response = await model.invoke([systemPrompt, humanPrompt]);
    console.log('Successfully received response from Groq API');

    // Extract and return the story text
    return response.content;
  } catch (error) {
    console.error('Error generating story from image:', error);
    throw error;
  }
}

/**
 * Generates audio from text using gTTS
 * @param {string} text - The text to convert to speech
 * @returns {Promise<string>} - Path to the generated audio file
 */
async function generateAudio(text) {
  try {
    console.log('Initializing gTTS for text-to-speech conversion...');

    // Create a gTTS instance with the story text
    const gtts = new gTTS(text, 'en');

    // Create a timestamped filename for the audio file
    const timestamp = Date.now();
    const audioFileName = `story-${timestamp}.mp3`;
    const audioPath = path.join(__dirname, '../uploads', audioFileName);

    // Save the audio file
    await new Promise((resolve, reject) => {
      gtts.save(audioPath, (err) => {
        if (err) {
          console.error('Error saving audio file:', err);
          return reject(err);
        }
        console.log('Audio file saved successfully:', audioPath);
        resolve();
      });
    });

    return audioPath;
  } catch (error) {
    console.error('Error generating audio from text using gTTS:', error);
    throw error;
  }
}

/**
 * Main function to generate both story and audio from an image
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - Object containing story text and audio file path
 */
async function generateStoryAndAudio(imagePath) {
  try {
    // Generate story from image
    const story = await generateStory(imagePath);
    
    // Generate audio from story
    const audioPath = await generateAudio(story);
    
    return {
      story,
      audioPath
    };
  } catch (error) {
    console.error('Error in generateStoryAndAudio:', {
      message: error.message,
      stack: error.stack,
      imagePath,
      storyGenerated: typeof story !== 'undefined' ? story : 'Story generation failed',
    });
    throw error;
  }
}

module.exports = {
  generateStoryAndAudio
};