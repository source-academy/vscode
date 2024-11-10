import envConfig from "./schema";

type TypeMapping = {
  number: number;
  string: string;
  boolean: boolean;
};

// Generic schema type that enforces `default` to match `type`
type ConfigSchema<T extends keyof TypeMapping> = {
  type: T;
  default: TypeMapping[T];
};

export type ConfigSchemaUnion =
  | ConfigSchema<"boolean">
  | ConfigSchema<"string">
  | ConfigSchema<"number">;

// Define a helper function to get configuration values with proper typing
export type EnvVarType<K extends keyof typeof envConfig> =
  (typeof envConfig)[K] extends { type: infer T }
    ? T extends keyof TypeMapping
      ? TypeMapping[T]
      : never
    : never;

export type EnvVarProxyType = {
  [K in keyof typeof envConfig]: EnvVarType<K>;
};
