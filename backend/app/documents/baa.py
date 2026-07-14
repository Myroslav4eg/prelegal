"""Chat-driven field extraction for the Business Associate Agreement."""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "baa"
CATALOG_NAME = "Business Associate Agreement"
TEMPLATE_FILE = "BAA.md"
DOCUMENT_TITLE = "Business Associate Agreement"


class BaaChatFields(BaseModel):
    baaEffectiveDate: str | None = None
    limitations: str | None = None
    breachNotificationPeriod: str | None = None
    provider: PartyFields | None = None
    company: PartyFields | None = None


class BaaChatTurn(BaseModel):
    reply: str
    fields: BaaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Business Associate Agreement
(BAA), a HIPAA addendum governing how a business associate handles protected health information
(PHI) on behalf of a covered entity.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. baaEffectiveDate - the date the BAA starts (always output as YYYY-MM-DD)
2. limitations - any limitations on how PHI may be used (e.g. offshoring, de-identification,
   aggregation), or "None" if there are no limitations
3. breachNotificationPeriod - how quickly the provider must report a breach (e.g. "5 days")
4. provider: name, title, company, and noticeAddress - ask for these together as one question
   (the business associate handling PHI)
5. company: name, title, company, and noticeAddress - ask for these together as one question
   (the covered entity)
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> BaaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, BaaChatTurn)
