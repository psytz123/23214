#!/bin/bash
# Setup script for the ML recommendation engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install development dependencies if requested
if [ "$1" == "--dev" ]; then
    pip install -r requirements-dev.txt
    echo "Installed development dependencies"
fi

# Create necessary directories
mkdir -p ml_engine/data
mkdir -p ml_engine/models/saved
mkdir -p ml_engine/logs

echo "Setup complete. Activate the virtual environment with 'source venv/bin/activate'"
