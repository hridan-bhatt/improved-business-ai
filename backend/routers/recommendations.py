from fastapi import APIRouter, Depends
from core.security import get_current_user
from services.recommendations_service import get_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
def recommendations(user=Depends(get_current_user)):
    return get_recommendations()
