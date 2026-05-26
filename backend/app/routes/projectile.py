from fastapi import APIRouter, HTTPException
from app.models.projectile import ProjectileRequest, ProjectileResponse
from app.services.projectile_service import ProjectileService

router = APIRouter()
service = ProjectileService()


@router.post("/calculate", response_model=ProjectileResponse)
async def calculate_projectile(request: ProjectileRequest):
    try:
        if request.angle < 0 or request.angle > 90:
            raise HTTPException(status_code=400, detail="Angle must be between 0 and 90 degrees")

        if request.velocity <= 0:
            raise HTTPException(status_code=400, detail="Velocity must be positive")

        if request.gravity <= 0:
            raise HTTPException(status_code=400, detail="Gravity must be positive")

        if request.initialHeight < 0:
            raise HTTPException(status_code=400, detail="Initial height cannot be negative")

        if request.mass <= 0:
            raise HTTPException(status_code=400, detail="Mass must be positive")

        if request.diameter <= 0:
            raise HTTPException(status_code=400, detail="Diameter must be positive")

        if request.dragCoefficient <= 0:
            raise HTTPException(status_code=400, detail="Drag coefficient must be positive")

        result = service.calculate_trajectory(
            angle=request.angle,
            velocity=request.velocity,
            gravity=request.gravity,
            initial_height=request.initialHeight,
            air_resistance=request.airResistance,
            mass=request.mass,
            diameter=request.diameter,
            drag_coefficient=request.dragCoefficient,
            compare_ideal_path=request.compareIdealPath
        )

        return ProjectileResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))