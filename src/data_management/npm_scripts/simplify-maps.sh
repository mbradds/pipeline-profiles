#!/bin/bash
simplify_base_pct=0.1
simplify_econ_pct=0.15 #the economic regions should have a higher resolution than the basemap.
simplify_prs=1
ext=json

#base map used for all companies
mapshaper -i src/data_management/raw_data/base_map/lpr_000b16a_e.shp \
-proj EPSG:3857 -simplify $simplify_base_pct% keep-shapes -erase bbox=-15957605,9744803,-6711782,19865473 \
-o src/data_output/conditions/base_maps/base_map.$ext precision=$simplify_prs
#economic regions
mapshaper -i src/data_management/raw_data/economic_regions/ler_000b16a_e.shp \
-proj EPSG:3857 -simplify $simplify_econ_pct% keep-shapes -erase bbox=-15957605,9744803,-6711782,19865473 \
-o src/data_output/conditions/base_maps/economic_regions.$ext precision=$simplify_prs

