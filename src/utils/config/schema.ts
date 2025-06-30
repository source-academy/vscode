import { ConfigSchemaUnion } from "./types";

export default {
  frontendBaseUrl: {
    type: "string",
    default: "https://sourceacademy.nus.edu.sg",
  },
  workspaceFolder: {
    type: "string",
    default: ".sourceacademy",
  },
} satisfies Record<string, ConfigSchemaUnion>;
