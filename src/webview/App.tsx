import React, { useEffect, useState } from "react";
import Stepper from "./components/Stepper";
import * as fs from 'fs';
import * as path from 'path';
// import * as fs from 'fs';

function App() {
  const [state, setState] = useState(0);

  console.log(fs);
  console.log(path);
  console.log(fs);

  return (
    <>
      {"HEEEEEEEEEEEEEEEE"}
      {state}
      <button onClick={() => {
        setState(state => state + 1);
      }}></button>
      <Stepper />;
    </>
  );
}
export default App;
