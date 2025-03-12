// import { Chapter } from "js-slang/dist/types";
enum Chapter {
  SOURCE_1 = 1,
  SOURCE_2 = 2,
  SOURCE_3 = 3,
  SOURCE_4 = 4,
  FULL_JS = -1,
  HTML = -2,
  FULL_TS = -3,
  PYTHON_1 = -4,
  PYTHON_2 = -5,
  PYTHON_3 = -6,
  PYTHON_4 = -7,
  FULL_PYTHON = -8,
  SCHEME_1 = -9,
  SCHEME_2 = -10,
  SCHEME_3 = -11,
  SCHEME_4 = -12,
  FULL_SCHEME = -13,
  FULL_C = -14,
  FULL_JAVA = -15,
  LIBRARY_PARSER = 100,
}

const SECTION = "\u00A7";

/**
 * Basically a subset of js-slang's Chapter
 */
export const LANGUAGES = {
  SOURCE_1: `Source ${SECTION}1`,
  SOURCE_2: `Source ${SECTION}2`,
};

export function languageToChapter(
  language: (typeof LANGUAGES)[keyof typeof LANGUAGES],
) {
  if (language === LANGUAGES.SOURCE_1) {
    return Chapter.SOURCE_1;
  }
  if (language === LANGUAGES.SOURCE_2) {
    return Chapter.SOURCE_2;
  }
  throw Error("Language not allowed!");
}
