import { Button, ButtonGroup } from "@blueprintjs/core";
import { Variant, Chapter } from "js-slang/dist/types";
import { createContext, runInContext, type IOptions } from "js-slang";
import React, { useEffect, useState } from "react";
import { requireProvider } from "../utils/requireProvider";
import { Message, MessageType } from "../../utils/messages";

const audioCtx = new window.AudioContext();

// Function to play a beep sound
function playBeep() {
  // Create an oscillator node
  const oscillator = audioCtx.createOscillator();

  // Set the oscillator frequency (in Hz) for the beep sound
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440 Hz = A4 note

  // Set the type of waveform: sine, square, sawtooth, triangle
  oscillator.type = "sine";

  // Connect the oscillator to the audio context destination (speakers)
  oscillator.connect(audioCtx.destination);

  // Start the oscillator
  oscillator.start();

  // Stop the oscillator after 1 second (1000 milliseconds)
  oscillator.stop(audioCtx.currentTime + 1);
}
playBeep();

function Stepper() {
  const [steps, setSteps] = useState<any[]>([]);
  const [stepNo, setStepNo] = useState(0);
  const [tab, setTab] = useState(null);

  const messageListener = async (event: MessageEvent) => {
    const message: Message = event.data;
    if (message.type !== MessageType.StartStepperMessage) {
      return;
    }

    const chapter = message.chapter;
    const runnerContext = createContext(chapter, Variant.NON_DET);
    const options: Partial<IOptions> = {
      executionMethod: "interpreter",
      useSubst: true,
    };

    const output = await runInContext(message.code, runnerContext, options);
    console.log({
      runnerContext,
      output,
    });

    if (output.status !== "finished") {
      return;
    }

    setSteps(output.value);

    const hydrated = Object.values(runnerContext.moduleContexts)
      .flatMap(({ tabs }) => tabs ?? [])
      .map((rawTab) => {
        const { default: content } = rawTab(requireProvider);
        return content;
      });
    setTab(hydrated[0].body({ context: runnerContext }));
  };

  useEffect(() => {
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  const textListener = async (event: MessageEvent) => {
    const message: Message = event.data;
    if (message.type !== MessageType.TextMessage) {
      return;
    }
    console.log("Need to forward");

    const iframe = document.getElementById("my-iframe");
    console.log({ iframe });
    const contentWindow = iframe.contentWindow;
    console.log({ contentWindow });
    contentWindow.postMessage(message.code, "*");
  };
  useEffect(() => {
    window.addEventListener("message", textListener);
    return () => {
      window.removeEventListener("message", textListener);
    };
  }, []);

  const hasRunCode = steps.length > 0;

  const stepNext = () => {
    setStepNo((stepNo) => stepNo + 1);
  };

  const stepPrevious = () => {
    setStepNo((stepNo) => stepNo - 1);
  };

  return (
    <>
      <h1>Source Academy Stepper</h1>
      <iframe
        id="my-iframe"
        src="http://localhost:8000/playground"
        width="100%"
        height="1000px"
        frameborder="0"
        allowfullscreen
      ></iframe>
      <ButtonGroup>
        <Button
          // disabled={!hasRunCode || !hasPreviousFunctionCall}
          disabled={true}
          icon="double-chevron-left"
          // onClick={stepPreviousFunctionCall}
        />
        <Button
          disabled={!hasRunCode || stepNo === 0}
          icon="chevron-left"
          onClick={stepPrevious}
        />
        <Button
          disabled={!hasRunCode || stepNo === steps.length - 1}
          icon="chevron-right"
          onClick={stepNext}
        />
        <Button
          // disabled={!hasRunCode || !hasNextFunctionCall}
          disabled={true}
          icon="double-chevron-right"
          // onClick={stepNextFunctionCall}
        />
      </ButtonGroup>
      {steps.length > 0 ? (
        <>
          <b>Code</b>
          <pre>
            <code>{steps[stepNo].code}</code>
          </pre>
          <b>Redex</b>
          <pre>{steps[stepNo].redex}</pre>
          <b>Explanation</b>
          <pre>{steps[stepNo].explanation}</pre>
        </>
      ) : null}
      {tab}
    </>
  );
}
export default Stepper;
