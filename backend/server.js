// server.js - Express server for PixTale API
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Verify required environment variables
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set in environment variables');
  console.error('Please add it to your .env file and restart the server');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5173;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:5173', // Vite default dev server
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/generate', require('./routes/generate'));
app.use('/api/debug', require('./routes/debug'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const envStatus = process.env.GROQ_API_KEY ? 'Environment: OK' : 'Missing GROQ_API_KEY';
  res.status(200).json({ 
    status: 'ok', 
    message: 'PixTale API is running',
    environment: envStatus
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PixTale API server running on port ${PORT}`);
  console.log(`Uploads available at http://localhost:${PORT}/uploads/`);
  console.log(`Health check at http://localhost:${PORT}/api/health`);
});