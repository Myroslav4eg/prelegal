"""Chat-driven field extraction for the Cloud Service Agreement.

Scope note: the real template also defines advanced/rarely-used terms
(Increased Cap Amount, Increased Claims, Unlimited Claims, Additional
Warranties, an optional DPA reference) that this chat does not ask about.
Those substitute to fixed defaults in the frontend's substitution map rather
than becoming extra chat questions, matching the depth already used for the
Mutual NDA.
"""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "csa"
CATALOG_NAME = "Cloud Service Agreement"
TEMPLATE_FILE = "CSA.md"
DOCUMENT_TITLE = "Cloud Service Agreement"


class CsaChatFields(BaseModel):
    effectiveDate: str | None = None
    orderDate: str | None = None
    subscriptionPeriod: str | None = None
    nonRenewalNoticeDate: str | None = None
    technicalSupport: str | None = None
    paymentProcess: str | None = None
    useLimitations: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    generalCapAmount: str | None = None
    customer: PartyFields | None = None
    provider: PartyFields | None = None


class CsaChatTurn(BaseModel):
    reply: str
    fields: CsaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Cloud Service Agreement (CSA),
for a provider to license a cloud-hosted product to a customer.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. effectiveDate - the date the Framework Terms start (always output as YYYY-MM-DD)
2. orderDate - the date this specific Order Form starts (YYYY-MM-DD)
3. subscriptionPeriod - the length of the subscription (e.g. "1 year")
4. nonRenewalNoticeDate - how far before renewal a party must give notice not to renew
   (e.g. "30 days before the end of the Subscription Period")
5. technicalSupport - a short description of the support provided
6. paymentProcess - how invoicing/payment works (e.g. "invoiced monthly in advance")
7. useLimitations - any limits on how the customer may use the product, or "None"
8. governingLaw and chosenCourts
9. generalCapAmount - the total liability cap for either party (e.g. a dollar amount)
10. customer: name, title, company, and noticeAddress - ask for these together as one question
11. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> CsaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, CsaChatTurn)
