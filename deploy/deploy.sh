#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
cd deploy
python make_production_files.py
conda deactivate