// Tiny XML serializer for the dealer feed.
// Intentionally minimal — no namespaces, no CDATA helpers. Covers our schema.

export type XmlNode =
  | { tag: string; attrs?: Record<string, string | number | undefined>; children?: XmlNode[] | string }
  | string

export function renderXml(root: XmlNode, declaration = true): string {
  const head = declaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' : ""
  return head + renderNode(root, 0)
}

function renderNode(node: XmlNode, depth: number): string {
  const indent = "  ".repeat(depth)
  if (typeof node === "string") {
    return indent + escape(node)
  }
  const attrs = renderAttrs(node.attrs)
  const children = node.children
  if (children == null || (Array.isArray(children) && children.length === 0)) {
    return `${indent}<${node.tag}${attrs}/>`
  }
  if (typeof children === "string") {
    return `${indent}<${node.tag}${attrs}>${escape(children)}</${node.tag}>`
  }
  const inner = children.map((c) => renderNode(c, depth + 1)).join("\n")
  return `${indent}<${node.tag}${attrs}>\n${inner}\n${indent}</${node.tag}>`
}

function renderAttrs(attrs?: Record<string, string | number | undefined>): string {
  if (!attrs) return ""
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => ` ${k}="${escapeAttr(String(v))}"`)
    .join("")
}

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
}

function escape(s: string): string {
  return s.replace(/[&<>'"]/g, (c) => ESC[c])
}

function escapeAttr(s: string): string {
  return escape(s)
}
