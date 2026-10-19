from tavily import AsyncTavilyClient

from ..schema.search_query_model import SearchRequest
from .settings import settings

tavily_client = AsyncTavilyClient(api_key=settings.TRAVILY_API_KEY)

PREFERRED_DOMAINS = [
    "medium.com",
    "substack.com",
    "reddit.com",
    "theconversation.com",
    "aeon.co",
    "arxiv.org",
    "semanticscholar.org",
    "researchgate.net",
    "academia.edu",
]

EXCLUDED_DOMAINS = [
    "youtube.com",
    "instagram.com",
    "tiktok.com",
]


async def web_search_tool(req: SearchRequest) -> dict:
    response = await tavily_client.search(
        query=req.user_query,
        max_results=req.max_results | 5,
        timeout=20,
        language="en",
        search_depth=req.search_depth or "ultra-fast",
        include_domains_mode="prefer",
        include_usage=False,
        include_answer=False,
        include_favicon=False,
        safe_search=True,
        include_images=False,
        include_raw_content=False,
        include_generated_markdown=False,
        include_published_date=True,
        filter_by_language=False,
        include_domains=PREFERRED_DOMAINS,
        exclude_domains=EXCLUDED_DOMAINS,
    )

    return response
