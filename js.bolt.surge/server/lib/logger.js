import { ConsoleLogger, LogLevel } from "@slack/logger";

const isProduction = process.env.SLACK_ENVIRONMENT_TAG === "production";
const level =
  /** @type {LogLevel | undefined} */ (process.env.LOG_LEVEL) ||
  (isProduction ? LogLevel.INFO : LogLevel.DEBUG);

export const logger = new ConsoleLogger();
logger.setLevel(level);
