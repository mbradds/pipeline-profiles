#!/bin/bash
echo "running python data unit tests..."
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
cd src/data_management
python tests.py