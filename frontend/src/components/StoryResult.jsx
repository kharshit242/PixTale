// Components/StoryResult.jsx
import { useState, useEffect, useRef } from 'react';

function StoryResult({ story, audioUrl }) {
  const audioRef = useRef(null);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      setAudioLoading(true);
      setAudioError(false);
    }
  }, [audioUrl]);

  const handleAudioReady = () => {
    setAudioLoading(false);
    // Auto-play audio when available
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(error => {
        console.log('Auto-play prevented:', error);
      });
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    setAudioLoading(false);
  };

  if (!story && !audioUrl) {
    return null;
  }

  return (
    <div className="story-result">
      <h2>Your Story</h2>
      
      <div className="story-content">
        {story ? (
          <p>{story}</p>
        ) : (
          <p className="loading-text">Generating your story...</p>
        )}
      </div>
      
      {audioUrl && (
        <div className="audio-player">
          <h3>Listen to Your Story</h3>
          <audio 
            ref={audioRef} 
            controls 
            src={audioUrl}
            className="audio-element"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default StoryResult;
