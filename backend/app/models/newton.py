from pydantic import BaseModel
from typing import List, Optional, Literal


LawType = Literal["first", "second", "third"]


class MotionPoint(BaseModel):
    t: float
    x: float
    v: float


class DualMotionPoint(BaseModel):
    t: float
    xA: float
    xB: float
    vA: float
    vB: float


class NewtonRequest(BaseModel):
    lawType: LawType

    mass: float = 5.0
    appliedForce: float = 20.0
    frictionCoefficient: float = 0.0
    gravity: float = 9.81
    time: float = 5.0
    initialVelocity: float = 0.0
    frictionEnabled: bool = False

    massA: float = 5.0
    massB: float = 8.0
    interactionForce: float = 20.0
    interactionTime: float = 2.0


class NewtonResponse(BaseModel):
    lawType: LawType
    summary: str

    net_force: Optional[float] = None
    acceleration: Optional[float] = None
    final_velocity: Optional[float] = None
    displacement: Optional[float] = None
    friction_force: Optional[float] = None

    force_on_a: Optional[float] = None
    force_on_b: Optional[float] = None
    acceleration_a: Optional[float] = None
    acceleration_b: Optional[float] = None
    final_velocity_a: Optional[float] = None
    final_velocity_b: Optional[float] = None
    displacement_a: Optional[float] = None
    displacement_b: Optional[float] = None

    points: Optional[List[MotionPoint]] = None
    dual_points: Optional[List[DualMotionPoint]] = None