#!/bin/bash

# Pool Maintenance App Start Script
echo "🏖️ Starting Luxury Villa Pool Maintenance App..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Create backend directory if it doesn't exist
mkdir -p backend

# Start backend server in background
echo "🚀 Starting Backend Server..."
cd backend
python3 -m venv venv 2>/dev/null || echo "Virtual environment already exists"
source venv/bin/activate || echo "Using system Python"
pip install -r requirements.txt > /dev/null 2>&1 || echo "Dependencies already installed"
python3 app.py &
BACKEND_PID=$!
echo "✅ Backend server started on http://localhost:5000 (PID: $BACKEND_PID)"

# Go back to root directory
cd ..

# Start frontend server
echo "🚀 Starting Frontend Server..."
npm install > /dev/null 2>&1 || echo "Dependencies already installed"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend server started on http://localhost:3000 (PID: $FRONTEND_PID)"

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🔄 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
    kill $FRONTEND_PID 2>/dev/null || echo "Frontend already stopped"
    echo "✅ Cleanup complete"
    exit 0
}

# Set up trap for cleanup on exit
trap cleanup SIGINT SIGTERM

echo ""
echo "🎉 Pool Maintenance App is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID