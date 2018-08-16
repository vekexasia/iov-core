import { TSError } from "ts-node";
import { Script } from "vm";

export function executeJavaScript(code: string, filename: string) {
  const script = new Script(code, { filename: filename });
  return script.runInThisContext();
}

export function isRecoverable(error: TSError) {
  const recoveryCodes: Set<number> = new Set([
    1003, // "Identifier expected."
    1005, // "')' expected."
    1109, // "Expression expected."
    1126, // "Unexpected end of text."
    1160, // "Unterminated template literal."
    1161, // "Unterminated regular expression literal."
    2355, // "A function whose declared type is neither 'void' nor 'any' must return a value."
  ]);

  return error.diagnosticCodes.every(code => recoveryCodes.has(code));
}