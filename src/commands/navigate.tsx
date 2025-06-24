import * as vscode from "vscode";
import { sendToFrontendWrapped } from "./showPanel";
import Messages from "../utils/messages";

export async function navigate(
  context: vscode.ExtensionContext,
  route: string,
) {
  const didNavigate = await sendToFrontendWrapped(Messages.Navigate(route));
  if (!didNavigate) {
    vscode.commands.executeCommand("source-academy.show-panel", route);
  }
}
