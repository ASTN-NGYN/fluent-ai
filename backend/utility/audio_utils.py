import tempfile
import subprocess
from pathlib import Path

async def convert_to_wav(input_bytes: bytes) -> Path:

    with tempfile.NamedTemporaryFile(delete=False, suffix=".input") as temp_in:
        temp_in.write(input_bytes)
        temp_in.flush()
        input_path = Path(temp_in.name)
    
    output_path = input_path.with_suffix(".wav")

    subprocess.run([
        "ffmpeg", "-y", "-i", str(input_path),
        "-ac", "1", "-ar", "16000", "-acodec", "pcm_s16le",
        str(output_path)
    ], check=True)

    return output_path