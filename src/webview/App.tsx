import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";

function App() {
  const [state, setState] = useState("");
  fetch("https://sa-modules.heyzec.dedyn.io/tabs/Repeat.js").then(() => {
    setState("100");
  });
  return (
    <>
      {"HEEEEEEEEEEEEEEEE"}
      {state}
      <Stepper />;
    </>
  );
}
export default App;
