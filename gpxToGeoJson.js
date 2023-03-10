const fs = require("fs"); // File system module
const xml2js = require("xml2js"); // XML to JSON parser

const fileName = "northCrestoneCreek";

// GPX file to convert
const gpxFile = `./toConvert/${fileName}.gpx`;

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
    // console.log({ geoJSON });
    // Write geoJSON to file
    fs.writeFile(`./converted/${fileName}.json`, geoJSON, "utf8", (err) => {
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
  gpxData.gpx.trk.forEach((trk) => {
    trk.trkseg.forEach((trkseg) => {
      const lineCoordinates = trkseg.trkpt.reduce((acc, trkpt) => {
        return [...acc, [parseFloat(trkpt.$.lon), parseFloat(trkpt.$.lat)]];
      }, []);

      // smooth line by only included every 5th set of coordinates
      const reducedLineCoordinates = lineCoordinates.filter(
        (_, i) => i % 5 === 0
      );

      const lineFeature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiLineString",
          coordinates: [reducedLineCoordinates],
        },
      };

      // add a point feature to use as the staring point of the hike
      const pointFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            reducedLineCoordinates[0][0],
            reducedLineCoordinates[0][1],
          ],
        },
        properties: {
          name: "",
          distance: "miles",
          elevationGain: "ft",
          estimatedTime: "",
          description: "",
          // bestSeasons: [],
          // rating: '',
          // difficulty: ['easy', 'medium', 'hard']
        },
      };

      const featureCollection = {
        type: "FeatureCollection",
        features: [pointFeature, lineFeature],
      };

      data = JSON.stringify(featureCollection);
    });
  });
  return data;
}
