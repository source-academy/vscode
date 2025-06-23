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

let mcqPanel: vscode.WebviewPanel | null = null;

let panel: vscode.WebviewPanel | null = null;
// This needs to be a reference to active
// TODO: Fix this ugly code!
export let activeEditor: Editor | null = null;

const messageQueue: MessageType[] = [];
let handling = false;

export async function handleMessage(
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
        sendToFrontend(panel, Messages.ExtensionPong(null));
        break;
      case MessageTypeNames.MCQQuestion: {
        if (mcqPanel === null) {
          mcqPanel = vscode.window.createWebviewPanel(
            "mcq-question-panel",
            `Question ${message.questionId + 1}`,
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true },
          );

          mcqPanel.onDidDispose(() => {
            mcqPanel = null;
          });
        }
        mcqPanel.title = `Question ${message.questionId + 1}`;
        mcqPanel.iconPath = vscode.Uri.joinPath(
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
          mcqPanel,
          context,
          <div
            // @ts-ignore: Our FakeReact doesn't modify the style attribute
            style="width: 100%; height: calc(100vh - 10px)"
            id="mcq-panel"
          >
            {ReactDOMServer.renderToString(activePanel)}
          </div>,
        );
        mcqPanel.reveal(vscode.ViewColumn.One);

        break;
      }
      case MessageTypeNames.MCQAnswer:
        console.log(`Received MCQ answer: ${message.choice}`);
        sendToFrontend(panel, message);
        break;
      case MessageTypeNames.NewEditor:
        // console.log(message.questionType + " questionType \n");
        // if (message.questionType == "mcq") {
        //   break;
        // }
        activeEditor = await Editor.create(
          message.workspaceLocation,
          message.assessmentName,
          message.questionId,
          message.prepend,
          message.initialCode,
        );
        activeEditor.uri;
        const info = context.globalState.get("info") ?? {};
        if (activeEditor.uri) {
          // TODO: Write our own wrapper to set nested keys easily, removing lodash
          // @ts-ignore
          _.set(info, `["${activeEditor.uri}"].chapter`, message.chapter ?? 1);
          // TODO: message.prepend can be undefined in runtime, investigate
          const nPrependLines =
            message.prepend && message.prepend !== ""
              ? message.prepend.split("\n").length + 2 // account for start/end markers
              : 0;
          _.set(info, `["${activeEditor.uri}"].prepend`, nPrependLines);
          context.globalState.update("info", info);
          client.sendRequest("source/publishInfo", info);
        }

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
              `EXTENSION: Editor ${editor.assessmentName}_${editor.questionId}_${editor.assessmentType} is no longer active, skipping onChange`,
            );
          }
          if (activeEditor) {
            console.log("activeEditor keys and values:");
            Object.entries(activeEditor).forEach(([key, value]) => {
              console.log(`${key}:`, value);
            });
          }
          const message = Messages.Text(workspaceLocation, code);
          console.log(`Sending message: ${JSON.stringify(message)}`);
          sendToFrontend(panel, message);
        });
        break;
      // case MessageTypeNames.Text:
      //   if (!activeEditor) {
      //     console.log("ERROR: activeEditor is not set");
      //     break;
      //   }
      //   activeEditor.replace(message.code, "Text");
      //   break;
    }
    console.log(`${Date.now()} Finish handleMessage: ${message.type}`);
  }

  handling = false;
}
