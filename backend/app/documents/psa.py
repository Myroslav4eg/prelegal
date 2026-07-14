"""Chat-driven field extraction for the Professional Services Agreement.

Scope note: the real template also defines advanced/rarely-used terms
(Increased Cap Amount, Increased Claims, Unlimited Claims, Additional
Warranties, Insurance Minimums, Security Policy, Customer Policies) that this
chat does not ask about. Those substitute to fixed defaults in the frontend's
substitution map rather than becoming extra chat questions, matching the
depth already used for the Mutual NDA.
"""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "psa"
CATALOG_NAME = "Professional Services Agreement"
TEMPLATE_FILE = "psa.md"
DOCUMENT_TITLE = "Professional Services Agreement"


class PsaChatFields(BaseModel):
    effectiveDate: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    generalCapAmount: str | None = None
    deliverables: str | None = None
    rejectionPeriod: str | None = None
    resubmissionPeriod: str | None = None
    timeOfAssignment: str | None = None
    fees: str | None = None
    paymentPeriod: str | None = None
    sowTerm: str | None = None
    customerObligations: str | None = None
    customer: PartyFields | None = None
    provider: PartyFields | None = None


class PsaChatTurn(BaseModel):
    reply: str
    fields: PsaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Professional Services Agreement
(PSA), governing statements of work, deliverables, and fees for professional services.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. effectiveDate - the date the agreement starts (always output as YYYY-MM-DD)
2. governingLaw and chosenCourts
3. generalCapAmount - the total liability cap for either party (e.g. a dollar amount)
4. deliverables - a short description of the deliverables, or "None" if the engagement has no
   deliverables
5. rejectionPeriod - how long the customer has to reject a deliverable (e.g. "10 days")
6. resubmissionPeriod - how long the provider has to fix and resubmit a rejected deliverable
7. timeOfAssignment - when IP in the deliverables transfers to the customer (e.g. "upon full
   payment" or "upon delivery")
8. fees - the fees for the services (e.g. a dollar amount or rate)
9. paymentPeriod - how long the customer has to pay an invoice (e.g. "30 days")
10. sowTerm - how long the statement of work lasts
11. customerObligations - anything the customer must do to support the engagement, or "None"
12. customer: name, title, company, and noticeAddress - ask for these together as one question
13. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> PsaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, PsaChatTurn)
