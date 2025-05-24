from fastapi import FastAPI

app = FastAPI(title="Test App")

@app.get("/")
async def root():
    return {"message": "Hello World"}
