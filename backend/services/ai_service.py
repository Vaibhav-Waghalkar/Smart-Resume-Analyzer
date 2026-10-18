import os
import json
import logging
import asyncio
from typing import Optional, Dict, Any, List
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger("ai_service")
logger.setLevel(logging.INFO)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

# Primary & Fallback models
PRIMARY_GEMINI_MODEL = "gemini-3.8-flash"
FALLBACK_GROQ_MODEL = "llama-3.3-70b-versatile"


async def call_gemini_json(prompt: str, system_instruction: Optional[str] = None, max_retries: int = 2) -> Optional[Dict[str, Any]]:
    """
    Call Google Gemini requiring strict JSON output.
    Retries automatically on network or json decode failures.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GEMINI_API_KEY is not configured.")
        return None

    url = GEMINI_URL_TEMPLATE.format(model=PRIMARY_GEMINI_MODEL, key=api_key)

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
        }
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

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
                            # Clean possible code fence tags if present
                            if raw_text.startswith("```json"):
                                raw_text = raw_text[7:]
                            if raw_text.startswith("```"):
                                raw_text = raw_text[3:]
                            if raw_text.endswith("```"):
                                raw_text = raw_text[:-3]
                            raw_text = raw_text.strip()
                            return json.loads(raw_text)
                else:
                    logger.warning(f"Gemini call failed with code {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini call attempt {attempt + 1} exception: {e}")

        if attempt < max_retries:
            await asyncio.sleep(1.0 * (attempt + 1))

    return None


async def call_groq_json(prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Fallback call to Groq when configured.
    """
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return None

    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": FALLBACK_GROQ_MODEL,
        "messages": messages,
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            res = await client.post(GROQ_CHAT_URL, json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
            else:
                logger.warning(f"Groq API returned {res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.warning(f"Groq API error: {e}")

    return None


async def generate_structured_ai_response(
    prompt: str,
    system_instruction: str,
    pydantic_model: Optional[Any] = None
) -> Optional[Dict[str, Any]]:
    """
    Tries Gemini first; if it fails or rate limits, falls back to Groq.
    Validates output with Pydantic if provided.
    """
    result = await call_gemini_json(prompt, system_instruction)
    if result is None:
        logger.info("Falling back to Groq for structured response...")
        result = await call_groq_json(prompt, system_instruction)

    if result is not None and pydantic_model is not None:
        try:
            validated = pydantic_model(**result)
            return validated.model_dump()
        except Exception as err:
            logger.warning(f"Pydantic validation warning: {err}. Returning raw result.")

    return result
