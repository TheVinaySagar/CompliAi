#!/usr/bin/env python3
"""
CompliAI Server Setup and Test Script
Use this script to setup and test the server functionality.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the API directory to the path
api_dir = Path(__file__).parent / "apps" / "api"
sys.path.insert(0, str(api_dir))

async def test_database_connection():
    """Test database connectivity"""
    try:
        from database.connection import connect_to_mongo, close_mongo_connection
        
        print("🔌 Testing database connection...")
        await connect_to_mongo()
        print("✅ Database connection successful!")
        
        await close_mongo_connection()
        print("✅ Database disconnection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_user_repository():
    """Test user repository functionality"""
    try:
        from database.user_repository import user_repository
        from database.connection import connect_to_mongo, close_mongo_connection
        
        print("👤 Testing user repository...")
        await connect_to_mongo()
        
        # Check if admin exists
        admin_exists = await user_repository.check_admin_exists()
        print(f"✅ Admin check: {'Admin exists' if admin_exists else 'No admin found'}")
        
        await close_mongo_connection()
        return True
    except Exception as e:
        print(f"❌ User repository test failed: {e}")
        return False

async def test_team_repository():
    """Test team repository functionality"""
    try:
        from database.team_repository import team_repository
        from database.connection import connect_to_mongo, close_mongo_connection
        
        print("👥 Testing team repository...")
        await connect_to_mongo()
        
        # Test basic team functionality
        invitations = await team_repository.list_pending_invitations()
        print(f"✅ Team repository: Found {len(invitations)} pending invitations")
        
        await close_mongo_connection()
        return True
    except Exception as e:
        print(f"❌ Team repository test failed: {e}")
        return False

def test_imports():
    """Test all critical imports"""
    try:
        print("📦 Testing imports...")
        
        # Test API imports
        from config import settings
        print("✅ Config imported successfully")
        
        from models.user_models import User, UserRole
        print("✅ User models imported successfully")
        
        from models.team_models import TeamMember, TeamStats
        print("✅ Team models imported successfully")
        
        from routes.team_routes import router
        print("✅ Team routes imported successfully")
        
        from services.email_service import email_service
        print("✅ Email service imported successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

async def run_server_test():
    """Run a quick server test"""
    try:
        print("🚀 Testing server startup...")
        
        # Import FastAPI app
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Test that all routes are included
        routes = [route.path for route in app.routes]
        team_routes = [route for route in routes if route.startswith("/team")]
        
        print(f"✅ Found {len(team_routes)} team routes:")
        for route in team_routes:
            print(f"   - {route}")
        
        return True
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🔧 CompliAI Server Setup and Test")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Database Connection", test_database_connection),
        ("User Repository", test_user_repository),
        ("Team Repository", test_team_repository),
        ("Server Test", run_server_test),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n🎯 Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("\n🎉 All tests passed! Your CompliAI server is ready to run.")
        print("\n🚀 To start the server:")
        print("   Backend:  cd apps/api && python main.py")
        print("   Frontend: cd apps/web && npm run dev")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the errors above.")
    
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
