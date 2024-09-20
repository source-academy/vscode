import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";

function App() {
  const [state, setState] = useState(0);

  return (
    <>
      {"HEEEEEEEEEEEEEEEE"}
      {state}
      <button onClick={() => {
        setState(state => state + 1);
      }}></button>
      {/* <Stepper />; */}
    </>
  );
}
export default App;
