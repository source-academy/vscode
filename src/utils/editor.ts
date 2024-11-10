import * as vscode from "vscode";
import * as os from "os";

import config from "../utils/config";

export class Editor {
  editor?: vscode.TextEditor;
  assessmentName: string;
  questionId: number;
  onChangeCallback?: (editor: Editor) => void;
  replaceTime: number = 0;
  nBursty: number = 0;
  code: string | null = null;

  constructor(assessmentName: string, questionId: number) {
    this.assessmentName = assessmentName;
    this.questionId = questionId;
  }

  /**
   * For debugging purposes
   */
  log(text: string) {
    console.log(`${this.editor?.document.fileName.split("/").at(-1)} ${text}`);
  }

  getText() {
    return this.editor?.document.getText();
  }

  static async create(assessmentName: string, questionId: number) {
    const self = new Editor(assessmentName, questionId);
    self.assessmentName = assessmentName;
    self.questionId = questionId;

    let basePath = config.basePath;
    if (!basePath) {
      basePath = `${os.homedir()}/.sourceacademy`;
    }
    const path = `${basePath}/${assessmentName}_${questionId}.js`;
    await vscode.workspace.fs.readFile(vscode.Uri.file(path)).then(
      () => null,
      async () => {
        self.log(`Opening file failed, creating at ${path}`);
        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(path),
          new TextEncoder().encode(""),
        );
      },
    );

    const editor = await vscode.window.showTextDocument(vscode.Uri.file(path), {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside,
    });

    self.editor = editor;
    vscode.workspace.onDidChangeTextDocument(() => {
      if (!self.onChangeCallback) {
        return;
      }
      const text = editor.document.getText();
      if (self.code === text) {
        self.log(`EXTENSION: Editor's code did not change, ignoring`);
        return;
      }
      if (Date.now() - self.replaceTime < 1000) {
        self.log(
          `EXTENSION: Ignoring change event, ${Date.now() - self.replaceTime}ms since last replace`,
        );
        return;
      }
      self.log(`EXTENSION: Editor's code changed! ${text}`);
      self.onChangeCallback(self);
      self.code = text;
    });
    return self;
  }

  async replace(code: string, tag: string = "") {
    if (!this.editor) {
      return;
    }
    this.log(`EXTENSION: Editor's replace called by ${tag}: <<${code}>>`);
    if (this.nBursty > 5) {
      if (Date.now() - this.replaceTime < 5000) {
        this.log(`EXTENSION: TOO BURSTY`);
        return;
      }
      this.nBursty = 0;
    }
    if (Date.now() - this.replaceTime < 1000) {
      this.nBursty++;
    }
    // this.disableCallback = true;
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
    let retry = 0;
    while (editor.document.getText() !== code) {
      await new Promise((r) => setTimeout(r, 100));
      this.log(
        `EXTENSION: Editor's not replace yet, lets wait: ${editor.document.getText()}`,
      );
      retry++;
      if (retry > 11) {
        this.log(`EXTENSION: Editor's replace wait limit reached`);
        break;
      }
    }
    this.code = code;
    this.replaceTime = Date.now();
  }

  onChange(
    callback: Exclude<typeof Editor.prototype.onChangeCallback, undefined>,
  ) {
    this.onChangeCallback = callback;
  }
}
