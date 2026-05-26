from pydantic import BaseModel
from typing import List, Optional


class ProjectileRequest(BaseModel):
    angle: float
    velocity: float
    gravity: float = 9.81
    initialHeight: float = 0
    airResistance: bool = False

    mass: float = 1.0
    diameter: float = 0.1
    dragCoefficient: float = 0.47
    objectType: str = "cannonball"

    compareIdealPath: bool = False


class Point(BaseModel):
    x: float
    y: float


class ProjectileResponse(BaseModel):
    time_of_flight: float
    max_height: float
    range: float
    points: List[Point]
    final_velocity: float
    ideal_points: Optional[List[Point]] = None