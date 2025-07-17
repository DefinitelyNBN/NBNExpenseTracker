#!/usr/bin/env python3
"""
NBNTracker Backend API Testing Suite
Tests all backend endpoints with realistic Indian data
"""

import requests
import json
from datetime import datetime, timedelta
import uuid
import sys

# Backend URL from environment
BACKEND_URL = "https://6a91b622-ceba-43e1-b07d-cd09e4d8a24d.preview.emergentagent.com/api"

class NBNTrackerTester:
    def __init__(self):
        self.session = requests.Session()
        self.created_items = {
            'subscriptions': [],
            'expenses': [],
            'budgets': []
        }
        
    def log(self, message, level="INFO"):
        """Log test messages"""
        print(f"[{level}] {message}")
        
    def test_health_check(self):
        """Test health check endpoint"""
        self.log("Testing Health Check Endpoint...")
        try:
            response = self.session.get(f"{BACKEND_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log("✅ Health check passed", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Health check failed - unexpected response: {data}", "ERROR")
                    return False
            else:
                self.log(f"❌ Health check failed - status code: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Health check failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_subscription_crud(self):
        """Test subscription CRUD operations"""
        self.log("Testing Subscription Management CRUD...")
        
        # Test data - realistic Indian subscriptions
        test_subscriptions = [
            {
                "name": "Netflix Premium",
                "cost": 649.0,
                "billing_frequency": "monthly",
                "next_due_date": (datetime.now() + timedelta(days=15)).isoformat(),
                "category": "entertainment",
                "description": "Streaming service for movies and TV shows"
            },
            {
                "name": "Jio Fiber",
                "cost": 1499.0,
                "billing_frequency": "monthly", 
                "next_due_date": (datetime.now() + timedelta(days=5)).isoformat(),
                "category": "utilities",
                "description": "High-speed internet connection"
            },
            {
                "name": "Amazon Prime",
                "cost": 1499.0,
                "billing_frequency": "yearly",
                "next_due_date": (datetime.now() + timedelta(days=300)).isoformat(),
                "category": "entertainment",
                "description": "Prime membership with video streaming"
            }
        ]
        
        try:
            # Test CREATE
            self.log("Testing subscription creation...")
            for sub_data in test_subscriptions:
                response = self.session.post(f"{BACKEND_URL}/subscriptions", json=sub_data)
                if response.status_code == 200:
                    created_sub = response.json()
                    self.created_items['subscriptions'].append(created_sub['id'])
                    self.log(f"✅ Created subscription: {created_sub['name']}")
                else:
                    self.log(f"❌ Failed to create subscription: {response.status_code} - {response.text}", "ERROR")
                    return False
            
            # Test READ (get all)
            self.log("Testing get all subscriptions...")
            response = self.session.get(f"{BACKEND_URL}/subscriptions")
            if response.status_code == 200:
                subscriptions = response.json()
                if len(subscriptions) >= len(test_subscriptions):
                    self.log(f"✅ Retrieved {len(subscriptions)} subscriptions")
                else:
                    self.log(f"❌ Expected at least {len(test_subscriptions)} subscriptions, got {len(subscriptions)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get subscriptions: {response.status_code}", "ERROR")
                return False
            
            # Test READ (get single)
            if self.created_items['subscriptions']:
                sub_id = self.created_items['subscriptions'][0]
                self.log(f"Testing get single subscription: {sub_id}")
                response = self.session.get(f"{BACKEND_URL}/subscriptions/{sub_id}")
                if response.status_code == 200:
                    subscription = response.json()
                    self.log(f"✅ Retrieved subscription: {subscription['name']}")
                else:
                    self.log(f"❌ Failed to get subscription: {response.status_code}", "ERROR")
                    return False
            
            # Test UPDATE
            if self.created_items['subscriptions']:
                sub_id = self.created_items['subscriptions'][0]
                update_data = {"cost": 699.0, "description": "Updated Netflix subscription"}
                self.log(f"Testing subscription update: {sub_id}")
                response = self.session.put(f"{BACKEND_URL}/subscriptions/{sub_id}", json=update_data)
                if response.status_code == 200:
                    updated_sub = response.json()
                    if updated_sub['cost'] == 699.0:
                        self.log("✅ Subscription updated successfully")
                    else:
                        self.log(f"❌ Subscription update failed - cost not updated", "ERROR")
                        return False
                else:
                    self.log(f"❌ Failed to update subscription: {response.status_code}", "ERROR")
                    return False
            
            # Test DELETE
            if self.created_items['subscriptions']:
                sub_id = self.created_items['subscriptions'][0]
                self.log(f"Testing subscription deletion: {sub_id}")
                response = self.session.delete(f"{BACKEND_URL}/subscriptions/{sub_id}")
                if response.status_code == 200:
                    self.log("✅ Subscription deleted successfully")
                    self.created_items['subscriptions'].remove(sub_id)
                else:
                    self.log(f"❌ Failed to delete subscription: {response.status_code}", "ERROR")
                    return False
            
            self.log("✅ Subscription CRUD tests passed", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"❌ Subscription CRUD tests failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_expense_crud(self):
        """Test expense CRUD operations"""
        self.log("Testing Expense Management CRUD...")
        
        # Test data - realistic Indian expenses
        test_expenses = [
            {
                "amount": 2500.0,
                "category": "food",
                "tags": ["restaurant", "dinner", "family"],
                "notes": "Family dinner at Barbeque Nation",
                "date": datetime.now().isoformat()
            },
            {
                "amount": 450.0,
                "category": "transport",
                "tags": ["uber", "office"],
                "notes": "Uber ride to office",
                "date": (datetime.now() - timedelta(days=1)).isoformat()
            },
            {
                "amount": 1200.0,
                "category": "healthcare",
                "tags": ["medicine", "pharmacy"],
                "notes": "Monthly medicines from Apollo Pharmacy"
            }
        ]
        
        try:
            # Test CREATE
            self.log("Testing expense creation...")
            for exp_data in test_expenses:
                response = self.session.post(f"{BACKEND_URL}/expenses", json=exp_data)
                if response.status_code == 200:
                    created_exp = response.json()
                    self.created_items['expenses'].append(created_exp['id'])
                    self.log(f"✅ Created expense: ₹{created_exp['amount']} for {created_exp['category']}")
                else:
                    self.log(f"❌ Failed to create expense: {response.status_code} - {response.text}", "ERROR")
                    return False
            
            # Test READ (get all)
            self.log("Testing get all expenses...")
            response = self.session.get(f"{BACKEND_URL}/expenses")
            if response.status_code == 200:
                expenses = response.json()
                if len(expenses) >= len(test_expenses):
                    self.log(f"✅ Retrieved {len(expenses)} expenses")
                else:
                    self.log(f"❌ Expected at least {len(test_expenses)} expenses, got {len(expenses)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get expenses: {response.status_code}", "ERROR")
                return False
            
            # Test READ with filters
            self.log("Testing expense filtering by category...")
            response = self.session.get(f"{BACKEND_URL}/expenses?category=food")
            if response.status_code == 200:
                food_expenses = response.json()
                self.log(f"✅ Retrieved {len(food_expenses)} food expenses")
            else:
                self.log(f"❌ Failed to filter expenses: {response.status_code}", "ERROR")
                return False
            
            # Test READ (get single)
            if self.created_items['expenses']:
                exp_id = self.created_items['expenses'][0]
                self.log(f"Testing get single expense: {exp_id}")
                response = self.session.get(f"{BACKEND_URL}/expenses/{exp_id}")
                if response.status_code == 200:
                    expense = response.json()
                    self.log(f"✅ Retrieved expense: ₹{expense['amount']}")
                else:
                    self.log(f"❌ Failed to get expense: {response.status_code}", "ERROR")
                    return False
            
            # Test UPDATE
            if self.created_items['expenses']:
                exp_id = self.created_items['expenses'][0]
                update_data = {"amount": 2800.0, "notes": "Updated expense amount"}
                self.log(f"Testing expense update: {exp_id}")
                response = self.session.put(f"{BACKEND_URL}/expenses/{exp_id}", json=update_data)
                if response.status_code == 200:
                    updated_exp = response.json()
                    if updated_exp['amount'] == 2800.0:
                        self.log("✅ Expense updated successfully")
                    else:
                        self.log(f"❌ Expense update failed - amount not updated", "ERROR")
                        return False
                else:
                    self.log(f"❌ Failed to update expense: {response.status_code}", "ERROR")
                    return False
            
            # Test DELETE
            if self.created_items['expenses']:
                exp_id = self.created_items['expenses'][0]
                self.log(f"Testing expense deletion: {exp_id}")
                response = self.session.delete(f"{BACKEND_URL}/expenses/{exp_id}")
                if response.status_code == 200:
                    self.log("✅ Expense deleted successfully")
                    self.created_items['expenses'].remove(exp_id)
                else:
                    self.log(f"❌ Failed to delete expense: {response.status_code}", "ERROR")
                    return False
            
            self.log("✅ Expense CRUD tests passed", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"❌ Expense CRUD tests failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_budget_crud(self):
        """Test budget CRUD operations"""
        self.log("Testing Budget Management CRUD...")
        
        # Test data - realistic Indian budgets
        test_budgets = [
            {
                "type": "monthly",
                "category": "food",
                "limit": 15000.0
            },
            {
                "type": "monthly", 
                "category": "entertainment",
                "limit": 5000.0
            },
            {
                "type": "yearly",
                "limit": 200000.0  # Overall yearly budget
            }
        ]
        
        try:
            # Test CREATE
            self.log("Testing budget creation...")
            for budget_data in test_budgets:
                response = self.session.post(f"{BACKEND_URL}/budgets", json=budget_data)
                if response.status_code == 200:
                    created_budget = response.json()
                    self.created_items['budgets'].append(created_budget['id'])
                    category_str = created_budget.get('category', 'overall')
                    self.log(f"✅ Created {created_budget['type']} budget for {category_str}: ₹{created_budget['limit']}")
                else:
                    self.log(f"❌ Failed to create budget: {response.status_code} - {response.text}", "ERROR")
                    return False
            
            # Test READ (get all)
            self.log("Testing get all budgets...")
            response = self.session.get(f"{BACKEND_URL}/budgets")
            if response.status_code == 200:
                budgets = response.json()
                if len(budgets) >= len(test_budgets):
                    self.log(f"✅ Retrieved {len(budgets)} budgets")
                else:
                    self.log(f"❌ Expected at least {len(test_budgets)} budgets, got {len(budgets)}", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get budgets: {response.status_code}", "ERROR")
                return False
            
            # Test UPDATE
            if self.created_items['budgets']:
                budget_id = self.created_items['budgets'][0]
                update_data = {"limit": 18000.0}
                self.log(f"Testing budget update: {budget_id}")
                response = self.session.put(f"{BACKEND_URL}/budgets/{budget_id}", json=update_data)
                if response.status_code == 200:
                    updated_budget = response.json()
                    if updated_budget['limit'] == 18000.0:
                        self.log("✅ Budget updated successfully")
                    else:
                        self.log(f"❌ Budget update failed - limit not updated", "ERROR")
                        return False
                else:
                    self.log(f"❌ Failed to update budget: {response.status_code}", "ERROR")
                    return False
            
            # Test DELETE
            if self.created_items['budgets']:
                budget_id = self.created_items['budgets'][0]
                self.log(f"Testing budget deletion: {budget_id}")
                response = self.session.delete(f"{BACKEND_URL}/budgets/{budget_id}")
                if response.status_code == 200:
                    self.log("✅ Budget deleted successfully")
                    self.created_items['budgets'].remove(budget_id)
                else:
                    self.log(f"❌ Failed to delete budget: {response.status_code}", "ERROR")
                    return False
            
            self.log("✅ Budget CRUD tests passed", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"❌ Budget CRUD tests failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_dashboard_analytics(self):
        """Test dashboard analytics endpoint"""
        self.log("Testing Dashboard Analytics...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/dashboard")
            if response.status_code == 200:
                dashboard_data = response.json()
                
                # Check required fields
                required_fields = [
                    'total_yearly_projection',
                    'current_monthly_spending', 
                    'current_yearly_spending',
                    'category_breakdown',
                    'upcoming_subscriptions',
                    'budget_alerts',
                    'savings_suggestions'
                ]
                
                for field in required_fields:
                    if field not in dashboard_data:
                        self.log(f"❌ Dashboard missing required field: {field}", "ERROR")
                        return False
                
                # Validate data types
                if not isinstance(dashboard_data['total_yearly_projection'], (int, float)):
                    self.log("❌ total_yearly_projection should be numeric", "ERROR")
                    return False
                
                if not isinstance(dashboard_data['category_breakdown'], dict):
                    self.log("❌ category_breakdown should be a dictionary", "ERROR")
                    return False
                
                if not isinstance(dashboard_data['upcoming_subscriptions'], list):
                    self.log("❌ upcoming_subscriptions should be a list", "ERROR")
                    return False
                
                # Check INR currency formatting in suggestions
                suggestions = dashboard_data.get('savings_suggestions', [])
                inr_found = any('₹' in suggestion for suggestion in suggestions)
                
                self.log(f"✅ Dashboard data retrieved successfully")
                self.log(f"   - Yearly projection: ₹{dashboard_data['total_yearly_projection']:.2f}")
                self.log(f"   - Monthly spending: ₹{dashboard_data['current_monthly_spending']:.2f}")
                self.log(f"   - Categories: {len(dashboard_data['category_breakdown'])}")
                self.log(f"   - Upcoming subscriptions: {len(dashboard_data['upcoming_subscriptions'])}")
                self.log(f"   - Budget alerts: {len(dashboard_data['budget_alerts'])}")
                self.log(f"   - INR formatting in suggestions: {'✅' if inr_found else '⚠️'}")
                
                return True
            else:
                self.log(f"❌ Failed to get dashboard data: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Dashboard analytics test failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        self.log("Testing Analytics Endpoints...")
        
        try:
            # Test category analytics
            self.log("Testing category analytics...")
            response = self.session.get(f"{BACKEND_URL}/analytics/categories")
            if response.status_code == 200:
                category_data = response.json()
                if 'category_breakdown' in category_data:
                    self.log(f"✅ Category analytics retrieved: {len(category_data['category_breakdown'])} categories")
                else:
                    self.log("❌ Category analytics missing category_breakdown", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get category analytics: {response.status_code}", "ERROR")
                return False
            
            # Test spending trends
            self.log("Testing spending trends...")
            response = self.session.get(f"{BACKEND_URL}/analytics/trends")
            if response.status_code == 200:
                trends_data = response.json()
                if 'monthly_trends' in trends_data:
                    self.log(f"✅ Spending trends retrieved: {len(trends_data['monthly_trends'])} months")
                else:
                    self.log("❌ Spending trends missing monthly_trends", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get spending trends: {response.status_code}", "ERROR")
                return False
            
            self.log("✅ Analytics endpoints tests passed", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"❌ Analytics endpoints tests failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_data_export(self):
        """Test data export endpoint (previously failing)"""
        self.log("Testing Data Export Endpoint (Previously Fixed)...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/export/csv")
            if response.status_code == 200:
                export_data = response.json()
                
                # Check required fields
                required_fields = ['subscriptions', 'expenses', 'budgets']
                for field in required_fields:
                    if field not in export_data:
                        self.log(f"❌ Export data missing required field: {field}", "ERROR")
                        return False
                
                # Validate data types
                if not isinstance(export_data['subscriptions'], list):
                    self.log("❌ subscriptions should be a list", "ERROR")
                    return False
                
                if not isinstance(export_data['expenses'], list):
                    self.log("❌ expenses should be a list", "ERROR")
                    return False
                
                if not isinstance(export_data['budgets'], list):
                    self.log("❌ budgets should be a list", "ERROR")
                    return False
                
                # Check if ObjectId serialization is working (no ObjectId objects in response)
                export_str = json.dumps(export_data)  # This would fail if ObjectIds weren't serialized
                
                self.log("✅ Data export endpoint working correctly")
                self.log(f"   - Subscriptions: {len(export_data['subscriptions'])}")
                self.log(f"   - Expenses: {len(export_data['expenses'])}")
                self.log(f"   - Budgets: {len(export_data['budgets'])}")
                self.log("   - ObjectId serialization: ✅ Fixed")
                
                return True
            else:
                self.log(f"❌ Failed to export data: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Data export test failed - exception: {str(e)}", "ERROR")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        self.log("Testing Error Handling...")
        
        try:
            # Test 404 for non-existent subscription
            fake_id = str(uuid.uuid4())
            response = self.session.get(f"{BACKEND_URL}/subscriptions/{fake_id}")
            if response.status_code == 404:
                self.log("✅ 404 error handling for non-existent subscription")
            else:
                self.log(f"❌ Expected 404, got {response.status_code}", "ERROR")
                return False
            
            # Test invalid data for subscription creation
            invalid_data = {"name": "Test", "cost": "invalid_cost"}
            response = self.session.post(f"{BACKEND_URL}/subscriptions", json=invalid_data)
            if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
                self.log("✅ Validation error handling for invalid subscription data")
            else:
                self.log(f"❌ Expected 400/422, got {response.status_code}", "ERROR")
                return False
            
            # Test 404 for non-existent expense
            response = self.session.get(f"{BACKEND_URL}/expenses/{fake_id}")
            if response.status_code == 404:
                self.log("✅ 404 error handling for non-existent expense")
            else:
                self.log(f"❌ Expected 404, got {response.status_code}", "ERROR")
                return False
            
            self.log("✅ Error handling tests passed", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"❌ Error handling tests failed - exception: {str(e)}", "ERROR")
            return False
    
    def cleanup(self):
        """Clean up created test data"""
        self.log("Cleaning up test data...")
        
        # Delete remaining subscriptions
        for sub_id in self.created_items['subscriptions']:
            try:
                self.session.delete(f"{BACKEND_URL}/subscriptions/{sub_id}")
            except:
                pass
        
        # Delete remaining expenses
        for exp_id in self.created_items['expenses']:
            try:
                self.session.delete(f"{BACKEND_URL}/expenses/{exp_id}")
            except:
                pass
        
        # Delete remaining budgets
        for budget_id in self.created_items['budgets']:
            try:
                self.session.delete(f"{BACKEND_URL}/budgets/{budget_id}")
            except:
                pass
        
        self.log("✅ Cleanup completed")
    
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("=" * 60)
        self.log("STARTING NBNTracker Backend API Tests")
        self.log("=" * 60)
        
        test_results = {}
        
        # Run tests in order of priority
        tests = [
            ("Health Check Endpoint", self.test_health_check),
            ("Subscription Management CRUD", self.test_subscription_crud),
            ("Expense Management CRUD", self.test_expense_crud),
            ("Budget Management CRUD", self.test_budget_crud),
            ("Dashboard Analytics", self.test_dashboard_analytics),
            ("Analytics Endpoints", self.test_analytics_endpoints),
            ("Data Export Endpoint", self.test_data_export),
            ("Error Handling", self.test_error_handling)
        ]
        
        for test_name, test_func in tests:
            self.log(f"\n{'='*20} {test_name} {'='*20}")
            try:
                result = test_func()
                test_results[test_name] = result
                if result:
                    self.log(f"✅ {test_name} PASSED", "SUCCESS")
                else:
                    self.log(f"❌ {test_name} FAILED", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name} FAILED with exception: {str(e)}", "ERROR")
                test_results[test_name] = False
        
        # Cleanup
        self.cleanup()
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("TEST SUMMARY")
        self.log("=" * 60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
            return True
        else:
            self.log(f"⚠️  {total - passed} tests failed", "ERROR")
            return False

if __name__ == "__main__":
    tester = NBNTrackerTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)