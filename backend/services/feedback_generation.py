from fastapi import HTTPException
from pydantic import BaseModel
from typing import List
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()

class PhonemeScore(BaseModel):
    phoneme: str
    score: float

class FeedbackRequest(BaseModel):
    word: str
    phoneme_scores: List[PhonemeScore]
    language: str

async def generate_feedback(request: FeedbackRequest):

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        ai_prompt = """
        You are a professional language teacher fluent in all languages. 
        You specialize in pronunciation and helping learners improve their spoken words.
        You will be given a word, a list of phonemes with pronunciation scores (0-100), 
        and the language the user is practicing. Always respond in English.

        Your task:
        - Provide actionable tips for phonemes with scores below 90.
        - Also provide a single concise tip for the overall word pronunciation in 'word_tip'.
        - In 'word_tip', explain how to pronounce the entire word correctly and also emphasize the weakest phoneme(s) if any.
        - Use a friendly, encouraging tone.
        - Respond ONLY in valid JSON, never include extra text or explanations.
        - JSON format:
        {
        "phonemes": [
            {"phoneme": "r", "tip": "Roll your tongue slightly for 'r'."},
            {"phoneme": "o", "tip": "Round your lips for 'o'."}
        ],
        "word_tip": "Focus on stressing the first syllable clearly."
        }
        """

        user_prompt = f"""
        Word: "{request.word}"
        Language of practice: {request.language}
        Phonemes and scores: {[{'phoneme': p.phoneme, 'score': p.score} for p in request.phoneme_scores]}

        Instructions:
        - Only include tips for phonemes scoring below 90.
        - Keep tone friendly, concise, and natural like a language teacher explaining.
        - Do NOT include any text outside the JSON.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": ai_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        if not response.choices or not response.choices[0].message.content:
            raise HTTPException(status_code=500, detail="AI response was empty")
        
        feedback_json = response.choices[0].message.content.strip()

        try:
            feedback_data = json.loads(feedback_json)
            feedback_data.setdefault("phonemes", [])
            feedback_data.setdefault("word_tip", "")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="AI response was not valid JSON")
    
        return feedback_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")