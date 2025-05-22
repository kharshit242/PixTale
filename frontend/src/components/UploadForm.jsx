// Components/UploadForm.jsx
import { useState } from 'react';

function UploadForm({ onSubmit, isLoading }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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
  };

  return (
    <div className="upload-form">
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
          <div className="image-preview">
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
