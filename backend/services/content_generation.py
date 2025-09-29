from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()

class ContentRequest(BaseModel):
    topic: str
    difficulty: str
    language: str

class ContentResponse(BaseModel):
    topic: str
    difficulty: str
    language: str
    exercises: list[str]

async def generate_content(request: ContentRequest) -> ContentResponse:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    if request.difficulty == "beginner":
        instruction = "Generate 8 single words only suitable for beginner pronunciation practice."
    elif request.difficulty == "elementary":
        instruction = "Generate 6 short phrases (2-3 words each) suitable for elementary pronunciation practice."
    elif request.difficulty == "intermediate":
        instruction = "Generate 5 short sentences (4-6 words each) suitable for intermediate pronunciation practice."
    elif request.difficulty == "advanced":
        instruction = "Generate 5 complete sentences (7-10 words each) suitable for advanced pronunciation practice."
    elif request.difficulty == "fluent":
        instruction = "Generate 5 complex sentences (10-15 words each) suitable for fluent pronunciation practice."
    else:
        instruction = "Generate 5 sentences suitable for pronunciation practice."
    
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
