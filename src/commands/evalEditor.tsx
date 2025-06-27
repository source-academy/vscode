import * as vscode from "vscode";
import Messages from "../utils/messages";
import { sendToFrontendWrapped } from "./showPanel";
import { MessageHandler } from "../utils/messageHandler";

let messageHandler = MessageHandler.getInstance();

export async function evalEditor(context: vscode.ExtensionContext) {
  if (!messageHandler.activeEditor) {
    vscode.window.showErrorMessage(
      "Cannot evaluate code when there is no active editor!",
    );
    return;
  }
  const message = Messages.EvalEditor(
    messageHandler.activeEditor.workspaceLocation,
  );
  sendToFrontendWrapped(message);
}
