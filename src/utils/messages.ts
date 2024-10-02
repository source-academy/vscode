import { Chapter } from "js-slang/dist/types";

export enum MessageType {
  StartStepperMessage = "StartStepperMessage",
  TextMessage = "TextMessage",
}

interface BaseMessage {
  type: MessageType;
}

export interface RunStepperMessage extends BaseMessage {
  chapter: Chapter;
  code: string;
}

export interface TextMessage extends BaseMessage {
  code: string;
}

export type Message = RunStepperMessage | TextMessage;
