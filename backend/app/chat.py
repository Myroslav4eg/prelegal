"""Generic LLM chat-turn orchestration via Cerebras (through LiteLLM/OpenRouter).

Has no knowledge of any particular document type: callers supply a system
prompt and the Pydantic model the LLM's structured output must conform to.
"""

from typing import Literal, TypeVar

from fastapi import HTTPException
from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}, "reasoning": {"effort": "low"}}

T = TypeVar("T", bound=BaseModel)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


def run_chat_turn(system_prompt: str, messages: list[ChatMessage], response_model: type[T]) -> T:
    llm_messages = [{"role": "system", "content": system_prompt}]
    llm_messages += [m.model_dump() for m in messages]

    try:
        response = completion(
            model=MODEL,
            messages=llm_messages,
            response_format=response_model,
            extra_body=EXTRA_BODY,
            timeout=30,
        )
        return response_model.model_validate_json(response.choices[0].message.content)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable, please try again.") from exc
