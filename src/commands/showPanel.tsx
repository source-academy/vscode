import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "../utils/FakeReact";

import Messages, { MessageType, MessageTypeNames } from "../utils/messages";
import { LANGUAGES } from "../utils/languages";
import { setWebviewContent } from "../utils/webview";
import config from "../utils/config";
import { Editor } from "../utils/editor";

const FRONTEND_ELEMENT_ID = "frontend";

let panel: vscode.WebviewPanel | null = null;
// This needs to be a reference to active
// TODO: Fix this ugly code!
export let activeEditor: Editor | null = null;

const messageQueue: MessageType[] = [];
let handling = false;

async function handleMessage(
  context: vscode.ExtensionContext,
  message: MessageType,
) {
  messageQueue.push(message);
  if (handling) {
    return;
  }
  handling = true;

  while (messageQueue.length > 0) {
    const message = messageQueue.shift()!;
    console.log(`${Date.now()} Beginning handleMessage: ${message.type}`);
    switch (message.type) {
      case MessageTypeNames.ExtensionPing:
        panel!.webview.postMessage(Messages.ExtensionPong());
        break;
      case MessageTypeNames.NewEditor:
        activeEditor = await Editor.create(
          message.workspaceLocation,
          message.assessmentName,
          message.questionId,
        );
        panel?.reveal(vscode.ViewColumn.Two);
        console.log(
          `EXTENSION: NewEditor: activeEditor set to ${activeEditor.assessmentName}_${activeEditor.questionId}`,
        );
        activeEditor.onChange((editor) => {
          const workspaceLocation = editor.workspaceLocation;
          const code = editor.getText();
          if (!code) {
            return;
          }
          if (editor !== activeEditor) {
            console.log(
              `EXTENSION: Editor ${editor.assessmentName}_${editor.questionId} is no longer active, skipping onChange`,
            );
          }
          const message = Messages.Text(workspaceLocation, code);
          console.log(`Sending message: ${JSON.stringify(message)}`);
          panel!.webview.postMessage(message);
        });
        break;
      case MessageTypeNames.Text:
        if (!activeEditor) {
          console.log("ERROR: activeEditor is not set");
          break;
        }
        activeEditor.replace(message.code, "Text");
        break;
    }
    console.log(`${Date.now()} Finish handleMessage: ${message.type}`);
  }

  handling = false;
}

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

  const frontendUrl = config.frontendUrl;

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

// TODO: Move this to a util file
export async function postMessageToPanel(message: MessageType) {
  if (!panel) {
    console.error("ERROR: panel is not set");
    return;
  }
  panel.webview.postMessage(message);
}
