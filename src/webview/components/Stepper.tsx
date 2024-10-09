import { Button, ButtonGroup } from "@blueprintjs/core";
import { Variant, Chapter } from "js-slang/dist/types";
import { createContext, runInContext, type IOptions } from "js-slang";
import React, { useEffect, useState } from "react";
import { requireProvider } from "../utils/requireProvider";
import {
  Message,
  MessageType,
  RunStepperMessage,
  TextMessage,
} from "../../utils/messages";

const FRONTEND_ELEMENT_ID = "frontend";

function handleStartMessage(message: RunStepperMessage) {}

function handleTextUpdatedMessage(message: TextMessage) {
  const iframe: HTMLIFrameElement = document.getElementById(
    FRONTEND_ELEMENT_ID,
  ) as HTMLIFrameElement;
  const contentWindow = iframe.contentWindow;
  if (!contentWindow) {
    return;
  }
  // TODO: Don't use '*'
  contentWindow.postMessage(message.code, "*");
}

function messageListener(event: MessageEvent) {
  const message: Message = event.data;
  switch (message.type) {
    case MessageType.StartStepperMessage:
      handleStartMessage(message as RunStepperMessage);
      break;
    case MessageType.TextMessage:
      handleTextUpdatedMessage(message as TextMessage);
      break;
  }
}

function Stepper() {
  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return (
    <>
      <div
        style={{
          width: "100%",
          // Account for some unexplainable margin
          height: "calc(100vh - 10px)",
        }}
      >
        <iframe
          id={FRONTEND_ELEMENT_ID}
          src="http://localhost:8000/playground"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </>
  );
}
export default Stepper;
