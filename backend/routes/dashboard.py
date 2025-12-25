from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import User, FarmerData
from schemas import DashboardStats, CropStats, VillageStats
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated dashboard statistics"""
    total_farmers = db.query(func.count(FarmerData.id)).scalar()
    total_area = db.query(func.sum(FarmerData.area_acres)).scalar() or 0
    average_yield = db.query(func.avg(FarmerData.yield_kg)).scalar() or 0
    total_villages = db.query(func.count(func.distinct(FarmerData.village_name))).scalar()
    total_crops = db.query(func.count(func.distinct(FarmerData.crop_type))).scalar()
    
    return {
        "total_farmers": total_farmers,
        "total_area": round(total_area, 2),
        "average_yield": round(average_yield, 2),
        "total_villages": total_villages,
        "total_crops": total_crops
    }

@router.get("/top-crops", response_model=List[CropStats])
async def get_top_crops(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top crops by area and count"""
    results = db.query(
        FarmerData.crop_type,
        func.count(FarmerData.id).label('count'),
        func.sum(FarmerData.area_acres).label('total_area'),
        func.avg(FarmerData.yield_kg).label('average_yield')
    ).group_by(FarmerData.crop_type)\
     .order_by(func.sum(FarmerData.area_acres).desc())\
     .limit(limit)\
     .all()
    
    return [
        {
            "crop_type": r.crop_type,
            "count": r.count,
            "total_area": round(r.total_area, 2),
            "average_yield": round(r.average_yield, 2)
        }
        for r in results
    ]

@router.get("/village-stats", response_model=List[VillageStats])
async def get_village_stats(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get village-wise statistics"""
    results = db.query(
        FarmerData.village_name,
        func.count(FarmerData.id).label('farmer_count'),
        func.sum(FarmerData.area_acres).label('total_area')
    ).group_by(FarmerData.village_name)\
     .order_by(func.count(FarmerData.id).desc())\
     .limit(limit)\
     .all()
    
    return [
        {
            "village_name": r.village_name,
            "farmer_count": r.farmer_count,
            "total_area": round(r.total_area, 2)
        }
        for r in results
    ]
