import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from utility.audio_utils import convert_to_wav
import asyncio

load_dotenv()
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")

if not speech_key or not speech_region:
    raise RuntimeError("Azure Speech key or region is missing in environment variables.")

async def assess_pronunciation(audio_file, reference_text: str, language: str = "en-US"):
    try:
        input_bytes = await audio_file.read()

        if asyncio.iscoroutinefunction(convert_to_wav):
            wav_path = await convert_to_wav(input_bytes)
        else:

            loop = asyncio.get_running_loop()
            wav_path = await loop.run_in_executor(None, convert_to_wav, input_bytes)

        # Configure Azure Speech
        audio_config = speechsdk.audio.AudioConfig(filename=str(wav_path))
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)

        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        pronunciation_config.enable_prosody_assessment()

        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config,
            language=language
        )
        pronunciation_config.apply_to(recognizer)

        result_future = recognizer.recognize_once_async()
        result = result_future.get()

        if result.reason != speechsdk.ResultReason.RecognizedSpeech:
            raise RuntimeError(f"Speech recognition failed: {result.reason}, {result.text}")

        assessment = speechsdk.PronunciationAssessmentResult(result)

        overall_scores = {
            "accuracy": assessment.accuracy_score,
            "completeness": assessment.completeness_score,
            "fluency": assessment.fluency_score,
            "pronunciation": assessment.pronunciation_score,
            "prosody": assessment.prosody_score
        }

        word_breakdown = []
        for word in assessment.words:
            if word.phonemes:
                phoneme_data = [{"phoneme": p.phoneme or "", "score": p.accuracy_score} for p in word.phonemes]
            else:
                phoneme_data = [{"phoneme": "", "score": word.accuracy_score}]
            word_breakdown.append({
                "word": word.word,
                "word_accuracy": word.accuracy_score,
                "phoneme_scores": phoneme_data
            })

        return overall_scores, word_breakdown

    except Exception as e:
        raise RuntimeError(f"Error in assess_pronunciation: {e}") from e