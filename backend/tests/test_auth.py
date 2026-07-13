def test_me_without_cookie_is_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_login_sets_cookie_and_returns_user(client):
    response = client.post(
        "/api/auth/login", json={"email": "person@example.com", "password": "anything"}
    )
    assert response.status_code == 200
    assert response.json() == {"email": "person@example.com"}
    assert "session_id" in response.cookies


def test_me_with_valid_cookie_returns_user(client):
    client.post("/api/auth/login", json={"email": "person@example.com", "password": "x"})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json() == {"email": "person@example.com"}


def test_login_twice_with_same_email_reuses_user(client):
    first = client.post("/api/auth/login", json={"email": "person@example.com", "password": "a"})
    client.cookies.clear()
    second = client.post("/api/auth/login", json={"email": "person@example.com", "password": "b"})

    assert first.json() == second.json() == {"email": "person@example.com"}


def test_logout_clears_session(client):
    client.post("/api/auth/login", json={"email": "person@example.com", "password": "x"})

    logout_response = client.post("/api/auth/logout")
    me_response = client.get("/api/auth/me")

    assert logout_response.status_code == 200
    assert me_response.status_code == 401
