import logging
from typing import Optional, Dict, Any
from services.ai_provider import (
    generate_structured_response,
    call_gemini,
    call_openrouter_or_groq_json
)

logger = logging.getLogger("ai_service")

async def call_gemini_json(prompt: str, system_instruction: Optional[str] = None, max_retries: int = 2) -> Optional[Dict[str, Any]]:
    """
    Backward-compatible adapter delegating to ai_provider.
    """
    return await call_gemini(
        prompt=prompt,
        system_instruction=system_instruction,
        max_retries=max_retries,
        as_json=True
    )

async def call_groq_json(prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Backward-compatible adapter for secondary fallback.
    """
    return await call_openrouter_or_groq_json(prompt, system_instruction)

async def generate_structured_ai_response(
    prompt: str,
    system_instruction: str,
    pydantic_model: Optional[Any] = None,
    use_fast_model: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Primary structured response caller delegating to ai_provider.
    """
    return await generate_structured_response(
        prompt=prompt,
        system_instruction=system_instruction,
        pydantic_model=pydantic_model,
        use_fast_model=use_fast_model
    )
