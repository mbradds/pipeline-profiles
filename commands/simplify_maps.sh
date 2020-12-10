#!/bin/bash
simplify_pct=0.3
simplify_prs=0.5
ext=json
degrees=-5
mapshaper -i src/data_management/raw_data/ler_000b16a_e/ler_000b16a_e.shp -proj +proj=lcc +lat_1=50 +lat_2=70 +lat_0=40 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs -simplify $simplify_pct% keep-shapes -o src/conditions/conditions_data/economic_regions.$ext precision=$simplify_prs
mapshaper -i src/data_management/raw_data/lpr_000b16a_e/lpr_000b16a_e.shp -proj +proj=lcc +lat_1=50 +lat_2=70 +lat_0=40 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs -simplify $simplify_pct% keep-shapes -o src/conditions/conditions_data/base_map.$ext precision=$simplify_prs