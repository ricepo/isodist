#!/bin/bash
#
# Sets up OSRM backend on MacOS
#

destination=".osrm"
release="5.3"


#
# Skip if already installed
#
if [ -d "$destination" ]; then
  echo "OSRM already installed, skipping"
  exit 0
fi


#
# Install build dependencies
#
brew install boost git cmake libzip libstxxl libxml2 lua51 luajit luabind tbb


#
# Clone the OSRM repo
# IMPORTANT: We MUST checkout 5.3 tag or otherwise routing will fail down the road
#
git clone git@github.com:Project-OSRM/osrm-backend "$destination"
cd "$destination"
git checkout "$release"
mkdir -p bin
cd bin


#
# Generate CMake config and build the binaries
#
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .


#
# Print out further instructions
#
echo "-------------------------------------------------------------------------------"
echo "Please complete following steps to setup isodistance:"
echo " - Visit http://download.geofabrik.de to download OSM files"
echo " - Place .osm files into osrm directory in package directory"
echo " - $ npm run prepare"
