import { ConfigSchemaUnion } from "./types";

export default {
  frontendUrl: { type: "string", default: "http://localhost:8000/playground" },
  basePath: { type: "string", default: "" },
} satisfies Record<string, ConfigSchemaUnion>;
