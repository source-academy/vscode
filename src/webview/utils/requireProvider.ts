import * as bpcore from "@blueprintjs/core";
import * as bpicons from "@blueprintjs/icons";
import * as jsslang from "js-slang";
import * as jsslangDist from "js-slang/dist";
import lodash from "lodash";
import phaser from "phaser";
import JSXRuntime from "react/jsx-runtime";
import ace from "react-ace";
import React from "react";
import ReactDOM from "react-dom";

// Taken from frontend:src/commons/sideContent/SideContentHelper.ts
export const requireProvider = (x: string) => {
  const exports = {
    react: React,
    "react/jsx-runtime": JSXRuntime,
    "react-ace": ace,
    "react-dom": ReactDOM,
    "@blueprintjs/core": bpcore,
    "@blueprintjs/icons": bpicons,
    "js-slang": jsslang,
    "js-slang/dist": jsslangDist,
    lodash,
    phaser,
  };

  if (!(x in exports))
    throw new Error(`Dynamic require of ${x} is not supported`);
  return exports[x as keyof typeof exports] as any;
};
