// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // 🔁 Update port here if needed

const apiService = {
  generateStory: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Process response data - ensure audioUrl is absolute
      const data = response.data;
      
      // If audioUrl is a relative path, convert it to an absolute URL
      if (data.audioUrl && data.audioUrl.startsWith('/')) {
        data.audioUrl = `http://localhost:3000${data.audioUrl}`;
      }
      
      console.log('Received data from API:', data);
      return data; // { story, audioUrl }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default apiService;
