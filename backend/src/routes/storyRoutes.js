// src/routes/storyRoutes.js
const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const upload = require('../utils/fileUpload');

// Generate story route - accepts an image file
router.post('/generate', upload.single('image'), storyController.generateStory);

// Generate audio from text route
router.post('/generate-audio', storyController.generateAudio);

module.exports = router;
