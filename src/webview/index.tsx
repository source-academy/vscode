import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Fix for "React is not defined" error
// https://stackoverflow.com/a/52352349
window.React = React;

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
