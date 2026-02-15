import { db } from "../lib/database/index.js";
import { layout } from "../lib/html.js";

/**
 * Landing page.
 * @param {import("h3").H3Event} event
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const success = query.success === "true";
  const error = query.error;
  const redirect = query.redirect;

  let count = 0;
  try {
    count = await db.getMessageCount();
  } catch {
    // db not ready
  }

  setResponseHeader(event, "Content-Type", "text/html");

  let status = "";
  if (success) {
    status = `
      <div class="status">
        <p><strong>installed.</strong> 50 stamps added.</p>
        ${redirect ? `<a href="${redirect}" class="btn">open in slack</a>` : ""}
      </div>
    `;
  } else if (error) {
    status = `
      <div class="status">
        <p><strong>something went wrong.</strong></p>
        <p class="muted">${error}</p>
        <a href="/" class="btn">try again</a>
      </div>
    `;
  }

  return layout({
    title: "surgem.ai/",
    content: `
      <header>
        <div class="text">
          <h1><a href="/">surgem.ai/</a></h1>
          <p class="est">- est. 2024 -</p>
          <p class="tagline">a slack app that converts<br>emails into markdown.</p>
        </div>
        <img src="https://github.com/zimeg/slack-sandbox/blob/main/js.bolt.surge/assets/icon.png?raw=true" class="hero-img" alt="surge">
      </header>

      ${status}

      <div class="card">
        <div class="card-inner">
          <button class="btn" onclick="gotMail()">you've got mail</button>
          <p class="stat"><span class="stat-num">${count}</span> messages delivered</p>
        </div>
      </div>

      <section>
        <h2>get started</h2>
        <ol>
          <li>install the app to your workspace</li>
          <li><a href="https://slack.com/help/articles/206819278-Send-emails-to-Slack">set up email forwarding</a> to a channel</li>
          <li>invite <span class="accent">@surge</span> to that channel</li>
        </ol>
      </section>

      <section>
        <h2>pricing</h2>
        <p>get 50 stamps on install. each email costs 1 stamp. more packs coming soon.</p>
      </section>

      <a href="/api/slack/install" class="btn btn-primary">add to slack</a>
    `,
    scripts: `
      <audio id="audio" src="https://www.myinstants.com/media/sounds/yougotmail.mp3"></audio>
      <script>
        const audio = document.getElementById('audio');
        audio.volume = 0.15;
        async function gotMail() {
          audio.currentTime = 0;
          audio.play();
          const res = await fetch('/api/v1/count', { method: 'POST' });
          const data = await res.json();
          document.querySelector('.stat-num').textContent = data.count;
        }
        async function refreshCount() {
          const res = await fetch('/api/v1/count');
          const data = await res.json();
          document.querySelector('.stat-num').textContent = data.count;
        }
        setInterval(refreshCount, 5000);
      </script>
    `,
  });
});
