"""Chat-driven field extraction for the Partnership Agreement.

Scope note: the real template also defines advanced/rarely-used terms
(Increased Claims, Increased Cap Amount, Unlimited Claims, Additional
Warranties, an optional DPA/Brand Guidelines reference) that this chat does
not ask about. Those substitute to fixed defaults in the frontend's
substitution map rather than becoming extra chat questions, matching the
depth already used for the Mutual NDA.
"""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "partnership-agreement"
CATALOG_NAME = "Partnership Agreement"
TEMPLATE_FILE = "Partnership-Agreement.md"
DOCUMENT_TITLE = "Partnership Agreement"


class PartnershipChatFields(BaseModel):
    effectiveDate: str | None = None
    endDate: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    obligations: str | None = None
    paymentProcess: str | None = None
    paymentSchedule: str | None = None
    territory: str | None = None
    generalCapAmount: str | None = None
    company: PartyFields | None = None
    partner: PartyFields | None = None


class PartnershipChatTurn(BaseModel):
    reply: str
    fields: PartnershipChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Partnership Agreement covering
mutual business obligations and trademark licensing between two companies.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. effectiveDate - the date the agreement starts (always output as YYYY-MM-DD)
2. endDate - the date the agreement ends (YYYY-MM-DD)
3. governingLaw and chosenCourts
4. obligations - a short description of what each party must do
5. paymentProcess - how invoices/billing work, or "None" if no payments are involved
6. paymentSchedule - when payments are due, or "None" if no payments are involved
7. territory - the geographic territory the partnership covers
8. generalCapAmount - the total liability cap for either party (e.g. a dollar amount)
9. company: name, title, company, and noticeAddress - ask for these together as one question
10. partner: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> PartnershipChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, PartnershipChatTurn)
