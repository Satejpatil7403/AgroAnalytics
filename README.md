<<<<<<< HEAD
# AgroAnalytics Web Application

A full-stack farmer data management system with React frontend and FastAPI backend.

## Overview

AgroAnalytics is designed to help manage agricultural data efficiently. It allows farmers to record their crop details, location, and yield, while providing officers with aggregated insights through interactive dashboards.

## Features

- **Full-Stack Architecture**: React + Vite frontend, FastAPI + SQLite backend
- **Role-Based Access Control**: Separate views for Farmers and Officers
- **Data Management**: CRUD operations, CSV upload, filtering, and sorting
- **Visual Analytics**: Interactive charts and geospatial mapping
- **Reporting**: PDF export functionality with embedded visualizations
- **Modern UI**: Responsive, glassmorphism-inspired design

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Default Users

You can register new users via the registration page, or use the API to create them.
- **Farmer Role**: Can manage individual records
- **Officer Role**: Access to aggregated dashboard

## Seed Data

To populate the database with ~100 sample records:
1. Register a user
2. Login and go to the "Farmer Data" page
3. Upload the `backend/seed.csv` file using the CSV Upload component

## License


=======
# AgroAnalytics
AgroAnalytics is designed to help manage agricultural data efficiently. It allows farmers to record their crop details, location, and yield, while providing officers with aggregated insights through interactive dashboards.
>>>>>>> c425cbb5c9ec8092ed197d497adac19bdc4eb059
