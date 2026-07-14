"""Chat-driven field extraction for the Mutual NDA."""

import datetime
from typing import Literal

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES, PartyFields

SLUG = "mnda"
CATALOG_NAME = "Mutual Non-Disclosure Agreement"
TEMPLATE_FILE = "Mutual-NDA.md"
DOCUMENT_TITLE = "Mutual Non-Disclosure Agreement"


class MndaChatFields(BaseModel):
    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTermOption: Literal["expires", "until_terminated"] | None = None
    mndaTermYears: int | None = None
    confidentialityTermOption: Literal["years", "perpetuity"] | None = None
    confidentialityTermYears: int | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1: PartyFields | None = None
    party2: PartyFields | None = None


class MndaChatTurn(BaseModel):
    reply: str
    fields: MndaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Mutual Non-Disclosure Agreement (MNDA).

Today's date is {datetime.date.today().isoformat()}.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. purpose - how may Confidential Information be used
2. effectiveDate - the date the agreement starts (always output as YYYY-MM-DD)
3. mndaTermOption ("expires" or "until_terminated"); if "expires", also mndaTermYears (an integer)
4. confidentialityTermOption ("years" or "perpetuity"); if "years", also confidentialityTermYears (an integer)
5. governingLaw and jurisdiction
6. party1: name, title, company, and noticeAddress - ask for these together as one question
7. party2: name, title, company, and noticeAddress - ask for these together as one question
8. modifications - any modifications to the standard MNDA terms; if the user has none, record "None."
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> MndaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, MndaChatTurn)
