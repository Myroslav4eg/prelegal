def test_me_without_cookie_is_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_signup_sets_cookie_and_returns_user(client):
    response = client.post(
        "/api/auth/signup", json={"email": "person@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    assert response.json() == {"email": "person@example.com"}
    assert "session_id" in response.cookies


def test_signup_rejects_duplicate_email(client):
    client.post("/api/auth/signup", json={"email": "person@example.com", "password": "password123"})
    response = client.post(
        "/api/auth/signup", json={"email": "person@example.com", "password": "different123"}
    )
    assert response.status_code == 409


def test_signup_rejects_short_password(client):
    response = client.post(
        "/api/auth/signup", json={"email": "person@example.com", "password": "short"}
    )
    assert response.status_code == 422


def test_me_with_valid_cookie_returns_user(client):
    client.post("/api/auth/signup", json={"email": "person@example.com", "password": "password123"})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json() == {"email": "person@example.com"}


def test_login_with_correct_password_reuses_signed_up_user(client):
    signup = client.post(
        "/api/auth/signup", json={"email": "person@example.com", "password": "password123"}
    )
    client.cookies.clear()

    login = client.post(
        "/api/auth/login", json={"email": "person@example.com", "password": "password123"}
    )

    assert login.status_code == 200
    assert login.json() == signup.json() == {"email": "person@example.com"}


def test_login_with_wrong_password_is_unauthorized(client):
    client.post("/api/auth/signup", json={"email": "person@example.com", "password": "password123"})
    client.cookies.clear()

    response = client.post(
        "/api/auth/login", json={"email": "person@example.com", "password": "wrong-password"}
    )

    assert response.status_code == 401


def test_login_with_unknown_email_is_unauthorized(client):
    response = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": "password123"}
    )
    assert response.status_code == 401


def test_logout_clears_session(client):
    client.post("/api/auth/signup", json={"email": "person@example.com", "password": "password123"})

    logout_response = client.post("/api/auth/logout")
    me_response = client.get("/api/auth/me")

    assert logout_response.status_code == 200
    assert me_response.status_code == 401
