import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL || "https://demoqa.com",
  browser: process.env.BROWSER || "chromium",
  headless: process.env.HEADLESS !== "false",
  slowMo: parseInt(process.env.SLOW_MO || "0"),
  timeout: parseInt(process.env.TIMEOUT || "30000"),
  screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== "false",
  videoOnFailure: process.env.VIDEO_ON_FAILURE !== "false"
};

export default config;
