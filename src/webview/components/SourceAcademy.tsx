import React, { useEffect } from "react";
import { MessageType, sendToFrontend } from "../../utils/messages";

// This function is provided by vscode extension
// @ts-expect-error: Cannot find name 'acquireVsCodeApi'.ts(2304)
const vscode = acquireVsCodeApi();

// These functions act as a bridge between the webview and the extension by passing messages verbatim

function messageListener(event: MessageEvent) {
  const message: MessageType = event.data;
  if (event.origin.startsWith("vscode-webview://")) {
    sendToFrontend(document, message);
    return;
  }
  if (event.origin === "http://localhost:8000") {
    vscode.postMessage(message);
    return;
  }
}

function SourceAcademy() {
  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return <></>;
}
export default SourceAcademy;
