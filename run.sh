#!/bin/bash

# Make sure to update the ANTHROPIC_API_KEY in .env before running this script

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Create necessary directories
mkdir -p data/documents

# Build and start the containers
docker-compose up -d

echo "FinGenius is starting up..."
echo "Frontend will be available at: http://localhost:3001"
echo "Backend API will be available at: http://localhost:8000"
echo "Celery Flower monitoring will be available at: http://localhost:5555"

echo ""
echo "IMPORTANT: Make sure to update the ANTHROPIC_API_KEY in .env with your actual API key"
