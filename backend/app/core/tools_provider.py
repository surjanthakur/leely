from tavily import AsyncTavilyClient

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


async def web_search_tool(query: str) -> dict:
    response = await tavily_client.search(
        query=query,
        max_results=10,
        timeout=20,
        language="en",
        search_depth="",
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
