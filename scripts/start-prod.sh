#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "🚀 Starting LearnLoop Production Server..."
cd "$DIR/frontend"
exec ./scripts/start-prod.sh
