from app import db


def test_get_or_create_user_is_idempotent(conn):
    first = db.get_or_create_user(conn, "person@example.com")
    second = db.get_or_create_user(conn, "person@example.com")
    assert first["id"] == second["id"]


def test_get_or_create_user_distinct_emails(conn):
    first = db.get_or_create_user(conn, "a@example.com")
    second = db.get_or_create_user(conn, "b@example.com")
    assert first["id"] != second["id"]


def test_session_round_trip(conn):
    user = db.get_or_create_user(conn, "person@example.com")
    token = db.create_session(conn, user["id"])

    found = db.get_user_by_session_token(conn, token)

    assert found is not None
    assert found["email"] == "person@example.com"


def test_unknown_session_token_returns_none(conn):
    assert db.get_user_by_session_token(conn, "not-a-real-token") is None


def test_delete_session(conn):
    user = db.get_or_create_user(conn, "person@example.com")
    token = db.create_session(conn, user["id"])

    db.delete_session(conn, token)

    assert db.get_user_by_session_token(conn, token) is None
