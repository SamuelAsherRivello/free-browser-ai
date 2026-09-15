import { createElement, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

function remarkHtmlAsText() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === "html") node.type = "text";
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

function safeUrl(url) {
  try { return allowedProtocols.has(new URL(url).protocol) ? url : ""; }
  catch { return ""; }
}

function SafeLink({ href, children }) {
  return href ? createElement("a", { href, rel: "noreferrer", target: "_blank" }, children) : createElement(Fragment, null, children);
}

function MarkdownCode({ className, children, node, ...props }) {
  const block = node?.position?.start.line !== node?.position?.end.line;
  if (!block) return createElement("code", { className, ...props }, children);
  const language = className?.match(/language-([\w+-]+)/)?.[1];
  return createElement("div", { className: "code_block" }, language && createElement("span", { className: "code_language" }, language), createElement("pre", null, createElement("code", { className, ...props }, children)));
}

export function RichContent({ children }) {
  return createElement("div", { className: "rich_content" }, createElement(ReactMarkdown, { remarkPlugins: [remarkGfm, remarkHtmlAsText], rehypePlugins: [rehypeSanitize], urlTransform: safeUrl, components: { a: SafeLink, code: MarkdownCode, pre: ({ children: code }) => createElement(Fragment, null, code) } }, children));
}
