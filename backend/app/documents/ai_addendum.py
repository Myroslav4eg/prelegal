"""Chat-driven field extraction for the AI Addendum.

Scope note: AI-Addendum.md has no Cover Page definition of its own - it rides
on the parent product agreement's existing Customer/Provider identity, which
doesn't exist in this system. Those fields are intentionally NOT asked about
here; the frontend substitutes a fixed placeholder for them instead.
"""

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES

SLUG = "ai-addendum"
CATALOG_NAME = "AI Addendum"
TEMPLATE_FILE = "AI-Addendum.md"
DOCUMENT_TITLE = "AI Addendum"


class AiAddendumChatFields(BaseModel):
    trainingData: str | None = None
    trainingPurposes: str | None = None
    trainingRestrictions: str | None = None
    improvementRestrictions: str | None = None


class AiAddendumChatTurn(BaseModel):
    reply: str
    fields: AiAddendumChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in an AI Addendum, supplementing a
product agreement with terms governing AI/ML features, model training, and AI-generated output.
This addendum is generated standalone; party identity is inherited from the primary product
agreement and is not part of this chat.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. trainingData - what data the provider may use to train its AI models, or "None" if training
   is not permitted
2. trainingPurposes - what the training is for, or "None" if training is not permitted
3. trainingRestrictions - any restrictions on training, or "None"
4. improvementRestrictions - any restrictions on using data for non-training product improvement,
   or "None"
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> AiAddendumChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, AiAddendumChatTurn)
