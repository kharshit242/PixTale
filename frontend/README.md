# PixTale - Turn Images into Stories

PixTale is a modern web application that generates creative stories based on uploaded images. The application also provides an audio version of the story for an immersive experience.

## Project Overview

This project is a frontend-first implementation with mock API responses to simulate the backend functionality. The actual backend implementation will come later using Node.js, Express, LangChain, and Groq AI models.

## Features

- **Image Upload**: Users can upload images from their device
- **Story Generation**: The app generates a creative story based on the uploaded image
- **Audio Playback**: Users can listen to an audio version of the generated story

## Tech Stack

- **Frontend**:
  - Vite (Build tool)
  - React (UI library)
  - CSS (Styling)
  - Axios (HTTP client for API calls)

## Project Structure

```
frontend/
│
├── public/                # Static files
│   ├── audio/             # Audio files for stories
│   │   └── sample.mp3     # Mock audio file
│   └── ...
│
├── src/                   # Source files
│   ├── components/        # React components
│   │   ├── Header.jsx     # App header component
│   │   ├── UploadForm.jsx # Image upload form
│   │   └── StoryResult.jsx# Story display component
│   │
│   ├── services/          # API and service functions
│   │   └── api.js         # Mock API service
│   │
│   ├── App.jsx            # Main App component
│   ├── App.css            # App-specific styles
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
│
├── package.json           # Project dependencies and scripts
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd pixtale/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided URL (usually http://localhost:5173)

## Future Plans

- Integration with a Node.js backend
- Implement AI-powered story generation using LangChain and Groq
- Add user authentication
- Create a library of generated stories for users
- Add more customization options for story generation

## License

[MIT](LICENSE)
