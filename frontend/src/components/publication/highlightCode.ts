import "server-only";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import type { CodeSnippetComponent, ContentComponent } from "../../api/publication-model";
import { codeLanguage } from "./codeLanguages";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("yaml", yaml);

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function highlightCode(content: string, language: string): string {
  const highlightLanguage = codeLanguage(language)?.highlight;
  if (!highlightLanguage) return escapeHtml(content);
  return hljs.highlight(content, { language: highlightLanguage, ignoreIllegals: true }).value;
}

export function highlightContent<T extends { __component: string }>(content: T[]): T[] {
  return content.map((component) => {
    if (component.__component !== "text.code-snippet") return component;
    const snippet = component as T & { content?: unknown; language?: string };
    if (typeof snippet.content !== "string" || snippet.content.length === 0) return component;
    return { ...component, html: highlightCode(snippet.content, snippet.language ?? "") };
  });
}

export function highlightPublication<T extends { content: ContentComponent[] }>(publication: T): T {
  return { ...publication, content: highlightContent(publication.content) };
}

export function highlightSnippet(component: CodeSnippetComponent): CodeSnippetComponent {
  if (typeof component.content !== "string" || component.content.length === 0) return component;
  return { ...component, html: highlightCode(component.content, component.language) };
}
