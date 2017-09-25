#! /bin/bash

png() {
  ./node_modules/.bin/svgexport "dist/img/$1.svg" "dist/img/$1-$2.png" "$2:$2"
  ./node_modules/.bin/optipng "-q" "-o7" "dist/img/$1-$2.png"
}

png "icon"  "16"
png "icon"  "32"
png "icon"  "48"
png "icon"  "64"
png "icon"  "96"
png "icon" "128"
