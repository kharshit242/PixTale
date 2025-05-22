// Components/StoryResult.jsx
import { useState, useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';

function StoryResult({ story, audioUrl }) {
  const audioRef = useRef(null);
  const resultCardRef = useRef(null);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Initialize tilt effect for the result card
  useEffect(() => {
    if (resultCardRef.current) {
      VanillaTilt.init(resultCardRef.current, {
        max: 3,         // Maximum tilt rotation (degrees)
        perspective: 1000, // Transform perspective, the lower the more extreme the tilt gets
        speed: 300,     // Speed of the enter/exit transition
        glare: true,    // Enable glare effect
        'max-glare': 0.1, // Maximum glare opacity
        scale: 1.02,    // Scale on hover
      });
    }
    
    // Clean up tilt effect when component unmounts
    return () => {
      if (resultCardRef.current && resultCardRef.current.vanillaTilt) {
        resultCardRef.current.vanillaTilt.destroy();
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioUrl) {
      setAudioLoading(true);
      setAudioError(false);
    }
  }, [audioUrl]);
  
  // Text Scramble/Decode Effect
  useEffect(() => {
    if (story) {
      setIsTyping(true);
      
      // Characters to use for scrambling
      const chars = "!<>-_\\/[]{}—=+*^?#________";
      const fullStory = story;
      
      // Start with completely scrambled text of the same length
      let scrambledText = "";
      for (let i = 0; i < fullStory.length; i++) {
        if (fullStory[i] === ' ' || fullStory[i] === '\n') {
          scrambledText += fullStory[i]; // Preserve spaces and line breaks
        } else {
          scrambledText += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayedText(scrambledText);
      
      // Track which characters have been decoded
      const decoded = new Array(fullStory.length).fill(false);
      let decodedCount = 0;
      const totalToDecode = fullStory.split('').filter(char => char !== ' ' && char !== '\n').length;
      
      // Create a queue of positions to decode
      const positions = [];
      for (let i = 0; i < fullStory.length; i++) {
        if (fullStory[i] !== ' ' && fullStory[i] !== '\n') {
          positions.push(i);
        }
      }
      
      // Shuffle the positions for more random decoding
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
      
      // Decode characters at a steady rate
      const decodeInterval = setInterval(() => {
        // Decode some characters
        const batchSize = Math.max(1, Math.floor(totalToDecode / 20)); // Decode in batches
        for (let i = 0; i < batchSize && decodedCount < totalToDecode; i++) {
          const pos = positions[decodedCount];
          decoded[pos] = true;
          decodedCount++;
        }
        
        // Update the displayed text
        let newText = '';
        for (let i = 0; i < fullStory.length; i++) {
          if (decoded[i] || fullStory[i] === ' ' || fullStory[i] === '\n') {
            newText += fullStory[i];
          } else {
            // For undecoded characters, show a random character
            newText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setDisplayedText(newText);
        
        // Check if we're done
        if (decodedCount >= totalToDecode) {
          clearInterval(decodeInterval);
          setDisplayedText(fullStory);
          setTimeout(() => setIsTyping(false), 500); // Keep typing class a bit longer
        }
      }, 100);
      
      return () => {
        clearInterval(decodeInterval);
      };
    }
  }, [story]);

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
  }  return (
    <div className="story-result" ref={resultCardRef}>
      <div className="story-header">
        <h2>Your Story</h2>
      </div>
      
      <div className="story-content">
        {story ? (
          <p className={isTyping ? 'typing' : 'decoded'}>{displayedText || story}</p>
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
            onCanPlay={handleAudioReady}
            onError={handleAudioError}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default StoryResult;
