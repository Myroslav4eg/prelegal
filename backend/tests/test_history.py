def signup(client, email="person@example.com"):
    client.post("/api/auth/signup", json={"email": email, "password": "password123"})


def test_history_requires_auth(client):
    assert client.get("/api/history").status_code == 401
    assert client.post("/api/history", json={"slug": "mnda", "fields": {}}).status_code == 401


def test_create_rejects_unknown_slug(client):
    signup(client)
    response = client.post("/api/history", json={"slug": "not-a-real-document", "fields": {}})
    assert response.status_code == 404


def test_create_list_and_get_round_trip(client):
    signup(client)
    fields = {"purpose": "Evaluating a partnership."}

    created = client.post("/api/history", json={"slug": "mnda", "fields": fields})
    assert created.status_code == 201
    body = created.json()
    assert body["slug"] == "mnda"
    assert body["documentTitle"] == "Mutual Non-Disclosure Agreement"
    assert body["fields"] == fields

    listing = client.get("/api/history")
    assert listing.status_code == 200
    assert [entry["id"] for entry in listing.json()] == [body["id"]]

    detail = client.get(f"/api/history/{body['id']}")
    assert detail.status_code == 200
    assert detail.json() == body


def test_update_changes_fields_and_updated_at(client):
    signup(client)
    created = client.post("/api/history", json={"slug": "mnda", "fields": {"purpose": "A"}}).json()

    updated = client.put(f"/api/history/{created['id']}", json={"fields": {"purpose": "B"}})

    assert updated.status_code == 200
    body = updated.json()
    assert body["fields"] == {"purpose": "B"}
    assert body["id"] == created["id"]


def test_get_missing_document_is_not_found(client):
    signup(client)
    assert client.get("/api/history/999").status_code == 404


def test_update_missing_document_is_not_found(client):
    signup(client)
    response = client.put("/api/history/999", json={"fields": {}})
    assert response.status_code == 404


def test_users_cannot_see_each_others_documents(client):
    signup(client, "a@example.com")
    created = client.post("/api/history", json={"slug": "mnda", "fields": {}}).json()

    client.cookies.clear()
    signup(client, "b@example.com")

    assert client.get(f"/api/history/{created['id']}").status_code == 404
    assert client.put(f"/api/history/{created['id']}", json={"fields": {}}).status_code == 404
    assert client.get("/api/history").json() == []
