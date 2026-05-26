from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.projectile import router as projectile_router
from .routes.newton import router as newton_router
from .routes.work_energy import router as work_energy_router
from .routes.momentum import router as momentum_router
from .routes.shm import router as shm_router

app = FastAPI(
    title="Classical Mechanics Simulator API",
    description="Backend API for classical mechanics simulations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projectile_router, prefix="/api")
app.include_router(newton_router, prefix="/api")
app.include_router(work_energy_router, prefix="/api")
app.include_router(momentum_router, prefix="/api")
app.include_router(shm_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Classical Mechanics Simulator API"}