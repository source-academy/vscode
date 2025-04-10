// This file is originally created in https://github.com/source-academy/sa-vscode/blob/main/src/utils/messages.ts
// It also needs to be copied to source-academy/frontend:src/features/vscode/messages.ts
// Ideally it is split into multiple files, but for ease of copying, it is kept as one file.

/** A subset of the WorkspaceLocation type found in source-academy/frontend */
const VscWorkspaceLocationArray = ["assessment", "playground", "sicp"];
export const isVscWorkspaceLocation = (s: any) =>
  VscWorkspaceLocationArray.includes(s);
export type VscWorkspaceLocation = "assessment" | "playground" | "sicp";

// ================================================================================
// Message type definitions
// ================================================================================
// Note to devs: Ctrl+clicking each type will not work. Use a search instead.
const Messages = createMessages({
  /** Sent from the iframe to the extension */
  ExtensionPing: (frontendOrigin: string) => ({ frontendOrigin }),
  /** Sent from the extension to the iframe */
  ExtensionPong: (token: string | null) => ({ token }),
  IsVsc: () => ({}),
  NewEditor: (
    workspaceLocation: VscWorkspaceLocation,
    assessmentName: string,
    questionId: number,
    chapter: number,
    prepend: string,
    code: string,
  ) => ({
    workspaceLocation,
    assessmentName,
    questionId,
    code,
  }),
  Text: (workspaceLocation: VscWorkspaceLocation, code: string) => ({
    workspaceLocation,
    code,
  }),
  EvalEditor: (workspaceLocation: VscWorkspaceLocation) => ({
    workspaceLocation,
  }),
});

export default Messages;

// ================================================================================
// Code for type generation
// ================================================================================

// Define BaseMessage to be the base type for all messages, such that all messages have a type field
type BaseMessage<T extends string, P extends object> = {
  type: T;
} & P;

// A helper function to create messages dynamically from schema (hoisted!)
function createMessages<T extends Record<string, (...args: any[]) => object>>(
  creators: T,
): {
  [K in Extract<keyof T, string>]: (
    ...args: Parameters<T[K]>
  ) => BaseMessage<K, ReturnType<T[K]>>;
} {
  return Object.fromEntries(
    Object.entries(creators).map(([key, creator]) => [
      key,
      (...args: any[]) => ({
        type: key,
        ...creator(...args),
      }),
    ]),
  ) as any;
}

// Define MessageTypes as a map of each key in Messages to its specific message type
type MessageTypes = {
  [K in keyof typeof Messages]: ReturnType<(typeof Messages)[K]>;
};

// Define MessageType as a union of all message types
export type MessageType = MessageTypes[keyof MessageTypes];

// Also define MessageTypeNames as an "enum" to avoid hardcoding strings
export const MessageTypeNames = (() =>
  ({
    ...Object.keys(Messages)
      .filter((k) => isNaN(Number(k)))
      .reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: cur,
        }),
        {},
      ),
  }) as {
    [k in keyof typeof Messages]: k;
  })();

// ================================================================================
// Wrapper functions
// ================================================================================

// TODO: Rename this as sendToExtension
/**
 * API to send a Message to the VSC extension.
 * To only be used within source-academy/frontend.
 */
export function sendToWebview(message: MessageType) {
  // In reality, the message is passed to the Webview context (middleman) first.
  window.parent.postMessage(message, "*");
}

/** Stub type of vscode.WebviewPanel */
// Would be great to figure out how this can be typed to vscode.WebviewPanel in source-academy/vscode;
// but to never in source-academy/frontend
type VscodeWebviewPanel = any;

/**
 * API to send a Message to the Frontend iframe.
 * To only be used within source-academy/vscode.
 */
export function sendToFrontend(
  panel: VscodeWebviewPanel,
  message: MessageType,
) {
  if (!panel) {
    console.error("VSC panel does not exist! Not sending message.");
    return;
  }
  // In reality, the message is passed to the Webview context (middleman) first.
  panel.webview.postMessage(message);
}
