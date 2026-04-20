from fastapi import APIRouter
from db import get_user_cost_summary

router = APIRouter(
    prefix="/cost",
    tags=["cost"]
)

@router.get("/summary")
def cost_summary():
    return get_user_cost_summary()