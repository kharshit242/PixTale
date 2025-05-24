from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import time
import os

# Import our story generation service
from utils.gemini_langchain_services import generate_story_and_audio

router = APIRouter()

@router.post("/")
async def generate_story(file: UploadFile = File(...)):
    try:
        # Generate a timestamp for the filename
        timestamp = int(time.time() * 1000)
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        filename = f"image-{timestamp}{file_extension}"
        
        # Save the uploaded file
        upload_dir = Path(__file__).parent.parent / "uploads"
        file_path = upload_dir / filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"Image saved to {file_path}")
        
        # Generate story and audio
        result = generate_story_and_audio(str(file_path))
        
        # Prepare response - convert audio path to relative URL
        audio_filename = Path(result["audioPath"]).name
        audio_url = f"/uploads/{audio_filename}"
        
        return {
            "success": True,
            "story": result["story"],
            "audioUrl": audio_url
        }
        
    except Exception as e:
        print(f"Error generating story: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
