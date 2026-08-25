// Safe math expression evaluator: tokenizer + shunting-yard -> RPN evaluation.
// Supports + - * / % ^ parentheses and functions: sin cos tan asin acos atan
// log (base 10) ln sqrt abs exp. Trig uses radians.

type Token = { type: "num"; value: number } | { type: "op"; value: string } | { type: "fn"; value: string } | { type: "paren"; value: "(" | ")" };

const FUNCTIONS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs", "exp"]);
const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3, "u-": 4 };

function applyOp(op: string, stack: number[]): void {
  if (op === "u-") {
    const a = stack.pop();
    if (a === undefined) throw new Error("Syntax error");
    stack.push(-a);
    return;
  }
  const b = stack.pop();
  const a = stack.pop();
  if (a === undefined || b === undefined) throw new Error("Syntax error");
  switch (op) {
    case "+": stack.push(a + b); break;
    case "-": stack.push(a - b); break;
    case "*": stack.push(a * b); break;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      stack.push(a / b);
      break;
    case "%":
      if (b === 0) throw new Error("Cannot divide by zero");
      stack.push(a % b);
      break;
    case "^": stack.push(Math.pow(a, b)); break;
    default: throw new Error(`Unknown operator ${op}`);
  }
}

function applyFn(name: string, stack: number[]): void {
  const a = stack.pop();
  if (a === undefined) throw new Error("Syntax error");
  switch (name) {
    case "sin": stack.push(Math.sin(a)); break;
    case "cos": stack.push(Math.cos(a)); break;
    case "tan": stack.push(Math.tan(a)); break;
    case "asin": stack.push(Math.asin(a)); break;
    case "acos": stack.push(Math.acos(a)); break;
    case "atan": stack.push(Math.atan(a)); break;
    case "log": stack.push(Math.log10(a)); break;
    case "ln": stack.push(Math.log(a)); break;
    case "sqrt":
      if (a < 0) throw new Error("Cannot take √ of negative");
      stack.push(Math.sqrt(a));
      break;
    case "abs": stack.push(Math.abs(a)); break;
    case "exp": stack.push(Math.exp(a)); break;
    default: throw new Error(`Unknown function ${name}`);
  }
}

export function evaluate(expression: string): number {
  // Normalize display symbols
  const src = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, String(Math.PI)).replace(/e(?![a-z])/gi, String(Math.E));

  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " ") { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const numStr = src.slice(i, j);
      const value = parseFloat(numStr);
      if (Number.isNaN(value)) throw new Error(`Invalid number "${numStr}"`);
      tokens.push({ type: "num", value });
      i = j;
      continue;
    }
    if (/[a-z]/i.test(ch)) {
      let j = i;
      while (j < src.length && /[a-z]/i.test(src[j])) j++;
      const name = src.slice(i, j).toLowerCase();
      if (!FUNCTIONS.has(name)) throw new Error(`Unknown function "${name}"`);
      tokens.push({ type: "fn", value: name });
      i = j;
      continue;
    }
    if ("+-*/^%".includes(ch)) { tokens.push({ type: "op", value: ch }); i++; continue; }
    if (ch === "(" || ch === ")") { tokens.push({ type: "paren", value: ch }); i++; continue; }
    throw new Error(`Unexpected character "${ch}"`);
  }

  // Shunting-yard
  const output: Token[] = [];
  const opStack: Token[] = [];
  let prev: Token | null = null;

  for (const token of tokens) {
    if (token.type === "num") {
      output.push(token);
    } else if (token.type === "fn") {
      opStack.push(token);
    } else if (token.type === "paren") {
      if (token.value === "(") {
        opStack.push(token);
      } else {
        while (opStack.length && !(opStack[opStack.length - 1].type === "paren")) {
          output.push(opStack.pop()!);
        }
        if (!opStack.length) throw new Error("Mismatched parentheses");
        opStack.pop(); // remove "("
        if (opStack.length && opStack[opStack.length - 1].type === "fn") output.push(opStack.pop()!);
      }
    } else if (token.type === "op") {
      // Unary minus: at start, after an operator or after "("
      const isUnary = token.value === "-" && (!prev || (prev.type === "op") || (prev.type === "paren" && prev.value === "("));
      const name = isUnary ? "u-" : token.value;
      while (
        opStack.length &&
        opStack[opStack.length - 1].type !== "paren" &&
        opStack[opStack.length - 1].type === "op"
      ) {
        const top = opStack[opStack.length - 1] as Extract<Token, { type: "op" }>;
        const topPrec = PRECEDENCE[top.value] ?? 0;
        const curPrec = PRECEDENCE[name];
        // Right-assoc for ^ and unary
        const rightAssoc = name === "^" || name === "u-";
        if (topPrec > curPrec || (topPrec === curPrec && !rightAssoc)) {
          output.push(opStack.pop()!);
        } else break;
      }
      opStack.push({ type: "op", value: name });
    }
    prev = token;
  }

  while (opStack.length) {
    const t = opStack.pop()!;
    if (t.type === "paren") throw new Error("Mismatched parentheses");
    output.push(t);
  }

  // Evaluate RPN
  const stack: number[] = [];
  for (const token of output) {
    if (token.type === "num") stack.push(token.value);
    else if (token.type === "op") applyOp(token.value, stack);
    else if (token.type === "fn") applyFn(token.value, stack);
  }
  if (stack.length !== 1) throw new Error("Syntax error");
  const result = stack[0];
  if (!Number.isFinite(result)) throw new Error("Result is not a finite number");
  return result;
}

export function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const rounded = parseFloat(n.toPrecision(12));
  return String(rounded);
}
