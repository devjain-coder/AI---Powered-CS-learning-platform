from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import runner

app = FastAPI(title="AlgoLab Backend Engine")

# CORS middleware for React connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the router
app.include_router(runner.router)

@app.get("/")
def root():
    return {"status": "AlgoLab Backend is running"}