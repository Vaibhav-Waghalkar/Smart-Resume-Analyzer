import os
import json
import base64
import logging
import asyncio
from typing import Optional, Dict, Any, List
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger("ai_provider")
logger.setLevel(logging.INFO)

# Configurable Model Names via .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
GEMINI_FAST_MODEL = os.getenv("GEMINI_FAST_MODEL", "gemini-2.5-flash-lite").strip()

# Optional Secondary Fallbacks (Groq or OpenRouter)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free").strip()

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"


def _clean_json_text(raw_text: str) -> str:
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


async def call_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    max_retries: int = 2,
    as_json: bool = True
) -> Optional[Any]:
    """
    Primary engine using Google Gemini.
    Retries once or twice with exponential backoff on 429/5xx.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set.")
        return None

    chosen_model = model or os.getenv("GEMINI_MODEL", GEMINI_MODEL)
    url = GEMINI_URL_TEMPLATE.format(model=chosen_model, key=api_key)

    payload: Dict[str, Any] = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
        }
    }

    if as_json:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    backoff = 1.2
    for attempt in range(max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=35.0) as client:
                res = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "").strip()
                            if as_json:
                                return json.loads(_clean_json_text(raw_text))
                            return raw_text
                elif res.status_code in (429, 500, 502, 503, 504):
                    logger.warning(f"Gemini {chosen_model} attempt {attempt+1} got HTTP {res.status_code}: {res.text[:160]}")
                else:
                    logger.error(f"Gemini {chosen_model} error HTTP {res.status_code}: {res.text[:200]}")
                    break
        except Exception as ex:
            logger.warning(f"Gemini exception attempt {attempt+1}: {ex}")

        if attempt < max_retries:
            await asyncio.sleep(backoff * (attempt + 1))

    return None


async def call_openrouter_or_groq_json(
    prompt: str,
    system_instruction: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Optional secondary fallback when Gemini is rate-limited or fails.
    Checks OpenRouter first, then Groq.
    """
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip() or OPENROUTER_API_KEY
    if openrouter_key:
        try:
            headers = {
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Smart Resume Analyzer"
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            payload = {
                "model": os.getenv("OPENROUTER_MODEL", OPENROUTER_MODEL),
                "messages": messages,
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(OPENROUTER_CHAT_URL, json=payload, headers=headers)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    return json.loads(_clean_json_text(content))
                logger.warning(f"OpenRouter returned {res.status_code}: {res.text[:160]}")
        except Exception as e:
            logger.warning(f"OpenRouter fallback error: {e}")

    groq_key = os.getenv("GROQ_API_KEY", "").strip() or GROQ_API_KEY
    if groq_key:
        try:
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            payload = {
                "model": os.getenv("GROQ_MODEL", GROQ_MODEL),
                "messages": messages,
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(GROQ_CHAT_URL, json=payload, headers=headers)
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                    return json.loads(_clean_json_text(content))
                logger.warning(f"Groq returned {res.status_code}: {res.text[:160]}")
        except Exception as e:
            logger.warning(f"Groq fallback error: {e}")

    return None


async def generate_structured_response(
    prompt: str,
    system_instruction: str,
    pydantic_model: Optional[Any] = None,
    use_fast_model: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Dispatches to Gemini (Flash or Flash-Lite depending on use_fast_model),
    with retry and secondary provider fallback if available.
    """
    model_name = os.getenv("GEMINI_FAST_MODEL", GEMINI_FAST_MODEL) if use_fast_model else os.getenv("GEMINI_MODEL", GEMINI_MODEL)
    result = await call_gemini(
        prompt=prompt,
        system_instruction=system_instruction,
        model=model_name,
        as_json=True
    )

    if result is None:
        logger.info("Attempting secondary provider fallback (OpenRouter/Groq if configured)...")
        result = await call_openrouter_or_groq_json(prompt, system_instruction)

    if result is not None and pydantic_model is not None:
        try:
            validated = pydantic_model(**result)
            return validated.model_dump()
        except Exception as val_err:
            logger.warning(f"Pydantic model validation warning: {val_err}. Returning raw result.")

    return result


async def transcribe_audio_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> Optional[str]:
    """
    Transcribes audio directly via Gemini's multimodal audio understanding.
    Works in all environments without requiring Groq.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY
    if not api_key:
        return None

    # Normalise audio mime type
    if not mime_type or mime_type == "application/octet-stream":
        mime_type = "audio/webm"

    b64_data = base64.b64encode(audio_bytes).decode("utf-8")
    fast_model = os.getenv("GEMINI_FAST_MODEL", GEMINI_FAST_MODEL)
    url = GEMINI_URL_TEMPLATE.format(model=fast_model, key=api_key)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": mime_type.split(";")[0],
                            "data": b64_data
                        }
                    },
                    {
                        "text": "Please transcribe the speech in this audio exactly into plain text. Do not add timestamps, commentary, or quotes."
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.0
        }
    }

    try:
        async with httpx.AsyncClient(timeout=40.0) as client:
            res = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
            else:
                logger.warning(f"Gemini audio transcribe HTTP {res.status_code}: {res.text[:160]}")
    except Exception as e:
        logger.warning(f"Gemini audio transcription error: {e}")

    # Optional fallback to Groq Whisper if available
    groq_key = os.getenv("GROQ_API_KEY", "").strip() or GROQ_API_KEY
    if groq_key:
        try:
            url_whisper = "https://api.groq.com/openai/v1/audio/transcriptions"
            headers = {"Authorization": f"Bearer {groq_key}"}
            files = {"file": ("audio.webm", audio_bytes, mime_type)}
            data = {"model": "whisper-large-v3", "response_format": "json"}
            async with httpx.AsyncClient(timeout=35.0) as client:
                res = await client.post(url_whisper, headers=headers, files=files, data=data)
                if res.status_code == 200:
                    return res.json().get("text", "").strip()
        except Exception as ge:
            logger.warning(f"Groq Whisper fallback error: {ge}")

    return None
