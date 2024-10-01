import { Chapter } from "js-slang/dist/types";

export enum MessageType {
  StartStepperMessage = "StartStepperMessage",
}

interface BaseMessage {
  type: MessageType;
}

export interface RunStepperMessage extends BaseMessage {
  chapter: Chapter;
  code: string;
}

export type Message = RunStepperMessage;
