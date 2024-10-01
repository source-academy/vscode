import * as vscode from "vscode";
import { updateStatusBar } from "../statusbar/status";
import { LANGUAGES } from "../utils/languages";

export async function runLanguagePicker(context: vscode.ExtensionContext) {
  const options = Object.values(LANGUAGES);

  const result = await vscode.window.showQuickPick(options, {
    placeHolder: "Select a language",
  });

  if (!result) {
    return;
  }

  await context.workspaceState.update("language", result);

  // TODO: Make status bar subscribe to state change rather than calling
  updateStatusBar(context);
}
