/**
The code in this folder provides a type-safe way to access extension configs.
- Without this, every access to a config property would look like this:
- vscode.workspace.getConfiguration("source-academy").get("frontendBaseUrl");
- 1. This require explicit casting to string, number, etc
- 2. High chance of mistyping the property name
- 3. Unable to ctrl-click to see where each property is used
*/
//
import * as vscode from "vscode";
import envConfig from "./schema";
import { EnvVarProxyType, EnvVarType } from "./types";

/** Type-safe proxy object to access extension configs */
// Intercepts access to configuration properties
export default new Proxy<EnvVarProxyType>(
  {} as any,
  {
    get<K extends keyof typeof envConfig>(
      _: typeof envConfig,
      name: K,
    ): EnvVarType<K> {
      const saConfigs = vscode.workspace.getConfiguration("source-academy");
      const value = saConfigs.get<EnvVarType<K>>(name);

      if (value === undefined) {
        const x = envConfig[name];
        return x.default as EnvVarType<K>;
      }

      return value;
    },
  } as any,
);
