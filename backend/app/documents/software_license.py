"""Chat-driven field extraction for the Software License Agreement.

Scope note: the real template also defines advanced/rarely-used terms
(Increased Cap Amount, Increased Claims, Unlimited Claims, Additional
Warranties) that this chat does not ask about. Those substitute to fixed
defaults in the frontend's substitution map rather than becoming extra chat
questions, matching the depth already used for the Mutual NDA.
"""

import datetime

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "software-license-agreement"
CATALOG_NAME = "Software License Agreement"
TEMPLATE_FILE = "Software-License-Agreement.md"
DOCUMENT_TITLE = "Software License Agreement"


class SoftwareLicenseChatFields(BaseModel):
    effectiveDate: str | None = None
    orderDate: str | None = None
    subscriptionPeriod: str | None = None
    nonRenewalNoticeDate: str | None = None
    permittedUses: str | None = None
    paymentProcess: str | None = None
    warrantyPeriod: str | None = None
    licenseLimits: str | None = None
    deletionProcedure: str | None = None
    governingLaw: str | None = None
    chosenCourts: str | None = None
    generalCapAmount: str | None = None
    customer: PartyFields | None = None
    provider: PartyFields | None = None


class SoftwareLicenseChatTurn(BaseModel):
    reply: str
    fields: SoftwareLicenseChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Software License Agreement, for
licensing installable software from a provider to a customer.

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. effectiveDate - the date the Framework Terms start (always output as YYYY-MM-DD)
2. orderDate - the date this specific Order Form starts (YYYY-MM-DD)
3. subscriptionPeriod - the length of the license subscription (e.g. "1 year")
4. nonRenewalNoticeDate - how far before renewal a party must give notice not to renew
5. permittedUses - what the customer is permitted to use the software for
6. paymentProcess - how invoicing/payment works (e.g. "invoiced annually in advance")
7. warrantyPeriod - how long the provider's software warranty lasts (e.g. "90 days")
8. licenseLimits - any limits on the license (e.g. number of seats/servers), or "None"
9. deletionProcedure - how the customer must remove the software after termination
10. governingLaw and chosenCourts
11. generalCapAmount - the total liability cap for either party (e.g. a dollar amount)
12. customer: name, title, company, and noticeAddress - ask for these together as one question
13. provider: name, title, company, and noticeAddress - ask for these together as one question
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> SoftwareLicenseChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, SoftwareLicenseChatTurn)
