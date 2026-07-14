"""Chat-driven field extraction for the Pilot Agreement."""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "pilot-agreement"
CATALOG_NAME = "Pilot Agreement"
TEMPLATE_FILE = "Pilot-Agreement.md"
DOCUMENT_TITLE = "Pilot Agreement"


class PilotChatFields(BaseModel):
    pilotPeriod: str | None = None
    effectiveDate: str | None = None
    generalCapAmount: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    noticeAddress: str | None = None
    customer: PartyFields | None = None
    provider: PartyFields | None = None


class PilotChatTurn(BaseModel):
    reply: str
    fields: PilotChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Pilot Agreement, which lets a
customer evaluate a provider's product during a fixed pilot period.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. pilotPeriod - how long the pilot lasts (e.g. "90 days")
2. effectiveDate - the date the agreement starts (always output as YYYY-MM-DD)
3. generalCapAmount - the total liability cap for either party (e.g. a dollar amount)
4. governingLaw and chosenCourts
5. noticeAddress - the address for legal notices
6. customer: name, title, company, and noticeAddress - ask for these together as one question
7. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> PilotChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, PilotChatTurn)
