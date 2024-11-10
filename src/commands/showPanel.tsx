import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "../utils/FakeReact";

import { MessageType, TextMessage } from "../utils/messages";
import { LANGUAGES } from "../utils/languages";
import { setWebviewContent } from "../utils/webview";
import config from "../utils/config";

const FRONTEND_ELEMENT_ID = "frontend";

export async function showPanel(context: vscode.ExtensionContext) {
  let language: string | undefined = context.workspaceState.get("language");
  if (!language) {
    language = LANGUAGES.SOURCE_1;
  }

  function sendEditorContents(editor?: vscode.TextEditor) {
    if (!editor) {
      editor = vscode.window.activeTextEditor;
    }
    if (!editor) {
      vscode.window.showErrorMessage("Please open an active editor!");
      return;
    }
    // Get text from active document and send it to Ace Editor in the frontend
    const text = editor.document.getText();
    const message: TextMessage = {
      type: MessageType.TextMessage,
      code: text,
    };
    panel.webview.postMessage(message);
  }

  // Get a reference to the active editor (before the focus is switched to our newly created webview)
  const activeEditor = vscode.window.activeTextEditor;

  const panel = vscode.window.createWebviewPanel(
    "source-academy-panel",
    "Source Academy",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true, // Enable scripts in the webview
    },
  );

  panel.webview.onDidReceiveMessage(
    (_message) => {
      sendEditorContents(activeEditor);
      vscode.workspace.onDidChangeTextDocument(() => sendEditorContents());
    },
    undefined,
    context.subscriptions,
  );

  const frontendUrl = config.frontendUrl;

  // panel.webview.html = getWebviewContent(context, panel);
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
}
