// src/utils/config.js
/**
 * Configuration utility to manage environment variables
 */

// Validate required environment variables
exports.validateEnv = () => {
  const requiredEnvVars = [
    'GROQ_API_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

  if (missingEnvVars.length) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingEnvVars.forEach(env => console.error(`- ${env}`));
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }

  return true;
};

// Get configuration based on environment
exports.getConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  const config = {
    development: {
      cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 
          process.env.ALLOWED_ORIGINS.split(',') : 
          ['http://localhost:5173', 'http://localhost:5000']
      },
      upload: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      }
    },
    production: {
      cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 
          process.env.ALLOWED_ORIGINS.split(',') : 
          ['https://your-production-domain.com']
      },
      upload: {
        maxSize: 5 * 1024 * 1024, // 5MB for production
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    }
  };
  
  return config[environment];
};
