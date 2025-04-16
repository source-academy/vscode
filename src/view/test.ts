import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { VscAssessmentOverview } from "../utils/messages";

export let treeDataProvider: NodeDependenciesProvider;

export function setupTreeView(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  console.log("Creating tree view");
  treeDataProvider = new NodeDependenciesProvider(
    context,
    "/home/heyzec/Documents/NUS/FYP/sa-vscode",
  );
  vscode.window.createTreeView("nodeDependencies", {
    treeDataProvider: treeDataProvider,
  });
}

const hardcode = [
  ["Rune Trials", "Apr 01, 2025, 9:00 PM"],
  ["Rune Reading", "Apr 02, 2025, 9:00 PM"],
  ["Beyond the Second Dimension", "Apr 03, 2025, 9:00 PM"],
  ["Curve Introduction", "Apr 04, 2025, 9:00 PM"],
  ["Curve Manipulation", "Apr 05, 2025, 9:00 PM"],
  ["Beyond the First Dimension", "Apr 06, 2025, 9:00 PM"],
  ["Premorseal Communications", "Apr 07, 2025, 9:00 PM"],
  ["POTS and Pans", "Apr 08, 2025, 9:00 PM"],
  ["Musical Diversions", "Apr 09, 2025, 11:00 PM"],
  ["Search and Rescue", "Apr 10, 2025, 11:00 PM"],
  ["Sorting Things Out", "Apr 11, 2025, 11:00 PM"],
  ["Robotic Trials", "Apr 12, 2025, 11:00 PM"],
  ["Moving about on Planet Y", "Apr 13, 2025, 7:00 PM"],
  ["Finding ELDRIC", "Apr 14, 2025, 7:00 PM"],
  ["Know Your Environment", "Apr 15, 2025, 7:00 PM"],
  ["Corrective Sky Surgery", "Apr 16, 2025, 7:00 PM"],
  ["Reuse Your Pairs", "Apr 17, 2025, 7:00 PM"],
  ["Streaming the Anomaly", "Apr 18, 2025, 7:00 PM"],
  ["The Anomaly in Focus", "Apr 19, 2025, 7:00 PM"],
  ["The Essence of the Source", "Apr 20, 2025, 7:00 PM"],
];
export class NodeDependenciesProvider
  implements vscode.TreeDataProvider<BaseTreeItem>
{
  constructor(
    private context: vscode.ExtensionContext,
    private workspaceRoot: string,
  ) {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    BaseTreeItem | undefined | null | void
  > = new vscode.EventEmitter<BaseTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    BaseTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  // impl
  getTreeItem(element: BaseTreeItem): vscode.TreeItem {
    return element;
  }

  // impl
  getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
    if (!element) {
      return Promise.resolve([
        new AssessmentFolder("Missions"),
        new AssessmentFolder("Quests"),
        new AssessmentFolder("Path"),
      ]);
    }

    if (element && element.type === "AssessmentFolder") {
      // element: typeof AssessmentFolder = element as AssessmentFolder;
      const elem = element as AssessmentFolder;

      // @ts-ignore
      const assessmentOverviews: VscAssessmentOverview[] =
        this.context.globalState.get("assessmentOverviews");

      console.log("=============OA");
      console.log(assessmentOverviews);
      return Promise.resolve(
        assessmentOverviews
          .filter((oa) => oa.type == elem.assessmentType)
          .map((oa) => {
            const label = oa.title;
            const version = oa.closeAt;
            const collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            return new AssessmentOverview(oa);
          }),
      );
    }
    return Promise.resolve([]);
    // return Promise.resolve(
    //   hardcode.map(
    //     (entry) =>
    //       new Dependency(
    //         entry[0],
    //         entry[1],
    //         vscode.TreeItemCollapsibleState.None,
    //       ),
    //   ),
    // );

    // console.log("Attempt to child")
    // if (!this.workspaceRoot) {
    //   vscode.window.showInformationMessage("No dependency in empty workspace");
    //   return Promise.resolve([]);
    // }

    // if (element) {
    //   return Promise.resolve(
    //     this.getDepsInPackageJson(
    //       path.join(
    //         this.workspaceRoot,
    //         "node_modules",
    //         element.label,
    //         "package.json",
    //       ),
    //     ),
    //   );
    // } else {
    //   const packageJsonPath = path.join(this.workspaceRoot, "package.json");
    //   if (this.pathExists(packageJsonPath)) {
    //     return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
    //   } else {
    //     vscode.window.showInformationMessage("Workspace has no package.json");
    //     return Promise.resolve([]);
    //   }
    // }
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const toDep = (moduleName: string, version: string): Dependency => {
        if (
          this.pathExists(
            path.join(this.workspaceRoot, "node_modules", moduleName),
          )
        ) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.Collapsed,
          );
        } else {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.None,
          );
        }
      };

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map((dep) =>
            toDep(dep, packageJson.dependencies[dep]),
          )
        : [];
      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map((dep) =>
            toDep(dep, packageJson.devDependencies[dep]),
          )
        : [];
      return deps.concat(devDeps);
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
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
    light: path.join(__filename, "..", "..", "assets", "icon.png"),
    dark: path.join(__filename, "..", "..", "assets", "icon.png"),
  };
}

class AssessmentFolder extends BaseTreeItem {
  constructor(public readonly assessmentType: string) {
    super(assessmentType, vscode.TreeItemCollapsibleState.Collapsed);
    this.type = "AssessmentFolder";
    // this.tooltip = `${this.label}-${this.version}`;
    // this.description = this.version;
  }
}

class AssessmentOverview extends BaseTreeItem {
  constructor(assessmentOverview: VscAssessmentOverview) {
    super(assessmentOverview.title, vscode.TreeItemCollapsibleState.None);
    this.type = "AssessmentOverview";
    this.description = assessmentOverview.closeAt;
    // this.tooltip = `${this.label}-${this.version}`;
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }
}
