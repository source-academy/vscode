# VS Code

Experimental project for running Source Academy within Visual Studio Code.

## How to use

TODO: Add instructions

## Notes to developers

### Running the extension in dev mode

1. Setup the project
   ```
   yarn
   ```
1. Compile
   ```
   yarn compile
   ```
1. Run the extension in debug mode by opening the root folder a VSCode window, then "Start Debugging" (or press F5).

### Publishing the extension

For a new release, update the version in `package.json` and tag the commit. Push the commit and the tag to the repo,
which will trigger GitHub Actions to build and publish the extension to Releases tab and the Marketplace.

```
npm version (major|minor|patch)
git push origin main --tags
```
