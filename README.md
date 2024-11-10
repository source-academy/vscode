# sa-vscode

Experimental project for running Source Academy within Visual Studio Code.

## Running the extension in dev mode

1. Setup the project
   ```
   yarn
   ```
1. Compile
   ```
   yarn compile
   ```
1. Run the extension in debug mode by opening the root folder a VSCode window, then "Start Debugging" (or press F5).
   For now, this requires a patched version of the Source Academy frontend.

## Setting up the modified frontend

1. Ensure the `frontend` submodule has been cloned
1. Apply the patches in the `frontend-patches` folder:
   ```
   cd frontend
   # These patches are generated with `git format-patch -<n> HEAD`
   git apply --verbose ../frontend-patches/*.patch
   ```
1. Continue to follow instructions in frontend/README.md to start the frontend.
