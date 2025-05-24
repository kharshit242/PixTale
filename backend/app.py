from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Verify required environment variables
if not os.getenv("NVIDIA_API_KEY"):
    print("NVIDIA_API_KEY is not set in environment variables")
    print("Please add it to your .env file and restart the server")

# Initialize FastAPI app
app = FastAPI(title="PixTale API")

# Create uploads directory if it doesn't exist
uploads_dir = Path(__file__).parent / "uploads"
uploads_dir.mkdir(exist_ok=True)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://pixtale-teal.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error": str(exc) if os.getenv("NODE_ENV") == "development" else "An unexpected error occurred"
        }
    )

# Serve static files from uploads directory
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    env_status = "Environment: OK" if os.getenv("NVIDIA_API_KEY") else "Missing NVIDIA_API_KEY"
    return {
        "status": "ok",
        "message": "PixTale API is running",
        "environment": env_status
    }

# Import routers after app is created to avoid circular imports
from routes.generate import router as generate_router
from routes.debug import router as debug_router

app.include_router(generate_router, prefix="/api/generate")
app.include_router(debug_router, prefix="/api/debug")

# Run app with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
