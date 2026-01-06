from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import content
from api import pronunciation
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Fluent AI",
    description="AI-powered pronunciation assessment with dynamic lessons generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(content.router, prefix="/api", tags=["content generation"])
app.include_router(pronunciation.router, prefix="/api", tags=["pronunciation grader"])

@app.get("/")
async def root():
    return {
        "message": "AI Pronunciation Grader API",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "apis": {"openai": "connected", "azure": "connected"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)