// TODO: Move this file to src/features/editor/utils.ts

// ================================================================================
// Prepend
// ================================================================================

// If this is edited, also change folding.markers.{start,end} in language-configuration.json
const PREPEND_MARKER_START = "// PREPEND";
const PREPEND_MARKER_END = "// END PREPEND -- DO NOT EDIT PREPEND";

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

export function codeRemovePrepend(code: string) {
  const lines = code.split("\n");
  const start = lines.indexOf(PREPEND_MARKER_START);
  const end = lines.indexOf(PREPEND_MARKER_END);

  if (start === -1 || end === -1 || end < start) {
    return code;
  }

  // If line spacing between prepend and code accidentally removed, do not delete code!
  const skip = end + (lines[end + 1] === "" ? 1 : 0);

  return lines.slice(skip + 1).join("\n");
}
