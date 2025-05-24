import os
import base64
import mimetypes
from pathlib import Path
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage
from gtts import gTTS
import time
from PIL import Image, ImageDraw

# Determine the project's backend root directory for loading .env and saving uploads
# Assumes this script is in backend/utils/
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"
UPLOAD_DIR = BACKEND_DIR / "uploads"

def image_to_base64(image_path_str: str) -> str:
    """
    Reads an image file and converts it to base64 data URI format.
    """
    try:
        image_path = Path(image_path_str)
        if not image_path.is_file():
            raise FileNotFoundError(f"Image file not found: {image_path_str}")
        image_data = image_path.read_bytes()
        base64_encoded_data = base64.b64encode(image_data).decode('utf-8')

        mime_type, _ = mimetypes.guess_type(image_path)
        if mime_type is None:
            # Fallback for common types if mimetypes fails (e.g., on some minimal OS installs)
            ext = image_path.suffix.lower()
            if ext == ".png":
                mime_type = "image/png"
            elif ext in [".jpg", ".jpeg"]:
                mime_type = "image/jpeg"
            else:
                raise ValueError(f"Unsupported image format or could not determine MIME type for: {ext}")

        return f"data:{mime_type};base64,{base64_encoded_data}"
    except Exception as e:
        print(f"Error converting image to base64: {e}")
        raise

def generate_story_from_image(image_path_str: str) -> str:
    """
    Generates a story based on an image using LangChain and NVIDIA model.
    """
    load_dotenv(dotenv_path=ENV_PATH)
    nvidia_api_key = os.getenv("NVIDIA_API_KEY")

    if not nvidia_api_key:
        print("NVIDIA_API_KEY is not set in environment variables. Please check your .env file.")
        raise ValueError("Missing NVIDIA_API_KEY. Please add it to your .env file in the backend directory.")

    try:
        base64_image = image_to_base64(image_path_str)
        print(f"Successfully converted image to base64: {image_path_str}")

        # Initialize the LangChain model with NVIDIA configuration
        model = init_chat_model(
            "mistralai/mistral-medium-3-instruct",
            model_provider="nvidia",
            temperature=0.7,
             max_tokens=32768
        )
        print("Initialized LangChain model with init_chat_model and NVIDIA provider")

        system_prompt_text = (
            "Generate a story of no more than 300 words that is entirely based on the objects, settings, characters, and actions visible in the image.  "
            "The story can embrace any theme—such as adventure, mystery, romance, or slice of life—that naturally fits the image."
            " Ensure the narrative has a clear beginning, middle, and end, all derived from the image."
            " Do not include any elements, characters, or actions not present in the image. " \
            "Focus solely on what is visible to craft a complete and engaging story."
        )

        human_prompt_text = f"Generate a creative short story based on this image: {base64_image}"

        messages = [
            SystemMessage(content=system_prompt_text),
            HumanMessage(content=human_prompt_text)
        ]

        print("Making API call to NVIDIA for story generation...")
        response = model.invoke(messages)
        print("Successfully received response from NVIDIA API.")

        return response.content

    except Exception as e:
        print(f"Error generating story from image: {e}")
        raise

def generate_audio_from_text(text: str) -> str:
    """
    Generates audio from text using gTTS and saves it to the UPLOAD_DIR.
    """
    try:
        print("Initializing gTTS for text-to-speech conversion...")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True) # Ensure upload directory exists
        
        timestamp = int(time.time() * 1000) # Milliseconds timestamp like JS Date.now()
        audio_file_name = f"story-{timestamp}.mp3"
        audio_file_path = UPLOAD_DIR / audio_file_name

        gtts_obj = gTTS(text=text, lang='en', slow=False)
        gtts_obj.save(str(audio_file_path))
        
        print(f"Audio file saved successfully: {audio_file_path}")
        # Return the path relative to the backend directory or an absolute path as needed by the caller
        # For consistency with potential Node.js callers, returning an absolute path string.
        return str(audio_file_path.resolve())
    except Exception as e:
        print(f"Error generating audio from text using gTTS: {e}")
        raise

def generate_story_and_audio(image_path_str: str) -> dict:
    """
    Main function to generate both story and audio from an image.
    """
    try:
        story = generate_story_from_image(image_path_str)
        audio_path = generate_audio_from_text(story)
        
        return {
            "story": story,
            "audioPath": audio_path # Consistent with JS key
        }
    except Exception as e:
        print(f"Error in generate_story_and_audio: {e}")
        # It's useful to return or log more context if needed
        raise ValueError(f"Failed to generate story and audio for {image_path_str}: {e}")

if __name__ == "__main__":
    print(f"Loading .env from: {ENV_PATH}")
    if not ENV_PATH.exists():
        print(f"Warning: .env file not found at {ENV_PATH}. Make sure it exists and NVIDIA_API_KEY is set.")

    # Create a dummy image for testing if none exists
    dummy_image_path = UPLOAD_DIR / "test_dummy_image.png"
    if not dummy_image_path.exists():
        try:
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            img = Image.new('RGB', (100, 100), color='red')
            draw = ImageDraw.Draw(img)
            draw.text((10, 10), "Test", fill='black')
            img.save(dummy_image_path)
            print(f"Created dummy test image: {dummy_image_path}")
            test_image_to_use = str(dummy_image_path)
        except Exception as e_img:
            print(f"Could not create dummy image: {e_img}")
            test_image_to_use = None
    else:
        test_image_to_use = str(dummy_image_path)

    if test_image_to_use:
        print(f"Attempting to generate story and audio for: {test_image_to_use}")
        try:
            result = generate_story_and_audio(test_image_to_use)
            print("\n--- Result ---")
            print(f"Story: {result['story']}")
            print(f"Audio Path: {result['audioPath']}")
            print("----------------")
        except Exception as e:
            print(f"An error occurred during the test run: {e}")
    else:
        print("Please set a valid test_image_path in the script or ensure Pillow can create one.")

