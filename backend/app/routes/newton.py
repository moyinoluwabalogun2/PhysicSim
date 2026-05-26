from fastapi import APIRouter, HTTPException
from app.models.newton import NewtonRequest, NewtonResponse
from app.services.newton_service import NewtonService

router = APIRouter()
service = NewtonService()


@router.post("/newton/calculate", response_model=NewtonResponse)
async def calculate_newton(payload: NewtonRequest):
    try:
        if payload.lawType in ["first", "second"]:
            if payload.mass <= 0:
                raise HTTPException(status_code=400, detail="Mass must be positive")
            if payload.gravity <= 0:
                raise HTTPException(status_code=400, detail="Gravity must be positive")
            if payload.time <= 0:
                raise HTTPException(status_code=400, detail="Time must be positive")
            if payload.frictionCoefficient < 0:
                raise HTTPException(status_code=400, detail="Friction coefficient cannot be negative")

        if payload.lawType == "second" and payload.appliedForce < 0:
            raise HTTPException(status_code=400, detail="Applied force cannot be negative")

        if payload.lawType == "third":
            if payload.massA <= 0 or payload.massB <= 0:
                raise HTTPException(status_code=400, detail="Masses must be positive")
            if payload.interactionTime <= 0:
                raise HTTPException(status_code=400, detail="Interaction time must be positive")
            if payload.interactionForce <= 0:
                raise HTTPException(status_code=400, detail="Interaction force must be positive")

        result = service.calculate(payload)
        return NewtonResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))