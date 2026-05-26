from fastapi import APIRouter
from app.models.momentum import MomentumRequest
from app.services.momentum import calculate_momentum_collision

router = APIRouter(prefix="/momentum", tags=["Momentum Collisions"])


@router.post("/calculate")
def calculate_momentum(payload: MomentumRequest):
    return calculate_momentum_collision(payload)