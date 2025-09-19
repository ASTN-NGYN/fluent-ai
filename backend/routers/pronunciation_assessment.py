import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Configuration - Load environment variables
load_dotenv()
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")



def assess_pronunciation(reference_text: str, language: str = "en-EN"):
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
    
    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True
    )

    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    speech_recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_config,
        language=language
    )

    pronunciation_config.enable_prosody_assessment()
    pronunciation_config.apply_to(speech_recognizer)

    print(f"Speak: '{reference_text}'")
    result = speech_recognizer.recognize_once()

    assessment_result = speechsdk.PronunciationAssessmentResult(result)

    overall_scores = {
        "accuracy": assessment_result.accuracy_score,
        "completeness": assessment_result.completeness_score,
        "fluency": assessment_result.fluency_score,
        "pronunciation": assessment_result.pronunciation_score,
        "prosody": assessment_result.prosody_score
    }

    word_breakdown = []
    for word in assessment_result.words:
        phoneme_scores = [p.accuracy_score for p in word.phonemes] if word.phonemes else [word.accuracy_score]
        word_breakdown.append({
            "word": word.word,
            "word_accuracy": word.accuracy_score,
            "phoneme_scores": phoneme_scores
        })

    
    return overall_scores, word_breakdown




overall, words = assess_pronunciation("Mi amigo tiene un perro muy grande y juguetón.", "es-ES")

print("Overall scores:", overall)
for w in words:
    print(f"Word: {w['word']}, Phoneme scores: {w['phoneme_scores']}")

