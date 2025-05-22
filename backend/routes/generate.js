// routes/generate.js - Handles image upload and story/audio generation
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateStoryAndAudio } = require('../utils/groq');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    // Save the image with a timestamped name and preserve original extension
    const ext = path.extname(file.originalname);
    cb(null, `image-${timestamp}${ext}`);
  }
});

// File filter to allow only JPG and PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG image files are allowed'), false);
  }
};

// Update for Multer v2 syntax
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

// POST endpoint to generate story and audio from an image
router.post('/', (req, res, next) => {
  // Handle multer errors outside of the main route handler
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Max size is 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    
    // Continue with the request if there's no multer error
    processImageAndGenerateStory(req, res, next);
  });
});

// Function to handle the image processing and story generation
async function processImageAndGenerateStory(req, res, next) {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('Image uploaded successfully:', req.file.path);
    
    // Get the uploaded image path
    const imagePath = req.file.path;

    console.log('Request body:', req.body);
    console.log('Uploaded file details:', req.file);

    // Check if the uploaded file exists
    if (!fs.existsSync(imagePath)) {
      console.error('Uploaded file not found:', imagePath);
      return res.status(500).json({
        success: false,
        message: 'Uploaded file not found on the server',
      });
    }

    // Generate story and audio using LangChain and Groq
    console.log('Generating story and audio...');
    const result = await generateStoryAndAudio(imagePath);

    // Construct the audio URL to be used by frontend
    const audioUrl = `/uploads/${path.basename(result.audioPath)}`;
    console.log('Generated audio:', audioUrl);
    console.log('Generated audio URL:', audioUrl);
    console.log('Returning audio URL to client:', audioUrl);

    // Return the response to the client
    return res.status(200).json({
      success: true,
      story: result.story,
      audioUrl: audioUrl
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    
    // Enhanced error logging for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      file: req.file ? req.file.path : 'No file uploaded',
      body: req.body,
    });

    // Handle specific errors
    if (error.message && error.message.includes('Only JPG and PNG')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Handle missing API key or API key errors
    if (error.message && error.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing API key',
        error: 'Please set up the GROQ_API_KEY in the .env file'
      });
    }
    
    // Handle other Groq API errors
    if (error.message && (error.message.includes('Groq') || error.message.includes('Unauthorized'))) {
      return res.status(500).json({
        success: false,
        message: 'AI service error',
        error: 'There was an issue with the AI service. Please try again later or check API keys.'
      });
    }
    
    // Generic error handling
    return res.status(500).json({
      success: false,
      message: 'Failed to generate story and audio',
      error: error.message
    });
  }
};

module.exports = router;