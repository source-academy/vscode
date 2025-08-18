import * as vscode from "vscode";
import { VscAssessmentOverview } from "../utils/messages";
import { SOURCE_ACADEMY_ICON_URI } from "../extension";

export let treeDataProvider: AssessmentsSidebarProvider;

// This will be a source of bug on first extension loads!!
let courseId: number;

export function setupTreeView(context: vscode.ExtensionContext) {
  courseId = context.globalState.get("courseId") as number;

  treeDataProvider = new AssessmentsSidebarProvider(context);
  vscode.window.createTreeView("assessments", {
    treeDataProvider: treeDataProvider,
  });
}

export class AssessmentsSidebarProvider
  implements vscode.TreeDataProvider<BaseTreeItem>
{
  constructor(private context: vscode.ExtensionContext) {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    BaseTreeItem | undefined | null | void
  > = new vscode.EventEmitter<BaseTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    BaseTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  getTreeItem(element: BaseTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
    // Synthetic root item that launches the Source Academy panel.
    const launchItem = new PlaygroundItem();

    // @ts-ignore
    const assessmentOverviews: VscAssessmentOverview[] =
      this.context.globalState.get("assessmentOverviews");
    if (!assessmentOverviews) {
      return Promise.resolve([]);
    }

    if (!element) {
      const assessmentTypes = [
        ...new Set(assessmentOverviews.map((ao) => ao.type)),
      ];
      const folders = assessmentTypes.map((at) => new AssessmentFolder(at));

      return Promise.resolve([launchItem, ...folders]);
    }

    if (element && element.type === "AssessmentFolder") {
      const elem = element as AssessmentFolder;

      if (!assessmentOverviews) {
        return Promise.resolve([]);
      }

      return Promise.resolve(
        assessmentOverviews
          .filter((ao) => ao.type == elem.assessmentType)
          .map((ao) => {
            return new AssessmentOverview(ao);
          }),
      );
    }
    return Promise.resolve([]);
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

class BaseTreeItem extends vscode.TreeItem {
  type?: string;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }

  iconPath = {
    light: SOURCE_ACADEMY_ICON_URI,
    dark: SOURCE_ACADEMY_ICON_URI,
  };
}

/**
 * Synthetic tree item that always appears at the top-level of the view.
 */
class PlaygroundItem extends BaseTreeItem {
  constructor() {
    super("Playground", vscode.TreeItemCollapsibleState.None);
    this.type = "LaunchItem";
    this.command = {
      title: "Playground",
      command: "source-academy.navigate",
      arguments: ["/playground"],
    };
  }
}

class AssessmentFolder extends BaseTreeItem {
  constructor(public readonly assessmentType: string) {
    super(assessmentType, vscode.TreeItemCollapsibleState.Collapsed);
    this.type = "AssessmentFolder";
  }
}

class AssessmentOverview extends BaseTreeItem {
  constructor(assessmentOverview: VscAssessmentOverview) {
    super(assessmentOverview.title, vscode.TreeItemCollapsibleState.None);

    this.type = "AssessmentOverview";
    this.description = assessmentOverview.closeAt;
    // this.tooltip = "if needed in the future"

    this.command = {
      title: "Navigate",
      command: "source-academy.navigate",
      arguments: [
        `/courses/${courseId}/${assessmentOverview.type.toLowerCase()}/${assessmentOverview.id}/0`,
      ],
    };
  }
}
