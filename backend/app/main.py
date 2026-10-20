from time import perf_counter

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .core.logginig import get_logger, setup_logging
from .core.settings import settings
from .routes import search_routes
from .utils.rate_limiter import rate_limiter

logger = get_logger(__name__)

setup_logging()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="API for LeelyAgent.",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)


app.state.limiter = rate_limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN.rstrip("/")],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[settings.FRONTEND_HOST, settings.BACKEND_HOST],
)


# Logging time taken for each api request
@app.middleware("http")
async def log_response_time(request: Request, call_next):
    start_time = perf_counter()
    response = await call_next(request)
    process_time = perf_counter() - start_time
    logger.info(f"Request: {request.url.path} completed in {process_time:.4f} seconds.")
    return response


# include routes to app
app.include_router(router=search_routes.router, prefix=f"{settings.API_V1_STR}/agent")


# health check route
@app.get("/api/v1/health", status_code=status.HTTP_200_OK, tags=["health_check route"])
@rate_limiter.limit("10/minute")
def health_checks_route(request: Request):  # noqa: ARG001
    return {"status": "ok"}
