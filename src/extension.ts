// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { setupTreeView } from "./treeview";
import { setupStatusBar } from "./statusbar/status";
import { registerAllCommands } from "./commands";
import { activateLspClient, deactivateLspClient } from "./lsp/client";
import { LanguageClient } from "vscode-languageclient/node";
import { getValue, mirror } from "./utils/store/test";

// TODO: Don't expose this object directly, create an interface via a wrapper class
export let client: LanguageClient;

export let SOURCE_ACADEMY_ICON_URI: vscode.Uri;

export let context_: vscode.ExtensionContext;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Activain");
  context_ = context;
  setupTreeView(context);
  registerAllCommands(context);

  context.subscriptions.push(setupStatusBar(context));

  client = activateLspClient(context);

  // const info = {
  //   "file:///home/heyzec/.sourceacademy/playground_1.js": { chapter: 4 },
  // };
  // const info = context.globalState.get("info") ?? {};
  const info = getValue(mirror.info) ?? {};

  client.sendRequest("source/publishInfo", info);

  SOURCE_ACADEMY_ICON_URI = vscode.Uri.joinPath(
    context.extensionUri,
    "assets",
    "icon.svg",
  );
  vscode.window.showInformationMessage(`mirror is ${JSON.stringify(mirror)}`);
}

// This method is called when your extension is deactivated
export function deactivate() {
  deactivateLspClient();
}
