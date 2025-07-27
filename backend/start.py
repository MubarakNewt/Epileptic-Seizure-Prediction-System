#!/usr/bin/env python3
"""
Start script for the FastAPI backend server
"""
import uvicorn
import os

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    print("🚀 Starting Epileptic Seizure Prediction Backend...")
    print(f"📡 Server will be available at: http://localhost:{port}")
    print("📚 API Documentation: http://localhost:{port}/docs")
    print("🔄 Auto-reload enabled for development")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )