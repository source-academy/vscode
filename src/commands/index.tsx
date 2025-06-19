import * as vscode from "vscode";
import { runLanguagePicker } from "./language";
import { evalEditor } from "./evalEditor";
import { showPanel } from "./showPanel";
import { navigate } from "./navigate";

const EXTENSION_ID = "source-academy";

/**
 * The commands to be registered to the extension.
 * The keys must match the suffix of the command ID in package.json, under contributes.commands.
 */
const commands = (context: vscode.ExtensionContext) => ({
  pick: () => runLanguagePicker(context),
  "show-panel": (route?: string, altUrl?: string) =>
    showPanel(context, route, altUrl),
  "eval-editor": () => evalEditor(context),
  navigate: (route: string) => navigate(context, route),
});

/**
 * Register commands defined under src/commands to the extension.
 */
export function registerAllCommands(context: vscode.ExtensionContext) {
  Object.entries(commands(context)).forEach(([commandIdSuffix, handler]) => {
    // Register the command
    const disposable = vscode.commands.registerCommand(
      `${EXTENSION_ID}.${commandIdSuffix}`,
      handler,
    );
    // Setup disposal on extension deactivation by adding it to subscriptions
    context.subscriptions.push(disposable);
  });
}
