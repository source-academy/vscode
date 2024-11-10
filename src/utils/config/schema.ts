import { ConfigSchemaUnion } from "./types";

export default {
  frontendUrl: { type: "string", default: "http://localhost:8000/playground" },
  basePath: { type: "string", default: "~/.source-academy" },
} satisfies Record<string, ConfigSchemaUnion>;
