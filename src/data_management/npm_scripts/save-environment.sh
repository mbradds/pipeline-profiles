#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
conda env export --from-history > environment.yml
conda deactivate