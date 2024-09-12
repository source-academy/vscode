// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("sa-vscode.react", () => {
    const panel = vscode.window.createWebviewPanel(
      "react",
      "My Title Here",
      vscode.ViewColumn.One,
      { enableScripts: true },
    );
    panel.webview.html = getWebviewContent(context, panel);
  });

  context.subscriptions.push(disposable);
}

function getNonce(): string {
  let text: string = "";
  const possible: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getWebviewContent(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
) {
  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();

  const webview = panel.webview;

  const scriptUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "out", "webview.js"),
  );

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
      <title>Cat Coding</title>
    </head>
    <body>
      <div id="root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
  </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
