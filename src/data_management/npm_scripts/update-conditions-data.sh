#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
cd src/data_management
python conditions.py
conda deactivate