const codeLanguages = [
  { snippet: "javascript", highlight: "javascript", label: "JavaScript" },
  { snippet: "typescript", highlight: "typescript", label: "TypeScript" },
  { snippet: "python", highlight: "python", label: "Python" },
  { snippet: "bash", highlight: "bash", label: "Bash" },
  { snippet: "C", highlight: "c", label: "C" },
  { snippet: "Cpp", highlight: "cpp", label: "C++" },
  { snippet: "Rust", highlight: "rust", label: "Rust" },
  { snippet: "yaml", highlight: "yaml", label: "YAML" },
  { snippet: "json", highlight: "json", label: "JSON" },
] as const;

export function codeLanguage(snippetLanguage: string) {
  return codeLanguages.find((language) => language.snippet === snippetLanguage);
}
