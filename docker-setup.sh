#!/bin/bash

# TAS Event Vote System - Docker Setup Script

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   TAS EVENT VOTE SYSTEM - Docker Setup                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed!"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker is installed"
docker --version

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose is not installed!"
    exit 1
fi

echo "✓ Docker Compose is installed"
docker-compose --version

# Create data directory
echo ""
echo "Creating data directory..."
mkdir -p data
chmod 777 data
echo "✓ Data directory created"

# Build images
echo ""
echo "Building Docker images..."
docker-compose build

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete!                        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📝 To start the application, run:"
    echo ""
    echo "   docker-compose up"
    echo ""
    echo "Then open your browser:"
    echo "   - Home:    http://localhost:3000"
    echo "   - Admin:   http://localhost:3000/admin"
    echo "   - Vote:    http://localhost:3000/vote"
    echo "   - Results: http://localhost:3000/results"
    echo ""
    echo "📚 Documentation:"
    echo "   - Setup: See DOCKER_SETUP.md"
    echo "   - Quick Start: See QUICK_START.md"
    echo ""
else
    echo "✗ Build failed!"
    exit 1
fi
