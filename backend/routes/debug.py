from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import os
import sys
from pathlib import Path

router = APIRouter()

@router.get("/")
async def debug_info():
    try:
        # Get information about environment, dependencies, and file system
        upload_dir = Path(__file__).parent.parent / "uploads"
        image_files = list(upload_dir.glob("image-*.jpg")) + list(upload_dir.glob("image-*.png"))
        audio_files = list(upload_dir.glob("story-*.mp3"))
        
        return {
            "success": True,
            "environment": {
                "python_version": sys.version,
                "node_env": os.getenv("NODE_ENV", "development"),
                "nvidia_api_configured": bool(os.getenv("NVIDIA_API_KEY")),
                "port": os.getenv("PORT", 3000)
            },
            "uploads": {
                "image_count": len(image_files),
                "audio_count": len(audio_files),
                "recent_images": [f.name for f in sorted(image_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]],
                "recent_audio": [f.name for f in sorted(audio_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]]
            }
        }
    except Exception as e:
        print(f"Error in debug route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
