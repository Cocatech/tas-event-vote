#!/bin/bash
# TAS Event Vote - Setup Script
# This script helps initialize the system

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        TAS EVENT VOTE SYSTEM - Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check PHP
echo "✓ Checking PHP..."
if ! command -v php &> /dev/null; then
    echo "✗ PHP not found. Please install PHP from https://www.php.net"
    exit 1
fi
echo "✓ PHP found: $(php --version | head -n 1)"

# Create data folder
echo ""
echo "✓ Creating data folder..."
mkdir -p data

# Install dependencies
echo ""
echo "✓ Installing npm dependencies..."
npm install

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Open Terminal 1 and run:"
echo "   php -S localhost:8000 -t api/"
echo ""
echo "2. Open Terminal 2 and run:"
echo "   npm start"
echo ""
echo "3. Open browser:"
echo "   - Admin: http://localhost:3000/admin"
echo "   - Vote:  http://localhost:3000/vote"
echo "   - Results: http://localhost:3000/results"
echo ""
echo "📖 See QUICK_START.md for usage guide"
echo "📚 See README.md for detailed documentation"
echo ""
