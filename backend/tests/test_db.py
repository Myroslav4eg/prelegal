import pytest

from app import db


def test_create_user_then_get_by_email(conn):
    created = db.create_user(conn, "person@example.com", "hash")
    found = db.get_user_by_email(conn, "person@example.com")
    assert found["id"] == created["id"]


def test_create_user_distinct_emails(conn):
    first = db.create_user(conn, "a@example.com", "hash")
    second = db.create_user(conn, "b@example.com", "hash")
    assert first["id"] != second["id"]


def test_create_user_rejects_duplicate_email(conn):
    db.create_user(conn, "person@example.com", "hash")
    with pytest.raises(db.EmailAlreadyRegisteredError):
        db.create_user(conn, "person@example.com", "other-hash")


def test_get_user_by_email_returns_none_when_missing(conn):
    assert db.get_user_by_email(conn, "nobody@example.com") is None


def test_session_round_trip(conn):
    user = db.create_user(conn, "person@example.com", "hash")
    token = db.create_session(conn, user["id"])

    found = db.get_user_by_session_token(conn, token)

    assert found is not None
    assert found["email"] == "person@example.com"


def test_unknown_session_token_returns_none(conn):
    assert db.get_user_by_session_token(conn, "not-a-real-token") is None


def test_delete_session(conn):
    user = db.create_user(conn, "person@example.com", "hash")
    token = db.create_session(conn, user["id"])

    db.delete_session(conn, token)

    assert db.get_user_by_session_token(conn, token) is None
