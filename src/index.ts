import { createApp } from "./http/app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`chat-brief-telegram relay listening on port ${config.port}`);
});
