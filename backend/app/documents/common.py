"""Shared pieces reused by every per-document chat module."""

from pydantic import BaseModel


class PartyFields(BaseModel):
    name: str | None = None
    title: str | None = None
    company: str | None = None
    noticeAddress: str | None = None


CHAT_RULES = """
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
