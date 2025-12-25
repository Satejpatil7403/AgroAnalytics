from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# ============= User Schemas =============

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(..., pattern="^(farmer|officer)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ============= Farmer Data Schemas =============

class FarmerDataBase(BaseModel):
    farmer_name: str = Field(..., min_length=1, max_length=100)
    village_name: str = Field(..., min_length=1, max_length=100)
    crop_type: str = Field(..., min_length=1, max_length=50)
    area_acres: float = Field(..., gt=0)
    yield_kg: float = Field(..., gt=0)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class FarmerDataCreate(FarmerDataBase):
    pass

class FarmerDataUpdate(BaseModel):
    farmer_name: Optional[str] = Field(None, min_length=1, max_length=100)
    village_name: Optional[str] = Field(None, min_length=1, max_length=100)
    crop_type: Optional[str] = Field(None, min_length=1, max_length=50)
    area_acres: Optional[float] = Field(None, gt=0)
    yield_kg: Optional[float] = Field(None, gt=0)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class FarmerDataResponse(FarmerDataBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============= Filter & Pagination Schemas =============

class FarmerFilter(BaseModel):
    crop_type: Optional[str] = None
    village_name: Optional[str] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    min_yield: Optional[float] = None
    max_yield: Optional[float] = None
    sort_by: Optional[str] = "id"
    sort_order: Optional[str] = "asc"
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)

class PaginatedResponse(BaseModel):
    data: List[FarmerDataResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============= Dashboard Schemas =============

class DashboardStats(BaseModel):
    total_farmers: int
    total_area: float
    average_yield: float
    total_villages: int
    total_crops: int

class CropStats(BaseModel):
    crop_type: str
    count: int
    total_area: float
    average_yield: float

class VillageStats(BaseModel):
    village_name: str
    farmer_count: int
    total_area: float
