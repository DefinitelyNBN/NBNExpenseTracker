from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid
from enum import Enum
import calendar

# Load environment variables
load_dotenv()

app = FastAPI(title="NBNTracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "nbntracker")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
security = HTTPBearer()

# Enums
class BillingFrequency(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class ExpenseCategory(str, Enum):
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    FOOD = "food"
    TRANSPORT = "transport"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    SHOPPING = "shopping"
    SUBSCRIPTIONS = "subscriptions"
    OTHER = "other"

# Models
class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    cost: float
    billing_frequency: BillingFrequency
    next_due_date: datetime
    category: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    category: str
    tags: List[str] = []
    notes: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Budget(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "monthly" or "yearly"
    category: Optional[str] = None  # None for overall budget
    limit: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dark_mode: bool = False
    notifications_enabled: bool = True
    alert_days_before_due: int = 7
    currency: str = "INR"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class CreateSubscriptionRequest(BaseModel):
    name: str
    cost: float
    billing_frequency: BillingFrequency
    next_due_date: datetime
    category: str
    description: Optional[str] = None

class UpdateSubscriptionRequest(BaseModel):
    name: Optional[str] = None
    cost: Optional[float] = None
    billing_frequency: Optional[BillingFrequency] = None
    next_due_date: Optional[datetime] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CreateExpenseRequest(BaseModel):
    amount: float
    category: str
    tags: List[str] = []
    notes: Optional[str] = None
    date: Optional[datetime] = None

class UpdateExpenseRequest(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class CreateBudgetRequest(BaseModel):
    type: str  # "monthly" or "yearly"
    category: Optional[str] = None
    limit: float

class DashboardResponse(BaseModel):
    total_yearly_projection: float
    current_monthly_spending: float
    current_yearly_spending: float
    category_breakdown: Dict[str, float]
    upcoming_subscriptions: List[Dict[str, Any]]
    budget_alerts: List[Dict[str, Any]]
    savings_suggestions: List[str]

# Utility functions
def calculate_next_due_date(current_date: datetime, frequency: BillingFrequency) -> datetime:
    """Calculate next due date based on frequency"""
    if frequency == BillingFrequency.MONTHLY:
        if current_date.month == 12:
            return current_date.replace(year=current_date.year + 1, month=1)
        else:
            # Handle month-end dates
            next_month = current_date.month + 1
            year = current_date.year
            last_day = calendar.monthrange(year, next_month)[1]
            day = min(current_date.day, last_day)
            return current_date.replace(month=next_month, day=day)
    else:  # yearly
        return current_date.replace(year=current_date.year + 1)

def calculate_yearly_projection(subscriptions: List[Dict]) -> float:
    """Calculate total yearly spending projection from subscriptions"""
    total = 0
    for sub in subscriptions:
        if sub['is_active']:
            if sub['billing_frequency'] == 'monthly':
                total += sub['cost'] * 12
            else:  # yearly
                total += sub['cost']
    return total

# API Routes
@app.get("/api/health")
async def health_check():
    try:
        # Try to ping the MongoDB server
        await db.command("ping")
        return {"status": "healthy", "db": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "db": "disconnected", "error": str(e)}

# Subscription endpoints
@app.post("/api/subscriptions", response_model=Subscription)
async def create_subscription(request: CreateSubscriptionRequest):
    subscription = Subscription(**request.dict())
    result = await db.subscriptions.insert_one(subscription.dict())
    return subscription

@app.get("/api/subscriptions", response_model=List[Subscription])
async def get_subscriptions():
    subscriptions = await db.subscriptions.find({"is_active": True}).to_list(length=None)
    return [Subscription(**sub) for sub in subscriptions]

@app.get("/api/subscriptions/{subscription_id}", response_model=Subscription)
async def get_subscription(subscription_id: str):
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return Subscription(**subscription)

@app.put("/api/subscriptions/{subscription_id}", response_model=Subscription)
async def update_subscription(subscription_id: str, request: UpdateSubscriptionRequest):
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    updated_subscription = await db.subscriptions.find_one({"id": subscription_id})
    return Subscription(**updated_subscription)

@app.delete("/api/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    result = await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return {"message": "Subscription deleted successfully"}

# Expense endpoints
@app.post("/api/expenses", response_model=Expense)
async def create_expense(request: CreateExpenseRequest):
    expense_data = request.dict()
    if expense_data.get('date') is None:
        expense_data['date'] = datetime.utcnow()
    
    expense = Expense(**expense_data)
    result = await db.expenses.insert_one(expense.dict())
    return expense

@app.get("/api/expenses", response_model=List[Expense])
async def get_expenses(
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    query = {}
    
    if category:
        query["category"] = category
    
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    elif end_date:
        query["date"] = {"$lte": end_date}
    
    expenses = await db.expenses.find(query).sort("date", -1).limit(limit).to_list(length=None)
    return [Expense(**exp) for exp in expenses]

@app.get("/api/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return Expense(**expense)

@app.put("/api/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, request: UpdateExpenseRequest):
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.expenses.update_one(
        {"id": expense_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    updated_expense = await db.expenses.find_one({"id": expense_id})
    return Expense(**updated_expense)

@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {"message": "Expense deleted successfully"}

# Budget endpoints
@app.post("/api/budgets", response_model=Budget)
async def create_budget(request: CreateBudgetRequest):
    budget = Budget(**request.dict())
    result = await db.budgets.insert_one(budget.dict())
    return budget

@app.get("/api/budgets", response_model=List[Budget])
async def get_budgets():
    budgets = await db.budgets.find().to_list(length=None)
    return [Budget(**budget) for budget in budgets]

@app.put("/api/budgets/{budget_id}", response_model=Budget)
async def update_budget(budget_id: str, request: CreateBudgetRequest):
    update_data = request.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.budgets.update_one(
        {"id": budget_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    updated_budget = await db.budgets.find_one({"id": budget_id})
    return Budget(**updated_budget)

@app.delete("/api/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    result = await db.budgets.delete_one({"id": budget_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    return {"message": "Budget deleted successfully"}

# Dashboard endpoint
@app.get("/api/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    try:
        # Get current date
        now = datetime.utcnow()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        # Get subscriptions
        subscriptions = await db.subscriptions.find({"is_active": True}).to_list(length=None)
        # Get expenses
        monthly_expenses = await db.expenses.find({
            "date": {"$gte": current_month_start}
        }).to_list(length=None)
        yearly_expenses = await db.expenses.find({
            "date": {"$gte": current_year_start}
        }).to_list(length=None)
        # Calculate totals
        yearly_projection = calculate_yearly_projection(subscriptions)
        monthly_spending = sum(exp['amount'] for exp in monthly_expenses)
        yearly_spending = sum(exp['amount'] for exp in yearly_expenses)
        # Calculate subscription costs for the year
        subscription_yearly_cost = 0
        for sub in subscriptions:
            if sub['is_active']:
                if sub['billing_frequency'] == 'monthly':
                    subscription_yearly_cost += sub['cost'] * 12
                else:
                    subscription_yearly_cost += sub['cost']
        yearly_spending += subscription_yearly_cost
        # Category breakdown
        category_breakdown = {}
        for exp in yearly_expenses:
            category = exp['category']
            category_breakdown[category] = category_breakdown.get(category, 0) + exp['amount']
        # Add subscription costs to breakdown
        for sub in subscriptions:
            if sub['is_active']:
                category = sub['category']
                yearly_cost = sub['cost'] * 12 if sub['billing_frequency'] == 'monthly' else sub['cost']
                category_breakdown[category] = category_breakdown.get(category, 0) + yearly_cost
        # Upcoming subscriptions (next 7 days)
        upcoming_date = now + timedelta(days=7)
        upcoming_subscriptions = []
        for sub in subscriptions:
            if sub['is_active'] and sub['next_due_date'] <= upcoming_date:
                upcoming_subscriptions.append({
                    "id": sub['id'],
                    "name": sub['name'],
                    "cost": sub['cost'],
                    "due_date": sub['next_due_date'],
                    "days_until_due": (sub['next_due_date'] - now).days
                })
        # Budget alerts
        budgets = await db.budgets.find().to_list(length=None)
        budget_alerts = []
        for budget in budgets:
            if budget['type'] == 'monthly':
                current_spending = monthly_spending
                if budget['category']:
                    current_spending = sum(exp['amount'] for exp in monthly_expenses if exp['category'] == budget['category'])
            else:  # yearly
                current_spending = yearly_spending
                if budget['category']:
                    current_spending = category_breakdown.get(budget['category'], 0)
            if current_spending > budget['limit']:
                budget_alerts.append({
                    "type": budget['type'],
                    "category": budget['category'],
                    "limit": budget['limit'],
                    "current": current_spending,
                    "exceeded_by": current_spending - budget['limit']
                })
        # Savings suggestions
        savings_suggestions = []
        # Suggest cancelling expensive subscriptions
        expensive_subs = [sub for sub in subscriptions if sub['is_active'] and sub['cost'] > 500]
        if expensive_subs:
            total_savings = sum(sub['cost'] * 12 if sub['billing_frequency'] == 'monthly' else sub['cost'] for sub in expensive_subs)
            savings_suggestions.append(f"Consider reviewing {len(expensive_subs)} expensive subscriptions to save up to ₹{total_savings:.0f} annually")
        # Suggest reducing high-spending categories
        high_spending_categories = [(cat, amount) for cat, amount in category_breakdown.items() if amount > yearly_spending * 0.2]
        if high_spending_categories:
            cat, amount = max(high_spending_categories, key=lambda x: x[1])
            savings_suggestions.append(f"Consider reducing spending on {cat} where you've spent ₹{amount:.0f} this year")
        return DashboardResponse(
            total_yearly_projection=yearly_projection,
            current_monthly_spending=monthly_spending,
            current_yearly_spending=yearly_spending,
            category_breakdown=category_breakdown,
            upcoming_subscriptions=upcoming_subscriptions,
            budget_alerts=budget_alerts,
            savings_suggestions=savings_suggestions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Analytics endpoints
@app.get("/api/analytics/categories")
async def get_category_analytics():
    """Get spending analytics by category"""
    now = datetime.utcnow()
    current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get yearly expenses
    yearly_expenses = await db.expenses.find({
        "date": {"$gte": current_year_start}
    }).to_list(length=None)
    
    # Get subscriptions
    subscriptions = await db.subscriptions.find({"is_active": True}).to_list(length=None)
    
    # Category breakdown
    category_breakdown = {}
    for exp in yearly_expenses:
        category = exp['category']
        category_breakdown[category] = category_breakdown.get(category, 0) + exp['amount']
    
    # Add subscription costs
    for sub in subscriptions:
        if sub['is_active']:
            category = sub['category']
            yearly_cost = sub['cost'] * 12 if sub['billing_frequency'] == 'monthly' else sub['cost']
            category_breakdown[category] = category_breakdown.get(category, 0) + yearly_cost
    
    return {"category_breakdown": category_breakdown}

@app.get("/api/analytics/trends")
async def get_spending_trends():
    """Get monthly spending trends for the current year"""
    now = datetime.utcnow()
    current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get expenses for current year
    yearly_expenses = await db.expenses.find({
        "date": {"$gte": current_year_start}
    }).to_list(length=None)
    
    # Group by month
    monthly_trends = {}
    for exp in yearly_expenses:
        month_key = exp['date'].strftime('%Y-%m')
        monthly_trends[month_key] = monthly_trends.get(month_key, 0) + exp['amount']
    
    return {"monthly_trends": monthly_trends}

# Export endpoints
@app.get("/api/export/csv")
async def export_data_csv():
    """Export all data as CSV format"""
    # Get all data
    subscriptions = await db.subscriptions.find().to_list(length=None)
    expenses = await db.expenses.find().to_list(length=None)
    budgets = await db.budgets.find().to_list(length=None)
    
    # Convert MongoDB ObjectIds to strings for JSON serialization
    def convert_objectid(data):
        if isinstance(data, list):
            return [convert_objectid(item) for item in data]
        elif isinstance(data, dict):
            return {key: str(value) if hasattr(value, '__str__') and '_id' in key else convert_objectid(value) if isinstance(value, (dict, list)) else value for key, value in data.items()}
        return data
    
    return {
        "subscriptions": convert_objectid(subscriptions),
        "expenses": convert_objectid(expenses),
        "budgets": convert_objectid(budgets)
    }

# Serve React static files from the build directory
frontend_build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')
app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)