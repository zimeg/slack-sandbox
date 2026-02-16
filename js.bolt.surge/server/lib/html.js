/**
 * Shared HTML layout and styles for all pages.
 */

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Special Elite', 'Courier New', Courier, monospace;
    background: #f5f2eb;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    color: #2a2a2a;
    min-height: 100vh;
    line-height: 1.7;
    letter-spacing: 0.02em;
  }

  .page {
    max-width: 580px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  /* header */
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2.5rem;
  }

  header .text { flex: 1; }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.2rem;
    letter-spacing: 0.06em;
    font-weight: normal;
  }

  h1 a {
    text-decoration: none;
    color: inherit;
  }

  h1 a:hover {
    text-decoration: underline;
  }

  .tagline {
    font-size: 0.9rem;
    color: #555;
    max-width: 320px;
    line-height: 1.6;
  }

  .hero-img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border: 2px solid #c9c1b0;
    flex-shrink: 0;
  }

  /* cards */
  .card {
    background: #fffefa;
    border: 1px solid #d4d0c7;
    border-left: 4px solid #9b2c2c;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .card-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .card p { margin: 0; }

  .stat {
    font-size: 0.95rem;
    color: #666;
    flex: 1;
    text-align: right;
  }

  .stat-num {
    color: #9b2c2c;
    font-size: 1.3rem;
  }

  /* sections */
  section {
    margin-bottom: 2.5rem;
  }

  h2 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 0.75rem;
    color: #555;
    font-weight: normal;
  }

  p {
    margin-bottom: 1rem;
    color: #444;
  }
  p:last-child { margin-bottom: 0; }
  p.muted { color: #888; font-size: 0.85rem; }

  ol {
    margin: 0 0 1rem 0;
    padding-left: 1.5rem;
    color: #444;
  }

  ol li {
    margin-bottom: 0.4rem;
    padding-left: 0.5rem;
  }

  a { color: #2a2a2a; }

  /* buttons */
  .btn {
    display: inline-block;
    padding: 0.7rem 1.3rem;
    background: #2a2a2a;
    color: #f5f2eb;
    border: none;
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    letter-spacing: 0.1em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .btn:hover {
    background: #1a1a1a;
  }

  .btn-primary {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
  }

  .accent { color: #9b2c2c; }

  /* status cards */
  .status {
    background: #fffefa;
    border: 1px solid #d4d0c7;
    border-left: 4px solid #9b2c2c;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .status p { margin-bottom: 0.5rem; }
  .status p:last-child { margin-bottom: 0; }

  .status .btn {
    margin-top: 0.75rem;
  }

  /* selection */
  ::selection {
    background: #2a2a2a;
    color: #f5f2eb;
  }

  /* responsive */
  @media (max-width: 500px) {
    header {
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 1.25rem;
    }
    .hero-img {
      width: 90px;
      height: 90px;
    }
    .tagline {
      max-width: none;
    }
    h1 {
      font-size: 1.5rem;
    }
    .card-inner {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
`;

/**
 * Wrap content in the shared HTML layout.
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.content - HTML content
 * @param {string} [options.scripts] - Optional scripts
 */
export function layout({ title, content, scripts = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body>
  <div class="page">
    ${content}
  </div>
  ${scripts}
  <script defer src="/_vercel/insights/script.js"></script>
  <script defer src="/_vercel/analytics/script.js"></script>
</body>
</html>`;
}
