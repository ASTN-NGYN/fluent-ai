from fastapi import APIRouter, UploadFile, Form, File
from typing import List, Union
from pydantic import BaseModel
from services.pronunciation_assessment import assess_pronunciation
from services.feedback_generation import generate_feedback

router = APIRouter()

class PhonemeScore(BaseModel):
    phoneme: str
    score: float

class WordAssessment(BaseModel):
    word: str
    word_accuracy: float
    phoneme_scores: List[PhonemeScore]
    feedback: Union[str, dict, None] = None
    
class FeedbackRequest(BaseModel):
    word: str
    phoneme_scores: List[PhonemeScore]
    language: str

class AssessmentResponse(BaseModel):
    overall: dict
    words: List[WordAssessment]

@router.post("/assess-pronunciation", response_model=AssessmentResponse)
async def assess_pronunciation_endpoint(
    reference_text: str = Form(...),
    language: str = Form(...),
    audio_file: UploadFile = File(...)
):
    overall_scores, word_breakdown = await assess_pronunciation(audio_file, reference_text, language)

    for word in word_breakdown:
        if word['word_accuracy'] < 90:
            try:
                phoneme_scores_objs = [
                    PhonemeScore(phoneme=p['phoneme'], score=p['score'])
                    for p in word['phoneme_scores']
                ]

                word['feedback'] = await generate_feedback(
                    FeedbackRequest(
                        word=word['word'],
                        phoneme_scores=phoneme_scores_objs,
                        language=language
                    )
                )

            except Exception:
                word['feedback'] = {"error": "Feedback unavailable"}
        else:
            word['feedback'] = None
            
    return {"overall": overall_scores, "words": word_breakdown}
