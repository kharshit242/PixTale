import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Add the parent directory to the path to import our module
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# Import our gemini langchain services
from utils.gemini_langchain_services import generate_story_from_image

# Load environment variables
load_dotenv()

def main():
    # Check that GOOGLE_API_KEY is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable is not set.")
        print("Please set it in your .env file.")
        return 1
    
    # Check if an image path was provided as a command-line argument
    if len(sys.argv) < 2:
        print("Error: No image path provided.")
        print("Usage: python test_gemini_story.py <path_to_image>")
        
        # Try to find an image in the uploads directory
        uploads_dir = backend_dir / "uploads"
        image_files = list(uploads_dir.glob("*.jpg")) + list(uploads_dir.glob("*.jpeg")) + list(uploads_dir.glob("*.png"))
        
        if not image_files:
            print("No image files found in uploads directory.")
            return 1
            
        # Use the most recent image file
        image_path = max(image_files, key=lambda f: f.stat().st_mtime)
        print(f"Using the most recent image: {image_path}")
    else:
        # Use the provided image path
        image_path = sys.argv[1]
        
    # Generate a story from the image
    try:
        print(f"Generating story from image: {image_path}")
        story = generate_story_from_image(image_path)
        print("\n======= GENERATED STORY =======")
        print(story)
        print("===============================\n")
        print("Story generation successful!")
        return 0
    except Exception as e:
        print(f"Error generating story: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
