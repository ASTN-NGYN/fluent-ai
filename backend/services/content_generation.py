from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()

class ContentRequest(BaseModel):
    topic: str
    difficulty: str
    language: str = "English"

class ContentResponse(BaseModel):
    topic: str
    difficulty: str
    language: str
    exercises: list[str]

async def generate_content(request: ContentRequest) -> ContentResponse:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    if request.difficulty == "beginner":
        instruction = "Generate 8 single words only suitable for beginner pronunciation practice."
    elif request.difficulty == "intermediate":
        instruction = "Generate 6 short phrases (2-4 words each) suitable for intermediate pronunciation practice."
    elif request.difficulty == "hard":
        instruction = "Generate 5 complete sentences, each 5-8 words long, suitable for advanced pronunciation practice."
    else:
        instruction = "Generate 5 complete sentences, each 10-15 words long, suitable for advanced pronunciation practice."
    
    prompt = f"""
    {instruction} for pronunciation practice on the topic "{request.topic}" in {request.language}.
    
    Rules:
    - Output only the words/phrases/sentences, nothing else
    - Each word/phrase/sentence on a separate line
    - Do NOT include any header, title, numbering, bullets, or extra text
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful language teacher generating exercises."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )

    content = response.choices[0].message.content.strip()
    exercises = [line.strip().strip('"').strip("'").lstrip('0123456789. )') for line in content.split('\n') if line.strip()]

    return ContentResponse(
        topic=request.topic,
        difficulty=request.difficulty,
        language=request.language,
        exercises=exercises
    )
