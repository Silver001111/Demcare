#!/bin/bash
echo "======================================================================="
echo "         🌿 CogniCare NER (স্মৃতি-সেতু) - Smart India Hackathon 2026"
echo "    MDoNER & LGBRIMH Tezpur Geriatric Cognitive Care Platform"
echo "======================================================================="
echo ""

if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js could not be found! Please install Node.js 18+."
    exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/apps/cognicare-app"

echo "🚀 Starting Vite Dev Server on http://localhost:5173..."
npm run dev -- --open
