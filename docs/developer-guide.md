# Developer Guide

## Running the extension in dev mode

1. Setup the project
   ```
   yarn
   ```
1. Compile
   ```
   yarn build
   ```
1. Run the extension in debug mode by opening the root folder a VS Code window, then "Start Debugging" (or press F5).

## Publishing the extension

For a new release, update the version in `package.json` and tag the commit. Push the commit and the tag to the repo,
which will trigger GitHub Actions to build and publish the extension to Releases tab and the Marketplace.

```
npm version (major|minor|patch)
git push origin main --tags
```
