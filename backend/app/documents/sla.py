"""Chat-driven field extraction for the Service Level Agreement.

Scope note: SLA.md's own Definitions section describes the SLA as "these SLA
Standard Terms as incorporated into the applicable Order Form" - it has no
Cover Page of its own and inherits Customer/Provider identity and the
Subscription Period from a parent Cloud Service Agreement that doesn't exist
in this system. Those fields are intentionally NOT asked about here; the
frontend substitutes a fixed placeholder for them instead (decision: generate
standalone with placeholders for parent-only fields).
"""

from pydantic import BaseModel

from app.chat import ChatMessage
from app.chat import run_chat_turn as _run_chat_turn
from app.documents.common import CHAT_RULES

SLUG = "sla"
CATALOG_NAME = "Service Level Agreement"
TEMPLATE_FILE = "sla.md"
DOCUMENT_TITLE = "Service Level Agreement"


class SlaChatFields(BaseModel):
    targetUptime: str | None = None
    targetResponseTime: str | None = None
    supportChannel: str | None = None
    uptimeCredit: str | None = None
    responseTimeCredit: str | None = None
    scheduledDowntime: str | None = None


class SlaChatTurn(BaseModel):
    reply: str
    fields: SlaChatFields
    done: bool


SYSTEM_PROMPT = f"""You are an assistant helping a user fill in a Service Level Agreement (SLA),
a rider to a Cloud Service Agreement defining uptime targets, response times, and service
credits. This SLA is generated standalone; party identity and the subscription period are
inherited from the primary Cloud Service Agreement and are not part of this chat.

Ask about the following fields, ONE QUESTION AT A TIME, in this fixed order:
1. targetUptime - the uptime commitment (e.g. "99.9% per calendar month")
2. targetResponseTime - how quickly support requests are acknowledged (e.g. "1 business day")
3. supportChannel - how support requests are submitted (e.g. "email to support@example.com")
4. uptimeCredit - the service credit owed if uptime falls below target (e.g. "5% of monthly fees")
5. responseTimeCredit - the service credit owed if response time is missed (e.g. "5% of monthly
   fees")
6. scheduledDowntime - any planned maintenance windows excluded from downtime calculations, or
   "None"
{CHAT_RULES}"""


def run_chat_turn(messages: list[ChatMessage]) -> SlaChatTurn:
    return _run_chat_turn(SYSTEM_PROMPT, messages, SlaChatTurn)
