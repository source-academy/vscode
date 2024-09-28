import { Button, ButtonGroup } from "@blueprintjs/core";
import { Variant, Chapter } from "js-slang/dist/types";
import { createContext, runInContext, type IOptions } from "js-slang";
import React, { useEffect, useState } from "react";

function Stepper() {
  const [steps, setSteps] = useState<any[]>([]);
  const [stepNo, setStepNo] = useState(0);
  const [tab, setTab] = useState(null);

  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent
      // throw "jsesos";

      const chapter = Chapter.SOURCE_1;
      const runnercontext = createContext(chapter, Variant.NON_DET);
      const options: Partial<IOptions> = {
        executionMethod: "interpreter",
        useSubst: true,
      };
      console.log(`the message is ${message}`);
      const output = await runInContext(message, runnercontext, options);
      console.log(output);
      console.log(runnercontext);

      if (output.status !== "finished") {
        return;
      }

      setSteps(output.value);
      setTab(runnercontext.moduleContexts["rune"].tabs[0]);
    };
    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  const hasRunCode = steps.length > 0;

  const stepNext = () => {
    setStepNo((stepNo) => stepNo + 1);
  };

  const stepPrevious = () => {
    setStepNo((stepNo) => stepNo - 1);
  };

  let ModuleTab = null;
  if (tab) {
    console.log("tab is nonempty");
    ModuleTab = tab;
  } else {
    console.log("tab is empty");
  }

  return (
    <>
      <h1>Source Academy Stepper</h1>
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
      {ModuleTab && <ModuleTab />}
    </>
  );
}
export default Stepper;
