import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "../utils/FakeReact";

import { MessageType, sendToFrontend } from "../utils/messages";
import { LANGUAGES } from "../utils/languages";
import { setWebviewContent } from "../utils/webview";
import config from "../utils/config";
import { FRONTEND_ELEMENT_ID } from "../constants";
import _ from "lodash";
import { MessageHandler } from "../utils/messageHandler";
import { SOURCE_ACADEMY_ICON_URI } from "../extension";

let messageHandler = MessageHandler.getInstance();

export async function showPanel(
  context: vscode.ExtensionContext,
  route?: string,
  altUrl?: string,
) {
  let language: string | undefined = context.workspaceState.get("language");
  if (!language) {
    language = LANGUAGES.SOURCE_1;
  }

  // Don't recreate the panel it already exists. There will only be one panel at anytime.
  if (!messageHandler.panel) {
    messageHandler.panel = vscode.window.createWebviewPanel(
      "source-academy-panel",
      "Source Academy",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true, // Enable scripts in w the webview
        retainContextWhenHidden: true,
      },
    );

    messageHandler.panel.webview.onDidReceiveMessage(
      (message: MessageType) => messageHandler.handleMessage(context, message),
      undefined,
      context.subscriptions,
    );
  }

  const iframeUrl =
    altUrl ?? new URL(route ?? "/playground", config.frontendBaseUrl).href;

  // equivalent to panel.webview.html = ...
  setWebviewContent(
    messageHandler.panel,
    context,
    // NOTE: This is not React code, but our FakeReact!
    <div
      // Account for some unexplainable margin
      // @ts-expect-error: Our FakeReact doesn't modify the style attribute
      style="width: 100%; height: calc(100vh - 10px)"
    >
      <iframe
        id={FRONTEND_ELEMENT_ID}
        src={iframeUrl}
        width="100%"
        height="100%"
        // @ts-ignore
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>,
  );

  messageHandler.panel.iconPath = SOURCE_ACADEMY_ICON_URI;
}

export async function sendToFrontendWrapped(message: MessageType) {
  sendToFrontend(messageHandler.panel, message);
  // TODO: This returning of status code shouldn't be necessary after refactor
  if (!messageHandler.panel) {
    console.error("ERROR: panel is not set");
    return false;
  }
  sendToFrontend(messageHandler.panel, message);
  return true;
}
