# ![Header][0]

> mad-science@ricepo

This package can compute isodistance polygons based on driving distance.

## Getting Started
```sh
$ npm install isodist
```

In order to run `isodist`, you will need to download an `*.osm` file corresponding to the region
where you want to do your computation. [Geofabrik](http://download.geofabrik.de) is a good source of
these files.

You need to place your OSM files into the `isodist/osrm` directory (create one if it does not exist).
Then run the following command to generate `.osrm` files:
```sh
$ npm run prepare
```

Finally, you are good to go! In order to generate the graph above, you will need `indiana.osrm` and
run the following:
```sh
$ isodist --lon=-86.893386 --lat=40.417202 --stops=2,5,7 --resolution=0.1 --hexsize=0.5 --deburr --osrm=in
```


## Command Line Arguments

### `--lat`
**Required**.

Latitude of the origin point.

### `--lon`
**Required**.

Longitude of the origin point.

### `--stops`
**Required**.

Distances at which to compute isodistance polygons.
For example, to compute isodistance polygons at 1, 2, 5 and 10 miles, use
`--stops=1,2,5,10`


### `--osrm`
**Required**.

Name of the `.osrm` file you wish to use for routing.


### `-o, --output`
Optional, default: `output.json`

Specifies the file where to output resulting GeoJSON FeatureCollection.


### `-r, --resolution`
Optional, default: 0.2

Sampling resolution of the underlying point grid. Larger values will result in less precise
results but much faster processing. Smaller values will produce more precise results, but will
require exponentially more processing time and memory.


### `-h, --hexsize`
Optional, default: 0.5

Size of hex grid cells that isodistances are fitted onto. Passing a 0 value will disable
hex grid fitting.


### `--deburr`
Optional, default: none

This flag instructs `isodist` to remove isolated "islands" from isodistance geometries.




[0]: media/isodist.png
