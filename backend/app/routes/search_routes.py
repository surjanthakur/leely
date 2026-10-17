from fastapi import APIRouter, Request, status

from ..schema.search_query_model import SearchRequest, SearchResponse
from ..services.search_services import search_resources_service
from ..utils.rate_limiter import rate_limiter

router = APIRouter(tags=["web search"])


@router.post(
    "/asks",
    status_code=status.HTTP_200_OK,
    response_model=SearchResponse,
    summary="Search for resources",
    description=(
        "Searches the web for the supplied query and returns matching resources. "
        "The query must contain between 1 and 100 characters."
    ),
    response_description="Resources found by web search.",
)
@rate_limiter.limit("20/minute")
async def search_resources(
    requests: SearchRequest,
    request: Request,  # noqa: ARG001
) -> dict:
    return await search_resources_service(requests)
