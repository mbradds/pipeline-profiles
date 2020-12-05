#!/bin/bash
simplify_pct=0.3
simplify_prs=0.5
mapshaper -i src/data_management/raw_data/ler_000b16a_e/ler_000b16a_e.shp -simplify $simplify_pct% keep-shapes -o src/conditions/conditions_data/economic_regions.geojson precision=$simplify_prs
mapshaper -i src/data_management/raw_data/lpr_000b16a_e/lpr_000b16a_e.shp -simplify $simplify_pct% keep-shapes -o src/conditions/conditions_data/base_map.geojson precision=$simplify_prs