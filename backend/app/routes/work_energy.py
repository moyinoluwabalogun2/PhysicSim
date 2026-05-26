from fastapi import APIRouter
from app.models.work_energy import WorkEnergyRequest
from app.services.work_energy import calculate_work_energy_power

router = APIRouter(prefix="/work-energy", tags=["Work Energy Power"])


@router.post("/calculate")
def calculate_work_energy(payload: WorkEnergyRequest):
    return calculate_work_energy_power(payload)