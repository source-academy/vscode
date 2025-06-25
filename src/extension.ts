// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { setupTreeView } from "./treeview";
import { setupStatusBar } from "./statusbar/status";
import { registerAllCommands } from "./commands";
import { activateLspClient, deactivateLspClient } from "./lsp/client";
import { LanguageClient } from "vscode-languageclient/node";
import { canonicaliseLocation } from "./utils/misc";
import config from "./utils/config";

// TODO: Don't expose this object directly, create an interface via a wrapper class
export let client: LanguageClient;

export let SOURCE_ACADEMY_ICON_URI: vscode.Uri;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setupTreeView(context);
  registerAllCommands(context);

  context.subscriptions.push(setupStatusBar(context));

  client = activateLspClient(context);

  // const info = {
  //   "file:///home/heyzec/.sourceacademy/playground_1.js": { chapter: 4 },
  // };
  const info = context.globalState.get("info") ?? {};

  client.sendRequest("source/publishInfo", info);

  SOURCE_ACADEMY_ICON_URI = vscode.Uri.joinPath(
    context.extensionUri,
    "assets",
    "icon.svg",
  );

  // TODO: Prompt the user to make this folder the default, and then set back to the config store.

  // Update user's workspace settings to associate .js to Source
  const workspaceFolder = canonicaliseLocation(config.workspaceFolder);
  if (
    vscode.workspace.workspaceFolders
      ?.map((wf) => wf.uri.fsPath)
      .includes(workspaceFolder)
  ) {
    const workspaceConfig = vscode.workspace.getConfiguration();
    workspaceConfig.update("files.associations", {
      "*.js": "source",
    });
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  deactivateLspClient();
}
