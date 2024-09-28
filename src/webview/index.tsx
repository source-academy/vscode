import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Fix for "React is not defined" error
// https://stackoverflow.com/a/52352349
window.React = React;
window.__filename = "HAHA";

(function () {
    // Define a simple custom require function for demonstration
    function customRequire(modulePath: string) {
      console.log(`Custom require called for module: ${modulePath}`);
      return import(modulePath)
        .then((module) => module.default || module)
        .catch((err) => {
          console.error(`Failed to load module: ${modulePath}`, err);
          throw err;
        });
    }

    // // Attach the custom require function to the global object (window in browser)
    // // @ts-ignore
    // window.require = customRequire;
    // // @ts-ignore
    // globalThis.require = customRequire;

    // Define window.require as a non-writable, non-configurable property
    //
    Object.defineProperty(window, 'require', {
      value: customRequire,
      writable: false,
      configurable: false
    });
    Object.defineProperty(globalThis, 'require', {
      value: customRequire,
      writable: false,
      configurable: false
    });


    // Test the custom require globally
    console.log('Custom require function added to global scope');
  })();

  console.log({
      location: "sa-vscode:index",
      require: require,
  });

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
