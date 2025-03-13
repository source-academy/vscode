import * as vscode from "vscode";

let languageStatusBarItem: vscode.StatusBarItem;

export function setupStatusBar(context: vscode.ExtensionContext) {
  languageStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  languageStatusBarItem.command = "source-academy.pick";
  languageStatusBarItem.tooltip = "Change Source chapter";
  updateStatusBar(context);
  languageStatusBarItem.show();
  return languageStatusBarItem;
}

export async function updateStatusBar(context: vscode.ExtensionContext) {
  const language = await context.workspaceState.get("language");
  if (!language) {
    return;
  }
  languageStatusBarItem.text = `$(code) ${language}`;
}
