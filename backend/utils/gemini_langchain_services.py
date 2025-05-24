import os
import base64
import mimetypes
import io
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
ENV_PATH = BACKEND_DIR / '.env'
UPLOAD_DIR = BACKEND_DIR / 'uploads'

def image_to_base64(image_path_str: str, max_dimension: int = 800, quality: int = 85) -> str:
    """
    Reads an image file, optimizes it to reduce token size, and converts it to base64 data URI format.
    """
    try:
        image_path = Path(image_path_str)
        if not image_path.is_file():
            raise FileNotFoundError(f'Image file not found: {image_path_str}')
        
        original_size = image_path.stat().st_size / 1024  # KB
        print(f'Original image size: {original_size:.2f} KB')
        
        with Image.open(image_path) as img:
            original_width, original_height = img.size
            print(f'Original dimensions: {original_width}x{original_height}')
            
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                alpha = img.convert('RGBA').split()[3]
                bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
                bg.paste(img, mask=alpha)
                img = bg.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            if original_width > max_dimension or original_height > max_dimension:
                if original_width > original_height:
                    new_width = max_dimension
                    new_height = int(original_height * (max_dimension / original_width))
                else:
                    new_height = max_dimension
                    new_width = int(original_width * (max_dimension / original_height))
                    
                img = img.resize((new_width, new_height), Image.LANCZOS)
                print(f'Resized to: {new_width}x{new_height}')
            
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=quality, optimize=True)
            img_byte_arr.seek(0)
            image_data = img_byte_arr.getvalue()
            
            optimized_size = len(image_data) / 1024  # KB
            print(f'Optimized image size: {optimized_size:.2f} KB (reduced by {(1 - optimized_size/original_size) * 100:.1f}%)')
            
            base64_encoded_data = base64.b64encode(image_data).decode('utf-8')
            mime_type = 'image/jpeg'
            
            base64_size = len(base64_encoded_data) / 1024  # KB
            print(f'Base64 string size: {base64_size:.2f} KB')
            
            return f'data:{mime_type};base64,{base64_encoded_data}'
    except Exception as e:
        print(f'Error converting image to base64: {e}')
        raise

def generate_story_from_image(image_path_str: str) -> str:
    """
    Generates a story based on an image using LangChain and Google Gemini Vision model.
    """
    load_dotenv(dotenv_path=ENV_PATH)
    google_api_key = os.getenv('GOOGLE_API_KEY')
    
    if not google_api_key:
        print('GOOGLE_API_KEY is not set in environment variables. Please check your .env file.')
        raise ValueError('Missing GOOGLE_API_KEY. Please add it to your .env file in the backend directory.')
        
    try:
        base64_image = image_to_base64(image_path_str, max_dimension=600, quality=80)
        print(f'Successfully converted image to base64: {image_path_str}')
        
        base64_size_kb = len(base64_image) / 1024
        print(f'Base64 image size: {base64_size_kb:.2f} KB')
        
        if base64_size_kb > 500:
            print(f'WARNING: Image base64 size is quite large ({base64_size_kb:.2f} KB). This may exceed token limits.')

        # Updated model to gemini-pro-vision for image support
        model = init_chat_model(
            'Gemini 2.0 Flash',
            model_provider='google_genai',
            temperature=0.7,
            max_output_tokens=1024
        )
        print('Initialized LangChain model with Gemini Vision')

        system_prompt_text = (
           "You are a creative storyteller that creates imaginative, engaging, and family-friendly short stories "
            "(around 100-300 words) based on images. Create a whimsical, positive narrative that captures the "
            "essence of the image. Your stories should have a clear beginning, middle, and end, with vivid "
            "descriptions. Avoid any adult, violent, political, or controversial themes. Keep story not more than 100 words."
        )

        # Extract only the base64 payload from the full data URI
        base64_payload = base64_image.split(',')[1]

        messages = [
            SystemMessage(content=system_prompt_text),
            HumanMessage(content=[
                {"type": "text", "text": "Generate a creative short story based on this image:"},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_payload}"}}
            ])
        ]

        print('Making API call to Google Gemini Vision for story generation...')
        response = model.invoke(messages)
        print('Successfully received response from Google Gemini Vision API.')
        
        del base64_image
        del messages
        
        return response.content

    except Exception as e:
        print(f'Error generating story from image: {e}')
        raise

def generate_audio_from_text(text: str) -> str:
    """
    Generates audio from text using gTTS and saves it to the UPLOAD_DIR.
    """
    try:
        print('Initializing gTTS for text-to-speech conversion...')
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        timestamp = int(time.time() * 1000)
        audio_file_name = f'story-{timestamp}.mp3'
        audio_file_path = UPLOAD_DIR / audio_file_name

        gtts_obj = gTTS(text=text, lang='en', slow=False)
        gtts_obj.save(str(audio_file_path))
        
        print(f'Audio file saved successfully: {audio_file_path}')
        return str(audio_file_path.resolve())
    except Exception as e:
        print(f'Error generating audio from text using gTTS: {e}')
        raise

def generate_story_and_audio(image_path_str: str) -> dict:
    """
    Main function to generate both story and audio from an image.
    """
    try:
        story = generate_story_from_image(image_path_str)
        audio_path = generate_audio_from_text(story)
        
        return {
            'story': story,
            'audioPath': audio_path
        }
    except Exception as e:
        print(f'Error in generate_story_and_audio: {e}')
        raise ValueError(f'Failed to generate story and audio for {image_path_str}: {e}')

if __name__ == '__main__':
    print(f'Loading .env from: {ENV_PATH}')
    if not ENV_PATH.exists():
        print(f'Warning: .env file not found at {ENV_PATH}. Make sure it exists and GOOGLE_API_KEY is set.')

    dummy_image_path = UPLOAD_DIR / 'test_dummy_image.png'
    if not dummy_image_path.exists():
        try:
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            img = Image.new('RGB', (100, 100), color='red')
            draw = ImageDraw.Draw(img)
            draw.text((10, 10), 'Test', fill='black')
            img.save(dummy_image_path)
            print(f'Created dummy test image: {dummy_image_path}')
            test_image_to_use = str(dummy_image_path)
        except Exception as e_img:
            print(f'Could not create dummy image: {e_img}')
            test_image_to_use = None
    else:
        test_image_to_use = str(dummy_image_path)

    if test_image_to_use:
        print(f'Attempting to generate story and audio for: {test_image_to_use}')
        try:
            result = generate_story_and_audio(test_image_to_use)
            print('\n--- Result ---')
            print(f'Story: {result["story"]}')
            print(f'Audio Path: {result["audioPath"]}')
            print('----------------')
        except Exception as e:
            print(f'An error occurred during the test run: {e}')
    else:
        print('Please set a valid test_image_path in the script or ensure Pillow can create one.')
