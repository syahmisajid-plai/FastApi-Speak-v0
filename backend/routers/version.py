from fastapi import APIRouter, Response

router = APIRouter()

APP_VERSION = "1.0.1"

@router.get("/version")
def get_version():
    return Response(
        content=f'{{"version": "{APP_VERSION}"}}',
        media_type="application/json",
        headers={"Cache-Control": "no-store"}
    )