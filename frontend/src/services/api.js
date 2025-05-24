// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiService = {
  generateStory: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);


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
        const baseUrl = API_BASE_URL.replace('/api', '');
        data.audioUrl = `${baseUrl}${data.audioUrl}`;
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
