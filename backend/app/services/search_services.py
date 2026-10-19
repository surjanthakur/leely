from fastapi import HTTPException, status

from ..core.logginig import get_logger
from ..core.tools_provider import web_search_tool
from ..schema.search_query_model import SearchRequest

logger = get_logger(__name__)


async def search_resources_service(search_req: SearchRequest):

    if not search_req:
        raise ValueError("Search query cannot be empty.")

    try:
        logger.info(f"👍 executing web_search_tool for query: {search_req.user_query}")

        response = await web_search_tool()

        search_results = (
            response.get("results", []) if isinstance(response, dict) else []
        )
        logger.info("web_search_tool executed successfully✅")
        resources = []

        for result in search_results:
            if not isinstance(result, dict):
                continue
            title = result.get("title") or "Untitled resource"
            url = result.get("url") or ""
            score = result.get("score", 0)
            content = result.get("content") or ""
            resources.append(
                {
                    "title": title,
                    "url": url,
                    "score": score,
                    "content": content,
                }
            )

        resources.sort(key=lambda resource: resource["score"], reverse=True)

        logger.info("returned response successfully by search_resource_service ✅")

        return {"found_resources": resources}

    except ValueError as exc:
        logger.exception("value error while search_resource_services")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a search topic before searching.",
        ) from exc

    except TimeoutError as exc:
        logger.exception("timeout error while search_resource_services")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The search is taking longer than expected. Please try again.",
        ) from exc

    except (ConnectionError, OSError) as exc:
        logger.exception("network error while search_resource_services")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn't connect to the search service. Check your connection and try again.",
        ) from exc

    except Exception:
        logger.exception("something went wrong while search_resource_services")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We couldn't complete your search right now. Please try again in a moment.",
        ) from None
