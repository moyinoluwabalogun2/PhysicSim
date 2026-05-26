from fastapi import APIRouter
from app.models.shm import SHMRequest
from app.services.shm import calculate_shm

router = APIRouter(prefix="/shm", tags=["Simple Harmonic Motion"])


@router.post("/calculate")
def calculate_simple_harmonic_motion(payload: SHMRequest):
    return calculate_shm(payload)