// services/api.js
import axios from 'axios';

// Mock data for frontend simulation
const mockStory = `Once upon a time, in a world not unlike our own, there existed a magical garden. In this garden, flowers spoke in whispers and trees danced when no one was watching. At the center stood a magnificent old oak tree, whose branches reached toward the heavens, telling stories of centuries past. 

One morning, a young girl named Lily discovered this garden while chasing her wayward kite. As she stepped through an archway of roses, the world around her transformed. Colors became more vibrant, sounds more melodious, and the air filled with sweet fragrances that seemed to tell stories of their own.

The oak tree noticed her immediately. "Welcome, young one," it rumbled in a voice as deep as its roots. "We've been waiting for someone like you."`;

// Mock API services
const apiService = {
  // Simulate uploading an image and generating a story
  generateStory: async (imageFile) => {
    // In a real app, we would upload the image to a server
    console.log('Uploading image:', imageFile.name);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data
    return {
      story: mockStory,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Using an external MP3 for testing
    };
  }
};

export default apiService;
