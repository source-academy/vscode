import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "./FakeReact";
import ReactDOMServer from "react-dom/server";

import Messages, {
  MessageType,
  MessageTypeNames,
  sendToFrontend,
} from "./messages";
import { setWebviewContent } from "./webview";
import { Editor } from "./editor";
import { client } from "../extension";
import _ from "lodash";
import { McqPanelWithLogging as McqPanel } from "../webview/components/McqPanel";

/*
 * MessageHandler is a singleton class that handles messages from the frontend
 * and manages the state of the webview panels.
 * Design choice: Active panel, mcqPanel, and activeEditor are all stored in the same class.
 * Trade-off: Requires an instance of MessageHandler to be created and used instead of exporting
 * the activeEditor and active panel directly.
 */
export class MessageHandler {
  private messageQueue: MessageType[] = [];
  private handling = false;
  public panel: vscode.WebviewPanel | null = null;
  public mcqPanel: vscode.WebviewPanel | null = null;
  public activeEditor: Editor | null = null;

  async handleMessage(context: vscode.ExtensionContext, message: MessageType) {
    this.messageQueue.push(message);
    if (this.handling) {
      return;
    }
    this.handling = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      console.log(`${Date.now()} Beginning handleMessage: ${message.type}`);
      switch (message.type) {
        case MessageTypeNames.ExtensionPing:
          sendToFrontend(this.panel, Messages.ExtensionPong(null));
          break;
        case MessageTypeNames.MCQQuestion: {
          if (this.mcqPanel === null) {
            this.mcqPanel = vscode.window.createWebviewPanel(
              "mcq-question-panel",
              `Question ${message.questionId + 1}`,
              vscode.ViewColumn.One,
              { enableScripts: true, retainContextWhenHidden: true },
            );

            this.mcqPanel.onDidDispose(() => {
              this.mcqPanel = null;
            });
          }
          this.mcqPanel.title = `Question ${message.questionId + 1}`;
          this.mcqPanel.iconPath = vscode.Uri.joinPath(
            context.extensionUri,
            "assets",
            "icon.png",
          );
          let activePanel = await McqPanel({
            data: {
              assessmentName: message.assessmentName ?? "",
              questionId: message.questionId,
              question: message.question,
              choices: message.options,
              workspaceLocation: message.workspaceLocation ?? "assessment",
            },
          });
          setWebviewContent(
            this.mcqPanel,
            context,
            <div
              // @ts-ignore: Our FakeReact doesn't modify the style attribute
              style="width: 100%; height: calc(100vh - 10px)"
              id="mcq-panel"
            >
              {ReactDOMServer.renderToString(activePanel)}
            </div>,
          );
          this.mcqPanel.reveal(vscode.ViewColumn.One);

          break;
        }
        case MessageTypeNames.MCQAnswer:
          console.log(`Received MCQ answer: ${message.choice}`);
          sendToFrontend(this.panel, message);
          break;
        case MessageTypeNames.NewEditor:
          this.activeEditor = await Editor.create(
            message.workspaceLocation,
            message.assessmentName,
            message.questionId,
            message.prepend,
            message.initialCode,
          );
          this.activeEditor.uri;
          const info = context.globalState.get("info") ?? {};
          if (this.activeEditor.uri) {
            // TODO: Write our own wrapper to set nested keys easily, removing lodash
            // @ts-ignore
            _.set(
              info,
              `["${this.activeEditor.uri}"].chapter`,
              message.chapter ?? 1,
            );
            // TODO: message.prepend can be undefined in runtime, investigate
            const nPrependLines =
              message.prepend && message.prepend !== ""
                ? message.prepend.split("\n").length + 2 // account for start/end markers
                : 0;
            _.set(info, `["${this.activeEditor.uri}"].prepend`, nPrependLines);
            context.globalState.update("info", info);
            client.sendRequest("source/publishInfo", info);
          }

          this.panel?.reveal(vscode.ViewColumn.Two);
          console.log(
            `EXTENSION: NewEditor: activeEditor set to ${this.activeEditor.assessmentName}_${this.activeEditor.questionId}`,
          );

          this.activeEditor.onChange((editor: Editor) => {
            const workspaceLocation = editor.workspaceLocation;
            const code = editor.getText();
            if (!code) {
              return;
            }
            if (editor !== this.activeEditor) {
              console.log(
                `EXTENSION: Editor ${editor.assessmentName}_${editor.questionId}_${editor.assessmentType} is no longer active, skipping onChange`,
              );
            }
            if (this.activeEditor) {
              console.log("activeEditor keys and values:");
              Object.entries(this.activeEditor).forEach(([key, value]) => {
                console.log(`${key}:`, value);
              });
            }
            const message = Messages.Text(workspaceLocation, code);
            console.log(`Sending message: ${JSON.stringify(message)}`);
            sendToFrontend(this.panel, message);
          });
          break;
      }
      console.log(`${Date.now()} Finish handleMessage: ${message.type}`);
    }

    this.handling = false;
  }

  static instance: MessageHandler | null = null;

  static getInstance() {
    if (!MessageHandler.instance) {
      MessageHandler.instance = new MessageHandler();
    }
    return MessageHandler.instance;
  }
}
