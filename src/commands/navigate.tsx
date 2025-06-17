import * as vscode from "vscode";
import { sendToFrontendWrapped } from "./showPanel";
import Messages from "../utils/messages";

export async function navigate(
  context: vscode.ExtensionContext,
  route: string,
) {
  sendToFrontendWrapped(Messages.Navigate(route));
}
