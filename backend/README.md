# AgroAnalytics Backend

FastAPI backend for the AgroAnalytics farmer data management system.

## Features

- 🔐 JWT Authentication with role-based access control
- 📊 RESTful API for farmer data CRUD operations
- 📁 CSV upload with validation
- 🔍 Advanced filtering and sorting
- 📄 Pagination support
- 📈 Dashboard aggregation endpoints
- 💾 SQLite database with SQLAlchemy ORM

## Tech Stack

- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **PyJWT** - JWT token handling
- **Pandas** - CSV processing
- **Passlib** - Password hashing

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `hashed_password` - Bcrypt hashed password
- `role` - User role (farmer/officer)
- `created_at` - Timestamp

### Farmer Data Table
- `id` - Primary key
- `farmer_name` - Farmer's name
- `village_name` - Village name
- `crop_type` - Type of crop
- `area_acres` - Cultivated area in acres
- `yield_kg` - Yield in kilograms
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `user_id` - Foreign key to users table
- `created_at` - Timestamp
- `updated_at` - Timestamp

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Farmer Data
- `GET /api/farmers` - List farmers (with filters, sorting, pagination)
- `POST /api/farmers` - Create farmer record
- `GET /api/farmers/{id}` - Get farmer by ID
- `PUT /api/farmers/{id}` - Update farmer record
- `DELETE /api/farmers/{id}` - Delete farmer record
- `POST /api/farmers/upload-csv` - Upload CSV file

### Dashboard (Officer only)
- `GET /api/dashboard/stats` - Get aggregated statistics
- `GET /api/dashboard/top-crops` - Get top crops by area
- `GET /api/dashboard/village-stats` - Get village-wise stats

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env and update SECRET_KEY if needed
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

6. **Access API documentation**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Seeding Data

To populate the database with sample data:

1. **Create a test user** (via API or directly)
   ```bash
   # Use the /api/auth/register endpoint
   ```

2. **Upload the seed CSV**
   - Use the `/api/farmers/upload-csv` endpoint
   - Upload the `seed.csv` file included in this directory
   - This will create 100 farmer records

## Environment Variables

Create a `.env` file with the following variables:

```env
SECRET_KEY=your-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./farmviz.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Query Parameters for Filtering

The `GET /api/farmers` endpoint supports the following query parameters:

- `crop_type` - Filter by crop type
- `village_name` - Filter by village
- `min_area` - Minimum area in acres
- `max_area` - Maximum area in acres
- `min_yield` - Minimum yield in kg
- `max_yield` - Maximum yield in kg
- `sort_by` - Column to sort by (default: id)
- `sort_order` - Sort order: asc/desc (default: asc)
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 10, max: 100)

## Example API Calls

### Register a User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "farmer1",
    "password": "password123",
    "role": "farmer"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "farmer1",
    "password": "password123"
  }'
```

### Get Farmers (with filters)
```bash
curl -X GET "http://localhost:8000/api/farmers?crop_type=Rice&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Farmer Record
```bash
curl -X POST "http://localhost:8000/api/farmers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_name": "John Doe",
    "village_name": "Springfield",
    "crop_type": "Wheat",
    "area_acres": 5.5,
    "yield_kg": 2500,
    "latitude": 18.5204,
    "longitude": 73.8567
  }'
```

## Development

### Running Tests
```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests (when test files are created)
pytest
```

### Database Reset
To reset the database:
```bash
# Delete the database file
rm farmviz.db

# Restart the server (tables will be recreated)
uvicorn main:app --reload
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, run on a different port:
```bash
uvicorn main:app --reload --port 8001
```

### CORS Issues
If you encounter CORS errors, ensure the frontend URL is added to the allowed origins in `main.py`.

## Project Structure

```
backend/
├── main.py              # FastAPI app and configuration
├── database.py          # Database setup and session management
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication utilities
├── routes/
│   ├── auth.py          # Authentication endpoints
│   ├── farmers.py       # Farmer data endpoints
│   └── dashboard.py     # Dashboard endpoints
├── requirements.txt     # Python dependencies
├── seed.csv             # Sample data (100 records)
├── .env                 # Environment variables
└── README.md            # This file
```

## License

This project is created for educational purposes as a fresher-level portfolio project.
