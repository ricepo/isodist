#!/bin/bash
#
# Prepares the .osm data files in osrm directory
#
cd osrm


#
# Link the car profile to current directory
#
if [ ! -f profile.lua ]; then
  ln -s ../.osrm/profiles/car.lua profile.lua
fi


#
# Extract and contract each OSM file
#
for f in *.osm; do
  base=$(basename "$f" .osm)

  ../.osrm/bin/osrm-extract "$base.osm"
  ../.osrm/bin/osrm-contract "$base.osrm"

done
