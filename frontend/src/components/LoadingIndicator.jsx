// Components/LoadingIndicator.jsx
import { useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';

function LoadingIndicator() {
  const loadingRef = useRef(null);
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    // Animate the loading dots
    const dotsInterval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots.length >= 3) return '';
        return prevDots + '.';
      });
    }, 400);
    
    // Initialize tilt effect
    if (loadingRef.current) {
      VanillaTilt.init(loadingRef.current, {
        max: 10,
        speed: 400,
        glare: true,
        'max-glare': 0.3,
        scale: 1.1
      });
    }
    
    return () => {
      clearInterval(dotsInterval);
      if (loadingRef.current && loadingRef.current.vanillaTilt) {
        loadingRef.current.vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <div className="loading-indicator" ref={loadingRef}>
      <div className="loading-spinner"></div>
      <p className="loading-text">Crafting your story{dots}</p>
      <div className="loading-messages">
        <p>Analyzing your image...</p>
        <p>Creating a compelling narrative...</p>
        <p>Generating audio version...</p>
      </div>
    </div>
  );
}

export default LoadingIndicator;
import { useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';

function LoadingIndicator() {
  const loadingRef = useRef(null);
  const [dots, setDots] = useState('');
  const [loadingMessages, setLoadingMessages] = useState([
    'Analyzing your image...',
    'Creating a compelling narrative...',
    'Generating audio version...',
  ]);
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    // Animate the loading dots
    const dotsInterval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots.length >= 3) return '';
        return prevDots + '.';
      });
    }, 400);

    // Initialize tilt effect
    if (loadingRef.current) {
      VanillaTilt.init(loadingRef.current, {
        max: 10,
        speed: 400,
        glare: true,
        'max-glare': 0.3,
        scale: 1.1
      });
    }

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setActiveMessage(prevActiveMessage => {
        if (prevActiveMessage >= loadingMessages.length - 1) return 0;
        return prevActiveMessage + 1;
      });
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
      if (loadingRef.current && loadingRef.current.vanillaTilt) {
        loadingRef.current.vanillaTilt.destroy();
      }
    };
  }, [loadingMessages]);

  return (
    <div className="loading-indicator" ref={loadingRef}>
      <div className="loading-spinner"></div>
      <p className="loading-text">Crafting your story{dots}</p>
      <div className="loading-messages">
        {loadingMessages.map((message, index) => (
          <p key={index} className={index === activeMessage ? 'active' : ''}>
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

export default LoadingIndicator;