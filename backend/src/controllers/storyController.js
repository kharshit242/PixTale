// src/controllers/storyController.js
const storyService = require('../services/storyService');

/**
 * Controller to handle story generation from images
 */
exports.generateStory = async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Get file path
    const imagePath = req.file.path;
    
    // Generate story using the service
    const result = await storyService.generateStoryFromImage(imagePath);

    return res.json(result);
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ 
      message: 'Failed to generate story',
      error: process.env.NODE_ENV === 'production' ? {} : error.message 
    });
  }
};

/**
 * Controller to handle audio generation from text
 */
exports.generateAudio = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide text for audio generation' });
    }

    // Generate audio
    const audioUrl = await storyService.generateAudioFromText(text);

    return res.json({ audioUrl });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ 
      message: 'Failed to generate audio',
      error: process.env.NODE_ENV === 'production' ? {} : error.message 
    });
  }
};
