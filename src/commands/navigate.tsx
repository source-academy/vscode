import * as vscode from "vscode";
import { updateStatusBar } from "../statusbar/status";
import { LANGUAGES } from "../utils/languages";
import { sendToFrontendWrapped } from "./showPanel";
import Messages from "../utils/messages";

export async function navigate(context: vscode.ExtensionContext) {
  const route = "/playground";
  sendToFrontendWrapped(Messages.Navigate(route));
}
