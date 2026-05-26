from pydantic import BaseModel, Field
from typing import Literal


class SHMRequest(BaseModel):
    mode: Literal["spring", "pendulum", "horizontal"]
    mass: float = Field(gt=0)
    springConstant: float = Field(default=20, gt=0)
    amplitude: float = Field(default=1, gt=0)
    gravity: float = Field(default=9.81, gt=0)
    length: float = Field(default=2, gt=0)
    initialAngle: float = Field(default=20, gt=0)