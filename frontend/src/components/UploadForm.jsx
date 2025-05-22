// Components/UploadForm.jsx
import { useState, useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';

function UploadForm({ onSubmit, isLoading }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const formRef = useRef(null);
  const previewRef = useRef(null);
    // Initialize tilt effect
  useEffect(() => {
    if (formRef.current) {
      VanillaTilt.init(formRef.current, {
        max: 5,
        speed: 400,
        glare: true,
        'max-glare': 0.2,
      });
    }
    
    // Add tilt effect to image preview when it exists
    if (previewRef.current && previewUrl) {
      VanillaTilt.init(previewRef.current, {
        max: 15,
        speed: 300,
        glare: true,
        'max-glare': 0.5,
        scale: 1.05
      });
    }
    
    // Clean up tilt effect when component unmounts
    return () => {
      if (formRef.current && formRef.current.vanillaTilt) {
        formRef.current.vanillaTilt.destroy();
      }
      if (previewRef.current && previewRef.current.vanillaTilt) {
        previewRef.current.vanillaTilt.destroy();
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (image) {
      onSubmit(image);
    } else {
      alert('Please select an image first');
    }
  };  return (
    <div className="upload-form" ref={formRef}>
      <h2>Upload an Image</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="image-upload"
            className="file-input"
          />
          <label htmlFor="image-upload" className="file-input-label">
            {previewUrl ? 'Change Image' : 'Select Image'}
          </label>
        </div>

        {previewUrl && (
          <div className="image-preview" ref={previewRef}>
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <button 
          type="submit" 
          className="generate-button"
          disabled={!image || isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Story'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
