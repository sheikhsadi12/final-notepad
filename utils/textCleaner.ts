export const cleanTextForSpeech = (markdown: string): string => {
  if (!markdown) return "";

  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, "Code block omitted.");
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove images ![alt](url) -> ""
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // Remove bold/italic (**text**, *text*, __text__, _text_)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove headings (#, ##, etc.)
  text = text.replace(/^#+\s+/gm, "");

  // Remove LaTeX math $$...$$ or $...$ (simplistic removal or replacement)
  text = text.replace(/\$\$[\s\S]*?\$\$/g, "Math equation.");
  text = text.replace(/\$[^$]*\$/g, "Math equation.");

  // Remove blockquotes
  text = text.replace(/^\s*>\s+/gm, "");

  // Remove lists symbols
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
};