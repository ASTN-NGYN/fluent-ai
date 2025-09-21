import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from ..utility.audio_utils import convert_to_wav

load_dotenv()
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")

async def assess_pronunciation(audio_file, reference_text: str, language: str = "en-EN"):
    wav_path = await convert_to_wav(audio_file)
    audio_stream = speechsdk.audio.AudioConfig(filename=str(wav_path))
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
    
    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True
    )    
    pronunciation_config.enable_prosody_assessment()

    speech_recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_stream,
        language=language
    )
    pronunciation_config.apply_to(speech_recognizer)

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
        if word.phonemes:
            phoneme_data = [{"phoneme": p.phoneme or "", "score": p.accuracy_score} for p in word.phonemes]
        else:
            phoneme_data = [{"phoneme": "", "score": word.accuracy_score}]
            
        word_breakdown.append({
            "word": word.word,
            "word_accuracy": word.accuracy_score,
            "phoneme_scores": phoneme_data
        })

    return {
        "overall_scores": overall_scores,
        "word_breakdown": word_breakdown
    }

