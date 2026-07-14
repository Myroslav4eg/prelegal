"""Chat-driven field extraction for the Data Processing Agreement.

Scope note: the real template's international-transfer machinery (EEA SCCs,
UK Addendum) and liability terms are inherited from a parent Agreement and
are not asked about here; DPA.md's own Definitions section confirms the DPA
has its own Cover Page identifying Provider/Customer, so party identity is
still asked (unlike SLA/AI Addendum).
"""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "dpa"
CATALOG_NAME = "Data Processing Agreement"
TEMPLATE_FILE = "DPA.md"
DOCUMENT_TITLE = "Data Processing Agreement"


class DpaChatFields(BaseModel):
    categoriesOfPersonalData: str | None = None
    categoriesOfDataSubjects: str | None = None
    approvedSubprocessors: str | None = None
    governingMemberState: str | None = None
    providerSecurityContact: str | None = None
    customer: PartyFields | None = None
    provider: PartyFields | None = None


class DpaChatTurn(BaseModel):
    reply: str
    fields: DpaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Data Processing Agreement (DPA),
addressing the processing of personal data, subprocessors, and international data transfers.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. categoriesOfPersonalData - the categories of personal data being processed (e.g. "contact
   information, account credentials")
2. categoriesOfDataSubjects - whose personal data this is (e.g. "customer's employees and end
   users")
3. approvedSubprocessors - a list of approved subprocessors and what they do, or "None"
4. governingMemberState - the EU/UK member state whose law governs international transfers
5. providerSecurityContact - an email or contact for security/compliance questions
6. customer: name, title, company, and noticeAddress - ask for these together as one question
7. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> DpaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, DpaChatTurn)
