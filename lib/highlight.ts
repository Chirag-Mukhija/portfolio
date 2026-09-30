// Build-time syntax highlighter for the short JS/SQL excerpts — emits token lines, ships no client JS.

export type Token = { t: "kw" | "str" | "sql" | "com" | "num" | "fn" | "prop" | "pun" | "txt"; v: string };

const JS_KW = new Set(
  "const let var async await function return if else for while break continue try catch finally throw new true false null undefined of in typeof".split(" ")
);
const SQL_KW = new Set(
  "SELECT INSERT INTO VALUES UPDATE SET WHERE AND OR RETURNING ON CONFLICT DO NOTHING BEGIN COMMIT ROLLBACK NULL FROM ORDER BY LIMIT JOIN DESC ASC".split(" ")
);

function tokenizeTemplate(body: string, out: Token[]) {
  const re = /(\$\{[^}]*\})|([A-Za-z_]+)|(\$\d+)|([^A-Za-z_$]+|\$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m[1]) out.push({ t: "pun", v: m[1] });
    else if (m[2]) out.push({ t: SQL_KW.has(m[2]) ? "sql" : "str", v: m[2] });
    else if (m[3]) out.push({ t: "num", v: m[3] });
    else out.push({ t: "str", v: m[4] });
  }
}

export function highlight(source: string): Token[][] {
  const tokens: Token[] = [];
  const re =
    /(\/\/[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(`(?:\\.|[^`\\])*`)|(\b\d+\b)|([A-Za-z_$][\w$]*)(?=\s*\()|(?<=\.)([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*)|(\n)|([^\w\s]+)|([ \t]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const [, com, str, tpl, num, fn, prop, word, nl, pun, ws] = m;
    if (com) tokens.push({ t: "com", v: com });
    else if (str) tokens.push({ t: "str", v: str });
    else if (tpl) {
      tokens.push({ t: "str", v: "`" });
      tokenizeTemplate(tpl.slice(1, -1), tokens);
      tokens.push({ t: "str", v: "`" });
    } else if (num) tokens.push({ t: "num", v: num });
    else if (fn) tokens.push({ t: JS_KW.has(fn) ? "kw" : "fn", v: fn });
    else if (prop) tokens.push({ t: "prop", v: prop });
    else if (word) tokens.push({ t: JS_KW.has(word) ? "kw" : "txt", v: word });
    else if (nl) tokens.push({ t: "txt", v: "\n" });
    else if (pun) tokens.push({ t: "pun", v: pun });
    else if (ws) tokens.push({ t: "txt", v: ws });
  }

  // Split multi-line tokens (template literals) into per-line arrays, merging same-type neighbours
  // so the page carries fewer DOM nodes.
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.v.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (!part) return;
      const line = lines[lines.length - 1];
      const prev = line[line.length - 1];
      const t = /^\s+$/.test(part) && prev ? prev.t : tok.t;
      if (prev && prev.t === t) prev.v += part;
      else line.push({ t, v: part });
    });
  }
  return lines;
}
