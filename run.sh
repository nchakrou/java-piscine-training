#!/usr/bin/env bash

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "          ⚡ JavaForge Platform Starter Script            "
echo "=========================================================="

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js (v18+)."
    exit 1
fi

# 2. Check Java / javac
if ! command -v java &> /dev/null || ! command -v javac &> /dev/null; then
    echo "❌ Error: Java Development Kit (javac/java) is not installed."
    exit 1
fi

echo "✔ Node.js: $(node -v)"
echo "✔ Java:    $(javac -version 2>&1)"

# 3. Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing project dependencies..."
    npm install
fi

# 4. Check if challenges dataset exists
if [ ! -f "data/challenges.json" ]; then
    echo "⚙️ Generating challenges database from tests..."
    python3 scripts/build_challenges.py
fi

# 5. Handle run mode (Dev vs Production)
MODE="${1:-prod}"
PORT="${PORT:-3001}"

if [ "$MODE" = "dev" ] || [ "$MODE" = "--dev" ]; then
    echo ""
    echo "🚀 Starting in DEVELOPMENT mode (Hot Reload)..."
    echo "   Backend API:  http://localhost:3001"
    echo "   Frontend UI:  http://localhost:5173"
    echo ""
    npx concurrently "node server/index.js" "npx vite --host"
else
    # Build frontend if dist doesn't exist
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        echo "🔨 Building frontend assets for production..."
        npm run build
    fi

    echo ""
    echo "🚀 Starting in PRODUCTION mode on port $PORT..."
    echo "👉 Open your browser at: http://localhost:$PORT"
    echo "=========================================================="
    echo ""

    PORT="$PORT" node server/index.js
fi
