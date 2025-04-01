import { ConfigSchemaUnion } from "./types";

export default {
  frontendBaseUrl: {
    type: "string",
    default: "http://localhost:8000",
  },
  workspaceFolder: { type: "string", default: "" },
} satisfies Record<string, ConfigSchemaUnion>;
