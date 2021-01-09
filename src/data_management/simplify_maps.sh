#!/bin/bash
simplify_base_pct=0.1
simplify_econ_pct=0.2 #the economic regions should have a higher resolution than the basemap.
simplify_prs=1
ext=json

#base map used for all companies
mapshaper -i src/data_management/raw_data/lpr_000b16a_e/lpr_000b16a_e.shp -proj +proj=lcc +lat_1=50 +lat_2=70 +lat_0=40 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs -simplify $simplify_base_pct% keep-shapes -o src/conditions/base_maps/base_map.$ext precision=$simplify_prs

#ngtl
mapshaper -i src/data_management/raw_data/ler_000b16a_e/ler_000b16a_e.shp -proj +proj=lcc +lat_1=50 +lat_2=70 +lat_0=40 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs -simplify $simplify_econ_pct% keep-shapes -o src/conditions/base_maps/economic_regions.$ext precision=$simplify_prs
