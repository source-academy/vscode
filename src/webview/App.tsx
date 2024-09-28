import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";

// js-slang assumes the global variable, e.g. src/stepper/converter.ts
window.global = globalThis;

function App() {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  useEffect(() => {
    vscode.postMessage({
      command: "alert",
      text: "ready",
    });
  });

  return (
    <>
      <Stepper />;
    </>
  );
}
export default App;
