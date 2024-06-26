import bolt from "@slack/bolt";

const app = new bolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: bolt.LogLevel.DEBUG,
});

app.message("hello", async ({ say }) => {
  await say("howdy");
});

(async () => {
  try {
    await app.start();
    console.log("⚡️ Bolt app is running!");
  } catch (error) {
    console.error("Failed to start app", error);
  }
})();
