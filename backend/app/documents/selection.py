"""The zeroth chat phase: figuring out which document the user wants before
handing off to that document's own chat_turn function.
"""

from typing import Literal

from pydantic import BaseModel

from app.chat import ChatMessage, run_chat_turn
from app.documents.registry import REGISTRY

_SLUGS = tuple(REGISTRY.keys())


class SelectionTurn(BaseModel):
    reply: str
    slug: Literal[_SLUGS] | None = None


def _catalog_listing() -> str:
    return "\n".join(f"- {spec.catalog_name}" for spec in REGISTRY.values())


SYSTEM_PROMPT = f"""You are an assistant helping a user figure out which legal document they want
to create. We can generate the following documents:
{_catalog_listing()}

Ask the user what kind of document they need. If they describe something not in the list above,
explain that we can't generate that, and suggest the closest document from the list instead.
Only set slug once the user has confirmed they want one of the documents in the list above -
until then, leave slug null. Keep replies short, plain text, no markdown."""


def run_selection_turn(messages: list[ChatMessage]) -> SelectionTurn:
    return run_chat_turn(SYSTEM_PROMPT, messages, SelectionTurn)
