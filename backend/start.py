#!/usr/bin/env python
"""
PixTale API Server Launcher
---------------------------
This script starts the FastAPI server for the PixTale API.
"""
import os
import sys
import uvicorn
from pathlib import Path

def check_dependencies():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import python_multipart
        import dotenv
        import langchain
        import gtts
        import PIL
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def start_server():
    """Start the FastAPI server"""
    # Load path and environment
    backend_dir = Path(__file__).resolve().parent
    port = int(os.getenv("PORT", 3000))

    # Print startup information
    print(f"🚀 Starting PixTale API Server")
    print(f"📁 Backend directory: {backend_dir}")
    print(f"🔌 Server will run on port: {port}")
    
    # Check for .env file
    env_path = backend_dir / ".env"
    if not env_path.exists():
        print(f"⚠️ Warning: .env file not found at {env_path}")
        print("  Make sure NVIDIA_API_KEY is set in your environment")
    
    # Start the server
    print(f"🌐 Server starting at http://localhost:{port}")
    print(f"📚 API documentation available at http://localhost:{port}/docs")
    print(f"Press Ctrl+C to stop the server")
    
    os.chdir(str(backend_dir))  # Change to backend directory
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

if __name__ == "__main__":
    if check_dependencies():
        start_server()
    else:
        sys.exit(1)
