from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.content_generation import generate_content

router = APIRouter()

class Exercise(BaseModel):
    native: str
    romanized: str
    translation: str

class ContentRequest(BaseModel):
    topic: str
    difficulty: str
    language: str

class ContentResponse(BaseModel):
    topic: str
    difficulty: str
    language: str
    exercises: list[Exercise]
    

@router.post("/generate-content", response_model=ContentResponse)
async def generate_content_endpoint(request: ContentRequest):
    try:
        result = await generate_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")