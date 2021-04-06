#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
conda list -e > requirements.txt