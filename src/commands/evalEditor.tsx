import * as vscode from "vscode";
import Messages from "../utils/messages";
import { activeEditor, sendToFrontendWrapped } from "./showPanel";

export async function evalEditor(context: vscode.ExtensionContext) {
  if (!activeEditor) {
    vscode.window.showErrorMessage(
      "Cannot evaluate code when there is no active editor!",
    );
    return;
  }
  const message = Messages.EvalEditor(activeEditor.workspaceLocation);
  sendToFrontendWrapped(message);
}
