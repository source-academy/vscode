import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";

// js-slang assumes the global variable, e.g. src/stepper/converter.ts
window.global = globalThis;

function App() {
  // This function is provided by vscode extension
  // @ts-expect-error: Cannot find name 'acquireVsCodeApi'.ts(2304)
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
