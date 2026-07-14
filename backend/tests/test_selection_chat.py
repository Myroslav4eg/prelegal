def login(client):
    client.post("/api/auth/login", json={"email": "person@example.com", "password": "x"})


def test_selection_chat_without_session_is_unauthorized(client):
    response = client.post("/api/documents/chat", json={"messages": []})
    assert response.status_code == 401


def test_selection_chat_returns_reply_with_no_slug(client, stub_completion):
    login(client)
    stub_completion('{"reply": "What kind of document do you need?", "slug": null}')

    response = client.post("/api/documents/chat", json={"messages": []})

    assert response.status_code == 200
    body = response.json()
    assert body["slug"] is None
    assert body["reply"]


def test_selection_chat_returns_slug_once_confirmed(client, stub_completion):
    login(client)
    stub_completion('{"reply": "Let'"'"'s build a Pilot Agreement.", "slug": "pilot-agreement"}')

    response = client.post(
        "/api/documents/chat",
        json={"messages": [{"role": "user", "content": "I want a pilot agreement"}]},
    )

    assert response.status_code == 200
    assert response.json()["slug"] == "pilot-agreement"


def test_selection_chat_rejects_slug_outside_the_catalog(client, stub_completion):
    login(client)
    stub_completion('{"reply": "We can'"'"'t generate that, closest is X.", "slug": "not-a-real-document"}')

    response = client.post("/api/documents/chat", json={"messages": []})

    assert response.status_code == 502
