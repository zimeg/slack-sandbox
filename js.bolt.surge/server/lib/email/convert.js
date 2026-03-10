import { format } from "prettier";

const BASE_SYSTEM_PROMPT = `Output ONLY markdown. No preamble, no commentary, no code fences.

Convert the following email into markdown. Preserve the exact wording, casing, line breaks, and paragraph structure. Keep links that appear in buttons, calls to action, or other prominent places. Remove tracking pixels, unsubscribe links, footers, and legal boilerplate. Never remove relevant detail.`;

/**
 * Extract the best available text content from a Slack email file.
 * @param {{ has_more?: boolean, plain_text?: string, preview_plain_text?: string, preview?: string }} file
 * @returns {string | undefined}
 */
export function extractEmailContent(file) {
  return file.has_more
    ? file.plain_text || file.preview_plain_text || file.preview
    : file.preview || file.plain_text || file.preview_plain_text;
}

/**
 * Build the system prompt, optionally appending feedback notes.
 * @param {string} [feedback]
 * @returns {string}
 */
export function buildSystemPrompt(feedback) {
  if (!feedback) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}\n\nThe previous conversion received this feedback — incorporate it:\n${feedback}`;
}

/**
 * Convert email content to markdown using AI generation and lint formatting.
 * @param {Object} params
 * @param {string} params.emailContent - Raw email text to convert
 * @param {Function} params.generate - Text generation function (e.g. generateText from ai)
 * @param {string} [params.feedback] - Optional feedback notes for resend
 * @returns {Promise<{ content: string, usage: any, model: string } | null>}
 */
export async function convertEmailToMarkdown({
  emailContent,
  generate,
  feedback,
}) {
  const model = process.env.AI_MODEL || "anthropic/claude-haiku-4.5";
  const { text, usage } = await generate({
    model,
    system: buildSystemPrompt(feedback),
    prompt: emailContent,
  });
  const raw = await format(text, {
    parser: "markdown",
    proseWrap: "preserve",
  }).catch(() => text);
  if (!raw) return null;
  return { content: raw, usage, model };
}
