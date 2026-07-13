from app import chat


def login(client):
    client.post("/api/auth/login", json={"email": "person@example.com", "password": "x"})


def test_chat_without_session_is_unauthorized(client):
    response = client.post("/api/mnda/chat", json={"messages": []})
    assert response.status_code == 401


def test_chat_returns_reply_and_fields(client, stub_completion):
    login(client)
    stub_completion('{"reply": "What is the purpose?", "fields": {"purpose": null}, "done": false}')

    response = client.post("/api/mnda/chat", json={"messages": []})

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "What is the purpose?"
    assert body["done"] is False
    assert body["fields"]["purpose"] is None


def test_chat_extracts_nested_party_fields(client, stub_completion):
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
        "/api/mnda/chat",
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

    response = client.post("/api/mnda/chat", json={"messages": []})

    assert response.status_code == 200
    assert response.json()["done"] is True


def test_chat_returns_502_when_llm_call_fails(client, monkeypatch):
    login(client)

    def failing_completion(**kwargs):
        raise RuntimeError("upstream failure")

    monkeypatch.setattr(chat, "completion", failing_completion)

    response = client.post("/api/mnda/chat", json={"messages": []})

    assert response.status_code == 502
