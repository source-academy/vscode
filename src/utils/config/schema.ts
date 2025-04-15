import { ConfigSchemaUnion } from "./types";

export default {
  frontendBaseUrl: {
    type: "string",
    default: "https://frontend.cloud.heyzec.dedyn.io",
  },
  workspaceFolder: { type: "string", default: "" },
} satisfies Record<string, ConfigSchemaUnion>;
