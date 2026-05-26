from pydantic import BaseModel, Field
from typing import Literal


class MomentumRequest(BaseModel):
    mode: Literal["momentum", "collision", "recoil"]
    scenario: str

    mass1: float = Field(gt=0)
    velocity1: float

    mass2: float = Field(default=0.0, ge=0)
    velocity2: float = 0.0

    collisionType: Literal["elastic", "inelastic"] = "elastic"