// TODO: Move this file to src/features/editor/editor.ts
import * as vscode from "vscode";

import config from "../utils/config";
import Messages, { VscWorkspaceLocation } from "./messages";
import path from "path";
import { sendToFrontendWrapped } from "../commands/showPanel";
import { canonicaliseLocation } from "./misc";
import { codeAddPrepend, codeRemovePrepend } from "./editorUtils";

export class Editor {
  editor?: vscode.TextEditor;
  onChangeCallback?: (editor: Editor) => void;

  // Data associated with TextEditor
  uri: string | null = null;

  // Metadata relating to this question
  workspaceLocation: VscWorkspaceLocation;
  assessmentName: string;
  questionId: number;

  constructor(
    workspaceLocation: VscWorkspaceLocation,
    assessmentName: string,
    questionId: number,
  ) {
    this.workspaceLocation = workspaceLocation;
    this.assessmentName = assessmentName;
    this.questionId = questionId;
  }

  /** For debugging purposes */
  log(text: string) {
    console.log(`${this.editor?.document.fileName.split("/").at(-1)} ${text}`);
  }

  getText() {
    return this.editor?.document.getText();
  }

  // TODO: This method is too loaded, it's not obvious it also shows the editor
  static async create(
    workspaceLocation: VscWorkspaceLocation,
    assessmentName: string,
    questionId: number,
    prepend: string = "",
    initialCode: string = "",
  ): Promise<Editor> {
    const self = new Editor(workspaceLocation, assessmentName, questionId);

    const workspaceFolder = canonicaliseLocation(config.workspaceFolder);
    const filePath = path.join(
      workspaceFolder,
      `${assessmentName}_${questionId}.js`,
    );
    const uri = vscode.Uri.file(filePath);

    self.uri = uri.toString();
    const contents = codeAddPrepend(initialCode, prepend);

    await vscode.workspace.fs
      .readFile(vscode.Uri.file(filePath))
      .then((value) => value.toString())
      .then(
        (localCode) => {
          if (localCode !== contents) {
            self.log(
              "EXTENSION: Conflict detected between local and remote, prompting user to choose one",
            );
            vscode.window
              .showInformationMessage(
                [
                  "The local file differs from the version on the Source Academy servers.",
                  "Discard the local file and use the one on the server?",
                ].join(" "),
                { modal: true },
                "Yes",
              )
              .then(async (answer) => {
                // By default the code displayed is the local one
                if (answer === "Yes") {
                  self.log("EXTENSION: Saving program from server to file");
                  await vscode.workspace.fs.writeFile(
                    uri,
                    new TextEncoder().encode(contents),
                  );
                } else if (answer === undefined) {
                  // Modal cancelled
                  const message = Messages.Text(
                    self.workspaceLocation,
                    codeRemovePrepend(localCode),
                  );
                  sendToFrontendWrapped(message);
                }
              });
          }
        },
        async () => {
          self.log(`Opening file failed, creating at ${filePath}`);
          await vscode.workspace.fs.writeFile(
            uri,
            new TextEncoder().encode(contents),
          );
        },
      );

    const editor = await vscode.window.showTextDocument(uri, {
      preview: false,
      viewColumn: vscode.ViewColumn.One,
    });
    self.editor = editor;

    // Programmatically set the language
    vscode.languages.setTextDocumentLanguage(editor.document, "source");

    // Collapse the prepend section
    editor.selection = new vscode.Selection(
      editor.document.positionAt(0),
      editor.document.positionAt(1),
    );
    vscode.commands.executeCommand("editor.fold");

    // Register callback when contents changed
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => {
        if (!self.onChangeCallback) {
          return;
        }
        if (e.contentChanges.length === 0) {
          self.log(`EXTENSION: Editor's code did not change, ignoring`);
          return;
        }
        self.onChangeCallback(self);
      },
    );
    return self;
  }

  async replace(code: string, tag: string = "") {
    if (!this.editor) {
      return;
    }
    const editor = this.editor;
    // Don't replace if the code is the same
    editor.edit((editBuilder) => {
      editBuilder.replace(
        new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(editor.document.getText().length),
        ),
        code,
      );
    });
  }

  onChange(
    callback: Exclude<typeof Editor.prototype.onChangeCallback, undefined>,
  ) {
    this.onChangeCallback = callback;
  }
}
