from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.content_generation import generate_content

router = APIRouter()

class ContentRequest(BaseModel):
    topic: str
    difficulty: str
    language: str = "English"
    

@router.post("/generate-content")
async def generate_content_endpoint(request: ContentRequest):
    try:
        return generate_content(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")