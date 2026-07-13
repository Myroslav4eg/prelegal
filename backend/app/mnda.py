"""Chat-driven field extraction for the Mutual NDA, on top of app.chat's
generic LLM-turn orchestration.
"""

import datetime
from typing import Literal

from pydantic import BaseModel

from app.chat import ChatMessage, run_chat_turn


class PartyFields(BaseModel):
    name: str | None = None
    title: str | None = None
    company: str | None = None
    noticeAddress: str | None = None


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

Rules:
- Extract multiple fields from a single answer if the user volunteers them, and skip questions
  already answered.
- Always return the full cumulative set of fields established so far across the ENTIRE
  conversation, not just what changed this turn.
- If the user corrects an earlier answer, update that field and acknowledge the correction in
  your reply.
- CRITICAL: as long as any field above is still unknown, your reply MUST end by asking the
  question for the next unknown field in the fixed order, not just an acknowledgement like
  "noted" or "got it" on its own. Never send a reply that fails to move the conversation
  forward to the next unanswered field.
- Set done=true once every field above has a value. Keep accepting corrections after that -
  done is informational, not a lock, and should stay true unless a field becomes unknown again.
- Keep replies short, plain text, no markdown.
"""


def run_mnda_chat_turn(messages: list[ChatMessage]) -> MndaChatTurn:
    return run_chat_turn(SYSTEM_PROMPT, messages, MndaChatTurn)
