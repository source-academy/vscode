import React, { useState } from "react";
import Messages from "../../utils/messages";
import { sendToFrontendWrapped } from "../../commands/showPanel";

export interface McqData {
  assessmentName: string;
  questionId: number;
  question: string;
  choices: string[];
  workspaceLocation?: "assessment" | "playground";
}

interface McqPanelProps {
  data: McqData;
  onAnswer: (choiceIndex: number) => void;
}

const McqPanel: React.FC<McqPanelProps> = ({ data, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ padding: "1rem" }}>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {data.choices.map((c, idx) => (
          <li key={idx} style={{ marginBottom: "0.5rem" }}>
            <label style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="mcq-choice"
                value={idx}
                data-choice={idx}
                data-ws={data.workspaceLocation ?? "assessment"}
                data-assessment={data.assessmentName}
                data-qid={data.questionId}
                checked={selected === idx}
                onChange={() => {
                  setSelected(idx);
                  onAnswer(idx);
                }}
                style={{ marginRight: "0.5rem" }}
              />
              {c}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default McqPanel;

export const McqPanelWithLogging: React.FC<{ data: McqData }> = ({ data }) => (
  <McqPanel
    data={data}
    onAnswer={(choiceIndex) => {
      const wsLoc = data.workspaceLocation ?? "assessment";
      console.log(
        `MCQ Answer: ${data.assessmentName}, Question ID: ${data.questionId}, Choice Index: ${choiceIndex}`,
      );
      sendToFrontendWrapped(
        Messages.MCQAnswer(
          wsLoc,
          data.assessmentName,
          data.questionId,
          choiceIndex,
        ),
      );
    }}
  />
);
