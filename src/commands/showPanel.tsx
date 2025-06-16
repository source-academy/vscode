import * as vscode from "vscode";
// Allow using JSX within this file by overriding our own createElement function
import React from "../utils/FakeReact";

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

let mcqPanel: vscode.WebviewPanel | null = null;

let panel: vscode.WebviewPanel | null = null;
// This needs to be a reference to active
// TODO: Fix this ugly code!
export let activeEditor: Editor | null = null;

const messageQueue: MessageType[] = [];
let handling = false;

// TODO: Remove panel and handling message logic out of the commands/ directory

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
        sendToFrontend(panel, Messages.ExtensionPong(null));
        break;
      case MessageTypeNames.MCQQuestion:
        {
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

          // Cast message to ensure properties exist
          const mcqMsg = message as any;
          mcqPanel.webview.html = getMcqHtml(
            mcqPanel.webview,
            mcqMsg.question,
            mcqMsg.options,
            mcqMsg.questionId,
          );
          mcqPanel.reveal(vscode.ViewColumn.One);
        }
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
          const nPrependLines = message.prepend
            ? message.prepend.split("\n").length
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

  // equivalent to panel.webview.html = ...
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

// TODO: Move this to a util file
function getMcqHtml(
  _webview: vscode.Webview,
  question: string,
  options: string[],
  questionId: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-eval' 'unsafe-inline' https://unpkg.com; style-src 'unsafe-inline' https://unpkg.com;" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/marked@4.0.0/marked.min.js"></script>
  <script>window.marked.setOptions({ breaks: true });</script>
  <style>
    .mcq-option {
      color: black !important;
    }
    .mcq-option p {
      margin: 0;
      display: inline;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { useState } = React;
    
    function McqPanel({ question, options, questionId }) {
      const [selected, setSelected] = useState(null);
      
      const handleSubmit = (e) => {
        e.preventDefault();
        if (selected === null) return;
        const vscode = acquireVsCodeApi();
        vscode.postMessage({ type: 'answer', answer: selected });
      };

      return (
        <div style={{ 
          padding: '1rem',
          fontFamily: 'sans-serif',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h3>Question {parseInt(questionId) + 1}</h3>
      <div dangerouslySetInnerHTML={{ __html: window.marked.parse(question) }} />
          <form onSubmit={handleSubmit}>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: '1rem 0 1.5rem 0'
            }}>
              {options.map((option, index) => (
                <li 
                  key={index} 
                  style={{ 
                    margin: '0.5rem 0',
                    padding: '0.75rem',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    backgroundColor: selected === index ? '#f6f8fa' : 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => setSelected(index)}
                >
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    margin: 0
                  }}>
                    <input
                      type="radio"
                      name="mcq-option"
                      checked={selected === index}
                      onChange={() => setSelected(index)}
                      style={{ 
                        marginRight: '0.75rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer'
                      }}
                    />
                    <span 
                      className="mcq-option"
                      dangerouslySetInnerHTML={{ __html: window.marked.parse(option) }}
                    />
                  </label>
                </li>
              ))}
            </ul>
            <button 
              type="submit"
              disabled={selected === null}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: selected !== null ? '#2ea043' : '#94d3a2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selected !== null ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                opacity: selected !== null ? 1 : 0.7
              }}
            >
              Submit Answer
            </button>
          </form>
        </div>
      );
    }

// Render the component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <McqPanel 
    question="${question.replace(/"/g, "&quot;")}" 
    questionId="${questionId}"
    options={${JSON.stringify(options)}}
  />
);
</script>
</body>
</html>`;
}

export async function sendToFrontendWrapped(message: MessageType) {
  if (!panel) {
    console.error("ERROR: panel is not set");
    return;
  }
  sendToFrontend(panel, message);
}
