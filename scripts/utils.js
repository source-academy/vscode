// @ts-check: Show errors in this js file

const fs = require("fs");

const OUTPUT = "out";

function getOutputDir() {
  try {
    fs.mkdirSync(OUTPUT);
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
  return OUTPUT;
}

module.exports = { getOutputDir };
