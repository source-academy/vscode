import * as vscode from "vscode";
import envConfig from "./schema";
import { EnvVarProxyType, EnvVarType } from "./types";

// Create a proxy that intercepts access to configuration properties
export default new Proxy<EnvVarProxyType>(
  {} as any,
  {
    get<K extends keyof typeof envConfig>(
      _: typeof envConfig,
      name: K,
    ): EnvVarType<K> {
      const saConfigs = vscode.workspace.getConfiguration("sa-vscode");
      const value = saConfigs.get<EnvVarType<K>>(name);

      if (value === undefined) {
        const x = envConfig[name];
        return x.default as EnvVarType<K>;
      }

      return value;
    },
  } as any,
);
