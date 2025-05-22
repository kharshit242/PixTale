// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const storyRoutes = require('./routes/storyRoutes');
const { errorMiddleware } = require('./utils/errorHandler');
const { validateEnv, getConfig } = require('./utils/config');

// Validate environment variables
if (!validateEnv()) {
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const config = getConfig();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(express.json());

// Configure CORS
const allowedOrigins = config.cors.allowedOrigins;

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/story', storyRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Use custom error handler middleware
app.use(errorMiddleware);

// Handle 404 - Keep this as the last route
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `
    ╔═════════════════════════════════════╗
    ║           PixTale API Server        ║
    ╚═════════════════════════════════════╝
  `);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🔗 API endpoints ready at http://localhost:${PORT}/api/`);
});
