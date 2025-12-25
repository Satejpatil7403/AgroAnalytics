from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
import pandas as pd
import io
import math

from database import get_db
from models import User, FarmerData
from schemas import (
    FarmerDataCreate, 
    FarmerDataUpdate, 
    FarmerDataResponse, 
    FarmerFilter,
    PaginatedResponse
)
from auth import get_current_user

router = APIRouter(prefix="/api/farmers", tags=["Farmer Data"])

@router.get("", response_model=PaginatedResponse)
async def get_farmers(
    crop_type: str = None,
    village_name: str = None,
    min_area: float = None,
    max_area: float = None,
    min_yield: float = None,
    max_yield: float = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all farmer data with filtering, sorting, and pagination"""
    query = db.query(FarmerData)
    
    # Role-based filtering: farmers only see their own data
    if current_user.role == 'farmer':
        query = query.filter(FarmerData.user_id == current_user.id)
    
    # Apply filters
    filters = []
    if crop_type:
        filters.append(FarmerData.crop_type == crop_type)
    if village_name:
        filters.append(FarmerData.village_name == village_name)
    if min_area is not None:
        filters.append(FarmerData.area_acres >= min_area)
    if max_area is not None:
        filters.append(FarmerData.area_acres <= max_area)
    if min_yield is not None:
        filters.append(FarmerData.yield_kg >= min_yield)
    if max_yield is not None:
        filters.append(FarmerData.yield_kg <= max_yield)
    
    if filters:
        query = query.filter(and_(*filters))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(FarmerData, sort_by, FarmerData.id)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    farmers = query.offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return {
        "data": farmers,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.post("", response_model=FarmerDataResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer_data: FarmerDataCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a single farmer record"""
    new_farmer = FarmerData(
        **farmer_data.dict(),
        user_id=current_user.id
    )
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

@router.get("/{farmer_id}", response_model=FarmerDataResponse)
async def get_farmer(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single farmer record by ID"""
    farmer = db.query(FarmerData).filter(FarmerData.id == farmer_id).first()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer record not found"
        )
    return farmer

@router.put("/{farmer_id}", response_model=FarmerDataResponse)
async def update_farmer(
    farmer_id: int,
    farmer_data: FarmerDataUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a farmer record"""
    farmer = db.query(FarmerData).filter(FarmerData.id == farmer_id).first()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer record not found"
        )
    
    # Check permission: farmers can only update their own records
    if current_user.role == 'farmer' and farmer.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this record"
        )
    
    # Update only provided fields
    update_data = farmer_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(farmer, field, value)
    
    db.commit()
    db.refresh(farmer)
    return farmer

@router.delete("/delete-all-csv", status_code=status.HTTP_200_OK)
async def delete_all_csv_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all farmer data uploaded by the current officer"""
    try:
        # Only officers can delete CSV data
        if current_user.role != 'officer':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only officers can delete CSV data"
            )
        
        # Log current user and count before deletion
        count_before = db.query(FarmerData).filter(
            FarmerData.user_id == current_user.id
        ).count()
        print(f"User ID: {current_user.id}, Username: {current_user.username}, Role: {current_user.role}")
        print(f"Records before deletion: {count_before}")
        
        # Delete all records created by this officer
        deleted_count = db.query(FarmerData).filter(
            FarmerData.user_id == current_user.id
        ).delete(synchronize_session=False)
        
        db.commit()
        
        # Verify deletion
        count_after = db.query(FarmerData).filter(
            FarmerData.user_id == current_user.id
        ).count()
        print(f"Records after deletion: {count_after}")
        print(f"Successfully deleted {deleted_count} records")
        
        return {
            "message": "CSV data deleted successfully",
            "records_deleted": deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting CSV data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting data: {str(e)}"
        )

@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farmer(
    farmer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a farmer record"""
    farmer = db.query(FarmerData).filter(FarmerData.id == farmer_id).first()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer record not found"
        )
    
    # Check permission: farmers can only delete their own records
    if current_user.role == 'farmer' and farmer.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this record"
        )
    
    db.delete(farmer)
    db.commit()
    return None

@router.post("/upload-csv", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload farmer data via CSV file"""
    # Only officers can upload CSV files
    if current_user.role != 'officer':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only officers can upload CSV files"
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = [
            'farmer_name', 'village_name', 'crop_type', 
            'area_acres', 'yield_kg', 'latitude', 'longitude'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Validate data types and ranges
        errors = []
        for idx, row in df.iterrows():
            try:
                if pd.isna(row['farmer_name']) or pd.isna(row['village_name']) or pd.isna(row['crop_type']):
                    errors.append(f"Row {idx + 2}: Missing required text fields")
                    continue
                
                area = float(row['area_acres'])
                yield_val = float(row['yield_kg'])
                lat = float(row['latitude'])
                lon = float(row['longitude'])
                
                if area <= 0:
                    errors.append(f"Row {idx + 2}: area_acres must be positive")
                if yield_val <= 0:
                    errors.append(f"Row {idx + 2}: yield_kg must be positive")
                if not (-90 <= lat <= 90):
                    errors.append(f"Row {idx + 2}: latitude must be between -90 and 90")
                if not (-180 <= lon <= 180):
                    errors.append(f"Row {idx + 2}: longitude must be between -180 and 180")
            except (ValueError, TypeError) as e:
                errors.append(f"Row {idx + 2}: Invalid data type - {str(e)}")
        
        if errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "CSV validation failed", "errors": errors[:10]}  # Limit to first 10 errors
            )
        
        # Insert data
        created_count = 0
        for _, row in df.iterrows():
            farmer = FarmerData(
                farmer_name=str(row['farmer_name']).strip(),
                village_name=str(row['village_name']).strip(),
                crop_type=str(row['crop_type']).strip(),
                area_acres=float(row['area_acres']),
                yield_kg=float(row['yield_kg']),
                latitude=float(row['latitude']),
                longitude=float(row['longitude']),
                user_id=current_user.id
            )
            db.add(farmer)
            created_count += 1
        
        db.commit()
        
        return {
            "message": "CSV uploaded successfully",
            "records_created": created_count
        }
    
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )
