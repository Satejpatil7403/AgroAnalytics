from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'farmer' or 'officer'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to farmer data
    farmer_data = relationship("FarmerData", back_populates="user", cascade="all, delete-orphan")


class FarmerData(Base):
    __tablename__ = "farmer_data"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String, nullable=False, index=True)
    village_name = Column(String, nullable=False, index=True)
    crop_type = Column(String, nullable=False, index=True)
    area_acres = Column(Float, nullable=False)
    yield_kg = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to user
    user = relationship("User", back_populates="farmer_data")
