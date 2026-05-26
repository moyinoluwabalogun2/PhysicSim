from pydantic import BaseModel, Field
from typing import Literal, Optional


class WorkEnergyRequest(BaseModel):
    mode: Literal["work", "energy", "power"]
    scenario: str

    force: Optional[float] = Field(default=0, ge=0)
    distance: Optional[float] = Field(default=0, ge=0)
    angle: Optional[float] = Field(default=0, ge=0, le=180)

    mass: Optional[float] = Field(default=1, gt=0)
    gravity: Optional[float] = Field(default=9.81, gt=0)
    height: Optional[float] = Field(default=0, ge=0)
    velocity: Optional[float] = Field(default=0, ge=0)

    springConstant: Optional[float] = Field(default=0, ge=0)
    compression: Optional[float] = Field(default=0, ge=0)

    time: Optional[float] = Field(default=1, gt=0)