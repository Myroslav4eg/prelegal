import pytest
from pydantic import BaseModel

from app import chat
from conftest import FakeResponse


class Echo(BaseModel):
    text: str


def test_run_chat_turn_parses_structured_response(stub_completion):
    stub_completion('{"text": "hello"}')

    result = chat.run_chat_turn("system prompt", [], Echo)

    assert result == Echo(text="hello")


def test_run_chat_turn_sends_system_prompt_first(monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured.update(kwargs)
        return FakeResponse('{"text": "hi"}')

    monkeypatch.setattr(chat, "completion", fake_completion)

    chat.run_chat_turn("be helpful", [chat.ChatMessage(role="user", content="hey")], Echo)

    assert captured["messages"][0] == {"role": "system", "content": "be helpful"}
    assert captured["messages"][1] == {"role": "user", "content": "hey"}


def test_run_chat_turn_raises_502_on_llm_error(monkeypatch):
    def fake_completion(**kwargs):
        raise RuntimeError("upstream failure")

    monkeypatch.setattr(chat, "completion", fake_completion)

    with pytest.raises(Exception) as exc_info:
        chat.run_chat_turn("system", [], Echo)

    assert exc_info.value.status_code == 502


def test_run_chat_turn_raises_502_on_malformed_json(stub_completion):
    stub_completion("not json")

    with pytest.raises(Exception) as exc_info:
        chat.run_chat_turn("system", [], Echo)

    assert exc_info.value.status_code == 502
