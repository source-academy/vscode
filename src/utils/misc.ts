import path from "path";
import * as os from "os";

export function canonicaliseLocation(location: string) {
  if (path.isAbsolute(location)) {
    return location;
  }
  return path.join(os.homedir(), location);
}
