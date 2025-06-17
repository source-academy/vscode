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
   yarn run build
   ```
1. Run the extension in debug mode by opening the root folder a VSCode window, then "Start Debugging" (or press F5).

### Using the extension

1. Open the Command Palette (Ctrl+Shift+P) and run `Source Academy: Show Source Academy Panel`.
2. Open User Settings, change Frontend Base URL to \_\_

### Publishing the extension

For a new release, update the version in `package.json` and tag the commit. Push the commit and the tag to the repo,
which will trigger GitHub Actions to build and publish the extension to Releases tab and the Marketplace.

```
npm version (major|minor|patch)
git push origin main --tags
```
