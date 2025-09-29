from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()

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
    {instruction} on the topic "{request.topic}" in {request.language}.

    Rules:
    - Return a JSON object with a single key "exercises".
    - "exercises" is a list of entries.
    - Each entry must include:
        - "native": the word/phrase/sentence in {request.language}
        - "romanized": the romanization in English letters (pinyin for Chinese, romaji for Japanese, etc.)
        - "translation": English translation
    - Return only valid JSON
    - Do not include extra text, headers, or numbering
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a helpful language teacher generating pronunciation exercises."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )

    content = response.choices[0].message.content.strip()
    try:
        exercises = json.loads(content).get("exercises", [])
    except json.JSONDecodeError:
        exercises = []

    return ContentResponse(
        topic=request.topic,
        difficulty=request.difficulty,
        language=request.language,
        exercises=exercises
    )
