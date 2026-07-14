"""Chat-driven field extraction for the Design Partner Agreement."""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "design-partner-agreement"
CATALOG_NAME = "Design Partner Agreement"
TEMPLATE_FILE = "design-partner-agreement.md"
DOCUMENT_TITLE = "Design Partner Agreement"


class DesignPartnerChatFields(BaseModel):
    term: str | None = None
    program: str | None = None
    fees: str | None = None
    effectiveDate: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    noticeAddress: str | None = None
    partner: PartyFields | None = None
    provider: PartyFields | None = None


class DesignPartnerChatTurn(BaseModel):
    reply: str
    fields: DesignPartnerChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Design Partner Agreement, which
gives a partner early access to a product in exchange for feedback during a product development
program.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. term - how long the agreement lasts (e.g. "6 months")
2. program - a short description of the design partner program
3. fees - any fees the partner pays, or "None" if free
4. effectiveDate - the date the agreement starts (always output as YYYY-MM-DD)
5. governingLaw and chosenCourts
6. noticeAddress - the address for legal notices
7. partner: name, title, company, and noticeAddress - ask for these together as one question
8. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> DesignPartnerChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, DesignPartnerChatTurn)
