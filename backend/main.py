from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, farmers, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroAnalytics API",
    description="Farmer data management system with visualization capabilities",
    version="1.0.0"
)

import os

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL").rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to AgroAnalytics API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
