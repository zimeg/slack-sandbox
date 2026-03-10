/**
 * Shared email formatting utilities.
 */

/** @param {string} [s] */
export function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

/**
 * Build a mrkdwn header string from email file metadata.
 * @param {{ from?: { name?: string, address?: string }[], to?: { name?: string, address?: string }[], subject?: string, headers?: { date?: string } }} file
 * @returns {string}
 */
export function buildEmailHeader(file) {
  const fromAddr = file.from?.[0];
  const toAddr = file.to?.[0];
  const fromStr =
    fromAddr?.name && fromAddr?.address
      ? `${fromAddr.name} <${fromAddr.address}>`
      : fromAddr?.name || fromAddr?.address;
  const toStr =
    toAddr?.name && toAddr?.address
      ? `${toAddr.name} <${toAddr.address}>`
      : toAddr?.name || toAddr?.address;
  const dateStr = file.headers?.date;
  const subject = decodeEntities(file.subject);

  /** @type {string | undefined} */
  let dateLine;
  if (dateStr) {
    const ts = Math.floor(new Date(dateStr).getTime() / 1000);
    dateLine = Number.isNaN(ts)
      ? `📅 *Date:* ${dateStr}`
      : `📅 *Date:* <!date^${ts}^{date_long} at {time}|${dateStr}>`;
  }

  return [
    fromStr && `📤 *From:* ${fromStr}`,
    toStr && `📥 *To:* ${toStr}`,
    subject && `📝 *Subject:* ${subject}`,
    dateLine,
  ]
    .filter(Boolean)
    .join("\n");
}
