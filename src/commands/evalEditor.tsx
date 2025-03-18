import * as vscode from "vscode";
import Messages, { sendToFrontend } from "../utils/messages";
import { postMessageToPanel } from "./showPanel";

export async function evalEditor(context: vscode.ExtensionContext) {
  const message = Messages.EvalEditor();
  postMessageToPanel(message);
}
