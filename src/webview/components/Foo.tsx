import React from "react";

import { useState } from "react";

const Foo = () => {
  const [counter, setCounter] = useState(0);

  // Method to handle the increment
  const handleAdd = () => {
    setCounter((prevState) => prevState + 1);
  };

  // Method to handle the decrement
  const handleSubtract = () => {
    setCounter((prevState: number) => prevState - 1);
  };

  return (
    <div>
      <p>The current number is {counter}</p>
      <button onClick={handleAdd}>Add</button>
      <button onClick={handleSubtract}>Subtract</button>
    </div>
  );
};
export default Foo;
