import pytest

from app import chat
from app.documents.registry import REGISTRY


def login(client):
    client.post("/api/auth/login", json={"email": "person@example.com", "password": "x"})


def test_chat_without_session_is_unauthorized(client):
    response = client.post("/api/documents/mnda/chat", json={"messages": []})
    assert response.status_code == 401


def test_unknown_document_slug_is_not_found(client):
    login(client)
    response = client.post("/api/documents/not-a-real-document/chat", json={"messages": []})
    assert response.status_code == 404


@pytest.mark.parametrize("slug", list(REGISTRY.keys()))
def test_chat_turn_round_trips_for_every_registered_document(client, stub_completion, slug):
    login(client)
    stub_completion('{"reply": "Hi there.", "fields": {}, "done": false}')

    response = client.post(f"/api/documents/{slug}/chat", json={"messages": []})

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Hi there."
    assert body["done"] is False


def test_chat_extracts_nested_party_fields_for_mnda(client, stub_completion):
    login(client)
    stub_completion(
        """
        {
          "reply": "Got it.",
          "fields": {
            "party1": {"name": "Jane Doe", "title": "CEO", "company": "Acme", "noticeAddress": "jane@acme.com"}
          },
          "done": false
        }
        """
    )

    response = client.post(
        "/api/documents/mnda/chat",
        json={"messages": [{"role": "user", "content": "Party 1 is Jane Doe, CEO of Acme"}]},
    )

    assert response.status_code == 200
    assert response.json()["fields"]["party1"] == {
        "name": "Jane Doe",
        "title": "CEO",
        "company": "Acme",
        "noticeAddress": "jane@acme.com",
    }


def test_chat_reports_done_when_all_fields_present(client, stub_completion):
    login(client)
    stub_completion(
        """
        {
          "reply": "All set!",
          "fields": {
            "purpose": "Evaluating a partnership.",
            "effectiveDate": "2026-07-14",
            "mndaTermOption": "expires",
            "mndaTermYears": 1,
            "confidentialityTermOption": "years",
            "confidentialityTermYears": 1,
            "governingLaw": "Delaware",
            "jurisdiction": "New Castle, DE",
            "modifications": "None.",
            "party1": {"name": "Jane Doe", "title": "CEO", "company": "Acme", "noticeAddress": "jane@acme.com"},
            "party2": {"name": "John Smith", "title": "CTO", "company": "Beta", "noticeAddress": "john@beta.com"}
          },
          "done": true
        }
        """
    )

    response = client.post("/api/documents/mnda/chat", json={"messages": []})

    assert response.status_code == 200
    assert response.json()["done"] is True


def test_chat_returns_502_when_llm_call_fails(client, monkeypatch):
    login(client)

    def failing_completion(**kwargs):
        raise RuntimeError("upstream failure")

    monkeypatch.setattr(chat, "completion", failing_completion)

    response = client.post("/api/documents/mnda/chat", json={"messages": []})

    assert response.status_code == 502
