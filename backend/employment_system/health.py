from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(request):
    """Return service health and verify that the database is reachable."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as exc:  # pragma: no cover - depends on infrastructure state
        return JsonResponse(
            {
                "status": "unhealthy",
                "database": "unavailable",
                "error": exc.__class__.__name__,
            },
            status=503,
        )

    return JsonResponse({"status": "ok", "database": "ok"})
