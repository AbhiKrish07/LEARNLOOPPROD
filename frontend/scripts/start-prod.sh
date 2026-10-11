#!/usr/bin/env bash
set -e

# ==============================================================================
# LearnLoop Production Server Runner
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

export NODE_ENV="production"
export PORT="${PORT:-3002}"

echo "=========================================================="
echo "  🚀 Starting LearnLoop Production Server"
echo "  Port:        $PORT"
echo "  Environment: $NODE_ENV"
echo "  Directory:   $DIR"
echo "=========================================================="

# Check if build output exists; if not, build it automatically
if [ ! -f "dist/index.js" ] || [ ! -d "dist/public" ]; then
  echo "⚡ Production bundle not found. Building now..."
  npm run build
fi

echo "✨ Launching node dist/index.js..."
exec node dist/index.js
