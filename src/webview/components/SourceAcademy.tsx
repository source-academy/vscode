/**
 * This script is injected into the VSC panel and lives in the Webview context.
 * It simply relays messages between the VSC Extension context and the Frontend iframe context.
 */
//
import React, { useEffect } from "react";
import { MessageType } from "../../utils/messages";

// This function is provided by vscode extension.
// In the Webview context we cannot use import * as vscode from "vscode";
// @ts-expect-error: Cannot find name 'acquireVsCodeApi'.ts(2304)
const vscode = acquireVsCodeApi();

const FRONTEND_ELEMENT_ID = "frontend";

function relayToFrontend(document: Document, message: MessageType) {
  const iframe: HTMLIFrameElement = document.getElementById(
    FRONTEND_ELEMENT_ID,
  ) as HTMLIFrameElement;
  const contentWindow = iframe.contentWindow;
  if (!contentWindow) {
    return;
  }
  // TODO: Don't hardcode this!
  contentWindow.postMessage(message, "http://localhost:8000");
}

function relayToExtension(message: MessageType) {
  vscode.postMessage(message);
}

function messageListener(event: MessageEvent) {
  const message: MessageType = event.data;
  if (event.origin.startsWith("vscode-webview://")) {
    relayToFrontend(document, message);
    return;
  }
  if (event.origin === "http://localhost:8000") {
    relayToExtension(message);
    return;
  }
}

const SourceAcademy: React.FC = () => {
  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return <></>;
};
export default SourceAcademy;
