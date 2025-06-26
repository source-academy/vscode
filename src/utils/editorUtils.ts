// TODO: Move this file to src/features/editor/utils.ts

// ================================================================================
// Prepend
// ================================================================================

// If this is edited, also change folding.markers.{start,end} in language-configuration.json
const PREPEND_MARKER_START = "// PREPEND -- DO NOT EDIT";
const PREPEND_MARKER_END = "// END PREPEND";

export function codeAddPrepend(code: string, prepend: string) {
  if (prepend === "") {
    return code;
  }
  return [
    PREPEND_MARKER_START,
    prepend,
    PREPEND_MARKER_END,
    "", // Visual separation between prepend and code
    code,
  ].join("\n");
}

export function getNumPrependLines(prepend: string) {
  if (prepend === "") {
    return 0;
  }
  return prepend.split("\n").length + 3; // account for start/end markers
}
