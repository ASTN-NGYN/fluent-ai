import logging
from fastapi import APIRouter, UploadFile, Form, File
from typing import List
from pydantic import BaseModel
from ..services.pronunciation_assessment import assess_pronunciation
from ..services.feedback_generation import generate_feedback

router = APIRouter()

class WordAssessment(BaseModel):
    word: str
    word_accuracy: float
    phoneme_scores: List[int]
    feedback: str | dict | None = None

class AssessmentResponse(BaseModel):
    overall: dict
    words: List[WordAssessment]

class FeedbackRequest(BaseModel):
    word: str
    phoneme_scores: List[int]
    language: str

@router.post("/assess-pronunciation", response_model=AssessmentResponse)
async def assess_pronunciation_endpoint(
    reference_text: str = Form(...),
    language: str = Form(...),
    audio_file: UploadFile = File(...)
):
    overall_scores, word_breakdown = assess_pronunciation(audio_file, reference_text, language)

    for word in word_breakdown:
        if word['word_accuracy'] < 90:
            try:
                word['feedback'] = await generate_feedback(
                    FeedbackRequest(
                        word=word['word'],
                        phoneme_scores=word['phoneme_scores'],
                        language=language
                    )
                ) 
            except Exception as e:
                logging.error(f"Feedback generation failed for word '{word['word']}': {str(e)}")
                word['feedback'] = {"error": "Feedback unavailable"}
        else:
            word['feedback'] = ""
            
    return {"overall": overall_scores, "words": word_breakdown}


