# OSRM

You will need to download `.osm` files corresponding to the regions where you wish to calculate
isodistances. [Geofabrik][1] is a good source of these files.

After you put `.osm` files in here, run the following script from project root:
```sh
$ npm run prepare
```

Please note that this operation can take an hour or more, depending on the map size.


[1]: http://download.geofabrik.de
