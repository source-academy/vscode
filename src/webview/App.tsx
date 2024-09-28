import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";

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
