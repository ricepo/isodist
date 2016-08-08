#!/bin/bash
#
# Prepares the .osm data files in osrm directory
#
cd osrm


#
# Determine the osrm-extract path
#
OSRM_EXTRACT="../.osrm/bin/osrm-extract"
if type "osrm-extract" > /dev/null; then
  OSRM_EXTRACT=$(which "osrm-extract")
fi


#
# Determine the osrm-contract path
#
OSRM_CONTRACT="../.osrm/bin/osrm-contract"
if type "osrm-contract" > /dev/null; then
  OSRM_CONTRACT=$(which "osrm-contract")
fi


#
# Link the car profile to current directory
#
if [ ! -f profile.lua ]; then
  ln -s ../.osrm/profiles/car.lua profile.lua
fi


#
# Extract and contract each OSM file
#
for f in *.osm.pbf; do
  base=$(basename "$f" .osm.pbf)

  if [ -f "$base.osrm" ]; then
    echo "$base.osrm already exists, skipping..."
    continue
  fi

  $OSRM_EXTRACT "$base.osm.pbf"
  $OSRM_CONTRACT "$base.osrm"

done
