import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import StoryResult from './components/StoryResult';
import apiService from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const handleImageSubmit = async (imageFile) => {
    setIsLoading(true);
    setStory('');
    setAudioUrl('');
    
    try {
      // Call our mock API service
      const result = await apiService.generateStory(imageFile);
      
      setStory(result.story);
      setAudioUrl(result.audioUrl);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <UploadForm 
          onSubmit={handleImageSubmit}
          isLoading={isLoading}
        />
        
        <StoryResult 
          story={story}
          audioUrl={audioUrl}
        />
      </main>
      
      <footer className="app-footer">
        <p>PixTale &copy; {new Date().getFullYear()} - Turn Images into Stories</p>
      </footer>
    </div>
  );
}

export default App;
