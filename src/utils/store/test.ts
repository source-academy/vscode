import { context_ } from "../../extension";
import { VscAssessmentOverview } from "../messages";

/**
 * There is a lot of casting in this file but in theory it should all work...
 */

// 1. Leaf wrapper for types
type Leaf<T> = { __type: T };

type Entry = {
  chapter: number;
  prepend: number;
};

// 2. Schema with types
const schema = {
  courseId: {} as Leaf<number>,
  assessmentOverviews: {} as Leaf<VscAssessmentOverview[]>,
  info: {} as Leaf<Record<string, Entry>>,
  A: {
    B: {} as Leaf<string>,
    ao: {} as Leaf<VscAssessmentOverview[]>,
  },
  C: {
    D: {} as Leaf<number>,
    E: {} as number,
  },
};

// Purpose: Creates a nested object that mirrors the shape of T, but replaces leaves with the string path to that leaf.
type PathTree<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Leaf<any>
    ? `${Prefix}${K & string}`
    : T[K] extends object
      ? PathTree<T[K], `${Prefix}${K & string}.`>
      : never;
};

function generateMirrorTree(obj: object, prefix = ""): object {
  const result: any = {};
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    // @ts-ignore
    const val = obj[key];

    if (val && typeof val === "object" && Object.keys(val).length > 0) {
      result[key] = generateMirrorTree(val, path);
    } else {
      result[key] = path;
    }
  }
  return result;
}

export const mirror = generateMirrorTree(schema) as PathTree<typeof schema>;

const mockStore = {
  "A.B": "a string",
  "C.D": 1,
} as any;

// Purpose: Creates a union of objects, each mapping a full dot-path string to the type stored in the leaf.
// prettier-ignore
type LeafPathsToTypes<T, Prefix extends string = ""> = {
  [K in keyof T]:
    // Ask: Is this is a Leaf<...>?
    T[K] extends Leaf<infer U>
    // Yes, extract its type
    ? { [P in `${Prefix}${K & string}`]: U }
    // Else, ask: Is this a nested object?
      // Assume yes, recurse
    : T[K] extends object
      ? LeafPathsToTypes<T[K], `${Prefix}${K & string}.`>
      // Else, this never occurs
      : never;
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type PathTypeMap = UnionToIntersection<LeafPathsToTypes<typeof schema>>;

type Test1 = PathTree<typeof schema>;
type Test2 = LeafPathsToTypes<typeof schema>;

export function getValue<K extends keyof PathTypeMap>(key: K): PathTypeMap[K] {
  console.log(`Getting vlaue of ${key}`);

  // return mockStore[k];
  if (!context_) {
    console.log("OHNO w");
  }
  const x = context_.globalState.get(key);
  return x as any;
}

export function setValue<K extends keyof PathTypeMap>(
  key: K,
  value: PathTypeMap[K],
) {
  context_.globalState.update(key, value);
}
