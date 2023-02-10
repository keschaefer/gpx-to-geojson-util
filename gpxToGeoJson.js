const fs = require("fs"); // File system module
const xml2js = require("xml2js"); // XML to JSON parser

const fileName = "test.gpx";

// GPX file to convert
const gpxFile = `./toConvert/${fileName}`;

// Read GPX file
fs.readFile(gpxFile, "utf8", (err, data) => {
  if (err) {
    console.log(`Error reading GPX file: ${err}`);
    return;
  }

  // Parse GPX data to JSON
  xml2js.parseString(data, (err, json) => {
    if (err) {
      console.log(`Error parsing GPX data: ${err}`);
      return;
    }

    // Convert JSON to geoJSON
    const geoJSON = gpxToGeoJSON(json);
    console.log({ geoJSON });
    // Write geoJSON to file
    fs.writeFile(`./converted/${fileName}`, geoJSON, "utf8", (err) => {
      if (err) {
        console.log(`Error writing geoJSON file: ${err}`);
        return;
      }

      console.log("GPX file successfully converted to geoJSON!");
    });
  });
});

// Converts GPX data to geoJSON
function gpxToGeoJSON(gpxData) {
  let data = {};
  // Loop through tracks (usually only one)
  gpxData.gpx.trk.forEach((trk) => {
    // Loop through track segments
    trk.trkseg.forEach((trkseg) => {
      // Loop through track points
      const foo = trkseg.trkpt.reduce((acc, trkpt) => {
        return [...acc, [parseFloat(trkpt.$.lon), parseFloat(trkpt.$.lat)]];
      }, []);

      const feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiLineString",
          coordinates: [foo],
        },
      };

      const bar = {
        type: "FeatureCollection",
        features: [feature],
      };
      // console.log(JSON.stringify(bar));
      data = JSON.stringify(bar);
    });

    // Add track point properties (if any)
    // Object.keys(trkpt).forEach((key) => {
    //   if (key !== "$") {
    //     feature.properties[key] = trkpt[key][0];
    //   }
    // });
  });
  console.log(data);
  return data;
}
