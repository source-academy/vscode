import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "../utils/FakeReact";
import ReactDOMServer from "react-dom/server";

import Messages, {
  MessageType,
  MessageTypeNames,
  sendToFrontend,
} from "../utils/messages";
import { LANGUAGES } from "../utils/languages";
import { setWebviewContent } from "../utils/webview";
import config from "../utils/config";
import { Editor } from "../utils/editor";
import { FRONTEND_ELEMENT_ID } from "../constants";
import { client } from "../extension";
import _ from "lodash";
import { McqPanelWithLogging as McqPanel } from "../webview/components/McqPanel";
import { handleMessage } from "../utils/messageHandler";

let mcqPanel: vscode.WebviewPanel | null = null;

let panel: vscode.WebviewPanel | null = null;
// This needs to be a reference to active
// TODO: Fix this ugly code!
export let activeEditor: Editor | null = null;

export async function showPanel(context: vscode.ExtensionContext) {
  let language: string | undefined = context.workspaceState.get("language");
  if (!language) {
    language = LANGUAGES.SOURCE_1;
  }

  // Get a reference to the active editor (before the focus is switched to our newly created webview)
  // firstEditor = vscode.window.activeTextEditor!;

  panel = vscode.window.createWebviewPanel(
    "source-academy-panel",
    "Source Academy",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true, // Enable scripts in the webview
      retainContextWhenHidden: true,
    },
  );

  panel.webview.onDidReceiveMessage(
    (message: MessageType) => handleMessage(context, message),
    undefined,
    context.subscriptions,
  );

  const frontendUrl = new URL("/playground", config.frontendBaseUrl).href;

  setWebviewContent(
    panel,
    context,
    // NOTE: This is not React code, but our FakeReact!
    <div
      // Account for some unexplainable margin
      // @ts-expect-error: Our FakeReact doesn't modify the style attribute
      style="width: 100%; height: calc(100vh - 10px)"
    >
      <iframe
        id={FRONTEND_ELEMENT_ID}
        src={frontendUrl}
        width="100%"
        height="100%"
        // @ts-ignore
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>,
  );

  panel.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "assets",
    "icon.png",
  );
}

export async function sendToFrontendWrapped(message: MessageType) {
  if (!panel) {
    console.error("ERROR: panel is not set");
    return;
  }
  sendToFrontend(panel, message);
}
