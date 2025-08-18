import { ConfigSchemaUnion } from "./types";

export default {
  frontendBaseUrl: {
    type: "string",
    default: "https://sourceacademy.nus.edu.sg",
  },
  // TODO: Remove this config in the future. See the login URI handler for details.
  backendBaseUrl: {
    type: "string",
    default: "https://api.sourceacademy.nus.edu.sg",
  },
  workspaceFolder: {
    type: "string",
    default: ".sourceacademy",
  },
} satisfies Record<string, ConfigSchemaUnion>;
