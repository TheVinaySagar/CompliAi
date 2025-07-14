#!/usr/bin/env python3
"""
Test script for CompliAI API authentication and chat functionality
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_login():
    """Test the login endpoint"""
    print("\nTesting login endpoint...")
    login_data = {
        "email": "admin@compli-ai.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Login Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Login successful!")
            print(f"Token Type: {data.get('token_type')}")
            print(f"Access Token: {data.get('access_token')[:50]}...")
            return data.get('access_token')
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def test_chat(token):
    """Test the chat endpoint"""
    print("\nTesting chat endpoint...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    chat_data = {
        "message": "What is GRC compliance?",
        "conversation_id": "test-conversation-001"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/",
            json=chat_data,
            headers=headers
        )
        
        print(f"Chat Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Chat successful!")
            print(f"Response: {data.get('response', '')[:200]}...")
            print(f"Conversation ID: {data.get('conversation_id')}")
            return True
        else:
            print(f"Chat failed: {response.text}")
            return False
    except Exception as e:
        print(f"Chat failed: {e}")
        return False

def test_chat_simple(token):
    """Test the simple chat endpoint"""
    print("\nTesting simple chat endpoint...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    chat_data = {
        "message": "Hello, what can you help me with?"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/simple",
            json=chat_data,
            headers=headers
        )
        
        print(f"Simple Chat Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Simple chat successful!")
            print(f"Response: {data.get('response', '')[:200]}...")
            return True
        else:
            print(f"Simple chat failed: {response.text}")
            return False
    except Exception as e:
        print(f"Simple chat failed: {e}")
        return False

def main():
    print("Starting CompliAI API Tests")
    print("=" * 50)
    
    # Test 1: Health check
    if not test_health():
        print("Server is not healthy. Exiting.")
        sys.exit(1)
    
    # Test 2: Login
    token = test_login()
    if not token:
        print("Login failed. Cannot proceed with chat tests.")
        sys.exit(1)
    
    # Test 3: Chat with conversation
    test_chat(token)
    
    # Test 4: Simple chat
    test_chat_simple(token)
    
    print("\n" + "=" * 50)
    print("API testing completed!")

if __name__ == "__main__":
    main()
