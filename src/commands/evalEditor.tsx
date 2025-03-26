import * as vscode from "vscode";
import Messages, { sendToFrontend } from "../utils/messages";
import { activeEditor, postMessageToPanel } from "./showPanel";

export async function evalEditor(context: vscode.ExtensionContext) {
  if (!activeEditor) {
    vscode.window.showErrorMessage(
      "Cannot evaluate code when there is no active editor!",
    );
    return;
  }
  const message = Messages.EvalEditor(activeEditor.workspaceLocation);
  postMessageToPanel(message);
}
