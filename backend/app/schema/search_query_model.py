from typing import Literal

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    user_query: str = Field(
        title="User query",
        description="A question or topic to search for web resources.",
        min_length=1,
        max_length=100,
        examples=["hey i want to read databse design articles."],
    )
    max_results: int = Field(default=5, title="results of resources")
    search_depth: Literal["advanced", "basic", "fast", "ultra-fast"] = Field(
        default="fast", title="dept of search result"
    )


class SearchResponse(BaseModel):
    found_resources: list[dict] = Field(
        description="Resources discovered by searching the query on the web."
    )
