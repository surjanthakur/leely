import asyncio
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.routes import search_routes
from app.schema.search_query_model import SearchRequest
from app.services import search_services


def test_search_service_normalizes_and_sorts_results(monkeypatch):
    request = SearchRequest(user_query="  books  ", max_results=3, search_depth="basic")
    search_tool = AsyncMock(
        return_value={
            "results": [
                {
                    "title": "Lower-ranked result",
                    "url": "https://example.com/lower",
                    "score": 0.3,
                    "content": "Lower-ranked content",
                },
                {
                    "title": "Top result",
                    "url": "https://example.com/top",
                    "score": 0.9,
                    "content": "Top content",
                },
                "not a result object",
                {"score": 0.1},
            ]
        }
    )
    monkeypatch.setattr(search_services, "web_search_tool", search_tool)

    response = asyncio.run(search_services.search_resources_service(request))

    search_tool.assert_awaited_once_with(request)
    assert request.user_query == "books"
    assert response == {
        "found_resources": [
            {
                "title": "Top result",
                "url": "https://example.com/top",
                "score": 0.9,
                "content": "Top content",
            },
            {
                "title": "Lower-ranked result",
                "url": "https://example.com/lower",
                "score": 0.3,
                "content": "Lower-ranked content",
            },
            {"title": "Untitled resource", "url": "", "score": 0.1, "content": ""},
        ]
    }


def test_search_service_rejects_blank_query_without_calling_provider(monkeypatch):
    request = SearchRequest(user_query="   ", max_results=3, search_depth="basic")
    search_tool = AsyncMock()
    monkeypatch.setattr(search_services, "web_search_tool", search_tool)

    with pytest.raises(ValueError, match="Search query cannot be empty"):
        asyncio.run(search_services.search_resources_service(request))

    search_tool.assert_not_awaited()


@pytest.mark.parametrize(
    ("provider_error", "expected_status"),
    [
        (TimeoutError("search timed out"), 504),
        (ConnectionError("provider unavailable"), 503),
        (RuntimeError("unexpected provider error"), 500),
    ],
)
def test_search_service_maps_provider_errors(
    monkeypatch, provider_error, expected_status
):
    request = SearchRequest(user_query="books", max_results=3, search_depth="basic")
    search_tool = AsyncMock(side_effect=provider_error)
    monkeypatch.setattr(search_services, "web_search_tool", search_tool)

    with pytest.raises(HTTPException) as error:
        asyncio.run(search_services.search_resources_service(request))

    assert error.value.status_code == expected_status


def test_search_route_returns_service_response(monkeypatch):
    service = AsyncMock(return_value={"found_resources": [{"title": "A book"}]})
    monkeypatch.setattr(search_routes, "search_resources_service", service)

    with TestClient(app, base_url="http://leely.fun") as client:
        response = client.post(
            "/api/v1/agent/asks",
            json={"user_query": "books", "max_results": 3, "search_depth": "basic"},
        )

    assert response.status_code == 200
    assert response.json() == {"found_resources": [{"title": "A book"}]}
    service.assert_awaited_once()
    request = service.await_args.args[0]
    assert request.user_query == "books"
    assert request.max_results == 3
    assert request.search_depth == "basic"


def test_search_route_validates_query_length():
    with TestClient(app, base_url="http://leely.fun") as client:
        response = client.post(
            "/api/v1/agent/asks",
            json={"user_query": ""},
        )

    assert response.status_code == 422
