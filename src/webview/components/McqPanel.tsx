import React from "react";
import markdownToHtml from "../../utils/markdown";

export interface McqData {
  assessmentName: string;
  questionId: number;
  choices: string[];
  workspaceLocation?: "assessment" | "playground";
}

interface McqPanelProps {
  data: McqData;
}

const panelStyle: React.CSSProperties = {
  padding: "2rem",
  backgroundColor: "#1e293b",
  borderRadius: "0.5rem",
  height: "100vh",
  width: "100vw",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  paddingLeft: 0,
  width: "100%",
  maxWidth: "600px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",
};

const labelBaseStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "1.25rem",
  backgroundColor: "transparent",
  borderRadius: "0.375rem",
  cursor: "pointer",
  color: "white",
  fontSize: "1.25rem",
  textAlign: "center",
  transition: "background-color 0.3s ease",
  border: "1px solid transparent",
};

const McqPanel: React.FC<McqPanelProps> = ({ data }) => (
  <div style={panelStyle}>
    <ul style={listStyle}>
      {data.choices.map((c, idx) => (
        <li key={idx} style={{ width: "100%" }}>
          <label style={labelBaseStyle}>
            <input
              type="radio"
              name="mcq-choice"
              value={idx}
              data-choice={idx}
              data-ws={data.workspaceLocation ?? "assessment"}
              data-assessment={data.assessmentName}
              data-qid={data.questionId}
              style={{ display: "none" }}
            />
            <span dangerouslySetInnerHTML={{ __html: markdownToHtml(c) }} />
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default McqPanel;
