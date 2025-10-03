// ATTEMPT TO MAKE A SCRIPT FROM SCRATCH
// DID NOT WORK DON't USE THIS

type VarTable = Record<string, any>;

class ShellEngine {
  private vars: VarTable = {};

  /** Tokenize a line respecting quotes */
  getParams(line: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && /\s/.test(char)) {
        if (current.length > 0) {
          tokens.push(current);
          current = "";
        }
        continue;
      }
      current += char;
    }

    if (current.length > 0) tokens.push(current);
    return tokens;
  }

  /** Replace variables $x with their values */
  substituteVars(tokens: string[]): string[] {
    return tokens.map(token => {
      if (token.startsWith("$")) {
        const name = token.slice(1);
        return this.vars[name] ?? "";
      }
      return token;
    });
  }

  /** Execute a command or API call */
  async executeCommand(cmd: string, args: string[], returnResult = false): Promise<any> {
    const api = (window as any).API;

    switch (cmd) {
      case "echo":
        if (returnResult) return args.join(" ");
        console.log(...args);
        return;
      case "ls":
        if (returnResult) return args[0] ?? ".";
        console.log("Listing directory:", args[0] ?? ".");
        return;
      case "mkdir":
        if (returnResult) return args[0];
        console.log("Creating directory:", args[0]);
        return;
      default:{
        // Nested properties support
        const parts = cmd.split(".");
        let target: any = api;
        for (let i = 0; i < parts.length; i++) {
          if (target[parts[i]] === undefined) {
            console.log(`Unknown command or API path: ${cmd}`);
            return;
          }
          target = target[parts[i]];
        }

        if (typeof target === "function") {
          const result = await target(...args);
          if (returnResult) return result;
          console.log(`API call ${cmd} returned:`, result);
        } else {
          if (returnResult) return target;
          console.log(`Property ${cmd} value:`, target);
        }}
    }
  }

  /** Resolve a variable, literal, or number */
  async resolveValue(expr: string): Promise<any> {
    expr = expr.trim();
    if (expr.startsWith("$")) return this.vars[expr.slice(1)] ?? "";
    if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1);
    if (!isNaN(Number(expr))) return Number(expr);
    return expr; // fallback
  }

  /** Evaluate a simple expression (supports ==, <, >, <=, >=) */
  async evalExpr(expr: string): Promise<boolean> {
    expr = expr.trim();
    const operators = ["==", "!=", "<=", ">=", "<", ">"];
    for (const op of operators) {
      const parts = expr.split(op);
      if (parts.length === 2) {
        const left = await this.resolveValue(parts[0].trim());
        const right = await this.resolveValue(parts[1].trim());
        switch (op) {
          case "==": return left == right;
          case "!=": return left != right;
          case "<": return left < right;
          case ">": return left > right;
          case "<=": return left <= right;
          case ">=": return left >= right;
        }
      }
    }
    // Single variable truthiness
    const val = await this.resolveValue(expr);
    return !!val;
  }

  /** Run a single line: assignment or command */
  async runLine(line: string) {
    if (!line.trim()) return;

    console.log("Line to execute:", line);

    // Assignment: x = value or x = $(command)
    const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignMatch) {
      const [, varName, expr] = assignMatch;
      let value: any;

      const cmdMatch = expr.match(/^\$\((.+)\)$/);
      if (cmdMatch) {
        const cmdLine = cmdMatch[1];
        const tokens = this.substituteVars(this.getParams(cmdLine));
        const [cmd, ...args] = tokens;
        value = await this.executeCommand(cmd, args, true);
      } else {
        const tokens = this.substituteVars(this.getParams(expr));
        value = tokens.length === 1 ? tokens[0] : tokens;
      }

      this.vars[varName] = value;
      console.log(`Set variable ${varName} =`, value);
      return;
    }

    // Regular command
    const tokens = this.substituteVars(this.getParams(line));
    const [cmd, ...args] = tokens;
    await this.executeCommand(cmd, args);
  }

  /** Run an entire script with support for if/else and while loops */
  async run(script: string) {
    const lines = script.split("\n");
    let i = 0;

    while (i < lines.length) {
      const rawLine = lines[i];
      if (!rawLine.trim()) { i++; continue; }

      const indentMatch = rawLine.match(/^(\s*)(.+)$/);
      const indent = indentMatch ? indentMatch[1].length : 0;
      const content = indentMatch ? indentMatch[2] : rawLine;

      // --- IF/ELSE ---
      if (content.startsWith("if ") && content.endsWith(":")) {
        const condition = content.slice(3, -1).trim();
        const condResult = await this.evalExpr(condition);

        const ifLines: string[] = [];
        const elseLines: string[] = [];
        let j = i + 1;
        let inElse = false;

        while (j < lines.length) {
          const nextLine = lines[j];
          const match = nextLine.match(/^(\s*)(.+)$/);
          if (!match) break;
          const [, spaces, lContent] = match;

          if (spaces.length <= indent) break;

          if (lContent.startsWith("else:") && spaces.length === indent + 4) {
            inElse = true;
            j++; // skip else: line itself
            continue;
          }

          if (inElse) elseLines.push(lContent);
          else if (spaces.length > indent) ifLines.push(lContent);

          j++;
        }

        const executeLines = condResult ? ifLines : elseLines;
        for (const l of executeLines) await this.runLine(l);

        i = j; // skip entire block
        continue;
      }

      // --- WHILE ---
      if (content.startsWith("while ") && content.endsWith(":")) {
        const condition = content.slice(6, -1).trim();
        const loopIndent = indent;
        const loopLines: string[] = [];
        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j];
          const match = nextLine.match(/^(\s*)(.+)$/);
          const spaces = match ? match[1].length : 0;
          const lContent = match ? match[2] : nextLine;
          if (spaces <= loopIndent) break;
          loopLines.push(lContent);
          j++;
        }

        while (await this.evalExpr(condition)) {
          for (const l of loopLines) await this.runLine(l);
        }

        i = j; // skip entire loop block
        continue;
      }

      // --- Normal command ---
      await this.runLine(content);
      i++;
    }
  }
}

// Export singleton
const shellEngine = new ShellEngine();
export default shellEngine;
