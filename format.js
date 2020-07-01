const fs = require('fs');
const geo = require("geojson-decoder");
const world = require("./src/Earth/world.json");

const res = geo.encode(world);
fs.writeFileSync('world.json',JSON.stringify(res))