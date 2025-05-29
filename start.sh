#!/bin/bash
# Start script for the cryptocurrency mining monitoring system

# Create a Python script to initialize the ML engine with the models
cat > init_ml_engine.py << 'EOF'
import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

from ml_engine.recommender import RecommendationEngine
from ml_engine.utils.constants import MODEL_DIR

# Initialize the recommendation engine with the models
print("Initializing ML recommendation engine...")

# Find model paths
hashrate_tuner_path = os.path.join(MODEL_DIR, "hashrate_tuner_model.joblib")
overclocker_path = os.path.join(MODEL_DIR, "intelligent_overclocker_model.joblib")

# Check if models exist
if not os.path.exists(hashrate_tuner_path):
    print(f"Warning: Hashrate tuner model not found at {hashrate_tuner_path}")
else:
    print(f"Found hashrate tuner model at {hashrate_tuner_path}")

if not os.path.exists(overclocker_path):
    print(f"Warning: Intelligent overclocker model not found at {overclocker_path}")
else:
    print(f"Found intelligent overclocker model at {overclocker_path}")

# Initialize the recommendation engine
try:
    engine = RecommendationEngine(
        profit_model_path=None,
        power_model_path=None,
        hashrate_tuner_path=hashrate_tuner_path if os.path.exists(hashrate_tuner_path) else None,
        overclocker_path=overclocker_path if os.path.exists(overclocker_path) else None
    )
    print("ML recommendation engine initialized successfully")
except Exception as e:
    print(f"Error initializing ML recommendation engine: {str(e)}")
    sys.exit(1)

print("ML models loaded successfully")
EOF

# Start the ML engine
echo "Starting ML recommendation engine..."
cd crypto_mining_monitor
python init_ml_engine.py
if [ $? -ne 0 ]; then
    echo "Error initializing ML engine. Exiting."
    exit 1
fi

cd ml_engine
python -m ml_engine.api &
ML_PID=$!
cd ..

# Wait for ML engine to start
echo "Waiting for ML engine to start..."
sleep 5

# Start the web application
echo "Starting web application..."
cd webapp/app
npm run dev &
WEBAPP_PID=$!
cd ../..

echo "Both services started successfully!"
echo "ML Engine PID: $ML_PID"
echo "Web App PID: $WEBAPP_PID"
echo ""
echo "ML Engine is running at: http://localhost:8000"
echo "Web App is running at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Handle shutdown
function cleanup {
  echo "Stopping services..."
  kill $ML_PID
  kill $WEBAPP_PID
  echo "Services stopped"
  exit 0
}

trap cleanup SIGINT

# Keep script running
wait
