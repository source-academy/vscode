/***/
/**
 * Downloads the Source LSP server from the associated Source Academy repository
 * - source-lsp.js: The Language Server Protocol (LSP) server, bundled into a single file
 *
 * To be called by `yarn run download-lsp`
 */
/***/

const fs = require("fs");
const https = require("https");
const path = require("path");

const getOutputDir = require("./utils").getOutputDir;

main();

async function main() {
  await downloadLsp();
  process.exit(0);
}

async function downloadLsp() {
  const outputFolder = getOutputDir();
  const version = "0.1.10";
  const lspFilename = "source-lsp.js";
  const url = `https://github.com/source-academy/source-lsp/releases/download/v${version}/${lspFilename}`;
  // const url = `https://github.com/source-academy/source-lsp/releases/latest/download/${lspFilename}`;
  const outputPath = path.join(outputFolder, lspFilename); // Save in the same directory
  console.log("Downloading LSP from", url);
  await downloadFile(url, outputPath);
}

/**
 * Function to abstract the downloading of a file from a URL, because https and fs are annoying to work with
 */
async function downloadFile(url, outputPath) {
  function get(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode == 301 || res.statusCode == 302) {
          const location = res.headers.location;
          console.log(`${res.statusCode}: Redirecting to ${location}`);
          get(location).then(resolve).catch(reject);
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.statusCode !== 200) {
            console.log(`${statusCode}: Warn, status code is not 200`);
          }
          resolve(res);
        } else {
          console.log("Going to reject");
          reject(res);
        }
      });
    });
  }

  const file = fs.createWriteStream(outputPath);

  try {
    await new Promise((resolve, reject) => {
      get(url)
        .then((res) => {
          res.pipe(file);
          file.on("finish", () => {
            resolve();
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
    console.log(`File downloaded successfully to ${outputPath}`);
  } catch (err) {
    console.log("Error downloading file:");
    console.log(`${err.statusCode}`);
  } finally {
    file.close();
  }
}
